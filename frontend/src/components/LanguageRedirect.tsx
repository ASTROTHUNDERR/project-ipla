import { useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguageContext } from '../context/LanguageProvider';

interface LanguageRedirectProps {
    children: ReactNode;
}

const LanguageRedirect: React.FC<LanguageRedirectProps> = ({ children }) => {
    const { language } = useLanguageContext();
    const location = useLocation();
    const navigate = useNavigate();
    const prefix = language === 'ka' ? '/ka' : '';

    useEffect(() => {
        const currentPrefix = location.pathname.startsWith('/ka') ? '/ka' : '';
        if (currentPrefix !== prefix) {
            const pathWithoutPrefix = location.pathname.replace(/^\/ka/, '');
            const newPath = `${prefix}${pathWithoutPrefix}${location.search}`;
            navigate(newPath);
        }
    }, [language, prefix, location.pathname, location.search, navigate]);

    return <>{children}</>;
};

export default LanguageRedirect;