import { Router } from 'express';
import { RateLimit } from '../middlewares/authMiddleware';
import PasswordController from '../controllers/passwordController';

const passwordRouter = Router();
const pswRateLimit = new RateLimit(15 * 60 * 1000, 100, 'Too many requests for sensitive data, please try again later.');

passwordRouter.post('/password_reset', pswRateLimit.apply(), PasswordController.passwordReset);
passwordRouter.post('/reset_password', pswRateLimit.apply(), PasswordController.resetPassword);

export default passwordRouter;