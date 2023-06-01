import { Pages } from '../../constants.js';

const discover = async function (fastify, opts) {
    fastify.delete('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        await fastify.db.pageWidget.delete({ where: { id }, });
        return reply.code(204).send();
    });

    fastify.get('', async (req, reply) => {
        const widgets = await fastify.db.pageWidget.findMany({
            where: { page: Pages.discover, },
            select: { id: true, title: true, type: true, style: true, target: true, targetIds: true, }
        });
        return reply.code(200).send({ data: widgets });
    });

    fastify.post('', async (req, reply) => {
        const { title, type, style, target, targetIds } = req.body;
        const data = await fastify.db.pageWidget.create({
            data: {
                page: Pages.discover, title, type, style, target, targetIds,
            }
        });
        return reply.code(200).send({ data });
    });

    fastify.put('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { title, type, style, target, targetIds } = req.body;
        await fastify.db.pageWidget.update({
            where: { id },
            data: {
                title, type, style, target, targetIds,
            }
        });
        return reply.code(200).send();
    });
};

export default discover;
