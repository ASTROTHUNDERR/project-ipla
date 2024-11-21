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
import { registrationFormSchema, RegistrationFormData, HelperMessages } from '../../../types';
import { loadCountriesInLanguage } from '../../../../../utils/language/countries';

import Button from '../../../../../components/Button';
import Input from '../../../../../components/Input';
import SubmitButton from '../../../../../components/SubmitButton';
import InputField from '../../../../../components/InputField';
import Selection from '../../../../../components/Selection';

export default function RegistrationFormPage() {
    const { registrationType } = useRegistrationContext();
    const { t, i18n } = useTranslation(['registration', 'translation']);
    const navigate = useNavigate(); 
    const { loading, postRequest } = useApi();

    const { register, handleSubmit, setValue, formState: { errors }  } = useForm<RegistrationFormData>({ 
        resolver: zodResolver(registrationFormSchema)
    });

    const [helperMessages, setHelperMessages] = useState<HelperMessages>({
        username: { text: t('registration.form.helper_texts.username.general'), danger: false },
        email: undefined,
        birthDate: undefined,
        country: undefined,
        password: { text: t('registration.form.helper_texts.password.general'), danger: false },
    });
    const [birthMonth, setBirthMonth] = useState<string | null>(null);
    const [countryList, setCountryList] = useState<any | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<{ value: string, content: string } | null>(null);

    const months: { value: string, content: string }[] = t('basic.months', { ns: 'translation', returnObjects: true }) as { value: string, content: string }[];
    
    useEffect(() => {
        async function loadCountries() {
            await loadCountriesInLanguage(i18n.language);
            const countriesInLanguage = countries.getNames(i18n.language);
            setCountryList(countriesInLanguage);
        }

        loadCountries()
    }, [i18n.language])

    useEffect(() => {
        setHelperMessages(prev => ({
            ...prev,
            username: errors.username && errors.username.message
                ? { text: t(errors.username.message), danger: true }
                : { text: t('registration.form.helper_texts.username.general'), danger: false },
            email: errors.email && errors.email.message
                ? { text: t(errors.email.message), danger: true }
                : undefined,
            password: errors.password && errors.password.message
                ? { text: t(errors.password.message), danger: true }
                : { text: t('registration.form.helper_texts.password.general'), danger: false },
            birthDate: (errors.birthYear || errors.birthDay) 
                ? { text: t('registration.form.helper_texts.birth_date.error_texts.unreal'), danger: true }
                : prev.birthDate,
        }));
    }, [errors, t]);  
    
    useEffect(() => {
        if (selectedCountry) {
            setValue('country', {
                ...selectedCountry,
                locale: i18n.language as 'en' | 'ka',
            });
        }
    }, [selectedCountry, i18n.language, setValue])

    const handleMonthSelectChange = (e: React.MouseEvent<HTMLDivElement>) => {
        setBirthMonth(e.currentTarget.textContent as string); 
    };

    const handleCountrySelectChange = (e: React.MouseEvent<HTMLDivElement>) => {
        setSelectedCountry({
            value: e.currentTarget.getAttribute('data-value') as string,
            content: e.currentTarget.textContent as string
        }); 
    };

    const onSubmit: SubmitHandler<RegistrationFormData> = async (data, event) => {
        if (event && event.target instanceof HTMLFormElement) {
            const activeElement = document.activeElement;
            if (activeElement instanceof HTMLInputElement) {
                activeElement.blur();
            }
        }
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

        const birthDate = functions.validateBirthDate(
            birthDay, birthMonth, birthYear, months, t, setHelperMessages
        );

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
            const request = await postRequest('/auth/register', {
                ...data,
                birthDate,
                type: registrationType
            });
            if (request.error) {
                const errorMessages: HelperMessages = {};
                if (request.error.includes('username')) {
                    errorMessages.username = {
                        text: t('registration.form.helper_texts.username.error_texts.in_use'),
                        danger: true,
                    };
                    setHelperMessages(prev => ({ ...prev, ...errorMessages }));
                    return;
                }
                if (request.error.includes('email')) {
                    errorMessages.email = {
                        text: t('registration.form.helper_texts.email.error_texts.in_use'),
                        danger: true,
                    };
                    setHelperMessages(prev => ({ ...prev, ...errorMessages }));
                    return;
                }
                if (request.error.includes('strong')) {
                    errorMessages.email = {
                        text: t('registration.form.helper_texts.password.error_texts.strong'),
                        danger: true,
                    };
                    setHelperMessages(prev => ({ ...prev, ...errorMessages }));
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
                            <h1 className='auth-title'>{t('registration.intro.header')}</h1>
                            <span className='auth-title-sp'>{functions.capitalizeWords(registrationType)}</span>
                        </div>
                        <Button 
                            innerElement={
                                <span className='flex row items-center content-center'>
                                    <ChevronLeftIcon width={16} height={16} />
                                    <span className='margin-left-5'>{t('basic.back', { ns: 'translation' })}</span>
                                </span>
                            }
                            className={`auth-back-button form flex items-center ${styles['intro-back-button']}`}
                            onClick={() => navigate('/register')}
                        />
                    </div>
                    <form className='auth-login-form flex column' onSubmit={handleSubmit(onSubmit)}>
                        <InputField 
                            required
                            headText={t('registration.form.input_fields.username.header')}
                            inputType={'text'}
                            inputName={'username'}
                            register={register}
                            helperMessage={helperMessages['username']}
                            {...!helperMessages['username']?.danger ? {
                                onFocus: functions.handleInputOnFocus,
                                onBlur: functions.handleInputOnBlur
                            } : {}}
                            onInput={(e) => functions.handleUsernameInput(
                                e, 
                                t('registration.form.helper_texts.username.general'), 
                                setHelperMessages
                            )}
                        />
                        <InputField 
                            required
                            headText={t('registration.form.input_fields.email.header')}
                            inputType={'email'}
                            inputName={'email'}
                            register={register}
                            className='margin-top-20'
                            helperMessage={helperMessages['email']}
                        />
                        <InputField 
                            required
                            headText={t('registration.form.input_fields.password.header')}
                            inputType={'password'}
                            inputName={'password'}
                            register={register}
                            className='margin-top-20'
                            helperMessage={helperMessages['password']}
                            {...!helperMessages['password']?.danger ? {
                                onFocus: functions.handleInputOnFocus,
                                onBlur: functions.handleInputOnBlur
                            } : {}}
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
                                    onOptionClick={handleMonthSelectChange}
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
                        <SubmitButton 
                            isLoading={loading}
                            innerElement={t('registration.form.submit_button')}
                            className='auth-submit-btn margin-top-30'
                        />
                    </form>
                    <div className='auth-helper-wrapper bottom'>
                        <span>{t('registration.form.footer.text')}</span>
                        <a href="/login">{t('registration.form.footer.button_text')}</a>
                    </div>
                </div>
            </section>
        </main>
    )
};