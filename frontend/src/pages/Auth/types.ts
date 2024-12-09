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
    firstName?: HelperMessage;
    lastName?: HelperMessage;
    nativeName?: HelperMessage;
    username?: HelperMessage;
    email?: HelperMessage;
    birthDate?: HelperMessage;
    country?: HelperMessage;
    password?: HelperMessage;
    newPassword?: HelperMessage;
    token?: HelperMessage;
};

export const registrationFirstStepSchema = z.object({
    firstName: z.string()
        .regex(/^[a-zA-Z\s'-]+$/, 'registration.registration.form.helper_texts.first_name.error_texts.invalid'),
    lastName: z.string()
        .regex(/^[a-zA-Z\s'-]+$/, 'registration.registration.form.helper_texts.last_name.error_texts.invalid'),
    nativeName: z.string()
        .optional(),
});

export type RegistrationFirstStepFormData = z.infer<typeof registrationFirstStepSchema>;

export const registrationSecondStepFormSchema = z.object({
    username: z.string()
        .min(4, 'registration.registration.form.helper_texts.username.error_texts.length')
        .max(14, 'registration.registration.form.helper_texts.username.error_texts.length')
        .regex(/^[a-zA-Z0-9_]+$/, 'registration.registration.form.helper_texts.username.general'),
    email: z.string()
        .email('registration.registration.form.helper_texts.email.error_texts.invalid'),
    birthDate: z.date({ message: 'registration.registration.form.helper_texts.birth_date.error_texts.invalid' })
        .optional(),
    country: z.object({ 
        locale: z.enum(['en', 'ka']), 
        value: z.string(), 
        content: z.string()
    }, { message: 'registration.registration.form.helper_texts.country.error_texts.invalid' })
        .optional(),
    password: z.string()
        .min(8, 'registration.registration.form.helper_texts.password.general')
        .regex(/[.!@#$%&]/, 'registration.registration.form.helper_texts.password.strong'),
});

export type RegistrationSecondStepFormData = z.infer<typeof registrationSecondStepFormSchema>;

export const finishRegistrationSecondStepFormSchema = z.object({
    username: z.string()
        .min(4, 'registration.registration.form.helper_texts.username.error_texts.length')
        .max(14, 'registration.registration.form.helper_texts.username.error_texts.length')
        .regex(/^[a-zA-Z0-9_]+$/, 'registration.registration.form.helper_texts.username.general'),
    birthDay: z.string()
        .min(1, 'registration.registration.form.helper_texts.birth_date.error_texts.invalid')
        .max(2, 'registration.registration.form.helper_texts.birth_date.error_texts.invalid'),
    birthYear: z.string()
        .min(4, 'registration.registration.form.helper_texts.birth_date.error_texts.invalid')
        .max(4, 'registration.registration.form.helper_texts.birth_date.error_texts.invalid'),
    birthDate: z.date({ message: 'registration.registration.form.helper_texts.birth_date.error_texts.invalid' })
        .optional(),
    country: z.object({ 
        locale: z.enum(['en', 'ka']), 
        value: z.string(), 
        content: z.string()
    }, { message: 'registration.registration.form.helper_texts.country.error_texts.invalid' })
        .optional(),
});

export type FinishRegistrationSecondStepFormData = z.infer<typeof finishRegistrationSecondStepFormSchema>;

export const loginFormSchema = z.object({
    email: z.string().email('registration.registration.form.helper_texts.email.error_texts.invalid'),
    password: z.string()
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export const passwordResetFormSchema = z.object({
    email: z.string().email('passwordReset.helper_texts.email.error_texts.invalid')
});

export type PasswordResetFormData = z.infer<typeof passwordResetFormSchema>;

export const resetPasswordFormSchema = z.object({
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

export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;