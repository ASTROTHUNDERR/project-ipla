import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { z } from 'zod';
import { setTimeout as delay } from 'timers/promises';

import config from '../config/environment';
import { sendEmail } from '../config/mail';
import { compileHTMLFile } from '../utils/emailUtils';

import { User, PasswordReset } from '../models';

class Schemas {
    static passwordReset = z.object({
        email: z.string().email()
    })

    static resetPassword = z.object({
        token: z.string(),
        newPassword: z.string().min(8),
        repeatNewPassword: z.string().min(8)
    }).refine((data) => data.newPassword === data.repeatNewPassword, {
        message: 'Passwords must match'
    });
}

class PasswordController {
    static async passwordReset(req: Request, res: Response) {
        try {
            const validatedData = Schemas.passwordReset.parse(req.body);
            const { email } = validatedData;

            const user = await User.findOne({ where: { email } });

            if (user) {
                const resetToken = crypto.randomBytes(64).toString('hex');

                const resetLink = `${config.allowedOrigin}/reset-password?token=${resetToken}`
                const html = await compileHTMLFile('passwordReset.hbs', { link: resetLink });
                await sendEmail([email], 'IPLA Password Reset', html);

                const alreadyExists = await PasswordReset.findOne({ where: { user_id: user.id } });
                if (alreadyExists) {
                    await alreadyExists.destroy();
                }

                await PasswordReset.create({ user_id: user.id, token: resetToken });

                res.status(200).json({ message: 'Email was sent successfully' });
                return;
            }
            const emailSendDuration = 2324;
            await delay(emailSendDuration);

            res.status(200).json({ message: 'Email was sent successfully' });
            return;
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async resetPassword(req: Request, res: Response) {
        try {
            const validatedData = Schemas.resetPassword.parse(req.body);
            const { token, newPassword } = validatedData;

            const passwordReset = await PasswordReset.findOne({ where: { token } });
            
            if (passwordReset) {
                const user = await User.findByPk(passwordReset.user_id);

                if (user) {
                    const hashedPassword = await bcrypt.hash(newPassword, 11);
                    user.password = hashedPassword;
                    await user.save()

                    res.status(200).json({ message: 'Password was successfully changed' });
                    return;
                }

                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.status(400).json({ message: 'Invalid token' });
            return;
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

export default PasswordController;