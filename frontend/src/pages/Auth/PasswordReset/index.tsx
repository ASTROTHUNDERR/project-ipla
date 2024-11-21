import '../index.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../../../context/ApiProvider';

import { HelperMessages, passwordResetFormSchema, PasswordResetFormData } from '../types';

import AuthFooter from '../../../components/Footers/Auth';
import SubmitButton from '../../../components/SubmitButton';
import InputField from '../../../components/InputField';
import WindowPopup from '../../../components/WindowPopup';

export default function PasswordReset() {
    const { t } = useTranslation('passwordReset');
    const navigate = useNavigate();
    const { postRequest, loading } = useApi();

    const { register, handleSubmit  } = useForm<PasswordResetFormData>({ 
        resolver: zodResolver(passwordResetFormSchema)
    });
    
    const [helperMessages, setHelperMessages] = useState<HelperMessages | undefined>(undefined);
    const [popupState, setPopupState] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const onSubmit: SubmitHandler<PasswordResetFormData> = async (data) => {
        const request = await postRequest('/pass/password_reset', data);
        if (request.error) {
            setHelperMessages({
                email: { text: t('helper_texts.email.invalid'), danger: true }
            })
        } else {
            setPopupState(true);
            setUserEmail(data.email);
        }
    };

    return (
        <div className='auth-component relative flex column'>
            {popupState && userEmail && (
                <WindowPopup
                    width={400}
                    header={t('window_popup.header')}
                    description={
                        <span>
                            <Trans ns='passwordReset' i18nKey={'window_popup.description'} values={{ email: userEmail }}>
                                <strong />
                            </Trans>
                        </span>
                    }
                    submitButtonInnerElement='Okay'
                    submitBtnOnClick={() => navigate('/login')}
                />
            )}
            <main className='auth-content flex items-center content-center'>
                <section className='auth-content-wrapper flex items-center content-center column'>
                    <div className='auth-login-content'>
                        <div className='auth-content-title-wrapper flex content-center text-center'>
                            <h1 className='auth-title'>{t('header')}</h1>
                        </div>
                        <form className='auth-login-form flex column' onSubmit={handleSubmit(onSubmit)}>
                            <InputField 
                                required
                                headText={t('input_fields.email.header')}
                                inputType='email'
                                inputName='email'
                                helperMessage={helperMessages?.['email']}
                                register={register}
                            />
                            <SubmitButton 
                                isLoading={loading}
                                innerElement={t('submit_button')}
                                className='auth-submit-btn margin-top-30'
                            />
                        </form>
                        <div className='auth-helper-wrapper bottom'>
                            <span>{t('footer.text')}</span>
                            <a href="/login">{t('footer.button_text')}</a>
                        </div>
                    </div>
                </section>
            </main>
            <AuthFooter />
        </div>
    )
};