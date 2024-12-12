import styles from './Support.module.css';
import { useTranslation } from 'react-i18next';

import bannerIconsSVG from '../../assets/support/banner-icons.svg';

import { ReactComponent as EmailIconSVG } from '../../assets/support/email.svg';
import { ReactComponent as DiscordIconSVG } from '../../assets/support/discord-mark-white.svg';

import Navbar from '../../components/Navbar/Unauthorized';
import SupportCard from './components/Card';

function Support() {
    const { t } = useTranslation('support');

    return (
        <div className='main-content flex column items-center'>
            <Navbar />
            <main className={`${styles['main']} flex column`}>
                <header className={`${styles['header']} text-center`}>
                    {t('header')}
                </header>
                <div className={`${styles['banner']} flex items-center content-center`}
                    style={{
                        backgroundImage: `url(${bannerIconsSVG})`
                    }}
                >
                    <span className='text-center' style={{ maxWidth: 500 }}>
                        {t('banner_text')}
                    </span>
                </div>
                <div className={`${styles['cards-wrapper']}`}>
                    <SupportCard 
                        header={t('cards.email.header')}
                        description={t('cards.email.description')}
                        link='mailto:support@ipla.com'
                        buttonText={t('cards.email.button_text')}
                        iconData={{
                            Icon: EmailIconSVG,
                            width: 100,
                            height: 100
                        }}
                    />
                    <SupportCard 
                        header={t('cards.discord.header')}
                        description={t('cards.discord.description')}
                        link='https://discord.gg/m2UJBaB4Hz'
                        buttonText={t('cards.discord.button_text')}
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