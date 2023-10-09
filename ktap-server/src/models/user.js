'use strict';
import { v4 as uuid } from 'uuid';
import { Trading } from '../constants.js';

export const USER_CHANGE_NAME_INTERVAL = 1000 * 60 * 60 * 24 * 30; // 30 days
export const USER_INIT_BALANCE = 100; // 用户初始余额

export const UserGender = {
    MAN: 'MAN',
    WOMAN: 'WOMAN',
    GENDERLESS: 'GENDERLESS'
};

export const UserErrors = {
    userNotFound: '用户不存在',
    userIsLocked: '用户已经被锁定',
    userAgreeRequired: '需要同意 服务协议 和 隐私政策',
    authenticationFailed: '邮箱或密码不正确',
    userOldPasswordWrong: '旧密码错误，温馨提示：注意大小写和空格哟',
    userAvatarUploadFailed: '头像上传失败，请稍后再试，温馨提示：注意文件大小和格式，以及网络情况哟',
    userNameDuplicated: '昵称和别人冲突啦',
    userNameNotYet: '昵称不要换得太频繁啦，更换时间间隔为 30 天',
    userEmailDuplicated: '邮箱已经被使用了哟，如果您确定这是您的邮箱，那就尝试找回密码吧',
    mailSendFailed: '邮件发送失败',
    invalidResetPasswordCode: '重置密码错误，重置地址过期或者密码格式不对。',
};

export const UserEvents = {
    Registered: 'user.registered',
}

const user = async (fastify, opts, next) => {
    fastify.decorate('user', {
        async register({ email, password, name, agree }) {
            if (!agree) throw new Error(UserErrors.userAgreeRequired);

            const existsEmail = await fastify.db.user.count({ where: { email } }) > 0;
            if (existsEmail) throw new Error(UserErrors.userEmailDuplicated);

            const existsName = await fastify.db.user.count({ where: { name } }) > 0;
            if (existsName) throw new Error(UserErrors.userNameDuplicated);

            const passwordHash = await fastify.bcrypt.hash(password);

            const amount = USER_INIT_BALANCE;
            const user = await fastify.db.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        name, email, password: passwordHash,
                        avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}&size=256`,
                        birthday: new Date(), gender: UserGender.GENDERLESS, balance: amount
                    }
                });
                await tx.trading.create({ data: { userId: 0, target: 'User', targetId: user.id, amount, type: Trading.type.give, }, }); // 注册成功，赠送余额
                return user;
            });
            // send event
            await fastify.pubsub.publish(UserEvents.Registered, { user: { ...user } });
            // XXX 给用户发激活email。 V3
        },
        async login({ email, password }) {
            const user = await fastify.db.user.findUnique({ where: { email } });
            if (!user) throw new Error(UserErrors.authenticationFailed);

            const isPasswordMatched = await fastify.bcrypt.compare(password, user.password);
            if (!isPasswordMatched) throw new Error(UserErrors.authenticationFailed);

            if (user.isLocked) throw new Error(UserErrors.userIsLocked);

            const token = await fastify.jwt.sign({ id: Number(user.id), email: user.email, name: user.name, isAdmin: user.isAdmin });
            user.jwtToken = token;
            return user;
        },
        async logout({ token }) {
            await fastify.db.tokenBlackList.create({ data: { token } }); // put this token into blacklist
        },
        async forgetPassword({ email }) {
            const user = (await fastify.db.user.findFirst({
                where: { email },
                select: { id: true, name: true, email: true, pwdResetCode: true, pwdResetExpireAt: true },
            }));
            if (!user) throw new Error(UserErrors.userNotFound);

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
                    <p><a href='${process.env.SITE_URL || 'http://localhost'}/password/reset?code=${code}'>${process.env.SITE_URL || 'http://localhost'}/password/reset?code=${code}</a></p>
                    <p>如果您没有进行重置密码操作，您可以忽略本邮件内容。</p>
                    <p>感谢您对KTap的喜爱。</p>
                    <p>KTap团队</p>
                `,
                });
            } catch (err) {
                fastify.log.error(err);
                throw new Error(UserErrors.mailSendFailed);
            }
        },
        async verifyResetPasswordCode({ code }) {
            const valid = (await fastify.db.user.count({
                where: {
                    pwdResetCode: code,
                    pwdResetExpireAt: { gte: new Date(), }
                },
            })) > 0;
            if (!valid) throw new Error(UserErrors.invalidResetPasswordCode);
        },
        async resetPassword({ password, code }) {
            const user = await fastify.db.user.findFirst({
                where: {
                    pwdResetCode: code,
                    pwdResetExpireAt: { gte: new Date() }
                },
                select: { id: true, name: true, email: true, pwdResetCode: true, pwdResetExpireAt: true },
            });
            if (!user) throw new Error(UserErrors.invalidResetPasswordCode);

            const passwordHash = await fastify.bcrypt.hash(password);
            await fastify.db.user.update({
                where: { id: user.id },
                data: { password: passwordHash, pwdResetCode: null, pwdResetExpireAt: null }
            });
        },
        async updateAvatar({ userId, file }) {
            const buffer = await file.toBuffer();
            let uri = await fastify.storage.store(file.filename, buffer);
            await fastify.db.user.update({
                where: { id: userId },
                data: { avatar: uri }
            });
            return uri;
        },
        async updateGeneral({ userId, email, name }) {
            const user = await fastify.db.user.findUnique({ where: { id: userId } });
            if (user.name === name && user.email === email) return;

            // 检查上次变更时间
            if (user.name !== name && user.lastUpdatedNameAt) {
                const lastUpdatedNameAt = new Date(user.lastUpdatedNameAt).getTime();
                const now = new Date().getTime();
                if ((now - lastUpdatedNameAt) < USER_CHANGE_NAME_INTERVAL) throw new Error(UserErrors.userNameNotYet);
            }

            // 检查是否存在相同变更后的名称
            const existsName = await fastify.db.user.count({
                where: {
                    AND: [
                        { name },
                        { id: { not: user.id } }
                    ]
                }
            }) > 0;
            if (existsName) throw new Error(UserErrors.userNameDuplicated);

            const existsEmail = await fastify.db.user.count({
                where: {
                    AND: [
                        { email },
                        { id: { not: user.id } }
                    ]
                }
            }) > 0;
            if (existsEmail) throw new Error(UserErrors.userEmailDuplicated);

            await fastify.db.user.update({
                where: { id: user.id },
                data: { email, name, lastUpdatedNameAt: new Date(), },
            });
        },
        async updateProfile({ userId, gender, bio, location, birthday }) {
            await fastify.db.user.update({
                where: { id: userId },
                data: { gender, bio, location, birthday: new Date(birthday) },
            });
        },
        async updatePassword({ userId, oldPassword, newPassword }) {
            const user = await fastify.db.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error(UserErrors.userOldPasswordWrong);

            const isPasswordMatched = await fastify.bcrypt.compare(oldPassword, user.password);
            if (!isPasswordMatched) throw new Error(UserErrors.userOldPasswordWrong);

            const newPasswordHash = await fastify.bcrypt.hash(newPassword);
            await fastify.db.user.update({
                where: { id: userId },
                data: { password: newPasswordHash }
            });
        },
        async updateNotificationSettings({ userId, notificationSettings }) {
            const settings = await fastify.db.userSetting.findUnique({ where: { userId } });
            const options = settings?.options ? JSON.parse(settings.options) : {};
            const newOptions = JSON.stringify({
                ...options, // copy other settings,
                notification: notificationSettings, // update notification settings
            });
            const item = { userId, options: newOptions };

            await fastify.db.userSetting.upsert({ where: { userId }, create: item, update: item });
        },
    });
    next();
};

export default user;
