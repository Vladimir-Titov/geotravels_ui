import { useTranslation } from 'react-i18next'
import type { DashboardRecap } from '../../../shared/api/types'
import './recap-panel.css'

interface RecapPanelProps {
    recap: DashboardRecap
    onOpenShareCard: () => void
}

export const RecapPanel = ({ recap, onOpenShareCard }: RecapPanelProps) => {
    const { t } = useTranslation('myTravels')

    return (
        <section className="my-travels-panel my-travels-recap">
            <p>{t('recap.title')}</p>
            <h3>{recap.isReady ? recap.period : t('recap.notReady')}</h3>
            <button type="button" onClick={onOpenShareCard}>
                {t('recap.cta')}
            </button>
        </section>
    )
}
