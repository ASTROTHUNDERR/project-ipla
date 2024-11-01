import React, { createContext, useContext, useState, useEffect } from 'react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

type LanguageContextType = {
    language: string;
    changeLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode })  => {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language);

    useEffect(() => {
        setLanguage(i18n.language)
    }, [i18next.language])

    const changeLanguage = (lang: string) => {
        i18next.changeLanguage(lang);
        setLanguage(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useHomeContext must be used within an AdminProvider');
    }
    return context;
};