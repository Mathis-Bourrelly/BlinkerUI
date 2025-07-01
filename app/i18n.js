import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '@/locales/en/translation.json';
import fr from '@/locales/fr/translation.json';
import jp from '@/locales/jp/translation.json';

i18n
/*    .use({
        type: 'languageDetector',
        async: true,
        detect: async function (callback) {
            await AsyncStorage.getItem('settings.lang')
                .then(language => callback(language || 'en'))
                .catch(() => callback('en'));
        },
        cacheUserLanguage: function (language) {
            AsyncStorage.setItem('settings.lang', language).catch((error) => {
                console.error('Error saving language', error);
            });
        },
    })*/
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            fr: { translation: fr },
            jp: { translation: jp },
        },
        lng: 'fr', // Langue par défaut
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // Pour éviter les XSS dans React
        },
        detection: {
            order: ['asyncStorage'],
            caches: ['asyncStorage'],
        },
    });

export default i18n;
