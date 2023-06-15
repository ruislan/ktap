import fp from 'fastify-plugin';
import NodeCache from 'node-cache';

/*
* 缓存的Plugin，使用了node cache
* 初始化Plugin时，opts中配置需要新建的缓存
*/
const cachingPlugin = async (fastify, opts, next) => {
    const caches = opts.caches || [];
    const caching = {};
    caches.forEach(cache => {
        if (cache.name) {
            const options = { stdTTL: cache.ttl || 1000 * 60 * 5, };
            caching[cache.name] = new NodeCache(options);
        }
    });
    fastify.decorate('caching', caching);
    next();
};

export default fp(cachingPlugin);
