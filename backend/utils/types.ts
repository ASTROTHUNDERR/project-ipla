import { Request } from 'express';
import { User } from '../db/models';

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
    id: number;
    first_name: string;
    last_name: string;
    native_name?: string;
    username: string;
    email: string;
    birthDate: Date;
    country: string;
    roles: {
        name: string;
    }[];
    tfa_enabled: boolean;
    is_deleted: boolean;
};