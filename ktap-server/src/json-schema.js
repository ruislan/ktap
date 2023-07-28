import { TagCategory } from "./constants.js";

const user = {
    $id: 'user',
    type: 'object',
    properties: {
        email: {
            type: 'string', format: 'email', maxLength: 255,
            errorMessage: { maxLength: '邮箱长度不能大于 255 个字符', format: '邮箱格式不正确', }
        },
        name: {
            type: 'string', minLength: 1, maxLength: 50,
            errorMessage: { minLength: '昵称长度不能小于 1 个字符', maxLength: '昵称长度不能大于 50 个字符', }
        },
        password: {
            type: 'string', minLength: 6, maxLength: 255,
            errorMessage: { minLength: '密码长度不能小于 6 个字符', maxLength: '密码长度不能大于 255 个字符', }
        },
        newPassword: {
            type: 'string', minLength: 6, maxLength: 255,
            errorMessage: { minLength: '新密码长度不能小于 6 个字符', maxLength: '新密码长度不能大于 255 个字符', }
        },
        gender: {
            enum: ['MAN', 'WOMAN', 'GENDERLESS', null],
            errorMessage: { enum: '只能在 男/女/保密 中选择一个', }
        },
        birthday: {
            type: 'string', format: 'date',
            errorMessage: { format: '请使用正确的生日格式 YYYY-MM-DD', }
        },
        bio: {
            type: 'string', maxLength: 255,
            errorMessage: { maxLength: '简介长度不能大于 255 个字符', }
        },
        location: {
            type: 'string', maxLength: 100,
            errorMessage: { maxLength: '地址长度不能大于 100 个字符', }
        },
    },
    definitions: {
        basic: {
            $id: '#basic',
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { $ref: 'user#/properties/name' },
                title: { type: 'string' },
                email: { $ref: 'user#/properties/email' },
                phone: { type: 'string' },
                avatar: { type: 'string' },
                balance: { type: 'number' },
                gender: { $ref: 'user#/properties/gender' },
                bio: { $ref: 'user#/properties/bio' },
                location: { $ref: 'user#/properties/location' },
                birthday: { type: 'string', format: 'date' },
                isActivated: { type: 'boolean' },
                isAdmin: { type: 'boolean' },
                isLocked: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            }
        },
    },
};

const discussion = {
    $id: 'discussion',
    type: 'object',
    properties: {
        title: {
            type: 'string', minLength: 1, maxLength: 255, errorMessage: {
                minLength: '标题不能小于 1 个字符',
                maxLength: '标题不能大于 255 个字符',
            }
        },
    },
};

const discussionChannel = {
    $id: 'channel',
    type: 'object',
    properties: {
        name: {
            type: 'string', minLength: 1, maxLength: 50, errorMessage: {
                minLength: '名称不能小于 1 个字符',
                maxLength: '名称不能大于 50 个字符',
            }
        },
        icon: { type: 'string', maxLength: 1000, errorMessage: { maxLength: '图片地址太长了', } },
        description: { type: 'string', maxLength: 100, errorMessage: { maxLength: '描述不能大于 100 个字符', } },
    }
};

const discussionPost = {
    $id: 'post',
    type: 'object',
    properties: {
        content: {
            type: 'string', minLength: 1, maxLength: 10000, errorMessage: {
                minLength: '缺少内容',
                maxLength: '内容不能大于 10000 个字符',
            }
        },
    },
};

const tag = {
    $id: 'tag',
    type: 'object',
    properties: {
        name: {
            type: 'string', minLength: 1, maxLength: 15,
            errorMessage: { minLength: '标签不能为空字符', maxLength: '标签太长了', }
        },
        category: {
            enum: [TagCategory.feature, TagCategory.genre, TagCategory.normal],
            errorMessage: { enum: '无法识别的 Tag 分类', }
        },
    },
};

const report = {
    $id: 'report',
    type: 'object',
    properties: {
        content: {
            type: 'string', minLength: 1, maxLength: 15,
            errorMessage: { minLength: '内容不能为空', maxLength: '内容不能超过 150 个字', }
        },
    }
};

const common = {
    $id: 'common',
    type: 'object',
    properties: {
        id: { type: 'integer', minimum: 0, errorMessage: { type: 'id 只能是数字', minimum: 'id 不能为负数' } }
    }
};

// XXX 添加schema首先以前端有 Post 和 Put 的对象为主，其他部分慢慢来即可
export default async function (fastify) {
    await fastify.addSchema(common);
    await fastify.addSchema(user);
    await fastify.addSchema(discussion);
    await fastify.addSchema(discussionPost);
    await fastify.addSchema(discussionChannel);
    await fastify.addSchema(tag);
    await fastify.addSchema(report);
};
