import { Pagination } from "../../constants.js";

const reviews = async function (fastify, opts) {
    fastify.get('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.review.findUnique({ where: { id }, });
        return reply.code(200).send({ data });
    });

    fastify.delete('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        await fastify.review.deleteReview({ id, isByAdmin: true });
        return reply.code(204).send();
    });

    fastify.get('', async (req, reply) => {
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const keyword = req.query.keyword || '';
        const isReported = (req.query.isReported || 'false').toLowerCase() === 'true';
        const hasGifts = (req.query.hasGifts || 'false').toLowerCase() === 'true';
        const hasImages = (req.query.hasImages || 'false').toLowerCase() === 'true';

        const whereCondition = {};
        if (keyword.length > 0) whereCondition.content = { contains: keyword };
        if (isReported) whereCondition.reports = { some: {} };
        if (hasGifts) whereCondition.gifts = { some: {} };
        if (hasImages) whereCondition.images = { some: {} };

        const count = await fastify.db.review.count({ where: whereCondition });
        const data = await fastify.db.review.findMany({
            where: whereCondition,
            select: {
                id: true, content: true, score: true, createdAt: true, updatedAt: true,
                user: { select: { id: true, name: true }, },
                app: { select: { id: true, name: true } },
                _count: { select: { reports: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        data.forEach(item => {
            item.meta = item._count;
            delete item._count;
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.get('/:id/reports', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const count = await fastify.db.reviewReport.count({ where: { reviewId: id } });
        const data = await fastify.db.reviewReport.findMany({
            where: { reviewId: id, },
            select: {
                id: true, content: true, createdAt: true,
                user: {
                    select: { id: true, name: true, avatar: true },
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.post('/monkey', async (req, reply) => {
        const { userId, content, score, isAll } = req.body;
        const count = Number(req.body.count) || 10;
        const total = await fastify.db.app.count();
        let max = isAll ? total : Math.min(count, total);
        const data = { userId: Number(userId) || 1, content, score: Number(score) || 4, allowComment: false };
        let limit = Math.min(max, 100);
        for (let i = 0; i < max; i += limit) {
            const apps = await fastify.db.app.findMany({
                take: limit,
                skip: i,
                select: { id: true },
                orderBy: { createdAt: 'desc' }, // created_at 不会变化
            });
            for (const app of apps) {
                data.appId = app.id;
                try {
                    const newData = await fastify.db.review.create({ data });
                    await fastify.db.timeline.create({ data: { userId, targetId: newData.id, target: 'Review', } });
                } catch (ignore) {
                    // ignore
                }
            }
        }
        return reply.code(201).send();
    });
};

export default reviews;
