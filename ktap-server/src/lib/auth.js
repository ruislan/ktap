import { Keys } from '../constants.js';

async function authenticate(req, reply) {
    try {
        const isTokenInBlackList = (await this.db.tokenBlackList.count({ where: { token: req.cookies[Keys.cookie.token] } })) > 0;
        if (isTokenInBlackList) return reply.code(401).send();
        await req.jwtVerify();
        req.user = await this.db.user.findUnique({ where: { id: req.user.id }, select: { id: true, name: true, isAdmin: true, isLocked: true } });
        if (!req.user) return reply.code(401).send(); // no user found
        if (req.user.isLocked) return reply.code(403).send(); // user is locked
    } catch (err) {
        return reply.code(401).send();
    }
};

async function requireAdmin(req, reply) {
    if (!req.user?.isAdmin) return reply.code(403).send();
};

export { authenticate, requireAdmin };
