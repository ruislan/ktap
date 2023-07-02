import { AppMedia, LIMIT_CAP } from "../../constants.js";

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

    // 某个 App 的讨论频道
    fastify.get('/apps/:appId/channels', async function (req, reply) {
        const appId = Number(req.params.appId) || 0;
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const skip = Math.max(0, Number(req.query.skip) || 0);

        const data = await fastify.db.discussionChannel.findMany({ where: { appId }, });
        return reply.code(200).send({ data });
    });

    fastify.get('/:id', async function (req, reply) {
        const id = Number(req.params.id);
        const data = await fastify.db.news.findUnique({
            where: { id },
            include: {
                app: {
                    select: {
                        id: true,
                        name: true,
                        summary: true,
                        score: true,
                        releasedAt: true,
                    }
                },
            }
        });
        if (!data) return reply.code(404).send();
        await fastify.db.news.update({ where: { id }, data: { viewCount: { increment: 1 } } });
        data.meta = { views: data.viewCount };
        delete data.viewCount;
        delete data.appId;
        return reply.code(200).send({ data });
    });

    fastify.get('/apps/:appId/view/:id', async function (req, reply) {
        const id = Number(req.params.id);
        const data = await fastify.db.news.findUnique({
            where: { id },
            include: {
                app: {
                    select: {
                        id: true,
                        name: true,
                        summary: true,
                        score: true,
                        releasedAt: true,
                    }
                },
            }
        });
        await fastify.db.news.update({ where: { id }, data: { viewCount: { increment: 1 } } });
        data.meta = { views: data.viewCount };
        delete data.viewCount;
        delete data.appId;
        return reply.code(200).send({ data });
    });
};

export default discussions;
