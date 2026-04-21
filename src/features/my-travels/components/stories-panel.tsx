import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import type { DashboardStory, StoryVisibility } from '../../../shared/api/types'
import './stories-panel.css'

interface StoriesPanelProps {
    stories: DashboardStory[]
}

const CARD_FALLBACK_BACKGROUND = 'linear-gradient(135deg, #D4DCD6 0%, #C3CFC8 100%)'

const getStoryCoverStyle = (story: DashboardStory): CSSProperties => {
    if (!story.cover) {
        return { background: CARD_FALLBACK_BACKGROUND }
    }

    return {
        backgroundImage: `url(${story.cover})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    }
}

const formatStoryDate = (createdAt: string, language: string): string => {
    const parsed = new Date(createdAt)
    if (Number.isNaN(parsed.getTime())) {
        return ''
    }

    return parsed.toLocaleDateString(language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

const StoryCard = ({
    story,
    featured,
    language,
}: {
    story: DashboardStory
    featured?: boolean
    language: string
}) => {
    const { t } = useTranslation('myTravels')
    const visibilityLabels: Record<StoryVisibility, string> = {
        followers: t('visibility.followers'),
        public: t('visibility.public'),
        private: t('visibility.private'),
    }

    const formatMetric = (value: number | null, label: 'views' | 'likes' | 'comments'): string => {
        if (value === null) {
            return label === 'views'
                ? t('metrics.draftOnly')
                : t('metrics.hidden', { label: t(`metrics.${label}`) })
        }

        return `${value} ${t(`metrics.${label}`)}`
    }

    const storyCounters = [
        formatMetric(story.counters.views, 'views'),
        formatMetric(story.counters.likes, 'likes'),
        formatMetric(story.counters.comments, 'comments'),
    ].join(' • ')

    const place = story.location.cityName ?? story.location.countryName
    const storyTitle = place ? t('stories.tripTo', { place }) : t('stories.untitledTrip')
    const storyDate = formatStoryDate(story.createdAt, language)

    return (
        <article className={featured ? 'story-card story-card--featured' : 'story-card story-card--compact'}>
            <div className="story-card__image" style={getStoryCoverStyle(story)} />
            <div className="story-card__body">
                <span className="story-card__badge">{visibilityLabels[story.visibility]}</span>
                <h3>{storyTitle}</h3>
                <p>{storyDate}</p>
                <strong>{storyCounters}</strong>
            </div>
        </article>
    )
}

export const StoriesPanel = ({ stories }: StoriesPanelProps) => {
    const { t, i18n } = useTranslation('myTravels')
    const featured = stories[0]
    const compact = stories.slice(1)
    const draftCount = stories.filter((story) => story.visibility === 'private').length
    const publicCount = stories.filter((story) => story.visibility === 'public').length
    const language = i18n.resolvedLanguage ?? i18n.language

    return (
        <section className="my-travels-panel my-travels-stories">
            <header className="my-travels-stories__head">
                <div>
                    <h2>{t('stories.recentTitle')}</h2>
                    <p>{t('stories.description')}</p>
                </div>
                <div className="my-travels-stories__badges">
                    <span>{t('stories.draftsCount', { count: draftCount })}</span>
                    <span>{t('stories.publicCount', { count: publicCount })}</span>
                </div>
            </header>

            {featured && <StoryCard story={featured} featured language={language} />}

            {compact.map((story) => (
                <StoryCard key={story.id} story={story} language={language} />
            ))}
        </section>
    )
}
