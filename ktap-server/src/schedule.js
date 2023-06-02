import cron from 'node-cron';

const schedule = async (fastify, opts, next) => {

    const jobForProcessExpiredTimeline = cron.schedule('0 0 1 * * *', async () => { // every day at 1:00
        const expiredDay = 300; // 300天
        const deadline = new Date();
        deadline.setDate(deadline.getDate() - expiredDay);
        fastify.log.info(`Start deleting expired timeline, the day before ${deadline.toISOString()} will be deleted`);
        const result = await fastify.db.timeline.deleteMany({
            where: { createdAt: { lt: deadline, } }
        });
        fastify.log.info(`Expired timeline deleted, count: ${result.count}`);
    }, { scheduled: false });

    fastify.ready(() => {
        jobForProcessExpiredTimeline.start();
        fastify.log.info('The schedule job for [Process expired timeline] started. cron [0 0 1 * * *].');
    });

    fastify.addHook('onClose', async () => {
        jobForProcessExpiredTimeline.stop();
        fastify.log.info('The schedule job for [Process expired timeline] stopped.');
    });

    next();
};

export default schedule;
