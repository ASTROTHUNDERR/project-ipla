import styles from './Support.module.css';
import { useTranslation } from 'react-i18next';

import bannerIconsSVG from '../../assets/support/banner-icons.svg';

import { ReactComponent as EmailIconSVG } from '../../assets/support/email.svg';
import { ReactComponent as DiscordIconSVG } from '../../assets/support/discord-mark-white.svg';

import SupportNavbar from './components/Navbar';
import SupportCard from './components/Card';

function Support() {
    const { t } = useTranslation();

    return (
        <div className='main-content flex column items-center'>
            <SupportNavbar />
            <main className={`${styles['main']} flex column`}>
                <header className={`${styles['header']} text-center`}>
                    {t('support.header')}
                </header>
                <div className={`${styles['banner']} flex items-center content-center`}
                    style={{
                        backgroundImage: `url(${bannerIconsSVG})`
                    }}
                >
                    <span className='text-center' style={{ maxWidth: 500 }}>
                        {t('support.banner_text')}
                    </span>
                </div>
                <div className={`${styles['cards-wrapper']}`}>
                    <SupportCard 
                        header={t('support.cards.email.header')}
                        description={t('support.cards.email.description')}
                        link='mailto:support@ipla.com'
                        buttonText={t('support.cards.email.button_text')}
                        iconData={{
                            Icon: EmailIconSVG,
                            width: 100,
                            height: 100
                        }}
                    />
                    <SupportCard 
                        header={t('support.cards.discord.header')}
                        description={t('support.cards.discord.description')}
                        link='/discord'
                        buttonText={t('support.cards.discord.button_text')}
                        iconData={{
                            Icon: DiscordIconSVG,
                            width: 100,
                            height: 100
                        }}
                    />
                </div>
            </main>
        </div>
    )
};

export default Support;