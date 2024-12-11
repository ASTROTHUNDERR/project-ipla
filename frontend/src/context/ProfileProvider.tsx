import React, { createContext, useContext, useState, useEffect  } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from './AuthProvider';

import { UserProfile } from '../utils/types';
import { getUserProfileData } from '../utils/api';

import NotFoundPage from '../pages/NotFoundPage';

interface ProfileContextType {
    username: string | undefined;
    userProfileData: UserProfile | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
    const { username } = useParams();
    const { user } = useAuth();

    const [userNotFound, setUserNotFound] = useState(false);
    const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);

    useEffect(() => {
        async function fetchProfileData() {
            if (username) {
                const response = await getUserProfileData(username);
                if (response.error) {
                    setUserNotFound(true);
                } else {
                    setUserProfileData(response.data);
                }
            }
        }
        fetchProfileData();
    }, [username, user]);

    if (userNotFound) {
        return <NotFoundPage value='User' />
    }

    return (
        <ProfileContext.Provider value={{ 
            username,
            userProfileData,
        }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within an AuthProvider');
    }
    return context;
};