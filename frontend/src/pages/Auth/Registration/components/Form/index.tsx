import styles from '../../Registration.module.css';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';  
import { useRegistrationContext } from '../../../../../context/RegistrationProvider';
import { useApi } from '../../../../../context/ApiProvider';
import countries from 'i18n-iso-countries';

import { ReactComponent as ChevronLeftIcon } from '../../../../../assets/icons/chevron-left.svg';

import * as functions from '../../../functions';
import { 
    registrationFirstStepSchema,
    RegistrationFirstStepFormData,
    registrationSecondStepFormSchema,
    RegistrationSecondStepFormData,
    HelperMessages
} from '../../../types';
import { loadCountriesInLanguage } from '../../../../../utils/language/countries';

import Button from '../../../../../components/Button';

import FirstStepForm from './components/FirstStepForm';
import SecondStepForm from './components/SecondStepForm';

export default function RegistrationFormPage() {
    const { registrationType } = useRegistrationContext();
    const { t, i18n } = useTranslation(['auth', 'translation']);
    const navigate = useNavigate(); 
    const { loading, postRequest } = useApi();

    const [currentStep, setCurrentStep] = useState<1 | 2>(1);

    const firstStepMethods = useForm<RegistrationFirstStepFormData>({
        resolver: zodResolver(registrationFirstStepSchema),
    });

    const secondStepMethods = useForm<RegistrationSecondStepFormData>({
        resolver: zodResolver(registrationSecondStepFormSchema),
    });

    const [helperMessages, setHelperMessages] = useState<HelperMessages>({
        firstName: { text: t('registration.registration.form.helper_texts.first_name.general'), danger: false },
        lastName: { text: t('registration.registration.form.helper_texts.last_name.general'), danger: false },
        nativeName: { text: t('registration.registration.form.helper_texts.native_name.general'), danger: false },
        username: { text: t('registration.registration.form.helper_texts.username.general'), danger: false },
        email: undefined,
        birthDate: undefined,
        country: undefined,
        password: { text: t('registration.registration.form.helper_texts.password.general'), danger: false },
    });

    const [inpBirthDate, setBirthDate] = useState<{ month?: string, day?: string, year?: string } | null>(null);
    const [countryList, setCountryList] = useState<any | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<{ value: string, content: string } | null>(null);

    const months: { value: string, content: string }[] = t('months', { ns: 'translation', returnObjects: true }) as { value: string, content: string }[];

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
        setHelperMessages(prev => ({
            ...prev,
            username: errors.username && errors.username.message
                ? { text: t(errors.username.message), danger: true }
                : { text: t('registration.registration.form.helper_texts.username.general'), danger: false },
            email: errors.email && errors.email.message
                ? { text: t(errors.email.message), danger: true }
                : undefined,
            password: errors.password && errors.password.message
                ? { text: t(errors.password.message), danger: true }
                : { text: t('registration.registration.form.helper_texts.password.general'), danger: false },
        }));
    }, [secondStepMethods.formState.errors, t]);  
    
    useEffect(() => {
        if (selectedCountry) {
            secondStepMethods.setValue('country', {
                ...selectedCountry,
                locale: i18n.language as 'en' | 'ka'
            });
        }
    }, [selectedCountry, i18n.language, secondStepMethods])

    const handleBirthDateChange = (
        e: React.MouseEvent<HTMLDivElement | null, MouseEvent>, 
        part: 'month' | 'day' | 'year'
    ) => {
        setBirthDate(prevData => 
            prevData && e.currentTarget.textContent
                ? { ...prevData, [part]: e.currentTarget.textContent as string } 
                : { [part]: e.currentTarget.textContent as string }
        )
    };

    const handleCountrySelectChange = (e: React.MouseEvent<HTMLDivElement>) => {
        setSelectedCountry({
            value: e.currentTarget.getAttribute('data-value') as string,
            content: e.currentTarget.textContent as string
        }); 
    };

    const handleNext: SubmitHandler<RegistrationFirstStepFormData> = async (data) => {
        const response = await postRequest('/auth/register/first-step', data);
        if (response.error) {
            const errorResponse = response.error as { 
                message: string,
                path: string[]
            }[];

            const firstNameMessage = errorResponse.find(e => e.path.includes('firstName'))?.message;
            const lastNameMessage = errorResponse.find(e => e.path.includes('lastName'))?.message;
            const nativeNameMessage = errorResponse.find(e => e.path.includes('nativeName'))?.message;
            const translatedText = 'registration.registration.form.helper_texts.first_name.inappropriate';

            setHelperMessages(prevData => ({
                ...prevData,
                firstName: firstNameMessage ? { 
                    text: t(translatedText), danger: true   
                } : prevData.firstName,
                lastName: lastNameMessage ? {
                    text: t(translatedText), danger: true
                } : prevData.lastName,
                nativeName: nativeNameMessage ? {
                    text: t(translatedText), danger: true
                } : prevData.nativeName
            }));
            return;
        } else {
            setCurrentStep(2);
        }
    };

    const handleBack = () => setCurrentStep(1);


    const handleFinalSubmit: SubmitHandler<RegistrationSecondStepFormData> = async (data, event) => {
        if (event && event.target instanceof HTMLFormElement) {
            const activeElement = document.activeElement;
            if (activeElement instanceof HTMLInputElement) {
                activeElement.blur();
            }
        }
        
        const firstStepValues = firstStepMethods.getValues();
        const secondStepValues = secondStepMethods.getValues();

        if (!inpBirthDate || !inpBirthDate.month || !inpBirthDate.day || !inpBirthDate.year) {
            setHelperMessages(prev => ({
                ...prev,
                birthDate: {
                    text: t('registration.registration.form.helper_texts.birth_date.error_texts.invalid'),
                    danger: true
                }
            }));
            return;
        }

        const birthDate = functions.validateBirthDate(
            inpBirthDate.day, inpBirthDate.month, inpBirthDate.year, months, t, setHelperMessages
        );

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
            const request = await postRequest('/auth/register', {
                ...firstStepValues,
                ...secondStepValues,
                birthDate,
                type: registrationType
            });
            console.log(request)
            if (request.error) {
                const errorMessages: HelperMessages = {};
                if (request.error.includes('username')) {
                    errorMessages.username = {
                        text: t('registration.registration.form.helper_texts.username.error_texts.in_use'),
                        danger: true,
                    };
                    setHelperMessages(prev => ({ ...prev, ...errorMessages }));
                    return;
                }
                if (request.error.includes('email')) {
                    errorMessages.email = {
                        text: t('registration.registration.form.helper_texts.email.error_texts.in_use'),
                        danger: true,
                    };
                    setHelperMessages(prev => ({ ...prev, ...errorMessages }));
                    return;
                }
                if (request.error.includes('strong')) {
                    errorMessages.email = {
                        text: t('registration.registration.form.helper_texts.password.error_texts.strong'),
                        danger: true,
                    };
                    setHelperMessages(prev => ({ ...prev, ...errorMessages }));
                    return;
                }

                const errorResponse = request.error as { 
                    message: string,
                    path: string[]
                }[];
    
                const usernameMessage = errorResponse.find(e => e.path.includes('username'))?.message;

                if (usernameMessage) {
                    setHelperMessages(prev => ({
                        ...prev,
                        username: {
                            text: t('registration.registration.form.helper_texts.username.inappropriate'),
                            danger: true
                        }
                    }));
                    return;
                }

            } else {
                navigate('/login');
            }
        }
    };
    
    return (
        <main className='auth-content flex items-center content-center'>
            <section className='auth-content-wrapper flex items-center content-center column'>
                <div className='auth-login-content relative'>
                    <div className={`auth-content-title-wrapper flex content-center text-center flex row ${styles['intro-header']}`}>
                        <div className='flex column items-center'>
                            <h1 className='auth-title'>{t('registration.registration.intro.header')}</h1>
                            <span className='auth-title-sp'>{functions.capitalizeWords(registrationType)}</span>
                        </div>
                        <Button 
                            innerElement={
                                <span className='flex row items-center content-center'>
                                    <ChevronLeftIcon width={16} height={16} />
                                    <span className='margin-left-5'>{t('general_words.back', { ns: 'translation' })}</span>
                                </span>
                            }
                            className={`auth-back-button form flex items-center ${styles['intro-back-button']}`}
                            onClick={() => {
                                if (currentStep === 1) {
                                    navigate('/register')
                                } else {
                                    handleBack();
                                }
                            }}
                        />
                    </div>
                    { currentStep === 1 ? (
                        <FirstStepForm 
                            methods={firstStepMethods}  
                            helperMessages={helperMessages}
                            setHelperMessages={setHelperMessages}
                            onBlur={functions.handleInputOnBlur}
                            onFocus={functions.handleInputOnFocus}
                            handleRegexInput={functions.handleRegexInput}
                            isLoading={loading}
                            onSubmit={handleNext}
                        />
                    ) : (
                        <SecondStepForm 
                            methods={secondStepMethods}  
                            helperMessages={helperMessages}
                            setHelperMessages={setHelperMessages}
                            onBlur={functions.handleInputOnBlur}
                            onFocus={functions.handleInputOnFocus}
                            handleRegexInput={functions.handleRegexInput}
                            birthDate={inpBirthDate}
                            setBirthDate={setBirthDate}
                            handleBirthDateChange={handleBirthDateChange}
                            selectedCountry={selectedCountry}
                            countryList={countryList}
                            handleCountrySelectChange={handleCountrySelectChange}
                            isLoading={loading}
                            onSubmit={handleFinalSubmit}
                        />
                    ) }
                    <div className='auth-helper-wrapper bottom'>
                        <span>{t('registration.registration.form.footer.text')}</span>
                        <a href="/login">{t('registration.registration.form.footer.button_text')}</a>
                    </div>
                </div>
            </section>
        </main>
    )
};