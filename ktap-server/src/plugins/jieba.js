'use strict';
import fp from 'fastify-plugin';
import jieba from '@node-rs/jieba';

/*
* 结巴分词的Plugin
*/
async function jiebaPlugin(fastify, opts) {
    jieba.load();
    fastify.decorate('jieba', { extract: jieba.extract, cut: jieba.cut, tag: jieba.tag });
};

export default fp(jiebaPlugin, {
    name: 'jieba',
});
