import styles from './BannerComp.module.css';
import { useTranslation } from 'react-i18next';

import SettingsField from '../../../../components/Field';
import Button from '../../../../../../components/Button';
import DefaultBanner from '../../../../../../assets/defaults/Banner';

const bannerCSS: React.CSSProperties = {
    width: '100%',
    height: 150,
    borderRadius: 6
};

export default function SettingsProfileBannerComp() {
    const { t } = useTranslation('settings');

    return (
        <SettingsField
            headerText={t('profile.banner.header')}
            content={
                <div className='flex column'>
                    <div 
                        className={styles['banner-wrapper']}
                        style={{
                            ...bannerCSS,
                        }}
                    >
                        <DefaultBanner 
                            width={'100%'}
                            height={'100%'}
                            iconWidth={24}
                            iconHeight={24}
                            borderRadius={6}
                        />
                    </div>
                    <div className={`${styles['buttons-wrapper']} flex items-center content-center margin-top-20`}>
                        <Button 
                            innerElement={t('profile.banner.remove_button')}
                            className='settings-field-button'
                        />
                        <Button 
                            innerElement={t('profile.banner.upload_button')}
                            className='settings-field-button primary'
                        />
                    </div>
                </div>
            }
        />
    )
};