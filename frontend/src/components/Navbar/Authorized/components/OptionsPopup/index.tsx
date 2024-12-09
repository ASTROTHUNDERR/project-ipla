import styles from './OptionsPopup.module.css';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../../context/AuthProvider';
import { logoutUser } from '../../../../../utils/api';

import { ReactComponent as ChevronRightIcon } from '../../../../../assets/icons/chevron-right.svg';

import Button from '../../../../Button';

type Props = {
    Ref: React.MutableRefObject<HTMLDivElement | null>;
    avatarUrl?: string;
    setState: React.Dispatch<React.SetStateAction<boolean>>;
    setLanguagePopupState: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function OptionsPopup({
    Ref,
    avatarUrl,
    setState,
    setLanguagePopupState
}: Props) {
    const { t, i18n } = useTranslation('sidebar');
    const { user } = useAuth();

    return (
        <div ref={Ref} className={`${styles['options-popup']} absolute flex column`}>
            <a href={`/profile/${user?.username}`} className={`${styles['button']} flex items-center`}>
                { avatarUrl && (
                    <div style={{
                        width: 24, height: 24,
                        borderRadius: '100%',
                        backgroundImage: `url(${avatarUrl})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        marginRight: 8
                    }}></div>
                ) }
                {t('options.view_profile')}
            </a>
            <div className={styles['divider']}></div>
            <a href="/" className={`${styles['button']}`}>
                {t('options.your_teams')}
            </a>
            <a href="/" className={`${styles['button']}`}>
                {t('options.your_wallet')}
            </a>
            <div className={styles['divider']}></div>
            <a href="/settings/account" className={`${styles['button']}`}>
                {t('options.account_settings')}
            </a>
            <a href="/settings/profile" className={`${styles['button']}`}>
                {t('options.profile_settings')}
            </a>
            <a href="/settings/game" className={`${styles['button']}`}>
                {t('options.game_settings')}
            </a>
            <div className={styles['divider']}></div>
            <Button 
                innerElement={
                    <span className='flex items-center space-between' style={{ width: '100%' }}>
                        <span>
                            {t('options.language')}
                            <span className={`${styles['language']} margin-left-10`}>{i18n.language.toUpperCase()}</span>
                        </span>
                        <span className='flex items-center content-center'>
                            <ChevronRightIcon width={16} height={16} style={{ stroke: 'var(--secondary-100)' }} />
                        </span>
                    </span>
                }
                className={`${styles['button']} ${styles['btn']} flex`}
                onClick={() => {
                    setState(false);
                    setLanguagePopupState(true);
                }}
            />
            <div className={styles['divider']}></div>
            <a href="/support" className={`${styles['button']}`}>
                {t('options.support')}
            </a>
            <Button 
                innerElement={t('options.logout')}
                className={`${styles['button']}  ${styles['btn']} flex`}
                onClick={() => {
                    logoutUser();
                    window.location.href = '/login';
                }}
            />
        </div>
    )
};