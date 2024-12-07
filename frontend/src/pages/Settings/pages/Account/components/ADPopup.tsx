import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../../../context/ApiProvider';
import { useTranslation, Trans as Translate } from 'react-i18next';

import { SAWindowPopupState } from '../../../types';

import WindowPopup from '../../../../../components/WindowPopup';

type Props = {
    userId: number;
    setWindowPopupState: React.Dispatch<React.SetStateAction<SAWindowPopupState | null>>;
}

export default function SettingsAccountDeletionPopup({ userId, setWindowPopupState }: Props) {
    const { t } = useTranslation('settings');
    const { loading, protectedDeleteRequest } = useApi();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    

    const deleteAccount = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await protectedDeleteRequest(`/auth/users/${userId}`);
        navigate('/');
    };

    return (
        <>
            { currentStep === 1 ? (
                <WindowPopup 
                    width={400}
                    header={t('account.popups.account_deletion.header')}
                    content={
                        <span>
                            <Translate ns='settings' i18nKey={'account.popups.account_deletion.first_description'} values={{ support: t('account.popups.account_deletion.support') }}>
                                {/* eslint-disable-next-line */}
                                <a href="/support" className='link' />
                            </Translate>
                        </span>
                    }
                    cancelButton
                    cancelButtonText={
                        t('general_words.cancel', { ns: 'translation' })
                    }
                    cancelButtonOnClick={() => setWindowPopupState(null)}
                    // submitLoading={loading}
                    submitButtonInnerElement={
                        t('general_words.confirm', { ns: 'translation' })
                    }
                    dangerSubmitButton
                    onFormSubmit={(e) => {
                        e.preventDefault();
                        setCurrentStep(2);
                    }}
                />
            ) : (
                <WindowPopup 
                    width={400}
                    header={t('account.popups.account_deletion.header')}
                    content={t('account.popups.account_deletion.second_description')}
                    cancelButton
                    cancelButtonText={
                        t('general_words.cancel', { ns: 'translation' })
                    }
                    cancelButtonOnClick={() => setWindowPopupState(null)}
                    submitLoading={loading}
                    submitButtonInnerElement={
                        t('account.popups.account_deletion.submit_button_text')
                    }
                    dangerSubmitButton
                    onFormSubmit={deleteAccount}
                />
            ) }
        </>
    )
};