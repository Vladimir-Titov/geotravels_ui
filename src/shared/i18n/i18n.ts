import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import authEn from './locales/en/auth.json'
import commonEn from './locales/en/common.json'
import tripsEn from './locales/en/trips.json'
import authRu from './locales/ru/auth.json'
import commonRu from './locales/ru/common.json'
import tripsRu from './locales/ru/trips.json'

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['en', 'ru'],
        resources: {
            en: {
                common: commonEn,
                auth: authEn,
                trips: tripsEn,
            },
            ru: {
                common: commonRu,
                auth: authRu,
                trips: tripsRu,
            },
        },
        ns: ['common', 'auth', 'trips'],
        defaultNS: 'common',
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n
