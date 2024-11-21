import countries from 'i18n-iso-countries';

export const loadCountriesInLanguage = async (language: string) => {
    try {
        const module = await import(`i18n-iso-countries/langs/${language}.json`);
        const countryData = module.default;
        countries.registerLocale(countryData);
    } catch (error) {
        console.error('Error loading country names for language:', language, error);
    }
};