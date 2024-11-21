import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { z } from 'zod';
import logger from '../config/logger';

import { User, UserRole, AuthHold, AuthProvider } from '../models';
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

    static registrationSchema = z.object({
        type: z.enum(['player', 'manager', 'team owner']),
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

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
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

    static async registration(req: Request, res: Response) {
        try {
            const validatedData = AuthSchemas.registrationSchema.parse(req.body);
            const { type, username, email, password, birthDate, country } = validatedData;

            const usernameIsUsed = await User.findOne({ where: { username } });
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

            await User.create({ 
                username: username, 
                email: email, 
                password: password, 
                birthDate: new Date(birthDate), 
                country: country.value,
                type: type
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

            const authHold = await AuthHold.findOne({ where: { token } });
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
            const { token, username, birthDate, country, registrationType } = validatedData;

            const authHold = await AuthHold.findOne({ where: { token } });
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
                username: username,
                email: authHold.email,
                birthDate: new Date(birthDate),
                country: country.value,
                type: registrationType.replace(' ', '_')
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
                res.send(userData);
            }
        } catch (error) {
            logger.error(`AUTH: error caught at 'getUserData': ${String(error)}`);
            res.status(500).json({ errorMessage: 'Internal Server Error' });
        }
    }

    static async googleAuthCallback(req: Request, res: Response) {
        const result = req.user as User | { redirectToFrontend: boolean; profile: any };

        if (!(result instanceof User)) {
            const alreadyExists = await AuthHold.findOne({ where: {
                email: result.profile.email,
                provider: 'google',
                provider_user_id: result.profile.id
            } });
            if (alreadyExists) {
                await alreadyExists.destroy();
            }

            const authHold = await AuthHold.create({
                email: result.profile.email,
                provider: 'google',
                provider_user_id: result.profile.id
            });

            res.redirect(`${process.env.FRONTEND_URL}/finish-registration?token=${authHold.token}&username=${result.profile.username}`);
            return;
        }

        const accessToken = generateAccessToken(result);
        const refreshToken = generateRefreshToken(result);

        res.redirect(`${process.env.FRONTEND_URL}/auth?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }

    static async discordAuthCallback(req: Request, res: Response) {
        const result = req.user as User | { redirectToFrontend: boolean; profile: any };

        if (!(result instanceof User)) {
            const alreadyExists = await AuthHold.findOne({ where: {
                email: result.profile.email,
                provider: 'discord',
                provider_user_id: result.profile.id
            } });
            if (alreadyExists) {
                await alreadyExists.destroy();
            }

            const authHold = await AuthHold.create({
                email: result.profile.email,
                provider: 'discord',
                provider_user_id: result.profile.id
            });

            res.redirect(`${process.env.FRONTEND_URL}/finish-registration?token=${authHold.token}&username=${result.profile.username}`);
            return;
        }

        const accessToken = generateAccessToken(result);
        const refreshToken = generateRefreshToken(result);

        res.redirect(`${process.env.FRONTEND_URL}/auth?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
}

export default AuthController;