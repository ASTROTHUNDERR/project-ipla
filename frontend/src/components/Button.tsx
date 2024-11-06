import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    Ref?: React.MutableRefObject<HTMLButtonElement | null>;
    type?: 'button' | 'submit' | 'reset';
    innerElement: string | React.ReactNode;
    className?: string;
}

const Button: React.FC<Props> = ({ 
    Ref,
    type, 
    innerElement,
    className,
    ...rest
}) => {
    return (
        <button 
            ref={Ref}
            {...type ? {type: type} : {type: 'button'}}
            className={className}
            {...rest}
        >
            {innerElement}
        </button>
    )
};

export default Button;