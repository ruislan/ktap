import { AppMedia, Pagination } from '../../constants.js';
import { authenticate } from '../../lib/auth.js';
import { ReviewErrors } from '../../models/review.js';

const reviews = async (fastify, opts) => {
    // 获取评测
    fastify.get('/:id', async function (req, reply) {
        const id = Number(req.params.id);
        const commentIds = (req.query.commentIds || '')?.split(',').map(id => Number(id) || 0).filter(id => id > 0) || [];
        const data = await fastify.db.review.findUnique({
            where: { id },
            include: {
                app: {
                    select: {
                        id: true, name: true, score: true, isVisible: true,
                        media: {
                            where: { OR: [{ usage: AppMedia.usage.head }, { usage: AppMedia.usage.logo }] },
                            select: { image: true, thumbnail: true, usage: true },
                        },
                    }
                },
                comments: {
                    where: { id: { in: commentIds } },
                    select: {
                        id: true, content: true, createdAt: true, updatedAt: true,
                        user: { select: { id: true, name: true, avatar: true, gender: true, title: true } },
                    }
                },
                images: { select: { id: true, url: true } },
                user: { select: { id: true, name: true, avatar: true, gender: true, title: true } },
                _count: { select: { comments: true } },
            }
        });

        if (!data) return reply.code(404).send(); // maybe no data
        // fetch gifts
        const gifts = await fastify.review.getReviewGifts({ id });
        data.gifts = gifts.gifts;

        // fetch meta data
        // 获取礼物，礼物分组并统计送的人的总数
        // 获取赞踩数量
        const thumbs = await fastify.review.getReviewThumbs({ id });
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
    }, async function (req, reply) {
        const id = Number(req.params.id);
        const userId = req.user.id;
        await fastify.review.deleteReview({ id, userId });
        return reply.code(204).send();
    });

    // 获取评测回复
    fastify.get('/:id/comments', async function (req, reply) {
        const id = Number(req.params.id);
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

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
        schema: {
            body: {
                type: 'object',
                properties: {
                    content: { $ref: 'comment#/properties/content' },
                },
                required: ['content'],
                additionalProperties: false,
            }
        }
    }, async function (req, reply) {
        const reviewId = Number(req.params.id);
        const userId = req.user.id;
        const content = req.body.content || '';
        try {
            let data = {};
            if (content.length > 0) data = await fastify.review.commentReview({ reviewId, userId, content, ip: req.ip });
            return reply.code(200).send({ data });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: ReviewErrors.commentFailed });
        }

    });

    // 删除某条回复
    fastify.delete('/:reviewId/comments/:id', {
        preHandler: authenticate,
    }, async function (req, reply) {
        const reviewId = Number(req.params.reviewId);
        const id = Number(req.params.id);
        const userId = req.user.id;
        try {
            await fastify.review.deleteComment({ reviewId, commentId: id, userId });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 修改评测
    fastify.put('/:id', {
        preHandler: authenticate,
    }, async function (req, reply) {
        const userId = req.user.id;
        const id = Number(req.params.id);

        // handle request params
        const parts = req.parts();
        const reqBody = { imagesToSave: [] };
        for await (const part of parts) {
            if (part.file) {
                const buffer = await part.toBuffer();
                reqBody.imagesToSave.push({ filename: part.filename, buffer });
            } else {
                reqBody[part.fieldname] = part.value;
            }
        }
        const content = reqBody.content || '';
        const score = Number(reqBody.score) || 3;
        const allowComment = 'true' === (reqBody.allowComment || 'false').toLowerCase();
        const imagesToDelete = reqBody.imagesToDelete?.split(',').filter(v => v.length > 0).map(v => Number(v));
        const imagesToSave = reqBody.imagesToSave;
        if (content.length === 0) return reply.code(400).send({ message: ReviewErrors.reviewContentEmpty });

        // handle logic
        try {
            await fastify.review.updateReview({ id, userId, content, score, allowComment, imagesToSave, imagesToDelete });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 点赞或点踩
    fastify.post('/:id/thumb/:direction', {
        preHandler: authenticate,
    }, async function (req, reply) {
        const reviewId = Number(req.params.id);
        const userId = req.user.id;
        let direction = ((req.params.direction || 'up').toLowerCase()) === 'down' ? 'down' : 'up'; // only up or down
        try {
            await fastify.review.thumbReview({ reviewId, userId, direction });
            const data = await fastify.review.getReviewThumbs({ id: reviewId }); // 重新取当前review的数据
            return reply.code(200).send({ data });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 送礼物
    fastify.post('/:id/gifts/:giftId', {
        preHandler: authenticate,
    }, async function (req, reply) {
        const userId = req.user.id;
        const reviewId = Number(req.params.id);
        const giftId = Number(req.params.giftId);
        try {
            await fastify.review.sendReviewGift({ reviewId, userId, giftId });
            const gifts = await fastify.review.getReviewGifts({ id: reviewId }); // 读取最新的礼物情况
            return reply.code(200).send({ data: gifts.gifts, count: gifts.count });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 举报
    fastify.post('/:id/report', {
        preHandler: authenticate,
        schema: {
            body: {
                type: 'object',
                properties: {
                    content: { $ref: 'report#/properties/content' },
                },
                required: ['content'],
                additionalProperties: false,
            },
        }
    }, async function (req, reply) {
        const userId = req.user.id;
        const reviewId = Number(req.params.id);
        const content = req.body.content;

        try {
            await fastify.review.reportReview({ reviewId, userId, content });
            return reply.code(200).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });
};

export default reviews;
