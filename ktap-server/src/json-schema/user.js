const user = {
    $id: 'user',
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email',
            maxLength: 255,
            errorMessage: {
                maxLength: '邮箱长度不能大于 255 个字符',
                format: '邮箱格式不正确',
            }
        },
        name: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            errorMessage: {
                minLength: '昵称长度不能小于 1 个字符',
                maxLength: '昵称长度不能大于 50 个字符',
            }
        },
        password: {
            type: 'string',
            minLength: 6,
            maxLength: 255,
            errorMessage: {
                minLength: '密码长度不能小于 6 个字符',
                maxLength: '密码长度不能大于 255 个字符',
            }
        },
        newPassword: {
            type: 'string',
            minLength: 6,
            maxLength: 255,
            errorMessage: {
                minLength: '新密码长度不能小于 6 个字符',
                maxLength: '新密码长度不能大于 255 个字符',
            }
        },
        gender: {
            enum: ['MAN', 'WOMAN', 'GENDERLESS', null],
            errorMessage: {
                enum: '只能在 男/女/保密 中选择一个',
            }
        },
        bio: {
            type: 'string',
            maxLength: 255,
            errorMessage: {
                maxLength: '简介长度不能大于 255 个字符',
            }
        },
        location: {
            type: 'string',
            maxLength: 100,
            errorMessage: {
                maxLength: '地址长度不能大于 100 个字符',
            }
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
export default user;
