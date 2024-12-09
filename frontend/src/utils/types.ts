import { z } from 'zod';

export interface ApiResponse<T> {
    data: T | null;
    error: string | any | null;
};

export interface User {
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
    authProvider?: {
        user_id: number;
        provider: string;
    };
    tfa_enabled: boolean;
};

export const TFAFormSchema = z.object({
    token: z.string()
        .min(6, 'account.popups.add_two_factor_auth_app.qr_code.helper_texts.token.general')
        .max(6, 'account.popups.add_two_factor_auth_app.qr_code.helper_texts.token.general')
});

export interface UserProfile {
    user_id: number;
    banner_path?: string;
    avatar_path?: string;
    about?: string;
    socials?: {
        url: string;
        nickname: string;
        provider: 'yt' | 'fb' | 'ig' | 'x';
    }[]
};