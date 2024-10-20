import apiHome from './home.js';
import apiSearch from './search.js';
import apiApps from './apps.js';
import apiUser from './user.js';
import apiUsers from './users.js';
import apiSettings from './settings.js';
import apiReviews from './reviews.js';
import apiNews from './news.js';
import apiTags from './tags.js';
import apiRanks from './ranks.js';
import apiOrganizations from './organizations.js';
import apiDiscover from './discover.js';
import apiDiscussions from './discussions.js';

const apiRoutes = async (fastify, opts) => {
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
};

export default apiRoutes;
