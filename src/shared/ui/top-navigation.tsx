import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo.png'
import './top-navigation.css'

interface TopNavigationProps {
    onSignOut: () => void
}

const placeholderTabs = ['History', 'Community', 'Profile']

export const TopNavigation = ({ onSignOut }: TopNavigationProps) => {
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
                    {placeholderTabs.map((tab) => (
                        <span key={tab} className="tm-top-nav__link tm-top-nav__link--placeholder">
                            {tab}
                        </span>
                    ))}
                </nav>

                <div className="tm-top-nav__actions">
                    <button type="button" className="tm-top-nav__inbox" disabled>
                        Inbox 3
                    </button>

                    <div className="tm-top-nav__user-chip" aria-label="Current user">
                        <span className="tm-top-nav__avatar" aria-hidden="true" />
                        <span>
                            <strong>Olivia</strong>
                            <small>Parker</small>
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
