import styles from './Field.module.css';

import Button from '../../../../components/Button';

type Props = {
    headerText: string;
    additionalClassname?: string;
    content?: string | React.ReactNode;
    danger?: boolean;
    secondaryDanger?: boolean;
    contentButtons?: boolean;
    buttonText?: string;
    onButtonClick?: () => void;
}

export default function SettingsField({
    headerText,
    additionalClassname,
    content,
    danger,
    secondaryDanger,
    contentButtons,
    buttonText,
    onButtonClick
}: Props) {
    return (
        <div className={`${styles['field-wrapper']} flex column relative ${additionalClassname ? additionalClassname : ''} ${danger ? styles['danger'] : ''}`}>
            <div className={`${styles['header']} absolute`}>
                <span>{headerText}</span>
            </div>
            { content && (
                <>
                    { typeof content === 'string' ? (
                        <span className={styles['description']}>{content}</span>
                    ) : (
                        content
                    )}
                </>
            ) }
            { !contentButtons && buttonText && onButtonClick && (
                <Button 
                    innerElement={buttonText}
                    className={`${styles['button']} ${danger ? 'danger' : 'primary'} ${secondaryDanger ? styles['danger-secondary'] : ''}`}
                    onClick={onButtonClick}
                />
            ) }
        </div>
    )
};