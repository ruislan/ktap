'use strict';

import sanitizeHtml from 'sanitize-html';
import { Notification, Trading } from '../constants.js';

export const DiscussionErrors = {
    notFound: '内容不存在',
    forbidden: '无操作权限',
    giftNotFound: '礼物不存在',
    insufficientBalance: '余额不足',
    channelNotFound: '频道不存在',
    lastChannelIsNotEmpty: '最后一个频道还有帖子',
};

export const DiscussionEvents = {
    Created: 'discussion.created',
    Sticky: 'discussion.sticky',
}

function cleanContent(content) {
    return sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
            'span': ['style'],
        }
    });
};

// 去掉所有的html标签，只保留文本
function cleanHtmlTags(content) {
    return content.replace(/<[^>]+>/g, '');
};

async function discussion(fastify, opts) {
    fastify.decorate('discussion', {
        async canOperate({ obj, objType, operator, operation }) {
            if (!operator || !obj) return false;
            if (operator.isAdmin) return true; // Admin 可以操作一切,
            if (objType === 'Discussion' || objType === 'Post') {
                const discussion = objType === 'Discussion' ? obj : obj.discussion;
                if (!discussion) return false;
                const isModerator = discussion.channel.moderators?.some(moderator => moderator.userId === operator.id);
                const isOwner = obj.userId === operator.id;
                if (operation === 'sticky') return isModerator;
                if (operation === 'close') return isModerator || isOwner;
                if (operation === 'delete') return isModerator || isOwner;
                if (operation === 'update') return isModerator || isOwner;
            } else if (objType === 'DiscussionChannel') {
                const isModerator = obj.moderators?.some(moderator => moderator.userId === operator.id);
                if (operation === 'update') return isModerator;
            }
            return false;
        },
        // discussion
        async getDiscussionOrPostWithChannelModerators({ id, isPost = false }) {
            const discussionInclude = {
                channel: {
                    include: {
                        moderators: {
                            select: { userId: true, }
                        }
                    }
                }
            };
            let obj = null;
            if (isPost) {
                obj = await fastify.db.discussionPost.findUnique({
                    where: { id },
                    include: { discussion: { include: discussionInclude } },
                });
            } else {
                obj = await fastify.db.discussion.findUnique({
                    where: { id: id },
                    include: discussionInclude,
                });
            }
            return obj;
        },
        async updateDiscussionChannel({ id, name, icon, description, appId, operator }) {
            const channel = await fastify.db.discussionChannel.findUnique({ where: { id }, include: { moderators: { select: { userId: true, } } } });
            if (!channel) throw new Error(DiscussionErrors.notFound);
            let canUpdate = await fastify.discussion.canOperate({ obj: channel, objType: 'DiscussionChannel', operator, operation: 'update' });
            if (!canUpdate) throw new Error(DiscussionErrors.forbidden);
            await fastify.db.discussionChannel.update({ where: { id }, data: { name, icon, description, appId }, });
        },
        async createDiscussion({ title, content, appId, channelId, userId, ip }) {
            const result = await fastify.db.$transaction(async (tx) => {
                const discussion = await tx.discussion.create({
                    data: { title, appId, discussionChannelId: channelId, userId, },
                });
                const post = await tx.discussionPost.create({
                    data: {
                        content: cleanContent(content),
                        discussionId: discussion.id, userId, ip,
                    }
                });
                await tx.discussion.update({ where: { id: discussion.id }, data: { lastPostId: post.id } });
                // add first post
                await tx.timeline.create({ data: { userId, targetId: discussion.id, target: 'Discussion', } });
                await tx.timeline.create({ data: { userId, targetId: post.id, target: 'DiscussionPost', } });
                return { discussion, post };
            });
            // add notification
            await fastify.notification.addFollowingNotification({
                action: Notification.action.discussionCreated, target: Notification.target.User, targetId: userId,
                title: Notification.getContent(Notification.action.discussionCreated, Notification.type.following),
                content: result.discussion.title, url: '/discussions/' + result.discussion.id,
            });
            // send event
            await fastify.pubsub.publish(DiscussionEvents.Created, { discussion: { ...result.discussion, post: { ...result.post } } });
            return result;
        },
        async updateDiscussion({ id, title, operator }) {
            const discussion = await fastify.discussion.getDiscussionOrPostWithChannelModerators({ id, isPost: false });
            // 主题锁定的情况下，都不能编辑
            if (!discussion || discussion.isClosed) throw new Error(DiscussionErrors.notFound);

            let canUpdate = await fastify.discussion.canOperate({ obj: discussion, objType: 'Discussion', operator, operation: 'update' });
            if (!canUpdate) throw new Error(DiscussionErrors.forbidden);

            await fastify.db.discussion.update({ where: { id: discussion.id }, data: { title } });
        },
        // 是否能够删除讨论？
        // a: 讨论处于开放状态：是管理员 或者 频道管理员 或者 讨论所有人
        // b: 讨论处于关闭状态：是管理员 或者 频道管理员
        async deleteDiscussion({ id, operator }) {
            const discussion = await fastify.discussion.getDiscussionOrPostWithChannelModerators({ id, isPost: false });
            if (!discussion) throw new Error(DiscussionErrors.notFound);

            let canDelete = await fastify.discussion.canOperate({ obj: discussion, objType: 'Discussion', operator, operation: 'delete' });
            if (!canDelete) throw new Error(DiscussionErrors.forbidden);

            await fastify.db.$transaction([
                fastify.db.$queryRaw`
                            DELETE FROM DiscussionPostReport WHERE post_id IN (SELECT id FROM DiscussionPost WHERE discussion_id = ${id});
                        `,
                fastify.db.$queryRaw`
                            DELETE FROM DiscussionPostThumb WHERE post_id IN (SELECT id FROM DiscussionPost WHERE discussion_id = ${id});
                        `,
                fastify.db.$queryRaw`
                            DELETE FROM DiscussionPostGiftRef WHERE post_id IN (SELECT id FROM DiscussionPost WHERE discussion_id = ${id});
                        `,
                fastify.db.discussionPost.deleteMany({ where: { discussionId: id } }),
                fastify.db.discussion.delete({ where: { id } }),
                fastify.db.timeline.deleteMany({ where: { target: 'Discussion', targetId: id, userId: discussion.userId } }), // 只删除 discussion 的时间线，XXX 时间线的业务逻辑还需要重构，目前暂时只用管当前对象
            ]);

        },
        async stickyDiscussion({ id, operator, isSticky = false }) {
            const discussion = await fastify.discussion.getDiscussionOrPostWithChannelModerators({ id, isPost: false });
            if (!discussion) throw new Error(DiscussionErrors.notFound);
            let canSticky = await fastify.discussion.canOperate({ obj: discussion, objType: 'Discussion', operator, operation: 'sticky' });
            if (!canSticky) throw new Error(DiscussionErrors.forbidden);
            await fastify.db.discussion.updateMany({ where: { id, }, data: { isSticky } });
            // send event
            await fastify.pubsub.publish(DiscussionEvents.Sticky, { discussion: { ...discussion } });
        },
        async closeDiscussion({ id, operator, isClosed = false }) {
            const discussion = await fastify.discussion.getDiscussionOrPostWithChannelModerators({ id, isPost: false });
            if (!discussion) throw new Error(DiscussionErrors.notFound);
            let canSticky = await fastify.discussion.canOperate({ obj: discussion, objType: 'Discussion', operator, operation: 'close' });
            if (!canSticky) throw new Error(DiscussionErrors.forbidden);
            await fastify.db.discussion.updateMany({ where: { id, }, data: { isClosed } });
        },
        // 统计某个讨论的礼物数量
        async countDiscussionGifts({ id }) {
            return (await fastify.db.$queryRaw`
                SELECT COUNT(*) AS gifts FROM DiscussionPostGiftRef dpgr
                JOIN DiscussionPost dp ON dpgr.post_id = dp.id
                JOIN Discussion d ON dp.discussion_id = d.id
                WHERE d.id = ${id};
            `)[0]?.gifts || 0;
        },
        // 获得某个讨论贴子的礼物情况
        async getDiscussionPostGifts({ id }) {
            const gifts = await fastify.db.$queryRaw`
                SELECT Gift.id, Gift.name, Gift.description, Gift.url, Gift.price, count(DiscussionPostGiftRef.user_id) AS count FROM DiscussionPostGiftRef, Gift
                WHERE Gift.id = DiscussionPostGiftRef.gift_id AND post_id = ${id} GROUP BY DiscussionPostGiftRef.gift_id;
            `;
            let giftCount = 0;
            gifts.forEach(async (gift) => { gift.count = Number(gift.count) || 0; giftCount += gift.count; });
            return { gifts, count: giftCount };
        },
        // 获取某个讨论帖子的赞踩数据
        async getDiscussionPostThumbs({ id }) {
            return (await fastify.db.$queryRaw`
                SELECT (SELECT count(*) FROM DiscussionPostThumb WHERE direction = 'up' AND post_id = ${id}) AS ups,
                (SELECT count(*) FROM DiscussionPostThumb WHERE direction = 'down' AND post_id = ${id}) AS downs
            `)[0];
        },
        // 给讨论回帖
        async createDiscussionPost({ content, userId, discussionId, ip }) {
            const discussion = await fastify.db.discussion.findUnique({ where: { id: discussionId }, select: { id: true, userId: true, isClosed: true } });
            if (!discussion || discussion.isClosed) return null; // 如果讨论被关闭，是不能回帖的

            const result = await fastify.db.$transaction(async (tx) => {
                const data = await tx.discussionPost.create({ data: { content: cleanContent(content), discussionId, userId, ip }, include: {} });
                await tx.discussion.update({ where: { id: discussionId }, data: { lastPostId: data.id } });
                await tx.timeline.create({ data: { userId, targetId: data.id, target: 'DiscussionPost', } });
                return data;
            });

            // add notification
            const notification = {
                action: Notification.action.postCreated, target: Notification.target.User, targetId: userId,
                content: cleanHtmlTags(result.content).slice(0, 50), url: `/discussions/${result.discussionId}/posts/${result.id}`,
            };
            await fastify.notification.addFollowingNotification({
                ...notification,
                title: Notification.getContent(Notification.action.postCreated, Notification.type.following)
            });
            // 自己给自己回不用发通知
            if (discussion.userId !== userId) {
                await fastify.notification.addReactionNotification({
                    ...notification,
                    userId: discussion.userId, // 反馈通知的对象
                    title: Notification.getContent(Notification.action.postCreated, Notification.type.reaction)
                });
            }
            return result;
        },
        // 修改帖子,修改只能改内容
        async updateDiscussionPost({ id, content, ip, operator }) {
            const post = await fastify.discussion.getDiscussionOrPostWithChannelModerators({ id, isPost: true });
            // 讨论如果处于关闭状态，则不能修改
            if (!post || !post.discussion || post.discussion.isClosed) throw new Error(DiscussionErrors.notFound);

            let canUpdate = await fastify.discussion.canOperate({ obj: post, objType: 'Post', operator, operation: 'update' });
            if (!canUpdate) throw new Error(DiscussionErrors.forbidden);

            await fastify.db.discussionPost.update({ where: { id }, data: { content: cleanContent(content), ip } });
        },
        // 是否能够删除帖子？
        // a: 讨论处于开放状态：是管理员 或者 频道管理员 或者 发帖人
        // b: 讨论处于关闭状态：是管理员 或者 频道管理员
        async deleteDiscussionPost({ id, operator }) {
            const post = await fastify.discussion.getDiscussionOrPostWithChannelModerators({ id, isPost: true });
            if (!post) throw new Error(DiscussionErrors.notFound);

            let canDelete = await fastify.discussion.canOperate({ obj: post, objType: 'Post', operator, operation: 'delete' });
            if (!canDelete) throw new Error(DiscussionErrors.forbidden);

            await fastify.db.$transaction(async (tx) => {
                const lastPost = await tx.discussionPost.findFirst({ where: { discussionId: post.discussion.id, id: { not: id } }, orderBy: { createdAt: 'desc' }, });
                await tx.discussion.update({ where: { id: post.discussion.id }, data: { lastPostId: lastPost?.id || null } });
                await tx.discussionPostReport.deleteMany({ where: { postId: id } });
                await tx.discussionPostThumb.deleteMany({ where: { postId: id } });
                await tx.discussionPostGiftRef.deleteMany({ where: { postId: id } });
                await tx.discussionPost.delete({ where: { id: id } });
                await tx.timeline.deleteMany({ where: { target: 'DiscussionPost', targetId: id, userId: post.userId } });
            });
        },
        async thumbDiscussionPost({ userId, postId, direction }) {
            const toDelete = await fastify.db.discussionPostThumb.findUnique({ where: { postId_userId: { postId, userId, } } });
            // 直接删除当前的赞或者踩
            // 如果新的点踩或者点赞与删除的不同，则重新创建
            if (toDelete) await fastify.db.discussionPostThumb.delete({ where: { postId_userId: { postId, userId, } } });
            if (!toDelete || toDelete.direction !== direction) {
                await fastify.db.discussionPostThumb.create({ data: { postId, userId, direction } });
            }
            // 如果是新创建的点赞，而且不是自己给自己点赞，则发出反馈通知
            if (direction === 'up' && !toDelete) {
                const post = await fastify.db.discussionPost.findUnique({ where: { id: postId }, select: { id: true, userId: true, discussionId: true } });
                if (post.userId !== userId) {
                    await fastify.notification.addReactionNotification({
                        action: Notification.action.postThumbed,
                        userId: post.userId, // 反馈通知的对象
                        target: Notification.target.User, targetId: userId,
                        content: Notification.getContent(Notification.action.postThumbed, Notification.type.reaction),
                        url: `/discussions/${post.discussionId}/posts/${post.id}`,
                    });
                }
            }
        },
        async sendDiscussionPostGift({ userId, postId, giftId }) {
            const gift = await fastify.db.gift.findUnique({ where: { id: giftId } });
            if (!gift) throw new Error(DiscussionErrors.giftNotFound);
            await fastify.db.$transaction(async (tx) => {
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: { balance: { decrement: gift.price, } }
                }); // user 减去balance
                if (updatedUser.balance < 0) throw new Error(DiscussionErrors.insufficientBalance); // 检查余额， 有问题就回滚事务
                await tx.trading.create({ data: { userId, target: 'Gift', targetId: giftId, amount: gift.price, type: Trading.type.buy } }); // 生成交易
                const giftRef = await tx.discussionPostGiftRef.create({ data: { userId, giftId, postId } }); // 创建关系
                await tx.timeline.create({ data: { userId, target: 'DiscussionPostGiftRef', targetId: giftRef.id } }); // 创建动态
            });
            // 发送通知
            const post = await fastify.db.discussionPost.findUnique({ where: { id: postId }, select: { id: true, userId: true, discussionId: true } });
            if (post.userId !== userId) { // 如果不是自己给自己发礼物，则发出反馈通知
                await fastify.notification.addReactionNotification({
                    action: Notification.action.postGiftSent,
                    userId: post.userId, // 反馈通知的对象
                    target: Notification.target.User, targetId: userId,
                    content: Notification.getContent(Notification.action.postGiftSent, Notification.type.reaction),
                    url: `/discussions/${post.discussionId}/posts/${post.id}`,
                });
            }
        },
        async reportDiscussionPost({ postId, userId, content }) {
            const exists = (await fastify.db.discussionPostReport.count({ where: { postId, userId } })) > 0;
            if (!exists) await fastify.db.discussionPostReport.create({ data: { userId, postId, content } });
        },
        // 讨论频道
        async createDiscussionChannel({ appId, name, icon, description }) {
            await fastify.db.discussionChannel.create({ data: { appId, name, icon, description } });
        },
        async updateDiscussionChannel({ channelId, appId, name, icon, description }) {
            await fastify.db.discussionChannel.updateMany({ where: { id: channelId, appId }, data: { name, icon, description } });
        },
        // 如果还有多的channel，则删除需要选择一个可以移动的频道才可以
        // 如果只有这个channel，则该channel下不能有posts才可以删除
        async deleteDiscussionChannel({ channelId, appId, toId }) {
            await fastify.db.$transaction(async (tx) => {
                const channelCount = await fastify.db.discussionChannel.count({ where: { appId, id: { not: channelId } } });
                const postCount = await fastify.db.discussion.count({ where: { discussionChannelId: channelId, appId } });
                if (channelCount === 0 && postCount > 0) throw new Error(DiscussionErrors.lastChannelIsNotEmpty); // 只剩它自己，而且还有posts，不能删除
                if (channelCount > 0) { // 还有channel，做一个转移
                    const toCount = await fastify.db.discussionChannel.count({ where: { id: toId, appId } });
                    if (toCount === 0) throw new Error(DiscussionErrors.channelNotFound); // 转移的 channel 不存在
                    await tx.discussion.updateMany({ where: { discussionChannelId: channelId, appId }, data: { discussionChannelId: toId } });
                }
                await tx.userDiscussionChannelRef.deleteMany({ where: { discussionChannelId: channelId } });
                await tx.discussionChannel.deleteMany({ where: { id: channelId, appId } });
            });
        },
        async createModerators({ channelId, userIds }) {
            if (!channelId || !userIds) return;
            await fastify.db.$transaction(
                userIds.map(id => {
                    const userId = Number(id) || 0;
                    return fastify.db.userDiscussionChannelRef.upsert({
                        create: {
                            userId,
                            discussionChannelId: channelId,
                        },
                        update: {},
                        where: {
                            userId_discussionChannelId: {
                                userId,
                                discussionChannelId: channelId,
                            }
                        },
                    });
                })
            );
        },
        async deleteModerator({ channelId, userId }) {
            await fastify.db.userDiscussionChannelRef.delete({
                where: {
                    userId_discussionChannelId: {
                        userId,
                        discussionChannelId: channelId,
                    }
                },
            });
        }
    });
};

export default discussion;
