import styles from './EmailChangeVerification.module.css';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../context/ApiProvider';
import { useAuth } from '../../../context/AuthProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function EmailChangeVerification() {
    const { t } = useTranslation('auth');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { protectedPostRequest } = useApi();
    const { user } = useAuth();

    const token = searchParams.get('token');

    const hasRequested = useRef(false);

    useEffect(() => {
        const sendRequest = async () => {
            if (token && !hasRequested.current) {
                hasRequested.current = true; 
                const response = await protectedPostRequest('/user/email-change/verify-current', {
                    token: token,
                });
                if (response.error) {
                    navigate('/');
                }
            }
        };

        if (token && user) {
            sendRequest();
        } else if (!token || !user) {
            navigate('/login');
        }
    }, [token, user, navigate, protectedPostRequest]);


    return (
        <div className='auth-component relative flex column'>
            <header className={`${styles['header']} text-center`}>
                <span>{t('emailChange.email_change_verification.header')}</span>
            </header>
            <div className={styles['wrapper']}>
                <span className={`${styles['content']} text-center`}>{t('emailChange.email_change_verification.content')}</span>
            </div>
            <a href="/" className={`${styles['button']} flex items-center content-center`}>{t('emailChange.email_change_verification.navigate_button')}</a>
        </div>
    );
};
