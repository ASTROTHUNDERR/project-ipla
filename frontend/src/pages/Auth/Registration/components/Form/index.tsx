import styles from '../../Registration.module.css';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';  
import { useRegistrationContext } from '../../../../../context/RegistrationProvider';
import { useApi } from '../../../../../context/ApiProvider';

import { ReactComponent as ChevronLeftIcon } from '../../../../../assets/icons/chevron-left.svg';

import * as functions from '../../../functions';
import { registrationFormSchema, RegistrationFormData, HelperMessages } from '../../../types';

import Button from '../../../../../components/Button';
import SubmitButton from '../../../../../components/SubmitButton';
import InputField from '../../../../../components/InputField';

export default function RegistrationFormPage() {
    const { registrationType } = useRegistrationContext();
    const { t } = useTranslation();
    const navigate = useNavigate(); 
    const { loading, postRequest } = useApi();

    const { register, handleSubmit, formState: { errors }  } = useForm<RegistrationFormData>({ 
        resolver: zodResolver(registrationFormSchema)
    });

    const [helperMessages, setHelperMessages] = useState<HelperMessages>({
        username: { text: t('auth.registration.form.helper_texts.username.general'), danger: false },
        email: undefined,
        password: { text: t('auth.registration.form.helper_texts.password.general'), danger: false },
    });

    const inputFields: { header: string }[] = t('auth.registration.form.input_fields', { returnObjects: true }) as { header: string }[];

    useEffect(() => {
        setHelperMessages(prev => ({
            ...prev,
            username: errors.username && errors.username.message
                ? { text: t(errors.username.message), danger: true }
                : { text: t('auth.registration.form.helper_texts.username.general'), danger: false },
            email: errors.email && errors.email.message
                ? { text: t(errors.email.message), danger: true }
                : undefined,
            password: errors.password && errors.password.message
                ? { text: t(errors.password.message), danger: true }
                : { text: t('auth.registration.form.helper_texts.password.general'), danger: false },
        }));
    }, [errors, t]);    

    const filteredInputFields = inputFields.map(field => {
        const fieldName = field.header.toLowerCase();
        const inputType = (fieldName === 'email' || fieldName === 'ელფოსტა') ? 'email'
            : (fieldName === 'password' || fieldName === 'პაროლი') ? 'password' : 'text';
        const inputName = (fieldName === 'email' || fieldName === 'ელფოსტა') ? 'email'
            : (fieldName === 'password' || fieldName === 'პაროლი') ? 'password' : 'username';

        return {
            ...field,
            type: inputType,
            name: inputName as "username" | "email" | "password"
        };
    });

    const onSubmit: SubmitHandler<RegistrationFormData> = async (data, event) => {
        if (event && event.target instanceof HTMLFormElement) {
            const activeElement = document.activeElement;
            if (activeElement instanceof HTMLInputElement) {
                activeElement.blur();
            }
        }
        const request = await postRequest('/auth/register', {
            ...data,
            type: registrationType
        });
        if (request.error) {
            const errorMessages: HelperMessages = {};
            if (request.error.includes('username')) {
                errorMessages.username = {
                    text: t('auth.registration.form.helper_texts.username.error_texts.in_use'),
                    danger: true,
                };
            }
            if (request.error.includes('email')) {
                errorMessages.email = {
                    text: t('auth.registration.form.helper_texts.email.error_texts.in_use'),
                    danger: true,
                };
            }
            setHelperMessages(prev => ({ ...prev, ...errorMessages }));
        } else {
            navigate('/login');
        }
    };
    
    return (
        <main className='auth-content flex items-center content-center'>
            <section className='auth-content-wrapper flex items-center content-center column'>
                <div className='auth-login-content relative'>
                    <div className={`auth-content-title-wrapper flex content-center text-center flex row ${styles['intro-header']}`}>
                        <div className='flex column items-center'>
                            <h1 className='auth-title'>{t('auth.registration.intro.header')}</h1>
                            <span className='auth-title-sp'>{functions.capitalizeWords(registrationType)}</span>
                        </div>
                        <Button 
                            innerElement={
                                <span className='flex row items-center content-center'>
                                    <ChevronLeftIcon width={16} height={16} />
                                    <span className='margin-left-5'>{t('basic.back')}</span>
                                </span>
                            }
                            className={`auth-back-button form flex items-center ${styles['intro-back-button']}`}
                            onClick={() => navigate('/register')}
                        />
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
                                {...(index !== 0 ? { className: 'margin-top-20' } : {})}
                                {...(index === 0 && { 
                                    helperMessage: helperMessages[field.name],
                                    ...(!helperMessages[field.name]?.danger ? {
                                        onFocus: functions.handleInputOnFocus,
                                        onBlur: functions.handleInputOnBlur
                                    } : {}),
                                    onInput: (e) => functions.handleUsernameInput(
                                        e, 
                                        t('auth.registration.form.helper_texts.username.general'), 
                                        setHelperMessages
                                    )
                                })} 
                                {...(index === 1 && {
                                    helperMessage: helperMessages[field.name]
                                })}
                                {...(index === 2 && { 
                                    helperMessage: helperMessages[field.name],
                                    ...(!helperMessages[field.name]?.danger ? {
                                        onFocus: functions.handleInputOnFocus,
                                        onBlur: functions.handleInputOnBlur
                                    } : {})
                                })}
                            />
                        ))}
                        <SubmitButton 
                            isLoading={loading}
                            innerElement={t('auth.registration.form.submit_button')}
                            className='auth-submit-btn margin-top-30'
                        />
                    </form>
                    <div className='auth-helper-wrapper bottom'>
                        <span>{t('auth.registration.form.footer.text')}</span>
                        <a href="/login">{t('auth.registration.form.footer.button_text')}</a>
                    </div>
                </div>
            </section>
        </main>
    )
};