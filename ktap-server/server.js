import path from 'path';
import dotenv from 'dotenv';
import prisma from '@prisma/client';
import fastify from 'fastify';
import ajvErrors from 'ajv-errors';
import fastifyStatic from '@fastify/static';

import prismaPlugin from './src/plugins/prisma.js';
import bcryptPlugin from './src/plugins/bcrypt.js';
import storagePlugin from './src/plugins/storage.js';
import pubsubPlugin from './src/plugins/pubsub.js';
import mailerPlugin from './src/plugins/mailer.js';
import jiebaPlugin from './src/plugins/jieba.js';

import restService from './src/index.js';

// avoid JSON bigint serialize error
BigInt.prototype.toJSON = function () { return Number(this); };

async function startServer() {
    // setup server
    const server = fastify({
        logger: {
            transport: { target: 'pino-pretty' },
            level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
        },
        ajv: {
            customOptions: { allErrors: true }, // the plugin ajvErrors needs the customOptions's allErrors option to be true or it will not work
            plugins: [ajvErrors]
        }
    });

    // setup global plugins
    await server.register(fastifyStatic, { root: path.join(process.cwd(), './public'), prefix: '/public', });
    await server.register(prismaPlugin);
    await server.register(bcryptPlugin);
    await server.register(storagePlugin, { base: process.env.STORAGE_DISK_BASE });
    await server.register(pubsubPlugin);
    await server.register(mailerPlugin, {
        defaults: { from: process.env.MAILER_DEFAULTS_FROM },
        transport: {
            service: process.env.MAILER_TRANSPORT_SERVICE,
            host: process.env.MAILER_TRANSPORT_HOST,
            port: process.env.MAILER_TRANSPORT_PORT,
            secure: process.env.MAILER_TRANSPORT_SECURE,
            auth: {
                user: process.env.MAILER_TRANSPORT_AUTH_USER,
                pass: process.env.MAILER_TRANSPORT_AUTH_PASS,
            },
            tls: {
                ciphers: process.env.MAILER_TRANSPORT_TLS_CIPHERS,
            }
        }
    });
    await server.register(jiebaPlugin);

    // setup rest service
    await server.register(restService);

    // add shutdown hook
    const shutdownHook = () => server.close().finally(() => {
        server.log.info('🟢 Server is closed.');
        process.exit(0);
    });
    process.on('SIGINT', shutdownHook);
    process.on('SIGTERM', shutdownHook);

    // print routes
    server.ready(() => {
        server.log.info('🤖 Server Environments: ' + process.env.NODE_ENV);
        server.log.info('🚀 Server plugins: \n' + server.printPlugins());
        server.log.info('🌍 Server routes: \n' + server.printRoutes({ commonPrefix: false }));
    });

    // start server
    server.listen({ port: Number(process.env.SERVER_PORT) || 8000, host: '0.0.0.0' })
        .catch(err => {
            server.log.error(err);
            process.exit();
        });
}

async function main() {
    dotenv.config(); // setup env
    await startServer();
};

main();
