import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
    DashboardHeader,
    HeroPanel,
    InboxPreviewPanel,
    MilestonePanel,
    MostVisitedPanel,
    RecapPanel,
    StoriesPanel,
} from './components'
import { useMyTravelsDashboard } from './use-my-travels-dashboard'
import './my-travels-page.css'

export const MyTravelsPage = () => {
    const navigate = useNavigate()
    const { t } = useTranslation('myTravels')
    const { data, error, isLoading, isEmpty, refetch } = useMyTravelsDashboard()

    if (isLoading) {
        return (
            <section className="my-travels-state" aria-live="polite">
                <h1>{t('loading')}</h1>
                <p>{t('loadingSubtitle')}</p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="my-travels-state my-travels-state--error" role="alert">
                <h1>{t('unavailable')}</h1>
                <p>{error}</p>
                <button type="button" onClick={() => void refetch()}>
                    {t('retry')}
                </button>
            </section>
        )
    }

    if (!data || isEmpty) {
        return (
            <section className="my-travels-state">
                <h1>{t('empty')}</h1>
                <p>{t('emptySubtitle')}</p>
                <div className="my-travels-state__actions">
                    <button type="button" onClick={() => navigate('/my-travels/add-story')}>
                        {t('addStory')}
                    </button>
                    <button type="button" onClick={() => navigate('/my-travels/upload-photos')}>
                        {t('uploadPhotos')}
                    </button>
                </div>
            </section>
        )
    }

    return (
        <div className="my-travels-page">
            <DashboardHeader
                recapPeriod={data.recap.period}
                recapIsReady={data.recap.isReady}
                onAddStory={() => navigate('/my-travels/add-story')}
                onUploadPhotos={() => navigate('/my-travels/upload-photos')}
            />

            <div className="my-travels-grid">
                <HeroPanel
                    displayName={data.me.displayName ?? data.me.username}
                    stats={data.stats}
                />
                <MilestonePanel
                    milestone={data.nextMilestone}
                    onOpenAchievement={() => navigate('/my-travels/achievement')}
                />
                <RecapPanel
                    recap={data.recap}
                    onOpenShareCard={() => navigate('/my-travels/share-card')}
                />
                <StoriesPanel stories={data.recentStories} />
                <InboxPreviewPanel inboxPreview={data.inboxPreview} />
                <MostVisitedPanel countries={data.mostVisited} />
            </div>
        </div>
    )
}
