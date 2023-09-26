'use strict';
import fp from 'fastify-plugin';
import EventEmitter from 'events';

const pubsub = {
    provider: new EventEmitter(),
    publish: async (event, data) => pubsub.provider.emit(event, data),
    on: async (event, callback) => pubsub.provider.on(event, callback),
    removeAllListeners: async (event) => pubsub.provider.removeAllListeners(event),
};

const pubsubPlugin = async (fastify, opts, next) => {
    fastify.decorate('pubsub', pubsub);
    fastify.addHook('onClose', async (fastify) => {
        fastify.log.info('waiting for pubsub to complete...');
        // TODO implements
    });
    next();
};

export default fp(pubsubPlugin);
