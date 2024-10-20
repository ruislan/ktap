import { AppMedia, Pagination } from '../../constants.js';
import steam from '../../lib/steam.js';

// 暂不支持删除App，这个操作的Ref太多了，影响太大了，设置为isVisible=false即可
const apps = async function (fastify, opts) {
    fastify.get('', async (req, reply) => {
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const keyword = req.query.keyword || '';
        const hasParamIsVisible = !!req.query.isVisible;
        const isVisible = (req.query.isVisible || 'false').toLowerCase() === 'true';
        const hasReviews = (req.query.hasReviews || 'false').toLowerCase() === 'true';

        const whereCondition = {};
        if (keyword.length > 0) whereCondition.name = { contains: keyword };
        if (hasParamIsVisible) whereCondition.isVisible = isVisible;
        if (hasReviews) whereCondition.reviews = { some: {} };

        const count = await fastify.db.app.count({ where: whereCondition });
        const data = await fastify.db.app.findMany({
            where: whereCondition,
            select: {
                id: true, name: true, score: true, isVisible: true, createdAt: true, updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
        return reply.code(200).send({ data: data, skip, limit, count });
    });

    // new app
    // init images
    // 头图（Head）、宣传横图（Landscape）、宣传竖图（Portrait）、画廊（Gallery)、品牌商标（Logo）
    // 其他的可以直接进入详情页面自行更改
    fastify.post('', async (req, reply) => {
        try {
            const newApp = await fastify.app.createApp({ name: req.body.name });
            return reply.code(201).send({ data: { id: newApp.id } });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.put('/:id/basis', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const score = Number(req.body.score);
        const isVisible = req.body.isVisible;
        try {
            await fastify.app.updateAppBasis({ appId: id, isVisible, score });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.put('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { app } = req.body;
        try {
            if (app) {
                await fastify.app.updateApp({
                    appId: id, name: app.name, slogan: app.slogan,
                    summary: app.summary, description: app.description,
                    score: app.score, releasedAt: app.releasedAt,
                    downloadUrl: app.downloadUrl, legalText: app.legalText,
                    legalUrl: app.legalUrl,
                });
            }
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.app.findUnique({ where: { id }, });
        return reply.code(200).send({ data });
    });

    fastify.get('/:id/media', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.appMedia.findMany({ where: { appId: id } });
        return reply.code(200).send({ data });
    });

    fastify.put('/:id/media/:usage', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const usage = req.params.usage;
        try {
            if (usage !== AppMedia.usage.gallery) {
                const { image, thumbnail } = req.body;
                await fastify.app.updateAppMediaExcludeGallery({ appId: id, usage, image, thumbnail });
            } else {
                const { video, images } = req.body;
                await fastify.app.updateAppMediaGallery({ appId: id, usage, video, images });
            }
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id/social-links', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.appSocialLink.findMany({
            where: { appId: id },
            select: {
                id: true, name: true, url: true, brand: true,
            }
        });
        return reply.code(200).send({ data });
    });

    fastify.post('/:id/social-links', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { name, url, brand } = req.body;
        try {
            const data = await fastify.app.createAppSocialLink({ appId: id, name, url, brand });
            return reply.code(201).send({ data });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.delete('/:id/social-links/:socialLinkId', async (req, reply) => {
        const socialLinkId = Number(req.params.socialLinkId) || 0;
        try {
            await fastify.app.deleteAppSocialLink({ socialLinkId });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id/publishers', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        let data = await fastify.db.appPublisherRef.findMany({
            where: { appId: id },
            select: {
                organization: {
                    select: { id: true, name: true, logo: true, summary: true }
                }
            }
        });
        data = data.map(item => item.organization);
        return reply.code(200).send({ data });
    });

    fastify.put('/:id/publishers', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { publishers } = req.body;
        try {
            await fastify.app.updateAppPublishers({ appId: id, publishers });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id/developers', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        let data = await fastify.db.appDeveloperRef.findMany({
            where: { appId: id },
            select: {
                organization: {
                    select: { id: true, name: true, logo: true, summary: true }
                }
            }
        });
        data = data.map(item => item.organization);
        return reply.code(200).send({ data });
    });

    fastify.put('/:id/developers', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { developers } = req.body;
        try {
            await fastify.app.updateAppDevelopers({ appId: id, developers });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id/features', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        let data = await fastify.db.appFeatureRef.findMany({
            where: { appId: id },
            select: {
                tag: {
                    select: { id: true, name: true, colorHex: true, }
                }
            }
        });
        data = data.map(item => item.tag);
        return reply.code(200).send({ data });
    });

    fastify.put('/:id/features', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { features } = req.body;
        try {
            await fastify.app.updateAppFeatures({ appId: id, features });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.delete('/:id/features/:featureId', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const featureId = Number(req.params.featureId) || 0;
        try {
            await fastify.app.deleteAppFeature({ appId: id, featureId });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id/genres', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        let data = await fastify.db.appGenreRef.findMany({
            where: { appId: id },
            select: {
                tag: {
                    select: { id: true, name: true, colorHex: true, }
                }
            }
        });
        data = data.map(item => item.tag);
        return reply.code(200).send({ data });
    });

    fastify.put('/:id/genres', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { genres } = req.body;
        try {
            await fastify.app.updateAppGenres({ appId: id, genres });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.delete('/:id/genres/:genreId', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const genreId = Number(req.params.genreId) || 0;
        try {
            await fastify.app.deleteAppGenre({ appId: id, genreId });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id/tags', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { skip, limit } = Pagination.parse(req.query.skip, req.query.limit);

        const keyword = req.query.keyword || '';
        // 注意这里有多个用户会使用相同的标签
        const count = (await fastify.db.$queryRaw`
            SELECT COUNT(DISTINCT ref.tag_id) AS total FROM AppUserTagRef ref, Tag tag
            WHERE ref.app_id = ${id} AND ref.tag_id = tag.id AND tag.name LIKE ${`%${keyword}%`}
        `)[0]?.total || 0;
        let data = await fastify.db.appUserTagRef.findMany({
            distinct: ['tagId'],
            where: { appId: id, tag: { name: { contains: keyword } } },
            select: {
                tag: {
                    select: {
                        id: true, name: true, colorHex: true,
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        data = data.map(item => item.tag);
        return reply.code(200).send({ data, count, skip, limit });
    });

    fastify.delete('/:id/tags/:tagId', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const tagId = Number(req.params.tagId) || 0;
        try {
            await fastify.app.deleteAppTag({ appId: id, tagId });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id/platforms', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.appPlatform.findMany({ where: { appId: id } });
        data.forEach(platform => platform.requirements = JSON.parse(platform.requirements));
        return reply.code(200).send({ data });
    });

    fastify.put('/:id/platforms', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { platforms } = req.body;
        try {
            await fastify.app.updateAppPlatforms({ appId: id, platforms });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id/pro-reviews', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.proReview.findMany({ where: { appId: id } });
        return reply.code(200).send({ data });
    });

    fastify.post('/:id/pro-reviews', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { name, url, summary, score } = req.body;
        try {
            const data = await fastify.review.createProReview({ appId: id, name, url, summary, score });
            return reply.code(201).send({ data });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.delete('/:id/pro-reviews/:proReviewId', async (req, reply) => {
        const proReviewId = Number(req.params.proReviewId) || 0;
        try {
            await fastify.review.deleteProReview({ proReviewId });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id/awards', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.appAward.findMany({ where: { appId: id } });
        return reply.code(200).send({ data });
    });

    fastify.post('/:id/awards', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { image, url } = req.body;
        try {
            const data = await fastify.app.createAppAward({ appId: id, image, url });
            return reply.code(201).send({ data });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.delete('/:id/awards/:awardId', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const awardId = Number(req.params.awardId) || 0;
        try {
            await fastify.app.deleteAppAward({ appId: id, awardId });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id/languages', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.appLanguages.findUnique({ where: { appId: id } });
        return reply.code(200).send({ data });
    });

    fastify.put('/:id/languages', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { text, audio, caption } = req.body;
        try {
            await fastify.app.updateAppLanguages({ appId: id, text, audio, caption });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.post('/monkey/steam', async (req, reply) => {
        let { type, steamAppId, steamAppJson } = req.body;
        let json = '';
        if (type === 'api') {
            const steamRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`, {
                headers: { 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8', }
            });
            if (!steamRes.ok) return reply.code(400).send();
            json = await steamRes.json();
        } else {
            json = JSON.parse(steamAppJson);
            steamAppId = Object.keys(json)[0];
        }
        if (!json[steamAppId] || !json[steamAppId].success) return reply.code(400).send();
        const newApp = await steam.parseGameDetailToPrismaData(json);

        if (!newApp) return reply.code(400).send();

        const app = await fastify.db.app.create({ data: newApp });
        return reply.code(201).send({ data: { id: app.id } });
    });


    // discussions
    fastify.get('/:id/discussion-channels', async (req, reply) => {
        const appId = Number(req.params.id) || 0;
        const data = await fastify.db.discussionChannel.findMany({ where: { appId } });
        return reply.code(200).send({ data });
    });

    fastify.post('/:id/discussion-channels',
        { schema: channelFormSchema },
        async function (req, reply) {
            const appId = Number(req.params.id) || 0;
            const { name, icon, description } = req.body;
            await fastify.discussion.createDiscussionChannel({ appId, name, icon, description });
            return reply.code(201).send();
        }
    );

    fastify.put('/:id/discussion-channels/:channelId',
        { schema: channelFormSchema },
        async function (req, reply) {
            const appId = Number(req.params.id) || 0;
            const channelId = Number(req.params.channelId) || 0;
            const { name, icon, description } = req.body;
            try {
                await fastify.discussion.updateDiscussionChannel({ channelId, appId, name, icon, description });
                return reply.code(204).send();
            } catch (err) {
                fastify.log.warn(err);
                return reply.code(400).send({ message: err.message });
            }
        }
    );

    fastify.delete('/:id/discussion-channels/:channelId', async function (req, reply) {
        const appId = Number(req.params.id) || 0;
        const channelId = Number(req.params.channelId) || 0;
        const toId = Number(req.body?.toId) || 0;
        try {
            await fastify.discussion.deleteDiscussionChannel({ channelId, appId, toId });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.get('/:id/discussion-channels/:channelId/moderators', async function (req, reply) {
        const channelId = Number(req.params.channelId) || 0;
        const userRefs = await fastify.db.userDiscussionChannelRef.findMany({
            where: { discussionChannelId: channelId, },
            select: {
                user: {
                    select: { id: true, name: true, }
                }
            }
        });
        const data = userRefs.map(ref => ref.user);
        return reply.code(200).send({ data });
    });

    fastify.put('/:id/discussion-channels/:channelId/moderators', async function (req, reply) {
        const channelId = Number(req.params.channelId) || 0;
        const { ids } = req.body;
        try {
            await fastify.discussion.createModerators({ channelId, userIds: ids });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.delete('/:id/discussion-channels/:channelId/moderators/:moderatorId', async function (req, reply) {
        const channelId = Number(req.params.channelId) || 0;
        const moderatorId = Number(req.params.moderatorId) || 0;
        try {
            await fastify.discussion.deleteModerator({ channelId, userId: moderatorId });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });
};

const channelFormSchema = {
    body: {
        type: 'object',
        required: ['name'],
        properties: {
            id: { type: 'number' },
            name: {
                type: 'string', minLength: 1, maxLength: 50, errorMessage: { minLength: '请输入名称', maxLength: '名称不能大于 50 个字符', }
            },
            icon: { type: 'string' },
            description: { type: 'string' },
        },
        additionalProperties: false,
    }
};

export default apps;
