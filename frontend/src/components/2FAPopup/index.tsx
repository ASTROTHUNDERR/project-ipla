import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { use2FA } from '../../context/TwoFactorAuthProvider';

import WindowPopup from '../WindowPopup';
import InputField from '../InputField';

const formSchema = z.object({
    token: z.string()
        .min(6, 'account.popups.add_two_factor_auth_app.qr_code.helper_texts.token.general')
        .max(6, 'account.popups.add_two_factor_auth_app.qr_code.helper_texts.token.general')
});

type Props = {
    headerText: string;
    inputFieldHeader: string;
    inputFieldPlaceholder?: string;
    cancelButtonText: string;
    onCancel: () => void;
    submitButtonIsLoading: boolean;
    submitButtonText: string;
    onSubmit: SubmitHandler<{
        token: string;
    }>;
}

export default function TwoFactorAuthPopup({
    headerText,
    inputFieldHeader,
    inputFieldPlaceholder,
    cancelButtonText,
    onCancel,
    submitButtonIsLoading,
    submitButtonText,
    onSubmit
}: Props) {
    const { t } = useTranslation();
    const { helperMessages, setHelperMessages } = use2FA();

    const { register, handleSubmit, formState: { errors }  } = useForm<{ token: string }>({
        resolver: zodResolver(formSchema)
    });

    
    useEffect(() => {
        if (errors) {
            setHelperMessages({
                token: errors.token && errors.token.message
                    ? { text: t(errors.token.message, { ns: 'settings' }), danger: true }
                    : undefined
            })
        }
    }, [errors, t, setHelperMessages])

    return (
        <WindowPopup 
            width={400}
            header={headerText}
            content={
                <div className='flex column'>
                    <InputField 
                        required
                        headText={inputFieldHeader}
                        placeHolder={inputFieldPlaceholder}
                        inputType='number'
                        inputName='token'
                        inputId='token'
                        className='margin-top-20'
                        register={register}
                        helperMessage={helperMessages?.token}
                    />
                </div>
            }
            cancelButton
            cancelButtonText={cancelButtonText}
            cancelButtonOnClick={onCancel}
            submitLoading={submitButtonIsLoading}
            submitButtonInnerElement={submitButtonText}
            onFormSubmit={handleSubmit(onSubmit)}
        />
    )
};