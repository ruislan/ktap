import { Pagination } from "../../constants.js";

const users = async function (fastify, opts) {
    fastify.get('', async (req, reply) => {
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        const keyword = req.query.keyword || '';
        const isFeature = (req.query.isFeature || 'true').toLowerCase() === 'true';
        const isGenre = (req.query.isGenre || 'true').toLowerCase() === 'true';
        const isNormal = (req.query.isNormal || 'true').toLowerCase() === 'true';

        const whereCondition = {};
        if (keyword.length > 0) whereCondition.name = { contains: keyword };
        whereCondition.OR = [];
        if (isFeature) whereCondition.OR.push({ category: 'feature' });
        if (isGenre) whereCondition.OR.push({ category: 'genre' });
        if (isNormal) whereCondition.OR.push({ category: 'normal' });
        if (whereCondition.OR.length === 0) delete whereCondition.OR;

        const count = await fastify.db.tag.count({ where: whereCondition });
        const data = await fastify.db.tag.findMany({
            where: whereCondition,
            select: {
                id: true, name: true, colorHex: true, category: true, createdAt: true, updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.delete('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const tag = await fastify.db.tag.findUnique({ where: { id } });
        if (tag) {
            await fastify.db.$transaction([
                fastify.db.appGenreRef.deleteMany({ where: { tagId: tag.id } }),
                fastify.db.appFeatureRef.deleteMany({ where: { tagId: tag.id } }),
                fastify.db.appUserTagRef.deleteMany({ where: { tagId: tag.id } }),
                fastify.db.tag.delete({ where: { id } })
            ]);
        }
        return reply.code(204).send();
    });

    fastify.post('', async (req, reply) => {
        const { name, category } = req.body;
        await fastify.db.tag.create({
            data: { name, category, }
        });
        return reply.code(201).send();
    });

    fastify.put('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { name, category } = req.body;
        await fastify.db.tag.update({
            where: { id },
            data: { name, category, }
        });
        return reply.code(204).send();
    });
};

export default users;
