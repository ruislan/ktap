import { AppMedia, LIMIT_CAP, REVIEW_IMAGE_COUNT_LIMIT, TagCategory } from "../../constants.js";
import { authenticate } from "../../lib/auth.js";

const apps = async function (fastify, opts) {
    // app推荐列表
    // 用于首页推荐展示，app会按照推荐进行排序，然后展示
    // 根据首页元素，只会展示有限的App的信息
    // XXX 推荐算法，目前最简单的算法就是按照打分排序，后续会有更多个性化以及更多因子影响的推荐算法。
    fastify.get('/recommended', async function (req, reply) {
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const skip = Math.max(0, Number(req.query.skip) || 0);

        let cachedData = fastify.caching.apps.get(`recommended_${skip}_${limit}`);
        if (!cachedData) {
            const count = await fastify.db.app.count();
            const apps = await fastify.db.app.findMany({
                where: { isVisible: true, },
                include: {
                    media: {
                        where: { usage: AppMedia.usage.landscape },
                        select: { image: true, thumbnail: true, },
                    },
                },
                orderBy: [{ score: 'desc' }, { updatedAt: 'desc' }],
                take: limit,
                skip,
            });
            // transform data to the form that suite the view
            const data = [];
            for await (const item of apps) {
                const app = {
                    id: item.id, name: item.name, slogan: item.slogan, summary: item.summary, score: item.score,
                    media: {
                        landscape: item.media.map(m => {
                            return {
                                image: m.image,
                                thumbnail: m.thumbnail,
                            };
                        })[0] // 系统硬性规定：landscape至少要有一个
                    }
                };
                try {
                    app.tags = await fastify.db.$queryRaw`
                    SELECT id, name, color_hex AS colorHex, count(*) AS count FROM
                    AppUserTagRef, Tag WHERE AppUserTagRef.app_id = ${item.id} AND AppUserTagRef.tag_id = Tag.id
                    GROUP BY id ORDER BY count DESC LIMIT 5
                `;
                    app.tags.forEach(tag => tag.count = Number(tag.count));
                } catch {
                    app.tags = [];
                }
                data.push(app);
            }
            cachedData = { data, count, skip, limit };
            fastify.caching.apps.set(`recommended_${skip}_${limit}`, cachedData, 5 * 60 * 1000);
        }
        return reply.code(200).send(cachedData);
    });

    // 最近更新
    // 用于首页侧边展示
    fastify.get('/by-updated', async function (req, reply) {
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 8)));

        let cachedData = fastify.caching.apps.get(`by_updated_${limit}`);
        if (!cachedData) {
            cachedData = await fastify.db.app.findMany({
                where: { isVisible: true, },
                orderBy: [{ updatedAt: 'desc' }],
                include: {
                    media: {
                        where: { usage: AppMedia.usage.landscape },
                        select: { image: true, thumbnail: true, },
                    }
                },
                take: limit,
            });
            // transform data to the form that suite the view
            cachedData = cachedData.map(item => {
                return {
                    id: item.id, name: item.name, slogan: item.slogan, summary: item.summary, score: item.score,
                    media: {
                        landscape: item.media.map(m => ({ image: m.image, thumbnail: m.thumbnail, }))[0]
                    }
                };
            });
            fastify.caching.apps.set(`by_updated_${limit}`, cachedData, 5 * 60 * 1000);
        }

        return reply.code(200).send({ data: cachedData, limit });
    });

    // 最多评价
    // 用于首页侧边展示
    // 通过聚合SQL直接查询，最后取前limit个，直接展示
    // 优点：无需额外字段和操作，每次都能得到及时数据；缺点：数据量较大时开销较大，必须采用缓存等相关技术来提升性能
    fastify.get('/by-review', async function (req, reply) {
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 8)));

        let cachedData = fastify.caching.apps.get(`by_review_${limit}`);
        if (!cachedData) {
            cachedData = await fastify.db.app.findMany({
                where: { isVisible: true, },
                include: {
                    media: {
                        where: { usage: AppMedia.usage.landscape },
                        select: { image: true, thumbnail: true, },
                    },
                    _count: {
                        select: { reviews: true, }
                    }
                },
                orderBy: [{ reviews: { _count: 'desc' } }],
                take: limit,
            });
            // transform data to the form that suite the view
            cachedData = cachedData.map(item => {
                return {
                    id: item.id, name: item.name, slogan: item.slogan, summary: item.summary, score: item.score,
                    media: {
                        landscape: item.media.map(m => ({ image: m.image, thumbnail: m.thumbnail, }))[0]
                    },
                    meta: {
                        reviews: item._count.reviews
                    }
                };
            });
            fastify.caching.apps.set(`by_review_${limit}`, cachedData, 5 * 60 * 1000);
        }
        return reply.code(200).send({ data: cachedData, limit });
    });

    // 热门游戏
    // 用于首页侧边展示
    // XXX 热度算法，目前采用最简单的办法，最近一次的评价的时间和当前时间的越近，热度越高，后续会有更多因子影响的算法。
    // XXX 尽量避免这种靠数据库来计算的方式
    fastify.get('/by-hot', async function (req, reply) {
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 8)));

        let cachedData = fastify.caching.apps.get(`by_hot_${limit}`);
        if (!cachedData) {
            cachedData = await fastify.db.$queryRaw`
                SELECT a.*, am.image, am.thumbnail FROM
                (SELECT a.*, max(r.updated_at) AS latest_updated FROM App a LEFT JOIN Review r ON a.id = r.app_id GROUP BY a.id LIMIT ${limit}) a
                LEFT JOIN AppMedia am ON a.id = am.app_id WHERE a.is_visible=${true} AND am.usage = ${AppMedia.usage.landscape}
                ORDER BY a.latest_updated DESC
            `;
            // transform data to the form that suite the view
            cachedData = cachedData.map(item => {
                return {
                    id: item.id, name: item.name, slogan: item.slogan, summary: item.summary, score: item.score,
                    media: {
                        landscape: { image: item.image, thumbnail: item.thumbnail, }
                    }
                };
            });
            fastify.caching.apps.set(`by_hot_${limit}`, cachedData, 5 * 60 * 1000);
        }
        return reply.code(200).send({ data: cachedData, limit });
    });

    // app的信息
    fastify.get('/:id/basic', async function (req, reply) {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.app.findUnique({
            where: { id },
            select: {
                id: true, name: true, isVisible: true, slogan: true, summary: true, score: true,
                media: {
                    where: { usage: AppMedia.usage.head },
                    select: { image: true, thumbnail: true, },
                },
            }
        });
        if (!data || !data.isVisible) return reply.code(404).send();
        data.media = { head: data.media.map(m => ({ image: m.image, thumbnail: m.thumbnail, }))[0] };
        return reply.code(200).send({ data });
    });

    fastify.get('/:id', async function (req, reply) {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.app.findUnique({
            where: { id },
            include: {
                media: true,
                awards: { select: { image: true, url: true } },
                languages: { select: { text: true, audio: true, caption: true } },
                socialLinks: { select: { brand: true, name: true, url: true, } },
                proReviews: { select: { name: true, summary: true, score: true, url: true, } },
                platforms: true,
                genres: {
                    include: {
                        tag: {
                            select: { name: true, colorHex: true, }
                        },
                    },
                },
                features: {
                    include: {
                        tag: {
                            select: { name: true, colorHex: true, }
                        },
                    },
                },
                developers: {
                    include: {
                        organization: {
                            select: { id: true, name: true, }
                        }
                    }
                },
                publishers: {
                    include: {
                        organization: {
                            select: { id: true, name: true, }
                        }
                    }
                },
            }
        });
        if (!data || !data.isVisible) return reply.code(404).send();

        // clear output
        data.genres = data.genres.map(ref => ref.tag);
        data.features = data.features.map(ref => ref.tag);
        // get hot tags
        data.tags = await fastify.db.$queryRaw`
                    SELECT id, name, color_hex AS colorHex, count(*) AS count FROM
                    AppUserTagRef, Tag WHERE AppUserTagRef.app_id = ${id} AND AppUserTagRef.tag_id = Tag.id
                    GROUP BY id ORDER BY count DESC LIMIT 15
                `;
        data.tags.forEach(tag => tag.count = Number(tag.count));
        data.developers = data.developers.map(ref => ref.organization);
        data.publishers = data.publishers.map(ref => ref.organization);

        if (data.platforms) {
            data.platforms = data.platforms.map(p => {
                return {
                    os: p.os,
                    requirements: JSON.parse(p.requirements),
                };
            });
        }

        // get meta
        // 统计评测中的几个分段和分段占比
        const lData = (await fastify.db.$queryRaw`
                SELECT l1.cnt AS l1, l2.cnt AS l2, l3.cnt AS l3, l4.cnt AS l4, l5.cnt AS l5 FROM
                    (SELECT count(id) AS cnt FROM Review WHERE app_id = ${id} AND score = 1) AS l1,
                    (SELECT count(id) AS cnt FROM Review WHERE app_id = ${id} AND score = 2) AS l2,
                    (SELECT count(id) AS cnt FROM Review WHERE app_id = ${id} AND score = 3) AS l3,
                    (SELECT count(id) AS cnt FROM Review WHERE app_id = ${id} AND score = 4) AS l4,
                    (SELECT count(id) AS cnt FROM Review WHERE app_id = ${id} AND score = 5) AS l5;
            `)[0];
        const meta = {};
        meta.ratings = [
            { score: 1, count: Number(lData.l1) || 0 },
            { score: 2, count: Number(lData.l2) || 0 },
            { score: 3, count: Number(lData.l3) || 0 },
            { score: 4, count: Number(lData.l4) || 0 },
            { score: 5, count: Number(lData.l5) || 0 }
        ];
        meta.reviews = await fastify.db.review.count({ where: { appId: id, } });
        meta.follows = await fastify.db.followApp.count({ where: { appId: id, } });

        // 当前热力指数计算非常简单，通过加权算法来计算最近 1 周的数值，评测*10 + 关注*2 + 回复*1
        const limitDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const hotOriginData = (await fastify.db.$queryRaw`
                SELECT p1.cnt AS p1, p2.cnt AS p2, p3.cnt AS p3 FROM
                    (SELECT count(id) AS cnt FROM Review WHERE app_id = ${id} AND created_at >= ${limitDate}) AS p1,
                    (SELECT count(id) AS cnt FROM FollowApp WHERE app_id = ${id} AND created_at >= ${limitDate}) AS p2,
                    (SELECT count(id) AS cnt FROM ReviewComment WHERE review_id in (SELECT id FROM Review WHERE app_id = ${id} AND created_at >= ${limitDate})) AS p3;
            `)[0];
        meta.popular = Number(hotOriginData.p1) * 10 + Number(hotOriginData.p2) * 2 + Number(hotOriginData.p3) * 1;
        return reply.code(200).send({ data, meta });
    });

    // 相关联的游戏
    // XXX v1（已经弃用）采用简单的算法，通过该游戏的标签，返回同标签的游戏
    // XXX v1.2 采用简单的算法，通过查询游戏的名称，将名称分词，取前三个，然后将这三个用于SQL进行查询，如果没有找到，则查询最近更新的
    fastify.get('/:id/related', async function (req, reply) {
        const id = Number(req.params.id) || 0;
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 8)));
        let data = {};
        if (id > 0) {
            const app = await fastify.db.app.findUnique({ where: { id }, select: { name: true } });
            const extractWords = await fastify.jieba.extract(app.name, 3);
            data = await fastify.db.app.findMany({
                where: {
                    OR: [
                        ...extractWords.map(item => ({ name: { contains: item.word } })),
                        ...extractWords.map(item => ({ description: { contains: item.word } })),
                    ],
                    AND: { id: { not: id } },
                },
                include: {
                    media: {
                        where: { usage: AppMedia.usage.landscape },
                        select: {
                            image: true,
                            thumbnail: true,
                        },
                    },
                },
                take: limit,
            });
        }
        if (data.length === 0) { // 如果没有相关的，则直接取最新的几个
            data = await fastify.db.app.findMany({
                where: { id: { not: id } },
                include: {
                    media: {
                        where: { usage: AppMedia.usage.landscape },
                        select: {
                            image: true,
                            thumbnail: true,
                        },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                take: limit,
            })
        }
        // transform data to the form that suite the view
        data = data.map(item => {
            return {
                id: item.id,
                name: item.name,
                slogan: item.slogan,
                summary: item.summary,
                score: item.score,
                media: {
                    landscape: item.media.map(m => {
                        return {
                            image: m.image,
                            thumbnail: m.thumbnail,
                        };
                    })[0]
                },
            };
        });
        return reply.code(200).send({ data });
    });

    // 游戏相关新闻
    fastify.get('/:id/news', async function (req, reply) {
        const id = Number(req.params.id) || 0;
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 2)));
        const data = await fastify.db.news.findMany({
            where: { appId: id },
            take: limit,
        })
        return reply.code(200).send({ data, });
    });

    // 用户给这个游戏应用打的标签
    fastify.get('/:id/tags/by-me', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const id = Number(req.params.id) || 0;
            const userId = req.user?.id;
            const data = {
                frequent: [],
                current: [],
            };
            if (userId) {
                // 用户常用的10个
                let userFrequentTags = await fastify.db.$queryRaw`
                    SELECT id, name, color_hex AS colorHex, count(*) AS count FROM AppUserTagRef, Tag
                    WHERE AppUserTagRef.user_id = ${userId} AND AppUserTagRef.tag_id = Tag.id
                    GROUP BY id ORDER BY count DESC LIMIT 10;
                `;
                userFrequentTags.forEach(item => item.count = Number(item.count));

                data.frequent = userFrequentTags;

                // 为当前游戏打的标签
                let userCurrentTags = await fastify.db.appUserTagRef.findMany({
                    where: { userId: userId, appId: id },
                    include: { tag: { select: { id: true, name: true, colorHex: true } }, }
                });
                userCurrentTags = userCurrentTags.map(item => item.tag);
                data.current = userCurrentTags;
            }
            return reply.code(200).send({ data });
        }
    });

    fastify.post('/:id/tags', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const appId = Number(req.params.id) || 0;
            const userId = req.user.id;
            const { name } = req.body;
            let theTag = await fastify.db.tag.findUnique({ where: { name } });
            if (!theTag) theTag = await fastify.db.tag.create({ data: { name } });
            // 用户可能输入了类型或者功能相同的词，要排除掉，这些词是不需要标记的
            // XXX 这个地方带来了思考，genre和features是否都算在Tag中？还是将它们拆分出来？
            if (theTag.category === TagCategory.normal) await fastify.db.appUserTagRef.upsert({ create: { appId, userId, tagId: theTag.id }, update: {}, where: { appId_userId_tagId: { userId, appId, tagId: theTag.id } } });
            return reply.code(200).send({ id: theTag.id });
        }
    });

    fastify.delete('/:id/tags/:name', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const appId = Number(req.params.id) || 0;
            const userId = req.user.id;
            const tagName = req.params.name || '';
            const tag = await fastify.db.tag.findUnique({ where: { name: tagName }, select: { id: true } });
            if (tag?.id) await fastify.db.appUserTagRef.delete({ where: { appId_userId_tagId: { userId, appId, tagId: tag.id } } });
            return reply.code(204).send();
        }
    });

    // 用户提交评测（一个用户一个APP只能有一个评测，再有就是修改）
    fastify.post('/:id/reviews', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const appId = Number(req.params.id) || 0;
            const userId = req.user.id;
            const parts = req.parts();
            const reqBody = { images: [] };
            for await (const part of parts) {
                if (part.file) {
                    const buffer = await part.toBuffer();
                    const url = await fastify.storage.store(part.filename, buffer);
                    reqBody.images.push(url);
                } else {
                    reqBody[part.fieldname] = part.value;
                }
            }
            // 处理一下超过三张图片的情况
            if (reqBody.images.length > REVIEW_IMAGE_COUNT_LIMIT) reqBody.images = reqBody.images.slice(0, REVIEW_IMAGE_COUNT_LIMIT);
            let data = {
                content: reqBody.content || '',
                score: Number(reqBody.score) || 3,
                allowComment: 'true' === (reqBody.allowComment || 'false').toLowerCase(),
                images: {
                    create: reqBody.images.map(url => { return { url } }),
                }
            };
            const reviews = await fastify.db.review.findMany({ where: { appId, userId }, select: { id: true }, take: 1 });
            if (!reviews[0]?.id) data = await fastify.db.review.create({ data: { appId, userId, ...data, } });

            // XXX 非必要每次评测都更新，定时刷新App的评分或者发出重新评分异步指令即可
            // 更新评分
            await fastify.db.$queryRaw`
                UPDATE App SET score = avgScore FROM
                (SELECT COALESCE(AVG(score), 4) AS avgScore FROM review WHERE app_id = ${appId})
                WHERE App.id = ${appId};
            `;

            // Update timeline if it created a new review
            if (!reviews[0]?.id) {
                await fastify.db.timeline.create({ data: { userId, targetId: data.id, target: 'Review', } });
            }
            // reconstruct return data structure
            data.images = reqBody.images.map(url => { return { url } });
            delete data.appId;
            delete data.userId;
            return reply.code(200).send({ data });
        }
    });

    // 获取热门评测内容
    // 简单算法：热门评测是回复最多的
    fastify.get('/:id/reviews', async function (req, reply) {
        const appId = Number(req.params.id) || 0;
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const skip = Math.max(0, Number(req.query.skip) || 0);

        const count = await fastify.db.review.count({ where: { appId, } });
        const data = await fastify.db.review.findMany({
            where: { appId, },
            include: {
                _count: { select: { comments: true, gifts: true } },
                comments: {
                    select: {
                        id: true,
                        content: true,
                        user: { select: { id: true, name: true, avatar: true, gender: true, title: true } },
                    },
                    take: 1,
                    orderBy: { updatedAt: 'desc' }
                },
                user: { select: { id: true, name: true, avatar: true, gender: true, title: true } },
                images: { select: { url: true } },
            },
            orderBy: { comments: { _count: 'desc' } },
            take: limit,
            skip,
        });
        // XXX 这里读取数据库有点多了，看怎么减少一下
        for await (const item of data) {
            const gifts = await fastify.db.$queryRaw`
                SELECT Gift.id, Gift.name, Gift.description, Gift.url, Gift.price, count(ReviewGiftRef.user_id) AS count FROM ReviewGiftRef, Gift
                WHERE Gift.id = ReviewGiftRef.gift_id AND review_id = ${item.id} GROUP BY ReviewGiftRef.gift_id;
            `;

            // 获取赞踩数量
            const thumbs = (await fastify.db.$queryRaw`
                SELECT (SELECT count(*) FROM ReviewThumb WHERE direction = 'up' AND review_id = ${item.id}) AS ups,
                (SELECT count(*) FROM ReviewThumb WHERE direction = 'down' AND review_id = ${item.id}) AS downs
            `)[0];
            item.gifts = gifts;
            item.meta = { comments: item._count.comments, gifts: item._count.gifts, ups: thumbs?.ups || 0, downs: thumbs?.downs || 0 };

            delete item._count;
            delete item.userId;
            delete item.appId;
        };
        return reply.code(200).send({ data, count, skip, limit });
    });

    // 用户给这个游戏写的评测
    fastify.get('/:id/reviews/by-me', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const id = Number(req.params.id) || 0;
            const userId = req.user?.id;
            let data = {};
            if (userId) {
                data = (await fastify.db.review.findMany({
                    where: { userId: userId, appId: id },
                    include: {
                        images: {
                            select: { id: true, url: true },
                        }
                    },
                    take: 1
                }))[0];
            }
            return reply.code(200).send({ data });
        }
    });
};

export default apps;
