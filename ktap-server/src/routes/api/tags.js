import { AppMedia, LIMIT_CAP, TagCategory } from "../../constants.js";

const tags = async (fastify, opts) => {
    fastify.get('/:name', async function (req, reply) {
        const name = req.params.name;
        const flavor = req.query.flavor;
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const skip = Math.max(0, Number(req.query.skip) || 0);

        const theTag = (await fastify.db.tag.findMany({ where: { name }, take: 1 }))[0]; // name is unique

        let data = [];
        let count = 0;
        if (theTag) {
            const dbCondition = {
                where: { isVisible: true, },
                take: limit, skip,
                select: {
                    id: true, name: true, slogan: true, summary: true, score: true, releasedAt: true, createdAt: true, updatedAt: true,
                    media: {
                        where: { usage: AppMedia.usage.landscape },
                        select: { image: true, thumbnail: true },
                    },
                },
            };
            switch (theTag.category) {
                case TagCategory.genre: {
                    count = await fastify.db.appGenreRef.count({ where: { tagId: theTag.id } });
                    dbCondition.where.genres = { some: { tagId: theTag.id } };
                    dbCondition.select.genres = {
                        select: { tag: { select: { name: true, colorHex: true } }, },
                        take: 3,
                    };
                    break;
                }
                case TagCategory.feature: {
                    count = await fastify.db.appFeatureRef.count({ where: { tagId: theTag.id } });
                    dbCondition.where.features = { some: { tagId: theTag.id } };
                    dbCondition.select.features = {
                        select: { tag: { select: { name: true, colorHex: true } }, },
                        take: 3,
                    }
                    break;
                }
                default: {
                    count = await fastify.db.appUserTagRef.count({ where: { tagId: theTag.id } });
                    dbCondition.where.tags = { some: { tagId: theTag.id } };
                    dbCondition.select.tags = {
                        select: { tag: { select: { name: true, colorHex: true } }, },
                        orderBy: { createdAt: 'desc' },
                        take: 3,
                    }
                    break;
                }
            }
            switch (flavor) {
                case 'by-new': dbCondition.orderBy = { createdAt: 'desc' }; break;// 按时间
                case 'by-score': dbCondition.orderBy = { score: 'desc' }; break;  // 按评分 by-score
                case 'by-hot': // 按热度(default)，简单的算法就是热度按照评测最多排序
                default: dbCondition.orderBy = { reviews: { _count: 'desc' } }; break;
            }
            data = await fastify.db.app.findMany(dbCondition);
        }

        data.forEach(app => {
            app.media = {
                landscape: app.media.map(m => {
                    return { image: m.image, thumbnail: m.thumbnail };
                })[0]
            };
            if (app.tags) app.tags = app.tags.map(ref => ref.tag);
            if (app.genres) app.genres = app.genres.map(ref => ref.tag);
            if (app.features) app.features = app.features.map(ref => ref.tag);

        });

        return reply.code(200).send({ data, count, skip, limit });
    });

    fastify.get('/genres', async function (req, reply) {
        const data = await fastify.db.tag.findMany({ where: { category: TagCategory.genre } });
        return reply.code(200).send({ data });
    });

    fastify.get('/features', async function (req, reply) {
        const data = await fastify.db.tag.findMany({ where: { category: TagCategory.feature } });
        return reply.code(200).send({ data });
    });

    fastify.get('/hot', async function (req, reply) {
        const data = await fastify.db.$queryRaw`
            SELECT id, name, color_hex AS colorHex, count(*) AS count FROM
            AppUserTagRef, Tag WHERE AppUserTagRef.tag_id = Tag.id
            GROUP BY id ORDER BY count DESC LIMIT 20
        `;
        return reply.code(200).send({ data });
    });
};

export default tags;
