import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../../locales/en/translation.json';
import loginEN from '../../locales/en/auth/login.json';
import registrationEN from '../../locales/en/auth/registration.json';
import passwordResetEN from '../../locales/en/auth/password_reset.json';
import resetPasswordEN from '../../locales/en/auth/reset_password.json';

import translationKA from '../../locales/ka/translation.json';
import loginKA from '../../locales/ka/auth/login.json';
import registrationKA from '../../locales/ka/auth/registration.json';
import passwordResetKA from '../../locales/ka/auth/password_reset.json';
import resetPasswordKA from '../../locales/ka/auth/reset_password.json';

const resources = {
    en: { 
        translation: translationEN,
        login: loginEN,
        registration: registrationEN,
        passwordReset: passwordResetEN,
        resetPassword: resetPasswordEN
    },
    ka: { 
        translation: translationKA,
        login: loginKA,
        registration: registrationKA,
        passwordReset: passwordResetKA,
        resetPassword: resetPasswordKA
    },
};
  
const savedLanguage = localStorage.getItem('language') || 'en'; 

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
    });
  
export default i18n;