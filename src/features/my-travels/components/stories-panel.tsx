import type { DashboardStoriesBlock, DashboardStory, StoryVisibility } from '../../../shared/api/types'
import './stories-panel.css'

interface StoriesPanelProps {
    stories: DashboardStoriesBlock
}

const visibilityLabels: Record<StoryVisibility, string> = {
    followers: 'Followers',
    public: 'Public',
    private: 'Private',
}

const formatMetric = (value: number | null, label: string): string => {
    if (value === null) {
        return label === 'views' ? 'Draft only' : `${label} hidden`
    }

    return `${value} ${label}`
}

const renderStoryCounters = (story: DashboardStory): string => {
    return [
        formatMetric(story.counters.views, 'views'),
        formatMetric(story.counters.likes, 'likes'),
        formatMetric(story.counters.comments, 'comments'),
    ].join(' • ')
}

const StoryCard = ({ story, featured }: { story: DashboardStory; featured?: boolean }) => {
    return (
        <article className={featured ? 'story-card story-card--featured' : 'story-card story-card--compact'}>
            <div className="story-card__image" style={{ background: story.image }} />
            <div className="story-card__body">
                <span className="story-card__badge">{visibilityLabels[story.visibility]}</span>
                <h3>{story.title}</h3>
                <p>{story.description}</p>
                <strong>{renderStoryCounters(story)}</strong>
            </div>
        </article>
    )
}

export const StoriesPanel = ({ stories }: StoriesPanelProps) => {
    return (
        <section className="my-travels-panel my-travels-stories">
            <header className="my-travels-stories__head">
                <div>
                    <h2>Recent travel stories</h2>
                    <p>
                        This is the heartbeat of the product: a personal archive today, a social feed
                        tomorrow.
                    </p>
                </div>
                <div className="my-travels-stories__badges">
                    <span>{stories.draftCount} drafts</span>
                    <span>{stories.publicCount} public</span>
                </div>
            </header>

            <StoryCard story={stories.featured} featured />

            {stories.compact.map((story) => (
                <StoryCard key={story.id} story={story} />
            ))}
        </section>
    )
}
