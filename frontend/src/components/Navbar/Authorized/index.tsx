import styles from './AuthorizedNavbar.module.css';
import { useEffect, useState, useRef } from 'react';

import { UserCircleIcon } from '@heroicons/react/24/outline';

import Button from '../../Button';
import OptionsPopup from './components/OptionsPopup';

export default function AuthorizedNavbar() {
    const [optionsState, setOptionsState] = useState(false);
    const optionsButtonRef = useRef<HTMLButtonElement | null>(null);
    const optionsPopupRef = useRef<HTMLDivElement | null>(null);

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
    }, [])

    return (
        <nav className={`${styles['navbar']} flex space-between`}>
            <a href='/' className='flex items-center'>
                <span className={styles['head-text']}>Project IPLA</span>
            </a>
            <div className='flex row relative'>
                {optionsState && (
                    <OptionsPopup Ref={optionsPopupRef} />
                )}
                <Button 
                    Ref={optionsButtonRef}
                    innerElement={
                        <span className={`${styles['user-avatar-wrapper']} flex content-center items-center`}>
                            <UserCircleIcon strokeWidth={1} width={30} height={30} />
                        </span>
                    }
                    className={`${styles['options-button']}`}
                    onClick={() => setOptionsState(!optionsState)}
                />
            </div>
        </nav>
    )
};