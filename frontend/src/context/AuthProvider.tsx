import React, { createContext, useContext, useState, useEffect, useCallback  } from 'react';
import { getUserData, logoutUser } from '../utils/api';
import { User } from '../utils/types';

interface AuthContextType {
    user: User | null;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        logoutUser();
        setUser(null);
    }, []);

    const fetchUser = useCallback(async () => {
        const userData = await getUserData();
        if (userData) {
            setUser(userData);
        } else {
            logout();
        }
        setIsLoading(false);
    }, [logout]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const refreshUser = () => {
        setIsLoading(true);
        fetchUser();
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, logout, isAuthenticated, isLoading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};