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
    birthDate?: HelperMessage;
    country?: HelperMessage;
    password?: HelperMessage;
    newPassword?: HelperMessage;
};

export const registrationFormSchema = z.object({
    username: z.string()
        .min(4, 'registration.form.helper_texts.username.error_texts.length')
        .max(14, 'registration.form.helper_texts.username.error_texts.length')
        .regex(/^[a-zA-Z0-9_]+$/, 'registration.form.helper_texts.username.general'),
    email: z.string().email('registration.form.helper_texts.email.error_texts.invalid'),
    birthDay: z.string()
        .min(1, 'registration.form.helper_texts.birth_date.error_texts.invalid')
        .max(2, 'registration.form.helper_texts.birth_date.error_texts.invalid'),
    birthYear: z.string()
        .min(4, 'registration.form.helper_texts.birth_date.error_texts.invalid')
        .max(4, 'registration.form.helper_texts.birth_date.error_texts.invalid'),
    birthDate: z.date({ message: 'registration.form.helper_texts.birth_date.error_texts.invalid' })
        .optional(),
    country: z.object({ 
        locale: z.enum(['en', 'ka']), 
        value: z.string(), 
        content: z.string()
    }, { message: 'registration.form.helper_texts.country.error_texts.invalid' })
        .optional(),
    password: z.string()
        .min(8, 'registration.form.helper_texts.password.general')
        .regex(/[.!@#$%&]/, 'registration.form.helper_texts.password.strong'),
});
  
export type RegistrationFormData = z.infer<typeof registrationFormSchema>;  

export const finishRegistrationFormSchema = z.object({
    username: z.string()
        .min(4, 'registration.form.helper_texts.username.error_texts.length')
        .max(14, 'registration.form.helper_texts.username.error_texts.length')
        .regex(/^[a-zA-Z0-9_]+$/, 'registration.form.helper_texts.username.general'),
    birthDay: z.string()
        .min(1, 'registration.form.helper_texts.birth_date.error_texts.invalid')
        .max(2, 'registration.form.helper_texts.birth_date.error_texts.invalid'),
    birthYear: z.string()
        .min(4, 'registration.form.helper_texts.birth_date.error_texts.invalid')
        .max(4, 'registration.form.helper_texts.birth_date.error_texts.invalid'),
    birthDate: z.date({ message: 'registration.form.helper_texts.birth_date.error_texts.invalid' }).optional(),
    country: z.object({ 
        locale: z.enum(['en', 'ka']), 
        value: z.string(), 
        content: z.string()
    }, { message: 'registration.form.helper_texts.country.error_texts.invalid' })
        .optional(),
});

export type FinishRegistrationFormData = z.infer<typeof finishRegistrationFormSchema>;

export const loginFormSchema = z.object({
    email: z.string(),
    password: z.string()
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export const passwordResetFormSchema = z.object({
    email: z.string().email('helper_texts.email.error_texts.invalid')
});

export type PasswordResetFormData = z.infer<typeof passwordResetFormSchema>;

export const resetPasswordFormSchema = z.object({
    newPassword: z.string().min(8, 'helper_texts.password.length'),
    repeatNewPassword: z.string().min(8, 'helper_texts.password.length')
}).refine((data) => data.newPassword === data.repeatNewPassword, {
    message: 'helper_texts.password.match',
    path: ['repeatNewPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;