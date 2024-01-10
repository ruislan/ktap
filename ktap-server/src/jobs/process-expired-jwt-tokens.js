import cron from 'node-cron';
import ms from 'ms';

// XXX 最简单的方式(不是最佳的），读取配置的JWT过期时间，超过这个时间的直接清除（通常这个过期时间不会轻易变动）
export default async function job(fastify, opts) {
    const name = 'Delete Expired Tokens in BlackList';
    const expression = '0 0 4 * * *'; // every day at 5:00
    const job = cron.schedule(expression,
        async () => {
            const deadline = new Date(Date.now() - ms(process.env.JWT_SIGN_EXPIRES_IN));
            fastify.log.info(`Start deleting expired jwt tokens in black list, the time before ${deadline.toISOString()} will be deleted`);
            const result = await fastify.db.timeline.deleteMany({ where: { createdAt: { lt: deadline, } } });
            fastify.log.info(`Expired jwt tokens in black list were deleted, count: ${result.count}`);
        },
        { scheduled: false }
    );

    fastify.ready(() => {
        job.start();
        fastify.log.info(`Cron job [${name}] started. cron expression ${expression}.`);
    });

    fastify.addHook('onClose', async () => {
        job.stop();
        fastify.log.info(`Cron job [${name}] stopped.`);
    });
};
