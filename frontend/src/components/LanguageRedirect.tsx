import { useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageProvider';

interface LanguageRedirectProps {
    children: ReactNode;
}

const LanguageRedirect: React.FC<LanguageRedirectProps> = ({ children }) => {
    const { i18n } = useTranslation();
    const { language } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const prefix = language === 'ka' ? '/ka' : '';

    useEffect(() => {
        const currentPrefix = location.pathname.startsWith('/ka') ? '/ka' : '';
        if (currentPrefix !== prefix) {
            const pathWithoutPrefix = location.pathname.replace(/^\/ka/, '');
            const newPath = `${prefix}${pathWithoutPrefix}`;
            navigate(newPath);
        }
    }, [language, location.pathname, navigate]);

    return <>{children}</>;
};

export default LanguageRedirect;