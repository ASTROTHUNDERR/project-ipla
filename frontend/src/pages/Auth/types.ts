import { z } from 'zod';

export type Card = {
    header: string;
    description: string;
    bullets: {
        content: string;
    }[];
    button: string;
};

export type HelperMessage = {
    text: string;
    danger: boolean;
};

export type HelperMessages = {
    username?: HelperMessage;
    email?: HelperMessage;
    password?: HelperMessage;
    newPassword?: HelperMessage;
};

export const registrationFormSchema = z.object({
    username: z.string()
        .min(4, 'auth.registration.form.helper_texts.username.error_texts.length')
        .max(14, 'auth.registration.form.helper_texts.username.error_texts.length')
        .regex(/^[a-zA-Z0-9_]+$/, 'auth.registration.form.helper_texts.username.general'),
    email: z.string().email('auth.registration.form.helper_texts.email.general'),
    password: z.string().min(8, 'auth.registration.form.helper_texts.password.general'),
});
  
export type RegistrationFormData = z.infer<typeof registrationFormSchema>;

export const finishRegistrationFormSchema = z.object({
    username: z.string()
        .min(4, 'auth.registration.form.helper_texts.username.error_texts.length')
        .max(14, 'auth.registration.form.helper_texts.username.error_texts.length')
        .regex(/^[a-zA-Z0-9_]+$/, 'auth.registration.form.helper_texts.username.general'),
});

export type FinishRegistrationFormData = z.infer<typeof finishRegistrationFormSchema>;

export const loginFormSchema = z.object({
    email: z.string(),
    password: z.string()
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export const passwordResetFormSchema = z.object({
    email: z.string().email('auth.password_reset.helper_texts.email.error_texts.invalid')
});

export type PasswordResetFormData = z.infer<typeof passwordResetFormSchema>;

export const resetPasswordFormSchema = z.object({
    newPassword: z.string().min(8, 'auth.reset_password.helper_texts.password.length'),
    repeatNewPassword: z.string().min(8, 'auth.reset_password.helper_texts.password.length')
}).refine((data) => data.newPassword === data.repeatNewPassword, {
    message: 'auth.reset_password.helper_texts.password.match',
    path: ['repeatNewPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;