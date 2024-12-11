import styles from './Profile.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { useApi } from '../../context/ApiProvider';
import { useGeneral } from '../../context/GeneralProvider';
import { useProfile } from '../../context/ProfileProvider';

import { BASE_URL } from '../../utils/api';
import { Followers } from './types';

import AuthorizedNavbar from '../../components/Navbar/Authorized';
import InfoPopup from '../../components/InfoPopup';
import ProfileHead from './components/Head';
import ProfileLeftSide from './components/LeftSide';
import ProfileRightSide from './components/RightSide';

export default function Profile() {
    const { user } = useAuth();
    const { protectedPostRequest } = useApi();
    const { infoData } = useGeneral();
    const { userProfileData } = useProfile();

    const [followers, setFollowers] = useState<Followers | null>(null);

    useEffect(() => {
        async function fetchFollowersData() {
            if (userProfileData) {
                const response = await protectedPostRequest('/user-profile/get-followers', {
                    username: userProfileData.username
                });
                if (!response.error) {
                    setFollowers(response.data);
                }
            }
        }
        fetchFollowersData();
        // eslint-disable-next-line
    }, [userProfileData])

    return (
        <>
            <AuthorizedNavbar />
            <div className='flex items-center content-center'>
                <main className='main-wrapper'>
                    { user && userProfileData && followers && (
                        <div>
                            <ProfileHead
                                bannerUrl={
                                    userProfileData.banner_path 
                                        ? `${BASE_URL}${userProfileData.banner_path}`
                                        : undefined
                                }
                                avatarUrl={
                                    userProfileData.avatar_path
                                    ? `${BASE_URL}${userProfileData.avatar_path}`
                                    : undefined
                                }
                                followers={followers.followers}
                                followings={followers.followings}
                                createdAt={user.created_at}
                                currentUserFollows={followers?.is_following ? followers.is_following : false}
                                setFollowersData={setFollowers}
                                displayFollowButton={
                                    !(user.username === userProfileData.username)
                                }
                            />
                            <div className={`${styles['content-wrapper']} flex`}>
                                <ProfileLeftSide
                                    profileUsername={userProfileData.username}
                                    aboutContent={userProfileData.about}
                                />
                                <ProfileRightSide />
                            </div>
                        </div>
                    ) }
                    { infoData && (
                        <InfoPopup />
                    ) }
                </main>
            </div>
        </>
    )  
};