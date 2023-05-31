import { AppMedia, LIMIT_CAP } from "../../constants.js";

const news = async (fastify, opts) => {
    fastify.get('', async function (req, reply) {
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const count = await fastify.db.news.count();
        const data = await fastify.db.news.findMany({
            take: limit,
            skip,
            orderBy: { updatedAt: 'desc' },
            include: {
                app: {
                    include: {
                        media: {
                            where: { usage: AppMedia.usage.logo },
                            select: {
                                image: true,
                                thumbnail: true,
                            },
                        },
                    }
                },
            }
        });
        // transform data to the form that suite the view
        data.forEach(item => {
            item.app = {
                id: item.app.id,
                name: item.app.name,
                logo: item.app.media[0].image,
            };
            item.meta = { views: item.viewCount };
            delete item.content;
            delete item.banner;
            delete item.viewCount;
        });
        return reply.code(200).send({ data, count, skip, limit });
    });

    fastify.get('/apps/:appId', async function (req, reply) {
        const appId = Number(req.params.appId) || 0;
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const skip = Math.max(0, Number(req.query.skip) || 0);

        const count = await fastify.db.news.count({ where: { appId } });
        const data = await fastify.db.news.findMany({
            where: { appId },
            select: { id: true, title: true, summary: true, head: true, updatedAt: true, createdAt: true, viewCount: true },
            take: limit,
            skip,
            orderBy: { updatedAt: 'desc' }
        });
        data.forEach(item => {
            item.meta = { views: item.viewCount }
            delete data.viewCount;
        });
        return reply.code(200).send({ data, count, skip, limit });
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

export default news;
