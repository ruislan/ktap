import fp from 'fastify-plugin';
import sanitizeHtml from 'sanitize-html';
import { Prisma } from '@prisma/client'
import { Pagination, errors } from './constants.js';

const cleanContent = (content) => {
    return sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
            'span': ['style'],
        }
    });
};

// XXX 临时的一个避免重复代码的归并处，后续应该还是要根据业务对象来进行划分开
const utils = async (fastify, opts, next) => {
    fastify.decorate('utils', {
        // 被用得最多的 limit 个 Tag
        async getTagsByHot({ id, limit = Pagination.limit.default, type = '' }) {
            type = type.toLowerCase();
            let condition = Prisma.empty;
            if (type === 'app') {
                condition = Prisma.sql`AppUserTagRef.app_id = ${id} AND `;
            } else if (type === 'user') {
                condition = Prisma.sql`AppUserTagRef.user_id = ${id} AND `;
            }
            const tags = await fastify.db.$queryRaw`
                SELECT id, name, color_hex AS colorHex, count(*) AS count FROM AppUserTagRef, Tag
                WHERE ${condition} AppUserTagRef.tag_id = Tag.id
                GROUP BY id ORDER BY count DESC LIMIT ${limit}
            `;
            return tags;
        },
        // 计算 App 的评分
        async computeAppScore({ appId }) {
            if (appId <= 0) return;
            await fastify.db.$queryRaw`
                UPDATE App SET score = avgScore FROM
                (SELECT ROUND(COALESCE(AVG(score), 4), 1) AS avgScore FROM review WHERE app_id = ${appId})
                WHERE App.id = ${appId};
            `;
        },
        // 检查操作权限
        // obj是操作对象，objType是操作对象的type, operation是操作名称
        // 注意，不同的obj，需要的obj的级联数据不同，尽量在检查之前就级联查询出来
        async canOperate({ obj, objType, operator, operation }) {
            if (!operator || !obj) return false;
            if (operator.isAdmin) return true; // Admin 可以操作一切,
            if (objType === 'Discussion' || objType === 'Post') {
                const discussion = objType === 'Discussion' ? obj : obj.discussion;
                if (!discussion) return false;
                const isModerator = discussion.channel.moderators?.some(moderator => moderator.userId === operator.id);
                const isOwner = obj.userId === operator.id;
                if (operation === 'sticky') return isModerator;
                if (operation === 'close') return isModerator || isOwner;
                if (operation === 'delete') return isModerator || isOwner;
                if (operation === 'update') return isModerator || isOwner;
            } else if (objType === 'DiscussionChannel') {
                const isModerator = obj.moderators?.some(moderator => moderator.userId === operator.id);
                if (operation === 'update') return isModerator;
            }
            return false;
        },
        // discussion
        async getDiscussionOrPostWithChannelModerators({ id, isPost = false }) {
            const discussionInclude = {
                channel: {
                    include: {
                        moderators: {
                            select: { userId: true, }
                        }
                    }
                }
            };
            let obj = null;
            if (isPost) {
                obj = await fastify.db.discussionPost.findUnique({
                    where: { id },
                    include: { discussion: { include: discussionInclude } },
                });
            } else {
                obj = await fastify.db.discussion.findUnique({
                    where: { id: id },
                    include: discussionInclude,
                });
            }
            return obj;
        },
        async updateDiscussionChannel({ id, name, icon, description, appId, operator }) {
            const channel = await fastify.db.discussionChannel.findUnique({ where: { id }, include: { moderators: { select: { userId: true, } } } });
            if (!channel) throw errors.notFound();
            let canUpdate = await fastify.utils.canOperate({ obj: channel, objType: 'DiscussionChannel', operator, operation: 'update' });
            if (!canUpdate) throw errors.forbidden();
            await fastify.db.discussionChannel.update({ where: { id }, data: { name, icon, description, appId }, });
        },
        async createDiscussion({ title, content, appId, channelId, userId, ip }) {
            const result = await fastify.db.$transaction(async (tx) => {
                const discussion = await tx.discussion.create({
                    data: { title, appId, discussionChannelId: channelId, userId, },
                });
                const post = await tx.discussionPost.create({
                    data: {
                        content: cleanContent(content),
                        discussionId: discussion.id, userId, ip,
                    }
                });
                await tx.discussion.update({ where: { id: discussion.id }, data: { lastPostId: post.id } });
                // add first post
                await tx.timeline.create({ data: { userId, targetId: discussion.id, target: 'Discussion', } });
                await tx.timeline.create({ data: { userId, targetId: post.id, target: 'DiscussionPost', } });
                return { discussion, post };
            });
            return result;
        },
        async updateDiscussion({ id, title, operator }) {
            const discussion = await fastify.utils.getDiscussionOrPostWithChannelModerators({ id, isPost: false });
            // 主题锁定的情况下，都不能编辑
            if (!discussion || discussion.isClosed) throw errors.notFound();

            let canUpdate = await fastify.utils.canOperate({ obj: discussion, objType: 'Discussion', operator, operation: 'update' });
            if (!canUpdate) throw errors.forbidden();

            await fastify.db.discussion.update({ where: { id: discussion.id }, data: { title } });
        },
        // 是否能够删除讨论？
        // a: 讨论处于开放状态：是管理员 或者 频道管理员 或者 讨论所有人
        // b: 讨论处于关闭状态：是管理员 或者 频道管理员
        async deleteDiscussion({ id, operator }) {
            const discussion = await fastify.utils.getDiscussionOrPostWithChannelModerators({ id, isPost: false });
            if (!discussion) throw errors.notFound();

            let canDelete = await fastify.utils.canOperate({ obj: discussion, objType: 'Discussion', operator, operation: 'delete' });
            if (!canDelete) throw errors.forbidden();

            await fastify.db.$transaction([
                fastify.db.$queryRaw`
                            DELETE FROM DiscussionPostReport WHERE post_id IN (SELECT id FROM DiscussionPost WHERE discussion_id = ${id});
                        `,
                fastify.db.$queryRaw`
                            DELETE FROM DiscussionPostThumb WHERE post_id IN (SELECT id FROM DiscussionPost WHERE discussion_id = ${id});
                        `,
                fastify.db.$queryRaw`
                            DELETE FROM DiscussionPostGiftRef WHERE post_id IN (SELECT id FROM DiscussionPost WHERE discussion_id = ${id});
                        `,
                fastify.db.discussionPost.deleteMany({ where: { discussionId: id } }),
                fastify.db.discussion.delete({ where: { id } }),
                fastify.db.timeline.deleteMany({ where: { target: 'Discussion', targetId: id, userId: discussion.userId } }), // 只删除 discussion 的时间线，XXX 时间线的业务逻辑还需要重构，目前暂时只用管当前对象
            ]);

        },
        async stickyDiscussion({ id, operator, isSticky = false }) {
            const discussion = await fastify.utils.getDiscussionOrPostWithChannelModerators({ id, isPost: false });
            if (!discussion) throw errors.notFound();
            let canSticky = await fastify.utils.canOperate({ obj: discussion, objType: 'Discussion', operator, operation: 'sticky' });
            if (!canSticky) throw errors.forbidden();
            await fastify.db.discussion.updateMany({ where: { id, }, data: { isSticky } });
        },
        async closeDiscussion({ id, operator, isClosed = false }) {
            const discussion = await fastify.utils.getDiscussionOrPostWithChannelModerators({ id, isPost: false });
            if (!discussion) throw errors.notFound();
            let canSticky = await fastify.utils.canOperate({ obj: discussion, objType: 'Discussion', operator, operation: 'close' });
            if (!canSticky) throw errors.forbidden();
            await fastify.db.discussion.updateMany({ where: { id, }, data: { isClosed } });
        },
        // 统计某个讨论的礼物数量
        async countDiscussionGifts({ id }) {
            return (await fastify.db.$queryRaw`
                SELECT COUNT(*) AS gifts FROM DiscussionPostGiftRef dpgr
                JOIN DiscussionPost dp ON dpgr.post_id = dp.id
                JOIN discussion d ON dp.discussion_id = d.id
                WHERE d.id = ${id};
            `)[0]?.gifts || 0;
        },
        // 获得某个讨论贴子的礼物情况
        async getDiscussionPostGifts({ id }) {
            const gifts = await fastify.db.$queryRaw`
                SELECT Gift.id, Gift.name, Gift.description, Gift.url, Gift.price, count(DiscussionPostGiftRef.user_id) AS count FROM DiscussionPostGiftRef, Gift
                WHERE Gift.id = DiscussionPostGiftRef.gift_id AND post_id = ${id} GROUP BY DiscussionPostGiftRef.gift_id;
            `;
            let giftCount = 0;
            gifts.forEach(async (gift) => { gift.count = Number(gift.count) || 0; giftCount += gift.count; });
            return { gifts, count: giftCount };
        },
        // 获取某个讨论帖子的赞踩数据
        async getDiscussionPostThumbs({ id }) {
            return (await fastify.db.$queryRaw`
                SELECT (SELECT count(*) FROM DiscussionPostThumb WHERE direction = 'up' AND post_id = ${id}) AS ups,
                (SELECT count(*) FROM DiscussionPostThumb WHERE direction = 'down' AND post_id = ${id}) AS downs
            `)[0];
        },

        // discussion post
        async createDiscussionPost({ content, userId, discussionId, ip }) {
            if ((await fastify.db.discussion.count({ where: { id: discussionId, isClosed: false } })) <= 0) return; // 如果讨论被关闭，是不能回帖的
            let data = null;
            await fastify.db.$transaction(async (tx) => {
                data = await tx.discussionPost.create({ data: { content: cleanContent(content), discussionId, userId, ip } });
                await tx.discussion.update({ where: { id: discussionId }, data: { lastPostId: data.id } });
                await tx.timeline.create({ data: { userId, targetId: data.id, target: 'DiscussionPost', } });
            });
            return data;
        },

        // 修改帖子,修改只能改内容
        async updateDiscussionPost({ id, content, ip, operator }) {
            const post = await fastify.utils.getDiscussionOrPostWithChannelModerators({ id, isPost: true });
            // 讨论如果处于关闭状态，则不能修改
            if (!post || !post.discussion || post.discussion.isClosed) throw errors.notFound();

            let canUpdate = await fastify.utils.canOperate({ obj: post, objType: 'Post', operator, operation: 'update' });
            if (!canUpdate) throw errors.forbidden();

            await fastify.db.discussionPost.update({ where: { id }, data: { content: cleanContent(content), ip } });
        },

        // 是否能够删除帖子？
        // a: 讨论处于开放状态：是管理员 或者 频道管理员 或者 发帖人
        // b: 讨论处于关闭状态：是管理员 或者 频道管理员
        async deleteDiscussionPost({ id, operator }) {
            const post = await fastify.utils.getDiscussionOrPostWithChannelModerators({ id, isPost: true });
            if (!post) throw errors.notFound();

            let canDelete = await fastify.utils.canOperate({ obj: post, objType: 'Post', operator, operation: 'delete' });
            if (!canDelete) throw errors.forbidden();

            await fastify.db.$transaction(async (tx) => {
                const lastPost = await tx.discussionPost.findFirst({ where: { discussionId: post.discussion.id, id: { not: id } }, orderBy: { createdAt: 'desc' }, });
                await tx.discussion.update({ where: { id: post.discussion.id }, data: { lastPostId: lastPost?.id || null } });
                await tx.discussionPostReport.deleteMany({ where: { postId: id } });
                await tx.discussionPostThumb.deleteMany({ where: { postId: id } });
                await tx.discussionPostGiftRef.deleteMany({ where: { postId: id } });
                await tx.discussionPost.delete({ where: { id: id } });
                await tx.timeline.deleteMany({ where: { target: 'DiscussionPost', targetId: id, userId: post.userId } });
            });
        },
        // reviews
        // 获得某个评测的礼物情况
        async deleteReview({ id, userId, isByAdmin = false, }) {
            const whereCondition = { id };
            if (!isByAdmin) whereCondition.userId = userId; // isAdmin or is my review?
            const review = (await fastify.db.review.findFirst({ where: whereCondition }));
            if (review) {
                const toDeleteImages = await fastify.db.reviewImage.findMany({ where: { reviewId: id }, select: { url: true } });
                // 删除Review不需要删除其Comments，这是Review作者自己的行为，而非Comment作者行为。
                // 礼物在Timeline中，赠送礼物的行为是用户行为，而不是 Review 的行为，所以不用在这里删除。
                await fastify.db.$transaction([
                    fastify.db.reviewReport.deleteMany({ where: { reviewId: id } }), // 删除相关举报，举报需要在Timeline中吗？如果需要，那么就无需在这里删除
                    fastify.db.reviewThumb.deleteMany({ where: { reviewId: id } }), // 删除关联赞踩，赞踩需要在Timeline中吗？如果需要，那么就无需在这里删除
                    fastify.db.reviewImage.deleteMany({ where: { reviewId: id, } }), // 删除关联图片,
                    fastify.db.review.delete({ where: { id } }), // 删除评测
                    fastify.db.timeline.deleteMany({ where: { target: 'Review', targetId: id, userId: review.userId } }), // 删除发布者的时间线，ReviewComment的时间线不需要删除
                    fastify.db.$queryRaw`
                        UPDATE App SET score = avgScore FROM
                        (SELECT COALESCE(AVG(score), 4) AS avgScore FROM review WHERE app_id = ${review.appId})
                        WHERE App.id = ${review.appId};
                    `, // XXX 非必每次评测都更新，定时刷新App的评分或异步请求重新计算App积分
                ]);
                // 删除上传图片
                for (const img of toDeleteImages) {
                    try {
                        await fastify.storage.delete(img.url);
                    } catch (e) {
                        fastify.log.warn('delete file error: ' + e);
                    }
                }
            }
            return review;
        },
        // 获取某个评测的礼物数据
        async getReviewGifts({ id }) {
            const gifts = await fastify.db.$queryRaw`
                SELECT Gift.id, Gift.name, Gift.description, Gift.url, Gift.price, count(ReviewGiftRef.user_id) AS count FROM ReviewGiftRef, Gift
                WHERE Gift.id = ReviewGiftRef.gift_id AND review_id = ${id} GROUP BY ReviewGiftRef.gift_id;
            `;
            let giftCount = 0;
            gifts.forEach(async (gift) => { gift.count = Number(gift.count) || 0; giftCount += gift.count; });
            return { gifts, count: giftCount };
        },
        // 获取某个评测的赞踩数据
        async getReviewThumbs({ id }) {
            return (await fastify.db.$queryRaw`
                SELECT (SELECT count(*) FROM ReviewThumb WHERE direction = 'up' AND review_id = ${id}) AS ups,
                (SELECT count(*) FROM ReviewThumb WHERE direction = 'down' AND review_id = ${id}) AS downs
            `)[0];
        },
        // 通知 notification
        async addNotification({ userIds = [], type, targetId, target, content }) {
            throw new Error('not implemented');
        }
    });
    next();
};

export default fp(utils);
