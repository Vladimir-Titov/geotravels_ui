import { BarChart3, Compass, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import './bottom-navigation.css'

export const BottomNavigation = () => {
    const { t } = useTranslation('common')

    return (
        <nav className="tm-bottom-nav" aria-label={t('aria.navigation')}>
            <NavLink to="/visits" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                <MapPin size={19} aria-hidden="true" />
                <span>{t('nav.visits')}</span>
            </NavLink>
            <NavLink to="/plans" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                <Compass size={19} aria-hidden="true" />
                <span>{t('nav.plans')}</span>
            </NavLink>
            <NavLink to="/statistics" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                <BarChart3 size={19} aria-hidden="true" />
                <span>{t('nav.statistics')}</span>
            </NavLink>
        </nav>
    )
}
