import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../../context/ApiProvider';
import { useGeneral } from '../../../../../context/GeneralProvider';

import { SAWindowPopupState } from '../../../types';

import WindowPopup from '../../../../../components/WindowPopup';
import TwoFactorAuthPopup from '../../../../../components/2FAPopup';
import { SubmitHandler } from 'react-hook-form';

type Props = {
    userId: number;
    setWindowPopupState: React.Dispatch<React.SetStateAction<SAWindowPopupState | null>>;
}

export default function SetttingsAccountRemove2FAPopup({ userId, setWindowPopupState }: Props) {
    const { t } = useTranslation('settings');
    const { loading, protectedPostRequest } = useApi();
    const { setInfoData } = useGeneral();

    const [display2FAPopup, setDisplay2FAPopup] = useState(false);
    

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setDisplay2FAPopup(true);
    };

    const on2FASubmit: SubmitHandler<{ token: string }> = async (data) => {
        const response = await protectedPostRequest('/auth/2fa/disable', data);
        if (response.error) {
            setInfoData({
                content: 'Failed to disable 2FA, try again or contact support.',
                danger: true
            });
            return;
        } else {
            window.location.reload();
        }
    };

    return (
            <>
                { display2FAPopup ? (
                    <TwoFactorAuthPopup 
                        headerText={t('login.2fa.header', { ns: 'auth' })}
                        inputFieldHeader={t('login.2fa.field.header', { ns: 'auth' })}
                        inputFieldPlaceholder={t('login.2fa.field.placeholder', { ns: 'auth' })}
                        cancelButtonText={t('general_words.cancel', { ns: 'translation' })}
                        onCancel={() => setWindowPopupState(null)}
                        submitButtonText={t('general_words.submit', { ns: 'translation' })}
                        submitButtonIsLoading={loading}
                        onSubmit={on2FASubmit}
                    />
                ) : (
                    <WindowPopup 
                        width={400}
                        header={t('account.popups.remove_two_factor_auth_app.header')}
                        content={t('account.popups.remove_two_factor_auth_app.description')}
                        cancelButton
                        cancelButtonText={
                            t('general_words.cancel', { ns: 'translation' })
                        }
                        cancelButtonOnClick={() => setWindowPopupState(null)}
                        submitLoading={loading}
                        submitButtonInnerElement={
                            t('general_words.submit', { ns: 'translation' })
                        }
                        dangerSubmitButton
                        onFormSubmit={onSubmit}
                    />
                ) }
            </>
    )
};