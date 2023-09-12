import { AppMedia, Notification, Pagination, REVIEW_CONTENT_LIMIT, REVIEW_IMAGE_COUNT_LIMIT, TagCategory } from "../../constants.js";
import { authenticate } from "../../lib/auth.js";

const apps = async function (fastify, opts) {
    // app推荐列表
    // 用于首页推荐展示，app会按照推荐进行排序，然后展示
    // 根据首页元素，只会展示有限的App的信息
    // XXX 推荐算法，目前最简单的算法就是按照打分排序，后续会有更多个性化以及更多因子影响的推荐算法。
    fastify.get('/recommended', async function (req, reply) {
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const data = await fastify.caching.get(`apps_recommended_${skip}_${limit}`, async () => {
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
            // transform data
            const theData = [];
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
                    app.tags = await fastify.tag.getTagsByHot({ id: item.id, limit: 5, type: 'app' });
                } catch {
                    app.tags = [];
                }
                theData.push(app);
            }
            return { data: theData, count, skip, limit };
        });

        return reply.code(200).send(data);
    });

    // 最近更新
    // 用于首页侧边展示
    fastify.get('/by-updated', async function (req, reply) {
        const { limit } = Pagination.parse(0, req.query.limit);

        const data = await fastify.caching.get(`apps_by_updated_${limit}`, async () => {
            let apps = await fastify.db.app.findMany({
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
            // transform data
            apps = apps.map(item => {
                return {
                    id: item.id, name: item.name, slogan: item.slogan, summary: item.summary, score: item.score,
                    media: {
                        landscape: item.media.map(m => ({ image: m.image, thumbnail: m.thumbnail, }))[0]
                    }
                };
            });
            return apps;
        });

        return reply.code(200).send({ data, limit });
    });

    // 最多评价
    // 用于首页侧边展示
    // 通过聚合SQL直接查询，最后取前limit个，直接展示
    // 优点：无需额外字段和操作，每次都能得到及时数据；缺点：数据量较大时开销较大，必须采用缓存等相关技术来提升性能
    fastify.get('/by-review', async function (req, reply) {
        const { limit } = Pagination.parse(0, req.query.limit);

        const data = await fastify.caching.get(`apps_by_review_${limit}`, async () => {
            let apps = await fastify.db.app.findMany({
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
            // transform data
            apps = apps.map(item => {
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
            return apps;
        });

        return reply.code(200).send({ data, limit });
    });

    // 热门游戏
    // 用于首页侧边展示
    fastify.get('/by-hot', async function (req, reply) {
        const { limit } = Pagination.parse(0, req.query.limit);

        const data = await fastify.caching.get(`apps_by_hot_${limit}`, async () => {
            let apps = await fastify.app.getHotApps({ limit });
            // transform data
            apps = apps.map(item => {
                return {
                    id: item.id, name: item.name, slogan: item.slogan, summary: item.summary, score: item.score,
                    media: {
                        landscape: { image: item.image, thumbnail: item.thumbnail, }
                    }
                };
            });
            return apps;
        });

        return reply.code(200).send({ data, limit });
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
        data.tags = await fastify.tag.getTagsByHot({ id, limit: 15, type: 'app' });
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
        const meta = {};
        meta.reviews = await fastify.db.review.count({ where: { appId: id, } }); // TODO 后面通过异步计算，直接读取
        meta.follows = await fastify.db.followApp.count({ where: { appId: id, } }); // TODO 后面通过异步计算，直接读取
        meta.ratings = await fastify.app.computeAppScoreRatio({ appId: id });// TODO 后面通过异步计算，直接读取
        meta.popular = await fastify.app.computeAppPopular({ appId: id, }); // 热力指数, TODO 后面通过异步计算，直接读取
        return reply.code(200).send({ data, meta });
    });

    // 相关联的游戏
    // 算法v1（已经弃用）采用简单的算法，通过该游戏的标签，返回同标签的游戏
    // 算法v1.2 采用简单的算法，通过查询游戏的名称，将名称分词，取前三个，然后将这三个用于SQL进行查询，如果没有找到，则查询最近更新的
    fastify.get('/:id/related', async function (req, reply) {
        const id = Number(req.params.id) || 0;
        const { limit } = Pagination.parse(0, req.query.limit);
        const app = await fastify.db.app.findUnique({ where: { id }, select: { name: true } });
        if (!app) return reply.code(200).send({ data: [] }); // no app, return empty array

        const extractWords = await fastify.jieba.extract(app.name, 3);
        let data = await fastify.db.app.findMany({
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
                    select: { image: true, thumbnail: true, },
                },
            },
            take: limit,
        });
        if (data.length === 0) { // 如果没有相关的，则直接取最新的几个
            data = await fastify.db.app.findMany({
                where: { id: { not: id } },
                include: {
                    media: {
                        where: { usage: AppMedia.usage.landscape },
                        select: { image: true, thumbnail: true, },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                take: limit,
            })
        }
        // transform data
        data = data.map(item => {
            return {
                id: item.id, name: item.name, slogan: item.slogan, summary: item.summary, score: item.score,
                media: {
                    landscape: item.media.map(m => ({ image: m.image, thumbnail: m.thumbnail, }))[0]
                },
            };
        });
        return reply.code(200).send({ data });
    });

    // 游戏相关新闻
    fastify.get('/:id/news', async function (req, reply) {
        const id = Number(req.params.id) || 0;
        const { limit } = Pagination.parse(0, req.query.limit);
        const data = await fastify.db.news.findMany({
            where: { appId: id },
            take: limit,
        })
        return reply.code(200).send({ data, });
    });

    // 游戏相关讨论
    fastify.get('/:id/discussions', async function (req, reply) {
        const id = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit, Pagination.limit.default);

        const count = await fastify.db.discussion.count({ where: { appId: id } });
        const data = await fastify.db.discussion.findMany({
            where: { appId: id },
            select: {
                id: true, title: true, isSticky: true, isClosed: true, createdAt: true, updatedAt: true,
                user: {
                    select: { id: true, name: true, title: true, avatar: true, gender: true },
                },
                channel: {
                    select: { id: true, name: true, }
                },
                _count: { select: { posts: true } },
            },
            orderBy: [{ isSticky: 'desc' }, { updatedAt: 'desc' }],
            take: limit,
            skip,
        });
        for (const item of data) {
            item.meta = {
                posts: item._count.posts,
                gifts: await fastify.discussion.countDiscussionGifts({ id: item.id }),
            };
            delete item._count;
        }
        return reply.code(200).send({ data, count, skip, limit });
    });


    // 用户给这个游戏应用打的标签
    fastify.get('/:id/tags/by-me', {
        preHandler: authenticate,
    }, async function (req, reply) {
        const id = Number(req.params.id) || 0;
        const userId = req.user?.id;
        const data = {
            frequent: [],
            current: [],
        };
        if (userId) {
            // 用户常用的10个
            data.frequent = await fastify.tag.getTagsByHot({ type: 'user', id: userId, limit: 10 });

            // 为当前游戏打的标签
            let userCurrentTags = await fastify.db.appUserTagRef.findMany({
                where: { userId: userId, appId: id },
                include: { tag: { select: { id: true, name: true, colorHex: true } }, }
            });
            userCurrentTags = userCurrentTags.map(item => item.tag);
            data.current = userCurrentTags;
        }
        return reply.code(200).send({ data });
    });

    fastify.post('/:id/tags', {
        preHandler: authenticate,
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: { $ref: 'tag#/properties/name' },
                },
                required: ['name'],
                additionalProperties: false,
            }
        }
    }, async function (req, reply) {
        const appId = Number(req.params.id) || 0;
        const userId = req.user.id;
        const { name } = req.body;
        const theTag = await fastify.db.tag.upsert({ create: { name, category: TagCategory.normal }, update: {}, where: { name } });
        // 用户可能输入了类型或者功能相同的词，要排除掉，这些词是不需要标记的
        if (theTag.category === TagCategory.normal) await fastify.db.appUserTagRef.upsert({ create: { appId, userId, tagId: theTag.id }, update: {}, where: { appId_userId_tagId: { userId, appId, tagId: theTag.id } } });
        return reply.code(200).send();
    });

    fastify.delete('/:id/tags/:name', {
        preHandler: authenticate,
    }, async function (req, reply) {
        const appId = Number(req.params.id) || 0;
        const userId = req.user.id;
        const tagName = req.params.name || '';
        const tag = await fastify.db.tag.findUnique({ where: { name: tagName }, select: { id: true } });
        if (tag?.id) await fastify.db.appUserTagRef.delete({ where: { appId_userId_tagId: { userId, appId, tagId: tag.id } } });
        return reply.code(204).send();
    });

    // 用户提交评测（一个用户一个APP只能有一个评测，再有就是修改）
    fastify.post('/:id/reviews', {
        preHandler: authenticate,
    }, async function (req, reply) {
        const appId = Number(req.params.id) || 0;
        const userId = req.user.id;
        const parts = req.parts();

        const review = await fastify.db.review.findFirst({ where: { appId, userId }, select: { id: true } });
        if (review) return reply.code(400).send(); // 已经创建了，则不会继续处理了，前端正常调用下不会出现此情况

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
            content: (reqBody.content || '').slice(0, REVIEW_CONTENT_LIMIT),
            score: Number(reqBody.score) || 3,
            allowComment: 'true' === (reqBody.allowComment || 'false').toLowerCase(),
            images: {
                create: reqBody.images.map(url => { return { url } }),
            }
        };
        data = await fastify.db.review.create({ data: { appId, userId, ...data, } });

        await fastify.app.computeAndUpdateAppScore({ appId }); // 更新评分
        await fastify.db.timeline.create({ data: { userId, targetId: data.id, target: 'Review', } }); // 创建 timeline

        // 发送通知
        await fastify.notification.addFollowingNotification({
            action: Notification.action.reviewCreated, target: Notification.target.User, targetId: userId,
            title: Notification.getContent(Notification.action.reviewCreated, Notification.type.following),
            content: data.content.slice(0, 50), url: '/reviews/' + data.id,
        });

        // reconstruct return data structure
        data.images = reqBody.images.map(url => { return { url } });
        delete data.appId;
        delete data.userId;
        return reply.code(200).send({ data });
    });

    // 获取热门评测内容
    // 简单算法：热门评测是回复最多的
    fastify.get('/:id/reviews', async function (req, reply) {
        const appId = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

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
            // 获取赞踩数量
            const thumbs = await fastify.review.getReviewThumbs({ id: item.id });
            item.gifts = (await fastify.review.getReviewGifts({ id: item.id })).gifts;
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
    }, async function (req, reply) {
        const id = Number(req.params.id) || 0;
        const userId = req.user?.id;
        let data = {};
        if (userId) {
            data = await fastify.db.review.findFirst({
                where: { userId: userId, appId: id },
                include: {
                    images: {
                        select: { id: true, url: true },
                    }
                },
            });
        }
        return reply.code(200).send({ data });
    });
};

export default apps;
