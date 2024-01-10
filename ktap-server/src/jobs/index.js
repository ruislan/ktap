import processExpiredNotifications from './process-expired-notifications.js';
import processExpiredTimeline from './process-expired-timeline.js';
import processExpiredJwtTokens from './process-expired-jwt-tokens.js';

export default async function jobs(fastify, opts) {
    await fastify.register(processExpiredNotifications);
    await fastify.register(processExpiredTimeline);
    await fastify.register(processExpiredJwtTokens);
};
