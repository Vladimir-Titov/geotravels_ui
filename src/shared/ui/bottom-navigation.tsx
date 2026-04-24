import { BarChart3, Compass, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import './bottom-navigation.css'

export const BottomNavigation = () => {
    const { t: tCommon } = useTranslation('common')
    const { t } = useTranslation('trips')

    return (
        <nav className="tm-bottom-nav" aria-label={tCommon('aria.navigation')}>
            <NavLink to="/visits" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                <MapPin size={19} aria-hidden="true" />
                <span>{t('visits.title')}</span>
            </NavLink>
            <NavLink to="/plans" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                <Compass size={19} aria-hidden="true" />
                <span>{t('plans.title')}</span>
            </NavLink>
            <NavLink to="/statistics" className={({ isActive }) => (isActive ? 'is-active' : '')}>
                <BarChart3 size={19} aria-hidden="true" />
                <span>{t('statistics.title')}</span>
            </NavLink>
        </nav>
    )
}
