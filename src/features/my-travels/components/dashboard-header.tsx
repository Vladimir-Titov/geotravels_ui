import { useTranslation } from 'react-i18next'
import './dashboard-header.css'

interface DashboardHeaderProps {
    recapPeriod: string
    recapIsReady: boolean
    onAddStory: () => void
    onUploadPhotos: () => void
}

const formatRecapMonth = (period: string, language: string): string => {
    if (!period) {
        return ''
    }

    const parsed = new Date(`${period}-01T00:00:00.000Z`)
    if (Number.isNaN(parsed.getTime())) {
        return period
    }

    return parsed.toLocaleDateString(language, { month: 'long' })
}

export const DashboardHeader = ({
    recapPeriod,
    recapIsReady,
    onAddStory,
    onUploadPhotos,
}: DashboardHeaderProps) => {
    const { t, i18n } = useTranslation('myTravels')
    const recapMonth = formatRecapMonth(recapPeriod, i18n.resolvedLanguage ?? i18n.language)
    const recapBadgeLabel = recapIsReady
        ? t('header.recapReady', { month: recapMonth || recapPeriod })
        : t('header.recapPending')

    return (
        <header className="my-travels-head">
            <div className="my-travels-head__text">
                <h1>{t('header.title')}</h1>
                <p>{t('header.subtitle')}</p>
            </div>

            <div className="my-travels-head__actions">
                <span className="my-travels-badge">{recapBadgeLabel}</span>
                <div className="my-travels-head__buttons">
                    <button
                        type="button"
                        className="my-travels-btn my-travels-btn--primary"
                        onClick={onAddStory}
                    >
                        {t('addStory')}
                    </button>
                    <button
                        type="button"
                        className="my-travels-btn my-travels-btn--secondary"
                        onClick={onUploadPhotos}
                    >
                        {t('uploadPhotos')}
                    </button>
                </div>
            </div>
        </header>
    )
}
