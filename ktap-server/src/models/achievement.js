'use strict';
import { Pagination } from '../constants.js';
import { DiscussionEvents } from './discussion.js';
import { ReviewEvents } from './review.js';
import { UserEvents } from './user.js';

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
};

export const AchievementTypes = {
    // 1000 ~ 1999 for system
    UserJoin: 1000,
    // 2000 ~ 2999 for review
    FirstReview: 2000,
    TenReviews: 2001,
    // 3000 ~ 3999 for discussion
    FirstDiscussion: 3000,
    TenDiscussions: 3001,
    FirstSticky: 3002, // 讨论第一次被置顶
};

// 成就
async function achievement(fastify, opts) {
    fastify.decorate('achievement', {
        // 获得某个用户已经获得的成就
        // 会将所有的成就都读出来，然后用户已经完成的会排在前面
        async getUserAchievements({ userId, skip = 0, limit = Pagination.limit.default }) {
            if (!userId) return [];
            const data = await fastify.db.$queryRaw`
                SELECT "Achievement".*, COALESCE("UserAchievementRef".accumulation,0) AS accumulation, "UserAchievementRef".unlocked_at
                FROM "Achievement" LEFT JOIN (SELECT * FROM "UserAchievementRef" WHERE "UserAchievementRef".user_id = ${userId}) "UserAchievementRef"
                ON "Achievement".id = "UserAchievementRef".achievement_id
                ORDER BY "UserAchievementRef".unlocked_at DESC
                LIMIT ${limit} OFFSET ${skip}
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
        },

        // 监听事件，检查是否达到了需要发送成就的情况
        async onUserRegistered({ user }) {
            const unlockedAt = new Date();
            const userAchievement = await fastify.db.userAchievementRef.upsert({
                where: { userId_achievementId: { userId: user.id, achievementId: AchievementTypes.UserJoin } },
                create: { userId: user.id, achievementId: AchievementTypes.UserJoin, accumulation: 1, unlockedAt },
                update: {},
            });
            if (userAchievement.unlockedAt.getTime() == unlockedAt.getTime()) { // first unlock
                const achievement = await fastify.db.achievement.findUnique({ where: { id: AchievementTypes.UserJoin } });
                if (achievement.message) await fastify.notification.addSystemNotification({ userId: user.id, title: `成就达成 - ${achievement.name}`, content: achievement.message });
            }
        },
        async onReviewCreated({ review }) {
            const userReviewCount = await fastify.db.review.count({ where: { userId: review.userId } });
            if (userReviewCount === 1) {
                // give the user the first review achievement if he haven't had it
                const unlockedAt = new Date();
                const userAchievement = await fastify.db.userAchievementRef.upsert({
                    where: { userId_achievementId: { userId: review.userId, achievementId: AchievementTypes.FirstReview } },
                    create: { userId: review.userId, achievementId: AchievementTypes.FirstReview, accumulation: 1, unlockedAt },
                    update: {},
                });
                // send notification to the user
                if (userAchievement.unlockedAt.getTime() == unlockedAt.getTime()) {
                    const achievement = await fastify.db.achievement.findUnique({ where: { id: AchievementTypes.FirstReview } });
                    if (achievement.message) await fastify.notification.addSystemNotification({ userId: review.userId, title: `成就达成 - ${achievement.name}`, content: achievement.message });
                }
            }

            // accumulate 1 review if the user didn't have it
            const tenReviewsAchievement = await fastify.db.userAchievementRef.upsert({
                where: { userId_achievementId: { userId: review.userId, achievementId: AchievementTypes.TenReviews } },
                create: { userId: review.userId, achievementId: AchievementTypes.TenReviews, accumulation: 1 },
                update: { accumulation: { increment: 1 } },
            });
            // if accumulate >= 10, give the user ten reviews achievement
            if (tenReviewsAchievement.accumulation >= 10) {
                const unlockedAt = new Date();
                const userAchievement = await fastify.db.userAchievementRef.update({
                    where: { userId_achievementId: { userId: review.userId, achievementId: AchievementTypes.TenReviews } },
                    data: { accumulation: 10, unlockedAt },
                });
                if (userAchievement.unlockedAt.getTime() == unlockedAt.getTime()) { // first unlock
                    // send notification to the user
                    const achievement = await fastify.db.achievement.findUnique({ where: { id: AchievementTypes.TenReviews } });
                    if (achievement.message) await fastify.notification.addSystemNotification({ userId: review.userId, title: `成就达成 - ${achievement.name}`, content: achievement.message });
                }
            }
        },
        async onDiscussionCreated({ discussion }) {
            const userDiscussionCount = await fastify.db.discussion.count({ where: { userId: discussion.userId } });
            if (userDiscussionCount === 1) {
                // give the user the first discussion achievement if he haven't had it
                const unlockedAt = new Date();
                const userAchievement = await fastify.db.userAchievementRef.upsert({
                    where: { userId_achievementId: { userId: discussion.userId, achievementId: AchievementTypes.FirstDiscussion } },
                    create: { userId: discussion.userId, achievementId: AchievementTypes.FirstDiscussion, accumulation: 1, unlockedAt },
                    update: {},
                });
                // send notification to the user
                if (userAchievement.unlockedAt.getTime() == unlockedAt.getTime()) { // first unlock
                    const achievement = await fastify.db.achievement.findUnique({ where: { id: AchievementTypes.FirstDiscussion } });
                    if (achievement.message) await fastify.notification.addSystemNotification({ userId: discussion.userId, title: `成就达成 - ${achievement.name}`, content: achievement.message });
                }
            }

            // accumulate 1 discussion if the user didn't have it
            const tenDiscussionAchievement = await fastify.db.userAchievementRef.upsert({
                where: { userId_achievementId: { userId: discussion.userId, achievementId: AchievementTypes.TenDiscussions } },
                create: { userId: discussion.userId, achievementId: AchievementTypes.TenDiscussions, accumulation: 1 },
                update: { accumulation: { increment: 1 } },
            });
            // if accumulate >= 10, give the user ten discussions achievement
            if (tenDiscussionAchievement.accumulation >= 10) {
                const unlockedAt = new Date();
                const userAchievement = await fastify.db.userAchievementRef.update({
                    where: { userId_achievementId: { userId: discussion.userId, achievementId: AchievementTypes.TenDiscussions } },
                    data: { accumulation: 10, unlockedAt, },
                });
                if (userAchievement.unlockedAt.getTime() == unlockedAt.getTime()) { // first unlock
                    // send notification to the user
                    const achievement = await fastify.db.achievement.findUnique({ where: { id: AchievementTypes.TenDiscussions } });
                    if (achievement.message) await fastify.notification.addSystemNotification({ userId: discussion.userId, title: `成就达成 - ${achievement.name}`, content: achievement.message });
                }
            }
        },
        async onDiscussionSticky({ discussion }) {
            // user discussion sticky count
            const stickyCount = await fastify.db.discussion.count({ where: { userId: discussion.userId, isSticky: true } });
            if (stickyCount === 1) {
                const userAchievement = await fastify.db.userAchievementRef.upsert({
                    where: { userId_achievementId: { userId: discussion.userId, achievementId: AchievementTypes.FirstSticky } },
                    create: { userId: discussion.userId, achievementId: AchievementTypes.FirstSticky, accumulation: 1, unlockedAt },
                    update: {},
                });
                if (userAchievement.unlockedAt.getTime() == unlockedAt.getTime()) { // first unlock
                    // send notification to the user
                    const achievement = await fastify.db.achievement.findUnique({ where: { id: AchievementTypes.FirstSticky } });
                    if (achievement.message) await fastify.notification.addSystemNotification({ userId: discussion.userId, title: `成就达成 - ${achievement.name}`, content: achievement.message });
                }
            }
        }
    });

    // add event listener
    await fastify.pubsub.on(UserEvents.Registered, fastify.achievement.onUserRegistered);
    await fastify.pubsub.on(ReviewEvents.Created, fastify.achievement.onReviewCreated);
    await fastify.pubsub.on(DiscussionEvents.Created, fastify.achievement.onDiscussionCreated);
    await fastify.pubsub.on(DiscussionEvents.Sticky, fastify.achievement.onDiscussionSticky);
};

export default achievement;
