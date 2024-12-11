import styles from './RightSide.module.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProfile } from '../../../../context/ProfileProvider';

import { Tab } from '../../types';

import ProfileRightSideFollowers from './components/Followers';

export default function ProfileRightSide() {
    const { t } = useTranslation('profile');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { username } = useProfile();
    const tab = searchParams.get('tab');

    const [tabIsValid, setTabIsValid] = useState(false);

    useEffect(() => {
        if (tab && !isValidTab(tab)) {
            navigate(`/profile/${username}`, { replace: true });
        } else {
            setTabIsValid(true);
        }
    }, [tab, navigate, username]);

    const isValidTab = (value: string | null): value is Tab => {
        return value === 'followers' || value === 'followings';
    };

    return (
        <div className={styles['wrapper']}>
            <header className={`${styles['header']} flex`}>
                {/* <div
                    className={`${styles['header-tab']} ${!tab ? styles['active'] : ''}`}
                    onClick={() => navigate(`/profile/${username}`)}
                >
                    {t(`general.tabs.transfers`) }
                </div> */}
                { tab && tabIsValid && (
                    <div className={`${styles['header-tab']} ${styles['active']}`}>
                        {t(`general.tabs.${tab}`) }
                    </div>
                ) }
            </header>
            { tab && tabIsValid && username && (
                <ProfileRightSideFollowers
                    username={username}
                    part={tab as 'followers' | 'followings'}
                />
            ) }
        </div>  
    )
};