import styles from './ProfileHead.module.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGeneral } from '../../../../context/GeneralProvider';
import { useApi } from '../../../../context/ApiProvider';
import { useProfile } from '../../../../context/ProfileProvider';

import { formatReadableDate } from '../../../../utils/functions';
import { Followers } from '../../types';

import { ReactComponent as ShareIcon } from '../../../../assets/icons/share.svg';
import { ReactComponent as UsersIcon } from '../../../../assets/icons/users.svg';

import DefaultBanner from '../../../../assets/defaults/Banner';
import DefaultAvatar from '../../../../assets/defaults/Avatar';

import Button from '../../../../components/Button';

type Props = {
    bannerUrl?: string;
    avatarUrl?: string;
    followers: number;
    followings: number;
    createdAt: string;
    displayFollowButton: boolean;
    currentUserFollows: boolean;
    setFollowersData: React.Dispatch<React.SetStateAction<Followers | null>>
}

export default function ProfileHead({
    bannerUrl, 
    avatarUrl,
    followers, 
    followings,
    createdAt,
    displayFollowButton,
    currentUserFollows,
    setFollowersData
}: Props) {
    const navigate = useNavigate();
    const { t } = useTranslation('profile');
    const { setInfoData } = useGeneral();
    const { protectedPostRequest } = useApi();
    const { userProfileData } = useProfile();

    const handleCopyProfileLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setInfoData({
                content: t('general.helper_texts.profile_link_copied')
            });
        } catch (error){
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            textArea.style.pointerEvents = "none";
            textArea.style.height = "0";
            document.body.appendChild(textArea);
        
            textArea.select();
            textArea.setSelectionRange(0, textArea.value.length);
        
            try {
                const successful = document.execCommand("copy");
                document.body.removeChild(textArea);
        
                if (successful) {
                    setInfoData({
                        content: t('general.helper_texts.profile_link_copied')
                    });
                } else {
                    setInfoData({
                        content: 'Failed to copy the URL',
                        danger: true
                    });
                }
            } catch (err) {
                console.error('Copy failed:', err);
                document.body.removeChild(textArea);
                setInfoData({
                    content: 'Failed to copy the URL',
                    danger: true
                });
            }
        }
    };
    
    const handleFollowButton = async () => {
        let method: string;

        if (currentUserFollows) {
            method = 'unfollow';
        } else {
            method = 'follow';
        }

        const response = await protectedPostRequest('/user-profile/follow-user', {
            second_person_username: userProfileData?.username,
            method: method
        });
        setFollowersData(response.data)
    };

    return (
        <div className='relative'>
            <div className={`${styles['banner-wrapper']} relative`}
                style={
                    bannerUrl ? {
                        backgroundImage: `url(${bannerUrl})`,
                    } : {}
                }
            >
                <div className={styles['hidden-userinfo']}>
                    <div className={`${styles['avatar-wrapper']} ${userProfileData?.type === 'team_owner' ? styles['team-owner'] : styles[userProfileData?.type || '']}`}
                        style={
                            avatarUrl ? {
                                backgroundImage: `url(${avatarUrl})`
                            } : {}
                        }
                    >
                        { !avatarUrl && (
                            <DefaultAvatar />
                        ) }
                    </div>
                    <div className={styles['hidden-userinfo-username-wrapper']}>
                        <h2 className={`${styles['username']} text-center`}>{userProfileData?.username}</h2>
                    </div>
                </div>
                { !bannerUrl && (
                    <DefaultBanner 
                        width={'100%'}
                        height={'100%'}
                        iconWidth={24}
                        iconHeight={24}
                        borderRadius={'6px 6px 0 0'}
                        additionalProperties={{
                            top: 0,
                            boxShadow: 'inset 0 -50px 50px -25px #161313',
                            position: 'absolute',
                            zIndex: 0
                        }}
                    />
                ) }
            </div>
            <div className={`${styles['bottom-wrapper']} flex space-between`}>
                <div className='flex'>
                    <div className={`${styles['hidden-info-wrapper']} column`}>
                        <div className='flex items-center'>
                            <Button 
                                innerElement={
                                    <span className='flex items-center'>
                                        <UsersIcon width={16} height={16} strokeWidth={1} stroke='inherit' />
                                        <span className='margin-left-5'>
                                            <span className={styles['number']}>{followers}</span>
                                            <span className={styles['text']}>{t('general.head.followers')}</span>
                                        </span>
                                    </span>
                                }
                                className={`${styles['followers-button']}`}
                                onClick={() => navigate('?tab=followers')}
                            />
                            <span style={{
                                fontSize: 14,
                                color: 'var(--secondary-100)',
                                marginLeft: 5,
                                marginRight: 5,
                                userSelect: 'none'
                            }}>·</span>
                            <Button 
                                innerElement={
                                    <span>
                                        <span className={styles['number']}>{followings}</span>
                                        <span className={styles['text']}>{t('general.head.followings')}</span>
                                    </span>
                                }
                                className={`${styles['followers-button']}`}
                                onClick={() => navigate('?tab=followings')}
                            />
                        </div>
                        <div className='flex' style={{ fontSize: 14 }}>
                            <span style={{ color: 'var(--secondary-200)' }}>{t('general.head.member_since')}</span>
                            <span style={{ marginLeft: 3, color: 'var(--secondary-50)' }}>{formatReadableDate(createdAt, 'short')}</span>
                        </div>
                    </div>
                    <div className={`${styles['userinfo-wide']} flex relative`}>
                        <div style={{ width: 110 }}></div>
                        <div className={`${styles['avatar-wrapper']} absolute ${userProfileData?.type === 'team_owner' ? styles['team-owner'] : styles[userProfileData?.type || '']}`}
                            style={
                                avatarUrl ? {
                                    backgroundImage: `url(${avatarUrl})`
                                } : {}
                            }
                        >
                            { !avatarUrl && (
                                <DefaultAvatar />
                            ) }
                        </div>
                        <div className='flex items-center margin-left-10'>
                            <h2 className={styles['username']}>{userProfileData?.username}</h2>
                        </div>
                    </div>
                </div>
                <div className='flex' style={{ alignItems: 'flex-end' }}>
                    <Button 
                        innerElement={
                            <ShareIcon width={18} height={18} stroke={'var(--secondary-50)'} />
                        }
                        className={`${styles['share-button']} flex items-center content-center`}
                        onClick={handleCopyProfileLink}
                    />
                    { displayFollowButton && (
                        <Button 
                            innerElement={
                                currentUserFollows
                                    ? t('general.head.follow_button.unfollow')
                                    : t('general.head.follow_button.follow')
                            }
                            className={`${styles['follow-button']} ${currentUserFollows ? styles['following'] : 'primary'} margin-left-10`}
                            onClick={handleFollowButton}
                        />
                    ) }
                </div>
            </div>
            { displayFollowButton && (
                <Button 
                    innerElement={
                        currentUserFollows
                            ? t('general.head.follow_button.unfollow')
                            : t('general.head.follow_button.follow')
                    }
                    className={`${styles['follow-button']} ${styles['hidden']} ${currentUserFollows ? styles['following'] : 'primary'} margin-left-10`}
                    onClick={handleFollowButton}
                />
            ) }
            <div className={styles['info-wrapper']}>
                <div className='flex items-center'>
                    <Button 
                        innerElement={
                            <span className='flex items-center'>
                                <UsersIcon width={16} height={16} strokeWidth={1} stroke='inherit' />
                                <span className='margin-left-5'>
                                    <span className={styles['number']}>{followers}</span>
                                    <span className={styles['text']}>{t('general.head.followers')}</span>
                                </span>
                            </span>
                        }
                        className={`${styles['followers-button']}`}
                        onClick={() => navigate('?tab=followers')}
                    />
                    <span style={{
                        fontSize: 14,
                        color: 'var(--secondary-100)',
                        marginLeft: 5,
                        marginRight: 5,
                        userSelect: 'none'
                    }}>·</span>
                     <Button 
                        innerElement={
                            <span>
                                <span className={styles['number']}>{followings}</span>
                                <span className={styles['text']}>{t('general.head.followings')}</span>
                            </span>
                        }
                        className={`${styles['followers-button']}`}
                        onClick={() => navigate('?tab=followings')}
                    />
                </div>
                <div className='flex' style={{ fontSize: 14 }}>
                    <span style={{ color: 'var(--secondary-200)' }}>{t('general.head.member_since')}</span>
                    <span style={{ marginLeft: 3, color: 'var(--secondary-50)' }}>{formatReadableDate(createdAt, 'short')}</span>
                </div>
            </div>
        </div>
    )
}