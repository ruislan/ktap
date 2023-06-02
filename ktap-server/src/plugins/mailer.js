import fp from 'fastify-plugin';
import { createTransport } from 'nodemailer';

/*
options: {
    defaults: { from: 'John Doe <john.doe@example.tld>' },
    transport: {
        host: 'smtp.example.tld',
        port: 465,
        secure: true, // use TLS
        auth: {
        user: 'john.doe',
        pass: 'super strong password'
        }
    }
}
*/
const mailerPlugin = async (fastify, opts, next) => {
    const { defaults, transport, } = opts;
    transport.port = Number(transport.port);
    transport.secure = transport.secure === 'true';
    const transporter = createTransport(transport, defaults);
    fastify.decorate('mailer', transporter);
    fastify.addHook('onClose', async (fastify) => {
        transporter.close();
        fastify.log.info('closing email transporter');
    });

    next();
};

export default fp(mailerPlugin);
