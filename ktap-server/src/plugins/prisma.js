'use strict';
import fp from 'fastify-plugin';
import prisma from '@prisma/client';

async function prismaPlugin(fastify, opts) {
    const logOptions = ['error', 'warn'];
    if (process.env.NODE_ENV === 'dev') logOptions.push('query');
    const db = new prisma.PrismaClient({ log: logOptions });
    await db.$connect();
    fastify.decorate('db', db);
    fastify.addHook('onClose', async (fastify) => {
        await fastify.db.$disconnect();
        fastify.log.info('disconnecting Prisma from DB');
    });
};

export default fp(prismaPlugin, {
    name: 'prisma',
});
