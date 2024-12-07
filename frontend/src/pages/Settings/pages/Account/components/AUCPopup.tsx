import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../../context/ApiProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';

import { UsernameChangeFormData, usernameChangeFormSchema, SAWindowPopupState, UsernameChangeHelperMessages } from '../../../types';
import { handleInputOnBlur, handleInputOnFocus } from '../../../../Auth/functions';
import { TFAFormSchema } from '../../../../../utils/types';

import WindowPopup from '../../../../../components/WindowPopup';
import InputField from '../../../../../components/InputField';

type Props = {
    setWindowPopupState: React.Dispatch<React.SetStateAction<SAWindowPopupState | null>>;
}

export default function SetttingsAccountUsernameChangePopup({ setWindowPopupState }: Props) {
    const { t } = useTranslation('settings');
    const { loading, protectedPostRequest } = useApi();

    const [helperMessages, setHelperMessages] = useState<UsernameChangeHelperMessages>({
        newUsername: { text: t('registration.registration.form.helper_texts.username.general', { ns: 'auth' }), danger: false } 
    });
    const [formData, setFormData] = useState<UsernameChangeFormData | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<UsernameChangeFormData>({ 
        resolver: zodResolver(usernameChangeFormSchema)
    });

    const { register: register2FA, handleSubmit: handleSubmit2FA, formState: { errors: errors2FA } } = useForm<{ token: string }>({
        resolver: zodResolver(TFAFormSchema)
    });

    useEffect(() => {
        if (errors) {
            setHelperMessages({
                newUsername: errors.newUsername && errors.newUsername.message
                    ? { text: t(errors.newUsername.message, { ns: 'auth' }), danger: true }
                    : { text: t('registration.registration.form.helper_texts.username.general', { ns: 'auth' }), danger: false } 
            });
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

    function handleUsernameInput(event: React.FormEvent<HTMLInputElement>) {
        const value = event.currentTarget.value;
        const isValid = /^[a-zA-Z0-9_]*$/.test(value); 
        
        if (!isValid) {
            setHelperMessages({
                newUsername: {
                    text: t('registration.registration.form.helper_texts.username.general', { ns: 'auth' }), danger: true
                }
            });
            event.preventDefault();
            return true;
        }
        setHelperMessages({
            newUsername: {
                text: t('registration.registration.form.helper_texts.username.general', { ns: 'auth' }), danger: false
            }
        });
        return false;
    };
    
    const onSubmit2FA: SubmitHandler<{ token: string }> = async (data) => {
        const request = await protectedPostRequest('/user/username-change/2fa', {
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

    const onSubmit: SubmitHandler<UsernameChangeFormData> = async (data) => {
        const request = await protectedPostRequest('/user/username-change', data);
        if (request.error) {
            if (request.error.includes('used')) {
                setHelperMessages({
                    newUsername: {
                        text: t('registration.registration.form.helper_texts.username.error_texts.in_use', { ns: 'auth' }), danger: true
                    }
                });
                return;
            };
        } else {
            if (request.data.tfa) {
                setFormData(data);
                return;
            } else {
                window.location.reload();
            }
        }
    };

    return (
            <>
                { formData ? (
                    <WindowPopup 
                        width={400}
                        header={t('account.popups.username_change.header')}
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
                        header={t('account.popups.username_change.header')}
                        content={
                            <div className='flex column'>
                                <InputField 
                                    required
                                    headText={t('account.popups.username_change.fields.new_username.header')}
                                    inputType='text'
                                    inputName='newUsername'
                                    inputId='username'
                                    className='margin-top-20'
                                    autoComplete='username'
                                    register={register}
                                    helperMessage={helperMessages.newUsername}
                                    { ...(!(helperMessages.newUsername?.danger) && {
                                        onFocus: handleInputOnFocus,
                                        onBlur: handleInputOnBlur
                                    }) }
                                    onInput={handleUsernameInput}
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