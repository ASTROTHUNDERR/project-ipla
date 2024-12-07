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

export default userProfileRouter;