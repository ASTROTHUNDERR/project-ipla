import '../index.css';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../../../context/ApiProvider';
import { useAuth } from '../../../context/AuthProvider';

import { loginUser } from '../../../utils/api';
import { loginFormSchema, LoginFormData, HelperMessages } from '../types';

import AuthFooter from '../../../components/Footers/Auth';
import SubmitButton from '../../../components/SubmitButton';
import InputField from '../../../components/InputField';

import GoogleLoginButton from '../../../components/GoogleLoginButton';
import DiscordLoginButton from '../../../components/DiscordLoginButton';

function Login() {
    const { t } = useTranslation();
    const { postRequest, loading } = useApi();
    const { refreshUser } = useAuth();

    const { register, handleSubmit  } = useForm<LoginFormData>({ 
        resolver: zodResolver(loginFormSchema)
    });

    const [helperMessages, setHelperMessages] = useState<HelperMessages | undefined>({
        email: { text: t('auth.login.helper_texts.email.error_texts.invalid'), danger: false },
        password: { text: t('auth.login.helper_texts.password.error_texts.invalid'), danger: false }
    });

    const inputFields: { header: string }[] = t('auth.login.input_fields', { returnObjects: true }) as { header: string }[];
    const filteredInputFields = inputFields.map(field => {
        const fieldName = field.header.toLowerCase();
        const inputType = (fieldName === 'email' || fieldName === 'ელფოსტა') ? 'email' : 'password';
        const inputName = (fieldName === 'email' || fieldName === 'ელფოსტა') ? 'email' : 'password';

        return {
            ...field,
            type: inputType,
            name: inputName as | "email" | "password"
        };
    });

    const onSubmit: SubmitHandler<LoginFormData> = async (data, event) => {
        if (event && event.target instanceof HTMLFormElement) {
            const activeElement = document.activeElement;
            if (activeElement instanceof HTMLInputElement) {
                activeElement.blur();
            }
        }
        const request = await postRequest('/auth/login', data);
        if (request.error) {
            setHelperMessages({
                email: { text: t('auth.login.helper_texts.email.error_texts.invalid'), danger: true },
                password: { text: t('auth.login.helper_texts.password.error_texts.invalid'), danger: true }
            })
        } else {
            setHelperMessages(undefined);
            loginUser(request.data);
            refreshUser();
        }
    };

    return (
        <div className='auth-component relative flex column'>
            <main className='auth-content flex items-center content-center'>
                <section className='auth-content-wrapper flex items-center content-center column'>
                    <div className='auth-login-content'>
                        <div className='auth-content-title-wrapper flex content-center'>
                            <h1 className='auth-title'>{t('auth.login.header')}</h1>
                        </div>
                        <form className='auth-login-form flex column' onSubmit={handleSubmit(onSubmit)}>
                            {filteredInputFields.map((field, index) => (
                                <InputField 
                                    key={index}
                                    required
                                    headText={field.header}
                                    inputType={field.type}
                                    inputName={field.name}
                                    register={register}
                                    helperMessage={helperMessages?.[field.name]}
                                    {...index !== 0 ? { className: 'margin-top-20' } : {}}
                                />
                            ))}
                            <div className='auth-helper-wrapper top'>
                                <a href="/password-reset">{t('auth.login.forgot_password')}</a>
                            </div>
                            <SubmitButton 
                                isLoading={loading}
                                innerElement={t('auth.login.submit_button')}
                                className='auth-submit-btn margin-top-25'
                            />
                        </form>
                        <div className='auth-divider flex items-center'>
                            <div className='auth-divider-line'></div>
                            <span className='auth-divider-text flex content-center'>{t('auth.login.divider')}</span>
                            <div className='auth-divider-line'></div>
                        </div>
                        <div className='auth-signin-options flex column'>
                            <GoogleLoginButton />
                            <DiscordLoginButton />
                        </div>
                        <div className='auth-helper-wrapper bottom'>
                            <span>{t('auth.login.footer.text')}</span>
                            <a href="/register">{t('auth.login.footer.button_text')}</a>
                        </div>
                    </div>
                </section>
            </main>
            <AuthFooter />
        </div>
    )
};

export default Login;