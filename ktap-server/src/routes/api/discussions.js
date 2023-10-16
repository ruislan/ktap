import { AppMedia, Notification, Pagination, Trading } from "../../constants.js";
import { authenticate } from '../../lib/auth.js';

const bizErrorHandler = async function (error, request, reply) {
    if (error.code == 403) return reply.code(403).send();
    if (error.code == 404) return reply.code(404).send();
    throw error;
};

/**
 * 通常有 4 个角色会使用discussion相关功能，网站 Admin ，版主， 拥有人（讨论或帖子）， 普通用户。
 * Admin 默认拥有所有权限。
 * 版主 拥有频道内所有权限。除了正常的用户行为以外。包括频道的编辑权限（没有删除权限）、讨论的关闭，编辑等、帖子的关闭、编辑删除等。
 * 拥有人拥有该讨论所有权限或者帖子所有权限。
 * 普通用户拥有一般权限，例如查看，举报，点赞，送礼等等。
 */
const discussions = async (fastify, opts) => {
    // discussions首页，展示有讨论的 App
    fastify.get('', async function (req, reply) {
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        const keyword = req.query.keyword || '';
        const whereCondition = {
            isVisible: true,
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
                SELECT COUNT(DISTINCT dp.user_id) AS total FROM DiscussionPost dp WHERE discussion_id IN
                (SELECT id FROM Discussion WHERE app_id = ${app.id});
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
                    title: { $ref: 'discussion#/properties/title' },
                    content: { $ref: 'post#/properties/content' },
                    channelId: { $ref: 'common#/properties/id' },
                    appId: { $ref: 'common#/properties/id' },
                },
                required: ['title', 'content', 'channelId'],
                additionalProperties: false,
            },
        },
    }, async function (req, reply) {
        const userId = req.user.id;
        const { title, content, appId, channelId, } = req.body;
        try {
            await fastify.discussion.createDiscussion({ title, content, appId, channelId, userId, ip: req.ip });
            return reply.code(200).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 某个 App 的讨论频道
    fastify.get('/apps/:appId/channels', async function (req, reply) {
        const appId = Number(req.params.appId) || 0;
        const data = await fastify.db.discussionChannel.findMany({
            where: { appId },
            select: {
                id: true, name: true, description: true, icon: true, createdAt: true, updatedAt: true,
                moderators: {
                    select: {
                        user: {
                            select: { id: true, name: true, title: true, avatar: true, gender: true, }
                        }
                    }
                },
                _count: { select: { discussions: true } }
            }
        });
        data.forEach(item => {
            item.moderators = item.moderators.map(ref => ref.user);
            item.meta = {
                discussions: item._count.discussions || 0,
            };
            delete item._count;
        });
        return reply.code(200).send({ data });
    });

    // 某个 App 的某个频道的所有讨论
    fastify.get('/apps/:appId/channels/:channelId', async function (req, reply) {
        const appId = Number(req.params.appId) || 0;
        const channelId = Number(req.params.channelId) || 0;
        const keyword = req.query.keyword || '';
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

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
                lastPost: {
                    select: {
                        id: true, content: true, createdAt: true,
                        user: { select: { id: true, name: true }, },
                    },
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
                gifts: await fastify.discussion.countDiscussionGifts({ id: item.id }), // 统计礼物数量
            };
            delete item._count;
        }
        return reply.code(200).send({ data, count, limit, skip });
    });

    // 更新某个 APP 的频道
    fastify.put('/apps/:appId/channels/:channelId', {
        preHandler: authenticate,
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: { $ref: 'channel#/properties/name' },
                    icon: { $ref: 'channel#/properties/icon' },
                    description: { $ref: 'channel#/properties/description' },
                },
                required: ['name'],
                additionalProperties: false,
            }
        },
        errorHandler: bizErrorHandler,
    }, async function (req, reply) {
        const appId = Number(req.params.appId) || 0;
        const channelId = Number(req.params.channelId) || 0;
        const { name, icon, description } = req.body;

        try {
            if (channelId > 0) {
                await fastify.discussion.updateDiscussionChannel({
                    id: channelId, name, icon, description, appId, operator: req.user,
                });
            }
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id', async function (req, reply) {
        const id = Number(req.params.id);
        const data = await fastify.db.discussion.findUnique({
            where: { id },
            select: {
                id: true, title: true, isSticky: true, isClosed: true, createdAt: true, updatedAt: true,
                channel: {
                    select: {
                        id: true, name: true,
                        moderators: {
                            select: { userId: true },
                        }
                    },
                },
                user: { select: { id: true, name: true, title: true, avatar: true, gender: true } },
                app: {
                    select: {
                        id: true, name: true, summary: true, score: true, isVisible: true,
                        media: {
                            where: { usage: { in: [AppMedia.usage.head, AppMedia.usage.logo] } },
                            select: { usage: true, image: true, thumbnail: true, },
                        }
                    },
                },
                _count: { select: { posts: true }, }
            }
        });
        if (!data || !data.app.isVisible) return reply.code(404).send();

        const metaUsers = (await fastify.db.$queryRaw`
                SELECT COUNT(DISTINCT user_id) AS total FROM DiscussionPost WHERE discussion_id = ${id};
            `)[0]?.total || 0;
        data.app.media = {
            head: data.app.media.find(media => media.usage === AppMedia.usage.head),
            logo: data.app.media.find(media => media.usage === AppMedia.usage.logo),
        }
        data.channel.moderators = data.channel.moderators.map(ref => ref.userId);
        data.meta = {
            posts: data._count.posts,
            users: metaUsers,
            gifts: await fastify.discussion.countDiscussionGifts({ id }),
        };
        delete data._count;
        delete data.app.media.head.usage;
        delete data.app.media.logo.usage;
        return reply.code(200).send({ data });
    });

    fastify.get('/:id/posts/:postId', async function (req, reply) {
        const id = Number(req.params.id) || 0;
        const postId = Number(req.params.postId);
        const data = await fastify.db.discussionPost.findUnique({
            where: { id: postId },
            select: {
                id: true, content: true, createdAt: true, ip: true, updatedAt: true, discussionId: true,
                user: { select: { id: true, name: true, title: true, avatar: true, gender: true } },
            }
        });
        if (data.discussionId != id) return reply.code(404).send(); // not belongs to this discussion
        const giftsData = await fastify.discussion.getDiscussionPostGifts({ id: data.id });
        const thumbs = await fastify.discussion.getDiscussionPostThumbs({ id: data.id });
        data.gifts = giftsData.gifts;
        data.meta = {
            ups: thumbs?.ups || 0, downs: thumbs?.downs || 0,
            gifts: giftsData.count,
        };
        return reply.code(200).send({ data });
    });

    fastify.get('/:id/posts', async function (req, reply) {
        const id = Number(req.params.id);
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        const count = await fastify.db.discussionPost.count({ where: { discussionId: id } });
        const data = await fastify.db.discussionPost.findMany({
            take: limit,
            skip,
            orderBy: [{ createdAt: 'asc' }],
            where: { discussionId: id },
            select: {
                id: true, content: true, createdAt: true, ip: true, updatedAt: true,
                user: { select: { id: true, name: true, title: true, avatar: true, gender: true } },
            }
        });
        for (const post of data) {
            const giftsData = await fastify.discussion.getDiscussionPostGifts({ id: post.id });
            const thumbs = await fastify.discussion.getDiscussionPostThumbs({ id: post.id });
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
                    content: { $ref: 'post#/properties/content' },
                },
                additionalProperties: false,
            },
        },
    }, async function (req, reply) {
        const id = Number(req.params.id);
        const userId = req.user.id;
        const { content } = req.body;

        try {
            const data = await fastify.discussion.createDiscussionPost({ content, discussionId: id, userId, ip: req.ip });
            return reply.code(200).send({ data });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 置顶或者取消置顶
    fastify.put('/:id/sticky', {
        preHandler: authenticate,
        errorHandler: bizErrorHandler,
    }, async function (req, reply) {
        const id = Number(req.params.id);
        const isSticky = req.body.sticky === true;

        try {
            await fastify.discussion.stickyDiscussion({ id, operator: req.user, isSticky });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.put('/:id/close', {
        preHandler: authenticate,
        errorHandler: bizErrorHandler,
    }, async function (req, reply) {
        const id = Number(req.params.id) || 0;
        const isClosed = req.body.close === true;

        try {
            await fastify.discussion.closeDiscussion({ id, operator: req.user, isClosed });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.put('/:id', {
        preHandler: authenticate,
        errorHandler: bizErrorHandler,
        schema: {
            body: {
                type: 'object',
                properties: {
                    title: { $ref: 'discussion#/properties/title' },
                },
                additionalProperties: false,
            }
        },
    }, async function (req, reply) {
        const id = Number(req.params.id) || 0;
        const { title } = req.body;

        try {
            await fastify.discussion.updateDiscussion({ id, title, operator: req.user });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.delete('/:id', {
        preHandler: authenticate,
        errorHandler: bizErrorHandler,
    }, async function (req, reply) {
        const id = Number(req.params.id) || 0;
        try {
            await fastify.discussion.deleteDiscussion({ id, operator: req.user });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.put('/:id/posts/:postId', {
        preHandler: authenticate,
        errorHandler: bizErrorHandler,
        schema: {
            body: {
                content: { $ref: 'post#/properties/content' },
            }
        },
    }, async function (req, reply) {
        const postId = Number(req.params.postId);
        const { content } = req.body;

        try {
            await fastify.discussion.updateDiscussionPost({ id: postId, content, ip: req.ip, operator: req.user });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.delete('/:id/posts/:postId', {
        preHandler: authenticate,
        errorHandler: bizErrorHandler,
    }, async function (req, reply) {
        const postId = Number(req.params.postId);
        try {
            await fastify.discussion.deleteDiscussionPost({ id: postId, operator: req.user });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 取这个帖子日期后面的 Limit 个
    fastify.get('/:id/others', async (req, res) => {
        const id = Number(req.params.id);
        const { limit } = Pagination.parse(0, req.query.limit);
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
    }, async function (req, reply) {
        const postId = Number(req.params.postId);
        const userId = req.user.id;
        let direction = ((req.params.direction || 'up').toLowerCase()) === 'down' ? 'down' : 'up'; // only up or down
        try {
            await fastify.discussion.thumbDiscussionPost({ postId, userId, direction });
            const data = await fastify.discussion.getDiscussionPostThumbs({ id: postId }); // 重新取当前赞踩数据
            return reply.code(200).send({ data });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.post('/:id/posts/:postId/gifts/:giftId', {
        preHandler: authenticate,
    }, async function (req, reply) {
        const userId = req.user.id;
        const postId = Number(req.params.postId);
        const giftId = Number(req.params.giftId);
        try {
            await fastify.discussion.sendDiscussionPostGift({ postId, userId, giftId });
            const gifts = await fastify.discussion.getDiscussionPostGifts({ id: postId }); // 读取最新的礼物情况
            return reply.code(200).send({ data: gifts.gifts, count: gifts.count });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 举报
    fastify.post('/:id/posts/:postId/report', {
        preHandler: authenticate,
        schema: {
            body: {
                type: 'object',
                properties: {
                    content: { $ref: 'report#/properties/content' },
                },
                required: ['content'],
                additionalProperties: false,
            },
        }
    }, async function (req, reply) {
        const userId = req.user.id;
        const postId = Number(req.params.postId);
        const content = req.body.content;
        try {
            await fastify.discussion.reportDiscussionPost({ postId, userId, content });
            return reply.code(200).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });
};

export default discussions;
