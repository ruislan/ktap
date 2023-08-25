import { Notification, Pagination } from "../../constants.js";

const news = async function (fastify, opts) {
    fastify.delete('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        await fastify.db.news.delete({ where: { id }, });
        return reply.code(204).send();
    });

    fastify.get('', async (req, reply) => {
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const keyword = req.query.keyword || '';
        const whereCondition = {};
        if (keyword.length > 0) {
            whereCondition.OR = [
                { title: { contains: keyword } },
                { summary: { contains: keyword } },
                { content: { contains: keyword } },
            ];
        }
        const count = await fastify.db.news.count({ where: whereCondition });
        const data = await fastify.db.news.findMany({
            where: whereCondition,
            select: {
                id: true, content: true, title: true, summary: true, head: true, banner: true, viewCount: true, createdAt: true, updatedAt: true,
                app: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.post('', async (req, reply) => {
        let { appId, title, summary, content, head, banner } = req.body;
        appId = Number(appId) || 0;
        if (appId > 0) {
            const news = await fastify.db.news.create({
                data: {
                    title, summary, content, head, banner, appId,
                }
            });
            // 发送新闻通知给关注用户
            await fastify.utils.addFollowingNotification({
                action: Notification.action.newsCreated, target: Notification.target.App, targetId: appId,
                title, content: summary, url: '/news/' + news.id,
            });
        }
        return reply.code(201).send();
    });

    fastify.put('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        let { appId, title, summary, content, head, banner } = req.body;
        appId = Number(appId) || 0;
        if (appId > 0) {
            await fastify.db.news.update({
                where: { id },
                data: {
                    title, summary, content, head, banner, appId,
                }
            });
        }
        return reply.code(204).send();
    });
};

export default news;
