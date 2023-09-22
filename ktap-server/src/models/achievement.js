'use strict';
import { Pagination } from '../constants.js';

const fakeData = [
    { icon: '/public/img/achievements/a2.png', name: '初出茅庐', description: '首次登陆', progress: '99/1000', userId: 1 },
    { icon: '/public/img/achievements/a3.png', name: '初出茅庐', description: '首次登陆', progress: '1/1', unlockedAt: '2023-10-01', userId: 1 },
    { icon: '/public/img/achievements/a4.png', name: '初出茅庐', description: '首次登陆', progress: '1/1', unlockedAt: '2023-10-01', userId: 1 },
    { icon: '/public/img/achievements/a5.png', name: '初出茅庐', description: '首次登陆', progress: '0/1' },
    { icon: '/public/img/achievements/a6.png', name: '初出茅庐', description: '首次登陆', progress: '0/1' },
    { icon: '/public/img/achievements/a7.png', name: '初出茅庐', description: '首次登陆', progress: '0/1' },
];

// 将"_"转化成驼峰
function convertToCamelCase(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var newKey = key.replace(/_([a-z])/g, (_, f) => f.toUpperCase());
            if (newKey !== key) {
                obj[newKey] = obj[key];
                delete obj[key];
            }
        }
    }
    return obj;
}

// 成就
const achievement = async (fastify, opts, next) => {
    fastify.decorate('achievement', {
        // 获得某个用户已经获得的成就
        // 会将所有的成就都读出来，然后用户已经完成的会排在前面
        async getUserAchievements({ userId, skip = 0, limit = Pagination.limit.default }) {
            if (!userId) return [];
            const data = await fastify.db.$queryRaw`
                SELECT Achievement.*, COALESCE(UserAchievementRef.accumulation,0) AS accumulation, UserAchievementRef.unlocked_at
                FROM Achievement LEFT JOIN (SELECT * FROM UserAchievementRef WHERE UserAchievementRef.user_id = ${userId}) UserAchievementRef
                ON Achievement.id = UserAchievementRef.achievement_id
                ORDER BY UserAchievementRef.unlocked_at DESC
                LIMIT ${skip},${limit}
            `;
            return data.map(item => convertToCamelCase(item));
        },
        // 获得某个用户最近获得的成就
        async getUserRecentAchievements({ userId, limit = Pagination.limit.default }) {
            if (!userId) return [];
            const data = await fastify.db.userAchievementRef.findMany({
                where: { userId },
                orderBy: { unlockedAt: 'desc' },
                select: {
                    userId: true, unlockedAt: true, createdAt: true, accumulation: true,
                    achievement: {
                        select: {
                            id: true, name: true, description: true, icon: true, criteria: true,
                        }
                    }
                },
                take: limit,
            });
            // flat data
            return data.map(item => ({ ...item.achievement, unlockedAt: item.unlockedAt, accumulation: item.accumulation }));
        },
        // 获得某个用户已经获得的成就总数
        async countAchievements(params) {
            if (!params) return await fastify.db.achievement.count();
            const { userId } = params;
            if (!userId) return await fastify.db.achievement.count();
            return await fastify.db.userAchievementRef.count({ where: { userId } });
        }
    });
    next();
};

export default achievement;
