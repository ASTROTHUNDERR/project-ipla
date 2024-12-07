import styles from './AuthorizedNavbar.module.css';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthProvider';

import Button from '../../Button';
import DefaultAvatar from '../../../assets/defaults/Avatar';
import OptionsPopup from './components/OptionsPopup';
import LanguagePopup from './components/LanguagePopup';

export default function AuthorizedNavbar() {
    const { user } = useAuth();
    const [optionsState, setOptionsState] = useState(false);
    const optionsButtonRef = useRef<HTMLButtonElement | null>(null);
    const optionsPopupRef = useRef<HTMLDivElement | null>(null);

    const [languagePopupState, setLanguagePopupState] = useState(false);

    useEffect(() => {
        function documentClick(event: Event) {
            if (
                optionsPopupRef.current && !optionsPopupRef.current.contains(event.target as Node)
                && optionsButtonRef.current && !optionsButtonRef.current.contains(event.target as Node)
            ) {
                setOptionsState(false);
            }
        }

        document.addEventListener('mousedown', documentClick);

        return () => {
            document.removeEventListener('mousedown', documentClick);
        }
    }, []);

    return (
        <nav className={`${styles['navbar']} flex space-between`}>
            <a href='/' className='flex items-center'>
                <span className={styles['head-text']}>Project IPLA</span>
            </a>
            <div className='flex row relative'>
                { languagePopupState && !optionsState && (
                    <LanguagePopup 
                        setSidebarOptionsState={setOptionsState}
                        setLanguagePopupState={setLanguagePopupState}
                    />
                ) }
                { optionsState && (
                    <OptionsPopup 
                        Ref={optionsPopupRef}
                        setState={setOptionsState}
                        setLanguagePopupState={setLanguagePopupState}
                    />
                ) }
                <Button 
                    Ref={optionsButtonRef}
                    innerElement={
                        <span className={`${styles['user-avatar-wrapper']} flex content-center items-center`}>
                            <DefaultAvatar 
                                username={user?.username}
                            />
                        </span>
                    }
                    className={`${styles['options-button']}`}
                    onClick={() => setOptionsState(!optionsState)}
                />
            </div>
        </nav>
    )
};