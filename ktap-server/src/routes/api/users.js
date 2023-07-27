import { AppMedia, Pagination } from "../../constants.js";

const users = async (fastify, opts) => {
    fastify.get('/:id/follows/apps', async function (req, reply) {
        const userId = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const count = await fastify.db.followApp.count({ where: { followerId: userId, app: { isVisible: true } } });
        let data = [];
        if (count > 0) {
            data = await fastify.db.followApp.findMany({
                where: { followerId: userId, app: { isVisible: true } },
                include: {
                    app: {
                        select: {
                            id: true, name: true, score: true, isVisible: true,
                            media: {
                                where: { usage: AppMedia.usage.head },
                                select: { image: true, thumbnail: true, },
                            },
                        },
                    }
                },
                take: limit,
                skip,
                orderBy: { createdAt: 'desc' }
            });
            data.forEach(item => {
                item.app.media = {
                    head: item.app.media[0]
                };
            });
        }
        return reply.code(200).send({ data, count, skip, limit });
    });

    fastify.get('/:id/follows/users', async function (req, reply) {
        const userId = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const count = await fastify.db.followUser.count({ where: { followerId: userId } });
        let data = [];
        if (count > 0) {
            data = await fastify.db.followUser.findMany({
                where: { followerId: userId },
                include: {
                    user: {
                        select: { id: true, name: true, gender: true, avatar: true, title: true }
                    }
                },
                take: limit,
                skip,
                orderBy: { createdAt: 'desc' }
            });
        }
        return reply.code(200).send({ data, count, skip, limit });
    });

    fastify.get('/:id/review-comments', async function (req, reply) {
        const userId = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const count = await fastify.db.reviewComment.count({ where: { userId, } });
        const data = await fastify.db.reviewComment.findMany({
            where: { userId, },
            include: {
                review: {
                    select: {
                        id: true,
                        content: true,
                        app: { select: { id: true, name: true, } },
                        user: { select: { id: true, name: true, } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data, count, skip, limit });
    });

    fastify.get('/:id/reviews', async function (req, reply) {
        const userId = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const count = await fastify.db.review.count({ where: { userId, } });
        const data = await fastify.db.review.findMany({
            where: { userId },
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
                app: {
                    select: {
                        id: true, name: true, score: true, isVisible: true,
                        media: {
                            where: { usage: AppMedia.usage.head },
                            select: { image: true, thumbnail: true, },
                        },
                    },
                },
                user: { select: { id: true, name: true, avatar: true, gender: true, title: true } },
                images: { select: { url: true } },
            },
            orderBy: { updatedAt: 'desc' },
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

            // app 不可见则无需展示
            if (item.app.isVisible) {
                item.app.media = {
                    head: item.app.media.map(m => {
                        return {
                            image: m.image,
                            thumbnail: m.thumbnail,
                        };
                    })[0]
                };
            } else {
                delete item.app;
            }
            delete item._count;
            delete item.userId;
            delete item.appId;
        };
        return reply.code(200).send({ data, count, skip, limit });
    });

    fastify.get('/:id/discussion-posts', async function (req, reply) {
        const userId = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const count = await fastify.db.discussionPost.count({ where: { userId, } });
        const data = await fastify.db.discussionPost.findMany({
            where: { userId, },
            select: {
                id: true, content: true, createdAt: true, updatedAt: true,
                discussion: {
                    select: {
                        id: true, title: true,
                        app: { select: { id: true, name: true, } },
                        user: { select: { id: true, name: true, } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data, count, skip, limit });
    });

    fastify.get('/:id/discussions', async function (req, reply) {
        const userId = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const count = await fastify.db.discussion.count({ where: { userId, } });
        const data = await fastify.db.discussion.findMany({
            where: { userId },
            select: {
                id: true, title: true, createdAt: true, updatedAt: true,
                app: {
                    select: {
                        id: true, name: true, score: true, isVisible: true,
                        media: {
                            where: { usage: AppMedia.usage.head },
                            select: { image: true, thumbnail: true, usage: true },
                        },
                    }
                },
            },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            skip,
        });
        for (const item of data) {
            // app 不可见则无需展示
            if (item.app.isVisible) {
                item.app.media = {
                    head: item.app.media.map(m => {
                        return {
                            image: m.image,
                            thumbnail: m.thumbnail,
                        };
                    })[0]
                };
            } else {
                delete item.app;
            }
        }
        return reply.code(200).send({ data, count, skip, limit });
    });

    fastify.get('/:id/timeline', async function (req, reply) {
        const userId = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const count = await fastify.db.timeline.count({ where: { userId, } });
        let data = await fastify.db.timeline.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        for (const item of data) {
            switch (item.target) {
                case 'Review':
                    item.data = await fastify.db.review.findUnique({
                        where: { id: item.targetId },
                        include: {
                            app: {
                                select: {
                                    id: true, name: true, score: true, isVisible: true,
                                    media: {
                                        where: { usage: AppMedia.usage.head },
                                        select: { image: true, thumbnail: true, usage: true },
                                    },
                                }
                            },
                            images: { select: { id: true, url: true } },
                        }
                    });
                    if (item.data.app.isVisible) {
                        item.data.app.media = {
                            head: item.data.app.media.map(m => {
                                return {
                                    image: m.image,
                                    thumbnail: m.thumbnail,
                                };
                            })[0]
                        };
                    } else {
                        delete item.data.app;
                    }
                    break;
                case 'ReviewComment':
                    item.data = await fastify.db.reviewComment.findUnique({
                        where: { id: item.targetId },
                        select: {
                            id: true, content: true, createdAt: true,
                            review: {
                                select: {
                                    id: true, score: true, content: true,
                                    user: { select: { id: true, name: true, } },
                                    app: { select: { id: true, name: true, isVisible: true } },
                                }
                            }
                        }
                    });
                    if (!item.data.review?.app?.isVisible) delete item.data.review?.app;
                    break;
                case 'ReviewGiftRef':
                    item.data = await fastify.db.reviewGiftRef.findUnique({
                        where: { id: item.targetId },
                        select: {
                            gift: { select: { name: true, description: true, url: true, price: true, } },
                            review: {
                                select: {
                                    id: true, score: true, content: true,
                                    user: { select: { id: true, name: true, } },
                                }
                            }
                        }
                    });
                    break;
                case 'FollowUser':
                    const followUser = await fastify.db.followUser.findUnique({ where: { id: item.targetId }, });
                    item.data = await fastify.db.user.findUnique({
                        where: { id: followUser.userId },
                        select: { id: true, name: true },
                    });
                    item.target = 'FollowUser';
                    break;
                case 'FollowApp':
                    const followApp = await fastify.db.followApp.findUnique({ where: { id: item.targetId }, });
                    item.data = await fastify.db.app.findUnique({
                        where: { id: followApp.appId },
                        select: {
                            id: true, name: true, score: true, isVisible: true,
                            media: {
                                where: { usage: AppMedia.usage.head },
                                select: { image: true, thumbnail: true, usage: true },
                            },
                        }
                    });
                    if (item.data.isVisible) {
                        item.data.media = {
                            head: item.data.media.map(m => {
                                return {
                                    image: m.image,
                                    thumbnail: m.thumbnail,
                                };
                            })[0]
                        };
                    } else {
                        item.data = null;
                    }
                    item.target = 'FollowApp';
                    break;
                case 'Discussion':
                    item.data = await fastify.db.discussion.findUnique({
                        where: { id: item.targetId },
                        select: {
                            id: true, title: true, createdAt: true,
                            app: {
                                select: {
                                    id: true, name: true, score: true, isVisible: true,
                                    media: {
                                        where: { usage: AppMedia.usage.head },
                                        select: { image: true, thumbnail: true, usage: true },
                                    },
                                }
                            },
                        }
                    });
                    if (item.data.app.isVisible) {
                        item.data.app.media = {
                            head: item.data.app.media.map(m => {
                                return {
                                    image: m.image,
                                    thumbnail: m.thumbnail,
                                };
                            })[0]
                        };
                    } else {
                        delete item.data.app;
                    }
                    break;
                case 'DiscussionPost':
                    item.data = await fastify.db.discussionPost.findUnique({
                        where: { id: item.targetId },
                        select: {
                            id: true, content: true, createdAt: true,
                            discussion: {
                                select: {
                                    id: true, title: true,
                                    user: { select: { id: true, name: true, } },
                                    app: { select: { id: true, name: true, isVisible: true } },
                                }
                            }
                        }
                    });
                    if (!item.data?.discussion?.app?.isVisible) delete item.data?.discussion?.app;
                    break;
                case 'DiscussionPostGiftRef':
                    item.data = await fastify.db.discussionPostGiftRef.findUnique({
                        where: { id: item.targetId },
                        select: {
                            gift: { select: { name: true, description: true, url: true, price: true, } },
                            post: {
                                select: {
                                    id: true, content: true,
                                    user: { select: { id: true, name: true, } },
                                    discussion: { select: { id: true, title: true, } },
                                }
                            }
                        }
                    });
                    break;
                default: break;
            }
            // delete unused fields
            item.type = item.target;
            delete item.target;
            delete item.targetId;
            delete item.userId;
        }
        return reply.code(200).send({ data, count, skip, limit });
    });

    fastify.get('/:id', async function (req, reply) {
        const id = Number(req.params.id) || 0;

        const user = await fastify.db.user.findUnique({ where: { id } });
        if (!user) return reply.code(404).send(); // not found
        delete user.password;

        // 关注数, 评测数, 回复数
        const meta = (await fastify.db.$queryRaw`
                SELECT
                (SELECT COUNT(FollowUser.user_id) FROM FollowUser WHERE FollowUser.follower_id=${id}) AS followUsers,
                (SELECT COUNT(FollowApp.app_id) FROM FollowApp WHERE FollowApp.follower_id=${id}) AS followApps,
                (SELECT COUNT(Review.id) FROM Review WHERE Review.user_id=${id}) AS reviews,
                (SELECT COUNT(ReviewComment.id) FROM ReviewComment WHERE ReviewComment.user_id=${id}) AS comments,
                (SELECT COUNT(Discussion.id) FROM Discussion WHERE Discussion.user_id=${id}) AS discussions,
                (SELECT COUNT(DiscussionPost.id) FROM DiscussionPost WHERE DiscussionPost.user_id=${id}) AS posts
            `)[0];

        meta.follows = {
            count: meta.followUsers + meta.followApps,
            users: meta.followUsers,
            apps: meta.followApps,
        };
        delete meta.followUsers;
        delete meta.followApps;

        return reply.code(200).send({ data: user, meta });
    });
};

export default users;
