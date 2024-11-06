import React, { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { loginUser } from '../../utils/api';
import { useAuth } from '../../context/AuthProvider';

const Auth: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { refreshUser } = useAuth();

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    useEffect(() => {
        if (accessToken && refreshToken) {
            loginUser({ accessToken, refreshToken });
            refreshUser();
        }
    }, [accessToken, refreshToken, refreshUser]);

    if (!accessToken && !refreshToken) {
        return <Navigate to="/login" replace />;
    }

    return null;
};

export default Auth;
