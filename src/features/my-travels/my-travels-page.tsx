import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DashboardStory, MyTravelsDashboardResponse } from '../../shared/api/types'
import { fetchMyTravelsDashboard } from './my-travels-api'
import { mockMyTravelsDashboard } from './my-travels-mock'
import './my-travels-page.css'

const renderStoryCounters = (story: DashboardStory): string =>
    `${story.counters.views} • ${story.counters.likes} • ${story.counters.comments}`

export const MyTravelsPage = () => {
    const navigate = useNavigate()
    const [dashboard, setDashboard] = useState<MyTravelsDashboardResponse>(mockMyTravelsDashboard)

    useEffect(() => {
        let isMounted = true

        fetchMyTravelsDashboard().then((response) => {
            if (isMounted) {
                setDashboard(response)
            }
        })

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <div className="my-travels-page">
            <header className="my-travels-head">
                <div className="my-travels-head__text">
                    <h1>{dashboard.header.title}</h1>
                    <p>{dashboard.header.subtitle}</p>
                </div>

                <div className="my-travels-head__actions">
                    <span className="my-travels-badge">{dashboard.header.recapBadge}</span>
                    <div className="my-travels-head__buttons">
                        <button
                            type="button"
                            className="my-travels-btn my-travels-btn--primary"
                            onClick={() => navigate('/my-travels/add-story')}
                        >
                            + Add story
                        </button>
                        <button
                            type="button"
                            className="my-travels-btn my-travels-btn--secondary"
                            onClick={() => navigate('/my-travels/upload-photos')}
                        >
                            Upload photos
                        </button>
                    </div>
                </div>
            </header>

            <div className="my-travels-grid">
                <section className="my-travels-panel my-travels-hero">
                    <div className="my-travels-hero__content">
                        <p className="my-travels-hero__greeting">{dashboard.hero.greeting}</p>
                        <h2>{dashboard.hero.title}</h2>
                        <p>{dashboard.hero.description}</p>

                        <div className="my-travels-hero__stats">
                            {dashboard.hero.stats.map((stat) => (
                                <article key={stat.label} className="my-travels-stat">
                                    <p>{stat.label}</p>
                                    <strong>{stat.value}</strong>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="my-travels-hero__image" style={{ background: dashboard.hero.image }} />
                </section>

                <section className="my-travels-panel my-travels-milestone">
                    <div className="my-travels-milestone__top">
                        <p>Next milestone</p>
                        <button type="button" onClick={() => navigate('/my-travels/achievement')}>
                            {dashboard.milestone.ctaLabel}
                        </button>
                    </div>
                    <h3>{dashboard.milestone.title}</h3>
                    <p>{dashboard.milestone.description}</p>
                    <div className="my-travels-progress">
                        <span style={{ width: `${dashboard.milestone.progressPercent}%` }} />
                    </div>
                    <strong>{dashboard.milestone.progressPercent}%</strong>
                </section>

                <section className="my-travels-panel my-travels-recap">
                    <p>{dashboard.recap.title}</p>
                    <h3>{dashboard.recap.summary}</h3>
                    <button type="button" onClick={() => navigate('/my-travels/share-card')}>
                        {dashboard.recap.ctaLabel}
                    </button>
                </section>

                <section className="my-travels-panel my-travels-stories">
                    <header className="my-travels-stories__head">
                        <div>
                            <h2>Recent travel stories</h2>
                            <p>
                                This is the heartbeat of the product: a personal archive today, a social
                                feed tomorrow.
                            </p>
                        </div>
                        <div className="my-travels-stories__badges">
                            <span>{dashboard.stories.draftCount} drafts</span>
                            <span>{dashboard.stories.publicCount} public</span>
                        </div>
                    </header>

                    <article className="story-card story-card--featured">
                        <div
                            className="story-card__image"
                            style={{ background: dashboard.stories.featured.image }}
                        />
                        <div className="story-card__body">
                            <span className="story-card__badge">
                                {dashboard.stories.featured.visibility}
                            </span>
                            <h3>{dashboard.stories.featured.title}</h3>
                            <p>{dashboard.stories.featured.description}</p>
                            <strong>{renderStoryCounters(dashboard.stories.featured)}</strong>
                        </div>
                    </article>

                    {dashboard.stories.compact.map((story) => (
                        <article className="story-card story-card--compact" key={story.id}>
                            <div className="story-card__image" style={{ background: story.image }} />
                            <div className="story-card__body">
                                <span className="story-card__badge">{story.visibility}</span>
                                <h3>{story.title}</h3>
                                <p>{story.description}</p>
                                <strong>{renderStoryCounters(story)}</strong>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="my-travels-panel my-travels-inbox">
                    <header>
                        <h2>{dashboard.inboxPreview.title}</h2>
                        <span>{dashboard.user.unreadInboxCount} unread</span>
                    </header>
                    <p>{dashboard.inboxPreview.subtitle}</p>

                    <div className="my-travels-inbox__list">
                        {dashboard.inboxPreview.items.map((item) => (
                            <article key={item.id} className="inbox-item">
                                <span
                                    className={`inbox-item__dot ${
                                        item.tone === 'warning' ? 'is-warning' : ''
                                    }`}
                                    aria-hidden="true"
                                />
                                <div className="inbox-item__body">
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                                <strong>{item.status}</strong>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="my-travels-panel my-travels-most-visited">
                    <h2>{dashboard.mostVisited.title}</h2>
                    <p>{dashboard.mostVisited.subtitle}</p>

                    <ol>
                        {dashboard.mostVisited.countries.map((country) => (
                            <li key={country.country}>
                                <div className="my-travels-most-visited__row">
                                    <span>{country.rank}.</span>
                                    <strong>{country.country}</strong>
                                    <b>{country.trips} trips</b>
                                </div>
                                <div className="my-travels-most-visited__bar">
                                    <span style={{ width: `${country.progressPercent}%` }} />
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>
        </div>
    )
}
