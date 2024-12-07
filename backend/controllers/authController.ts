import bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { Request, Response } from 'express';
import { z } from 'zod';
import logger from '../config/logger';
import { Sequelize, Op, fn, col } from 'sequelize';

import { 
    User, 
    UserProfile,
    UserRole, 
    AuthProviderHold, 
    AuthProvider, 
    TwoFactorAuthHold, 
    TwoFactorAuthenticator,
    DeletedUser
} from '../db/models';
import { AuthenticatedRequest } from '../utils/types';
import { 
    generateAccessToken, 
    generateRefreshToken, 
    checkBirthDate, 
    loadCountriesInLanguage, 
    checkCountry
} from '../utils/authUtils';

class AuthSchemas {
    static authorizationSchema = z.object({
        email: z.string().email(),
        password: z.string().min(8)
    });

    static authorization2FASchema = z.object({
        token: z.string()
            .min(6, 'min')
            .max(6, 'max'),
        uid: z.number()
    });

    static registrationSchema = z.object({
        type: z.enum(['player', 'manager', 'team owner']),
        firstName: z.string()
            .regex(/^[a-zA-Z\s'-]+$/, 'Invalid'),
        lastName: z.string()
            .regex(/^[a-zA-Z\s'-]+$/, 'Invalid'),
        nativeName: z.string()
            .optional(),
        username: z.string()
            .min(4)
            .max(14)
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        email: z.string().email(),
        password: z.string()
            .min(8)
            .regex(/[.!@#$%&]/, 'Password must contain at least one special character (.!@#$%&)'),
        birthDate: z.string(),
        country: z.object({ 
            locale: z.enum(['en', 'ka']),
            value: z.string(), 
            content: z.string()
        }, { message: 'Invalid country' })
    });

    static finishRegistrationPrimaryDataCheck = z.object({
        token: z.string(),
        firstName: z.string()
            .regex(/^[a-zA-Z\s'-]+$/, 'Invalid'),
        lastName: z.string()
            .regex(/^[a-zA-Z\s'-]+$/, 'Invalid'),
        nativeName: z.string()
            .optional(),
        username: z.string()
            .min(4)
            .max(14)
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        birthDate: z.string(),
        country: z.object({ 
            locale: z.enum(['en', 'ka']),
            value: z.string(), 
            content: z.string()
        }, { message: 'Invalid country' })
    });

    static finishRegistration = z.object({
        token: z.string(),
        firstName: z.string()
            .regex(/^[a-zA-Z\s'-]+$/, 'Invalid'),
        lastName: z.string()
            .regex(/^[a-zA-Z\s'-]+$/, 'Invalid'),
        nativeName: z.string()
            .optional(),
        username: z.string()
            .min(4)
            .max(14)
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        birthDate: z.string(),
        country: z.object({ 
            locale: z.enum(['en', 'ka']),
            value: z.string(), 
            content: z.string()
        }, { message: 'Invalid country' }),
        registrationType: z.enum(['player', 'manager', 'team owner'])
    });
    
    static twoFactorAuthSubmit = z.object({
        token: z.string()
            .min(6, 'min')
            .max(6, 'max')
    });
}

class AuthController {
    static async authorization(req: Request, res: Response) {
        try {
            const validatedData = AuthSchemas.authorizationSchema.parse(req.body);
            const { email, password } = validatedData;
            
            const user = await User.findOne({ where: { email } });
            if (!user) {
                res.status(404).send({ errorMessage: 'Invalid email or password' });
                return;
            }

            if (user.is_deleted) {
                const deletedUser = await DeletedUser.findOne({ where: { user_id: user.id } });

                if (deletedUser) {
                    res.status(400).send({ errorMessage: {
                        isDeleted: `This account is set to be deleted on ${deletedUser?.deletion_scheduled_at}`
                    } });
                    return;
                } else {
                    await user.update({ is_deleted: false });
                }
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                const has2FAEnabled = await TwoFactorAuthenticator.findOne({
                    where: { user_id: user.id }
                });

                if (has2FAEnabled) {
                    res.status(200).send({
                        tfa: {
                            uid: user.id
                        }
                    });
                    return;
                }

                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);

                res.send({
                    accessToken: accessToken,
                    refreshToken: refreshToken
                });
                return;
            }

            res.status(400).send({ errorMessage: 'Invalid email or password' });
            return;
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`AUTH: error caught at 'authorization': ${String(error)}`);
            res.status(500).json({ errorMessage: 'Internal Server Error' });
        }
    }

    static async authorization2FA(req: Request, res: Response) {
        try {
            const validatedData = AuthSchemas.authorization2FASchema.parse(req.body);
            const { token, uid } = validatedData;

            const user = await User.findByPk(uid);

            if (!user) {
                res.status(404).send({ errorMessage: 'Invalid uid' });
                return;
            }

            const twoFAEnabled = await TwoFactorAuthenticator.findOne({ 
                where: { user_id: uid } 
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
            
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            res.status(200).send({
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`AUTH: error caught at 'twoFactorAuthLoginCheck': ${String(error)}`);
            res.status(500).json({ errorMessage: 'Internal Server Error' }); 
        }
    }

    static async registration(req: Request, res: Response) {
        try {
            const validatedData = AuthSchemas.registrationSchema.parse(req.body);
            const { 
                type, 
                firstName,
                lastName, 
                nativeName,
                username, 
                email, 
                password, 
                birthDate, 
                country
            } = validatedData;

            const usernameIsUsed = await User.findOne({
                where: {
                    [Op.and]: [
                        Sequelize.where(fn('LOWER', col('username')), username.toLowerCase())
                    ] 
                }
            });
            if (usernameIsUsed) {
                res.status(400).json({ errorMessage: 'This username is already used' });
                return;
            }

            const emailIsUsed = await User.findOne({ where: { email } });
            if (emailIsUsed) {
                res.status(400).json({ errorMessage: 'This email is already used' });
                return;
            }

            const birthDateIsValid = checkBirthDate(new Date(birthDate));

            if (!birthDateIsValid) {
                res.status(400).json({ errorMessage: 'Invalid birth date.' });
                return;
            }

            await loadCountriesInLanguage(country.locale);
            const countryIsValid = await checkCountry(country);
            
            if (!countryIsValid) {
                res.status(400).json({ errorMessage: 'Invalid country.' });
                return;
            }

            const user = await User.create({ 
                first_name: firstName,
                last_name: lastName,
                native_name: nativeName,
                username: username, 
                email: email, 
                password: password, 
                birthDate: new Date(birthDate), 
                country: country.value,
                type: type
            });

            await UserProfile.create({
                user_id: user.id
            });

            await UserRole.create({
                user_id: user.id,
                role_id: 1
            });

            res.status(201).json({ message: 'User registered successfully' });
            return;
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`AUTH: error caught at 'registration': ${String(error)}`);
            res.status(500).json({ errorMessage: 'Internal Server Error' });
        }
    }

    static async finishRegistrationPrimaryDataCheck(req: Request, res: Response) {
        try {
            const validatedData = AuthSchemas.finishRegistrationPrimaryDataCheck.parse(req.body);
            const { token, username, birthDate, country } = validatedData;

            const authHold = await AuthProviderHold.findOne({ where: { token } });
            if (!authHold) {
                res.status(404).json({ errorMessage: 'Invalid token' });
                return;
            }

            const usernameIsUsed = await User.findOne({ where: { username } });
            if (usernameIsUsed) {
                res.status(400).json({ errorMessage: 'This username is already used' });
                return;
            }

            const birthDateIsValid = checkBirthDate(new Date(birthDate));

            if (!birthDateIsValid) {
                res.status(400).json({ errorMessage: 'Invalid birth date.' });
                return;
            }

            await loadCountriesInLanguage(country.locale);
            const countryIsValid = await checkCountry(country);
            
            if (!countryIsValid) {
                res.status(400).json({ errorMessage: 'Invalid country.' });
                return;
            }

            res.status(201).json({ message: 'Data is valid.' });
            return;
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`AUTH: error caught at 'finishRegistrationPrimaryDataCheck': ${String(error)}`);
            res.status(500).json({ errorMessage: 'Internal Server Error' });
        }
    }

    static async finishRegistration(req: Request, res: Response) {
        try {
            const validatedData = AuthSchemas.finishRegistration.parse(req.body);
            const { 
                token, 
                firstName,
                lastName,
                nativeName,
                username, 
                birthDate, 
                country, 
                registrationType
            } = validatedData;

            const authHold = await AuthProviderHold.findOne({ where: { token } });
            if (!authHold) {
                res.status(404).json({ errorMessage: 'Invalid token' });
                return;
            }

            const usernameIsUsed = await User.findOne({ where: { username } });
            if (usernameIsUsed) {
                res.status(400).json({ errorMessage: 'This username is already used' });
                return;
            }

            const birthDateIsValid = checkBirthDate(new Date(birthDate));

            if (!birthDateIsValid) {
                res.status(400).json({ errorMessage: 'Invalid birth date.' });
                return;
            }
            
            await loadCountriesInLanguage(country.locale);
            const countryIsValid = await checkCountry(country);
            
            if (!countryIsValid) {
                res.status(400).json({ errorMessage: 'Invalid country.' });
                return;
            }

            const user = await User.create({
                first_name: firstName,
                last_name: lastName,
                native_name: nativeName,
                username: username,
                email: authHold.email,
                birthDate: new Date(birthDate),
                country: country.value,
                type: registrationType.replace(' ', '_')
            });
            
            await UserProfile.create({
                user_id: user.id
            });

            await UserRole.create({
                user_id: user.id,
                role_id: 1
            });

            await AuthProvider.create({
                user_id: user.id,
                provider: authHold.provider,
                provider_user_id: authHold.provider_user_id
            });

            await authHold.destroy();

            res.status(200).json({ message: 'User registered successfully' });
            return;
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`AUTH: error caught at 'finishRegistration': ${String(error)}`);
            res.status(500).json({ errorMessage: 'Internal Server Error' });
        }
    }

    static async refreshAccessToken(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const accessToken = generateAccessToken(req.currentUser);

                res.status(200).json({ accessToken: accessToken });
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            logger.error(`AUTH: error caught at 'refreshAccessToken': ${String(error)}`);
            res.status(500).json({ errorMessage: 'Internal Server Error' });
        }
    }

    static async getUserData(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const userData = await User.getUserData(req.currentUser.id);

                if (userData) {
                    if (userData.is_deleted) {
                        res.status(400).send({ errorMessage: `This account is set to be deleted.` });
                        return;
                    }

                    const isAuthProvided = await AuthProvider.findOne({ where: { user_id: userData.id } });

                    if (isAuthProvided) {
                        const authProviderData = await AuthProvider.getData(isAuthProvided.id);

                        res.send({
                            ...userData,
                            authProvider: authProviderData
                        });
                        return;
                    } else {
                        res.send(userData);
                        return;
                    }
                }

                res.send(userData);
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            logger.error(`AUTH: error caught at 'getUserData': ${String(error)}`);
            res.status(500).json({ errorMessage: 'Internal Server Error' });
        }
    }

    static async googleAuthCallback(req: Request, res: Response) {
        const result = req.user as User | { redirectToFrontend: boolean; profile: any };

        if (!(result instanceof User)) {
            const alreadyExists = await AuthProviderHold.findOne({ where: {
                email: result.profile.email,
                provider: 'google',
                provider_user_id: result.profile.id
            } });
            if (alreadyExists) {
                await alreadyExists.destroy();
            }

            const authHold = await AuthProviderHold.create({
                email: result.profile.email,
                provider: 'google',
                provider_user_id: result.profile.id
            });

            res.redirect(`${process.env.FRONTEND_URL}/finish-registration?token=${authHold.token}`);
            return;
        }

        const accessToken = generateAccessToken(result);
        const refreshToken = generateRefreshToken(result);

        res.redirect(`${process.env.FRONTEND_URL}/auth?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }

    static async discordAuthCallback(req: Request, res: Response) {
        const result = req.user as User | { redirectToFrontend: boolean; profile: any };

        if (!(result instanceof User)) {
            const alreadyExists = await AuthProviderHold.findOne({ where: {
                email: result.profile.email,
                provider: 'discord',
                provider_user_id: result.profile.id
            } });
            if (alreadyExists) {
                await alreadyExists.destroy();
            }

            const authHold = await AuthProviderHold.create({
                email: result.profile.email,
                provider: 'discord',
                provider_user_id: result.profile.id
            });

            res.redirect(`${process.env.FRONTEND_URL}/finish-registration?token=${authHold.token}`);
            return;
        }

        const accessToken = generateAccessToken(result);
        const refreshToken = generateRefreshToken(result);

        res.redirect(`${process.env.FRONTEND_URL}/auth?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }

    static async twoFactorAuthenticationQRCode(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const secret = authenticator.generateSecret();
                const otpauth = authenticator.keyuri(req.currentUser.username, 'IPLA', secret);

                const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

                const alreadyExists = await TwoFactorAuthHold.findOne({ where: { user_id: req.currentUser.id } });
                if (alreadyExists) {
                    await alreadyExists.destroy();
                }

                await TwoFactorAuthHold.create({
                    user_id: req.currentUser.id,
                    secret: secret
                });

                res.status(200).send({ qrCode: qrCodeDataUrl, manualKey: secret });
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`AUTH: error caught at 'twoFactorAuthenticationQRCode': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    
    static async cancelTwoFactorAuthenticationQRCode(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const { userId } = req.params;

                if (parseInt(userId) !== req.currentUser.id) {
                    res.status(403).send('Forbidden');
                    return;
                }

                const alreadyExists = await TwoFactorAuthHold.findOne({ 
                    where: { user_id: req.currentUser.id } 
                });
                if (alreadyExists) {
                    await alreadyExists.destroy();
                }

                res.status(200).send('2FA hold was canceled');
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`AUTH: error caught at 'cancelTwoFactorAuthenticationQRCode': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async enableTwoFactorAuthentication(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = AuthSchemas.twoFactorAuthSubmit.parse(req.body);
                const { token } = validatedData;

                const twoFAuthHold = await TwoFactorAuthHold.findOne({ 
                    where: { user_id: req.currentUser.id } 
                });

                if (!twoFAuthHold) {
                    res.status(404).send({ errorMessage: '2FA Hold does not exist' });
                    return;
                }

                const isValid = authenticator.check(token, twoFAuthHold.secret);

                if (!isValid) {
                    res.status(400).send({ errorMessage: 'Invalid' });
                    return;
                }

                await TwoFactorAuthenticator.create({ 
                    user_id: req.currentUser.id,
                    secret: twoFAuthHold.secret
                });
                await twoFAuthHold.destroy();

                res.status(200).send('Successfully set 2FA on your account');
                return;
            } else {
                res.status(401).send('Not authorized');
                return;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`AUTH: error caught at 'submitTwoFactorAuthentication': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async removeTwoFactorAuthentication(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const { userId } = req.params;

                if (parseInt(userId) !== req.currentUser.id) {
                    res.status(403).send('Forbidden');
                    return;
                }

                const has2FAEnabled = await TwoFactorAuthenticator.findOne({
                    where: { user_id: req.currentUser.id }
                });

                if (!has2FAEnabled) {
                    res.status(404).send({ errorMessage: 'Account does not have 2FA enabled' });
                    return;
                }

                await has2FAEnabled.destroy();

                res.status(200).send('Successfully disabled 2FA'); res.status(403).send('Forbidden');
                return;
            } else {
                res.status(401).send('Not authorized');
                return;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`AUTH: error caught at 'removeTwoFactorAuthentication': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async check2FA(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const validatedData = AuthSchemas.twoFactorAuthSubmit.parse(req.body);
                const { token } = validatedData;

                const has2FAEnabled = await TwoFactorAuthenticator.findOne({
                    where: { user_id: req.currentUser.id }
                });

                if (!has2FAEnabled) {
                    res.status(404).send({ errorMessage: 'Account does not have 2FA enabled' });
                    return;
                }

                const isValid = authenticator.check(token, has2FAEnabled.secret);

                if (!isValid) {
                    res.status(400).send({ errorMessage: 'Invalid token' });
                    return;
                }

                res.status(200).send({ success: true });
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`AUTH: error caught at 'removeTwoFactorAuthentication': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async deleteUser(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const { userId } = req.params;

                if (parseInt(userId) !== req.currentUser.id) {
                    res.status(403).json({ message: 'Forbidden' });
                    return;
                }

                const deletionScheduledAt = new Date();
                deletionScheduledAt.setDate(deletionScheduledAt.getDate() + 30);

                await DeletedUser.create({
                    user_id: parseInt(userId),
                    deletion_scheduled_at: deletionScheduledAt
                });

                await User.update(
                    { is_deleted: true }, 
                    { where: { id: parseInt(userId) } }
                );

                res.status(200).send({ message: 'Account marked for deletion' });
            } else {
                res.status(401).send('Not authorized');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            logger.error(`AUTH: error caught at 'accountDeletion': ${String(error)}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

export default AuthController;