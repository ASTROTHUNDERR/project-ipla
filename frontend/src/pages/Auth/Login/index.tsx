import '../index.css';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../../../context/ApiProvider';
import { useAuth } from '../../../context/AuthProvider';

import { loginUser } from '../../../utils/api';
import { loginFormSchema, LoginFormData, HelperMessages } from '../types';
import { TFAFormSchema } from '../../../utils/types';
import { formatDateInString } from '../functions';

import AuthFooter from '../../../components/Footers/Auth';
import SubmitButton from '../../../components/SubmitButton';
import InputField from '../../../components/InputField';
import WindowPopup from '../../../components/WindowPopup';

import GoogleLoginButton from '../../../components/GoogleLoginButton';
import DiscordLoginButton from '../../../components/DiscordLoginButton';

function Login() {
    const { t } = useTranslation('auth');
    const { postRequest, loading } = useApi();
    const { refreshUser } = useAuth();

    const { register: loginRegister, handleSubmit: loginHandleSubmit } = useForm<LoginFormData>({ 
        resolver: zodResolver(loginFormSchema)
    });

    const { register: register2FA, handleSubmit: handleSubmit2FA, formState: { errors: errors2FA }  } = useForm<{ token: string }>({
        resolver: zodResolver(TFAFormSchema)
    });

    const [helperMessages, setHelperMessages] = useState<HelperMessages | undefined>({
        email: { text: t('login.helper_texts.email.error_texts.invalid'), danger: false },
        password: { text: t('login.helper_texts.password.error_texts.invalid'), danger: false }
    });
    const [isDeleted, setIsDeleted] = useState<string | null>(null);
    const [userHas2FAEnabled, setUserHas2FAEnabled] = useState<{ uid: number } | null>(null);

    const inputFields: { header: string }[] = t('login.input_fields', { returnObjects: true }) as { header: string }[];
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

    useEffect(() => {
        if (errors2FA) {
            setHelperMessages({
                token: errors2FA.token && errors2FA.token.message
                    ? { 
                        text: t(errors2FA.token.message, { ns: 'settings' }),
                        danger: true
                    } : undefined
            });
        }
    }, [errors2FA, t])

    const on2FASubmit: SubmitHandler<{ token: string }> = async (data) => {
        if (userHas2FAEnabled) {
            const request = await postRequest('/auth/login_2fa_check', {
                ...data,
                uid: userHas2FAEnabled.uid
            });
            if (request.error) {
                setHelperMessages({
                    token: { 
                        text: t('account.popups.add_two_factor_auth_app.qr_code.helper_texts.token.general', { ns: 'settings' }), 
                        danger: true
                    }
                });
                return;
            } else {
                setHelperMessages(undefined);
                loginUser(request.data);
                refreshUser();
            }
        }
    };

    const onSubmit: SubmitHandler<LoginFormData> = async (data, event) => {
        if (event && event.target instanceof HTMLFormElement) {
            const activeElement = document.activeElement;
            if (activeElement instanceof HTMLInputElement) {
                activeElement.blur();
            }
        }
        const request = await postRequest('/auth/login', data);
        if (request.error) {
            if (request.error.isDeleted) {
                setHelperMessages(undefined);
                setIsDeleted(formatDateInString(request.error.isDeleted));
                return;
            }
            setHelperMessages({
                email: { text: t('login.helper_texts.email.error_texts.invalid'), danger: true },
                password: { text: t('login.helper_texts.password.error_texts.invalid'), danger: true }
            });
        } else {
            if (request.data.tfa) {
                setHelperMessages(undefined);
                setUserHas2FAEnabled(request.data.tfa);
                return;
            }
            setHelperMessages(undefined);
            loginUser(request.data);
            refreshUser();
        }
    };

    return (
        <>
            { isDeleted && (
                <WindowPopup 
                    width={400}
                    header={t('login.is_deleted.header')}
                    content={
                        <span>
                            {isDeleted}. 
                            <span> Contact <a href="/support" className='link'>support</a> if you need any help.</span>
                        </span>
                    }
                    submitLoading={loading}
                    submitButtonInnerElement={t('general_words.okay', { ns: 'translation' })}
                    onFormSubmit={() => {}}
                />
            ) }
            { userHas2FAEnabled && (
                <WindowPopup 
                    width={400}
                    header={t('login.2fa.header')}
                    content={
                        <div className='flex column'>
                            <InputField 
                                required
                                headText={t('login.2fa.field.header')}
                                placeHolder={t('login.2fa.field.placeholder')}
                                inputType='number'
                                inputName='token'
                                inputId='token'
                                className='margin-top-20'
                                register={register2FA}
                                helperMessage={helperMessages?.token}
                            />
                        </div>
                    }
                    cancelButton
                    cancelButtonText={t('general_words.cancel', { ns: 'translation' })}
                    cancelButtonOnClick={() => setUserHas2FAEnabled(null)}
                    submitLoading={loading}
                    submitButtonInnerElement={t('login.2fa.field.submit_button_text')}
                    onFormSubmit={handleSubmit2FA(on2FASubmit)}
                />
            ) }
            <div className='auth-component relative flex column'>
                <main className='auth-content flex items-center content-center'>
                    <section className='auth-content-wrapper flex items-center content-center column'>
                        <div className='auth-login-content'>
                            <div className='auth-content-title-wrapper flex content-center'>
                                <h1 className='auth-title'>{t('login.header')}</h1>
                            </div>
                            <form className='auth-login-form flex column' onSubmit={loginHandleSubmit(onSubmit)}>
                                {filteredInputFields.map((field, index) => (
                                    <InputField 
                                        key={index}
                                        required
                                        headText={field.header}
                                        inputType={field.type}
                                        inputName={field.name}
                                        inputId={field.name}
                                        autoComplete={field.name.startsWith('email') ? 'email' : 'current-password'}
                                        register={loginRegister}
                                        helperMessage={helperMessages?.[field.name]}
                                        {...index !== 0 ? { className: 'margin-top-20' } : {}}
                                    />
                                ))}
                                <div className='auth-helper-wrapper top'>
                                    <a href="/password-reset">{t('login.forgot_password')}</a>
                                </div>
                                <SubmitButton 
                                    isLoading={loading}
                                    innerElement={t('login.submit_button')}
                                    className='auth-submit-btn margin-top-25'
                                />
                            </form>
                            <div className='auth-divider flex items-center'>
                                <div className='auth-divider-line'></div>
                                <span className='auth-divider-text flex content-center'>{t('login.divider')}</span>
                                <div className='auth-divider-line'></div>
                            </div>
                            <div className='auth-signin-options flex column'>
                                <GoogleLoginButton />
                                <DiscordLoginButton />
                            </div>
                            <div className='auth-helper-wrapper bottom'>
                                <span>{t('login.footer.text')}</span>
                                <a href="/register">{t('login.footer.button_text')}</a>
                            </div>
                        </div>
                    </section>
                </main>
                <AuthFooter />
            </div>
        </>
    )
};

export default Login;