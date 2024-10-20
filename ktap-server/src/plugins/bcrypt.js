'use strict';
import fp from 'fastify-plugin';
import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 10;

const crypto = {
    hash: async (password) => {
        return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    },
    compare: async (password, hashedPassword) => {
        return bcrypt.compare(password, hashedPassword);
    },
};

async function bcryptPlugin(fastify, opts) {
    fastify.decorate('bcrypt', crypto);
};

export default fp(bcryptPlugin, {
    name: 'bcrypt',
});
