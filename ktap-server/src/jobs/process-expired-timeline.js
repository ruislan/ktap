import cron from 'node-cron';

export default async function job(fastify, opts) {
    const name = 'Delete Expired Timeline';
    const expression = '0 0 3 * * *'; // every day at 5:00
    const job = cron.schedule(expression,
        async () => {
            const resultCount = await fastify.timeline.deleteExpiredTimeline();
            fastify.log.info(`Expired timeline deleted, count: ${resultCount}`);
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
