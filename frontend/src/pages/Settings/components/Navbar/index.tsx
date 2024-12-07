import styles from './SettingsNavbar.module.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type Props = {
    currentPage?: string;
}

export default function SettingsNavbar({
    currentPage
}: Props) {
    const navigate = useNavigate();
    const { t } = useTranslation('settings');

    return (
        <nav className={`${styles['navbar']} flex`}>
            <div 
                className={`${styles['tab']} ${currentPage === 'account' ? styles['selected'] : ''}`}
                onClick={() => navigate('/settings/account')}
            >
                <span>{t('general.pages.account')}</span>
            </div>
            <div 
                className={`${styles['tab']} ${currentPage === 'profile' ? styles['selected'] : ''}`}
                onClick={() => navigate('/settings/profile')}
            >
                <span>{t('general.pages.profile')}</span>
            </div>
        </nav>
    )
};