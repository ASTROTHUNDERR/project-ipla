import { Router } from 'express';
import { RateLimit } from '../middlewares/authMiddleware';
import { AuthenticateToken } from '../middlewares/authMiddleware';
import UserProfileController from '../controllers/userProfileController';

const userProfileRouter = Router();
const authenticateToken = new AuthenticateToken();
const rateLimit = new RateLimit(15 * 60 * 1000, 100, 'Too many requests for sensitive data, please try again later.');

userProfileRouter.get(
    '/:userId', 
    rateLimit.apply(), 
    authenticateToken.authenticateToken, 
    UserProfileController.getUserProfileData
);
userProfileRouter.put(
    '/update',
    rateLimit.apply(),
    authenticateToken.authenticateToken,
    UserProfileController.updateUserProfile
);
userProfileRouter.delete(
    '/remove-banner',
    rateLimit.apply(),
    authenticateToken.authenticateToken,
    UserProfileController.removeProfileBanner
);
userProfileRouter.delete(
    '/remove-avatar',
    rateLimit.apply(),
    authenticateToken.authenticateToken,
    UserProfileController.removeProfileAvatar
);

export default userProfileRouter;