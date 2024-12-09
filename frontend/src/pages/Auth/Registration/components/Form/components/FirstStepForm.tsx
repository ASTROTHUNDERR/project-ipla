import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { HelperMessages, RegistrationFirstStepFormData } from '../../../../types';

import InputField from '../../../../../../components/InputField';
import SubmitButton from '../../../../../../components/SubmitButton';

type Props = {
    methods: UseFormReturn<{
        firstName: string;
        lastName: string;
        nativeName?: string | undefined;
    }, any, undefined>;
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
    isLoading: boolean;
    onSubmit: SubmitHandler<RegistrationFirstStepFormData>;
}

export default function FirstStepForm({ 
    methods,
    helperMessages,
    setHelperMessages,
    onBlur, 
    onFocus,
    handleRegexInput,
    isLoading,
    onSubmit
}: Props) {
    const { t } = useTranslation('auth');

    return (
        <form 
            className='auth-login-form flex column'
            onSubmit={methods.handleSubmit(onSubmit)}
        >
            <InputField 
                required
                headText={t('registration.registration.form.input_fields.first_name.header')}
                requiredHeader
                inputType={'text'}
                inputName={'firstName'}
                inputId='firstName'
                register={methods.register}
                autoComplete='given-name'
                helperMessage={helperMessages['firstName']}
                {...!helperMessages['firstName']?.danger ? {
                    onFocus: onFocus,
                    onBlur: onBlur
                } : {}}
                onInput={(e) => handleRegexInput(
                    e, 
                    /^[a-zA-Z\s'-]*$/,
                    'firstName',
                    t('registration.registration.form.helper_texts.first_name.general'),
                    setHelperMessages
                )}
            />
            <InputField 
                required
                headText={t('registration.registration.form.input_fields.last_name.header')}
                requiredHeader
                inputType={'text'}
                inputName={'lastName'}
                inputId='lastName'
                register={methods.register}
                autoComplete='family-name'
                className='margin-top-20'
                helperMessage={helperMessages['lastName']}
                {...!helperMessages['lastName']?.danger ? {
                    onFocus: onFocus,
                    onBlur: onBlur
                } : {}}
                onInput={(e) => handleRegexInput(
                    e, 
                    /^[a-zA-Z\s'-]*$/,
                    'lastName',
                    t('registration.registration.form.helper_texts.last_name.general'),
                    setHelperMessages
                )}
            />
            <InputField 
                headText={t('registration.registration.form.input_fields.native_name.header')}
                inputType={'text'}
                inputName={'nativeName'}
                inputId='nativeName'
                register={methods.register}
                autoComplete='name'
                className='margin-top-20'
                helperMessage={helperMessages['nativeName']}
                {...!helperMessages['nativeName']?.danger ? {
                    onFocus: onFocus,
                    onBlur: onBlur
                } : {}}
            />
            <SubmitButton 
                isLoading={isLoading}
                innerElement={t('general_words.next', { ns: 'translation' })}
                className='auth-submit-btn margin-top-30'
            />
        </form>
    )   
};