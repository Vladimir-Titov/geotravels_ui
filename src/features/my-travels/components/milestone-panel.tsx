import { useTranslation } from 'react-i18next'
import type { DashboardMilestone } from '../../../shared/api/types'
import './milestone-panel.css'

interface MilestonePanelProps {
    milestone: DashboardMilestone
    onOpenAchievement: () => void
}

export const MilestonePanel = ({ milestone, onOpenAchievement }: MilestonePanelProps) => {
    const { t } = useTranslation('myTravels')

    return (
        <section className="my-travels-panel my-travels-milestone">
            <div className="my-travels-milestone__top">
                <p>{t('milestone.nextMilestone')}</p>
                <button type="button" onClick={onOpenAchievement}>
                    {t('milestone.cta')}
                </button>
            </div>
            <h3>{t('milestone.title', { target: milestone.targetValue })}</h3>
            <p>
                {t('milestone.description', {
                    current: milestone.currentValue,
                    target: milestone.targetValue,
                })}
            </p>
            <div className="my-travels-progress">
                <span style={{ width: `${milestone.progressPercent}%` }} />
            </div>
            <strong>{milestone.progressPercent}%</strong>
        </section>
    )
}
