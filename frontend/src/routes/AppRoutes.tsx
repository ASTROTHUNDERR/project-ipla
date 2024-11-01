import { Route, Routes } from 'react-router-dom';
import { useLanguage } from '../context/LanguageProvider';

import Login from '../pages/Auth/Login';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
    const { language } = useLanguage();
    const prefix = language === 'ka' ? '/ka' : '';

    return (
        <Routes>
            <Route path={`${prefix}/login`} element={<Login />} />

            <Route path='*' element={<NotFoundPage />} />
        </Routes>
    );
};