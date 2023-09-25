'use strict';

export const UserEvents = {
    Registered: 'user.registered',
}

const user = async (fastify, opts, next) => {
    fastify.decorate('user', {});
    next();
};

export default user;
