import styles from './InfoComp.module.css';
import { useAuth } from '../../../../../../context/AuthProvider';

import { ReactComponent as PencilSquareIcon } from '../../../../../../assets/icons/pencil-square.svg';

import Button from '../../../../../../components/Button';

type Props = {
    profileUsername: string;
    headerText: string;
    className: string;
    content: string | React.ReactNode;
    onEditButtonClick: () => void;
}

export default function InfoComp({
    profileUsername,
    headerText,
    className,
    content,
    onEditButtonClick
}: Props) {
    const { user } = useAuth();
    
    return (
        <div className={className}>
            <header className={`${styles['head']} flex items-center space-between`}>
                <span>{headerText}</span>
                { user?.username === profileUsername && (
                    <Button 
                        innerElement={
                            <PencilSquareIcon width={18} height={18} stroke='var(--secondary-50)' strokeWidth={1.5} />
                        }
                        className={`${styles['edit-button']} flex items-center content-center`}
                        onClick={onEditButtonClick}
                    />
                ) }
            </header>
            <div className='flex full-width'>
                {content}
            </div>
        </div>
    )
};