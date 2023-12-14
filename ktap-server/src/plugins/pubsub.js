'use strict';
import fp from 'fastify-plugin';
import { EventEmitter } from 'node:events';

const pubsub = {
    provider: new EventEmitter({ captureRejections: true }),
    publish: async (event, data) => pubsub.provider.emit(event, data),
    on: async (event, callback) => pubsub.provider.on(event, callback),
    removeAllListeners: async (event) => pubsub.provider.removeAllListeners(event),
};

async function pubsubPlugin(fastify, opts) {
    pubsub.on('error', (err) => fastify.log.error(err)); // add error handler, callback method should use async
    fastify.decorate('pubsub', pubsub);
    fastify.addHook('onClose', async (fastify) => {
        fastify.log.info('waiting for pubsub to complete...');
        // XXX implements
    });
};

export default fp(pubsubPlugin, {
    name: 'pubsub',
});
