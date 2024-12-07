import styles from './LanguagePopup.module.css';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ChevronLeftIcon } from '../../../../../assets/icons/chevron-left.svg';
import { ReactComponent as CheckIcon } from '../../../../../assets/icons/check.svg';

import Button from '../../../../Button';

interface Language {
    code: string;
    name: string;
}

type Props = {
    setSidebarOptionsState: React.Dispatch<React.SetStateAction<boolean>>;
    setLanguagePopupState: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LanguagePopup({ setSidebarOptionsState, setLanguagePopupState }: Props) {
    const { t, i18n } = useTranslation('sidebar');
    const mainRef = useRef<HTMLDivElement | null>(null);

    const languageNames: Language[] = t('auth.languages', { ns: 'footers', returnObjects: true }) as Language[];

    useEffect(() => {
        function documentClick(event: Event) {
            if (mainRef.current && !mainRef.current.contains(event.target as Node)) {
                setLanguagePopupState(false);
            }
        }

        document.addEventListener('mousedown', documentClick);

        return () => {
            document.removeEventListener('mousedown', documentClick);
        }
    }, [setLanguagePopupState]);

    const handleLanguageChange = (lang: string) => {
        localStorage.setItem('language', lang);
        i18n.changeLanguage(lang);
    };

    return (
        <div ref={mainRef} className={`${styles['wrapper']} absolute flex column`}>
            <header className={`${styles['header']} flex items-center`}>
                <Button 
                    innerElement={
                        <ChevronLeftIcon width={16} height={16} />
                    }
                    className={`${styles['back-button']} flex items-center content-center`}
                    onClick={() => {
                        setLanguagePopupState(false);
                        setSidebarOptionsState(true);
                    }}
                />
                <span className='margin-left-5'>{t('language_popup.header')}</span>
            </header>
            <div className={`${styles['buttons-wrapper']} flex column`}>
                { languageNames.map((lng, index) => (
                    <Button 
                        key={index}
                        innerElement={
                            <span className='flex items-center space-between' style={{ width: '100%' }}>
                                {lng.name}
                                { lng.code === i18n.language && (
                                    <span className='flex items-center content-center'>
                                        <CheckIcon width={16} height={16} style={{ stroke: 'var(--secondary-50)' }} />
                                    </span>
                                ) }
                            </span>
                        }
                        className={`${styles['button']} flex`}
                        onClick={() => handleLanguageChange(lng.code)}
                    />
                )) }
            </div>
        </div>
    )
};