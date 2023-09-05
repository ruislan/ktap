'use client';

const app = async (fastify, opts, next) => {
    fastify.decorate('app', {
        // 计算 App 的评分
        async computeAppScore({ appId }) {
            if (appId <= 0) return;
            await fastify.db.$queryRaw`
                UPDATE App SET score = avgScore FROM
                (SELECT ROUND(COALESCE(AVG(score), 4), 1) AS avgScore FROM review WHERE app_id = ${appId})
                WHERE App.id = ${appId};
            `;
        },
    });
    next();
};

export default app;
