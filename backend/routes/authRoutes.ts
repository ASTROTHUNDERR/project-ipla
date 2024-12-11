import express from 'express';
import passport from 'passport';
import { AuthenticateToken, RateLimit } from '../middlewares/authMiddleware';
import AuthController from '../controllers/authController';

const authRouter = express.Router();
const authenticateToken = new AuthenticateToken();
const authRateLimit = new RateLimit(15 * 60 * 1000, 100, 'Too many requests from this IP, please try again later.');
const refreshAndDataRateLimit = new RateLimit(15 * 60 * 1000, 180, 'Too many requests for sensitive data, please try again later.');

authRouter.post(
    '/login', 
    authRateLimit.apply(), 
    AuthController.authorization
);
authRouter.post(
    '/login_2fa_check',
    authRateLimit.apply(),
    AuthController.authorization2FA
);
authRouter.post(
    '/register/first-step',
    authRateLimit.apply(),
    AuthController.registrationFirstStep
);
authRouter.post(
    '/register', 
    authRateLimit.apply(), 
    AuthController.registration
);
authRouter.post(
    '/finish_registration/primary_data_check', 
    refreshAndDataRateLimit.apply(), 
    AuthController.finishRegistrationPrimaryDataCheck
);
authRouter.post(
    '/finish_registration', 
    refreshAndDataRateLimit.apply(), 
    AuthController.finishRegistration
);

authRouter.post(
    '/refresh_access_token', 
    refreshAndDataRateLimit.apply(), 
    authenticateToken.authenticateExpiredToken, 
    AuthController.refreshAccessToken
);
authRouter.get(
    '/users', 
    refreshAndDataRateLimit.apply(), 
    authenticateToken.authenticateToken, 
    AuthController.getUserData
);

authRouter.get(
    '/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
authRouter.get(
    '/google/callback', 
    passport.authenticate('google', { session: false }), 
    AuthController.googleAuthCallback
);

authRouter.get(
    '/discord', 
    passport.authenticate('discord', { scope: ['identify', 'email'] })
);
authRouter.get(
    '/discord/callback',
    passport.authenticate('discord', { session: false }),
    AuthController.discordAuthCallback
);

// authRouter.get(
//     '/youtube', 
//     passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly'] }),
// );
// authRouter.get(
//     '/youtube/callback', 
//     passport.authenticate('google', { session: false }), 
//     AuthController.youtubeAuthCallback
// );

authRouter.post(
    '/2fa/check',
    refreshAndDataRateLimit.apply(), 
    authenticateToken.authenticateToken, 
    AuthController.check2FA
);
authRouter.get(
    '/2fa/qrcode', 
    refreshAndDataRateLimit.apply(), 
    authenticateToken.authenticateToken, 
    AuthController.twoFactorAuthenticationQRCode
);
authRouter.delete(
    '/2fa/cancel_hold/:userId',
    refreshAndDataRateLimit.apply(), 
    authenticateToken.authenticateToken, 
    AuthController.cancelTwoFactorAuthenticationQRCode
);
authRouter.post(
    '/2fa/enable',
    refreshAndDataRateLimit.apply(), 
    authenticateToken.authenticateToken, 
    AuthController.enableTwoFactorAuthentication
);
authRouter.post(
    '/2fa/disable',
    refreshAndDataRateLimit.apply(), 
    authenticateToken.authenticateToken, 
    AuthController.removeTwoFactorAuthentication
);
authRouter.delete(
    '/users/:userId',
    refreshAndDataRateLimit.apply(), 
    authenticateToken.authenticateToken, 
    AuthController.deleteUser
);

export default authRouter;