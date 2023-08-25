import fp from 'fastify-plugin';
import Notification from './notification';

export default fp(async (fastify, opts, next) => {
    const models = {
        notification: Notification.newInstance(fastify)
    };
    fastify.decorate('models', models);
    next();
});
