import styles from '../SocialsComp.module.css';

import { ReactComponent as PlusIcon} from '../../../../../../../assets/icons/plus.svg';

import Button from '../../../../../../../components/Button';

type Props = {
    icon: string;
    name: string;
}

export default function ConnectableSocial({
    icon,
    name
}: Props) {
    return (
        <div className={`${styles['connectable-social']} flex items-center space-between`}>
            <div className='flex items-center'>
                <span className='flex items-center' style={{ userSelect: 'none' }}>
                    <img 
                        src={icon} 
                        alt="social-icon" 
                        style={{ pointerEvents: 'none', height: 24 }}
                    />
                </span>
                <span style={{ marginLeft: 8 }}>{name}</span>
            </div>
            <Button 
                innerElement={
                    <PlusIcon className='flex items-center content-center' width={16} height={16} stroke='var(--secondary-50)' />
                }
                className={`${styles['social-add-btn']} flex items-center content-center`}
            />
        </div>
    )
};