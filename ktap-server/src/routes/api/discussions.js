import { AppMedia, LIMIT_CAP } from "../../constants.js";
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
            await fastify.db.discussionPost.create({
                data: {
                    content: cleanContent,
                    discussionId: discussion.id, userId, ip: req.ip
                }
            });
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
                    select: { id: true, name: true, title: true, avatar: true },
                },
                channel: {
                    select: { id: true, name: true, }
                },
                _count: { select: { posts: true } },
            },
            take: limit, skip
        });
        for (const item of data) {
            // 统计礼物数量
            const gifts = (await fastify.db.$queryRaw`
                SELECT COUNT(*) AS gifts FROM DiscussionPostGiftRef dpgr
                JOIN DiscussionPost dp ON dpgr.post_id = dp.id
                JOIN discussion d ON dp.discussion_id = d.id
                WHERE d.id = ${item.id};
            `)[0]?.gifts || 0;
            item.meta = {
                posts: item._count.posts,
                gifts,
            };
            delete item._count;
        }
        return reply.code(200).send({ data, count, limit, skip });
    });

    fastify.get('/apps/:appId/view/:id', async function (req, reply) {
        const id = Number(req.params.id);
        const data = await fastify.db.discussion.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { posts: true },
                }
            }
        });
        return reply.code(200).send({ data });
    });
};

export default discussions;
