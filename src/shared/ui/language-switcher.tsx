import { useTranslation } from 'react-i18next'
import './language-switcher.css'

const LANGUAGES = ['en', 'ru'] as const

export const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation('common')
    const currentLanguage = i18n.resolvedLanguage ?? i18n.language

    return (
        <div className="tm-language-switcher" role="group" aria-label={t('aria.languageSwitcher')}>
            {LANGUAGES.map((language) => (
                <button
                    key={language}
                    type="button"
                    className={
                        currentLanguage === language
                            ? 'tm-language-switcher__button is-active'
                            : 'tm-language-switcher__button'
                    }
                    onClick={() => void i18n.changeLanguage(language)}
                    aria-pressed={currentLanguage === language}
                >
                    {t(`language.${language}`)}
                </button>
            ))}
        </div>
    )
}
