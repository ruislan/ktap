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
class Mailer {
    constructor() {
        this.transporter = createTransport({
            defaults: { from: process.env.MAILER_DEFAULTS_FROM },
            transport: {
                service: process.env.MAILER_TRANSPORT_SERVICE,
                host: process.env.MAILER_TRANSPORT_HOST,
                port: process.env.MAILER_TRANSPORT_PORT,
                secure: process.env.MAILER_TRANSPORT_SECURE,
                auth: {
                    user: process.env.MAILER_TRANSPORT_AUTH_USER,
                    pass: process.env.MAILER_TRANSPORT_AUTH_PASS,
                },
                tls: {
                    ciphers: process.env.MAILER_TRANSPORT_TLS_CIPHERS,
                }
            }
        });
    }
    async sendMail(options) {
        return this.transporter.sendMail(options);
    }
}

const isProdEnv = process.env.NODE_ENV === 'production';

const globalForMailer = global;
const mailer = globalForMailer.mailer ?? new Mailer();
if (!isProdEnv) globalForMailer.mailer = mailer;

export default mailer;