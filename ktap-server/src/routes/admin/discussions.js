import { LIMIT_CAP } from "../../constants.js";

const discussions = async function (fastify, opts) {
    fastify.delete('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        await fastify.utils.deleteDiscussion({ id, operator: req.user });
        return reply.code(204).send();
    });

    fastify.get('', async (req, reply) => {
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
        const keyword = req.query.keyword || '';
        const count = await fastify.db.discussion.count({ where: { title: { contains: keyword } } });
        const data = await fastify.db.discussion.findMany({
            where: { title: { contains: keyword } },
            select: {
                id: true, title: true, createdAt: true, updatedAt: true,
                user: { select: { id: true, name: true }, },
                app: { select: { id: true, name: true } },
                channel: { select: { id: true, name: true } },
                _count: { select: { posts: true } },
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

    fastify.post('/monkey', async (req, reply) => {
        const { userId, title, content, isAll } = req.body;
        const count = Number(req.body.appCount) || 10;

        let skip = 0;
        let hasMore = true;
        const limit = 100; // 最多一次处理 100 个，避免一次性处理太多内容
        while (hasMore) {
            const take = isAll ? limit : Math.min(limit, count - skip); // 是否全部处理，全部处理就拿limit的数量，如果不是，则需要计算count剩余的数量和limit谁大
            const appChannels = await fastify.db.discussionChannel.findMany({
                distinct: ['appId'],
                select: { id: true, app: { select: { id: true } } }, orderBy: { createdAt: 'asc' },
                take, skip,
            });
            for (const channel of appChannels) {
                try {
                    await fastify.utils.createDiscussion({ appId: channel.app.id, channelId: channel.id, userId: Number(userId) || req.user.id, title, content, ip: null });
                } catch (ignore) {
                    // ignore
                }
            }
            skip += limit;
            hasMore = appChannels.length === limit; // 如果少于的数量不超过 limit，则不需要继续
        }
        return reply.code(201).send();
    });
};

export default discussions;
