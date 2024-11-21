import jwt from 'jsonwebtoken';
import countries from 'i18n-iso-countries';

import type { User } from '../models';

export function generateAccessToken(user: User) {
    return jwt.sign(
        { id: user.id, email: user.email }, 
        process.env.ACCESS_TOKEN_SECRET as string, 
        { expiresIn: '10m' }
    );
};

export function generateRefreshToken(user: User): string {
    return jwt.sign(
        { id: user.id, email: user.email }, 
        process.env.REFRESH_TOKEN_SECRET as string, 
        { expiresIn: '1h' }
    );
};

export function checkBirthDate(birthDate: Date) {
    if (isNaN(birthDate.getTime())) {
        return false; 
    } else {
        const today = new Date();

        if (birthDate > today) {
            return false;
        } else {
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();
            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 0 || age > 50) {
                return false;
            } else {
                return true;
            }
        }
    }
};

export async function loadCountriesInLanguage(language: string) {
    try {
        const module = await import(`i18n-iso-countries/langs/${language}.json`);
        const countryData = module.default;
        countries.registerLocale(countryData);
    } catch (error) {
        console.error('Error loading country names for language:', language, error);
    }
};

export async function checkCountry(country: {
    locale: "en" | "ka";
    value: string;
    content: string
}) {
    const countryList = countries.getNames(country.locale);
    const exists = countryList[country.value] ? countryList[country.value] === country.content : false;
    
    return exists;
};