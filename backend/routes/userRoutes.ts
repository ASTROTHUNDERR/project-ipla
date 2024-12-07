import { Router } from 'express';
import { RateLimit } from '../middlewares/authMiddleware';
import { AuthenticateToken } from '../middlewares/authMiddleware';
import UserController from '../controllers/userController';

const userRouter = Router();
const authenticateToken = new AuthenticateToken();
const rateLimit = new RateLimit(15 * 60 * 1000, 100, 'Too many requests for sensitive data, please try again later.');

userRouter.post(
    '/password-change', 
    rateLimit.apply(), 
    authenticateToken.authenticateToken, 
    UserController.passwordChange
);
userRouter.post(
    '/password-change/2fa',
    rateLimit.apply(),
    authenticateToken.authenticateToken,
    UserController.passwordChangeF2A
);
userRouter.post(
    '/username-change', 
    rateLimit.apply(), 
    authenticateToken.authenticateToken, 
    UserController.usernameChange
);
userRouter.post(
    '/username-change/2fa',
    rateLimit.apply(),
    authenticateToken.authenticateToken,
    UserController.usernameChange2FA
);

userRouter.post(
    '/email-change/request',
    rateLimit.apply(),
    authenticateToken.authenticateToken,
    UserController.emailChangeRequest
);
userRouter.post(
    '/email-change/2fa-request',
    rateLimit.apply(),
    authenticateToken.authenticateToken,
    UserController.emailChange2FARequest
);
userRouter.post(
    '/email-change/verify-current',
    rateLimit.apply(),
    authenticateToken.authenticateToken,
    UserController.emailChangeVerifyCurrent
);
userRouter.post(
    '/email-change/set-new-email',
    rateLimit.apply(),
    authenticateToken.authenticateToken,
    UserController.emailChangeSetNewEmail
);
userRouter.post(
    '/email-change/verify-new',
    rateLimit.apply(),
    authenticateToken.authenticateToken,
    UserController.emailChangeVerifyNew
);

export default userRouter;