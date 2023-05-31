import { AppMedia, LIMIT_CAP } from "../../constants.js";

const news = async (fastify, opts) => {
    fastify.get('/:id', async function (req, reply) {
        const id = Number(req.params.id);
        const data = await fastify.db.organization.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        publishedApps: true,
                        developedApps: true,
                    }
                }
            }
        });
        if (!data) return reply.code(404).send(); // not found
        const meta = { published: data._count.publishedApps, developed: data._count.developedApps, };
        delete data._count;
        return reply.code(200).send({ data, meta });
    });

    fastify.get('/:id/apps/published', async function (req, reply) {
        const id = Number(req.params.id);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const count = await fastify.db.appPublisherRef.count({ where: { organizationId: id } });
        const refs = await fastify.db.appPublisherRef.findMany({
            where: { organizationId: id },
            select: {
                app: {
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
                }
            },
            take: limit,
            skip,
        });
        const data = refs.map(ref => {
            ref.app.media = {
                head: {
                    image: ref.app.media[0].image,
                    thumbnail: ref.app.media[0].thumbnail,
                }
            }
            return ref.app;
        });
        return reply.code(200).send({ data, count, skip, limit });
    });

    fastify.get('/:id/apps/developed', async function (req, reply) {
        const id = Number(req.params.id);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const count = await fastify.db.appDeveloperRef.count({ where: { organizationId: id } });
        const refs = await fastify.db.appDeveloperRef.findMany({
            where: { organizationId: id },
            select: {
                app: {
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
                }
            },
            take: limit,
            skip,
        });
        const data = refs.map(ref => {
            ref.app.media = {
                head: {
                    image: ref.app.media[0].image,
                    thumbnail: ref.app.media[0].thumbnail,
                }
            }
            return ref.app;
        });
        return reply.code(200).send({ data, count, skip, limit });
    });
};

export default news;
