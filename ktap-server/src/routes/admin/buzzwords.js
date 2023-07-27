import { Pagination } from "../../constants.js";

const buzzwords = async function (fastify, opts) {
    fastify.delete('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        await fastify.db.buzzword.delete({ where: { id }, });
        return reply.code(204).send();
    });

    fastify.get('', async (req, reply) => {
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const keyword = req.query.keyword || '';
        const count = await fastify.db.buzzword.count({ where: { content: { contains: keyword } } });
        const data = await fastify.db.buzzword.findMany({
            where: { content: { contains: keyword } },
            select: {
                id: true, content: true, weight: true, createdAt: true, updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.post('', async (req, reply) => {
        const { content, weight } = req.body;
        const data = await fastify.db.buzzword.create({
            data: {
                content, weight: Number(weight) || 0,
            }
        });
        return reply.code(200).send({ data });
    });

    fastify.put('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { content, weight } = req.body;
        await fastify.db.buzzword.update({
            where: { id },
            data: {
                content, weight: Number(weight) || 0,
            }
        });
        return reply.code(204).send();
    });
};

export default buzzwords;
