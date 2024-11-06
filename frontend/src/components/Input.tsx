import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    placeHolder?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ ...props }, ref) => {
    return <input ref={ref} {...props} />;
});

export default Input;