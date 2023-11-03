'use strict';

import { Notification } from '../constants.js';

const notification = async (fastify, opts, next) => {
    fastify.decorate('notification', {
        async addSystemNotification({ userId, title = '系统', content }) {
            await fastify.db.notification.create({
                data: {
                    userId, type: Notification.type.system, title, content, extra: '',
                }
            });
        },

        // 清空整个通知分类
        async clearUserNotifications({ userId, type = Notification.type.system }) {
            await fastify.db.notification.deleteMany({ where: { userId, type }, });
        },
        // 整个通知分类标记已读
        async markReadUserNotifications({ userId, type = Notification.type.system }) {
            await fastify.db.notification.updateMany({ where: { userId, type }, data: { isRead: true } });
        },
        // 单个通知标记已读
        async markReadUserNotification({ id, userId }) {
            await fastify.db.notification.update({ where: { id, userId }, data: { isRead: true }, });
        },

        // 反馈通知，只针对某个人进行通知，也只需要查询当前这个人的设置，然后根据这个行动查看是是否需要通知
        async addReactionNotification({ action, userId, target, targetId, title = '通知', content, url }) {
            const setting = await fastify.db.userSetting.findUnique({ where: { userId } });
            const options = setting?.options ? JSON.parse(setting.options) : {};
            let canNotify = false;
            switch (action) {
                // 有人回复了我的评论和讨论，给我发送通知
                case Notification.action.postCreated:
                case Notification.action.commentCreated:
                    canNotify = options?.notification && options.notification[Notification.settings.reactionReplied];
                    break;
                // 有人赞了我的评论和讨论，给我发送通知
                case Notification.action.reviewThumbed:
                case Notification.action.postThumbed:
                    canNotify = options?.notification && options.notification[Notification.settings.reactionThumbed];
                    break;
                // 有人赏了礼物给我的评论和讨论，给我发送通知
                case Notification.action.reviewGiftSent:
                case Notification.action.postGiftSent:
                    canNotify = options?.notification && options.notification[Notification.settings.reactionGiftSent];
                    break;
                default: break;
            }

            if (!canNotify) return null;

            await fastify.db.notification.create({
                data: {
                    type: Notification.type.reaction,
                    userId, title, content, extra: '',
                    target, targetId, url
                }
            });
        },

        // 关注通知，需要查询 following 的User极其setting，然后再根据这个行动查看是否需要通知
        async addFollowingNotification({ action, target, targetId, title = '通知', content, url, }) {
            // 获得关注的用户, XXX 如果关注的用户过多，例如:100K+？那就有钱换一个更棒的处理的模式了。
            let followers = [];
            if (target === Notification.target.App) {
                followers = await fastify.db.$queryRaw`
                    SELECT User.id, User.name FROM User, FollowApp
                    WHERE FollowApp.app_id = ${targetId} AND FollowApp.follower_id = User.id;
                `;
            } else if (target === Notification.target.User) {
                followers = await fastify.db.$queryRaw`
                    SELECT User.id, User.name FROM User, FollowUser
                    WHERE FollowUser.user_id = ${targetId} AND FollowUser.follower_id = User.id;
                `;
            }
            const followerSettings = await fastify.db.userSetting.findMany({ where: { userId: { in: followers.map(f => Number(f.id)) } } });

            const dataList = [];
            for (const followerSetting of followerSettings) { // 没有配置的follower就不需要通知
                const options = followerSetting?.options ? JSON.parse(followerSetting.options) : {};
                let canNotify = false;
                switch (action) {
                    // 我关注的用户有了新的评测、回复、讨论等，给我发送通知
                    case Notification.action.discussionCreated:
                    case Notification.action.postCreated:
                    case Notification.action.commentCreated:
                    case Notification.action.reviewCreated:
                        canNotify = options?.notification && options.notification[Notification.settings.followingUserChanged];
                        break;
                    // 我关注的游戏有了新的新闻、事件等，给我发送通知
                    case Notification.action.newsCreated:
                        canNotify = options?.notification && options.notification[Notification.settings.followingAppChanged];
                        break;
                }
                if (!canNotify) continue;
                dataList.push({ userId: followerSetting.userId, type: Notification.type.following, target, targetId, url, title, content, extra: '' });
            }
            // Prisma 虽然不支持 SQLite createMany，但是如果放在同一个 transaction 中，性能会好很多 https://sqlite.org/faq.html#q19
            await fastify.db.$transaction(dataList.map(data => fastify.db.notification.create({ data })));
        },

        // 删除过期的通知
        async deleteExpiredNotifications() {
            const max = process.env.NOTIFICATION_PER_USER_MAX || 100; // 每个用户最多 100 条。
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
            return resultCount;
        }
    });
    next();
};
export default notification;
