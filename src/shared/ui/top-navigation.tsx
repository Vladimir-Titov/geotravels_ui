import { NavLink, useLocation } from 'react-router-dom'
import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import logo from '../../assets/logo.png'
import './top-navigation.css'

interface TopNavigationProps {
    onSignOut: () => void
}

interface NavItem {
    to: string
    label: string
    icon: ReactNode
}

const navItems: NavItem[] = [
    {
        to: '/map',
        label: 'Map',
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                    d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <path d="M9 4v13.5M15 6.5V20" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
        ),
    },
    {
        to: '/history',
        label: 'Notes',
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect
                    x="5"
                    y="3.5"
                    width="14"
                    height="17"
                    rx="2.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <path
                    d="M8.3 8h7.4M8.3 12h7.4M8.3 16h4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },
    {
        to: '/gallery',
        label: 'Gallery',
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect
                    x="3.5"
                    y="5"
                    width="17"
                    height="14"
                    rx="2.6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                />
                <path
                    d="m7.5 15 3.2-3.3 2.1 2.1 2.9-3.1 2.8 4.3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="8.6" cy="9.2" r="1.1" fill="currentColor" />
            </svg>
        ),
    },
    {
        to: '/community',
        label: 'Community',
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="9" cy="8.2" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="15.8" cy="9.2" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path
                    d="M4.7 18.5c.7-2.7 2.7-4.2 5.7-4.2 3 0 5 1.5 5.7 4.2M15.6 14.2c1.8.2 3 .9 3.8 2.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },
    {
        to: '/profile',
        label: 'Profile',
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8.2" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path
                    d="M5.6 19.3c.9-3.1 3.1-4.8 6.4-4.8 3.3 0 5.5 1.7 6.4 4.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },
]

const isRouteActive = (pathname: string, route: string): boolean => {
    return pathname === route || pathname.startsWith(`${route}/`)
}

export const TopNavigation = ({ onSignOut }: TopNavigationProps) => {
    const location = useLocation()
    const menuRef = useRef<HTMLElement | null>(null)
    const indicatorRef = useRef<HTMLSpanElement | null>(null)
    const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

    const updateIndicator = useCallback(() => {
        const menuElement = menuRef.current
        const indicatorElement = indicatorRef.current
        if (!menuElement || !indicatorElement) {
            return
        }

        const activeItem = navItems.find((item) => isRouteActive(location.pathname, item.to))
        if (!activeItem) {
            indicatorElement.classList.remove('is-visible')
            return
        }

        const activeLink = linkRefs.current[activeItem.to]
        if (!activeLink) {
            return
        }

        const menuRect = menuElement.getBoundingClientRect()
        const linkRect = activeLink.getBoundingClientRect()

        indicatorElement.style.transform = `translateX(${linkRect.left - menuRect.left + menuElement.scrollLeft}px)`
        indicatorElement.style.width = `${linkRect.width}px`
        indicatorElement.classList.add('is-visible')
    }, [location.pathname])

    useLayoutEffect(() => {
        updateIndicator()
    }, [updateIndicator])

    useEffect(() => {
        const menuElement = menuRef.current
        if (!menuElement) {
            return
        }

        window.addEventListener('resize', updateIndicator)
        menuElement.addEventListener('scroll', updateIndicator, { passive: true })

        return () => {
            window.removeEventListener('resize', updateIndicator)
            menuElement.removeEventListener('scroll', updateIndicator)
        }
    }, [updateIndicator])

    return (
        <header className="tm-top-nav">
            <div className="tm-top-nav__inner">
                <NavLink to="/map" className="tm-top-nav__brand" aria-label="TripMark home">
                    <img src={logo} alt="TripMark" width={42} height={42} />
                    <span>TripMark</span>
                </NavLink>

                <nav ref={menuRef} className="tm-top-nav__menu" aria-label="Main navigation">
                    <span
                        ref={indicatorRef}
                        className="tm-top-nav__indicator"
                        style={{ transform: 'translateX(0px)', width: '0px' }}
                        aria-hidden="true"
                    />
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            ref={(element) => {
                                linkRefs.current[item.to] = element
                            }}
                            className={({ isActive }) =>
                                isActive ? 'tm-top-nav__link is-active' : 'tm-top-nav__link'
                            }
                        >
                            <span className="tm-top-nav__link-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <button type="button" className="tm-top-nav__logout" onClick={onSignOut}>
                    Logout
                </button>
            </div>
        </header>
    )
}
