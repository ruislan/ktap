import fp from 'fastify-plugin';
import EventEmitter from 'events';

const eventsPlugin = async (fastify, opts, next) => {
    const emitter = new EventEmitter();
    fastify.decorate('events', emitter);
    next();
};

export default fp(eventsPlugin);
