import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { z } from 'zod';

import { User, UserRole, AuthHold, AuthProvider } from '../models';
import { AuthenticatedRequest } from '../utils/types';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils';


class AuthSchemas {
    static authorizationSchema = z.object({
        email: z.string().email(),
        password: z.string().min(8)
    });

    static registrationSchema = z.object({
        username: z.string()
            .min(4)
            .max(14)
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        email: z.string().email(),
        password: z.string().min(8),
        type: z.enum(['player', 'manager', 'team owner'])
    });

    static finishRegistrationUsernameCheck = z.object({
        token: z.string(),
        username: z.string()
            .min(4)
            .max(14)
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    });

    static finishRegistration = z.object({
        token: z.string(),
        username: z.string()
            .min(4)
            .max(14)
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
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
                res.status(404).send({ message: 'Invalid email or password' });
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

            res.status(400).send({ message: 'Invalid email or password' });
            return;
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async registration(req: Request, res: Response) {
        try {
            const validatedData = AuthSchemas.registrationSchema.parse(req.body);
            const { username, email, password, type } = validatedData;

            const usernameIsUsed = await User.findOne({ where: { username } });
            if (usernameIsUsed) {
                res.status(400).json({ message: 'This username is already used' });
                return;
            }

            const emailIsUsed = await User.findOne({ where: { email } });
            if (emailIsUsed) {
                res.status(400).json({ message: 'This email is already used' });
                return;
            }

            await User.create({ username: username, email: email, password: password, type: type });

            res.status(201).json({ message: 'User registered successfully' });
            return;
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async finishRegistrationUsernameCheck(req: Request, res: Response) {
        try {
            const validatedData = AuthSchemas.finishRegistrationUsernameCheck.parse(req.body);
            const { token, username } = validatedData;

            const authHold = await AuthHold.findOne({ where: { token } });
            if (!authHold) {
                res.status(404).json({ message: 'Invalid token' });
                return;
            }

            const usernameIsUsed = await User.findOne({ where: { username } });
            if (usernameIsUsed) {
                res.status(400).json({ message: 'This username is already used' });
                return;
            }

            res.status(201).json({ message: 'Username is valid.' });
            return;
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ errors: error.errors });
                return;
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async finishRegistration(req: Request, res: Response) {
        try {
            const validatedData = AuthSchemas.finishRegistration.parse(req.body);
            const { token, username, registrationType } = validatedData;

            const authHold = await AuthHold.findOne({ where: { token } });
            if (!authHold) {
                res.status(404).json({ message: 'Invalid token' });
                return;
            }

            const usernameIsUsed = await User.findOne({ where: { username } });
            if (usernameIsUsed) {
                res.status(400).json({ message: 'This username is already used' });
                return;
            }

            const user = await User.create({
                username: username,
                email: authHold.email,
                type: registrationType
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
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async refreshAccessToken(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const accessToken = generateAccessToken(req.currentUser);

                res.status(200).json({ accessToken: accessToken });
            }
        } catch (err) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async getUserData(req: AuthenticatedRequest, res: Response) {
        try {
            if (req.currentUser) {
                const userData = await User.getUserData(req.currentUser.id);
                res.send(userData);
            }
        } catch (err) {
            res.status(500).json({ message: 'Internal Server Error' });
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