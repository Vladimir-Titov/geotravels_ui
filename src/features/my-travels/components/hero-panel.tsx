import type { DashboardHero } from '../../../shared/api/types'
import './hero-panel.css'

interface HeroPanelProps {
    hero: DashboardHero
}

export const HeroPanel = ({ hero }: HeroPanelProps) => {
    return (
        <section className="my-travels-panel my-travels-hero">
            <div className="my-travels-hero__content">
                <p className="my-travels-hero__greeting">{hero.greeting}</p>
                <h2>{hero.title}</h2>
                <p>{hero.description}</p>

                {hero.stats.length > 0 && (
                    <div className="my-travels-hero__stats">
                        {hero.stats.map((stat) => (
                            <article key={stat.label} className="my-travels-stat">
                                <p>{stat.label}</p>
                                <strong>{stat.value}</strong>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <div className="my-travels-hero__image" style={{ background: hero.image }} />
        </section>
    )
}
