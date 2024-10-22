import cron from 'node-cron';

export default async function job(fastify, opts) {
    const name = 'Delete Expired Notifications';
    const expression = '0 0 5 * * *'; // every day at 5:00
    const job = cron.schedule(expression,
        async () => {
            fastify.log.info(`Start deleting each user's notifications...`);
            const resultCount = await fastify.notification.deleteExpiredNotifications();
            fastify.log.info(`Expired notifications deleted, count: ${resultCount}`);
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

    return;
};
