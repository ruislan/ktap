import fp from 'fastify-plugin';
import sanitizeHtml from 'sanitize-html';

// XXX 临时的一个避免重复代码的归并处
// TODO 重构：把所有重复代码都统一到这个地方来
const utils = async (fastify, opts, next) => {
    fastify.decorate('utils', {
        // discussion
        async createDiscussion({ title, content, appId, channelId, userId, ip }) {
            const cleanContent = sanitizeHtml(content, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']) });

            const result = await fastify.db.$transaction(async (tx) => {
                const discussion = await tx.discussion.create({
                    data: { title, appId, discussionChannelId: channelId, userId, },
                });
                const post = await tx.discussionPost.create({
                    data: {
                        content: cleanContent,
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
        async deleteDiscussion({ id, operator }) {
            const discussion = await fastify.db.discussion.findUnique({ where: { id } });
            if (discussion) {
                // 检查是否是 Post 的发布者或者是频道管理员
                // TODO 检查频道管理员
                if (discussion.userId !== operator.id) return reply.code(403).send();
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
            }
            return discussion;
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
        }
    });
    next();
};

export default fp(utils);
