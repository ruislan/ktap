import { Pagination } from "../../constants.js";

const organizations = async function (fastify, opts) {
    fastify.delete('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const countPub = await fastify.db.appPublisherRef.count({ where: { organizationId: id } });
        const countDev = await fastify.db.appDeveloperRef.count({ where: { organizationId: id } });
        if (countPub > 0 || countDev > 0) return reply.code(412).send(); // 412 Precondition Failed 先决条件不满足
        await fastify.db.organization.delete({ where: { id }, });
        return reply.code(204).send();
    });

    fastify.get('', async (req, reply) => {
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        const keyword = req.query.keyword || '';
        const whereCondition = {};
        if (keyword.length > 0) {
            whereCondition.OR = [
                { name: { contains: keyword } },
                { summary: { contains: keyword } },
            ];
        }
        const count = await fastify.db.organization.count({ where: whereCondition });
        const data = await fastify.db.organization.findMany({
            where: whereCondition,
            include: {
                user: { select: { id: true, name: true } },
                _count: {
                    select: {
                        publishedApps: true,
                        developedApps: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        data.forEach(item => {
            item.meta = { published: item._count.publishedApps, developed: item._count.developedApps, };
            delete item._count;
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.get('/all', async function (req, reply) {
        const data = await fastify.db.organization.findMany({
            select: {
                id: true, name: true, summary: true, logo: true,
            }
        });
        return reply.code(200).send({ data });
    });

    fastify.post('', async (req, reply) => {
        const { name, summary, logo, site, type, country, userId } = req.body;
        await fastify.db.organization.create({
            data: {
                name, summary, logo, site, type, country, userId: Number(userId) || null,
            }
        });
        return reply.code(201).send();
    });

    fastify.put('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { name, summary, logo, site, type, country, userId } = req.body;
        await fastify.db.organization.update({
            where: { id },
            data: {
                name, summary, logo, site, type, country, userId: Number(userId) || 0,
            }
        });
        return reply.code(204).send();
    });
};

export default organizations;
