import { AppMedia, Pagination } from "../../constants.js";

const news = async (fastify, opts) => {
    fastify.get('', async function (req, reply) {
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        const data = await fastify.caching.get(`news_${skip}_${limit}`, async () => {
            const count = await fastify.db.news.count();
            const newsList = await fastify.db.news.findMany({
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
            // transform data
            newsList.forEach(item => {
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
            return { data: newsList, count, skip, limit };
        });
        return reply.code(200).send(data);
    });

    fastify.get('/apps/:appId', async function (req, reply) {
        const appId = Number(req.params.appId) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        const data = await fastify.caching.get(`news_${appId}_${skip}_${limit}`, async () => {
            const count = await fastify.db.news.count({ where: { appId } });
            const newsList = await fastify.db.news.findMany({
                where: { appId },
                select: { id: true, title: true, summary: true, head: true, updatedAt: true, createdAt: true, viewCount: true },
                take: limit,
                skip,
                orderBy: { updatedAt: 'desc' }
            });
            newsList.forEach(item => {
                item.meta = { views: item.viewCount }
                delete item.viewCount;
            });
            return { data: newsList, count, skip, limit };
        });
        return reply.code(200).send(data);
    });

    fastify.get('/:id', async function (req, reply) {
        const id = Number(req.params.id);
        const data = await fastify.db.news.findUnique({ where: { id }, });
        if (!data) return reply.code(404).send();
        await fastify.db.news.update({ where: { id }, data: { viewCount: { increment: 1 } } });
        data.meta = { views: data.viewCount };
        delete data.viewCount;
        delete data.appId;
        return reply.code(200).send({ data });
    });
};

export default news;
