import { requireAdmin, authenticate } from './lib/auth.js';
import adminHome from './routes/admin/home.js';
import adminUsers from './routes/admin/users.js';
import adminApps from './routes/admin/apps.js';
import adminReviews from './routes/admin/reviews.js';
import adminReviewComments from './routes/admin/review-comments.js';
import adminNews from './routes/admin/news.js';
import adminOrganizations from './routes/admin/organizations.js';
import adminTags from './routes/admin/tags.js';
import adminBuzzwords from './routes/admin/buzzwords.js';
import adminGifts from './routes/admin/gifts.js';
import adminDiscover from './routes/admin/discover.js';
import adminDiscussions from './routes/admin/discussions.js';

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

    next();
};

export default adminRoutes;
