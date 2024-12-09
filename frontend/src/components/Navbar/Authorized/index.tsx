import styles from './AuthorizedNavbar.module.css';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthProvider';

import { BASE_URL } from '../../../utils/api';
import { UserProfile } from '../../../utils/types';
import { getUserProfileData } from '../../../utils/api';

import Button from '../../Button';
import DefaultAvatar from '../../../assets/defaults/Avatar';
import OptionsPopup from './components/OptionsPopup';
import LanguagePopup from './components/LanguagePopup';

export default function AuthorizedNavbar() {
    const { user } = useAuth();

    const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);

    const [optionsState, setOptionsState] = useState(false);
    const optionsButtonRef = useRef<HTMLButtonElement | null>(null);
    const optionsPopupRef = useRef<HTMLDivElement | null>(null);

    const [languagePopupState, setLanguagePopupState] = useState(false);

    useEffect(() => {
        async function fetchUserProfileData() {
            if (user) {
                const response = await getUserProfileData(user.id);

                if (response.error) {
                    window.location.href = '/';
                } else {
                    setUserProfileData(response.data);
                }
            }
        }
        fetchUserProfileData();
    }, [user]);

    useEffect(() => {
        function documentClick(event: Event) {
            if (
                optionsPopupRef.current && !optionsPopupRef.current.contains(event.target as Node)
                && optionsButtonRef.current && !optionsButtonRef.current.contains(event.target as Node)
            ) {
                setOptionsState(false);
            }
        }

        document.addEventListener('mousedown', documentClick);

        return () => {
            document.removeEventListener('mousedown', documentClick);
        }
    }, []);

    return (
        <nav className={`${styles['navbar']} flex space-between`}>
            <a href='/' className='flex items-center'>
                <span className={styles['head-text']}>Project IPLA</span>
            </a>
            <div className='flex row relative'>
                { languagePopupState && !optionsState && (
                    <LanguagePopup 
                        setSidebarOptionsState={setOptionsState}
                        setLanguagePopupState={setLanguagePopupState}
                    />
                ) }
                { optionsState && (
                    <OptionsPopup 
                        Ref={optionsPopupRef}
                        avatarUrl={
                            userProfileData?.avatar_path 
                                ? `${BASE_URL}${userProfileData.avatar_path}`
                                : undefined
                        }
                        setState={setOptionsState}
                        setLanguagePopupState={setLanguagePopupState}
                    />
                ) }
                <Button 
                    Ref={optionsButtonRef}
                    innerElement={
                        <span className={`${styles['user-avatar-wrapper']} flex content-center items-center`}>
                            { userProfileData?.avatar_path ? (
                                <div
                                    className='full-size'
                                    style={{
                                        backgroundImage: `url(${BASE_URL}${userProfileData.avatar_path})`,
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover'
                                    }}
                                ></div>
                            ) : (
                                <DefaultAvatar 
                                    username={user?.username}
                                />
                            ) }
                        </span>
                    }
                    className={`${styles['options-button']}`}
                    onClick={() => setOptionsState(!optionsState)}
                />
            </div>
        </nav>
    )
};