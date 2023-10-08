import { authenticate } from '../../lib/auth.js';
import { Notification } from "../../constants.js";
import { UserErrors } from '../../models/user.js';

const settings = async (fastify) => {
    fastify.addHook('onRequest', authenticate);

    // 用户头像
    fastify.post('/avatar', async function (req, reply) {
        try {
            const data = await req.file();
            const uri = await fastify.user.updateAvatar({ userId: req.user.id, file: data });
            return reply.code(200).send({ avatar: uri });
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: UserErrors.userAvatarUploadFailed });
        }
    });

    // 用户概况
    fastify.put('/general', {
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
    }, async function (req, reply) {
        try {
            const { email, name } = req.body;
            await fastify.user.updateGeneral({ userId: req.user.id, email, name });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 用户信息
    fastify.put('/profile', {
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
    }, async function (req, reply) {
        try {
            const { gender, bio, location, birthday } = req.body;
            await fastify.user.updateProfile({ userId: req.user.id, gender, bio, location, birthday: new Date(birthday) });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 用户密码
    fastify.put('/password', {
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
    }, async function (req, reply) {
        try {
            const { oldPassword, newPassword } = req.body;
            await fastify.user.updatePassword({ userId: req.user.id, oldPassword, newPassword });
            return reply.code(204).send();
        } catch (err) {
            fastify.log.warn(err);
            return reply.code(400).send({ message: err.message });
        }
    });

    // 通知信息
    fastify.get('/notifications', async function (req, reply) {
        const settings = await fastify.db.userSetting.findUnique({ where: { userId: req.user.id } });
        let data = {};
        if (settings?.options) {
            const jsonData = JSON.parse(settings.options);
            data = { ...jsonData?.notification };
        }
        return reply.code(200).send({ data });
    });

    fastify.put('/notifications', async function (req, reply) {
        const notificationSettings = {};
        notificationSettings[Notification.settings.followingUserChanged] = req.body.followingUserChanged;
        notificationSettings[Notification.settings.followingAppChanged] = req.body.followingAppChanged;
        notificationSettings[Notification.settings.reactionReplied] = req.body.reactionReplied;
        notificationSettings[Notification.settings.reactionThumbed] = req.body.reactionThumbed;
        notificationSettings[Notification.settings.reactionGiftSent] = req.body.reactionGiftSent;

        const settings = await fastify.db.userSetting.findUnique({ where: { userId: req.user.id } });
        const options = settings?.options ? JSON.parse(settings.options) : {};
        const newOptions = JSON.stringify({
            ...options,
            notification: notificationSettings,
        });
        const item = { userId: req.user.id, options: newOptions };

        await fastify.db.userSetting.upsert({ where: { userId: req.user.id }, create: item, update: item });
        return reply.code(204).send();
    });
};

export default settings;
