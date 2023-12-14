import cron from 'node-cron';
import ms from 'ms';

const schedule = async (fastify, opts) => {
    const cronExpressionForProcessExpiredNotifications = '0 0 5 * * *'; // every day at 5:00
    const jobForProcessExpiredNotifications = cron.schedule(cronExpressionForProcessExpiredNotifications,
        async () => {
            fastify.log.info(`Start deleting each user's notifications...`);
            const resultCount = await fastify.notification.deleteExpiredNotifications();
            fastify.log.info(`Expired notifications deleted, count: ${resultCount}`);
        },
        { scheduled: false }
    );

    const cronExpressionForForProcessExpiredTimeline = '0 0 3 * * *';// every day at 3:00
    const jobForProcessExpiredTimeline = cron.schedule(cronExpressionForForProcessExpiredTimeline,
        async () => {
            const resultCount = await fastify.timeline.deleteExpiredTimeline();
            fastify.log.info(`Expired timeline deleted, count: ${resultCount}`);
        },
        { scheduled: false }
    );

    // XXX 最简单的方式(不是最佳的），读取配置的JWT过期时间，超过这个时间的直接清除（通常这个过期时间不会轻易变动）
    const cronExpressionForProcessExpiredTokenBlackList = '0 0 4 * * *';// every day at 4:00
    const jobForProcessExpiredTokenBlackList = cron.schedule(cronExpressionForProcessExpiredTokenBlackList,
        async () => {
            const deadline = new Date(Date.now() - ms(process.env.JWT_SIGN_EXPIRES_IN));
            fastify.log.info(`Start deleting expired jwt tokens in black list, the time before ${deadline.toISOString()} will be deleted`);
            const result = await fastify.db.timeline.deleteMany({ where: { createdAt: { lt: deadline, } } });
            fastify.log.info(`Expired jwt tokens in black list were deleted, count: ${result.count}`);
        },
        { scheduled: false }
    );


    fastify.ready(() => {
        jobForProcessExpiredTimeline.start();
        fastify.log.info(`The schedule job for [Process expired timeline] started. cron ${cronExpressionForForProcessExpiredTimeline}.`);

        jobForProcessExpiredTokenBlackList.start();
        fastify.log.info(`The schedule job for [Process expired jwt token in black list] started. cron ${cronExpressionForProcessExpiredTokenBlackList}.`);

        jobForProcessExpiredNotifications.start();
        fastify.log.info(`The schedule job for [Process expired timeline] started. cron ${cronExpressionForProcessExpiredNotifications}.`);
    });

    fastify.addHook('onClose', async () => {
        jobForProcessExpiredTimeline.stop();
        fastify.log.info('The schedule job for [Process expired timeline] stopped.');
        jobForProcessExpiredTokenBlackList.stop();
        fastify.log.info('The schedule job for [Process expired token black list] stopped.');
        jobForProcessExpiredNotifications.stop();
        fastify.log.info('The schedule job for [Process expired notifications] stopped.');
    });
};

export default schedule;
