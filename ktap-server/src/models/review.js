'use strict';

import { Notification, Trading } from '../constants.js';

export const REVIEW_IMAGE_COUNT_LIMIT = 3; // 3 images
export const REVIEW_CONTENT_LIMIT = 8000; // 8000个字

// domain errors
export const ReviewErrors = {
    reviewAlreadyExists: '已经评测过了',
    reviewNotFound: '评测不存在',
    reviewImageSaveFailed: '评测图片保存失败',
    commentFailed: '回复评测失败',
    reviewContentEmpty: '评测内容为空',
    insufficientBalance: '余额不足',
    giftNotFound: '礼物不存在',
};

export const ReviewEvents = {
    Created: 'review.created',
};

const review = async (fastify, opts, next) => {
    fastify.decorate('review', {
        async createReview({ userId, appId, content, score, ip, allowComment, imagesToSave }) {
            const review = await fastify.db.review.findFirst({ where: { appId, userId }, select: { id: true } });
            if (review) throw new Error(ReviewErrors.reviewAlreadyExists); // 已经创建了，则不会继续处理了，前端正常调用下不会出现此情况

            // save images to db
            const savedImages = [];
            try {
                for await (const image of imagesToSave) {
                    const url = await fastify.storage.store(image.filename, image.buffer);
                    savedImages.push({ url }); // should object
                }
            } catch (err) {
                throw new Error(ReviewErrors.reviewImageSaveFailed);
            }
            // save to db
            const data = await fastify.db.$transaction(async (tx) => {
                const data = await tx.review.create({ data: { appId, userId, content, score, ip, allowComment, images: { create: savedImages } } });
                await tx.timeline.create({ data: { userId, targetId: data.id, target: 'Review', } }); // 创建 timeline
                return data;
            });

            try {
                await fastify.app.computeAndUpdateAppScore({ appId }); // 更新评分
                await fastify.notification.addFollowingNotification({
                    action: Notification.action.reviewCreated, target: Notification.target.User, targetId: userId,
                    title: Notification.getContent(Notification.action.reviewCreated, Notification.type.following),
                    content: data.content.slice(0, 50), url: '/reviews/' + data.id,
                }); // 发送通知
                await fastify.pubsub.publish(ReviewEvents.Created, { review: { ...data } }); // 发送事件
            } catch (err) {
                // ignore
            }

            // reconstruct return data structure
            data.images = savedImages;
            delete data.appId;
            delete data.userId;
            return data;
        },
        async updateReview({ id, userId, content, score, allowComment, imagesToSave, imagesToDelete }) {
            const review = (await fastify.db.review.findFirst({ where: { userId, id } })); // is my review?
            if (!review) throw new Error(ReviewErrors.reviewNotFound);

            const data = { content: content.slice(0, REVIEW_CONTENT_LIMIT), score, allowComment, };

            // 计算删除了多少图片，还有多少空位
            const oldImageCount = await fastify.db.reviewImage.count({ where: { reviewId: id } });
            const imagesToSaveCount = imagesToSave.length;
            const imagesToDeleteCount = imagesToDelete.length;
            const saveLimit = Math.min(REVIEW_IMAGE_COUNT_LIMIT + imagesToDeleteCount - oldImageCount, imagesToSaveCount);// 保留最小的那个

            // 首先保存新的文件
            if (imagesToSaveCount > 0) {
                data.images = { create: [] };
                // write buffer to LocalStorage
                for (let i = 0; i < saveLimit; i++) {
                    try {
                        const { filename, buffer } = imagesToSave[i];
                        const url = await fastify.storage.store(filename, buffer);
                        data.images.create.push({ url }); // append new images to data for cascade creating
                    } catch (err) {
                        fastify.log.warn('save file error: ' + err);
                        // 不能保存文件，必然更新失败了，已经保存的文件没有进入数据库会形成碎片数据，不过无所谓，后面版本会专门来处理
                        throw new Error(ReviewErrors.reviewImageSaveFailed);
                    }
                }
                // clear all buffer
                for (const image of imagesToSave) {
                    try {
                        image.buffer?.clear();
                    } catch (err) {
                        // ignore
                    }
                }
            }

            // 然后进行数据库处理，更新
            const toDeleteFiles = await fastify.db.$transaction(async (tx) => {
                let toDeleteFiles = [];
                for (const toDeleteId of imagesToDelete) {
                    const toDeleteFile = await tx.reviewImage.delete({ where: { id: toDeleteId } });
                    toDeleteFiles.push(toDeleteFile);
                }
                await tx.review.update({ data, where: { id } });
                return toDeleteFiles;
            });

            // 最后删除已经不在数据库中的图片，删除失败也无所谓，与上面一样，后面会专门处理
            for (const toDelete of toDeleteFiles) {
                if (toDelete.url && toDelete.url.startsWith('/')) { // Is LocalStorage
                    try {
                        await fastify.storage.delete(toDelete.url);
                    } catch (err) {
                        // ignore
                    }
                }
            }

            // XXX 或许应该改为定时刷新App的评分或者异步请求更新？
            try {
                await fastify.app.computeAndUpdateAppScore({ appId: review.appId });
            } catch (err) {
                fastify.log.warn('compute and update app score error: ' + err);
            }
        },
        async commentReview({ reviewId, content, userId, ip }) {
            let data = {};
            const review = await fastify.db.review.findUnique({ where: { id: reviewId }, select: { allowComment: true, userId: true } });
            if (review?.allowComment) {
                data = await fastify.db.reviewComment.create({ data: { reviewId, content, userId, ip } });
                await fastify.db.timeline.create({ data: { userId, targetId: data.id, target: 'ReviewComment', } });
                // 发送通知
                const notification = {
                    action: Notification.action.commentCreated, target: Notification.target.User, targetId: userId,
                    content: content.slice(0, 50), url: '/reviews/' + reviewId + '/comments/' + data.id,
                };
                await fastify.notification.addFollowingNotification({
                    ...notification,
                    title: Notification.getContent(Notification.action.commentCreated, Notification.type.following)
                });
                // 自己给自己回不用发反馈通知
                if (review.userId !== userId) {
                    await fastify.notification.addReactionNotification({
                        ...notification,
                        userId: review.userId, // 反馈通知的对象
                        title: Notification.getContent(Notification.action.commentCreated, Notification.type.reaction)
                    });
                }
            }
            return data;
        },
        async deleteComment({ reviewId, commentId, userId }) {
            await fastify.db.$transaction(async (tx) => {
                const comment = await tx.reviewComment.deleteMany({ where: { id: commentId, reviewId, userId, } }); // is my review?
                if (comment?.id) await tx.timeline.deleteMany({ where: { target: 'ReviewComment', targetId: commentId, userId } });
            });
        },
        async deleteReview({ id, userId, isByAdmin = false, }) {
            const whereCondition = { id };
            if (!isByAdmin) whereCondition.userId = userId; // isAdmin or is my review?
            const review = (await fastify.db.review.findFirst({ where: whereCondition }));
            if (review) {
                const toDeleteImages = await fastify.db.reviewImage.findMany({ where: { reviewId: id }, select: { url: true } });
                // 删除Review不需要删除其Comments，这是Review作者自己的行为，而非Comment作者行为。
                // 礼物在Timeline中，赠送礼物的行为是用户行为，而不是 Review 的行为，所以不用在这里删除。
                await fastify.db.$transaction([
                    fastify.db.reviewReport.deleteMany({ where: { reviewId: id } }), // 删除相关举报，举报需要在Timeline中吗？如果需要，那么就无需在这里删除
                    fastify.db.reviewThumb.deleteMany({ where: { reviewId: id } }), // 删除关联赞踩，赞踩需要在Timeline中吗？如果需要，那么就无需在这里删除
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
            return review;
        },
        async thumbReview({ reviewId, userId, direction }) {
            const toDelete = await fastify.db.reviewThumb.findUnique({ where: { reviewId_userId: { reviewId, userId, } } });
            // 直接删除当前的赞或者踩
            // 如果新的点踩或者点赞与删除的不同，则重新创建
            if (toDelete) await fastify.db.reviewThumb.delete({ where: { reviewId_userId: { reviewId, userId, } } });
            if (!toDelete || toDelete.direction !== direction) {
                await fastify.db.reviewThumb.create({ data: { reviewId, userId, direction } });
            }
            // 如果是新创建的点赞，而且不是自己给自己点赞，则发出反馈通知
            if (direction === 'up' && !toDelete) {
                const review = await fastify.db.review.findUnique({ where: { id: reviewId }, select: { id: true, userId: true } });
                if (review.userId !== userId) {
                    await fastify.notification.addReactionNotification({
                        action: Notification.action.reviewThumbed,
                        userId: review.userId, // 反馈通知的对象
                        target: Notification.target.User, targetId: userId,
                        content: Notification.getContent(Notification.action.reviewThumbed, Notification.type.reaction),
                        url: `/reviews/${review.id}`,
                    });
                }
            }
        },
        async sendReviewGift({ reviewId, userId, giftId }) {
            const gift = await fastify.db.gift.findUnique({ where: { id: giftId } });
            if (!gift) throw new Error(ReviewErrors.giftNotFound);

            await fastify.db.$transaction(async (tx) => {
                // 减去balance
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: { balance: { decrement: gift.price } }
                });
                // 检查余额， 有问题就回滚事务
                if (updatedUser.balance < 0) throw new Error(ReviewErrors.insufficientBalance);
                await tx.trading.create({ data: { userId, target: 'Gift', targetId: giftId, amount: gift.price, type: Trading.type.buy } }); // 生成交易
                const giftRef = await tx.reviewGiftRef.create({ data: { userId, giftId, reviewId } }); // 创建关系
                await tx.timeline.create({ data: { userId, target: 'ReviewGiftRef', targetId: giftRef.id } }); // 创建动态
            });

            // 发送通知
            const review = await fastify.db.review.findUnique({ where: { id: reviewId }, select: { id: true, userId: true } });
            if (review.userId !== userId) { // 如果不是自己给自己发礼物，则发出反馈通知
                await fastify.notification.addReactionNotification({
                    action: Notification.action.reviewGiftSent,
                    userId: review.userId, // 反馈通知的对象
                    target: Notification.target.User, targetId: userId,
                    content: Notification.getContent(Notification.action.reviewGiftSent, Notification.type.reaction),
                    url: `/reviews/${review.id}`,
                });
            }
        },
        async reportReview({ reviewId, userId, content }) {
            const exists = (await fastify.db.reviewReport.count({ where: { postId, userId } })) > 0;
            if (!exists) await fastify.db.reviewReport.create({ data: { userId, reviewId, content } });
        },
        // 获取某个评测的礼物数据
        async getReviewGifts({ id }) {
            const gifts = await fastify.db.$queryRaw`
                SELECT Gift.id, Gift.name, Gift.description, Gift.url, Gift.price, count(ReviewGiftRef.user_id) AS count FROM ReviewGiftRef, Gift
                WHERE Gift.id = ReviewGiftRef.gift_id AND review_id = ${id} GROUP BY ReviewGiftRef.gift_id;
            `;
            let giftCount = 0;
            gifts.forEach(async (gift) => { gift.count = Number(gift.count) || 0; giftCount += gift.count; });
            return { gifts, count: giftCount };
        },
        // 获取某个评测的赞踩数据
        async getReviewThumbs({ id }) {
            return (await fastify.db.$queryRaw`
                SELECT (SELECT count(*) FROM ReviewThumb WHERE direction = 'up' AND review_id = ${id}) AS ups,
                (SELECT count(*) FROM ReviewThumb WHERE direction = 'down' AND review_id = ${id}) AS downs
            `)[0];
        },
    });
    next();
};

export default review;
