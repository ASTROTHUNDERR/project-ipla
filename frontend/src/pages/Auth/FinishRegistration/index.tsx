import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../../../context/ApiProvider';
import countries from 'i18n-iso-countries';

import styles from './FinishRegistration.module.css';
import { HelperMessages, Card, finishRegistrationFormSchema, FinishRegistrationFormData } from '../types';
import { handleInputOnFocus, handleInputOnBlur, handleUsernameInput, validateBirthDate } from '../functions';
import { loadCountriesInLanguage } from '../../../utils/language/countries';

import { ReactComponent as ChevronLeftIcon } from '../../../assets/icons/chevron-left.svg';

import AuthFooter from '../../../components/Footers/Auth';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Selection from '../../../components/Selection';
import SubmitButton from '../../../components/SubmitButton';
import RegistrationCard from '../Registration/components/Card';

export default function FinishRegistration() {
    const { t, i18n } = useTranslation(['registration', 'translation']);
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
        username: { text: t('registration.form.helper_texts.username.general'), danger: false },
        birthDate: undefined,
        country: undefined
    });
    const [birthMonth, setBirthMonth] = useState<string | null>(null);
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [countryList, setCountryList] = useState<any | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<{ value: string, content: string } | null>(null);
    const [countryData, setCountryData] = useState<{
        value: string;
        content: string;
        locale: 'en' | 'ka'
    } | null>(null);

    
    const months: { value: string, content: string }[] = t('basic.months', { ns: 'translation', returnObjects: true }) as { value: string, content: string }[];

    const cards: Card[] = t('registration.intro.cards', { returnObjects: true }) as Card[];
    const updatedCards = cards.map(card => {
        const cardType = (card.header.toLowerCase() === 'player' || card.header.toLowerCase() === 'მოთამაშე') ? 'player'
            : (card.header.toLowerCase() === 'manager' || card.header.toLowerCase() === 'მენეჯერი') ? 'manager' : 'team owner'
        return {
            ...card,
            type: cardType
        }
    });

    useEffect(() => {
        async function loadCountries() {
            await loadCountriesInLanguage(i18n.language);
            const countriesInLanguage = countries.getNames(i18n.language);
            setCountryList(countriesInLanguage);
        }

        loadCountries()
    }, [i18n.language])

    useEffect(() => {
        setHelperMessages(prevData => {
            const newHelperMessages = { ...prevData };

            if (username) {
                const isValid = /^[a-zA-Z0-9_]*$/.test(username);
                if (!isValid) {
                    newHelperMessages.username = {
                        text: t('registration.form.helper_texts.username.general'),
                        danger: true
                    };
                } else {
                    newHelperMessages.username = {
                        text: t('registration.form.helper_texts.username.general'),
                        danger: false
                    };
                }
            }
    
            if (errors.username && errors.username.message) {
                newHelperMessages.username = {
                    text: t(errors.username.message),
                    danger: true
                };
            }
    
            newHelperMessages.birthDate = (errors.birthYear || errors.birthDay)
                ? { text: t('registration.form.helper_texts.birth_date.error_texts.unreal'), danger: true }
                : newHelperMessages.birthDate;
    
            return newHelperMessages;
        });
    }, [username, t, errors]);
    
    useEffect(() => {
        if (!token || !username) {
            navigate('/login');
        }   
    });

    useEffect(() => {
        if (selectedCountry) {
            setCountryData({
                ...selectedCountry,
                locale: i18n.language as 'en' | 'ka',
            });
        }
    }, [selectedCountry, i18n.language])

    const handleSelectChange = (e: React.MouseEvent<HTMLDivElement>) => {
        setBirthMonth(e.currentTarget.firstChild?.textContent as string); 
    };
    
    const handleCountrySelectChange = (e: React.MouseEvent<HTMLDivElement>) => {
        setSelectedCountry({
            value: e.currentTarget.getAttribute('data-value') as string,
            content: e.currentTarget.textContent as string
        }); 
    };
    
    const onSubmit: SubmitHandler<FinishRegistrationFormData> = async (data) =>{
        if (currentPage === 'username') {
            const { birthDay, birthYear } = data;

            if (!birthMonth) {
                setHelperMessages(prev => ({
                    ...prev,
                    birthDate: {
                        text: t('registration.form.helper_texts.birth_date.error_texts.invalid'),
                        danger: true
                    }
                }));
                return;
            }

            const birthDate = validateBirthDate(
                birthDay, birthMonth, birthYear, months, t, setHelperMessages
            );
            setBirthDate(birthDate ? birthDate : null);

            if (!selectedCountry) {
                setHelperMessages(prev => ({
                    ...prev,
                    country: {
                        text: t('registration.form.helper_texts.country.error_texts.invalid'),
                        danger: true
                    }
                }));
                return;
            } else {
                setHelperMessages(prev => ({
                    ...prev,
                    country: undefined
                }));
            }

            if (birthDate) {
                const request = await postRequest('/auth/finish_registration/primary_data_check', {
                    ...data,
                    birthDate,
                    country: countryData,
                    token: token
                });
                if (request.error) {
                    const errorMessages: HelperMessages = {};
                    if (request.error.includes('username')) {
                        errorMessages.username = { 
                            text: t('registration.form.helper_texts.username.error_texts.in_use'), 
                            danger: true 
                        };
                        setHelperMessages(prev => ({ ...prev, ...errorMessages }));
                        return;
                    }
                    if (request.error.includes('token')) {
                        errorMessages.username = { 
                            text: request.error, 
                            danger: true 
                        };
                        setHelperMessages(prev => ({ ...prev, ...errorMessages }));
                        return;
                    }
                    if (request.error.includes('country')) {
                        errorMessages.country = { 
                            text: t('registration.form.helper_texts.country.error_texts.invalid'), 
                            danger: true 
                        };
                        setHelperMessages(prev => ({ ...prev, ...errorMessages }));
                        return;
                    }
                } else {
                    setCurrentPage('type');
                    setUsername(data.username);
                    navigate(window.location.pathname, { replace: true });
                }
            }
        }
        if (currentPage === 'type') {
            if (birthDate) {
                await postRequest('/auth/finish_registration', {
                    username: username,
                    token: token,
                    birthDate: birthDate,
                    country: countryData,
                    registrationType: registrationType
                });
                navigate('/login');
            }
        }
    };  


    return (
        <div className='auth-component relative flex column'>
            <main className='auth-content flex items-center content-center'>
                <section className='auth-content-wrapper flex items-center content-center column'>
                    <div className='auth-login-content' style={ currentPage === 'type' ? { width: 'auto' } : {} }>
                        <div className='auth-content-title-wrapper flex column items-center'>
                            <h1 className='auth-title text-center'>{t('finish_registration.header')}</h1>
                            {currentPage === 'type' && (
                                <span className='margin-top-5' style={{ 
                                    fontSize: 14, 
                                    color: 'var(--secondary-200)'
                                }}>
                                    {t('finish_registration.description')}
                                </span>
                            )}
                        </div>
                        <form className='auth-login-form flex column' onSubmit={handleSubmit(onSubmit)}>
                            {currentPage === 'username' ? (
                                <div style={{ maxWidth: 375 }}>
                                    <InputField 
                                        required
                                        headText={t('finish_registration.input_field.header')}
                                        inputType={'text'}
                                        inputName={'username'}
                                        register={register}
                                        defaultValue={username ? username : undefined}
                                        helperMessage={helperMessages?.['username']}
                                        {...(!helperMessages?.['username']?.danger && {
                                            onFocus: handleInputOnFocus,
                                            onBlur: handleInputOnBlur
                                        })}
                                        onInput={(e) => {
                                            setUsername(e.currentTarget.value);
                                            handleUsernameInput(e, t('registration.form.helper_texts.username.general'), setHelperMessages);
                                        }}
                                    />
                                    <div className='flex column margin-top-20'>
                                        <span className={'bd-header'}>
                                            {t('registration.form.input_fields.birth_date.header')}
                                        </span>
                                        <div className={`bd-field-content-wrapper flex space-between`}>
                                            <Selection 
                                                selectClassName={'auth-selection'}
                                                defaultValue={t('basic.date.month', { ns: 'translation' })}
                                                selectedValue={birthMonth}
                                                options={months}
                                                optionsWrapperClassname={'auth-selection-wrapper'}
                                                optionClassname={'auth-selection-option'}
                                                onOptionClick={handleSelectChange}
                                            />
                                            <div className={`bd-field-inps-wrapper flex`}>
                                                <Input 
                                                    required
                                                    type='number'
                                                    placeHolder={t('basic.date.day', { ns: 'translation' })}
                                                    {...register('birthDay', { required: true })}
                                                    className={`bd-input day`}
                                                />
                                                <Input
                                                    required
                                                    type='number'
                                                    placeHolder={t('basic.date.year', { ns: 'translation' })}
                                                    {...register('birthYear', { required: true })}
                                                    className={`bd-input year`}
                                                />
                                            </div>
                                        </div>
                                        <div className={`field-helper-wrapper ${helperMessages['birthDate']?.danger ? 'error' : ''} field-input-helper-wrapper`}>
                                            <span className={`field-helper field-input-helper ${helperMessages['birthDate']?.danger ? 'danger-color' : ''}`}>{helperMessages['birthDate']?.text}</span>
                                        </div>
                                    </div>
                                    <div className='flex column margin-top-20'>
                                        <span className={'bd-header'}>
                                            {t('registration.form.input_fields.country.header')}
                                        </span>
                                        <Selection 
                                            selectStyle={{ width: '100%' }}
                                            selectClassName={'auth-selection'}
                                            defaultValue={t('registration.form.input_fields.country.placeholder')}
                                            selectedValue={selectedCountry?.content as string}
                                            {...(countryList ? {
                                                options: Object.keys(countryList).map((code) => {
                                                    return {
                                                        value: code, content: countryList[code]
                                                    }
                                                })
                                            } : {})}
                                            optionsWrapperClassname={'auth-selection-wrapper'}
                                            optionClassname={'auth-selection-option'}
                                            onOptionClick={handleCountrySelectChange}
                                        />
                                        <div className={`field-helper-wrapper ${helperMessages['country']?.danger ? 'error' : ''} field-input-helper-wrapper`}>
                                            <span className={`field-helper field-input-helper ${helperMessages['country']?.danger ? 'danger-color' : ''}`}>{helperMessages['country']?.text}</span>
                                        </div>
                                    </div>
                                    <div className={`${styles['submit-buttons-wrapper']} flex margin-top-30`}>
                                        <Button 
                                            innerElement={t('finish_registration.buttons.cancel')}
                                            className={styles['button']}
                                            onClick={() => navigate('/login')}
                                        />
                                        <SubmitButton 
                                            isLoading={loading}
                                            innerElement={t('finish_registration.buttons.next')}
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
                                                    <span className='margin-left-5'>{t('basic.back', { ns: 'translation' })}</span>
                                                </span>
                                            }
                                            className={styles['button']}
                                            onClick={() => setCurrentPage('username')}
                                        />
                                        <SubmitButton 
                                            isLoading={loading}
                                            innerElement={t('finish_registration.buttons.submit')}
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