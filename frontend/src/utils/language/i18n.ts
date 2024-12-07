import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import generalEN from '../../locales/en/general.json';
import generalKA from '../../locales/ka/general.json';

import footersEN from '../../locales/en/footers.json';
import footersKA from '../../locales/ka/footers.json';

import supportEN from '../../locales/en/support.json';
import supportKA from '../../locales/ka/support.json';

import loginEN from '../../locales/en/auth/login.json';
import registrationEN from '../../locales/en/auth/registration.json';
import passwordResetEN from '../../locales/en/auth/password_reset.json';
import resetPasswordEN from '../../locales/en/auth/reset_password.json';
import emailChangeVerificationEN from '../../locales/en/auth/email_change.json';

import loginKA from '../../locales/ka/auth/login.json';
import registrationKA from '../../locales/ka/auth/registration.json';
import passwordResetKA from '../../locales/ka/auth/password_reset.json';
import resetPasswordKA from '../../locales/ka/auth/reset_password.json';
import emailChangeVerificationKA from '../../locales/ka/auth/email_change.json';

import sidebarEN from '../../locales/en/sidebar.json';
import sidebarKA from '../../locales/ka/sidebar.json';

import settingsEN from '../../locales/en/settings/general.json';
import settingsAccountEN from '../../locales/en/settings/account.json';
import settingsProfileEN from '../../locales/en/settings/profile.json';

import settingsKA from '../../locales/ka/settings/general.json';
import settingsAccountKA from '../../locales/ka/settings/account.json';
import settingsProfileKA from '../../locales/ka/settings/profile.json';

const resources = {
    en: { 
        translation: generalEN,
        footers: footersEN,
        support: supportEN,
        auth: {
            login: loginEN,
            registration: registrationEN,
            passwordReset: passwordResetEN,
            resetPassword: resetPasswordEN,
            emailChange: emailChangeVerificationEN
        },
        sidebar: sidebarEN,
        settings: {
            general: settingsEN,
            account: settingsAccountEN,
            profile: settingsProfileEN
        },
    },
    ka: { 
        translation: generalKA,
        footers: footersKA,
        support: supportKA,
        auth: {
            login: loginKA,
            registration: registrationKA,
            passwordReset: passwordResetKA,
            resetPassword: resetPasswordKA,
            emailChange: emailChangeVerificationKA
        },
        sidebar: sidebarKA,
        settings: {
            general: settingsKA,
            account: settingsAccountKA,
            profile: settingsProfileKA
        }
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
        // keySeparator: '.',
        // nsSeparator: ':',
    });
  
export default i18n;