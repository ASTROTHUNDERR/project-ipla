import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { authenticator } from 'otplib';
import { z } from 'zod';
import { Response } from 'express';
import { Sequelize, Op, fn, col } from 'sequelize';

import logger from '../config/logger';
import config from '../config/environment';
import { profanity } from '../utils/profanity';
import { sendEmail } from '../config/mail';
import { compileHTMLFile } from '../utils/emailUtils';
import { io } from '../server';

import { AuthenticatedRequest } from '../utils/types';

import { User, TwoFactorAuthenticator, EmailChangeVerification } from '../db/models';

class Schemas {
    static passwordChange = z.object({
        currentPassword: z.string(),
        newPassword: z.string()
            .min(8)
            .regex(/[.!@#$%&]/, 'Password must contain at least one special character (.!@#$%&)'),
        repeatNewPassword: z.string()
            .min(8)
            .regex(/[.!@#$%&]/, 'Password must contain at least one special character (.!@#$%&)'),
    }).refine((data) => data.newPassword === data.repeatNewPassword, {
        message: 'Passwords must match'
    });

    static passwordChange2FA = z.object({
        token: z.string()
            .min(6, 'min')
            .max(6, 'max'),
        currentPassword: z.string(),
        newPassword: z.string()
            .min(8)
            .regex(/[.!@#$%&]/, 'Password must contain at least one special character (.!@#$%&)'),
        repeatNewPassword: z.string()
            .min(8)
            .regex(/[.!@#$%&]/, 'Password must contain at least one special character (.!@#$%&)'),
    }).refine((data) => data.newPassword === data.repeatNewPassword, {
        message: 'Passwords must match'
    });

    static usernameChange = z.object({
        newUsername: z.string()
            .min(4)
            .max(14)
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
            .refine((value) => !profanity.exists(value), {
                message: 'Username contains inappropriate words'
            }),
    });

    static usernameChange2FA = z.object({
        token: z.string()
            .min(6, 'min')
            .max(6, 'max'),
        newUsername: z.string()
            .min(4)
            .max(14)
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
            .refine((value) => !profanity.exists(value), {
                message: 'Username contains inappropriate words'
            }),
    });

    static emailChangeRequest = z.object({
        user_id: z.number()
    });
    
    static emailChange2FARequest = z.object({
        user_id: z.number(),
        token: z.string()
    });

    static emailChangeVerifyCurrent = z.object({
        token: z.string()
    });

    static emailChangeSetNewEmailRequest = z.object({
        user_id: z.number(),
        new_email: z.string()
            .email('invalid type')
    });
}

class UserController {
    static async passwordChange(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = Schemas.passwordChange.parse(req.body);
                const { currentPassword, newPassword } = validatedData;

                const passwordsMatch = await bcrypt.compare(currentPassword, req.currentUser.password);
                if (!passwordsMatch) {
                    res.status(400).send({ errorMessage: 'Invalid password' });
                    return;
                }

                if (currentPassword === newPassword) {
                    res.status(400).send({ errorMessage: 'Try different password' });
                    return;
                }

                const has2FAEnabled = await TwoFactorAuthenticator.findOne({
                    where: { user_id: req.currentUser.id }
                });

                if (has2FAEnabled) {
                    res.status(200).send({
                        tfa: true
                    });
                    return;
                }

                const hashedPassword = await bcrypt.hash(newPassword, 11);
                req.currentUser.password = hashedPassword;
                await req.currentUser.save();
                
                res.status(200).send('Password was successfully changed');
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error){
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER: error caught at 'passwordChange': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async passwordChangeF2A(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validateData = Schemas.passwordChange2FA.parse(req.body);
                const { token, currentPassword, newPassword } = validateData;

                const twoFAEnabled = await TwoFactorAuthenticator.findOne({ 
                    where: { user_id: req.currentUser.id } 
                });
    
                if (!twoFAEnabled) {
                    res.status(404).send({ errorMessage: '2FA is not enabled on the account' });
                    return;
                }
    
                const isValid = authenticator.check(token, twoFAEnabled.secret);
    
                if (!isValid) {
                    res.status(400).send({ errorMessage: 'Invalid token' });
                    return;
                }

                const passwordsMatch = await bcrypt.compare(currentPassword, req.currentUser.password);
                if (!passwordsMatch) {
                    res.status(400).send({ errorMessage: 'Invalid password' });
                    return;
                }

                if (currentPassword === newPassword) {
                    res.status(400).send({ errorMessage: 'Try different password' });
                    return;
                }

                const hashedPassword = await bcrypt.hash(newPassword, 11);
                req.currentUser.password = hashedPassword;
                await req.currentUser.save();
                
                res.status(200).send('Password was successfully changed');
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER: error caught at 'passwordChangeF2A': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' }); 
        }
    }

    static async usernameChange(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = Schemas.usernameChange.parse(req.body);
                const { newUsername } = validatedData;

                const usernameIsUsed = await User.findOne({
                    where: {
                        [Op.and]: [
                            Sequelize.where(fn('LOWER', col('username')), newUsername.toLowerCase())
                        ]
                    }
                });
                if (usernameIsUsed) {
                    res.status(400).json({ errorMessage: 'This username is already used' });
                    return;
                }

                const has2FAEnabled = await TwoFactorAuthenticator.findOne({
                    where: { user_id: req.currentUser.id }
                });

                if (has2FAEnabled) {
                    res.status(200).send({
                        tfa: true
                    });
                    return;
                }

                req.currentUser.username = newUsername;
                await req.currentUser.save();

                res.status(200).send('Username was successfully changed');
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER: error caught at 'usernameChange': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async usernameChange2FA(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = Schemas.usernameChange2FA.parse(req.body);
                const { token, newUsername } = validatedData;

                const twoFAEnabled = await TwoFactorAuthenticator.findOne({ 
                    where: { user_id: req.currentUser.id } 
                });
    
                if (!twoFAEnabled) {
                    res.status(404).send({ errorMessage: '2FA is not enabled on the account' });
                    return;
                }
    
                const isValid = authenticator.check(token, twoFAEnabled.secret);
    
                if (!isValid) {
                    res.status(400).send({ errorMessage: 'Invalid token' });
                    return;
                }

                const usernameIsUsed = await User.findOne({
                    where: {
                        [Op.and]: [
                            Sequelize.where(fn('LOWER', col('username')), newUsername.toLowerCase())
                        ]
                    }
                });
                if (usernameIsUsed) {
                    res.status(400).json({ errorMessage: 'This username is already used' });
                    return;
                }
                
                req.currentUser.username = newUsername;
                await req.currentUser.save();

                res.status(200).send('Username was successfully changed');
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER: error caught at 'usernameChange2FA': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async emailChangeRequest(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = Schemas.emailChangeRequest.parse(req.body);
                const { user_id } = validatedData;

                if (user_id === req.currentUser.id) {
                    const has2FAEnabled = await TwoFactorAuthenticator.findOne({
                        where: { user_id: req.currentUser.id }
                    });

                    if (has2FAEnabled) {
                        res.status(200).send({
                            tfa: true
                        });
                        return;
                    }

                    const alreadyExists = await EmailChangeVerification.findOne({ where: { user_id } });

                    if (alreadyExists) {
                        await alreadyExists.destroy();
                    }

                    const emailChangeVerification = await EmailChangeVerification.create({
                        user_id: user_id
                    });

                    const link = `${config.allowedOrigin}/verify-email-change?token=${emailChangeVerification.current_email_token}`;
                    const html = await compileHTMLFile('emailChangeRequest.hbs', { link });
                    await sendEmail([req.currentUser.email], 'Verify Email Change', html);

                    res.status(200).send('Email change verification link was sent');
                } else {
                    res.status(403).send('Forbidden');
                }
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER: error caught at 'emailChangeRequest': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async emailChange2FARequest(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = Schemas.emailChange2FARequest.parse(req.body);
                const { token, user_id } = validatedData;

                if (user_id === req.currentUser.id) {
                    const has2FAEnabled = await TwoFactorAuthenticator.findOne({
                        where: { user_id: req.currentUser.id }
                    });

                    if (!has2FAEnabled) {
                        res.status(400).send('Bad Request');
                        return;
                    }

                    const isValid = authenticator.check(token, has2FAEnabled.secret);

                    if (!isValid) {
                        res.status(400).send({ errorMessage: 'Invalid token' });
                        return;
                    }

                    const alreadyExists = await EmailChangeVerification.findOne({ where: { user_id } });

                    if (alreadyExists) {
                        await alreadyExists.destroy();
                    }

                    const emailChangeVerification = await EmailChangeVerification.create({
                        user_id: user_id
                    });

                    const link = `${config.allowedOrigin}/verify-email-change?token=${emailChangeVerification.current_email_token}`;
                    const html = await compileHTMLFile('emailChangeRequest.hbs', { link });
                    await sendEmail([req.currentUser.email], 'Verify Email Change', html);

                    res.status(200).send('Email change verification link was sent');
                } else {
                    res.status(403).send('Forbidden');
                }
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER: error caught at 'emailChange2FARequest': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async emailChangeVerifyCurrent(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = Schemas.emailChangeVerifyCurrent.parse(req.body);
                const { token } = validatedData;

                const emailChangeVerification = await EmailChangeVerification.findOne({ where: { 
                    user_id: req.currentUser.id,
                    current_email_token: token
                } });

                if (emailChangeVerification) {
                    const currentEmailVerificationToken = crypto.randomBytes(64).toString('hex');

                    await emailChangeVerification.update({
                        current_email_token: currentEmailVerificationToken
                    });

                    const html = await compileHTMLFile('emailChangeCurrentVerification.hbs', { 
                        support_link: `${config.allowedOrigin}/support`
                    });
                    await sendEmail([req.currentUser.email], 'Email Change Was Verified', html);   
                    
                    io.emit('email_change_verification', { status: true });

                    res.status(200).send('Email change was verified');
                } else {
                    res.status(400).send('Bad Request');
                }
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER: error caught at 'verifyCurrentEmailChange': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async emailChangeSetNewEmail(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = Schemas.emailChangeSetNewEmailRequest.parse(req.body);
                const { user_id, new_email } = validatedData;

                if (user_id === req.currentUser.id) {
                    const emailIsUsed = await User.findOne({ where: { email: new_email } });

                    if (emailIsUsed) {
                        res.status(400).send({ errorMessage: 'Email is already used' });
                        return;
                    }

                    const emailChangeVerification = await EmailChangeVerification.findOne({ where: { user_id } });

                    if (emailChangeVerification) {
                        const newEmailVerificationToken = crypto.randomBytes(64).toString('hex');

                        await emailChangeVerification.update({
                            new_email: new_email,
                            new_email_token: newEmailVerificationToken
                        });

                        const link = `${config.allowedOrigin}/verify-new-email?token=${newEmailVerificationToken}`;
                        const html = await compileHTMLFile('emailChangeSetNewEmail.hbs', { link });
                        await sendEmail([new_email], 'Verify New Email', html);   
                        
                        res.status(200).send('Verification email was sent to new email');
                        return;
                    } else {
                        res.status(400).send('Bad Request');
                        return;
                    }
                } else {
                    res.status(403).send('Forbidden');
                    return;
                }
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER: error caught at 'emailChangeSetNewEmail': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async emailChangeVerifyNew(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = Schemas.emailChangeVerifyCurrent.parse(req.body);
                const { token } = validatedData;

                const emailChangeVerification = await EmailChangeVerification.findOne({ where: { 
                    user_id: req.currentUser.id,
                    new_email_token: token
                } });

                if (emailChangeVerification) {
                    await req.currentUser.update({
                        email: emailChangeVerification.new_email
                    });

                    await emailChangeVerification.destroy();

                    const html = await compileHTMLFile('emailChangeSetNewEmail.hbs', { 
                        new_email: emailChangeVerification.new_email,
                        support_link:  `${config.allowedOrigin}/support`
                    });
                    await sendEmail([req.currentUser.email], 'Verify New Email', html);   
                    
                    res.status(200).send('Email was changed');
                } else {
                    res.status(400).send('Bad Request');
                }
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`USER: error caught at 'emailChangeVerifyNew': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

export default UserController;