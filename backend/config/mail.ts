import nodemailer from 'nodemailer';
import config from './environment';

const transporter = nodemailer.createTransport(config.mail);

export async function sendEmail(to: string[], subject?: string, html?: string, text?: string | Buffer) {
    try {
        await transporter.sendMail({
            from: 'Project IPLA',
            to: to,
            subject: subject,
            html: html,
            text: text
        })
    } catch (err) {
        throw err;
    }
};