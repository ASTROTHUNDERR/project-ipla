import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

import { User } from '../models';

function generateAccessToken(user: User) {
    return jwt.sign(
        { id: user.id, email: user.email }, 
        process.env.ACCESS_TOKEN_SECRET as string, 
        { expiresIn: '5m' }
    );
}

function generateRefreshToken(user: User): string {
    return jwt.sign(
        { id: user.id, email: user.email }, 
        process.env.REFRESH_TOKEN_SECRET as string, 
        { expiresIn: '30m' }
    );
}

class AuthController {
    static async authorization(req: Request, res: Response) {
        const { email, password } = req.body;

        res.json({ message: 'User logged in successfully' });
    }
}

export default AuthController;