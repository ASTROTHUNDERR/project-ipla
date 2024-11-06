import React from 'react';
import Button from './Button';
import { ReactComponent as GoogleIcon } from '../assets/icons/brands/google-icon-logo.svg';

const GoogleLoginButton: React.FC = () => {
    const Login = () => {
        window.location.href = `http://localhost:3011/api/auth/google`;
    }

    return (
        <Button 
            innerElement={
                <span className='flex items-center content-center'>
                    <GoogleIcon width={18} height={18} />
                    <span className='margin-left-10'>Sign in with Google</span>
                </span>
            }
            className='auth-signin-option-btn'
            onClick={() => Login()}
        />
    );
};

export default GoogleLoginButton;