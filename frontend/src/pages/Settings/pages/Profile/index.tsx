import styles from './Profile.module.css';
import { useState, useEffect, useRef } from 'react';
import { useApi } from '../../../../context/ApiProvider';
import { useAuth } from '../../../../context/AuthProvider';

import { UserProfile } from '../../../../utils/types';

import SettingsProfileBannerComp from './components/BannerComp';
import SettingsProfileAvatarComp from './components/AvatarComp';
import SettingsProfileAboutComp from './components/AboutComp';
import SettingsProfileSocialsComp from './components/SocialsComp';

export default function SettingsProfile() {
    const { protectedGetRequest } = useApi();
    const { user } = useAuth();

    const userProfileFetched = useRef(false);
    const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);

    useEffect(() => {
        async function getUserProfileData() {
            if (user && !userProfileFetched.current) {
                const response = await protectedGetRequest(`/user-profile/${user.id}`);
                userProfileFetched.current = true;
                if (response.error) {
                    window.location.href = '/';
                } else {
                    setUserProfileData(response.data);
                }
            }
        }
        getUserProfileData();
        // eslint-disable-next-line
    }, []);

    return (
        <div>
            { userProfileData && (
                <>
                    <SettingsProfileBannerComp />
                    <div className={`${styles['small-column']} flex space-between margin-top-30`}>
                        <SettingsProfileAvatarComp
                            username={user?.username}
                        />
                        <SettingsProfileAboutComp />
                    </div>
                    <SettingsProfileSocialsComp
                        socials={userProfileData.socials}
                    />
                </>
            ) }
        </div>
    )
};