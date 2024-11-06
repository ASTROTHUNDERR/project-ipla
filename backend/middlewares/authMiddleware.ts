import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

import { User, Role} from '../models';
import { AuthenticatedRequest, UserAuthorization } from '../utils/types';

class AuthenticateToken {
    constructor() {
        this.authenticateToken = this.authenticateToken.bind(this);
        this.authenticateExpiredToken = this.authenticateExpiredToken.bind(this);
    }

    async authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).send('Access token is required');
            return;
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, async (err, decodedToken) => {
            if (err) {
                if (err instanceof TokenExpiredError) {
                    return res.status(403).send('Access token has expired');
                }
                if (err instanceof JsonWebTokenError) {
                    return res.status(403).send('Invalid access token');
                }
                return res.status(500).send('Internal Server Error');
            }

            const user = decodedToken as UserAuthorization;

            const currentUser = await User.findByPk(user.id, {
                include: Role
            });

            if (!currentUser) {
                return res.status(404).send('User not found');
            }

            req.currentUser = currentUser;
            next();
        });
    }

    async authenticateExpiredToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).send('Refresh token is required');
            return;
        }

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string, async (err, decodedToken) => {
            if (err) {
                return res.status(403).send('Invalid refresh token');
            }

            const user = decodedToken as UserAuthorization | undefined;

            if (!user) {
                return res.status(403).send('Invalid refresh token');
            }

            const currentUser = await User.findByPk(user.id, {
                include: Role
            });

            if (!currentUser) {
                return res.status(404).send('User not found');
            }

            req.currentUser = currentUser;
            next();
        });
    }
}

class RateLimit {
    private limiter: any;

    constructor(windowMs: number, max: number, message: string) {
        this.limiter = rateLimit({
            windowMs,
            max,
            message: {
                status: 429,
                message: message
            },
            handler: (req: Request, res: Response) => {
                res.status(429).json({ message: message });
            }
        });
    }

    apply() {
        return this.limiter;
    }
}

export { AuthenticateToken, RateLimit };