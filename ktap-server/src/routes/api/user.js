import { Pagination } from '../../constants.js';
import { authenticate } from '../../lib/auth.js';

// 处理已经登陆用户自己相关业务
const user = async (fastify, opts) => {
    fastify.addHook('onRequest', authenticate);

    // 获取当前登陆用户的信息
    fastify.get('', async function (req, reply) {
        const user = await fastify.db.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, name: true, email: true, phone: true, avatar: true, title: true, bio: true,
                balance: true, birthday: true, gender: true, isAdmin: true, isActivated: true, isLocked: true,
                location: true, createdAt: true, updatedAt: true,
            }
        });
        return reply.code(200).send({ data: user });
    });

    // 获取用户与DiscussionPosts的赞踩信息
    fastify.get('/effect/discussions/posts/thumbs', async function (req, reply) {
        const userId = req.user.id;
        const postIds = (req.query.ids || '').split(',').map(item => Number(item) || 0).filter(item => item > 0);
        let data = {};
        if (postIds.length > 0) {
            const thumbs = await fastify.db.discussionPostThumb.findMany({
                where: { userId, postId: { in: postIds } },
                select: { postId: true, direction: true, }
            });
            thumbs.forEach(thumb => {
                data[thumb.postId] = thumb.direction;
            });
        }
        return reply.code(200).send({ data });
    });

    // 获取用户与DiscussionPost的交互信息
    fastify.get('/effect/discussions/posts/:id/report', async function (req, reply) {
        const userId = req.user.id;
        const postId = Number(req.params.id) || 0;
        const data = {};
        data.reported = (await fastify.db.discussionPostReport.count({ where: { userId, postId } })) > 0;
        return reply.code(200).send({ data });
    });

    // 获取用户与reviews的赞踩信息
    fastify.get('/effect/reviews', async function (req, reply) {
        const userId = req.user.id;
        const data = {};
        const reviewIds = (req.query.ids || '').split(',').map(item => Number(item) || 0).filter(item => item > 0);
        if (reviewIds.length > 0) {
            const thumbs = await fastify.db.reviewThumb.findMany({
                where: { userId, reviewId: { in: reviewIds } },
                select: { reviewId: true, direction: true, }
            });
            const reported = await fastify.db.reviewReport.findMany({
                where: { userId, reviewId: { in: reviewIds } },
            });
            reviewIds.forEach(reviewId => data[reviewId] = { thumb: null, reported: false });
            thumbs.forEach(thumb => data[thumb.reviewId].thumb = thumb.direction);
            reported.forEach(report => data[report.reviewId].reported = true);
        }
        return reply.code(200).send({ data });
    });

    // 获取用户与reviews的交互信息
    fastify.get('/effect/reviews/:id', async function (req, reply) {
        const userId = req.user.id;
        const reviewId = Number(req.params.id) || 0;
        const data = {};
        data.reported = (await fastify.db.reviewReport.count({ where: { userId, reviewId } })) > 0;
        data.thumb = (await fastify.db.reviewThumb.findMany({
            where: { userId, reviewId },
            select: { direction: true, }
        }))[0]?.direction;
        return reply.code(200).send({ data });
    });

    // 获取关注信息
    fastify.get('/follows/:type/:id', async function (req, reply) {
        const followerId = req.user.id;
        const id = Number(req.params.id) || 0;
        let follow = false;
        if (id > 0) {
            let count = 0;
            if (req.params.type === 'user') {
                count = await fastify.db.followUser.count({
                    where: { followerId, userId: id }
                })
            } else {
                count = await fastify.db.followApp.count({
                    where: { followerId, appId: id }
                })
            }
            follow = count > 0;
        }
        return reply.code(200).send({ data: { follow } });
    });

    // 关注
    fastify.post('/follows/:type/:id', async function (req, reply) {
        const followerId = req.user.id;
        const id = Number(req.params.id) || 0;
        if (id > 0) {
            if (req.params.type === 'user') {
                if (followerId !== id) { // 自己不能关注自己
                    const data = await fastify.db.followUser.create({ data: { followerId, userId: id } });
                    await fastify.db.timeline.create({ data: { userId: followerId, targetId: data.id, target: 'FollowUser', } });
                }
            } else {
                const data = await fastify.db.followApp.create({ data: { followerId, appId: id } });
                await fastify.db.timeline.create({ data: { userId: followerId, targetId: data.id, target: 'FollowApp', } });
            }
        }
        return reply.code(200).send();
    });

    // 取关
    fastify.delete('/follows/:type/:id', async function (req, reply) {
        const followerId = req.user.id;
        const id = Number(req.params.id) || 0;
        if (id > 0) {
            if (req.params.type === 'user') {
                const data = await fastify.db.followUser.delete({ where: { followerId_userId: { followerId, userId: id }, } });
                await fastify.db.timeline.deleteMany({ where: { target: 'FollowUser', targetId: data.id, userId: followerId } });
            } else {
                const data = await fastify.db.followApp.delete({ where: { followerId_appId: { followerId, appId: id }, } });
                await fastify.db.timeline.deleteMany({ where: { target: 'FollowApp', targetId: data.id, userId: followerId } });
            }
        }
        return reply.code(204).send();
    });

    // 消费记录
    fastify.get('/tradings/history', async function (req, reply) {
        const userId = req.user.id;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        let take = skip + limit >= 100 ? 100 - skip : limit;
        let data = [];
        let count = 0;
        if (take > 0) {
            const whereCondition = {
                OR: [
                    { userId, },
                    {
                        AND: {
                            target: 'User',
                            targetId: userId,
                        }
                    }
                ]
            };
            count = await fastify.db.trading.count({ where: whereCondition });
            data = await fastify.db.trading.findMany({
                where: whereCondition,
                orderBy: { createdAt: 'desc' },
                skip,
                take
            });
        }
        return reply.code(200).send({ data, count, skip, limit });
    });
};

export default user;
