import styles from './AvatarComp.module.css';
import { useTranslation } from 'react-i18next';

import SettingsField from '../../../../components/Field';
import Button from '../../../../../../components/Button';
import DefaultAvatar from '../../../../../../assets/defaults/Avatar';

const avatarCSS: React.CSSProperties = {
    width: 100,
    height: 100,
    borderRadius: '100%'
}

type Props = {
    username?: string;
}

export default function SettingsProfileAvatarComp({ username }: Props) {
    const { t } = useTranslation('settings');

    return (
        <SettingsField 
            headerText={t('profile.avatar.header')}
            additionalClassname={styles['avatar-field']}
            content={
                <div className='flex column'>
                    <div className='flex items-center content-center'>
                        <div style={avatarCSS}>
                            <DefaultAvatar  
                                width={100} 
                                height={100}
                                username={username}
                            />
                        </div>
                    </div>
                    <div className={`${styles['buttons-wrapper']} flex items-center content-center margin-top-20`}>
                        <Button 
                            innerElement={t('profile.avatar.remove_button')}
                            className='settings-field-button'
                        />
                        <Button 
                            innerElement={t('profile.avatar.upload_button')}
                            className='settings-field-button primary'
                        />
                    </div>
                </div>
            }
        />
    )
};