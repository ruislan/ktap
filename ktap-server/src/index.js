import fastifyCors from '@fastify/cors';
import fastifySensible from '@fastify/sensible';
import fastifyHelmet from '@fastify/helmet';
import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';

import { Keys } from './constants.js';

import apiRoutes from './api.js';
import adminRoutes from './admin.js'

import userSchema from './json-schema/user.js';

export default async function (fastify, opts, next) {
    // config
    await fastify.setSchemaErrorFormatter(function (errors, dataVar) {
        const errorMessage = errors.map(error => error.message).join('\n');
        return new Error(errorMessage);
    });

    // json schema
    await fastify.addSchema(userSchema);

    // api plugins
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

    // routes
    await fastify.register(apiRoutes, { prefix: '/api' });
    await fastify.register(adminRoutes, { prefix: '/admin' });

    next();
};
