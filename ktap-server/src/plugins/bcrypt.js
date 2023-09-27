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

const bcryptPlugin = async (fastify, opts, next) => {
    fastify.decorate('bcrypt', crypto);
    next();
};

export default fp(bcryptPlugin);
