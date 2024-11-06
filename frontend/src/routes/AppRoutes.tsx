import { Route, Routes } from 'react-router-dom';
import { useLanguageContext } from '../context/LanguageProvider';
import ProtectedRoute from '../components/ProtectedRoute';

import NotFoundPage from '../pages/NotFoundPage';
import Auth from '../pages/Auth';
import Login from '../pages/Auth/Login';
import Registration from '../pages/Auth/Registration';
import FinishRegistration from '../pages/Auth/FinishRegistration';
import PasswordReset from '../pages/Auth/PasswordReset';
import ResetPassword from '../pages/Auth/ResetPassword';

import Home from '../pages/Home';

export default function AppRoutes() {
    const { language } = useLanguageContext();
    const prefix = language === 'ka' ? '/ka' : '';

    return (
        <Routes>
            <Route element={<ProtectedRoute unprotected />}>
                <Route path={`/auth`} element={<Auth />} />
                <Route path={`${prefix}/login`} element={<Login />} />
                <Route path={`${prefix}/register`} element={<Registration />} />
                <Route path={`${prefix}/finish-registration`} element={<FinishRegistration />} />
                <Route path={`${prefix}/password-reset`} element={<PasswordReset />} />
                <Route path={`${prefix}/reset-password`} element={<ResetPassword />} />
            </Route>
            
            <Route element={<ProtectedRoute />}>
                <Route path={`${prefix}`} element={<Home />} />
            </Route>

            <Route path='/notfound' element={<NotFoundPage />} />
            <Route path='*' element={<NotFoundPage />} />
        </Routes>
    );
};