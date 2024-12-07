import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../../../context/ApiProvider';
import countries from 'i18n-iso-countries';

import styles from './FinishRegistration.module.css';
import { 
    HelperMessages, 
    Card, 
    registrationFirstStepSchema,
    RegistrationFirstStepFormData,
    FinishRegistrationSecondStepFormData, 
    finishRegistrationSecondStepFormSchema
} from '../types';
import { handleInputOnFocus, handleInputOnBlur, handleRegexInput, validateBirthDate } from '../functions';
import { loadCountriesInLanguage } from '../../../utils/language/countries';

import { ReactComponent as ChevronLeftIcon } from '../../../assets/icons/chevron-left.svg';

import AuthFooter from '../../../components/Footers/Auth';
import Button from '../../../components/Button';
import RegistrationCard from '../Registration/components/Card';

import FirstStepForm from './components/FirstStepForm';
import SecondStepForm from './components/SecondStepForm';

export default function FinishRegistration() {
    const { t, i18n } = useTranslation(['auth', 'translation']);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { postRequest, loading } = useApi();

    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    // eslint-disable-next-line
    const [token, setToken] = useState<string | null>(searchParams.get('token'));


    const firstStepMethods = useForm<RegistrationFirstStepFormData>({
        resolver: zodResolver(registrationFirstStepSchema)
    });

    const secondStepMethods = useForm<FinishRegistrationSecondStepFormData>({
        resolver: zodResolver(finishRegistrationSecondStepFormSchema)
    });

    const [helperMessages, setHelperMessages] = useState<HelperMessages>({
        firstName: { text: t('registration.registration.form.helper_texts.first_name.general'), danger: false },
        lastName: { text: t('registration.registration.form.helper_texts.last_name.general'), danger: false },
        nativeName: { text: t('registration.registration.form.helper_texts.native_name.general'), danger: false },
        username: { text: t('registration.registration.form.helper_texts.username.general'), danger: false },
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
    const [registrationType, setRegistrationType] = useState<'player' | 'manager' | 'team owner' | undefined>(undefined);

    
    const months: { value: string, content: string }[] = t('months', { ns: 'translation', returnObjects: true }) as { value: string, content: string }[];

    const cards: Card[] = t('registration.registration.intro.cards', { returnObjects: true }) as Card[];
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
        const errors = secondStepMethods.formState.errors;

        setHelperMessages(prevData => {
            const newHelperMessages = { ...prevData };
    
            if (errors.username && errors.username.message) {
                newHelperMessages.username = {
                    text: t(errors.username.message),
                    danger: true
                };
            }
    
            newHelperMessages.birthDate = (errors.birthYear || errors.birthDay)
                ? { text: t('registration.registration.form.helper_texts.birth_date.error_texts.unreal'), danger: true }
                : newHelperMessages.birthDate;
    
            return newHelperMessages;
        });
    }, [t, secondStepMethods]);
    
    useEffect(() => {
        if (!token) {
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

    const handleMonthSelectChange = (e: React.MouseEvent<HTMLDivElement>) => {
        setBirthMonth(e.currentTarget.firstChild?.textContent as string); 
    };
    
    const handleCountrySelectChange = (e: React.MouseEvent<HTMLDivElement>) => {
        setSelectedCountry({
            value: e.currentTarget.getAttribute('data-value') as string,
            content: e.currentTarget.textContent as string
        }); 
    };

    const handleBack = () => setCurrentStep(currentStep - 1 as 1 | 2 | 3);
    
    const handleFirstStepSubmit = () => {
        setCurrentStep(2);
    };

    const handleSecondStepSubmit: SubmitHandler<FinishRegistrationSecondStepFormData> = async (data) => {
        const { birthDay, birthYear } = data;

        if (!birthMonth) {
            setHelperMessages(prev => ({
                ...prev,
                birthDate: {
                    text: t('registration.registration.form.helper_texts.birth_date.error_texts.invalid'),
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
                    text: t('registration.registration.form.helper_texts.country.error_texts.invalid'),
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
            const firstStepData = firstStepMethods.getValues();

            const request = await postRequest('/auth/finish_registration/primary_data_check', {
                ...firstStepData,
                ...data,
                birthDate,
                country: countryData,
                token: token
            });
            if (request.error) {
                const errorMessages: HelperMessages = {};
                if (request.error.includes('username')) {
                    errorMessages.username = { 
                        text: t('registration.registration.form.helper_texts.username.error_texts.in_use'), 
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
                        text: t('registration.registration.form.helper_texts.country.error_texts.invalid'), 
                        danger: true 
                    };
                    setHelperMessages(prev => ({ ...prev, ...errorMessages }));
                    return;
                }
            } else {
                setCurrentStep(3);
                navigate(window.location.pathname, { replace: true });
            }
        }
    };

    const handleFinalSubmit = async () => {
        if (birthDate) {
            const firstStepValues = firstStepMethods.getValues();
            const secondStepValues = secondStepMethods.getValues();

            await postRequest('/auth/finish_registration', {
                token: token,
                ...firstStepValues,
                ...secondStepValues,
                birthDate: birthDate,
                country: countryData,
                registrationType: registrationType
            });
            navigate('/login');
        }
    };

    return (
        <div className='auth-component relative flex column'>
            <main className='auth-content flex items-center content-center'>
                <section className='auth-content-wrapper flex items-center content-center column'>
                    <div className='auth-login-content' style={ currentStep === 3 ? { width: 'auto' } : {} }>
                        <div className='auth-content-title-wrapper flex column items-center'>
                            <h1 className='auth-title text-center'>{t('registration.finish_registration.header')}</h1>
                            {currentStep === 3 && (
                                <span className='margin-top-5' style={{ 
                                    fontSize: 14, 
                                    color: 'var(--secondary-200)'
                                }}>
                                    {t('registration.finish_registration.description')}
                                </span>
                            )}
                        </div>
                        { currentStep === 1 ? (
                            <FirstStepForm 
                                methods={firstStepMethods}  
                                helperMessages={helperMessages}
                                setHelperMessages={setHelperMessages}
                                onBlur={handleInputOnBlur}
                                onFocus={handleInputOnFocus}
                                handleRegexInput={handleRegexInput}
                                isLoading={loading}
                                onSubmit={handleFirstStepSubmit}
                            />
                        ) : currentStep === 2 ? (
                            <SecondStepForm 
                                methods={secondStepMethods}  
                                helperMessages={helperMessages}
                                setHelperMessages={setHelperMessages}
                                onBlur={handleInputOnBlur}
                                onFocus={handleInputOnFocus}
                                handleRegexInput={handleRegexInput}
                                birthMonth={birthMonth}
                                selectedCountry={selectedCountry}
                                countryList={countryList}
                                handleCountrySelectChange={handleCountrySelectChange}
                                handleMonthSelectChange={handleMonthSelectChange}
                                handleBack={handleBack}
                                isLoading={loading}
                                onSubmit={handleSecondStepSubmit}
                            />
                        ) : currentStep === 3 && (
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
                                                <span className='margin-left-5'>{t('general_words.back', { ns: 'translation' })}</span>
                                            </span>
                                        }
                                        className={styles['button']}
                                        onClick={() => setCurrentStep(2)}
                                    />
                                    <Button 
                                        innerElement={t('registration.finish_registration.buttons.submit')}
                                        className={`${styles['button']} ${styles['submit']}`}
                                        onClick={handleFinalSubmit}
                                    />
                                </div>
                            </div>
                        ) }
                    </div>
                </section>
            </main>
            <AuthFooter />
        </div>
    )
};