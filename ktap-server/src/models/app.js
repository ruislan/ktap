'use strict';

import { AppMedia } from '../constants.js';

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
        // XXX 将以下这些行为做成 Event，根据 Event 来异步刷新热力值。思考一下异步刷新热力值的必要性，
        // XXX 如果一个 App 很热，又很多人写评测，又有很多人评论，是不是写入就会很频繁，就会产生很多的事件（如果消息队列的话，会有大量消息产生）。
        // XXX 而这么多的事件，其实就一个事儿，刷新热力值，所以这里有两个思路：
        // XXX 1. 依然是访问的时候直接计算，而过热访问可以使用缓存技术来处理。
        // XXX 2. 获取到计算事件的时候，不立刻计算，而是等待一段时间（例如 60 秒），或者固定长度（例如 1000 个）事件，然后合并同类计算，这样来避免计算
        // XXX 这里简单为上选择第一个。而第二思路可能未来会去实现，因为这个操作可以适用很多非即时性的计算。
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
        },
        // XXX 热度算法，目前采用最简单的办法，最近一次的评价的时间和当前时间的越近，热度越高，后续会有更多因子影响的算法。
        async getHotApps({ limit }) {
            let apps = await fastify.db.$queryRaw`
                SELECT a.*, am.image, am.thumbnail FROM
                (SELECT a.*, max(r.updated_at) AS latest_updated FROM App a LEFT JOIN Review r ON a.id = r.app_id GROUP BY a.id LIMIT ${limit}) a
                LEFT JOIN AppMedia am ON a.id = am.app_id WHERE a.is_visible=${true} AND am.usage = ${AppMedia.usage.landscape}
                ORDER BY a.latest_updated DESC
            `;
            return apps;
        },
        // XXX 可能需要更多的 opts 来赋予这个 getApps 更多的概括和应变能力
        async getAppsOrderBy({ orderBy, limit }) {
            const apps = await fastify.db.app.findMany({
                where: { isVisible: true, },
                select: {
                    id: true, name: true, summary: true, score: true,
                    media: {
                        where: { usage: AppMedia.usage.head },
                        select: {
                            image: true,
                            thumbnail: true,
                        },
                    },
                },
                orderBy,
                take: limit,
            });
            return apps;
        },
    });
    next();
};

export default app;
