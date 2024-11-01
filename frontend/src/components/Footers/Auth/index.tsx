import styles from './AuthFooter.module.css';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ChevronDownIcon } from '../../../assets/icons/chevron-down.svg';

import Button from '../../Button';

interface Language {
    code: string;
    name: string;
}

export default function AuthFooter() {
    const { t, i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
    const [languagePickerState, setLanguagePickerState] = useState(false);

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') || 'en';
        setCurrentLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage); 
    }, [i18n]);

    const handleLanguageChange = (lang: string) => {
        setCurrentLanguage(lang);
        localStorage.setItem('language', lang);
        i18n.changeLanguage(lang);
    };

    const languageNames: Language[] = t('auth-footer.languages', { returnObjects: true }) as Language[];
    const currentLanguageName = languageNames.find(lang => lang.code === currentLanguage)?.name || currentLanguage;
    const filteredLanguages = languageNames.filter(lang => lang.code !== currentLanguage);

    return (
        <div className={`${styles['auth-footer']} flex row content-center relative`}>
            <span className='margin-right-25'>Project © 2024</span>
            <div>
                {languagePickerState && (
                    <div className={`${styles['language-list']} flex column absolute`}>
                        {filteredLanguages.map((lang) => (
                            <Button 
                                key={lang.code}
                                innerElement={lang.name}
                                className={`${styles['language-list-lng']} flex`}
                                onClick={() => handleLanguageChange(lang.code)}
                            /> 
                        ))}
                    </div>
                )}
                <Button 
                    innerElement={
                        <span>
                            <span>{currentLanguageName}</span>
                            <ChevronDownIcon width={12} height={12} className='margin-left-15' />
                        </span>
                    }
                    className={`${styles['language-button']}`}
                    onClick={() => setLanguagePickerState(!languagePickerState)}
                />
            </div>
        </div>
    )
};