import styles from './Card.module.css';
import { useNavigate, useLocation } from 'react-router-dom';

import Button from '../../../../../components/Button';

interface Props {
    header: string;
    description: string;
    bulletList: { content: string }[];
    buttonText: string;
    type: string;
    selectable?: boolean;
    selectedType?: string;
    onClick?: (type: "player" | "manager" | "team owner") => void;
}

function RegistrationCard({
    header,
    description,
    bulletList,
    buttonText,
    type,
    selectable,
    selectedType,
    onClick
}: Props) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div 
            className={`${styles['card']} flex column ${selectable ? styles['selectable'] : styles['regular']} ${selectedType === type ? styles['selected'] : ''}`}
            {...(selectable && onClick ? {
                onClick: () => onClick(type as "player" | "manager" | "team owner")
            } : {})}
        >
            <header className={`${styles['header']} text-center`}>
                <span>{header}</span>
            </header>
            <span className={`${styles['description']} margin-top-15`}>{description}</span>
            <ul className={`${styles['ul']} margin-top-10`}>
                {bulletList.map((bullet, index) => (
                    <li key={index}>{bullet.content}</li>
                ))}
            </ul>
            <Button 
                {...(selectable ? {
                    onMouseEnter: (e) => {
                        e.currentTarget.style.backgroundColor = 'var(--primary-500)';
                    },
                } : {})}
                innerElement={buttonText}
                className={styles['button']}
                {...(selectable ? {} : {
                    onClick: () => navigate(`${location.pathname}?type=${type}`)

                })}
            />
        </div>
    )
};

export default RegistrationCard;