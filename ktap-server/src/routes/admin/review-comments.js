import { LIMIT_CAP } from "../../constants.js";

const reviewComments = async function (fastify, opts) {
    fastify.get('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.reviewComment.findUnique({ where: { id }, });
        return reply.code(200).send({ data });
    });

    fastify.delete('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        await fastify.db.reviewComment.delete({ where: { id }, });
        return reply.code(204).send();
    });

    fastify.get('', async (req, reply) => {
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const keyword = req.query.keyword || '';
        const count = await fastify.db.reviewComment.count({ where: { content: { contains: keyword } } });
        const data = await fastify.db.reviewComment.findMany({
            where: { content: { contains: keyword } },
            select: {
                id: true, content: true, reviewId: true, createdAt: true, updatedAt: true,
                user: { select: { id: true, name: true }, }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.get('/:id/comments', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const count = await fastify.db.reviewComment.count({ where: { reviewId: id } });
        const data = await fastify.db.reviewComment.findMany({
            where: { reviewId: id, },
            select: { id: true, content: true, reviewId: true, createdAt: true, updatedAt: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.post('/monkey', async (req, reply) => {
        const { userId, isAll } = req.body;
        const reviewCount = Number(req.body.reviewCount) || 10;
        const commentCount = Number(req.body.commentCount) || 10;
        const buzzwords = await fastify.db.buzzword.findMany({});
        const totalReviews = await fastify.db.review.count({ where: { allowComment: true } });
        let max = isAll ? totalReviews : Math.min(reviewCount, totalReviews);
        let limit = Math.min(max, 100);
        for (let i = 0; i < max; i += limit) {
            const reviews = await fastify.db.review.findMany({
                where: { allowComment: true },
                take: limit,
                skip: i,
                orderBy: { createdAt: 'desc' }, // created_at 不会变化
                select: { id: true },
            });
            for (const review of reviews) {
                for (let j = 0; j < commentCount; j++) {
                    let data = {
                        content: buzzwords[Math.floor(Math.random() * buzzwords.length)].content,
                        userId: Number(userId),
                        reviewId: review.id,
                    };
                    data = await fastify.db.reviewComment.create({ data });
                    // Create timeline
                    await fastify.db.timeline.create({ data: { userId: Number(userId), targetId: data.id, target: 'ReviewComment', } });
                }
            }
        }
        return reply.code(201).send();
    });
};

export default reviewComments;
