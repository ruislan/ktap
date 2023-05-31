import path from 'path';
import dotenv from 'dotenv';
import fastify from 'fastify';
import ajvErrors from 'ajv-errors';
import fastifyStatic from '@fastify/static';
import fastifyCompress from '@fastify/compress';

import prismaPlugin from './src/plugins/prisma.js';
import bcryptPlugin from './src/plugins/bcrypt.js';
import storagePlugin from './src/plugins/storage.js';
import eventPlugin from './src/plugins/events.js';
import mailerPlugin from './src/plugins/mailer.js';

import restService from './src/index.js';

// avoid JSON bigint serialize error
BigInt.prototype.toJSON = function () { return Number(this); };

const main = async () => {
    // setup env
    dotenv.config();

    // setup server
    const server = fastify({
        logger: {
            transport: process.env.NODE_ENV === 'dev' ? { target: 'pino-pretty' } : undefined,
            level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
        },
        ajv: {
            customOptions: { allErrors: true }, // the plugin ajvErrors needs the customOptions's allErrors option to be true or it will not work
            plugins: [ajvErrors]
        }
    });

    // setup global plugins
    await server.register(fastifyStatic, { root: path.join(process.cwd(), './public'), prefix: '/public', });
    await server.register(fastifyCompress);
    await server.register(prismaPlugin);
    await server.register(bcryptPlugin);
    await server.register(storagePlugin, { base: process.env.STORAGE_DISK_BASE });
    await server.register(eventPlugin);
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

    // setup rest service
    await server.register(restService);

    // add shutdown hook
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => process.on(signal, () => {
        server.close()
            .then(() => server.log.info('server is closed.'))
            .finally(() => process.exit());
    }));

    // print routes
    server.ready(() => {
        console.log(server.printPlugins());
        console.log(server.printRoutes({ commonPrefix: false }));
    });

    // start server
    server.listen({ port: Number(process.env.SERVER_PORT) || 8000, host: '0.0.0.0' })
        .catch(err => {
            server.log.error(err);
            process.exit();
        });
};

main();
