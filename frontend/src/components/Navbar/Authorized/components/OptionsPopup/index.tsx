import styles from './OptionsPopup.module.css';

import { useAuth } from '../../../../../context/AuthProvider';
import { logoutUser } from '../../../../../utils/api';

import Button from '../../../../Button';

type Props = {
    Ref: React.MutableRefObject<HTMLDivElement | null>;
}

export default function OptionsPopup({
    Ref
}: Props) {
    const { user } = useAuth();

    return (
        <div ref={Ref} className={`${styles['options-popup']} absolute flex column`}>
            <a href={`/profile/${user?.username}`} className={`${styles['button']}`}>
                View Profile
            </a>
            <div className={styles['divider']}></div>
            <a href="/" className={`${styles['button']}`}>
                Your Teams
            </a>
            <a href="/" className={`${styles['button']}`}>
                Your Wallet
            </a>
            <div className={styles['divider']}></div>
            <a href="/" className={`${styles['button']}`}>
                Account Settings
            </a>
            <a href="/" className={`${styles['button']}`}>
                Profile Settings
            </a>
            <a href="/" className={`${styles['button']}`}>
                Game Settings
            </a>
            <div className={styles['divider']}></div>
            <a href="/support" className={`${styles['button']}`}>
                Support
            </a>
            <Button 
                innerElement='Logout'
                className={`${styles['button']} flex`}
                onClick={() => {
                    logoutUser();
                    window.location.href = '/login';
                }}
            />
        </div>
    )
};