import { AppMedia, Pagination } from "../../constants.js";

const search = async function (fastify, opts) {
    // 获取App热词
    fastify.get('/hot', async function (req, res) {
        const data = await fastify.db.hotSearch.findMany({
            orderBy: { hitCount: 'desc' },
            take: 20,
        });
        res.code(200).send({ data });
    });

    // 搜索App
    fastify.get('/apps', async function (req, reply) {
        let { keyword } = req.query;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        let whereClause = {
            isVisible: true,
        };
        if (keyword) whereClause.OR = [
            { name: { contains: keyword } },
            { summary: { contains: keyword } },
        ];
        const count = await fastify.db.app.count({ where: whereClause });
        let data = await fastify.db.app.findMany({
            where: whereClause,
            skip,
            take: limit,
            include: {
                media: {
                    where: { usage: AppMedia.usage.landscape },
                    select: {
                        image: true,
                        thumbnail: true,
                    },
                },
                tags: {
                    include: {
                        tag: {
                            select: { name: true, category: true, colorHex: true, }
                        }
                    },
                    take: 3,
                }
            },
        });

        // 转变data for view
        data = data.map(item => {
            return {
                id: item.id,
                name: item.name,
                summary: item.summary,
                score: item.score,
                tags: item.tags.map(tagRef => tagRef.tag),
                media: {
                    landscape: item.media.map(m => {
                        return {
                            image: m.image,
                            thumbnail: m.thumbnail,
                        };
                    })[0] // 系统硬性规定：landscape至少要有一个
                }
            };
        });

        // 存储查询热词，只存储非空关键词和有效搜索
        if (data.length > 0 && keyword.length > 0) {
            await fastify.db.hotSearch.upsert({
                where: { content: keyword },
                create: {
                    content: keyword,
                    hitCount: 1,
                },
                update: {
                    hitCount: {
                        increment: 1,
                    }
                }
            })
        }
        return reply.code(200).send({ data, count, skip, limit });
    });
};

export default search;
