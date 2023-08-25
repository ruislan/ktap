const Notification = {
    type: { system: 'system', following: 'following', reaction: 'reaction', },
    target: { App: 'App', User: 'User' },
    settings: {
        followingAppChanged: 'followingAppChanged', followingUserChanged: 'followingUserChanged',
        reactionReplied: 'reactionReplied', reactionThumbed: 'reactionThumbed', reactionGiftSent: 'reactionGiftSent',
    },
    action: {
        newsCreated: 'newsCreated',
        reviewCreated: 'reviewCreated', commentCreated: 'commentCreated',
        discussionCreated: 'discussionCreated', postCreated: 'postCreated',
        reviewThumbed: 'reviewThumbed', postThumbed: 'postThumbed',
        reviewGiftSent: 'reviewGiftSent', postGiftSent: 'postGiftSent',
    },
    getContent(action, type) {
        switch (action) {
            case Notification.action.newsCreated: return '发表了一篇新闻';
            case Notification.action.reviewCreated: return '发表了一篇评测';
            case Notification.action.commentCreated: return type === Notification.type.following ? '回复了一篇评测' : '你的评测有新的回复';
            case Notification.action.discussionCreated: return '发表了一篇讨论主题';
            case Notification.action.postCreated: return type === Notification.type.following ? '发表了一篇讨论回帖' : '你的讨论有新的回帖';
            case Notification.action.reviewThumbed: return type === Notification.type.following ? '点赞了一篇评测' : '你的评测有新的点赞';
            case Notification.action.postThumbed: return type === Notification.type.following ? '点赞了一篇讨论回帖' : '你的讨论回帖有新的点赞';
            case Notification.action.reviewGiftSent: return type === Notification.type.following ? '给一篇评测赠送了礼物' : '你的评测收到了新的礼物';
            case Notification.action.postGiftSent: return type === Notification.type.following ? '给一篇讨论回帖赠送了礼物' : '你的讨论回帖收到了新的礼物';
            default: return '';
        }
    },
    newInstance: (ctx) => {
        return {
            async addSystemNotification({ userId, title = '系统', content }) {
                await ctx.db.notification.create({
                    data: {
                        userId, type: Notification.type.system, title, content,
                    }
                });
            },
            // 关注通知，需要查询 following 的User极其setting，然后再根据这个行动查看是否需要通知
            async addReactionNotification({ action, userId, target, targetId, title, content, url }) {
                const setting = await ctx.db.userSetting.findUnique({ where: { userId } });
                const options = setting?.options ? JSON.parse(setting.options) : {};
                let canNotify = false;
                switch (action) {
                    // 有人回复了我的评论和讨论，给我发送通知
                    case Notification.action.postCreated:
                    case Notification.action.commentCreated:
                        canNotify = options?.notification[Notification.settings.reactionReplied] || false;
                        break;
                    // 有人赞了我的评论和讨论，给我发送通知
                    case Notification.action.reviewThumbed:
                    case Notification.action.postThumbed:
                        canNotify = options?.notification[Notification.settings.reactionThumbed] || false;
                        break;
                    // 有人赏了礼物给我的评论和讨论，给我发送通知
                    case Notification.action.reviewGiftSent:
                    case Notification.action.postGiftSent:
                        canNotify = options?.notification[Notification.settings.reactionGiftSent] || false;
                        break;
                    default: break;
                }

                if (!canNotify) return null;

                await ctx.db.notification.create({
                    data: {
                        type: Notification.type.reaction,
                        userId, title, content,
                        target, targetId, url
                    }
                });
            },
            // 反馈通知，只针对某个人进行通知，也只需要查询当前这个人的设置，然后根据这个行动查看是是否需要通知
            async addFollowingNotification({ action, userId, target, targetId, title, content, url, }) {
                // 获得关注的用户, XXX 如果关注的用户过多，例如:100K+？那就有钱换一个更棒的处理的模式了。
                let followers = [];
                if (target === Notification.target.App) {
                    followers = await ctx.db.$queryRaw`
                    SELECT User.id, User.name FROM User, FollowApp
                    WHERE FollowApp.app_id = ${targetId} AND FollowApp.follower_id = User.id;
                `;
                } else if (target === Notification.target.User) {
                    followers = await ctx.db.$queryRaw`
                    SELECT User.id, User.name FROM User, FollowUser
                    WHERE FollowUser.user_id = ${targetId} AND FollowUser.follower_id = User.id;
                `;
                }

                const followerSettings = await ctx.db.userSetting.findMany({ where: { userId: { in: followers.map(f => f.id) } } });

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
                            canNotify = options?.notification[Notification.settings.followingUserChanged] || false;
                            break;
                        // 我关注的游戏有了新的新闻、事件等，给我发送通知
                        case Notification.action.newsCreated:
                            canNotify = options?.notification[Notification.settings.followingAppChanged] || false;
                            break;
                    }

                    if (!canNotify) continue;
                    dataList.push({ userId, type, target, targetId, url, title, content, });
                }

                // Prisma 虽然不支持 SQLite createMany，但是如果放在同一个 transaction 中，性能会好很多 https://sqlite.org/faq.html#q19
                await ctx.db.$transaction(dataList.map(data => ctx.db.notification.create({ data })));
            }
        };
    },
};

export default Notification;
