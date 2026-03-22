import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo.png'
import './top-navigation.css'

interface TopNavigationProps {
    onSignOut: () => void
}

const navItems = [
    { to: '/map', label: 'Карта' },
    { to: '/history', label: 'Заметки' },
    { to: '/gallery', label: 'Галерея' },
    { to: '/community', label: 'Сообщество' },
    { to: '/profile', label: 'Профиль' },
]

export const TopNavigation = ({ onSignOut }: TopNavigationProps) => {
    return (
        <header className="tm-top-nav">
            <div className="tm-top-nav__inner">
                <NavLink to="/map" className="tm-top-nav__brand" aria-label="Tripmark home">
                    <img src={logo} alt="Tripmark" width={42} height={42} />
                    <span>Tripmark</span>
                </NavLink>

                <nav className="tm-top-nav__menu" aria-label="Main navigation">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                isActive ? 'tm-top-nav__link is-active' : 'tm-top-nav__link'
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <button type="button" className="tm-top-nav__logout" onClick={onSignOut}>
                    Выйти
                </button>
            </div>
        </header>
    )
}
