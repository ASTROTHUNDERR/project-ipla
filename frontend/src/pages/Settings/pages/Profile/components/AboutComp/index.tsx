import styles from './AboutComp.module.css';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsField from '../../../../components/Field';

export default function SettingsProfileAboutComp() {
    const { t } = useTranslation('settings');

    const [lettersLimit, setLettersLimit] = useState<number>(140);

    const onTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (lettersLimit <= 0 && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
        } else if (lettersLimit > 0) {
            setLettersLimit((prev) => prev - 1);
        }
    };

    return (
        <SettingsField 
            headerText={t('profile.about.header')}
            additionalClassname={styles['about-field']}
            content={
                <div className='flex column full-size relative'>
                    <span className={styles['letters-limit']}>{lettersLimit}</span>
                    <textarea 
                        className={styles['text-area']}
                        onKeyDown={onTextAreaKeyDown}
                    />
                </div>
            }
        />
    )
}