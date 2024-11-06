import styles from './WindowPopup.module.css';
import React from 'react';

import Button from '../Button';

const WindowCSSProperties: React.CSSProperties = {
    width: '100%',
    height: '100%',
    top: 0,
    left: 0
}

type Props = {
    header: string;
    description: string | React.ReactNode;
    cancelButton?: boolean;
    cancelButtonOnClick?: React.MouseEventHandler<HTMLButtonElement>;
    submitButtonInnerElement: string | React.ReactNode;
    submitBtnOnClick: React.MouseEventHandler<HTMLButtonElement>;
}
 
export default function WindowPopup({
    header,
    description,
    cancelButton,
    cancelButtonOnClick,
    submitButtonInnerElement,
    submitBtnOnClick
}: Props) {
    return (
        <div className='z-1 absolute flex items-center content-center' style={WindowCSSProperties}>
            <div className={`${styles['window']} flex column`}>
                <header className={styles['header']}>
                    {header}
                </header>
                <span className={`${styles['description']} margin-top-10`}>
                    {description}
                </span>
                <div
                    className={`${styles['submit-wrapper']} margin-top-45 flex row`} 
                    style={ 
                        !cancelButton 
                        ? { justifyContent: 'flex-end' } 
                        : { justifyContent: 'space-between' }   
                    }
                >
                    {cancelButton && (
                        <Button 
                            innerElement='Cancel'
                            className={styles['button']}
                            onClick={cancelButtonOnClick}
                        />
                    )}
                    <Button 
                        innerElement={submitButtonInnerElement}
                        className={`${styles['button']} ${styles['submit']}`}
                        onClick={submitBtnOnClick}
                    />
                </div>
            </div>
            <div className='overlay'></div>
        </div>
    )
};