import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { SurfaceCard } from '../../shared/ui'
import './my-travels-placeholder-page.css'

interface MyTravelsPlaceholderPageProps {
    titleKey: string
    subtitleKey: string
}

export const MyTravelsPlaceholderPage = ({ titleKey, subtitleKey }: MyTravelsPlaceholderPageProps) => {
    const { t } = useTranslation('myTravels')

    return (
        <div className="my-travels-placeholder">
            <SurfaceCard className="my-travels-placeholder__card">
                <p>{t(subtitleKey)}</p>
                <h1>{t(titleKey)}</h1>
                <Link to="/my-travels">{t('backToDashboard')}</Link>
            </SurfaceCard>
        </div>
    )
}
