import styles from './ProfileCard.module.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { User as UserType } from '../../../../../../utils/types';

import Button from '../../../../../../components/Button';
import DefaultBanner from '../../../../../../assets/defaults/Banner';
import DefaultAvatar from '../../../../../../assets/defaults/Avatar';

type Props = {
    userData: UserType;
}

export default function SAProfileCard({
    userData
}: Props) {
    const { t } = useTranslation('settings');
    const navigate = useNavigate();

    return (
        <div className={`${styles['wrapper']} settings-field relative`}>
            <div style={{ height: 110 }}>
                <div 
                    className={`${styles['banner']} absolute`}
                >
                    <DefaultBanner 
                        width={'100%'}
                        height={'100%'}
                        iconWidth={20}
                        iconHeight={20}
                        additionalProperties={{
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4
                        }}
                    />
                </div>
            </div>
            <div 
                className={`${styles['avatar']} absolute`}
            >
                <DefaultAvatar 
                    username={userData.username} 
                />
            </div>
            <div className={`${styles['content-wrapper']} flex space-between`}>
                <div className='flex'>
                    <div className={styles['empty-div']} style={{ width: 90 }}></div>
                    <div className={`${styles['username-wrapper']} flex column margin-left-10`}>
                        <span className='margin-left-5'>{userData.username}</span>
                        <span className={`${styles['full-name']} margin-left-5`}>{userData.first_name} {userData.last_name}</span>
                    </div>
                </div>
                <div className='flex relative items-center'>
                    <Button 
                        innerElement={t('account.profile_card.button_text')}
                        className={`${styles['button']} primary text-center`}
                        onClick={() => navigate('/settings/profile')}
                    />
                </div>
            </div>
        </div>
    )
}