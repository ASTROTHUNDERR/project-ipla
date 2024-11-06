import React from 'react';
import styles from './SubmitButton.module.css';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    Ref?: React.MutableRefObject<HTMLButtonElement | null>;
    innerElement: string | React.ReactNode;
    className?: string;
    isLoading: boolean;
}

const SubmitButton: React.FC<Props> = ({ 
    Ref,
    innerElement,
    className,
    isLoading,
    ...rest
}) => {
    return (
        <button 
            ref={Ref}
            type='submit'
            disabled={isLoading}
            className={`${styles['button']} ${className ? className : ''}`}
            {...rest}
        >
            {isLoading ? (
                <div className={styles['loading-dots']}>
                    <span className={styles['dot']}></span>
                    <span className={styles['dot']}></span>
                    <span className={styles['dot']}></span>
                </div>
            ) : (
                innerElement
            )}
        </button>
    )
};

export default SubmitButton;