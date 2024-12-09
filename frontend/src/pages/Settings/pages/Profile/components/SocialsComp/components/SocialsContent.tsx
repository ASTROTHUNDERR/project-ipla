import styles from '../SocialsComp.module.css';
import { useTranslation } from 'react-i18next';

import { Social } from '../../../../../types';

import YouTubeLogo from '../../../../../../../assets/socials/youtube_social_icon_red.png';
import InstagramLogo from '../../../../../../../assets/socials/Instagram_Glyph_Gradient.svg';
import XLogo from '../../../../../../../assets/socials/x-logo.svg';
import FacebookLogo from '../../../../../../../assets/socials/Facebook_Logo_Primary.png';

// import ConnectedSocial from './ConnectedSocial'; 
import ConnectableSocial from './ConnectableSocial';

const ALL_SOCIALS = [
    'yt', 'fb', 'ig', 'x'
]

const socialIcons = {
    yt: {
        logo: YouTubeLogo,
        name: 'YouTube'
    },
    ig: {
        logo: InstagramLogo,
        name: 'Instagram'
    },
    fb: {
        logo: FacebookLogo,
        name: 'Facebook'
    },
    x: {
        logo: XLogo,
        name: 'X'
    }
}

type Props = {
    socials?: Social[];
}
export default function SocialsContent({
    socials
}: Props) {
    const { t } = useTranslation('settings');

    const connectableSocials = Array.from(ALL_SOCIALS).filter(provider => !socials?.find(social => social.provider === provider));
    const updateConnectableSocials = connectableSocials.map(provider => {
        return socialIcons[provider as 'yt' | 'ig' | 'fb' | 'x'];
    });

    return (
        <>
            { socials && socials.length > 0 ? (
                <div className='flex column'>exist</div>
            ) : (
                <div className='flex column'>
                    <div className='flex items-center'>
                        <header className={styles['socials-to-add-header']}>{t('profile.socials.socials_to_add_header')}</header>
                        <div className={styles['socials-to-add-line']}></div>
                    </div>
                    <div className='flex column' style={{ gap: 10, marginTop: 8 }}>
                        { updateConnectableSocials.map((social, index) => (
                            <ConnectableSocial 
                                key={index}
                                icon={social.logo}
                                name={social.name}
                            />
                        )) }
                    </div>
                </div>
            ) }
        </>
    )
};