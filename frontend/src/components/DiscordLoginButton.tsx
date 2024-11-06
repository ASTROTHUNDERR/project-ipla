import React from 'react';
import Button from './Button';
import { ReactComponent as DiscordIcon } from '../assets/icons/brands/discord-mark-blue.svg';

const DiscordLoginButton: React.FC = () => {
    const Login = () => {
        window.location.href = `http://localhost:3011/api/auth/discord`;
    }

    return (
        <Button 
            innerElement={
                <span className='flex items-center content-center'>
                    <DiscordIcon width={18} height={18} />
                    <span className='margin-left-10'>Sign in with Discord</span>
                </span>
            }
            className='auth-signin-option-btn'
            onClick={() => Login()}
        />
    );
};

export default DiscordLoginButton;