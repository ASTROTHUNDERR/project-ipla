import styles from './AboutComp.module.css';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../../../context/ApiProvider';
import { useGeneral } from '../../../../../../context/GeneralProvider';

import SettingsField from '../../../../components/Field';
import Button from '../../../../../../components/Button';

type Props = {
    about: string;
}

export default function SettingsProfileAboutComp({ about }: Props) {
    const { t } = useTranslation('settings');
    const { protectedPutRequest } = useApi();
    const { setInfoData } = useGeneral();

    const [lettersLimit, setLettersLimit] = useState<number>(140 - about.length);
    const [aboutContent, setAboutContent] = useState<string | undefined>(about);
    const [displayButtons, setDisplayButtons] = useState(false);

    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const previousLengthRef = useRef(0);

    const onTextAreaKeyUp = () => {
        if (textAreaRef.current) {
            const currentLength = textAreaRef.current.value.length;
            const lengthDifference = previousLengthRef.current - currentLength;

            setLettersLimit((prev) => prev + lengthDifference);

            previousLengthRef.current = currentLength;

            setAboutContent(textAreaRef.current.value);
            if (about !== textAreaRef.current.value) {
                setDisplayButtons(true);
            } else {
                setDisplayButtons(false);
            }
        }
    };

    const onTextAreaFocus = () => {
        if (textAreaRef.current) {
            previousLengthRef.current = textAreaRef.current.value.length;
        }
    };
    
    const saveAbout = async () => {
        if (textAreaRef.current) {
            const response = await protectedPutRequest('/user-profile/update', {
                about: aboutContent
            });
            if (response.error) {
                if ((response.error as {message: string}[])[0].message.includes('inappropriate')) {
                    setInfoData({
                        content: t('profile.about.helper_texts.inappropriate'),
                        danger: true
                    });
                    return;
                }
            } else {
                window.location.reload();
            }
        }   
    };

    return (
        <SettingsField 
            headerText={t('profile.about.header')}
            additionalClassname={styles['about-field']}
            content={
                <div className='flex full-size'>
                    <div className='flex relative'
                        style={{
                            width: 375,
                            transform: 'width 300ms'
                        }}
                    >
                        <span className={styles['letters-limit']}>{lettersLimit}</span>
                        <textarea 
                            className={styles['text-area']}
                            ref={textAreaRef}
                            value={aboutContent}
                            onInput={onTextAreaKeyUp}
                            onFocus={onTextAreaFocus}
                            maxLength={lettersLimit}
            
                        />
                    </div>
                    { displayButtons && (
                        <div className='flex column margin-left-10' style={{ gap: 10 }}>
                            <Button 
                                innerElement={t('general_words.save', { ns: 'translation' })}
                                className={`${styles['button']} primary`}
                                onClick={saveAbout}
                            />
                            <Button 
                                innerElement={t('general_words.reset', { ns: 'translation' })}
                                className={`${styles['button']}`}
                                onClick={() => {
                                    setAboutContent(about);
                                    setDisplayButtons(false);
                                    setLettersLimit(140 - about.length);
                                }}
                            />
                        </div>
                    ) }
                </div>
            }
        />
    )
}