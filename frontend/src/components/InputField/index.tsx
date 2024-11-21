import './styles.css';
import React from 'react';
import { UseFormRegister } from 'react-hook-form';

import Input from '../Input';

interface Props {
    headText: string;
    inputType: string;
    placeHolder?: string;
    required?: boolean;
    className?: string;
    inputName: string;
    defaultValue?: string;
    helperMessage?: { text: string, danger: boolean };
    register: UseFormRegister<any>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onInput?: React.FormEventHandler<HTMLInputElement>;
}

export default function InputField({
    headText,
    inputType,
    placeHolder,
    required,
    className,
    inputName,
    defaultValue,
    helperMessage,
    register,
    onFocus,
    onBlur,
    onInput
}: Props) {
    return (
        <div className={`input-field flex column ${className ? className : ''}`}>
            <label className={'field-head'}>{headText}</label>
            <Input 
                type={inputType}
                {...register(inputName, { required })} 
                placeholder={placeHolder}
                required={required}
                className={'field-input'}
                name={inputName}
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