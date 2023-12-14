'use strict';
import fp from 'fastify-plugin';

const DEFAULT_EXPIRE = 1000 * 60 * 5; // 5 minutes

const cache = {
    data: new Map(),
    timers: new Map(),
    set: (k, v, ttl) => {
        ttl = ttl || DEFAULT_EXPIRE;
        if (cache.timers.has(k)) {
            clearTimeout(cache.timers.get(k));
        }
        cache.timers.set(
            k,
            setTimeout(() => cache.delete(k), ttl)
        );
        cache.data.set(k, v);
    },
    get: async (k, fetcher, ttl) => {
        ttl = ttl || DEFAULT_EXPIRE;
        let value = cache.data.get(k);
        if (value === undefined && fetcher !== undefined) {
            value = await fetcher();
            if (value !== undefined) {
                cache.set(k, value, ttl);
            }
        }
        return value;
    },
    has: k => cache.data.has(k),
    delete: k => {
        if (cache.timers.has(k)) {
            clearTimeout(cache.timers.get(k));
        }
        cache.timers.delete(k);
        return cache.data.delete(k);
    },
    clear: () => {
        cache.data.clear();
        for (const v of cache.timers.values()) {
            clearTimeout(v);
        }
        cache.timers.clear();
    },
};

/*
* 这里我们使用的是 ttl cache
*/
async function cachingPlugin(fastify, opts) {
    fastify.decorate('caching', cache);
};

export default fp(cachingPlugin, {
    name: 'caching',
});
