import { AppMedia, LIMIT_CAP, TagCategory } from "../../constants.js";

const reconstructAppWithHead = function (arr) {
    arr.forEach(app => {
        app.media = {
            head: {
                image: app.media[0].image,
                thumbnail: app.media[0].thumbnail,
            }
        }
    });
}

const rank = async (fastify, opts) => {
    // 按最佳排序
    fastify.get('/apps/best', async function (req, reply) {
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const skip = Math.max(0, Number(req.query.skip) || 0);
        let take = skip + limit >= 100 ? 100 - skip : limit;
        let data = [];
        let count = 0;
        if (take > 0) {
            count = await fastify.db.app.count({ where: { isVisible: true, } });
            data = await fastify.db.app.findMany({
                where: { isVisible: true, },
                select: {
                    id: true, name: true, summary: true, score: true,
                    media: {
                        where: { usage: AppMedia.usage.head },
                        select: {
                            image: true,
                            thumbnail: true,
                        },
                    },
                },
                orderBy: { score: 'desc' },
                skip,
                take
            });
            reconstructAppWithHead(data);
        }
        return reply.code(200).send({ data, count, skip, limit });
    });

    // 按最差的排序
    fastify.get('/apps/worst', async function (req, reply) {
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const skip = Math.max(0, Number(req.query.skip) || 0);
        let take = skip + limit >= 100 ? 100 - skip : limit;
        let data = [];
        let count = 0;
        if (take > 0) {
            count = await fastify.db.app.count({ where: { isVisible: true, } });
            data = await fastify.db.app.findMany({
                where: { isVisible: true, },
                select: {
                    id: true, name: true, summary: true, score: true,
                    media: {
                        where: { usage: AppMedia.usage.head },
                        select: {
                            image: true,
                            thumbnail: true,
                        },
                    },
                },
                orderBy: { score: 'asc' },
                skip,
                take
            });
            reconstructAppWithHead(data);
        }
        return reply.code(200).send({ data, count, skip, limit });
    });

    // 按最新排序
    fastify.get('/apps/newest', async function (req, reply) {
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const skip = Math.max(0, Number(req.query.skip) || 0);
        let take = skip + limit >= 100 ? 100 - skip : limit;
        let data = [];
        let count = 0;
        if (take > 0) {
            count = await fastify.db.app.count({ where: { isVisible: true, } });
            data = await fastify.db.app.findMany({
                where: { isVisible: true, },
                select: {
                    id: true, name: true, summary: true, score: true,
                    media: {
                        where: { usage: AppMedia.usage.head },
                        select: {
                            image: true,
                            thumbnail: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            });
            reconstructAppWithHead(data);
        }
        return reply.code(200).send({ data, count, skip, limit });
    });

    // 按最热排序
    // 评论最多的
    fastify.get('/apps/hottest', async function (req, reply) {
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const skip = Math.max(0, Number(req.query.skip) || 0);
        let take = skip + limit >= 100 ? 100 - skip : limit;
        let data = [];
        let count = 0;
        if (take > 0) {
            count = await fastify.db.app.count({ where: { isVisible: true, } });
            data = await fastify.db.app.findMany({
                where: { isVisible: true, },
                select: {
                    id: true, name: true, summary: true, score: true,
                    media: {
                        where: { usage: AppMedia.usage.head },
                        select: {
                            image: true,
                            thumbnail: true,
                        },
                    },
                },
                orderBy: { reviews: { _count: 'desc' } },
                skip,
                take
            });
            reconstructAppWithHead(data);
        }
        return reply.code(200).send({ data, count, skip, limit });
    });

    // 游戏最多的厂商
    fastify.get('/organizations/best', async function (req, reply) {
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const skip = Math.max(0, Number(req.query.skip) || 0);
        let take = skip + limit >= 100 ? 100 - skip : limit;
        let data = [];
        let count = 0;
        if (take > 0) {
            count = await fastify.db.organization.count();
            data = await fastify.db.organization.findMany({
                select: {
                    id: true, name: true, logo: true, summary: true,
                    _count: {
                        select: {
                            publishedApps: true,
                            developedApps: true,
                        }
                    }
                },
                orderBy: [{ developedApps: { _count: 'desc' } }, { publishedApps: { _count: 'desc' } }],
                skip,
                take
            });
            data.forEach(org => {
                org.meta = { published: org._count.publishedApps, developed: org._count.developedApps, };
                delete org._count;
            });
        }
        return reply.code(200).send({ data, count, skip, limit });
    });
};

export default rank;
