import { Request } from 'express';
import { User } from '../models';

export interface AuthenticatedRequest extends Request {
    currentUser?: User;
};

export interface UserAuthorization {
    id: number;
    email: string;
    iat: number;
    exp: number;
};

export interface UserData {
    id: number,
    username: string,
    email: string,
    roles: {
        name: string,
    }[]
};