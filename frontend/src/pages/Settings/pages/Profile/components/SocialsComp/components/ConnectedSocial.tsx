import styles from '../SocialsComp.module.css';

import { ReactComponent as XMarkIcon} from '../../../../../../../assets/icons/xmark.svg';

import Button from '../../../../../../../components/Button';

type Props = {
    link: string;
    icon: string;
    username: string;
}

export default function ConnectedSocial({
    link,
    icon,
    username
}: Props) {
    return (
        <div className={`${styles['connected-social']} flex items-center space-between`}>
            <a href={link} className='flex items-center'>
                <span className='flex items-center' style={{ userSelect: 'none' }}>
                    <img 
                        src={icon} 
                        alt="social-icon" 
                        style={{ pointerEvents: 'none', height: 24 }}
                    />
                </span>
                <span style={{ marginLeft: 8 }}>{username}</span>
            </a>
            <Button 
                innerElement={
                    <XMarkIcon width={16} height={16} stroke='var(--secondary-50)' />
                }
                className={`${styles['social-rm-btn']} flex items-center content-center`}
            />
        </div>
    )
};