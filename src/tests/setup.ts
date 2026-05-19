import '@testing-library/jest-dom/vitest'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import authEn from '../shared/i18n/locales/en/auth.json'
import commonEn from '../shared/i18n/locales/en/common.json'
import tripsEn from '../shared/i18n/locales/en/trips.json'

if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        lng: 'en',
        fallbackLng: 'en',
        resources: {
            en: {
                common: commonEn,
                auth: authEn,
                trips: tripsEn,
            },
        },
        ns: ['common', 'auth', 'trips'],
        defaultNS: 'common',
        interpolation: {
            escapeValue: false,
        },
    }, () => undefined)
}
