import { useTranslation } from 'react-i18next'
import type { MyTravelsDashboardResponse } from '../../../shared/api/types'
import './hero-panel.css'

interface HeroPanelProps {
    displayName: string | null
    stats: MyTravelsDashboardResponse['stats']
}

const HERO_BACKGROUND = 'linear-gradient(160deg, #D7E2DA 0%, #C8D7CD 100%)'

export const HeroPanel = ({ displayName, stats }: HeroPanelProps) => {
    const { t } = useTranslation(['myTravels', 'common'])
    const userName = displayName ?? t('common:defaultUser')

    return (
        <section className="my-travels-panel my-travels-hero">
            <div className="my-travels-hero__content">
                <p className="my-travels-hero__greeting">{t('hero.greeting', { name: userName })}</p>
                <h2>{t('hero.title')}</h2>
                <p>{t('hero.description')}</p>

                <div className="my-travels-hero__stats">
                    <article className="my-travels-stat">
                        <p>{t('stats.countries')}</p>
                        <strong>{stats.countriesCount}</strong>
                    </article>
                    <article className="my-travels-stat">
                        <p>{t('stats.cities')}</p>
                        <strong>{stats.citiesCount}</strong>
                    </article>
                    <article className="my-travels-stat">
                        <p>{t('stats.stories')}</p>
                        <strong>{stats.storiesCount}</strong>
                    </article>
                </div>
            </div>

            <div className="my-travels-hero__image" style={{ background: HERO_BACKGROUND }} />
        </section>
    )
}
