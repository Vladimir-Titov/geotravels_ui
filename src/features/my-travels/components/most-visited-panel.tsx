import type { DashboardMostVisited } from '../../../shared/api/types'
import './most-visited-panel.css'

interface MostVisitedPanelProps {
    mostVisited: DashboardMostVisited
}

export const MostVisitedPanel = ({ mostVisited }: MostVisitedPanelProps) => {
    return (
        <section className="my-travels-panel my-travels-most-visited">
            <h2>{mostVisited.title}</h2>
            <p>{mostVisited.subtitle}</p>

            <ol>
                {mostVisited.countries.map((country) => (
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
    )
}
