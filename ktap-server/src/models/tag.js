'use strict';

import { Prisma } from '@prisma/client'
import { Pagination } from '../constants.js';

async function tag(fastify, opts) {
    fastify.decorate('tag', {
        // 获取某个 app 或 user 的最热的标签
        async getTagsByHot({ id, limit = Pagination.limit.default, type = '' }) {
            type = type.toLowerCase();
            let condition = Prisma.empty;
            if (type === 'app') {
                condition = Prisma.sql`WHERE autr.app_id = ${id}`;
            } else if (type === 'user') {
                condition = Prisma.sql`WHERE autr.user_id = ${id}`;
            }
            const tags = await fastify.db.$queryRaw`
                SELECT t.id, t.name, t.color_hex AS colorHex, COUNT(*) AS count
                FROM "AppUserTagRef" autr
                JOIN "Tag" t ON autr.tag_id = t.id
                ${condition}
                GROUP BY t.id, t.name, t.color_hex
                ORDER BY count DESC
                LIMIT ${limit}
            `;
            return tags;
        },
    });
};
export default tag;
