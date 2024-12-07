import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../../context/ApiProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';

import { SAWindowPopupState, TwoFactorAuthHelperMessages, twoFactorAuthFormData, TwoFactorAuthFormData } from '../../../types';

import WindowPopup from '../../../../../components/WindowPopup';
import InputField from '../../../../../components/InputField';

type Props = {
    userId: number;
    setWindowPopupState: React.Dispatch<React.SetStateAction<SAWindowPopupState | null>>;
}

export default function SetttingsAccount2FAPopup({ userId, setWindowPopupState }: Props) {
    const { t } = useTranslation(['settings', 'translation']);
    const { loading, protectedGetRequest, protectedPostRequest, protectedDeleteRequest } = useApi();

    const [currentPage, setCurrentPage] = useState<'qrcode' | 'codecheck'>('qrcode')
    const [qrCodeData, setQRCodeData] = useState<{ qrCode: string, manualKey: string } | null>(null);

    const [helperMessages, setHelperMessages] = useState<TwoFactorAuthHelperMessages | undefined>(undefined);

    const { register, handleSubmit } = useForm<TwoFactorAuthFormData>({ 
        resolver: zodResolver(twoFactorAuthFormData)
    });

    
    useEffect(() => {
        async function getQRCodeData() {
            const response = await protectedGetRequest('/auth/2fa/qrcode');
            if (!response.error) {
                setQRCodeData({
                    qrCode: response.data.qrCode,
                    manualKey: response.data.manualKey
                });
            }
        }
        getQRCodeData();
        // eslint-disable-next-line
    }, []);


    async function cancelQRCode() {
        await protectedDeleteRequest(`/auth/2fa/cancel_hold/${userId}`);
        setWindowPopupState(null);
    };

    const onSubmit: SubmitHandler<TwoFactorAuthFormData> = async (data) => {
        if (currentPage === 'qrcode') {
            setCurrentPage('codecheck');
        } else if (currentPage === 'codecheck') {
            if (data.token) {
                const response = await protectedPostRequest('/auth/2fa/enable', data);
                if (response.error) {
                    setHelperMessages({
                        token: { text: t('account.popups.add_two_factor_auth_app.qr_code.helper_texts.token.general'), danger: true }
                    });
                    return;
                } else {
                    setHelperMessages(undefined);
                    window.location.reload();
                }
            } else {
                setHelperMessages({
                    token: { text: t('account.popups.add_two_factor_auth_app.qr_code.helper_texts.token.general'), danger: true }
                });
                return;
            }
        }
    };

    return (
            <WindowPopup 
                width={400}
                header={t('account.popups.add_two_factor_auth_app.header')}
                content={
                    <div className='flex column'>
                        { currentPage === 'qrcode' ? (
                            <>
                                <span className='field-head'>{t('account.popups.add_two_factor_auth_app.qr_code.qrcode_header')}</span>
                                { qrCodeData && (
                                    <img src={qrCodeData.qrCode} alt="qr-code" draggable={'false'} />
                                ) }
                                <span className='field-head margin-top-20'>{t('account.popups.add_two_factor_auth_app.qr_code.manual_key_header')}</span>
                                { qrCodeData && (
                                    <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{qrCodeData.manualKey.match(/.{1,4}/g)?.join(' ')}</span>
                                ) }
                            </>
                        ) : (
                            <InputField 
                                required
                                headText={t('account.popups.add_two_factor_auth_app.qr_code.fields.token.header')}
                                inputType='number'
                                inputName='token'
                                inputId='token'
                                className='margin-top-20'
                                register={register}
                                helperMessage={helperMessages?.token}
                            />
                        ) }
                    </div>
                }
                cancelButton
                cancelButtonOnClick={cancelQRCode}
                submitLoading={loading}
                { ...(currentPage === 'codecheck' && {
                    cancelButtonText: t('general_words.back', { ns: 'translation' }),
                    cancelButtonOnClick: () => {
                        setCurrentPage('qrcode');
                    }
                }) }
                submitButtonInnerElement={
                    currentPage === 'qrcode'
                        ? t('general_words.next', { ns: 'translation' })
                        : t('account.popups.add_two_factor_auth_app.qr_code.fields.token.submit_button')
                }
                onFormSubmit={handleSubmit(onSubmit)}
            />
    )
};