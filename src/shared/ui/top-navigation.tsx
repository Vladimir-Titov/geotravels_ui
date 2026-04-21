import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { LanguageSwitcher } from './language-switcher'
import './top-navigation.css'

interface TopNavigationProps {
    onSignOut: () => void
    unreadInboxCount?: number
    userFullName?: string
}

const getUserLabel = (
    fullName: string | undefined,
    fallbackUserName: string,
): { firstName: string; lastName: string } => {
    if (!fullName || fullName.trim().length === 0) {
        return { firstName: fallbackUserName, lastName: '' }
    }

    const [firstName = fallbackUserName, ...tail] = fullName.trim().split(' ')
    return {
        firstName,
        lastName: tail.join(' '),
    }
}

export const TopNavigation = ({ onSignOut, unreadInboxCount, userFullName }: TopNavigationProps) => {
    const { t } = useTranslation('common')
    const { firstName, lastName } = getUserLabel(userFullName, t('defaultUser'))
    const inboxLabel = t('inbox', { count: Math.max(0, unreadInboxCount ?? 0) })

    return (
        <header className="tm-top-nav">
            <div className="tm-top-nav__inner">
                <NavLink to="/my-travels" className="tm-top-nav__brand" aria-label={t('aria.dashboard')}>
                    <img className="tm-top-nav__brand-logo" src={logo} alt="" aria-hidden="true" />
                    <span>{t('brand')}</span>
                </NavLink>

                <nav className="tm-top-nav__menu" aria-label={t('aria.navigation')}>
                    <NavLink
                        to="/my-travels"
                        className={({ isActive }) =>
                            isActive ? 'tm-top-nav__link is-active' : 'tm-top-nav__link'
                        }
                    >
                        {t('nav.myTravels')}
                    </NavLink>
                </nav>

                <div className="tm-top-nav__actions">
                    <button type="button" className="tm-top-nav__inbox" disabled>
                        {inboxLabel}
                    </button>

                    <div className="tm-top-nav__user-chip" aria-label={t('aria.currentUser')}>
                        <span className="tm-top-nav__avatar" aria-hidden="true" />
                        <span>
                            <strong>{firstName}</strong>
                            {lastName && <small>{lastName}</small>}
                        </span>
                    </div>

                    <LanguageSwitcher />

                    <button type="button" className="tm-top-nav__logout" onClick={onSignOut}>
                        {t('logout')}
                    </button>
                </div>
            </div>
        </header>
    )
}
