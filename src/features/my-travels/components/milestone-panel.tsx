import type { DashboardMilestone } from '../../../shared/api/types'
import './milestone-panel.css'

interface MilestonePanelProps {
    milestone: DashboardMilestone
    onOpenAchievement: () => void
}

export const MilestonePanel = ({ milestone, onOpenAchievement }: MilestonePanelProps) => {
    return (
        <section className="my-travels-panel my-travels-milestone">
            <div className="my-travels-milestone__top">
                <p>Next milestone</p>
                <button type="button" onClick={onOpenAchievement}>
                    {milestone.ctaLabel}
                </button>
            </div>
            <h3>{milestone.title}</h3>
            <p>{milestone.description}</p>
            <div className="my-travels-progress">
                <span style={{ width: `${milestone.progressPercent}%` }} />
            </div>
            <strong>{milestone.progressPercent}%</strong>
        </section>
    )
}
