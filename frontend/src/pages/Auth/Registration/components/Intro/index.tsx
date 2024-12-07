import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ReactComponent as ChevronLeftIcon } from '../../../../../assets/icons/chevron-left.svg';

import { Card } from '../../../types';

import Button from '../../../../../components/Button';
import RegistrationCard from '../Card';

export default function RegistrationIntro() {
    const { t } = useTranslation(['auth', 'translation']);
    const navigate = useNavigate(); 

    const cards: Card[] = t('registration.registration.intro.cards', { returnObjects: true }) as Card[];
    const updatedCards = cards.map(card => {
        const cardType = (card.header.toLowerCase() === 'player' || card.header.toLowerCase() === 'მოთამაშე') ? 'player'
            : (card.header.toLowerCase() === 'manager' || card.header.toLowerCase() === 'მენეჯერი') ? 'manager' : 'team owner'
        return {
            ...card,
            type: cardType
        }
    })

    return (
        <main className='auth-content flex items-center content-center'>
            <section className='auth-content-wrapper flex items-center content-center column'>
                <div className='intro-content-wrapper relative'>
                    <div className='auth-content-title-wrapper flex content-center text-center flex row intro-header'>
                        <h1 className='auth-title'>{t('registration.registration.intro.header')}</h1>
                        <Button 
                            innerElement={
                                <span className='flex row items-center content-center'>
                                    <ChevronLeftIcon width={16} height={16} />
                                    <span className='margin-left-5'>{t('general_words.back', { ns: 'translation' })}</span>
                                </span>
                            }
                            className='auth-back-button flex items-center intro-back-button'
                            onClick={() => navigate('/login')}
                        />
                    </div>
                    <div className='cards-wrapper'>
                        {updatedCards.map((card, index) => (
                            <RegistrationCard 
                                key={index}
                                header={card.header}
                                description={card.description}
                                bulletList={card.bullets}
                                buttonText={card.button}
                                type={card.type}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
};