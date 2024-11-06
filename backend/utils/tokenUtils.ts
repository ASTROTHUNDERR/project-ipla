import jwt from 'jsonwebtoken';

import type { User } from '../models';

export function generateAccessToken(user: User) {
    return jwt.sign(
        { id: user.id, email: user.email }, 
        process.env.ACCESS_TOKEN_SECRET as string, 
        { expiresIn: '10m' }
    );
};

export function generateRefreshToken(user: User): string {
    return jwt.sign(
        { id: user.id, email: user.email }, 
        process.env.REFRESH_TOKEN_SECRET as string, 
        { expiresIn: '1h' }
    );
};