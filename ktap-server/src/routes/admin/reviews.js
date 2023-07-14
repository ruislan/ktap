import { LIMIT_CAP } from "../../constants.js";

const reviews = async function (fastify, opts) {
    fastify.get('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.review.findUnique({ where: { id }, });
        return reply.code(200).send({ data });
    });

    fastify.delete('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;

        const review = await fastify.db.review.findUnique({ where: { id } });
        // 删除Review不需要删除其Comments，这是Review作者自己的行为，而非Comment作者行为。
        // 礼物在Timeline中，赠送礼物的行为是用户行为，而不是 Review 的行为，所以不用在这里删除。
        // TODO 和API的Reviews的删除方法有重复
        if (review) {
            const toDeleteImages = await fastify.db.reviewImage.findMany({ where: { reviewId: id }, select: { url: true } });

            await fastify.db.$transaction([
                fastify.db.reviewReport.deleteMany({ where: { reviewId: id } }), // 删除相关举报
                fastify.db.reviewThumb.deleteMany({ where: { reviewId: id } }), // 删除关联赞踩
                // fastify.db.reviewGiftRef.updateMany({ where: { reviewId: id }, data: { reviewId: null } }), // 断掉关联，保留赠送记录
                fastify.db.reviewImage.deleteMany({ where: { reviewId: id, } }), // 删除关联图片,
                fastify.db.review.delete({ where: { id } }), // 删除评测，不需要删除其Comments，这是Review作者自己的行为，而非Comment作者行为。
                fastify.db.timeline.deleteMany({ where: { target: 'Review', targetId: id, userId: review.userId } }), // 删除发布者的时间线，ReviewComment的时间线不需要删除
                fastify.db.$queryRaw`
                    UPDATE App SET score = avgScore FROM
                    (SELECT COALESCE(AVG(score), 4) AS avgScore FROM review WHERE app_id = ${review.appId})
                    WHERE App.id = ${review.appId};
                `, // XXX 非必每次评测都更新，定时刷新App的评分或异步请求重新计算App积分
            ]);

            // 删除上传图片,这里非必要一个事务
            for (const img of toDeleteImages) {
                try {
                    await fastify.storage.delete(img.url);
                } catch (e) {
                    fastify.log.warn('delete file error: ' + e);
                }
            }
        }
        return reply.code(204).send();
    });

    fastify.get('', async (req, reply) => {
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const keyword = req.query.keyword || '';
        const isReported = (req.query.isReported || 'false').toLowerCase() === 'true';
        const hasGifts = (req.query.hasGifts || 'false').toLowerCase() === 'true';
        const hasImages = (req.query.hasImages || 'false').toLowerCase() === 'true';

        const whereCondition = {};
        if (keyword.length > 0) whereCondition.content = { contains: keyword };
        if (isReported) whereCondition.reports = { some: {} };
        if (hasGifts) whereCondition.gifts = { some: {} };
        if (hasImages) whereCondition.images = { some: {} };

        const count = await fastify.db.review.count({ where: whereCondition });
        const data = await fastify.db.review.findMany({
            where: whereCondition,
            select: {
                id: true, content: true, score: true, createdAt: true, updatedAt: true,
                user: { select: { id: true, name: true }, },
                app: { select: { id: true, name: true } },
                _count: { select: { reports: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        data.forEach(item => {
            item.meta = item._count;
            delete item._count;
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.get('/:id/reports', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const count = await fastify.db.reviewReport.count({ where: { reviewId: id } });
        const data = await fastify.db.reviewReport.findMany({
            where: { reviewId: id, },
            select: {
                id: true, content: true, createdAt: true,
                user: {
                    select: { id: true, name: true, avatar: true },
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.post('/monkey', async (req, reply) => {
        const { userId, content, score, isAll } = req.body;
        const count = Number(req.body.count) || 10;
        const total = await fastify.db.app.count();
        let max = isAll ? total : Math.min(count, total);
        const data = { userId: Number(userId) || 1, content, score: Number(score) || 4, allowComment: false };
        let limit = Math.min(max, 100);
        for (let i = 0; i < max; i += limit) {
            const apps = await fastify.db.app.findMany({
                take: limit,
                skip: i,
                select: { id: true },
                orderBy: { createdAt: 'desc' }, // created_at 不会变化
            });
            for (const app of apps) {
                data.appId = app.id;
                try {
                    const newData = await fastify.db.review.create({ data });
                    await fastify.db.timeline.create({ data: { userId, targetId: newData.id, target: 'Review', } });
                } catch (ignore) {
                    // ignore
                }
            }
        }
        return reply.code(201).send();
    });
};

export default reviews;
