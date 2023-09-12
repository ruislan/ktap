import { AppMedia, Pagination } from '../../constants.js';

const ranks = async (fastify, opts) => {
    const CACHE_EXPIRE = 20 * 60 * 1000;
    const TOP_LIMIT = 100; // 缓存直接 100 个全取出来，数据量不大

    const getAppListOrderBy = async function (orderBy) {
        const data = await fastify.app.getAppsOrderBy({ orderBy, limit: TOP_LIMIT });
        data.forEach(app => {
            app.media = {
                head: {
                    image: app.media[0].image,
                    thumbnail: app.media[0].thumbnail,
                }
            }
        });
        return data;
    };

    const parseQuery = (query) => {
        const { skip, limit } = Pagination.parse(query.skip, query.limit);
        let take = skip + limit >= TOP_LIMIT ? TOP_LIMIT - skip : limit;
        return { limit, skip, take };
    }

    // 按最佳排序
    fastify.get('/apps/best', async function (req, reply) {
        const { limit, skip, take } = parseQuery(req.query);
        const data = await fastify.caching.get('ranks_app_best100', async () => await getAppListOrderBy({ score: 'desc' }), CACHE_EXPIRE);
        return reply.code(200).send({ data: data.slice(skip, skip + take), count: data.length, skip, limit });
    });

    // 按最差的排序
    fastify.get('/apps/worst', async function (req, reply) {
        const { limit, skip, take } = parseQuery(req.query);
        const data = await fastify.caching.get('ranks_app_worst100', async () => await getAppListOrderBy({ score: 'asc' }), CACHE_EXPIRE);
        return reply.code(200).send({ data: data.slice(skip, skip + take), count: data.length, skip, limit });
    });

    // 按最新排序
    fastify.get('/apps/newest', async function (req, reply) {
        const { limit, skip, take } = parseQuery(req.query);
        const data = await fastify.caching.get('ranks_app_newest100', async () => await getAppListOrderBy({ createdAt: 'desc' }), CACHE_EXPIRE);
        return reply.code(200).send({ data: data.slice(skip, skip + take), count: data.length, skip, limit });
    });

    // 按最热排序
    // 评论最多的
    fastify.get('/apps/hottest', async function (req, reply) {
        const { limit, skip, take } = parseQuery(req.query);
        const data = await fastify.caching.get('ranks_app_hottest100', async () => await getAppListOrderBy({ reviews: { _count: 'desc' } }), CACHE_EXPIRE);
        return reply.code(200).send({ data: data.slice(skip, skip + take), count: data.length, skip, limit });
    });

    // 游戏最多的厂商
    fastify.get('/organizations/best', async function (req, reply) {
        const { limit, skip, take } = parseQuery(req.query);

        const data = await fastify.caching.get('ranks_org_best100', async () => {
            const orgs = await fastify.db.organization.findMany({
                select: {
                    id: true, name: true, logo: true, summary: true,
                    _count: {
                        select: {
                            publishedApps: true,
                            developedApps: true,
                        }
                    }
                },
                orderBy: [{ developedApps: { _count: 'desc' } }, { publishedApps: { _count: 'desc' } }],
                take: TOP_LIMIT
            });
            orgs.forEach(org => {
                org.meta = { published: org._count.publishedApps, developed: org._count.developedApps, };
                delete org._count;
            });
            return orgs;
        }, CACHE_EXPIRE);

        return reply.code(200).send({ data: data.slice(skip, skip + take), count: data.length, skip, limit });
    });
};

export default ranks;
