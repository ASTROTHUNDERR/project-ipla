import styles from '../SocialsComp.module.css';
import { useTranslation } from 'react-i18next';

import Button from '../../../../../../../components/Button';

type Props = {
    icon: string;
    name: string;
    redirectUrl: string;
}

export default function ConnectableSocial({
    icon,
    name,
    redirectUrl
}: Props) {
    const { t } = useTranslation('settings');

    return (
        <div className={`${styles['connectable-social']} flex items-center space-between`}>
            <div className='flex items-center'>
                <span className='flex items-center' style={{ userSelect: 'none' }}>
                    <img 
                        src={icon} 
                        alt="social-icon" 
                        style={{ pointerEvents: 'none', height: 24 }}
                    />
                </span>
                <span style={{ marginLeft: 8 }}>{name}</span>
            </div>
            <Button 
                innerElement={t('profile.socials.connect_button')}
                className={`${styles['social-add-btn']} flex items-center content-center`}
                onClick={() =>  window.open(redirectUrl, 'authWindow', 'width=800, height=800')}
            />
        </div>
    )
};