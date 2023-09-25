'use strict';

import sanitizeHtml from 'sanitize-html';
import { Notification, Errors } from '../constants.js';

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

const discussion = async (fastify, opts, next) => {
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
            if (!channel) throw Errors.notFound();
            let canUpdate = await fastify.discussion.canOperate({ obj: channel, objType: 'DiscussionChannel', operator, operation: 'update' });
            if (!canUpdate) throw Errors.forbidden();
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
            if (!discussion || discussion.isClosed) throw Errors.notFound();

            let canUpdate = await fastify.discussion.canOperate({ obj: discussion, objType: 'Discussion', operator, operation: 'update' });
            if (!canUpdate) throw Errors.forbidden();

            await fastify.db.discussion.update({ where: { id: discussion.id }, data: { title } });
        },
        // 是否能够删除讨论？
        // a: 讨论处于开放状态：是管理员 或者 频道管理员 或者 讨论所有人
        // b: 讨论处于关闭状态：是管理员 或者 频道管理员
        async deleteDiscussion({ id, operator }) {
            const discussion = await fastify.discussion.getDiscussionOrPostWithChannelModerators({ id, isPost: false });
            if (!discussion) throw Errors.notFound();

            let canDelete = await fastify.discussion.canOperate({ obj: discussion, objType: 'Discussion', operator, operation: 'delete' });
            if (!canDelete) throw Errors.forbidden();

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
            if (!discussion) throw Errors.notFound();
            let canSticky = await fastify.discussion.canOperate({ obj: discussion, objType: 'Discussion', operator, operation: 'sticky' });
            if (!canSticky) throw Errors.forbidden();
            await fastify.db.discussion.updateMany({ where: { id, }, data: { isSticky } });
            // send event
            await fastify.pubsub.publish(DiscussionEvents.Sticky, { discussion: { ...discussion } });
        },
        async closeDiscussion({ id, operator, isClosed = false }) {
            const discussion = await fastify.discussion.getDiscussionOrPostWithChannelModerators({ id, isPost: false });
            if (!discussion) throw Errors.notFound();
            let canSticky = await fastify.discussion.canOperate({ obj: discussion, objType: 'Discussion', operator, operation: 'close' });
            if (!canSticky) throw Errors.forbidden();
            await fastify.db.discussion.updateMany({ where: { id, }, data: { isClosed } });
        },
        // 统计某个讨论的礼物数量
        async countDiscussionGifts({ id }) {
            return (await fastify.db.$queryRaw`
                SELECT COUNT(*) AS gifts FROM DiscussionPostGiftRef dpgr
                JOIN DiscussionPost dp ON dpgr.post_id = dp.id
                JOIN discussion d ON dp.discussion_id = d.id
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
            if (!post || !post.discussion || post.discussion.isClosed) throw Errors.notFound();

            let canUpdate = await fastify.discussion.canOperate({ obj: post, objType: 'Post', operator, operation: 'update' });
            if (!canUpdate) throw Errors.forbidden();

            await fastify.db.discussionPost.update({ where: { id }, data: { content: cleanContent(content), ip } });
        },

        // 是否能够删除帖子？
        // a: 讨论处于开放状态：是管理员 或者 频道管理员 或者 发帖人
        // b: 讨论处于关闭状态：是管理员 或者 频道管理员
        async deleteDiscussionPost({ id, operator }) {
            const post = await fastify.discussion.getDiscussionOrPostWithChannelModerators({ id, isPost: true });
            if (!post) throw Errors.notFound();

            let canDelete = await fastify.discussion.canOperate({ obj: post, objType: 'Post', operator, operation: 'delete' });
            if (!canDelete) throw Errors.forbidden();

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
    });
    next();
};

export default discussion;
