import { useTranslation } from 'react-i18next';
import { UseFormReturn, SubmitHandler } from 'react-hook-form';

import { HelperMessages, RegistrationSecondStepFormData } from '../../../../types';

import InputField from '../../../../../../components/InputField';
import Input from '../../../../../../components/Input';
import Selection from '../../../../../../components/Selection';
import SubmitButton from '../../../../../../components/SubmitButton';

type Props = {
    methods: UseFormReturn<RegistrationSecondStepFormData, any, undefined>;
    helperMessages: HelperMessages;
    setHelperMessages: React.Dispatch<React.SetStateAction<HelperMessages>>;
    onBlur(e: React.FocusEvent<HTMLInputElement>): void;
    onFocus(e: React.FocusEvent<HTMLInputElement>): void;
    handleRegexInput(
        event: React.FormEvent<HTMLInputElement>, 
        regex: RegExp, 
        fieldName: string, 
        validationMessage: string, 
        setHelperMessages: (value: React.SetStateAction<HelperMessages>) => void
    ): boolean;
    // Form Data
    birthMonth: string | null;
    handleMonthSelectChange: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleCountrySelectChange: (e: React.MouseEvent<HTMLDivElement>) => void;
    selectedCountry: {
        value: string;
        content: string;
    } | null;
    countryList: any;

    isLoading: boolean;
    onSubmit: SubmitHandler<RegistrationSecondStepFormData>;
}

export default function SecondStepForm({
    methods,
    helperMessages,
    setHelperMessages,
    onBlur, 
    onFocus,
    handleRegexInput,

    birthMonth,
    handleMonthSelectChange,
    handleCountrySelectChange,
    selectedCountry,
    countryList,

    isLoading,
    onSubmit
}: Props) {
    const { t } = useTranslation('auth');

    const months: { value: string, content: string }[] = t('months', { ns: 'translation', returnObjects: true }) as { value: string, content: string }[];

    return (
        <form
            className='auth-login-form flex column'
            onSubmit={methods.handleSubmit(onSubmit)}
        >
            <InputField 
                required
                headText={t('registration.registration.form.input_fields.username.header')}
                inputType={'text'}
                inputName={'username'}
                inputId='username'
                register={methods.register}
                autoComplete='username'
                helperMessage={helperMessages['username']}
                {...!helperMessages['username']?.danger ? {
                    onFocus: onFocus,
                    onBlur: onBlur
                } : {}}
                onInput={(e) => handleRegexInput(
                    e, 
                    /^[a-zA-Z0-9_]*$/,
                    'username',
                    t('registration.registration.form.helper_texts.username.general'), 
                    setHelperMessages
                )}
            />
            <InputField 
                required
                headText={t('registration.registration.form.input_fields.email.header')}
                inputType={'email'}
                inputName={'email'}
                inputId='email'
                register={methods.register}
                autoComplete='email'
                className='margin-top-20'
                helperMessage={helperMessages['email']}
            />
            <InputField 
                required
                headText={t('registration.registration.form.input_fields.password.header')}
                inputType={'password'}
                inputName={'password'}
                inputId='password'
                register={methods.register}
                className='margin-top-20'
                autoComplete='current-password'
                helperMessage={helperMessages['password']}
                {...!helperMessages['password']?.danger ? {
                    onFocus: onFocus,
                    onBlur: onBlur
                } : {}}
            />
            <div className='flex column margin-top-20'>
                <span className={'bd-header'}>
                    {t('registration.registration.form.input_fields.birth_date.header')}
                </span>
                <div className={`bd-field-content-wrapper flex space-between`}>
                    <Selection 
                        selectClassName={'auth-selection'}
                        defaultValue={t('date.month', { ns: 'translation' })}
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
                            placeHolder={t('date.day', { ns: 'translation' })}
                            {...methods.register('birthDay', { required: true })}
                            className={`bd-input day`}
                        />
                        <Input
                            required
                            type='number'
                            placeHolder={t('date.year', { ns: 'translation' })}
                            {...methods.register('birthYear', { required: true })}
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
                    {t('registration.registration.form.input_fields.country.header')}
                </span>
                <Selection 
                    selectStyle={{ width: '100%' }}
                    selectClassName={'auth-selection'}
                    defaultValue={t('registration.registration.form.input_fields.country.placeholder')}
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
                isLoading={isLoading}
                innerElement={t('registration.registration.form.submit_button')}
                className='auth-submit-btn margin-top-30'
            />
        </form>
    )
}