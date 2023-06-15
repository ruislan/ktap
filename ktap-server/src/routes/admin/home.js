import { Trading } from '../../constants.js';

const home = async function (fastify, opts) {
    fastify.get('/', async function (req, reply) { return { version: '1.0.0' }; });
    fastify.get('/stats', async function (req, reply) {
        const days = Math.max(3, Number(req.query.days) || 3);
        const data = {};
        const limitDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        data.apps = await fastify.db.app.count({ where: { createdAt: { gte: limitDate, } }, });
        data.users = await fastify.db.user.count({ where: { createdAt: { gte: limitDate, } }, });
        data.reviews = await fastify.db.review.count({ where: { createdAt: { gte: limitDate, } }, });
        data.comments = await fastify.db.reviewComment.count({ where: { createdAt: { gte: limitDate, } }, });
        data.gifts = await fastify.db.gift.count({ where: { createdAt: { gte: limitDate, } }, });
        data.reports = await fastify.db.reviewReport.count({ where: { createdAt: { gte: limitDate, } }, });
        const amount = await fastify.db.trading.aggregate({
            where: {
                createdAt: {
                    gte: limitDate,
                },
                type: Trading.type.buy,
            },
            _sum: {
                amount: true,
            }
        });
        data.amount = amount._sum.amount || 0;

        return reply.code(200).send({ data });
    });
};

export default home;
