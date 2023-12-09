'use strict';

import { Keys, Pagination } from '../../constants.js';

const home = async function (fastify) {
    fastify.post('/register', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password', 'name', 'agree'],
                properties: {
                    email: { $ref: 'user#/properties/email' },
                    password: { $ref: 'user#/properties/password' },
                    name: { $ref: 'user#/properties/name' },
                    agree: { type: 'boolean' },
                },
                additionalProperties: false,
            }
        }
    }, async function (req, reply) {
        try {
            const { email, password, name, agree } = req.body;
            await fastify.user.register({ email, password, name, agree });
            return reply.code(201).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.post('/login', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: { $ref: 'user#/properties/email' },
                    password: { $ref: 'user#/properties/password' },
                },
                additionalProperties: false,
                required: ['email', 'password'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                    }
                }
            }
        },
    }, async function (req, reply) {
        try {
            const { email, password } = req.body;
            const user = await fastify.user.login({ email, password });
            const expires = new Date(Date.now() + (Number(process.env.COOKIE_EXPIRES_IN) || 259200000)); // 3days
            return reply
                .cookie(Keys.cookie.token, user.jwtToken, {
                    path: '/', httpOnly: true, expires, sameSite: true, signed: true,
                    secure: process.env.COOKIE_SECURE || false,  // XXX 注意：secure如果为true，则需要配置https，否则cookie无效
                })
                .cookie(Keys.cookie.userId, user.id, { path: '/', expires, }) // 方便客户端使用
                .code(200).send({ id: user.id });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    fastify.post('/logout', async function (req, reply) {
        try {
            await fastify.user.logout({ token: req.cookies[Keys.cookie.token] });
        } catch (err) {
            fastify.log.warn(err);
        } finally {
            return reply.clearCookie(Keys.cookie.token, { path: '/' }).code(200).send();
        }
    });

    // 忘记密码重置
    fastify.post('/password/reset', {
        schema: {
            body: {
                type: 'object',
                required: ['password', 'code'],
                properties: {
                    password: { $ref: 'user#/properties/password' },
                    code: { type: 'string' },
                },
                additionalProperties: false,
            }
        }
    }, async function (req, reply) {
        try {
            const { password, code } = req.body;
            await fastify.user.resetPassword({ password, code });
            return reply.code(200).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 忘记密码验证CODE
    fastify.post('/password/code', async function (req, reply) {
        try {
            const { code } = req.body;
            await fastify.user.verifyResetPasswordCode({ code });
            return reply.code(200).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 忘记密码发送邮件
    fastify.post('/password/forgot', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: { $ref: 'user#/properties/email' },
                },
                additionalProperties: false,
                required: ['email'],
            }
        },
    }, async function (req, reply) {
        try {
            const { email } = req.body;
            await fastify.user.forgetPassword({ email });
            return reply.code(200).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // gets
    fastify.get('/buzzwords', async function (req, reply) {
        const { limit } = Pagination.parse(req.query.skip, req.query.limit);
        const data = await fastify.db.buzzword.findMany({
            select: { content: true, },
            orderBy: { weight: 'desc' },
            take: limit,
        });
        return reply.code(200).send({ data });
    });

    fastify.get('/gifts', async function (req, reply) {
        const data = await fastify.db.gift.findMany({});
        return reply.code(200).send({ data });
    });

    fastify.get('/', async function (req, reply) {
        return reply.code(200).send({ version: '1.2.0' });
    });
};

export default home;
