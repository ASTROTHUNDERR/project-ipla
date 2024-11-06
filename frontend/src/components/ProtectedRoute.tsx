import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

interface ProtectedRouteProps {
    roles?: { name: string }[];
    unprotected?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, unprotected }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated && !unprotected) {
        return <Navigate to="/login" replace />;
    }

    if (unprotected && isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (roles && user) {
        const hasAllRoles = roles.every(role => user.roles.includes({ name: role.name }));

        if (!hasAllRoles) {
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;