import styles from './LeftSide.module.css';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import InfoComp from './components/InfoComp';
import Button from '../../../../components/Button';

type Props = {
    aboutContent?: string;
    profileUsername: string;
}

export default function ProfileLeftSide({
    aboutContent,
    profileUsername
}: Props) {
    const { t } = useTranslation('profile');
    const navigate = useNavigate();

    const aboutContentRef = useRef<HTMLSpanElement | null>(null);
    const [aboutSeeMoreButton, setAboutSeeMoreButton] = useState<{ display: boolean, state: 'more' | 'less' }>({ display: false, state: 'more' });

    useEffect(() => {
        if (aboutContentRef.current) {
            const maxHeight = window.getComputedStyle(aboutContentRef.current).getPropertyValue('max-height');
            if (maxHeight === '32px') {
                setAboutSeeMoreButton({ display: false, state: 'more' });
                return;
            }
            if (`${aboutContentRef.current.clientHeight}px` === maxHeight) {
                setAboutSeeMoreButton({ display: true, state: 'more' });
            }
        }
    }, [aboutContentRef])

    return (
        <div className={styles['wrapper']}>
            <InfoComp 
                profileUsername={profileUsername}
                headerText={t('general.left_side.about.header')}
                className={`${styles['info-wrapper']} ${styles['about']}`}
                content={
                    <div className='flex column'>
                        <span 
                            ref={aboutContentRef} 
                            className={styles['about-content']}
                        >
                            {aboutContent}
                        </span>
                        { aboutSeeMoreButton.display && (
                            <div className='flex' style={{ justifyContent: 'flex-end' }}>
                                <Button 
                                    innerElement={
                                        aboutSeeMoreButton.state === 'more'
                                            ? 'See more'
                                            : 'See less'
                                    }
                                    className={`${styles['about-see-more-btn']} margin-top-5`}
                                    onClick={() => {
                                        if (aboutContentRef.current) {
                                            if (aboutSeeMoreButton.state === 'more') {
                                                aboutContentRef.current.style.maxHeight = 'fit-content';
                                                setAboutSeeMoreButton({ display: true, state: 'less' });
                                            } else {
                                                aboutContentRef.current.style.maxHeight = '64px';
                                                setAboutSeeMoreButton({ display: true, state: 'more' });
                                            }
                                        }
                                    }}
                                />
                            </div>
                        ) }
                    </div>
                }
                onEditButtonClick={() => navigate('/settings/profile')}
            />
        </div>
    )
};