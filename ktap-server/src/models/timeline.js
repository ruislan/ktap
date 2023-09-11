'use client';

const app = async (fastify, opts, next) => {
    fastify.decorate('timeline', {
        // 删除过期的timeline
        async deleteExpiredTimeline() {
            const expiredDay = 300; // 300天
            const deadline = new Date();
            deadline.setDate(deadline.getDate() - expiredDay);
            fastify.log.info(`Start deleting expired timeline, the time before ${deadline.toISOString()} will be deleted`);
            const result = await fastify.db.timeline.deleteMany({
                where: { createdAt: { lt: deadline, } }
            });
            return result.count;
        }

    });
    next();
};

export default app;
