import type { DashboardRecap } from '../../../shared/api/types'
import './recap-panel.css'

interface RecapPanelProps {
    recap: DashboardRecap
    onOpenShareCard: () => void
}

export const RecapPanel = ({ recap, onOpenShareCard }: RecapPanelProps) => {
    return (
        <section className="my-travels-panel my-travels-recap">
            <p>{recap.title}</p>
            <h3>{recap.summary}</h3>
            <button type="button" onClick={onOpenShareCard}>
                {recap.ctaLabel}
            </button>
        </section>
    )
}
