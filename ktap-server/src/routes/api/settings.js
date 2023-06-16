import { authenticate } from '../../lib/auth.js';
import { errors, USER_CHANGE_NAME_INTERVAL } from "../../constants.js";

const settings = async (fastify, opts) => {
    fastify.addHook('onRequest', authenticate);

    // 用户头像
    fastify.post('/avatar', async function handler(req, reply) {
        try {
            const data = await req.file();
            const buffer = await data.toBuffer();
            let uri = await this.storage.store(data.filename, buffer);
            await this.db.user.update({
                where: { id: req.user.id },
                data: { avatar: uri }
            });
            return reply.code(200).send({ avatar: uri });
        } catch (err) {
            this.log.warn(err);
            throw this.httpErrors.badRequest(errors.message.userAvatarUploadFailed);
        }
    });

    // 用户概况
    fastify.put(
        '/general',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['email', 'name'],
                    properties: {
                        email: { $ref: 'user#/properties/email' },
                        name: { $ref: 'user#/properties/name' },
                    },
                    additionalProperties: false,
                }
            }
        },
        async function handler(req, reply) {
            const { email, name } = req.body;
            const user = await fastify.db.user.findUnique({ where: { id: req.user.id } });
            if (user.name === name && user.email === email) return reply.code(200).send();
            // want to change name?
            if (user.name !== name && user.lastUpdatedNameAt) {
                const lastUpdatedNameAt = new Date(user.lastUpdatedNameAt).getTime();
                const now = new Date().getTime();
                if ((now - lastUpdatedNameAt) < USER_CHANGE_NAME_INTERVAL) {
                    throw this.httpErrors.createError(errors.code.validation, errors.message.userNameNotYet);
                }
            }

            const existsName = await this.db.user.count({
                where: {
                    AND: [
                        { name },
                        { id: { not: user.id } }
                    ]
                }
            }) > 0;
            if (existsName) throw this.httpErrors.createError(errors.code.validation, errors.message.userNameDuplicated);

            const existsEmail = await this.db.user.count({
                where: {
                    AND: [
                        { email },
                        { id: { not: user.id } }
                    ]
                }
            }) > 0;
            if (existsEmail) throw this.httpErrors.createError(errors.code.validation, errors.message.userEmailDuplicated);

            await this.db.user.update({
                where: { id: user.id },
                data: {
                    email,
                    name,
                    lastUpdatedNameAt: new Date(),
                },
            });
            return reply.code(204).send();
        }
    );

    // 用户信息
    fastify.put(
        '/profile',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['gender', 'bio', 'location'],
                    properties: {
                        gender: { $ref: 'user#/properties/gender' },
                        bio: { $ref: 'user#/properties/bio' },
                        location: { $ref: 'user#/properties/location' },
                        birthday: { $ref: 'user#/properties/birthday' }
                    },
                    additionalProperties: false,
                }
            }
        },
        async function handler(req, reply) {
            const { gender, bio, location, birthday } = req.body;
            await this.db.user.update({
                where: { id: req.user.id },
                data: { gender, bio, location, birthday: new Date(birthday) },
            });
            return reply.code(204).send();
        }
    );

    // 用户密码
    fastify.put(
        '/password',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['oldPassword', 'newPassword'],
                    properties: {
                        oldPassword: { $ref: 'user#/properties/password' },
                        newPassword: { $ref: 'user#/properties/newPassword' },
                    },
                    additionalProperties: false,
                }
            },
        },
        async function handler(req, reply) {
            const { oldPassword, newPassword } = req.body;
            const user = await this.db.user.findUnique({ where: { id: req.user.id } });
            if (!user) throw this.httpErrors.createError(errors.code.authentication, errors.message.authenticationFailed);

            const isPasswordMatched = await this.bcrypt.compare(oldPassword, user.password);
            if (!isPasswordMatched) throw this.httpErrors.createError(errors.code.validation, errors.message.userOldPasswordWrong);

            const newPasswordHash = await this.bcrypt.hash(newPassword);
            await this.db.user.update({
                where: { id: req.user.id },
                data: { password: newPasswordHash }
            });
            return reply.code(204).send();
        }
    );
};

export default settings;
