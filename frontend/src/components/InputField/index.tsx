import './styles.css';
import React from 'react';
import { UseFormRegister } from 'react-hook-form';

import Input from '../Input';

interface Props {
    headText: string;
    requiredHeader?: boolean;
    inputType: string;
    placeHolder?: string;
    required?: boolean;
    className?: string;
    inputName: string;
    inputId: string;
    autoComplete?: React.HTMLInputAutoCompleteAttribute;
    defaultValue?: string;
    helperMessage?: { text: string, danger: boolean };
    register: UseFormRegister<any>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onInput?: React.FormEventHandler<HTMLInputElement>;
}

export default function InputField({
    headText,
    requiredHeader,
    inputType,
    placeHolder,
    required,
    className,
    inputName,
    inputId,
    autoComplete,
    defaultValue,
    helperMessage,
    register,
    onFocus,
    onBlur,
    onInput
}: Props) {
    return (
        <div className={`input-field flex column ${className ? className : ''}`}>
            <label htmlFor={inputId} className={'field-head'}>
                {headText}
                { requiredHeader && (
                    <span className='margin-left-5 danger-color'>*</span>
                ) }
            </label>
            <Input 
                type={inputType}
                {...register(inputName, { required })} 
                placeholder={placeHolder}
                required={required}
                className={'field-input'}
                name={inputName}
                id={inputId}
                autoComplete={autoComplete}
                defaultValue={defaultValue}
                onFocus={onFocus}
                onBlur={onBlur}
                onInput={onInput}
            />
            <div className={`field-helper-wrapper ${helperMessage?.danger ? 'error' : ''} field-input-helper-wrapper`}>
                <span className={`field-helper field-input-helper ${helperMessage?.danger ? 'danger-color' : ''}`}>{helperMessage?.text}</span>
            </div>
        </div>
    )
};