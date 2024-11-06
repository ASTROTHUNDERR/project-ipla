import '../index.css';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../../../context/ApiProvider';

import { HelperMessage, resetPasswordFormSchema, ResetPasswordFormData } from '../types';

import AuthFooter from '../../../components/Footers/Auth';
import InputField from '../../../components/InputField';
import SubmitButton from '../../../components/SubmitButton';

type HelperMessages = {
    newPassword?: HelperMessage;
    repeatNewPassword?: HelperMessage;
};

export default function ResetPassword() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { postRequest, loading } = useApi();

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({ 
        resolver: zodResolver(resetPasswordFormSchema)
    });

    const [helperMessages, setHelperMessages] = useState<HelperMessages | undefined>(undefined);

    const inputFields: { header: string }[] = t('auth.reset_password.input_fields', { returnObjects: true }) as { header: string }[];

    useEffect(() => {
        if (!token) {
            return navigate('/login');
        }
    }, [token, navigate])

    const filteredInputFields = inputFields.map(field => {
        const fieldName = field.header.toLowerCase();
        const inputName = (fieldName === 'new password' || fieldName === 'ახალი პაროლი') ? 'newPassword'
            : 'repeatNewPassword';

        return {
            ...field,
            name: inputName as 'newPassword' | 'repeatNewPassword'
        };
    });

    useEffect(() => {
        setHelperMessages(prev => ({
            ...prev, 
            newPassword: errors.newPassword && errors.newPassword.message
                ? { text: t(errors.newPassword.message), danger: true }
                : undefined,
            repeatNewPassword: errors.repeatNewPassword && errors.repeatNewPassword.message
                ? { text: t(errors.repeatNewPassword.message), danger: true }
                : undefined
        }));
    }, [errors, t]);  

    const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
        const request = await postRequest('/pass/reset_password', {
            ...data,
            token: token
        });
        if (request.error) {
            setHelperMessages({
                newPassword: {
                    text: request.error, danger: true
                },
                repeatNewPassword: {
                    text: request.error, danger: true
                }
            });
        } else {
            navigate('/login');
        }
    };

    return (
        <div className='auth-component relative flex column'>
            <main className='auth-content flex items-center content-center'>
                <section className='auth-content-wrapper flex items-center content-center column'>
                    <div className='auth-login-content'>
                        <div className='auth-content-title-wrapper flex content-center text-center'>
                            <h1 className='auth-title'>{t('auth.reset_password.header')}</h1>
                        </div>
                        <form className='auth-login-form flex column' onSubmit={handleSubmit(onSubmit)}>
                            {filteredInputFields.map((field, index) => (
                                <InputField 
                                    key={index}
                                    required
                                    headText={field.header}
                                    inputType='password'
                                    inputName={field.name}
                                    helperMessage={helperMessages?.[field.name]}
                                    register={register}
                                    {...(index === 1 && {
                                        className: 'margin-top-20'
                                    })}
                                />
                            ))}
                            <SubmitButton 
                                isLoading={loading}
                                innerElement={t('auth.reset_password.submit_button')}
                                className='auth-submit-btn margin-top-30'
                            />
                        </form>
                        <div className='auth-helper-wrapper bottom'>
                            <span>{t('auth.reset_password.footer.text')}</span>
                            <a href="/login">{t('auth.reset_password.footer.button_text')}</a>
                        </div>
                    </div>
                </section>
            </main>
            <AuthFooter />
        </div>
    )
};