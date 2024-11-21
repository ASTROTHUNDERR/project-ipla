import express from 'express';
import passport from 'passport';
import { AuthenticateToken, RateLimit } from '../middlewares/authMiddleware';
import AuthController from '../controllers/authController';

const authRouter = express.Router();
const authenticateToken = new AuthenticateToken();
const authRateLimit = new RateLimit(15 * 60 * 1000, 100, 'Too many requests from this IP, please try again later.');
const refreshAndDataRateLimit = new RateLimit(15 * 60 * 1000, 50, 'Too many requests for sensitive data, please try again later.');

authRouter.post('/login', authRateLimit.apply(), AuthController.authorization);
authRouter.post('/register', authRateLimit.apply(), AuthController.registration);
authRouter.post('/finish_registration/primary_data_check', refreshAndDataRateLimit.apply(), AuthController.finishRegistrationPrimaryDataCheck);
authRouter.post('/finish_registration', refreshAndDataRateLimit.apply(), AuthController.finishRegistration);

authRouter.post('/refresh_access_token', refreshAndDataRateLimit.apply(), authenticateToken.authenticateExpiredToken, AuthController.refreshAccessToken);
authRouter.get('/get_user_data', refreshAndDataRateLimit.apply(), authenticateToken.authenticateToken, AuthController.getUserData);

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get(
    '/google/callback', 
    passport.authenticate('google', { session: false }), 
    AuthController.googleAuthCallback
);

authRouter.get('/discord', passport.authenticate('discord', { scope: ['identify', 'email'] }));
authRouter.get(
    '/discord/callback',
    passport.authenticate('discord', { session: false }),
    AuthController.discordAuthCallback
);

export default authRouter;