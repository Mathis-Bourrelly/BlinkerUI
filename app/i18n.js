import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en/translation.json';
import fr from '@/locales/fr/translation.json';

i18n
    .use(initReactI18next) // Liaison avec react-i18next
    .init({
        resources: {
            en: { translation: en },
            fr: { translation: fr },
        },
        lng: 'fr', // Langue par défaut
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // Pour éviter les XSS dans React
        },
    });

export default i18n;
