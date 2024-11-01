import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    type?: 'button' | 'submit' | 'reset';
    innerElement: string | React.ReactNode;
    className?: string;
}

const Button: React.FC<Props> = ({ 
    type, 
    innerElement,
    className,
    ...rest
}) => {
    return (
        <button 
            {...type ? {type: type} : {type: 'button'}}
            className={className}
            {...rest}
        >
            {innerElement}
        </button>
    )
};

export default Button;