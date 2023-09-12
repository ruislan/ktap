'use strict';

import { Prisma } from '@prisma/client'
import { Pagination } from '../constants.js';

const tag = async (fastify, opts, next) => {
    fastify.decorate('tag', {
        async getTagsByHot({ id, limit = Pagination.limit.default, type = '' }) {
            type = type.toLowerCase();
            let condition = Prisma.empty;
            if (type === 'app') {
                condition = Prisma.sql`AppUserTagRef.app_id = ${id} AND `;
            } else if (type === 'user') {
                condition = Prisma.sql`AppUserTagRef.user_id = ${id} AND `;
            }
            const tags = await fastify.db.$queryRaw`
                SELECT id, name, color_hex AS colorHex, count(*) AS count FROM AppUserTagRef, Tag
                WHERE ${condition} AppUserTagRef.tag_id = Tag.id
                GROUP BY id ORDER BY count DESC LIMIT ${limit}
            `;
            return tags;
        },
    });
    next();
};
export default tag;
