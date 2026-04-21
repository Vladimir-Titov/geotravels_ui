import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo.png'
import './top-navigation.css'

interface TopNavigationProps {
    onSignOut: () => void
    unreadInboxCount?: number
    userFullName?: string
}

const getUserLabel = (fullName: string | undefined): { firstName: string; lastName: string } => {
    if (!fullName || fullName.trim().length === 0) {
        return { firstName: 'Traveler', lastName: '' }
    }

    const [firstName = 'Traveler', ...tail] = fullName.trim().split(' ')
    return {
        firstName,
        lastName: tail.join(' '),
    }
}

export const TopNavigation = ({ onSignOut, unreadInboxCount, userFullName }: TopNavigationProps) => {
    const { firstName, lastName } = getUserLabel(userFullName)
    const inboxLabel = `Inbox ${Math.max(0, unreadInboxCount ?? 0)}`

    return (
        <header className="tm-top-nav">
            <div className="tm-top-nav__inner">
                <NavLink to="/my-travels" className="tm-top-nav__brand" aria-label="Tripmark dashboard">
                    <img className="tm-top-nav__brand-logo" src={logo} alt="" aria-hidden="true" />
                    <span>Tripmark</span>
                </NavLink>

                <nav className="tm-top-nav__menu" aria-label="My travels navigation">
                    <NavLink
                        to="/my-travels"
                        className={({ isActive }) =>
                            isActive ? 'tm-top-nav__link is-active' : 'tm-top-nav__link'
                        }
                    >
                        My travels
                    </NavLink>
                </nav>

                <div className="tm-top-nav__actions">
                    <button type="button" className="tm-top-nav__inbox" disabled>
                        {inboxLabel}
                    </button>

                    <div className="tm-top-nav__user-chip" aria-label="Current user">
                        <span className="tm-top-nav__avatar" aria-hidden="true" />
                        <span>
                            <strong>{firstName}</strong>
                            {lastName && <small>{lastName}</small>}
                        </span>
                    </div>

                    <button type="button" className="tm-top-nav__logout" onClick={onSignOut}>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}
