import { z } from 'zod';
import { HelperMessage } from '../Auth/types';

export type SAWindowPopupState = 
    'change_password' | 'add_auth_app' | 'delete_account' 
    | 'username_change' | 'email_change' | 'remove_auth_app';

export type PasswordChangeHelperMessages = {
    currentPassword?: HelperMessage;
    newPassword?: HelperMessage;
    repeatNewPassword?: HelperMessage;
    token?: HelperMessage;
};

export const passwordChangeFormSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string()
        .min(8, 'resetPassword.helper_texts.password.length')
        .regex(/[.!@#$%&]/, 'registration.registration.form.helper_texts.password.strong'),
    repeatNewPassword: z.string()
        .min(8, 'resetPassword.helper_texts.password.length')
        .regex(/[.!@#$%&]/, 'registration.registration.form.helper_texts.password.strong')
}).refine((data) => data.newPassword === data.repeatNewPassword, {
    message: 'resetPassword.helper_texts.password.match',
    path: ['repeatNewPassword'],
});
  
export type PasswordChangeFormData = z.infer<typeof passwordChangeFormSchema>;  

export type UsernameChangeHelperMessages = {
    newUsername?: HelperMessage;
    token?: HelperMessage;
};

export const usernameChangeFormSchema = z.object({
    newUsername: z.string()
        .min(4, 'registration.registration.form.helper_texts.username.error_texts.length')
        .max(14, 'registration.registration.form.helper_texts.username.error_texts.length')
        .regex(/^[a-zA-Z0-9_]+$/, 'registration.registration.form.helper_texts.username.general'),
});

export type UsernameChangeFormData = z.infer<typeof usernameChangeFormSchema>;

export type TwoFactorAuthHelperMessages = {
    token?: HelperMessage;
};

export const twoFactorAuthFormData = z.object({
    token: z.string().optional()
});

export type TwoFactorAuthFormData = z.infer<typeof twoFactorAuthFormData>;

export const emailChangeFormSchema = z.object({
    newEmail: z.string()
        .email('registration.registration.form.helper_texts.email.error_texts.invalid')
});

export type EmailChangeFormData = z.infer<typeof emailChangeFormSchema>;

export type Social = {
    url: string;
    nickname: string;
    provider: 'yt' | 'fb' | 'ig' | 'x';
};