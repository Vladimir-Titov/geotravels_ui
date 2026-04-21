import '@testing-library/jest-dom/vitest'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import authEn from '../../public/locales/en/auth.json'
import commonEn from '../../public/locales/en/common.json'
import myTravelsEn from '../../public/locales/en/myTravels.json'

if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        lng: 'en',
        fallbackLng: 'en',
        resources: {
            en: {
                common: commonEn,
                auth: authEn,
                myTravels: myTravelsEn,
            },
        },
        ns: ['common', 'auth', 'myTravels'],
        defaultNS: 'common',
        interpolation: {
            escapeValue: false,
        },
    }, () => undefined)
}
