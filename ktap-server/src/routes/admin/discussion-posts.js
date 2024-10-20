import { Pagination } from "../../constants.js";

const discussionPosts = async function (fastify, opts) {
    fastify.delete('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        await fastify.discussion.deleteDiscussionPost({ id, operator: req.user });
        return reply.code(204).send();
    });

    fastify.get('', async (req, reply) => {
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const keyword = req.query.keyword || '';
        const isReported = (req.query.isReported || 'false').toLowerCase() === 'true';
        const hasGifts = (req.query.hasGifts || 'false').toLowerCase() === 'true';

        const whereCondition = {};
        if (keyword.length > 0) whereCondition.content = { contains: keyword };
        if (isReported) whereCondition.reports = { some: {} };
        if (hasGifts) whereCondition.gifts = { some: {} };

        const count = await fastify.db.discussionPost.count({ where: whereCondition });
        const data = await fastify.db.discussionPost.findMany({
            where: whereCondition,
            select: {
                id: true, content: true, ip: true, createdAt: true, updatedAt: true,
                user: { select: { id: true, name: true }, },
                discussion: { select: { id: true, title: true } },
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
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        const count = await fastify.db.discussionPostReport.count({ where: { postId: id } });
        const data = await fastify.db.discussionPostReport.findMany({
            where: { postId: id, },
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
        const { userId, content, isAll } = req.body;
        const count = Number(req.body.discussionCount) || 10;

        let skip = 0;
        let hasMore = true;
        const limit = 100; // 最多一次处理 100 个，避免一次性处理太多内容
        while (hasMore) {
            const take = isAll ? limit : Math.min(limit, count - skip); // 是否全部处理，全部处理就拿limit的数量，如果不是，则需要计算count剩余的数量和limit谁大
            const discussions = await fastify.db.discussion.findMany({
                where: { isClosed: false }, // 关闭的讨论不能回复
                select: { id: true }, orderBy: { createdAt: 'desc' },
                take, skip,
            });
            for (const discussion of discussions) {
                try {
                    await fastify.discussion.createDiscussionPost({ content, discussionId: discussion.id, userId });
                } catch (ignore) {
                    // ignore
                }
            }
            skip += limit;
            hasMore = discussions.length === limit; // 如果少于的数量不超过 limit，则不需要继续
        }
        return reply.code(201).send();
    });
}

export default discussionPosts;
