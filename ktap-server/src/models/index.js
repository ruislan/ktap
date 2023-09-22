'use strict';

import fp from 'fastify-plugin';

import app from './app.js';
import discussion from './discussion.js';
import notification from './notification.js';
import review from './review.js';
import tag from './tag.js';
import timeline from './timeline.js';
import achievement from './achievement.js';

const models = async (fastify, opts, next) => {
    await fastify.register(fp(app));
    await fastify.register(fp(discussion));
    await fastify.register(fp(notification));
    await fastify.register(fp(review));
    await fastify.register(fp(tag));
    await fastify.register(fp(timeline));
    await fastify.register(fp(achievement));
    next();
};

export default fp(models); // add fp for global scope
