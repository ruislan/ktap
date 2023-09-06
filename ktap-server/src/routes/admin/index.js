import { requireAdmin, authenticate } from '../../lib/auth.js';
import adminHome from './home.js';
import adminUsers from './users.js';
import adminApps from './apps.js';
import adminReviews from './reviews.js';
import adminReviewComments from './review-comments.js';
import adminNews from './news.js';
import adminOrganizations from './organizations.js';
import adminTags from './tags.js';
import adminBuzzwords from './buzzwords.js';
import adminGifts from './gifts.js';
import adminDiscover from './discover.js';
import adminDiscussions from './discussions.js';
import adminDiscussionPosts from './discussion-posts.js';
import adminHotSearch from './hotsearch.js';

const adminRoutes = async (fastify, opts, next) => {
    fastify.addHook('onRequest', authenticate);
    fastify.addHook('preHandler', requireAdmin);

    // routes
    await fastify.register(adminHome);
    await fastify.register(adminUsers, { prefix: '/users' });
    await fastify.register(adminApps, { prefix: '/apps' });
    await fastify.register(adminReviews, { prefix: '/reviews' });
    await fastify.register(adminReviewComments, { prefix: '/review-comments' });
    await fastify.register(adminNews, { prefix: '/news' });
    await fastify.register(adminOrganizations, { prefix: '/organizations' });
    await fastify.register(adminTags, { prefix: '/tags' });
    await fastify.register(adminBuzzwords, { prefix: '/buzzwords' });
    await fastify.register(adminGifts, { prefix: '/gifts' });
    await fastify.register(adminDiscover, { prefix: '/discover' });
    await fastify.register(adminDiscussions, { prefix: '/discussions' });
    await fastify.register(adminDiscussionPosts, { prefix: '/discussion-posts' });
    await fastify.register(adminHotSearch, { prefix: '/hotsearch' });
    next();
};

export default adminRoutes;
