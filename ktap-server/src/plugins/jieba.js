import fp from 'fastify-plugin';
import jieba from 'nodejieba';

/*
* 结巴分词的Plugin
*/
const jiebaPlugin = async (fastify, opts, next) => {
    jieba.load();
    fastify.decorate('jieba', { extract: jieba.extract, cut: jieba.cut, tag: jieba.tag, textRankExtract: jieba.textRankExtract });
    next();
};

export default fp(jiebaPlugin);
