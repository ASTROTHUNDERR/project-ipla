import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans as Translate } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useApi } from '../../../../../context/ApiProvider';
import { use2FA } from '../../../../../context/TwoFactorAuthProvider';

import { socket } from '../../../../../utils/api';
import { HelperMessage } from '../../../../Auth/types';
import { SAWindowPopupState, emailChangeFormSchema, EmailChangeFormData } from '../../../types';

import WindowPopup from '../../../../../components/WindowPopup';
import InputField from '../../../../../components/InputField';
import TwoFactorAuthPopup from '../../../../../components/2FAPopup';

type Props = {
    userEmail: string;
    userId: number;
    setWindowPopupState: React.Dispatch<React.SetStateAction<SAWindowPopupState | null>>;
}

export default function SettingsAccountEmailChangePopup({ userEmail, userId, setWindowPopupState }: Props) {
    const { t } = useTranslation('settings');
    const navigate = useNavigate();
    const { loading, protectedPostRequest } = useApi();
    const { setHelperMessages: set2FAHelperMessages } = use2FA();

    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

    const [helperMessages, setHelperMessages] = useState<{ newEmail: HelperMessage | undefined } | undefined>(undefined);
    const [firstStepIsLoading, setFirstStepIsLoading] = useState(false);
    const [has2FAEnabled, setHas2FAEnabled] = useState(false);

    const secondStepMethods = useForm<EmailChangeFormData>({ 
        resolver: zodResolver(emailChangeFormSchema)
    });

    useEffect(() => {
        const handleEmailChangeVerification = (message: any) => {
            console.log(message)
            if (message.status) {
                setCurrentStep(2);
                setFirstStepIsLoading(false);
            }
        };
    
        socket.on('email_change_verification', handleEmailChangeVerification);
    
        return () => {
            socket.off('email_change_verification', handleEmailChangeVerification);
        };
    }, []);

    useEffect(() => {
        const errors = secondStepMethods.formState.errors;
        if (errors) {
            setHelperMessages({
                newEmail: errors.newEmail && errors.newEmail.message
                    ? { text: t(errors.newEmail.message, { ns: 'auth' }), danger: true }
                    : undefined
            });
        }
    }, [secondStepMethods, t])

    const firstStepSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFirstStepIsLoading(true);
        const response = await protectedPostRequest('/user/email-change/request', {
            user_id: userId
        });
        if (response.error) {
            navigate('/');
            return;
        } else {
            if (response.data.tfa) {
                setHas2FAEnabled(true);
            }
        }
    };

    const on2FASubmit: SubmitHandler<{ token: string }> = async (data) => {
        const response = await protectedPostRequest('/user/email-change/2fa-request', {
            ...data,
            user_id: userId
        });
        if (response.error) {
            if ((response.error as string).includes('token')) {
                set2FAHelperMessages({
                    token: { 
                        text: t('account.popups.add_two_factor_auth_app.qr_code.helper_texts.token.general', { ns: 'settings' }), 
                        danger: true
                    }
                });
                return;
            }
        } else {
            setHas2FAEnabled(false);
        }
    };
 
    const secondStepSubmit: SubmitHandler<EmailChangeFormData> = async (data) => {
        const response = await protectedPostRequest('/user/email-change/set-new-email', {
            user_id: userId,
            new_email: data.newEmail
        });
        if (response.error) {
            if ((response.error as string).includes('invalid')) {
                setHelperMessages({
                    newEmail: {
                        text: t('registration.registration.form.helper_texts.email.error_texts.invalid', { ns: 'auth' }),
                        danger: true
                    }
                });
                return;
            }
            if ((response.error as string).includes('used')) {
                setHelperMessages({
                    newEmail: {
                        text: t('registration.registration.form.helper_texts.email.error_texts.in_use', { ns: 'auth' }),
                        danger: true
                    }
                });
                return;
            }
        } else {
            setCurrentStep(3);
        }
    };

    return (
        <>  
            { has2FAEnabled ? (
                <TwoFactorAuthPopup 
                    headerText={t('login.2fa.header', { ns: 'auth' })}
                    inputFieldHeader={t('login.2fa.field.header', { ns: 'auth' })}
                    inputFieldPlaceholder={t('login.2fa.field.placeholder', { ns: 'auth' })}
                    cancelButtonText={t('general_words.cancel', { ns: 'translation' })}
                    onCancel={() => setHas2FAEnabled(false)}
                    submitButtonIsLoading={loading}
                    submitButtonText={t('login.2fa.field.submit_button_text', { ns: 'auth' })}
                    onSubmit={on2FASubmit}
                />
            ) : (
                <>
                    { currentStep === 1 ? (
                        <WindowPopup 
                            width={400}
                            header={t('account.popups.email_change.header')}
                            content={
                                <span>
                                    <Translate 
                                        ns='settings' 
                                        i18nKey={
                                            firstStepIsLoading ?
                                                'account.popups.email_change.first_step.email_was_sent'
                                                : 'account.popups.email_change.first_step.description'
                                        } 
                                        values={{ current_email: userEmail }}
                                    >
                                        <strong />
                                    </Translate>
                                </span>
                            }
                            cancelButton
                            cancelButtonText={
                                t('general_words.cancel', { ns: 'translation' })
                            }
                            cancelButtonOnClick={() => setWindowPopupState(null)}
                            submitLoading={firstStepIsLoading}
                            submitButtonInnerElement={
                                t('account.popups.email_change.first_step.submit_button_text')
                            }
                            onFormSubmit={firstStepSubmit}
                        />
                    ) : currentStep === 2 ? (
                        <WindowPopup 
                            width={400}
                            header={t('account.popups.email_change.header')}
                            content={
                                <InputField 
                                    required
                                    headText={t('account.popups.email_change.second_step.new_email_field.header')}
                                    register={secondStepMethods.register}
                                    inputType='email'
                                    inputName='newEmail'
                                    inputId='newEmail'
                                    className='margin-top-20'
                                    autoComplete='email'
                                    helperMessage={helperMessages?.newEmail}
                                />
                            }
                            cancelButton
                            cancelButtonText={
                                t('general_words.cancel', { ns: 'translation' })
                            }
                            cancelButtonOnClick={() => setWindowPopupState(null)}
                            submitLoading={loading}
                            submitButtonInnerElement={
                                t('general_words.submit', { ns: 'translation' })
                            }
                            onFormSubmit={secondStepMethods.handleSubmit(secondStepSubmit)}
                        />
                    ) : (
                        <WindowPopup 
                            width={400}
                            header={t('account.popups.email_change.header')}
                            content={
                                <span>
                                    <Translate 
                                        ns='settings' 
                                        i18nKey={'account.popups.email_change.third_step.description'} 
                                        values={{ new_email: secondStepMethods.getValues().newEmail }}
                                    >
                                        <strong />
                                    </Translate>
                                </span>
                            }
                            cancelButton
                            cancelButtonText={
                                t('general_words.cancel', { ns: 'translation' })
                            }
                            cancelButtonOnClick={() => setWindowPopupState(null)}
                            submitLoading={loading}
                            submitButtonInnerElement={
                                t('general_words.okay', { ns: 'translation' })
                            }
                            onFormSubmit={() => setWindowPopupState(null)}
                        />
                    ) }
                </>
            ) }
        </>
    )
};