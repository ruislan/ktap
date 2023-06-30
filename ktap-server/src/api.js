import apiHome from './routes/api/home.js';
import apiSearch from './routes/api/search.js';
import apiApps from './routes/api/apps.js';
import apiUser from './routes/api/user.js';
import apiUsers from './routes/api/users.js';
import apiSettings from './routes/api/settings.js';
import apiReviews from './routes/api/reviews.js';
import apiNews from './routes/api/news.js';
import apiTags from './routes/api/tags.js';
import apiRanks from './routes/api/ranks.js';
import apiOrganizations from './routes/api/organizations.js';
import apiDiscover from './routes/api/discover.js';
import apiDiscussions from './routes/api/discussions.js';

const apiRoutes = async (fastify, opts, next) => {
    // routes
    await fastify.register(apiHome);
    await fastify.register(apiUser, { prefix: '/user' });
    await fastify.register(apiUsers, { prefix: '/users' });
    await fastify.register(apiSettings, { prefix: '/settings' });
    await fastify.register(apiApps, { prefix: '/apps' });
    await fastify.register(apiReviews, { prefix: '/reviews' })
    await fastify.register(apiSearch, { prefix: '/search' });
    await fastify.register(apiNews, { prefix: '/news' });
    await fastify.register(apiTags, { prefix: '/tags' });
    await fastify.register(apiRanks, { prefix: '/ranks' });
    await fastify.register(apiOrganizations, { prefix: '/organizations' });
    await fastify.register(apiDiscover, { prefix: '/discover' });
    await fastify.register(apiDiscussions, { prefix: '/discussions' });
    next();
};

export default apiRoutes;
