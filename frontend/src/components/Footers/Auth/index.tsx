import styles from './AuthFooter.module.css';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ChevronDownIcon } from '../../../assets/icons/chevron-down.svg';

import Button from '../../Button';

interface Language {
    code: string;
    name: string;
}

export default function AuthFooter() {
    const { t, i18n } = useTranslation();
    const [languagePickerState, setLanguagePickerState] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
    const languageButtonRef = useRef<HTMLButtonElement | null>(null);
    const languageSelectorRef = useRef<HTMLDivElement | null>(null);

    const languageNames: Language[] = t('footers.auth.languages', { returnObjects: true }) as Language[];
    const currentLanguageName = languageNames.find(lang => lang.code === currentLanguage)?.name || currentLanguage;
    const filteredLanguages = languageNames.filter(lang => lang.code !== currentLanguage);

    const handleLanguageChange = (lang: string) => {
        setCurrentLanguage(lang);
        localStorage.setItem('language', lang);
        i18n.changeLanguage(lang);
    };

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') || 'en';
        setCurrentLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage); 
    }, [i18n]);

    useEffect(() => {
        function rotateChevron() {
            if (languageButtonRef.current) {
                if (languagePickerState) {
                    languageButtonRef.current.classList.add(styles['rotate']);
                } else {
                    languageButtonRef.current.classList.remove(styles['rotate']);
                }
            }
        }
        rotateChevron();

        function onDocumentClick(event: Event) {
            if (
                languageSelectorRef.current && languageButtonRef.current 
                && !languageSelectorRef.current.contains(event.target as Node)
                && !languageButtonRef.current.contains(event.target as Node)
            ) {
                setLanguagePickerState(false);
            }
        };

        document.addEventListener('mousedown', onDocumentClick);

        return () => {
            document.removeEventListener('mousedown', onDocumentClick);
        }
    }, [languagePickerState])

    return (
        <div className={`${styles['auth-footer']} flex row content-center relative`}>
            <span className='margin-right-25 text-center'>Project © 2024</span>
            <div>
                {languagePickerState && (
                    <div ref={languageSelectorRef} className={`${styles['language-list']} flex column absolute`}>
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
                    Ref={languageButtonRef}
                    innerElement={
                        <span className='flex items-center'>
                            <span className=''>{currentLanguageName}</span>
                            <ChevronDownIcon width={12} height={12} className={`margin-left-15 ${styles['lng-chevron']}`} />
                        </span>
                    }
                    className={`${styles['language-button']}`}
                    onClick={() => setLanguagePickerState(!languagePickerState)}
                />
            </div>
        </div>
    )
};