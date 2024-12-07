import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../../context/ApiProvider';
import { useGeneral } from '../../../../../context/GeneralProvider';

import { SAWindowPopupState } from '../../../types';

import WindowPopup from '../../../../../components/WindowPopup';

type Props = {
    userId: number;
    setWindowPopupState: React.Dispatch<React.SetStateAction<SAWindowPopupState | null>>;
}

export default function SetttingsAccountRemove2FAPopup({ userId, setWindowPopupState }: Props) {
    const { t } = useTranslation('settings');
    const { loading, protectedDeleteRequest } = useApi();
    const { setInfoData } = useGeneral();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
       
        const response = await protectedDeleteRequest(`/auth/2fa/disable/${userId}`);
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
    )
};