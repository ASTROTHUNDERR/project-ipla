import styles from './Account.module.css';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/AuthProvider';
// import { useGeneral } from '../../../../context/GeneralProvider';

import { SAWindowPopupState } from '../../types';

import SAProfileCard from './components/ProfileCard';
import SAInfoCard from './components/InfoCard';
import SettingsField from '../../components/Field';

import SetttingsAccountPasswordChangePopup from './components/APCPopup';
import SetttingsAccountUsernameChangePopup from './components/AUCPopup';
import SetttingsAccount2FAPopup from './components/ATFAPopup';
import SetttingsAccountRemove2FAPopup from './components/RTFAPopup';
import SettingsAccountDeletionPopup from './components/ADPopup';
import SettingsAccountEmailChangePopup from './components/AECPopup';

export default function SettingsAccount() {
    const { t } = useTranslation(['settings', 'auth']);
    const { user } = useAuth();
    // const { setInfoData } = useGeneral();

    const [windowPopupState, setWindowPopupState] = useState<SAWindowPopupState | null>(null);


    return (
        <div>
            { windowPopupState === 'change_password' ? (
                <SetttingsAccountPasswordChangePopup
                    setWindowPopupState={setWindowPopupState}
                />
            ) : windowPopupState === 'username_change' ?  (
                <SetttingsAccountUsernameChangePopup 
                    setWindowPopupState={setWindowPopupState}
                />
            ) : windowPopupState === 'add_auth_app' && user ? (
                <SetttingsAccount2FAPopup 
                    userId={user.id}
                    setWindowPopupState={setWindowPopupState}
                />
            ) : windowPopupState === 'remove_auth_app' && user ? (
                <SetttingsAccountRemove2FAPopup
                    userId={user.id}
                    setWindowPopupState={setWindowPopupState}
                />
            ) : windowPopupState === 'delete_account' && user ? (
                <SettingsAccountDeletionPopup 
                    userId={user.id}
                    setWindowPopupState={setWindowPopupState}
                />
            ) : windowPopupState === 'email_change' && user && (
                <SettingsAccountEmailChangePopup 
                    userId={user.id}
                    userEmail={user.email}
                    setWindowPopupState={setWindowPopupState}
                />
            ) }
            { user && (
                <>
                    <div className={`${styles['upper-wrapper']} flex space-between`}>
                        <SAProfileCard 
                            userData={user}
                        />
                        <div className={`${styles['upper-right-wrapper']} flex column space-between`}>
                            <SAInfoCard 
                                part='username'
                                setWindowPopupState={setWindowPopupState}
                                header={t('account.extra_cards.username')}
                                content={user.username}
                            />
                            <SAInfoCard 
                                part='email'
                                setWindowPopupState={setWindowPopupState}
                                header={t('account.extra_cards.email')}
                                userProvider={user.authProvider?.provider}
                                content={user.email}
                            />
                        </div>
                    </div>
                    { !user.authProvider && (
                        <SettingsField
                            additionalClassname='margin-top-30'
                            headerText={t('account.fields.password.header')}
                            buttonText={t('account.fields.password.button_text')}
                            onButtonClick={() => setWindowPopupState('change_password')}
                        />
                    ) }
                    <SettingsField
                        additionalClassname='margin-top-30'
                        headerText={t('account.fields.authenticator_app.header')}
                        content={t('account.fields.authenticator_app.description')}
                        buttonText={t('account.fields.authenticator_app.submit_button_text')}
                        onButtonClick={() => setWindowPopupState('add_auth_app')}
                        { ...(user.tfa_enabled && { 
                            secondaryDanger: true,
                            buttonText: t('account.fields.authenticator_app.remove_button_text'),
                            onButtonClick: () => setWindowPopupState('remove_auth_app')
                        }) }
                    />
                    <SettingsField
                        danger
                        additionalClassname='margin-top-30'
                        headerText={t('account.fields.account_deletion.header')}
                        content={t('account.fields.account_deletion.description')}
                        buttonText={t('account.fields.account_deletion.button_text')}
                        onButtonClick={() => setWindowPopupState('delete_account')}
                    />
                </>
            ) }
        </div>
    )
};