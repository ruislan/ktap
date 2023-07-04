import { AppMedia, LIMIT_CAP, REVIEW_IMAGE_COUNT_LIMIT, Trading } from '../../constants.js';
import { authenticate } from '../../lib/auth.js';

const reviews = async (fastify, opts) => {
    // 获取评测
    fastify.get('/:id', async function (req, reply) {
        const id = Number(req.params.id);
        const data = await fastify.db.review.findUnique({
            where: { id },
            include: {
                app: {
                    select: {
                        id: true, name: true, score: true, isVisible: true,
                        media: {
                            where: { OR: [{ usage: AppMedia.usage.head }, { usage: AppMedia.usage.portrait }] },
                            select: { image: true, thumbnail: true, usage: true },
                        },
                    }
                },
                images: { select: { id: true, url: true } },
                user: { select: { id: true, name: true, avatar: true, gender: true, title: true } },
                _count: { select: { comments: true } },
            }
        });

        if (!data) return reply.code(404).send(); // maybe no data

        // fetch gifts
        const gifts = await fastify.utils.getReviewGifts({ id });
        data.gifts = gifts.gifts;

        // fetch meta data
        // 获取礼物，礼物分组并统计送的人的总数
        // 获取赞踩数量
        const thumbs = await fastify.utils.getReviewThumbs({ id });
        data.meta = { ups: thumbs?.ups || 0, downs: thumbs?.downs || 0, comments: data._count.comments, gifts: gifts.count };

        // transform data for api output
        if (data.app.isVisible) {
            const transformMedia = {};
            data.app.media?.forEach(m => transformMedia[m.usage] = { image: m.image, thumbnail: m.image });
            data.app.media = transformMedia;
        } else {
            delete data.app;
        }

        delete data._count;
        delete data.userId;
        delete data.appId;
        return reply.code(200).send({ data });
    });

    // 删除评测
    fastify.delete('/:id', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const id = Number(req.params.id);
            const userId = req.user.id;
            const review = (await fastify.db.review.findMany({ where: { userId, id } }))[0]; // is my review?
            if (review) {
                const toDeleteImages = await fastify.db.reviewImage.findMany({ where: { reviewId: id }, select: { url: true } });

                // 删除Review不需要删除其Comments，这是Review作者自己的行为，而非Comment作者行为。
                await fastify.db.$transaction([
                    fastify.db.reviewReport.deleteMany({ where: { reviewId: id } }), // 删除相关举报，举报需要在Timeline中吗？如果需要，那么就无需在这里删除
                    fastify.db.reviewThumb.deleteMany({ where: { reviewId: id } }), // 删除关联赞踩，赞踩需要在Timeline中吗？如果需要，那么就无需在这里删除
                    fastify.db.reviewGiftRef.deleteMany({ where: { reviewId: id } }), // 删除关联礼物，礼物需要在Timeline中吗？如果需要，那么就无需在这里删除
                    fastify.db.reviewImage.deleteMany({ where: { reviewId: id, } }), // 删除关联图片,
                    fastify.db.review.delete({ where: { id } }), // 删除评测
                    fastify.db.timeline.deleteMany({ where: { target: 'Review', targetId: id, userId: review.userId } }), // 删除发布者的时间线，ReviewComment的时间线不需要删除
                    fastify.db.$queryRaw`
                        UPDATE App SET score = avgScore FROM
                        (SELECT COALESCE(AVG(score), 4) AS avgScore FROM review WHERE app_id = ${review.appId})
                        WHERE App.id = ${review.appId};
                    `, // XXX 非必每次评测都更新，定时刷新App的评分或异步请求重新计算App积分
                ]);
                // 删除上传图片
                for (const img of toDeleteImages) {
                    try {
                        await fastify.storage.delete(img.url);
                    } catch (e) {
                        fastify.log.warn('delete file error: ' + e);
                    }
                }
            }
            return reply.code(204).send();
        }
    });

    // 获取评测回复
    fastify.get('/:id/comments', async function (req, reply) {
        const id = Number(req.params.id);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const downstream = (req.query.downstream || 'false').toLowerCase() === 'true';

        const count = await fastify.db.reviewComment.count({ where: { reviewId: id } });
        const data = await fastify.db.reviewComment.findMany({
            where: { reviewId: id },
            select: {
                id: true, content: true, createdAt: true, updatedAt: true,
                user: { select: { id: true, name: true, avatar: true, gender: true, title: true } },
            },
            skip,
            take: limit,
            orderBy: { createdAt: downstream ? 'asc' : 'desc' }
        });
        return reply.code(200).send({ data, count, skip, limit });
    });

    // 评测回复
    // 允许回复的才能回复
    fastify.post('/:id/comments', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const reviewId = Number(req.params.id);
            const userId = req.user.id;
            const content = req.body.content || '';
            let data = {};
            if (content && content.length > 0) {
                const review = await fastify.db.review.findUnique({ where: { id: reviewId }, select: { allowComment: true } });
                if (review.allowComment) {
                    data = await fastify.db.reviewComment.create({
                        data: {
                            reviewId,
                            content,
                            userId,
                        }
                    });

                    // Create timeline
                    await fastify.db.timeline.create({
                        data: { userId, targetId: data.id, target: 'ReviewComment', }
                    });
                }
            }
            return reply.code(200).send({ data });
        }
    });

    // 删除某条回复
    fastify.delete('/:reviewId/comments/:id', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const reviewId = Number(req.params.reviewId);
            const id = Number(req.params.id);
            const userId = req.user.id;
            // is my review?
            await fastify.db.reviewComment.deleteMany({ where: { id, reviewId, userId, } });
            await fastify.db.timeline.deleteMany({ where: { target: 'ReviewComment', targetId: id, userId } });
            return reply.code(204).send();
        }
    });

    // 修改评测
    fastify.put('/:id', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const userId = req.user.id;
            const id = Number(req.params.id);
            const review = (await fastify.db.review.findMany({ where: { userId, id } }))[0]; // is my review?
            if (review) {
                const parts = req.parts();
                const reqBody = { images: [] };
                for await (const part of parts) {
                    if (part.file) {
                        const buffer = await part.toBuffer();
                        reqBody.images.push({ filename: part.filename, buffer });
                    } else {
                        reqBody[part.fieldname] = part.value;
                    }
                }

                const data = {
                    content: reqBody.content || '',
                    score: Number(reqBody.score) || 3,
                    allowComment: 'true' === (reqBody.allowComment || 'false').toLowerCase(),
                };

                // delete images
                reqBody.imagesToDelete = reqBody.imagesToDelete?.split(',').filter(v => v.length > 0).map(v => Number(v));
                if (reqBody.imagesToDelete.length > 0) {
                    for (const toDeleteId of reqBody.imagesToDelete) {
                        const toDelete = await fastify.db.reviewImage.delete({ where: { id: toDeleteId } });
                        if (toDelete.url && toDelete.url.startsWith('/')) { // Is LocalStorage
                            try {
                                await fastify.storage.delete(toDelete.url);
                            } catch (e) {
                                fastify.log.warn('delete file error: ' + e);
                            }
                        }
                    }
                }

                // images have deleted and we count the new image limit
                if (reqBody.images.length > 0) {
                    const imageCount = await fastify.db.reviewImage.count({ where: { reviewId: id } });
                    const limit = Math.min(REVIEW_IMAGE_COUNT_LIMIT - imageCount, reqBody.images.length);
                    data.images = { create: [] };
                    // write buffer to LocalStorage
                    for (let i = 0; i < limit; i++) {
                        const { filename, buffer } = reqBody.images[i];
                        const url = await fastify.storage.store(filename, buffer);
                        data.images.create.push({ url }); // append new images to data for cascade creating
                    }
                    // clear all buffer
                    for (const image of reqBody.images) {
                        try {
                            image.buffer?.clear();
                        } catch (e) {
                            // ignore
                        }
                    }
                }

                await fastify.db.review.update({ data, where: { id } });

                // XXX 非必每次评测都更新，定时刷新App的评分或者异步请求更新
                await fastify.db.$queryRaw`
                    UPDATE App SET score = avgScore FROM
                    (SELECT COALESCE(AVG(score), 4) AS avgScore FROM review WHERE app_id = ${review.appId})
                    WHERE App.id = ${review.appId};
                `;
            }
            return reply.code(204).send();
        }
    });

    // 点赞或点踩
    fastify.post('/:id/thumb/:direction', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const reviewId = Number(req.params.id);
            const userId = req.user.id;
            let direction = ((req.params.direction || 'up').toLowerCase()) === 'down' ? 'down' : 'up'; // only up or down

            const toDelete = await fastify.db.reviewThumb.findUnique({ where: { reviewId_userId: { reviewId, userId, } } });
            // 直接删除当前的赞或者踩
            // 如果新的点踩或者点赞与删除的不同，则重新创建
            if (toDelete) await fastify.db.reviewThumb.delete({ where: { reviewId_userId: { reviewId, userId, } } });
            if (!toDelete || toDelete.direction !== direction) {
                await fastify.db.reviewThumb.create({ data: { reviewId, userId, direction } });
            }

            // 重新取当前review的数据
            const data = await fastify.utils.getReviewThumbs({ id: reviewId });
            return reply.code(200).send({ data });
        }
    });

    // 送礼物
    fastify.post('/:id/gifts/:giftId', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const userId = req.user.id;
            const reviewId = Number(req.params.id);
            const giftId = Number(req.params.giftId);

            const gift = await fastify.db.gift.findUnique({ where: { id: giftId } });
            await fastify.db.$transaction(async (tx) => {
                // 减去balance
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: {
                        balance: {
                            decrement: gift.price,
                        }
                    }
                });
                // 检查余额， 有问题就回滚事务
                if (updatedUser.balance < 0) throw new Error('insufficient balance');
                await tx.trading.create({ data: { userId, target: 'Gift', targetId: giftId, amount: gift.price, type: Trading.type.buy } }); // 生成交易
                const giftRef = await tx.reviewGiftRef.create({ data: { userId, giftId, reviewId } }); // 创建关系
                await tx.timeline.create({ data: { userId, target: 'ReviewGiftRef', targetId: giftRef.id } }); // 创建动态
            });
            // XXX 这里没有包裹事务出错的错误，直接扔给框架以500形式抛出了，后续需要更柔性处理
            // 读取最新的礼物情况
            // fetch gifts
            const gifts = await fastify.utils.getReviewGifts({ id: reviewId });
            return reply.code(200).send({ data: gifts.gifts, count: gifts.count });
        }
    });

    // 举报
    fastify.post('/:id/report', {
        preHandler: authenticate,
        handler: async function (req, reply) {
            const userId = req.user.id;
            const reviewId = Number(req.params.id);
            const content = req.body.content;
            await fastify.db.reviewReport.create({ data: { userId, reviewId, content } });
            return reply.code(200).send();
        }
    });
};

export default reviews;
