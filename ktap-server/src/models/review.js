'use strict';

export const ReviewEvents = {
    Created: 'review.created',
};

const review = async (fastify, opts, next) => {
    fastify.decorate('review', {
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
