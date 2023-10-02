
const follow = async (fastify, opts, next) => {
    fastify.decorate('follow', {
        async  followUser({ followerId, followingId }) {
            if (followerId === followingId) return; // 自己不能关注自己
            const data = await fastify.db.followUser.create({ data: { followerId, userId: followingId } });
            await fastify.db.timeline.create({ data: { userId: followerId, targetId: data.id, target: 'FollowUser', } });
        },
        async followApp({ followerId, followingId }) {
            const data = await fastify.db.followApp.create({ data: { followerId, appId: followingId } });
            await fastify.db.timeline.create({ data: { userId: followerId, targetId: data.id, target: 'FollowApp', } });
        },
        async unFollowUser({ followerId, followingId }) {
            const data = await fastify.db.followUser.delete({ where: { followerId_userId: { followerId, userId: followingId }, } });
            await fastify.db.timeline.deleteMany({ where: { target: 'FollowUser', targetId: data.id, userId: followerId } });
        },
        async unFollowApp({ followerId, followingId }) {
            const data = await fastify.db.followApp.delete({ where: { followerId_appId: { followerId, appId: followingId }, } });
            await fastify.db.timeline.deleteMany({ where: { target: 'FollowApp', targetId: data.id, userId: followerId } });
        },
    });
    next();
};
export default follow;
