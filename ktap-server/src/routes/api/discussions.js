import { AppMedia, LIMIT_CAP, Trading } from "../../constants.js";
import { authenticate } from '../../lib/auth.js';
import sanitizeHtml from 'sanitize-html';

const discussions = async (fastify, opts) => {
    // discussions首页，展示有讨论的 App
    fastify.get('', async function (req, reply) {
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const keyword = req.query.keyword || '';
        const whereCondition = {
            discussionChannels: { some: { id: { not: undefined } } },
        };
        if (keyword?.length > 0) whereCondition.name = { contains: keyword };
        const count = await fastify.db.app.count({ where: whereCondition });
        const data = await fastify.db.app.findMany({
            where: whereCondition,
            select: {
                id: true, name: true, summary: true,
                media: { select: { usage: true, image: true, thumbnail: true, }, },
                _count: { select: { discussions: true } }
            },
            orderBy: [{ discussions: { _count: 'desc' } }],
            take: limit,
            skip,
        });
        for (const app of data) {
            const mediaHead = app.media.find(media => media.usage === AppMedia.usage.head);
            const mediaLogo = app.media.find(media => media.usage === AppMedia.usage.logo);
            const appMetaUsers = (await fastify.db.$queryRaw`
                SELECT COUNT(DISTINCT user_id) AS total FROM Discussion WHERE app_id = ${app.id};
            `)[0]?.total;
            app.meta = {
                discussions: app._count.discussions || 0,
                users: appMetaUsers || 0,
            };
            app.media = {
                head: { image: mediaHead?.image, thumbnail: mediaHead?.thumbnail },
                logo: { image: mediaLogo?.image, thumbnail: mediaLogo?.thumbnail },
            };
        }
        return reply.code(200).send({ data, count, skip, limit });
    });

    fastify.post('', {
        preHandler: authenticate,
        schema: {
            body: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string', minLength: 1, maxLength: 255, errorMessage: {
                            minLength: '请输入标题',
                            maxLength: '标题不能大于 255 个字符',
                        }
                    },
                    content: {
                        type: 'string', minLength: 1, maxLength: 5000, errorMessage: {
                            minLength: '请输入内容',
                            maxLength: '内容不能大于 5000 个字符',
                        }
                    },
                    channelId: {
                        type: 'number', minimum: 1, errorMessage: {
                            type: '讨论频道 ID 只能是数字',
                            minimum: '缺少讨论频道',
                        }
                    },
                    appId: {
                        type: 'number', errorMessage: {
                            type: 'App ID 只能是数字',
                        }
                    },
                },
                required: ['title', 'content', 'channelId'],
                additionalProperties: false,
            },
        },
        handler: async function (req, reply) {
            const userId = req.user.id;
            const { title, content, appId, channelId, } = req.body;

            const discussion = await fastify.db.discussion.create({
                data: { title, appId, discussionChannelId: channelId, userId, },
            });
            const cleanContent = sanitizeHtml(content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
            });
            // add first post
            const post = await fastify.db.discussionPost.create({
                data: {
                    content: cleanContent,
                    discussionId: discussion.id, userId, ip: req.ip
                }
            });
            await fastify.db.timeline.create({ data: { userId, targetId: discussion.id, target: 'Discussion', } });
            await fastify.db.timeline.create({ data: { userId, targetId: post.id, target: 'DiscussionPost', } });
            return reply.code(200).send();
        }
    });

    // 某个 App 的讨论频道
    fastify.get('/apps/:appId/channels', async function (req, reply) {
        const appId = Number(req.params.appId) || 0;
        const data = await fastify.db.discussionChannel.findMany({ where: { appId }, });
        return reply.code(200).send({ data });
    });

    // 某个 App 的某个频道的所有讨论
    fastify.get('/apps/:appId/channels/:channelId', async function (req, reply) {
        const appId = Number(req.params.appId) || 0;
        const channelId = Number(req.params.channelId) || 0;
        const keyword = req.query.keyword || '';
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const skip = Math.max(0, Number(req.query.skip) || 0);

        const whereCondition = { appId };
        if (channelId > 0) whereCondition.discussionChannelId = channelId;
        if (keyword?.length > 0) whereCondition.title = { contains: keyword };
        const count = await fastify.db.discussion.count({ where: whereCondition });
        const data = await fastify.db.discussion.findMany({
            where: whereCondition,
            orderBy: [{ isSticky: 'desc' }, { updatedAt: 'desc' }], // XXX 默认顺序下：SQLite 会将false放前面，因为False=0,True=1。其他 DB 可能会将True排前面。
            select: {
                id: true, title: true, isSticky: true, isClosed: true, createdAt: true, updatedAt: true,
                user: {
                    select: { id: true, name: true, title: true, avatar: true, gender: true },
                },
                channel: {
                    select: { id: true, name: true, }
                },
                _count: { select: { posts: true } },
            },
            take: limit, skip
        });
        for (const item of data) {
            item.meta = {
                posts: item._count.posts,
                gifts: await fastify.utils.countDiscussionGifts({ id: item.id }), // 统计礼物数量
            };
            delete item._count;
        }
        return reply.code(200).send({ data, count, limit, skip });
    });

    fastify.get('/:id', async function (req, reply) {
        const id = Number(req.params.id);
        const data = await fastify.db.discussion.findUnique({
            where: { id },
            select: {
                id: true, title: true, isSticky: true, isClosed: true, createdAt: true, updatedAt: true,
                channel: { select: { id: true, name: true, } },
                user: { select: { id: true, name: true, title: true, avatar: true, gender: true } },
                app: {
                    select: {
                        id: true, name: true, summary: true, score: true,
                        media: {
                            where: { usage: { in: [AppMedia.usage.head, AppMedia.usage.logo] } },
                            select: { usage: true, image: true, thumbnail: true, },
                        }
                    },
                },
                _count: { select: { posts: true }, }
            }
        });
        const metaUsers = (await fastify.db.$queryRaw`
                SELECT COUNT(DISTINCT user_id) AS total FROM DiscussionPost WHERE discussion_id = ${id};
            `)[0]?.total || 0;
        data.app.media = {
            head: data.app.media.find(media => media.usage === AppMedia.usage.head),
            logo: data.app.media.find(media => media.usage === AppMedia.usage.logo),
        }
        data.meta = {
            posts: data._count.posts,
            users: metaUsers,
            gifts: await fastify.utils.countDiscussionGifts({ id }),
        };
        delete data._count;
        delete data.app.media.head.usage;
        delete data.app.media.logo.usage;
        return reply.code(200).send({ data });
    });

    fastify.get('/:id/posts', async function (req, reply) {
        const id = Number(req.params.id);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const count = await fastify.db.discussionPost.count({ where: { discussionId: id } });
        const data = await fastify.db.discussionPost.findMany({
            take: limit,
            skip,
            orderBy: [{ createdAt: 'asc' }],
            where: { discussionId: id },
            select: {
                id: true, content: true, createdAt: true, ip: true,
                user: { select: { id: true, name: true, title: true, avatar: true, gender: true } },
            }
        });
        for (const post of data) {
            const giftsData = await fastify.utils.getDiscussionPostGifts({ id: post.id });
            const thumbs = await fastify.utils.getDiscussionPostThumbs({ id: post.id });
            post.gifts = giftsData.gifts;
            post.meta = {
                ups: thumbs?.ups || 0, downs: thumbs?.downs || 0,
                gifts: giftsData.count,
            };
        }
        return reply.code(200).send({ data, limit, skip, count });
    });

    fastify.post('/:id/posts', {
        preHandler: authenticate,
        schema: {
            body: {
                type: 'object',
                properties: {
                    content: {
                        type: 'string', minLength: 1, maxLength: 5000, errorMessage: {
                            minLength: '请输入内容',
                            maxLength: '内容不能大于 5000 个字符',
                        }
                    },
                },
                required: ['content'],
                additionalProperties: false,
            },
        },
        handler: async function (req, reply) {
            const id = Number(req.params.id);
            const userId = req.user.id;
            const { content } = req.body;
            if ((await fastify.db.discussion.count({ where: { id } })) <= 0) reply.code(404).send();
            const cleanContent = sanitizeHtml(content, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']) });
            const data = await fastify.db.discussionPost.create({
                data: { content: cleanContent, discussionId: id, userId, ip: req.ip }
            });
            return reply.code(200).send({ data: { id: data.id, content: data.content, createdAt: data.createdAt, ip: data.ip, updatedAt: data.updatedAt } });
        }
    });

    fastify.put('/:id/sticky', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const id = Number(req.params.id);
            const isSticky = req.body.sticky === true;
            await fastify.db.discussion.updateMany({
                where: {
                    id,
                    userId: req.user.id // user必须是 Owner 才可以
                },
                data: { isSticky }
            });
            return reply.code(204).send();
        }
    });

    fastify.put('/:id/close', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const id = Number(req.params.id);
            const isClosed = req.body.close === true;
            await fastify.db.discussion.updateMany({
                where: {
                    id,
                    userId: req.user.id // user必须是 Owner 才可以
                },
                data: { isClosed }
            });
            return reply.code(204).send();
        }
    });

    fastify.delete('/:id', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const id = Number(req.params.id);
            const discussion = await fastify.db.discussion.findUnique({ where: { id } });

            if (discussion) {
                // 检查是否是 Post 的发布者或者是频道管理员
                // TODO 检查频道管理员
                if (discussion.userId !== req.user.id) return reply.code(403).send();
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

            return reply.code(204).send();
        }
    });

    fastify.delete('/:id/posts/:postId', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const id = Number(req.params.id);
            const postId = Number(req.params.postId);
            const userId = req.user.id;

            // 检查是否是 Post 的发布者或者是频道管理员
            // TODO 检查频道管理员
            const post = await fastify.db.discussionPost.findUnique({ where: { id: postId } });
            if (post) {
                if (post.userId !== userId) return reply.code(403).send();

                fastify.db.$transaction([
                    fastify.db.discussionPostReport.deleteMany({ where: { postId } }),
                    fastify.db.discussionPostThumb.deleteMany({ where: { postId } }),
                    fastify.db.discussionPostGiftRef.deleteMany({ where: { postId } }),
                    fastify.db.discussionPost.delete({ where: { id: postId } }),
                    fastify.db.timeline.deleteMany({ where: { target: 'DiscussionPost', targetId: postId, userId: post.userId } }),
                ])
            }
            return reply.code(204).send();
        }
    });

    // 取这个帖子日期后面的 Limit 个
    fastify.get('/:id/others', async (req, res) => {
        const id = Number(req.params.id);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const discussion = await fastify.db.discussion.findUnique({ where: { id }, select: { channel: { select: { id: true } } } });
        const findOptions = ({ isPrev }) => {
            return {
                take: limit, orderBy: [{ createdAt: isPrev ? 'desc' : 'asc' }],
                where: {
                    discussionChannelId: discussion.channel.id,
                    id: isPrev ? { lt: id } : { gt: id },
                },
                select: {
                    id: true, title: true,
                    _count: { select: { posts: true }, }
                }
            }
        };
        let data = await fastify.db.discussion.findMany(findOptions({ isPrev: false }));
        if (data.length === 0) { // 如果是最新的帖子了，就往前取 Limit 个。
            data = await fastify.db.discussion.findMany(findOptions({ isPrev: true }));
            data.reverse();
        }
        for (const discussion of data) {
            discussion.meta = {
                posts: discussion._count.posts,
            };
            delete discussion._count;
        }
        return res.code(200).send({ data });
    });

    // 点赞或点踩
    fastify.post('/:id/posts/:postId/thumb/:direction', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const postId = Number(req.params.postId);
            const userId = req.user.id;
            let direction = ((req.params.direction || 'up').toLowerCase()) === 'down' ? 'down' : 'up'; // only up or down

            const toDelete = await fastify.db.discussionPostThumb.findUnique({ where: { postId_userId: { postId, userId, } } });
            // 直接删除当前的赞或者踩
            // 如果新的点踩或者点赞与删除的不同，则重新创建
            if (toDelete) await fastify.db.discussionPostThumb.delete({ where: { postId_userId: { postId, userId, } } });
            if (!toDelete || toDelete.direction !== direction) {
                await fastify.db.discussionPostThumb.create({ data: { postId, userId, direction } });
            }
            // 重新取当前赞踩数据
            const data = await fastify.utils.getDiscussionPostThumbs({ id: postId });
            return reply.code(200).send({ data });
        }
    });

    fastify.post('/:id/posts/:postId/gifts/:giftId', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const userId = req.user.id;
            const postId = Number(req.params.postId);
            const giftId = Number(req.params.giftId);

            const gift = await fastify.db.gift.findUnique({ where: { id: giftId } });
            await fastify.db.$transaction(async (tx) => {
                // 减去balance
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: { balance: { decrement: gift.price, } }
                });
                if (updatedUser.balance < 0) throw new Error('insufficient balance'); // 检查余额， 有问题就回滚事务
                await tx.trading.create({ data: { userId, target: 'Gift', targetId: giftId, amount: gift.price, type: Trading.type.buy } }); // 生成交易
                const giftRef = await tx.discussionPostGiftRef.create({ data: { userId, giftId, postId } }); // 创建关系
                await tx.timeline.create({ data: { userId, target: 'DiscussionPostGiftRef', targetId: giftRef.id } }); // 创建动态
            });
            // XXX 这里没有包裹事务出错的错误，直接扔给框架以500形式抛出了，后续需要更柔性处理
            // 读取最新的礼物情况
            // fetch gifts
            const gifts = await fastify.utils.getDiscussionPostGifts({ id: postId });
            return reply.code(200).send({ data: gifts.gifts, count: gifts.count });
        }
    });

    // 举报
    fastify.post('/:id/posts/:postId/report', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const userId = req.user.id;
            const postId = Number(req.params.postId);
            const content = req.body.content;
            await fastify.db.discussionPostReport.create({ data: { userId, postId, content } });
            return reply.code(200).send();
        }
    });
};

export default discussions;
