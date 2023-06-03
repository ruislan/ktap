import cron from 'node-cron';
import ms from 'ms';

const schedule = async (fastify, opts, next) => {

    const jobForProcessExpiredTimeline = cron.schedule('0 0 3 * * *', async () => { // every day at 3:00
        const expiredDay = 300; // 300天
        const deadline = new Date();
        deadline.setDate(deadline.getDate() - expiredDay);
        fastify.log.info(`Start deleting expired timeline, the time before ${deadline.toISOString()} will be deleted`);
        const result = await fastify.db.timeline.deleteMany({
            where: { createdAt: { lt: deadline, } }
        });
        fastify.log.info(`Expired timeline deleted, count: ${result.count}`);
    }, { scheduled: false });

    // XXX 最简单的方式(不是最佳的），读取配置的JWT过期时间，超过这个时间的直接清除（通常这个过期时间不会轻易变动）
    const jobForProcessExpiredTokenBlackList = cron.schedule('0 0 4 * * *', async () => { // every day at 4:00
        const deadline = new Date(Date.now() - ms(process.env.JWT_SIGN_EXPIRES_IN));
        fastify.log.info(`Start deleting expired token in black list, the time before ${deadline.toISOString()} will be deleted`);
        const result = await fastify.db.timeline.deleteMany({ where: { createdAt: { lt: deadline, } } });
        fastify.log.info(`Expired timeline deleted, count: ${result.count}`);
    }, { scheduled: false });

    fastify.ready(() => {
        jobForProcessExpiredTimeline.start();
        fastify.log.info('The schedule job for [Process expired timeline] started. cron [0 0 3 * * *].');
        jobForProcessExpiredTokenBlackList.start();
        fastify.log.info('The schedule job for [Process expired jwt token in black list] started. cron [0 0 4 * * *].');
    });

    fastify.addHook('onClose', async () => {
        jobForProcessExpiredTimeline.stop();
        fastify.log.info('The schedule job for [Process expired timeline] stopped.');
        jobForProcessExpiredTokenBlackList.stop();
        fastify.log.info('The schedule job for [Process expired token black list] stopped.');
    });

    next();
};

export default schedule;
