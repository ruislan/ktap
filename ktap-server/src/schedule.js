import cron from 'node-cron';
import ms from 'ms';

const schedule = async (fastify, opts, next) => {
    const jobForProcessExpiredNotifications = cron.schedule('0 0 5 * * *', async () => { // every day at 2:00
        const max = process.env.NOTIFICATION_PER_USER_MAX || 10;
        fastify.log.info(`Start deleting each user's notifications, the count > ${max} will be deleted`);
        const resultCount = await fastify.db.$executeRaw`
            DELETE FROM Notification
            WHERE id IN (
                SELECT id
                FROM (
                    SELECT n.id, n.user_id, COUNT(*) AS total
                    FROM Notification AS n
                    GROUP BY n.id, n.user_id
                    HAVING total > ${max}
                ) AS sub
            )
        `;
        fastify.log.info(`Expired notifications deleted, count: ${resultCount}`);
    }, { scheduled: false });

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
        fastify.log.info(`Start deleting expired jwt tokens in black list, the time before ${deadline.toISOString()} will be deleted`);
        const result = await fastify.db.timeline.deleteMany({ where: { createdAt: { lt: deadline, } } });
        fastify.log.info(`Expired jwt tokens in black list were deleted, count: ${result.count}`);
    }, { scheduled: false });


    fastify.ready(() => {
        jobForProcessExpiredTimeline.start();
        fastify.log.info('The schedule job for [Process expired timeline] started. cron [0 0 3 * * *].');
        jobForProcessExpiredTokenBlackList.start();
        fastify.log.info('The schedule job for [Process expired jwt token in black list] started. cron [0 0 4 * * *].');
        jobForProcessExpiredNotifications.start();
        fastify.log.info('The schedule job for [Process expired timeline] started. cron [0 0 5 * * *].');
    });

    fastify.addHook('onClose', async () => {
        jobForProcessExpiredTimeline.stop();
        fastify.log.info('The schedule job for [Process expired timeline] stopped.');
        jobForProcessExpiredTokenBlackList.stop();
        fastify.log.info('The schedule job for [Process expired token black list] stopped.');
        jobForProcessExpiredNotifications.stop();
        fastify.log.info('The schedule job for [Process expired notifications] stopped.');
    });

    next();
};

export default schedule;
