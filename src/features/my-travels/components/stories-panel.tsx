import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { requestBlob } from '../../../shared/api/http'
import type { DashboardStory } from '../../../shared/api/types'
import './stories-panel.css'

interface StoriesPanelProps {
    stories: DashboardStory[]
}

const CARD_FALLBACK_BACKGROUND = 'linear-gradient(135deg, #D4DCD6 0%, #C3CFC8 100%)'

const canCreateObjectUrl =
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function' &&
    typeof URL.revokeObjectURL === 'function'

const getStoryCoverStyle = (coverUrl: string | null): CSSProperties => {
    if (!coverUrl) {
        return { background: CARD_FALLBACK_BACKGROUND }
    }

    return {
        backgroundImage: `url(${coverUrl})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    }
}

interface StoryCoverEntry {
    source: string
    objectUrl: string
}

const useStoryCoverUrls = (stories: DashboardStory[]): Record<string, StoryCoverEntry> => {
    const coverEntriesRef = useRef<Record<string, StoryCoverEntry>>({})
    const [coverEntries, setCoverEntries] = useState<Record<string, StoryCoverEntry>>({})

    const syncCoverEntries = (): void => {
        setCoverEntries({ ...coverEntriesRef.current })
    }

    useEffect(() => {
        if (!canCreateObjectUrl) {
            return
        }

        const activeStories = new Map(stories.map((story) => [story.id, story]))

        Object.entries(coverEntriesRef.current).forEach(([storyId, entry]) => {
            const story = activeStories.get(storyId)
            if (!story?.cover || story.cover !== entry.source) {
                URL.revokeObjectURL(entry.objectUrl)
                delete coverEntriesRef.current[storyId]
            }
        })

        let isCancelled = false

        const loadCovers = async () => {
            for (const story of stories) {
                if (!story.cover) {
                    continue
                }

                const existing = coverEntriesRef.current[story.id]
                if (existing?.source === story.cover) {
                    continue
                }

                try {
                    const blob = await requestBlob(story.cover)
                    if (isCancelled) {
                        return
                    }

                    const objectUrl = URL.createObjectURL(blob)
                    const previous = coverEntriesRef.current[story.id]
                    if (previous) {
                        URL.revokeObjectURL(previous.objectUrl)
                    }

                    coverEntriesRef.current[story.id] = {
                        source: story.cover,
                        objectUrl,
                    }
                    syncCoverEntries()
                } catch {
                    // keep fallback background when cover fetch fails
                }
            }
        }

        void loadCovers()

        return () => {
            isCancelled = true
        }
    }, [stories])

    useEffect(() => {
        return () => {
            if (!canCreateObjectUrl) {
                return
            }

            Object.values(coverEntriesRef.current).forEach((entry) => {
                URL.revokeObjectURL(entry.objectUrl)
            })
            coverEntriesRef.current = {}
        }
    }, [])

    return coverEntries
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
    coverUrl,
}: {
    story: DashboardStory
    featured?: boolean
    language: string
    coverUrl: string | null
}) => {
    const { t } = useTranslation('myTravels')

    const formatMetric = (value: number | null, label: 'views' | 'likes' | 'comments'): string | null => {
        if (value === null) {
            return null
        }

        return `${value} ${t(`metrics.${label}`)}`
    }

    const storyCounters = [
        formatMetric(story.counters.views, 'views'),
        formatMetric(story.counters.likes, 'likes'),
        formatMetric(story.counters.comments, 'comments'),
    ]
        .filter((metric): metric is string => metric !== null)
        .join(' • ')

    const place = story.location.cityName ?? story.location.countryName
    const storyTitle = place ? t('stories.tripTo', { place }) : t('stories.untitledTrip')
    const storyDate = formatStoryDate(story.createdAt, language)

    return (
        <article className={featured ? 'story-card story-card--featured' : 'story-card story-card--compact'}>
            <div className="story-card__image" style={getStoryCoverStyle(coverUrl)} />
            <div className="story-card__body">
                <h3>{storyTitle}</h3>
                <p>{storyDate}</p>
                <strong>{storyCounters || t('metrics.pending')}</strong>
            </div>
        </article>
    )
}

export const StoriesPanel = ({ stories }: StoriesPanelProps) => {
    const { t, i18n } = useTranslation('myTravels')
    const featured = stories[0]
    const compact = stories.slice(1)
    const language = i18n.resolvedLanguage ?? i18n.language
    const storyCoverEntries = useStoryCoverUrls(stories)

    return (
        <section className="my-travels-panel my-travels-stories">
            <header className="my-travels-stories__head">
                <div>
                    <h2>{t('stories.recentTitle')}</h2>
                    <p>{t('stories.description')}</p>
                </div>
                <div className="my-travels-stories__badges">
                    <span>{t('stories.recentCount', { count: stories.length })}</span>
                </div>
            </header>

            {featured && (
                <StoryCard
                    story={featured}
                    featured
                    language={language}
                    coverUrl={
                        featured.cover && storyCoverEntries[featured.id]?.source === featured.cover
                            ? storyCoverEntries[featured.id].objectUrl
                            : null
                    }
                />
            )}

            {compact.map((story) => (
                <StoryCard
                    key={story.id}
                    story={story}
                    language={language}
                    coverUrl={
                        story.cover && storyCoverEntries[story.id]?.source === story.cover
                            ? storyCoverEntries[story.id].objectUrl
                            : null
                    }
                />
            ))}

            {!featured && <p>{t('stories.empty')}</p>}
        </section>
    )
}
