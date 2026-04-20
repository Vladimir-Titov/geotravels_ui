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
    const { data, error, isLoading, isEmpty, refetch } = useMyTravelsDashboard()

    if (isLoading) {
        return (
            <section className="my-travels-state" aria-live="polite">
                <h1>Loading dashboard</h1>
                <p>Preparing your travel cockpit...</p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="my-travels-state my-travels-state--error" role="alert">
                <h1>Dashboard unavailable</h1>
                <p>{error}</p>
                <button type="button" onClick={() => void refetch()}>
                    Retry
                </button>
            </section>
        )
    }

    if (!data || isEmpty) {
        return (
            <section className="my-travels-state">
                <h1>My travels is empty</h1>
                <p>Add your first story and upload photos to start filling the dashboard.</p>
                <button type="button" onClick={() => navigate('/my-travels/add-story')}>
                    + Add story
                </button>
            </section>
        )
    }

    return (
        <div className="my-travels-page">
            <DashboardHeader
                header={data.header}
                onAddStory={() => navigate('/my-travels/add-story')}
                onUploadPhotos={() => navigate('/my-travels/upload-photos')}
            />

            <div className="my-travels-grid">
                <HeroPanel hero={data.hero} />
                <MilestonePanel
                    milestone={data.milestone}
                    onOpenAchievement={() => navigate('/my-travels/achievement')}
                />
                <RecapPanel
                    recap={data.recap}
                    onOpenShareCard={() => navigate('/my-travels/share-card')}
                />
                <StoriesPanel stories={data.stories} />
                <InboxPreviewPanel
                    inboxPreview={data.inboxPreview}
                    unreadInboxCount={data.user.unreadInboxCount}
                />
                <MostVisitedPanel mostVisited={data.mostVisited} />
            </div>
        </div>
    )
}
