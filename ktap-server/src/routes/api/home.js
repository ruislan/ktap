import { v4 as uuid } from 'uuid';
import { errors, Keys, Gender, Trading, Pagination } from "../../constants.js";

const home = async function (fastify, opts) {
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
        const { email, password, name, agree } = req.body;
        if (!agree) throw fastify.httpErrors.badRequest(errors.message.userAgreeRequired);

        const existsEmail = await fastify.db.user.count({ where: { email } }) > 0;
        if (existsEmail) throw fastify.httpErrors.badRequest(errors.message.userEmailDuplicated);

        const existsName = await fastify.db.user.count({ where: { name } }) > 0;
        if (existsName) throw fastify.httpErrors.badRequest(errors.message.userNameDuplicated);

        const passwordHash = await fastify.bcrypt.hash(password);

        const amount = 100;
        const user = await fastify.db.user.create({
            data: {
                name, email, password: passwordHash,
                avatar: `https://avatars.dicebear.com/api/adventurer-neutral/${name}.svg?width=285`,
                birthday: new Date(), gender: Gender.GENDERLESS, balance: amount
            }
        });
        // 注册成功，赠送 100 余额
        await fastify.db.trading.create({ data: { userId: 0, target: 'User', targetId: user.id, amount, type: Trading.type.give, }, });

        // XXX 给用户发激活email？ V2 or V3
        return reply.code(201).send();
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
        const { email, password } = req.body;

        const user = await fastify.db.user.findUnique({ where: { email } });
        if (!user) throw fastify.httpErrors.createError(errors.code.authentication, errors.message.authenticationFailed);

        const isPasswordMatched = await fastify.bcrypt.compare(password, user.password);
        if (!isPasswordMatched) throw fastify.httpErrors.createError(errors.code.authentication, errors.message.authenticationFailed);

        if (user.isLocked) throw fastify.httpErrors.createError(errors.code.forbidden, errors.message.userIsLocked);

        const token = await fastify.jwt.sign({ id: Number(user.id), email: user.email, name: user.name, isAdmin: user.isAdmin });
        const expires = new Date(Date.now() + (Number(process.env.COOKIE_EXPIRES_IN) || 259200000));
        return reply
            .cookie(Keys.cookie.token, token, {
                path: '/', httpOnly: true, expires, sameSite: true, signed: true,
                secure: process.env.COOKIE_SECURE || false,  // XXX 注意：secure如果为true，则需要配置https，否则cookie无效
            })
            .cookie('user_id', user.id, { path: '/', expires, }) // 方便客户端使用
            .code(200).send({ id: user.id });
    });

    fastify.post('/logout', async function (req, reply) {
        await fastify.db.tokenBlackList.create({ data: { token: req.cookies[Keys.cookie.token], } }); // put this token into blacklist
        return reply.clearCookie(Keys.cookie.token, { path: '/' }).code(200).send();
    });

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

    // 忘记密码重置
    fastify.post('/password/reset', async function (req, reply) {
        const { password, code } = req.body;
        const user = (await fastify.db.user.findMany({
            where: {
                pwdResetCode: code,
                pwdResetExpireAt: {
                    gte: new Date(),
                }
            },
            select: { id: true, name: true, email: true, pwdResetCode: true, pwdResetExpireAt: true },
        }))[0];
        if (!user) return reply.code(400).send();
        const passwordHash = await fastify.bcrypt.hash(password);;
        await fastify.db.user.update({
            where: { id: user.id },
            data: {
                password: passwordHash,
                pwdResetCode: null,
                pwdResetExpireAt: null,
            }
        });
        return reply.code(200).send();
    });

    // 忘记密码验证CODE
    fastify.post('/password/code', async function (req, reply) {
        const { code } = req.body;
        const valid = (await fastify.db.user.count({
            where: {
                pwdResetCode: code,
                pwdResetExpireAt: {
                    gte: new Date(),
                }
            },
        })) > 0;
        if (!valid) return reply.code(400).send();
        return reply.code(200).send();
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
        const { email } = req.body;
        const user = (await fastify.db.user.findMany({
            where: { email },
            select: { id: true, name: true, email: true, pwdResetCode: true, pwdResetExpireAt: true },
        }))[0];
        if (!user) return reply.code(404).send();
        const code = uuid().replace(/-/g, '');
        const expireAt = new Date(Date.now() + 3600000); // 1 hour later
        await fastify.db.user.update({ where: { id: user.id }, data: { pwdResetCode: code, pwdResetExpireAt: expireAt } });
        try {
            await fastify.mailer.sendMail({
                to: email,
                subject: '重置您在KTap的密码',
                html: `
                    <p>您好,</p>
                    <p>点击以下链接来为您在KTap的账户 ${email} 重置密码</p>
                    <p><a href='${process.env.SERVER_HOST || 'http://localhost'}/password/reset?code=${code}'>${process.env.SERVER_HOST || 'http://localhost'}/password/reset?code=${code}</a></p>
                    <p>如果您没有进行重置密码操作，您可以忽略本邮件内容。</p>
                    <p>感谢您对KTap的喜爱。</p>
                    <p>KTap团队</p>
                `,
            });
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send();
        }
        return reply.code(200).send();
    });
};

export default home;
