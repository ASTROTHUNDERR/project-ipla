import styles from './Followers.module.css';
import parentStyles from '../../RightSide.module.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../../../context/AuthProvider';
import { useApi } from '../../../../../../context/ApiProvider';

import { FollowersData } from '../../../../types';
import { BASE_URL } from '../../../../../../utils/api';

import DefaultAvatar from '../../../../../../assets/defaults/Avatar';
import Button from '../../../../../../components/Button';

type Props = {
    username: string;
    part: 'followers' | 'followings';
}

export default function ProfileRightSideFollowers({ username, part }: Props) {
    const { t } = useTranslation('profile');
    const { user } = useAuth();
    const { protectedPostRequest } = useApi();

    // eslint-disable-next-line
    const [dataAmount, setDataAmount] = useState(1);
    const [followerUsersData, setFollowerUsersData] = useState<FollowersData[] | null>(null);

    const fetchFollowersData = async () => {
        const response = await protectedPostRequest('/user-profile/get-followers-data', { 
            userProfileUsername: username,
            part: part,
            start: dataAmount,
            limit: 10
        });
        if (!response.error) {
            setFollowerUsersData(response.data);
        }   
    };
    
    useEffect(() => {
        fetchFollowersData();
        // eslint-disable-next-line
    }, [part]);

    const handleFollowButton = async (currentUserFollows: boolean, secondUserUsername: string) => {
        let method: string;

        if (currentUserFollows) {
            method = 'unfollow';
        } else {
            method = 'follow';
        }

        return await protectedPostRequest('/user-profile/follow-user', {
            second_person_username: secondUserUsername,
            method: method
        });
    };

    return (
        <div className={`${parentStyles['content-list-wrapper']} flex column`}>
            { followerUsersData && followerUsersData.map((follower, index) => (
                <div
                    key={index}
                    className={`${parentStyles['content-item-wrapper']} flex space-between`}
                >
                    <div className='flex'>
                        <a href={`/profile/${follower.username}`} className={styles['follower-avatar-wrapper']}
                            style={
                                follower.avatar_path ? {
                                    backgroundImage: `url(${BASE_URL}${follower.avatar_path})`
                                } : {}
                            }
                        >
                            { !follower.avatar_path && (
                                <DefaultAvatar 
                                    username={follower.username}
                                />
                            ) }
                        </a>
                        <div className={`${styles['username-wrapper']} margin-left-10`}>
                            <a href={`/profile/${follower.username}`} className={styles['username']}>{follower.username}</a>
                        </div>
                    </div>
                    { user?.username !== follower.username && (
                        <Button 
                            innerElement={
                                follower.current_user_follows
                                    ? t('general.head.follow_button.unfollow')
                                    : t('general.head.follow_button.follow')
                            }
                            className={styles['follow-button']}
                            onClick={() => {
                                handleFollowButton(follower.current_user_follows, follower.username);
                                setFollowerUsersData((prevData) => {
                                    if (!prevData) return [];
                                
                                    return prevData.map((fl) => 
                                        fl.username === follower.username
                                            ? { ...fl, current_user_follows: !follower.current_user_follows }
                                            : fl
                                    );
                                });
                            }}
                        />
                    ) }
                </div>
            )) }
        </div>
    )
};