import { AppMedia, LIMIT_CAP, AppPlatform, SocialLinkBrands, TagCategory, AppLanguages } from '../../constants.js';
import steam from '../../lib/steam.js';

// 暂不支持删除App，这个操作的Ref太多了，影响太大了，设置为isVisible=false即可
const apps = async function (fastify, opts) {
    fastify.get('', async (req, reply) => {
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
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
        const newApp = await fastify.db.app.create({
            data: {
                name: req.body.name,
                isVisible: false, // 初始为不可见，操作完成之后再可见
                media: {
                    create: [
                        { type: AppMedia.type.image, usage: AppMedia.usage.head, image: 'https://placehold.co/460x215/png', thumbnail: 'https://placehold.co/292x136/png' },
                        { type: AppMedia.type.image, usage: AppMedia.usage.landscape, image: 'https://placehold.co/2560x1440/png', thumbnail: 'https://placehold.co/616x353/png' },
                        { type: AppMedia.type.image, usage: AppMedia.usage.portrait, image: 'https://placehold.co/1200x1600/png', thumbnail: 'https://placehold.co/374x448/png' },
                        { type: AppMedia.type.image, usage: AppMedia.usage.logo, image: 'https://placehold.co/400x400/png', thumbnail: 'https://placehold.co/128x128/png' }
                    ]
                }
            },
        });
        return reply.code(201).send({ data: { id: newApp.id } });
    });

    fastify.put('/:id/basis', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        await fastify.db.app.update({
            where: { id },
            data: {
                isVisible: req.body.isVisible,
                score: Number(req.body.score)
            }
        });
        return reply.code(204).send();
    });

    fastify.put('/:id', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { app } = req.body;
        if (app) {
            await fastify.db.app.update({
                where: { id },
                data: {
                    name: app.name,
                    slogan: app.slogan,
                    summary: app.summary,
                    description: app.description,
                    score: app.score,
                    releasedAt: app.releasedAt,
                    downloadUrl: app.downloadUrl,
                    legalText: app.legalText,
                    legalUrl: app.legalUrl,
                }
            });
        }
        return reply.code(204).send();
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
        if (usage !== AppMedia.usage.gallery) {
            const { image, thumbnail } = req.body;
            await fastify.db.appMedia.updateMany({ where: { appId: id, usage, type: AppMedia.type.image }, data: { image, thumbnail } });
        } else {
            const { video, images } = req.body;
            const deleteOld = fastify.db.appMedia.deleteMany({ where: { appId: id, usage: AppMedia.usage.gallery } });
            const createNewVideo = video.map(item =>
                fastify.db.appMedia.create({
                    data: {
                        appId: id,
                        image: item.image,
                        thumbnail: item.thumbnail,
                        video: item.video,
                        usage: AppMedia.usage.gallery,
                        type: AppMedia.type.video
                    }
                })
            );
            const createNewImages = images.map(item =>
                fastify.db.appMedia.create({
                    data: {
                        appId: id,
                        image: item.image,
                        thumbnail: item.thumbnail,
                        usage: AppMedia.usage.gallery,
                        type: AppMedia.type.image,
                    }
                })
            );
            await fastify.db.$transaction([deleteOld, ...createNewVideo, ...createNewImages]);
        }
        return reply.code(204).send();
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
        const data = await fastify.db.appSocialLink.create({
            data: { appId: id, name, brand, url, }
        });
        return reply.code(201).send({ data });
    });

    fastify.delete('/:id/social-links/:socialLinkId', async (req, reply) => {
        const socialLinkId = Number(req.params.socialLinkId) || 0;
        await fastify.db.appSocialLink.delete({
            where: { id: socialLinkId },
        });
        return reply.code(204).send();
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
        if (publishers) {
            const deleteOld = fastify.db.appPublisherRef.deleteMany({ where: { appId: id } });
            const createNew = publishers.map(organizationId => fastify.db.appPublisherRef.create({ data: { appId: id, organizationId } }));
            await fastify.db.$transaction([deleteOld, ...createNew]);
        }
        return reply.code(204).send();
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
        if (developers) {
            const deleteOld = fastify.db.appDeveloperRef.deleteMany({ where: { appId: id } });
            const createNew = developers.map(organizationId => fastify.db.appDeveloperRef.create({ data: { appId: id, organizationId } }));
            await fastify.db.$transaction([deleteOld, ...createNew]);
        }
        return reply.code(204).send();
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
        if (features) {
            const createNewRefs = features.map(featureId => fastify.db.appFeatureRef.create({ data: { appId: id, tagId: featureId } }));
            await fastify.db.$transaction(createNewRefs);
        }
        return reply.code(204).send();
    });

    fastify.delete('/:id/features/:featureId', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const featureId = Number(req.params.featureId) || 0;
        await fastify.db.appFeatureRef.deleteMany({ where: { appId: id, tagId: featureId } });
        return reply.code(204).send();
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
        if (genres) {
            const createNewRefs = genres.map(genreId => fastify.db.appGenreRef.create({ data: { appId: id, tagId: genreId } }));
            await fastify.db.$transaction(createNewRefs);
        }
        return reply.code(204).send();
    });

    fastify.delete('/:id/genres/:genreId', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const genreId = Number(req.params.genreId) || 0;
        await fastify.db.appGenreRef.deleteMany({ where: { appId: id, tagId: genreId } });
        return reply.code(204).send();
    });

    fastify.get('/:id/tags', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const skip = Math.max(0, Number(req.query.skip) || 0);
        const limit = Math.max(1, Math.min(LIMIT_CAP, (Number(req.query.limit) || 10)));
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
        await fastify.db.appUserTagRef.deleteMany({ where: { appId: id, tagId } }); // all users' relationships will be deleted
        return reply.code(204).send();
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
        if (platforms) {
            const deleteOld = fastify.db.appPlatform.deleteMany({ where: { appId: id } });
            const createNewPlatforms = platforms.map(platform =>
                fastify.db.appPlatform.create({
                    data: {
                        appId: id,
                        os: platform.os,
                        requirements: JSON.stringify(platform.requirements),
                    }
                })
            );
            await fastify.db.$transaction([deleteOld, ...createNewPlatforms]);
        }
        return reply.code(204).send();
    });

    fastify.get('/:id/pro-reviews', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.proReview.findMany({ where: { appId: id } });
        return reply.code(200).send({ data });
    });

    fastify.post('/:id/pro-reviews', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.proReview.create({
            data: {
                name: req.body.name,
                url: req.body.url,
                summary: req.body.url,
                score: req.body.score,
                appId: id,
            }
        });
        return reply.code(201).send({ data });
    });

    fastify.delete('/:id/pro-reviews/:proReviewId', async (req, reply) => {
        const proReviewId = Number(req.params.proReviewId) || 0;
        await fastify.db.proReview.delete({ where: { id: proReviewId } });
        return reply.code(204).send();
    });

    fastify.get('/:id/awards', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.appAward.findMany({ where: { appId: id } });
        return reply.code(200).send({ data });
    });

    fastify.post('/:id/awards', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.appAward.create({
            data: {
                image: req.body.image,
                url: req.body.url,
                appId: id,
            }
        });
        return reply.code(201).send({ data });
    });

    fastify.delete('/:id/awards/:awardId', async (req, reply) => {
        const awardId = Number(req.params.awardId) || 0;
        await fastify.db.appAward.delete({ where: { id: awardId } });
        return reply.code(204).send();
    });

    fastify.get('/:id/languages', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const data = await fastify.db.appLanguages.findUnique({ where: { appId: id } });
        return reply.code(200).send({ data });
    });

    fastify.put('/:id/languages', async (req, reply) => {
        const id = Number(req.params.id) || 0;
        const { text, audio, caption } = req.body;
        await fastify.db.appLanguages.upsert({ where: { appId: id }, create: { text, audio, caption, appId: id }, update: { text, audio, caption } });
        return reply.code(204).send();
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

    fastify.post('/:id/discussion-channels', { schema: channelFormSchema },
        async function (req, reply) {
            const appId = Number(req.params.id) || 0;
            const { name, icon, description } = req.body;
            await fastify.db.discussionChannel.create({ data: { appId, name, icon, description } });
            return reply.code(201).send();
        });

    fastify.put('/:id/discussion-channels/:channelId', { schema: channelFormSchema },
        async function (req, reply) {
            const appId = Number(req.params.id) || 0;
            const channelId = Number(req.params.channelId) || 0;
            const { name, icon, description } = req.body;
            await fastify.db.discussionChannel.updateMany({ where: { id: channelId, appId }, data: { name, icon, description } });
            return reply.code(204).send();
        });

    // 如果还有多的channel，则删除需要选择一个可以移动的频道才可以
    // 如果只有这个channel，则该channel下不能有posts才可以删除
    fastify.delete('/:id/discussion-channels/:channelId', async function (req, reply) {
        const appId = Number(req.params.id) || 0;
        const channelId = Number(req.params.channelId) || 0;
        const toId = Number(req.body?.toId) || 0;
        if (channelId > 0 && channelId !== toId) {
            try {
                await fastify.db.$transaction(async (tx) => {
                    const channelCount = await fastify.db.discussionChannel.count({ where: { appId, id: { not: channelId } } });
                    const postCount = await fastify.db.discussion.count({ where: { discussionChannelId: channelId, appId } });
                    if (channelCount === 0 && postCount > 0) throw new Error(); // 只剩它自己，而且还有posts，不能删除
                    if (channelCount > 0) { // 还有channel，做一个转移
                        const toCount = await fastify.db.discussionChannel.count({ where: { id: toId, appId } });
                        if (toCount === 0) throw new Error(); // 转移的 channel 不存在
                        await tx.discussion.updateMany({ where: { discussionChannelId: channelId, appId }, data: { discussionChannelId: toId } });
                    }
                    await tx.discussionChannel.deleteMany({ where: { id: channelId, appId } });
                });
            } catch (e) {
                fastify.log.error(e);
                return reply.code(400).send();
            }
        }
        return reply.code(204).send();
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
