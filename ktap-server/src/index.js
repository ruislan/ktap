import fastifyCors from '@fastify/cors';
import fastifySensible from '@fastify/sensible';
import fastifyHelmet from '@fastify/helmet';
import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';

import cachingPlugin from './plugins/caching.js';
import { Keys } from './constants.js';

import apiRoutes from './routes/api/index.js';
import adminRoutes from './routes/admin/index.js';
import jsonSchema from './json-schema.js';
import models from './models/index.js';
import jobs from './jobs/index.js';

export default async function (fastify, opts) {
    // config
    await fastify.setSchemaErrorFormatter(function (errors, dataVar) {
        const errorMessage = errors.map(error => error.message).join('\n');
        return new Error(errorMessage);
    });

    // plugins
    await fastify.register(fastifyCors);
    await fastify.register(fastifySensible, { errorHandler: false });
    await fastify.register(fastifyHelmet);
    await fastify.register(fastifyCookie, { secret: process.env.COOKIE_SECRET || 'change me' });
    await fastify.register(fastifyMultipart, {
        limits: {
            fileSize: Number(process.env.MULTIPART_FILE_SIZE_LIMIT) || 8192000  // 8MB,
        }
    });
    await fastify.register(fastifyJWT, {
        secret: process.env.JWT_SECRET || 'change me',
        sign: { expiresIn: process.env.JWT_SIGN_EXPIRES_IN || '3d' },
        cookie: {
            cookieName: Keys.cookie.token,
            signed: true
        }
    });
    await fastify.register(cachingPlugin);

    // json schema
    await jsonSchema(fastify);
    // models
    await fastify.register(models);
    // schedule jobs
    await fastify.register(jobs);// setup jobs
    // routes
    await fastify.register(apiRoutes, { prefix: '/api' });
    await fastify.register(adminRoutes, { prefix: '/admin' });

    return;
};
