import styles from './UnauthorizedNavbar.module.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ChevronDownIcon } from '../../../assets/icons/chevron-down.svg';

import Button from '../../Button';

interface Language {
    code: string;
    name: string;
}

export default function UnauthorizedNavbar() {
    const { t, i18n } = useTranslation();
    const [languagePickerState, setLanguagePickerState] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);

    const languageNames: Language[] = t('footers.auth.languages', { returnObjects: true }) as Language[];
    const currentLanguageName = languageNames.find(lang => lang.code === currentLanguage)?.name || currentLanguage;
    const filteredLanguages = languageNames.filter(lang => lang.code !== currentLanguage);

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

    return (
        <nav className='navbar-secondary flex space-between'>
            <a href='/' className='flex items-center'>
                <span className={styles['head-text']}>Project IPLA</span>
            </a>
            <div className='relative'>
                <Button 
                    innerElement={
                        <span className='flex items-center'>
                            <span className='margin-right-20'>{currentLanguageName}</span>
                            <ChevronDownIcon width={16} height={16} className={`margin-left-15 ${styles['lng-chevron']}`} />
                        </span>
                    }
                    className={`${styles['language-button']}`}
                    onClick={() => setLanguagePickerState(!languagePickerState)}
                />
                {languagePickerState && (
                    <div className={`${styles['lng-list']} margin-top-5`}>
                        {filteredLanguages.map((lang) => (
                            <Button 
                                key={lang.code}
                                innerElement={lang.name}
                                className={`${styles['lng']} flex`}
                                onClick={() => handleLanguageChange(lang.code)}
                            /> 
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
};