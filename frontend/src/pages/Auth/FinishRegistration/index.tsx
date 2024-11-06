import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../../../context/ApiProvider';

import styles from './FinishRegistration.module.css';
import { HelperMessages, Card, finishRegistrationFormSchema, FinishRegistrationFormData } from '../types';
import { handleInputOnFocus, handleInputOnBlur, handleUsernameInput } from '../functions';

import { ReactComponent as ChevronLeftIcon } from '../../../assets/icons/chevron-left.svg';

import AuthFooter from '../../../components/Footers/Auth';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import SubmitButton from '../../../components/SubmitButton';
import RegistrationCard from '../Registration/components/Card';

export default function FinishRegistration() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { postRequest, loading } = useApi();

    const [currentPage, setCurrentPage] = useState<'username' | 'type'>('username');
    // eslint-disable-next-line
    const [token, setToken] = useState<string | null>(searchParams.get('token'));
    const [username, setUsername] = useState<string | null>(searchParams.get('username'));
    const [registrationType, setRegistrationType] = useState<'player' | 'manager' | 'team owner' | undefined>(undefined);

    const { register, handleSubmit, formState: { errors }  } = useForm<FinishRegistrationFormData>({ 
        resolver: zodResolver(finishRegistrationFormSchema)
    });

    const [helperMessages, setHelperMessages] = useState<HelperMessages>({
        username: { text: t('auth.registration.form.helper_texts.username.general'), danger: false },
    });

    const cards: Card[] = t('auth.registration.intro.cards', { returnObjects: true }) as Card[];
    const updatedCards = cards.map(card => {
        const cardType = (card.header.toLowerCase() === 'player' || card.header.toLowerCase() === 'მოთამაშე') ? 'player'
            : (card.header.toLowerCase() === 'manager' || card.header.toLowerCase() === 'მენეჯერი') ? 'manager' : 'team owner'
        return {
            ...card,
            type: cardType
        }
    });

    useEffect(() => {
        if (username) {
            const isValid = /^[a-zA-Z0-9_]*$/.test(username);
            if (!isValid) {
                setHelperMessages({
                    username: {
                        text: t('auth.registration.form.helper_texts.username.general'), danger: true
                    }
                })
            }
        }
        if (errors.username && errors.username.message) {
            setHelperMessages({
                username: {
                    text: t(errors.username.message), danger: true
                }
            })
        }
    }, [username, t, errors])

    useEffect(() => {
        if (!token || !username) {
            navigate('/login');
        }   
    })
    
    const onSubmit: SubmitHandler<FinishRegistrationFormData> = async (data) =>{
        if (currentPage === 'username') {
            const request = await postRequest('/auth/finish_registration/check_username', {
                ...data,
                token: token
            });
            if (request.error) {
                if (request.error.includes('username')) {
                    setHelperMessages({
                        username: { text: t('auth.registration.form.helper_texts.username.error_texts.in_use'), danger: true }
                    })
                }
                if (request.error.includes('token')) {
                    setHelperMessages({
                        username: { text: request.error, danger: true }
                    })
                }
            } else {
                setCurrentPage('type');
                setUsername(data.username);
                navigate(window.location.pathname, { replace: true });
            }
        }
        if (currentPage === 'type') {
            await postRequest('/auth/finish_registration', {
                username: username,
                token: token,
                registrationType: registrationType
            });
            navigate('/login');
        }
    };  


    return (
        <div className='auth-component relative flex column'>
            <main className='auth-content flex items-center content-center'>
                <section className='auth-content-wrapper flex items-center content-center column'>
                    <div className='auth-login-content'>
                        <div className='auth-content-title-wrapper flex content-center'>
                            <h1 className='auth-title text-center'>{t('auth.finish_registration.header')}</h1>
                        </div>
                        <form className='auth-login-form flex column' onSubmit={handleSubmit(onSubmit)}>
                            {currentPage === 'username' ? (
                                <div>
                                    <InputField 
                                        required
                                        headText={t('auth.finish_registration.input_field.header')}
                                        inputType={'text'}
                                        inputName={'username'}
                                        register={register}
                                        defaultValue={username ? username : undefined}
                                        helperMessage={helperMessages?.['username']}
                                        {...(!helperMessages?.['username']?.danger && {
                                            onFocus: handleInputOnFocus,
                                            onBlur: handleInputOnBlur
                                        })}
                                        onInput={(e) => handleUsernameInput(e, t('auth.registration.form.helper_texts.username.general'), setHelperMessages)}
                                    />
                                    <div className={`${styles['submit-buttons-wrapper']} flex margin-top-30`}>
                                        <Button 
                                            innerElement={t('auth.finish_registration.buttons.cancel')}
                                            className={styles['button']}
                                        />
                                        <SubmitButton 
                                            isLoading={loading}
                                            innerElement={t('auth.finish_registration.buttons.next')}
                                            className={`${styles['button']} ${styles['submit']}`}
                                        />
                                    </div>
                                </div>
                            ) : currentPage === 'type' && (
                                <div>
                                    <div className='intro-content-wrapper relative'>
                                        <div className='cards-wrapper'>
                                            {updatedCards.map((card, index) => (
                                                <RegistrationCard 
                                                    key={index}
                                                    header={card.header}
                                                    description={card.description}
                                                    bulletList={card.bullets}
                                                    buttonText={card.button}
                                                    type={card.type}
                                                    selectable
                                                    selectedType={registrationType}
                                                    onClick={(type: 'player' | 'manager' | 'team owner') => setRegistrationType(type)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`${styles['submit-buttons-wrapper']} flex margin-top-30`}>
                                        <Button 
                                            innerElement={
                                                <span className='flex row items-center content-center'>
                                                    <ChevronLeftIcon width={16} height={16} />
                                                    <span className='margin-left-5'>{t('basic.back')}</span>
                                                </span>
                                            }
                                            className={styles['button']}
                                            onClick={() => setCurrentPage('username')}
                                        />
                                        <SubmitButton 
                                            isLoading={loading}
                                            innerElement={t('auth.finish_registration.buttons.submit')}
                                            className={`${styles['button']} ${styles['submit']}`}
                                        />
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </section>
            </main>
            <AuthFooter />
        </div>
    )
};