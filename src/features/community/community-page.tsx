import './community-page.css'
import { DisabledActionButton, SectionHeader, SurfaceCard } from '../../shared/ui'

interface ExplorerCard {
    name: string
    handle: string
    countries: number
}

const explorers: ExplorerCard[] = [
    { name: 'Max Rivera', handle: '@max_explorer', countries: 12 },
    { name: 'Denis Nomad', handle: '@denis_nomad', countries: 8 },
    { name: 'Alice Wonder', handle: '@alice_w', countries: 5 },
]

export const CommunityPage = () => {
    return (
        <div className="community-page">
            <SectionHeader
                title="Community"
                subtitle="Meet new friends and share routes"
            />

            <div className="community-page__tabs">
                <button type="button" className="is-active">
                    Explorer Club
                </button>
                <button type="button" disabled>
                    Your subscriptions
                </button>
            </div>

            <div className="community-list">
                {explorers.map((explorer, index) => (
                    <SurfaceCard key={explorer.handle} className="community-card">
                        <div className={`community-card__avatar community-card__avatar--${index}`} />
                        <div className="community-card__meta">
                            <h2>{explorer.name}</h2>
                            <p>{explorer.handle}</p>
                            <span>{explorer.countries} countries</span>
                        </div>
                        <DisabledActionButton className="community-card__follow">
                            Follow
                        </DisabledActionButton>
                    </SurfaceCard>
                ))}
            </div>
        </div>
    )
}
