import styles from './WindowPopup.module.css';
import React from 'react';

import Button from '../Button';
import SubmitButton from '../SubmitButton';

const WindowCSSProperties: React.CSSProperties = {
    width: '100%',
    height: '100%',
    top: 0,
    left: 0
}

type Props = {
    width: number;
    header: string;
    content: string | React.ReactNode;
    cancelButton?: boolean;
    cancelButtonText?: string | React.ReactNode;
    cancelButtonOnClick?: React.MouseEventHandler<HTMLButtonElement>;
    submitLoading?: boolean;
    dangerSubmitButton?: boolean;
    submitButtonInnerElement: string | React.ReactNode;
    onFormSubmit: React.FormEventHandler<HTMLFormElement>;
}
 
export default function WindowPopup({
    width,
    header,
    content,
    cancelButton,
    cancelButtonText,
    cancelButtonOnClick,
    submitLoading,
    dangerSubmitButton,
    submitButtonInnerElement,
    onFormSubmit,
}: Props) {
    return (
        <div className='z-1 fixed flex items-center content-center' style={WindowCSSProperties}>
            <div className={`${styles['window']} flex column`} style={{ width }}>
                <header className={styles['header']}>
                    {header}
                </header>
                <form onSubmit={onFormSubmit}>
                    <div className={`${styles['content']} margin-top-10`}>
                        {content}
                    </div>
                    <div
                        className={`${styles['submit-wrapper']} flex`} 
                        style={ 
                            !cancelButton 
                            ? { justifyContent: 'flex-end' } 
                            : { justifyContent: 'space-between' }   
                        }
                    >
                        { cancelButton && (
                            <Button 
                                innerElement={cancelButtonText ? cancelButtonText : 'Cancel'}
                                className={styles['button']}
                                onClick={cancelButtonOnClick}
                            />
                        ) }
                        <SubmitButton 
                            isLoading={submitLoading ? submitLoading : false}
                            innerElement={submitButtonInnerElement}
                            className={`${styles['button']} ${styles['submit']} ${dangerSubmitButton ? 'danger' : ''}`}
                        />
                    </div>
                </form>
            </div>
            <div className='overlay'></div>
        </div>
    )
};