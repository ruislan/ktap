import { Pagination, Trading } from '../../constants.js';

const users = async function (fastify, opts) {
    fastify.get('', async (req, reply) => {
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        const keyword = req.query.keyword || '';
        const hasParamIsAdmin = !!req.query.isAdmin;
        const hasParamIsLocked = !!req.query.isLocked;
        const isAdmin = (req.query.isAdmin || 'false').toLowerCase() === 'true';
        const isLocked = (req.query.isLocked || 'false').toLowerCase() === 'true';
        const hasReviews = (req.query.hasReviews || 'false').toLowerCase() === 'true';
        const hasComments = (req.query.hasComments || 'false').toLowerCase() === 'true';

        const whereCondition = {};
        if (keyword.length > 0) whereCondition.name = { contains: keyword };
        if (hasParamIsAdmin) whereCondition.isAdmin = isAdmin;
        if (hasParamIsLocked) whereCondition.isLocked = isLocked;
        if (hasReviews) whereCondition.reviews = { some: {} };
        if (hasComments) whereCondition.reviewComments = { some: {} };

        const count = await fastify.db.user.count({ where: whereCondition });
        const data = await fastify.db.user.findMany({
            where: whereCondition,
            select: {
                id: true, name: true, email: true, avatar: true, isAdmin: true, createdAt: true, updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.get('/:username', async (req, reply) => {
        const username = req.params.username;
        const data = await fastify.db.user.findFirst({
            where: {
                OR: [
                    { id: Number(username) || 0, },
                    { name: username, }
                ],
            },
        });
        delete data.password;
        return reply.code(200).send({ data });
    });

    fastify.put('/:id/basis', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const amount = Number(req.body.amount) || 0;
        await fastify.db.user.update({
            where: { id },
            data: {
                title: req.body.title,
                isLocked: req.body.isLocked,
                isAdmin: req.body.isAdmin,
                balance: { increment: amount, }
            }
        });
        if (amount > 0) {
            // XXX 现在就直接一条交易信息即可，后续可以推出一个账户体系，由系统铸造之后，转账给用户
            await fastify.db.trading.create({
                data: {
                    userId: 0, target: 'User', targetId: id, amount, type: Trading.type.give,
                },
            });
        }
        return reply.code(204).send();
    });

    fastify.put('/:id/profile', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { gender, bio, location } = req.body;
        await fastify.db.user.update({
            where: { id },
            data: { gender, bio, location, }
        });
        return reply.code(204).send();
    });

    fastify.post('/monkey', async (req, reply) => {
        const date = Date.now();
        const { count } = req.body;
        const password = await fastify.bcrypt.hash('123456');
        for (let i = 1; i <= count; i++) {
            const name = `m${date}${i}`;
            await fastify.db.user.create({
                data: {
                    name, email: `${name}@ktap.com`, password, birthday: new Date(),
                }
            });
        }
        return reply.code(201).send();
    });

    fastify.put('/:id/avatar', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const nowStr = '' + Date.now();
        await fastify.db.user.update({
            where: { id },
            data: { avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${nowStr.substring(nowStr.length - 7)}&size=256`, }
        });
        return reply.code(204).send();
    });

    fastify.get('/:id/reviews', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        const count = await fastify.db.review.count({ where: { userId: id } });
        const data = await fastify.db.review.findMany({
            where: { userId: id, },
            select: { id: true, content: true, score: true, createdAt: true, updatedAt: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.get('/:id/review-comments', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        const count = await fastify.db.reviewComment.count({ where: { userId: id } });
        const data = await fastify.db.reviewComment.findMany({
            where: { userId: id, },
            select: { id: true, content: true, reviewId: true, createdAt: true, updatedAt: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    fastify.get('/:id/tradings', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);
        const whereCondition = {
            OR: [
                { userId: id, },
                {
                    AND: {
                        target: 'User',
                        targetId: id,
                    }
                }
            ]
        };
        const count = await fastify.db.trading.count({ where: whereCondition });
        const data = await fastify.db.trading.findMany({
            where: whereCondition,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });
};

export default users;
