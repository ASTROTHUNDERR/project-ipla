import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    placeHolder?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ placeHolder, ...props }, ref) => {
    return <input placeholder={placeHolder} ref={ref} {...props} />;
});

export default Input;