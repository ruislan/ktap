'use client';

const app = async (fastify, opts, next) => {
    fastify.decorate('app', {
        // 计算并更新 App 的评分
        async computeAndUpdateAppScore({ appId }) {
            if (appId <= 0) return;
            await fastify.db.$queryRaw`
                UPDATE App SET score = avgScore FROM
                (SELECT ROUND(COALESCE(AVG(score), 4), 1) AS avgScore FROM review WHERE app_id = ${appId})
                WHERE App.id = ${appId};
            `;
        },
        // 当前热力指数计算非常简单，通过加权算法来计算最近 1 周的数值，关注*2 + 评测*10 + 评测回复*1 + 讨论*5 + 讨论回复*1
        // TODO 将以下这些行为做成 Event，根据 Event 来异步刷新热力值，而且需要保证在系统崩溃的时候能够得到保证事件完成
        async computeAppPopular({ appId }) {
            const limitDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const hotOriginData = (await fastify.db.$queryRaw`
                SELECT p1.cnt AS p1, p2.cnt AS p2, p3.cnt AS p3, p4.cnt AS p4, p5.cnt AS p5 FROM
                    (SELECT count(id) AS cnt FROM FollowApp WHERE app_id = ${appId} AND created_at >= ${limitDate}) AS p1,
                    (SELECT count(id) AS cnt FROM Review WHERE app_id = ${appId} AND created_at >= ${limitDate}) AS p2,
                    (SELECT count(id) AS cnt FROM ReviewComment WHERE review_id in (SELECT id FROM Review WHERE app_id = ${appId} AND created_at >= ${limitDate})) AS p3,
                    (SELECT count(id) AS cnt FROM Discussion WHERE app_id = ${appId} AND created_at >= ${limitDate}) AS p4,
                    (SELECT count(id) AS cnt FROM DiscussionPost WHERE discussion_id in (SELECT id FROM Discussion WHERE app_id = ${appId} AND created_at >= ${limitDate})) AS p5;
            `)[0];
            const popular = Number(hotOriginData.p1) * 2 + Number(hotOriginData.p2) * 10 + Number(hotOriginData.p3) * 1 + Number(hotOriginData.p4) * 5 + Number(hotOriginData.p5) * 1;
            return popular;
        },
        // 计算 App 的计分占比
        // TODO 根据 ReviewEvent 来异步刷新热力值，而且需要保证在系统崩溃的时候能够得到保证事件完成
        async computeAppScoreRatio({ appId }) {
            const lData = (await fastify.db.$queryRaw`
                SELECT l1.cnt AS l1, l2.cnt AS l2, l3.cnt AS l3, l4.cnt AS l4, l5.cnt AS l5 FROM
                    (SELECT count(id) AS cnt FROM Review WHERE app_id = ${appId} AND score = 1) AS l1,
                    (SELECT count(id) AS cnt FROM Review WHERE app_id = ${appId} AND score = 2) AS l2,
                    (SELECT count(id) AS cnt FROM Review WHERE app_id = ${appId} AND score = 3) AS l3,
                    (SELECT count(id) AS cnt FROM Review WHERE app_id = ${appId} AND score = 4) AS l4,
                    (SELECT count(id) AS cnt FROM Review WHERE app_id = ${appId} AND score = 5) AS l5;
            `)[0];
            const ratings = [
                { score: 1, count: Number(lData.l1) || 0 },
                { score: 2, count: Number(lData.l2) || 0 },
                { score: 3, count: Number(lData.l3) || 0 },
                { score: 4, count: Number(lData.l4) || 0 },
                { score: 5, count: Number(lData.l5) || 0 }
            ];
            return ratings;
        }
    });
    next();
};

export default app;
