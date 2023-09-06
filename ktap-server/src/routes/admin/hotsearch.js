import { Pagination } from "../../constants.js";

const hotsearch = async function (fastify, opts) {
    fastify.delete('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        await fastify.db.hotSearch.delete({ where: { id }, });
        return reply.code(204).send();
    });

    fastify.get('', async (req, reply) => {
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const keyword = req.query.keyword || '';
        const count = await fastify.db.hotSearch.count({ where: { content: { contains: keyword } } });
        const data = await fastify.db.hotSearch.findMany({
            where: { content: { contains: keyword } },
            select: {
                id: true, content: true, hitCount: true, createdAt: true, updatedAt: true,
            },
            orderBy: [{ hitCount: 'desc' }, { createdAt: 'desc' }],
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.post('', async (req, reply) => {
        const { content, hitCount } = req.body;
        const data = await fastify.db.hotSearch.create({
            data: {
                content, hitCount: Number(hitCount) || 0,
            }
        });
        return reply.code(200).send({ data });
    });

    fastify.put('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { content, hitCount } = req.body;
        await fastify.db.hotSearch.update({
            where: { id },
            data: {
                content, hitCount: Number(hitCount) || 0,
            }
        });
        return reply.code(204).send();
    });
};

export default hotsearch;
