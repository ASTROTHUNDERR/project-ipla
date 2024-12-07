import styles from './InfoCard.module.css';

import { ReactComponent as PencilIcon } from '../../../../../../assets/icons/pencil.svg';
import { ReactComponent as GoogleIcon } from '../../../../../../assets/icons/brands/google-icon-logo.svg';
import { ReactComponent as DiscordIcon } from '../../../../../../assets/icons/brands/discord-mark-blue.svg';

import Button from '../../../../../../components/Button';

import { SAWindowPopupState } from '../../../../types';

type Props = {
    part: string;
    userProvider?: string;
    header: string;
    content: string;
    setWindowPopupState: React.Dispatch<React.SetStateAction<SAWindowPopupState | null>>
}

export default function SAInfoCard({
    part,
    userProvider,
    header,
    content,
    setWindowPopupState
}: Props) {
    return (
        <div className={`${styles['wrapper']} settings-field relative flex space-between`}>
            <div className='flex column' style={{ padding: 20 }}>
                <span className={styles['header']}>{header}</span>
                <span className={styles['content']}>{content}</span>
            </div>
            <div>
                { !userProvider && (
                    <Button 
                        innerElement={
                            <PencilIcon width={22} height={22} strokeWidth={1} />
                        }
                        className={`${styles['button']} flex items-center content-center`}
                        onClick={() => {
                            if (part === 'username') {
                                setWindowPopupState('username_change');
                            }
                            if (part === 'email') {
                                setWindowPopupState('email_change');
                            }
                        }}
                    />
                ) }
                { userProvider && (
                    <div className={`${styles['provider-btn']} flex items-center content-center`}>
                        { userProvider === 'google' && (
                            <GoogleIcon width={22} height={22} />
                        ) }
                        { userProvider === 'discord' && (
                            <DiscordIcon width={22} height={22} />
                        ) }
                    </div>
                ) }
            </div>
        </div>
    )
}