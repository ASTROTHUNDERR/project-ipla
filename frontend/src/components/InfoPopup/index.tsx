import styles from './InfoPopup.module.css';

import React from 'react';
import { useGeneral } from '../../context/GeneralProvider';

import { ReactComponent as InfoIconSVG } from '../../assets/icons/info.svg';

export default function InfoPopup() {
    const { infoData, setInfoData } = useGeneral();
    const mainRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        function onTimeout() {
            if (mainRef.current) {
                mainRef.current.classList.add(styles['slide-out']);
                setTimeout(() => {
                    setInfoData(null);
                }, 250)
            }
        }
        const timer = window.setTimeout(onTimeout, 4000);

        return () => {
            window.clearTimeout(timer);
        };
    }, [infoData, setInfoData])

    return (
        <div ref={mainRef} className={`${styles['info-popup']} flex ${infoData?.danger === true ? styles['danger'] : styles['info']}`}>
            {infoData?.danger === true && (
                <div className='flex items-center content-center margin-right-10'>
                    <InfoIconSVG width={18} height={18} className={styles['info-icon']} />
                </div>
            )}
            <span>{infoData?.content}</span>
        </div>
    )
};