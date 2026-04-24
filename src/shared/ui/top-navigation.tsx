import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { LanguageSwitcher } from './language-switcher'
import './top-navigation.css'

interface TopNavigationProps {
    onSignOut: () => void
}

export const TopNavigation = ({ onSignOut }: TopNavigationProps) => {
    const { t } = useTranslation('common')

    return (
        <header className="tm-top-nav">
            <div className="tm-top-nav__inner">
                <NavLink to="/visits" className="tm-top-nav__brand" aria-label={t('aria.home')}>
                    <img className="tm-top-nav__brand-logo" src={logo} alt="" aria-hidden="true" />
                    <span>{t('brand')}</span>
                </NavLink>

                <div className="tm-top-nav__actions">
                    <LanguageSwitcher />

                    <button type="button" className="tm-top-nav__logout" onClick={onSignOut}>
                        {t('logout')}
                    </button>
                </div>
            </div>
        </header>
    )
}
