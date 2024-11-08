import nodemailer from 'nodemailer';
import config from './environment';
import logger from './logger';

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
        logger.error(`Failed to send the email to ${to.join(', ')}, Subject: ${subject}`);
    }
};