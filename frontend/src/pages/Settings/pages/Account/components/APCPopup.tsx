import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../../context/ApiProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';

import { PasswordChangeFormData, SAWindowPopupState, PasswordChangeHelperMessages, passwordChangeFormSchema } from '../../../types';
import { TFAFormSchema } from '../../../../../utils/types';

import WindowPopup from '../../../../../components/WindowPopup';
import InputField from '../../../../../components/InputField';

type Props = {
    setWindowPopupState: React.Dispatch<React.SetStateAction<SAWindowPopupState | null>>;
}

export default function SetttingsAccountPasswordChangePopup({ setWindowPopupState }: Props) {
    const { t } = useTranslation('settings');
    const { loading, protectedPostRequest } = useApi();

    const [helperMessages, setHelperMessages] = useState<PasswordChangeHelperMessages | undefined>(undefined);
    const [formData, setFormData] = useState<PasswordChangeFormData | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<PasswordChangeFormData>({ 
        resolver: zodResolver(passwordChangeFormSchema)
    });

    const { register: register2FA, handleSubmit: handleSubmit2FA, formState: { errors: errors2FA } } = useForm<{ token: string }>({
        resolver: zodResolver(TFAFormSchema)
    });

    useEffect(() => {
        if (errors) {
            setHelperMessages(prevData => {
                return {
                    ...prevData,
                    currentPassword: errors.currentPassword && errors.currentPassword.message 
                        ? { text: t(errors.currentPassword.message, { ns: 'auth' }), danger: true }
                        : undefined,
                    newPassword: errors.newPassword && errors.newPassword.message
                        ? { text: t(errors.newPassword.message, { ns: 'auth' }), danger: true }
                        : undefined,
                    repeatNewPassword: errors.repeatNewPassword && errors.repeatNewPassword.message
                        ? { text: t(errors.repeatNewPassword.message, { ns: 'auth' }), danger: true }
                        : undefined
                }
            })
        }
    }, [errors, t]);

    useEffect(() => {
        if (errors2FA) {
            setHelperMessages({
                token: errors2FA.token && errors2FA.token.message
                    ? { text: t(errors2FA.token.message), danger: true }
                    : undefined
            });
        }
    }, [errors2FA, t]);

    const onSubmit2FA: SubmitHandler<{ token: string }> = async (data) => {
        const request = await protectedPostRequest('/user/password-change/2fa', {
            ...data,
            ...formData
        });
        if (request.error) {
            if (request.error.includes('token')) {
                setHelperMessages({
                    token: { 
                        text: t('account.popups.add_two_factor_auth_app.qr_code.helper_texts.token.general'), 
                        danger: true
                    }
                });
                return;
            } else {
                setHelperMessages({
                    token: { 
                        text: t('account.popups.add_two_factor_auth_app.qr_code.helper_texts.token.invalid_data'), 
                        danger: true
                    }
                });
                return;
            }
        } else {
            window.location.reload();
        }
    };

    const onSubmit: SubmitHandler<PasswordChangeFormData> = async (data) => {
        const request = await protectedPostRequest('/user/password-change', data);
        if (request.error) {
            if (request.error.toLocaleLowerCase().includes('invalid')) {
                setHelperMessages({
                    currentPassword: {
                        text: t('account.helper_texts.invalid_password'),
                        danger: true
                    }
                });
                return;
            }
            if (request.error.includes('different')) {
                setHelperMessages({
                    newPassword: {
                        text: t('account.helper_texts.different_password'),
                        danger: true
                    },
                    repeatNewPassword: {
                        text: t('account.helper_texts.different_password'),
                        danger: true
                    }
                });
                return;
            }
            if (request.error.includes('match')) {
                setHelperMessages({
                    newPassword: {
                        text: t('resetPassword.helper_texts.password.match', { ns: 'auth' }),
                        danger: true
                    },
                    repeatNewPassword: {
                        text: t('resetPassword.helper_texts.password.match', { ns: 'auth' }),
                        danger: true
                    }
                });
                return;
            }
        } else {
            console.log(request.data)
            if (request.data.tfa) {
                setFormData(data);
                return;
            } else {
                setWindowPopupState(null);
                document.location.reload();
            }
        }
    };

    return (
            <>
                { formData ? (
                    <WindowPopup 
                        width={400}
                        header={t('account.popups.password_change.header')}
                        content={
                            <div className='flex column'>
                                <InputField 
                                    required
                                    headText={t('account.popups.add_two_factor_auth_app.qr_code.fields.token.header')}
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
                        cancelButtonText={
                            t('general_words.cancel', { ns: 'translation' })
                        }
                        cancelButtonOnClick={() => setWindowPopupState(null)}
                        submitLoading={loading}
                        submitButtonInnerElement={
                            t('general_words.submit', { ns: 'translation' })
                        }
                        onFormSubmit={handleSubmit2FA(onSubmit2FA)}
                    />
                ) : (
                    <WindowPopup 
                        width={400}
                        header={t('account.popups.password_change.header')}
                        content={
                            <div className='flex column'>
                                <InputField 
                                    required
                                    headText={t('account.popups.password_change.fields.current_password.header')}
                                    inputType='password'
                                    inputName='currentPassword'
                                    inputId='current-password'
                                    className='margin-top-20'
                                    autoComplete='new-password'
                                    register={register}
                                    helperMessage={helperMessages?.['currentPassword']}
                                />
                                <InputField 
                                    required
                                    headText={t('account.popups.password_change.fields.new_password.header')}
                                    inputType='password'
                                    inputName='newPassword'
                                    inputId='new-password'
                                    className='margin-top-20'
                                    autoComplete='new-password'
                                    register={register}
                                    helperMessage={helperMessages?.['newPassword']}
                                />
                                <InputField 
                                    required
                                    headText={t('account.popups.password_change.fields.repeat_new_password.header')}
                                    inputType='password'
                                    inputName='repeatNewPassword'
                                    inputId='repeat-new-password'
                                    className='margin-top-20'
                                    autoComplete='new-password'
                                    register={register}
                                    helperMessage={helperMessages?.['repeatNewPassword']}
                                />
                            </div>
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
                        onFormSubmit={handleSubmit(onSubmit)}
                    />
                ) }
            </>
    )
};