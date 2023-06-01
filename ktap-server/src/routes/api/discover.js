import { AppMedia, LIMIT_CAP, Pages } from "../../constants.js";

const discover = async (fastify, opts) => {
    // 编辑推荐
    fastify.get('/', async function (req, reply) {
        const widgets = await fastify.db.pageWidget.findMany({
            where: { page: Pages.discover, },
            select: { title: true, type: true, style: true, target: true, targetIds: true, }
        });
        for await (const widget of widgets) {
            const ids = widget.targetIds.split(',').map(id => Number(id));
            switch (widget.target) {
                case 'App':
                    widget.data = await fastify.db.app.findMany({
                        where: { id: { in: ids }, },
                        select: {
                            id: true, name: true, summary: true, score: true,
                            media: {
                                where: {
                                    OR: [{ usage: AppMedia.usage.landscape }, { usage: AppMedia.usage.portrait }, { usage: AppMedia.usage.head }],
                                },
                                select: {
                                    usage: true,
                                    image: true,
                                    thumbnail: true,
                                },
                            },
                            genres: {
                                include: { tag: { select: { name: true, colorHex: true, } }, },
                            },
                            features: {
                                include: { tag: { select: { name: true, colorHex: true, } }, },
                            },
                            _count: { select: { reviews: true } },
                        }
                    });
                    widget.data.forEach(app => {
                        const transformMedia = {};
                        app.media?.forEach(m => transformMedia[m.usage] = { image: m.image, thumbnail: m.image });
                        app.media = transformMedia;
                        app.meta = { reviews: app._count.reviews };
                        app.genres = app.genres.map(ref => ref.tag);
                        app.features = app.features.map(ref => ref.tag);
                        delete app._count;
                    });
                    break;
                case 'Review':
                    widget.data = await fastify.db.review.findMany({
                        where: { id: { in: ids }, },
                        select: {
                            id: true, content: true, score: true,
                            user: {
                                select: {
                                    id: true, name: true, avatar: true, title: true, gender: true,
                                }
                            },
                            app: {
                                select: {
                                    id: true, name: true, summary: true, score: true,
                                    media: {
                                        where: {
                                            OR: [{ usage: AppMedia.usage.landscape }, { usage: AppMedia.usage.portrait }, { usage: AppMedia.usage.head }],
                                        },
                                        select: {
                                            usage: true,
                                            image: true,
                                            thumbnail: true,
                                        },
                                    },
                                    genres: {
                                        include: { tag: { select: { name: true, colorHex: true, } }, },
                                    },
                                    features: {
                                        include: { tag: { select: { name: true, colorHex: true, } }, },
                                    },
                                    _count: { select: { reviews: true } },
                                }
                            }
                        }
                    });
                    widget.data.forEach(review => {
                        const transformMedia = {};
                        review.app.media?.forEach(m => transformMedia[m.usage] = { image: m.image, thumbnail: m.image });
                        review.app.media = transformMedia;
                        review.app.meta = { reviews: review.app._count.reviews };
                        review.app.genres = review.app.genres.map(ref => ref.tag);
                        review.app.features = review.app.features.map(ref => ref.tag);
                        delete review.app._count;
                    });
                    break;
                case 'Tag':
                    widget.data = await fastify.db.tag.findMany({
                        where: { id: { in: ids }, },
                        select: { id: true, name: true, colorHex: true, },
                    });
                    break;
                default: break;
            }
            widget.dataType = widget.target;
            delete widget.target;
            delete widget.targetIds;
        };
        return reply.code(200).send({ data: widgets });
    });
};

export default discover;
