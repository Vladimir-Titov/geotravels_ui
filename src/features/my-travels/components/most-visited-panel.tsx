import { useTranslation } from 'react-i18next'
import type { DashboardMostVisitedCountry } from '../../../shared/api/types'
import './most-visited-panel.css'

interface MostVisitedPanelProps {
    countries: DashboardMostVisitedCountry[]
}

export const MostVisitedPanel = ({ countries }: MostVisitedPanelProps) => {
    const { t } = useTranslation('myTravels')

    return (
        <section className="my-travels-panel my-travels-most-visited">
            <h2>{t('mostVisited.title')}</h2>
            <p>{t('mostVisited.subtitle')}</p>

            <ol>
                {countries.map((country, index) => (
                    <li key={`${country.countryName ?? 'country'}-${index + 1}`}>
                        <div className="my-travels-most-visited__row">
                            <span>{index + 1}.</span>
                            <strong>{country.countryName ?? '—'}</strong>
                            <b>{t('mostVisited.tripsCount', { count: country.tripsCount })}</b>
                        </div>
                        <div className="my-travels-most-visited__bar">
                            <span style={{ width: `${country.relativeBarValue}%` }} />
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    )
}
