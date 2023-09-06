'use strict';
import fp from 'fastify-plugin';
import jieba from '@node-rs/jieba';

/*
* 结巴分词的Plugin
*/
const jiebaPlugin = async (fastify, opts, next) => {
    jieba.load();
    fastify.decorate('jieba', { extract: jieba.extract, cut: jieba.cut, tag: jieba.tag });
    next();
};

export default fp(jiebaPlugin);
