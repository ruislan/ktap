import { LIMIT_CAP } from "../../constants.js";

const gifts = async function (fastify, opts) {
    fastify.delete('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const countReviewGiftRef = await fastify.db.reviewGiftRef.count({ where: { giftId: id } });
        const countTradingGiftRef = await fastify.db.trading.count({ where: { targetId: id, target: 'Gift' } });
        if (countReviewGiftRef > 0 || countTradingGiftRef > 0) return reply.code(412).send(); // code 412 Precondition Failed
        await fastify.db.gift.delete({ where: { id }, });
        return reply.code(204).send();
    });

    fastify.get('', async (req, reply) => {
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const keyword = req.query.keyword || '';
        const count = await fastify.db.gift.count({ where: { description: { contains: keyword } } });
        const data = await fastify.db.gift.findMany({
            where: { description: { contains: keyword } },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.post('', async (req, reply) => {
        const { name, description, price, url } = req.body;
        const data = await fastify.db.gift.create({
            data: {
                name,
                description,
                price: Number(price) || 0,
                url,
            }
        });
        return reply.code(200).send({ data });
    });

    fastify.put('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { name, description, price, url } = req.body;
        await fastify.db.gift.update({
            where: { id },
            data: {
                name,
                description,
                price: Number(price) || 0,
                url,
            }
        });
        return reply.code(204).send();
    });
};

export default gifts;
