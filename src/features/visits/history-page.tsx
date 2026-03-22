import './history-page.css'
import { useEffect, useState } from 'react'
import { ApiError, AuthExpiredError } from '../../shared/api/http'
import type { VisitEvent, VisitsResponse } from '../../shared/api/types'
import { DisabledActionButton, SectionHeader, SurfaceCard } from '../../shared/ui'
import { fetchVisits } from './visits-api'

const formatDateTime = (value: string): string => {
    const date = new Date(value)
    if (Number.isNaN(date.valueOf())) {
        return value
    }

    return date.toLocaleString()
}

const describeVisitDate = (visit: VisitEvent): string => {
    if (!visit.trip_date) {
        return 'Дата поездки не указана'
    }

    return `Дата поездки: ${visit.trip_date}`
}

const toErrorMessage = (caught: unknown): string => {
    if (caught instanceof AuthExpiredError) {
        return 'Session expired. Please sign in again.'
    }
    if (caught instanceof ApiError) {
        return caught.message
    }
    return 'Failed to load visit history.'
}

export const HistoryPage = () => {
    const [payload, setPayload] = useState<VisitsResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadVisits = async (): Promise<void> => {
            setLoading(true)
            setError(null)

            try {
                setPayload(await fetchVisits())
            } catch (caught) {
                setError(toErrorMessage(caught))
            } finally {
                setLoading(false)
            }
        }

        void loadVisits()
    }, [])

    if (loading) {
        return <p className="state-message">Загружаем заметки...</p>
    }

    if (error) {
        return <p className="form-error">{error}</p>
    }

    if (!payload) {
        return <p className="state-message">Нет доступных данных.</p>
    }

    return (
        <div className="notes-page">
            <SectionHeader
                title="Путевые Заметки"
                subtitle="Хроники твоих странствий"
                action={
                    <div className="notes-page__actions">
                        <input
                            type="search"
                            placeholder="Искать в архивах..."
                            aria-label="Искать в архивах"
                            disabled
                        />
                        <DisabledActionButton>Новая запись</DisabledActionButton>
                    </div>
                }
            />

            <SurfaceCard className="notes-page__card">
                <h2>Посещенные страны</h2>

                <div className="country-badges">
                    {payload.visited_country_codes.length === 0 ? (
                        <p className="notes-page__empty">Еще нет посещенных стран.</p>
                    ) : (
                        payload.visited_country_codes.map((countryCode) => (
                            <span key={countryCode} className="badge">
                                {countryCode}
                            </span>
                        ))
                    )}
                </div>

                <h3>История событий</h3>
                <ul className="visit-list">
                    {payload.visits.length === 0 ? (
                        <li className="visit-list__empty">Пока нет записей о поездках.</li>
                    ) : (
                        payload.visits.map((visit) => (
                            <li key={visit.id} className="visit-item">
                                <div>
                                    <strong>{visit.country_code}</strong>
                                    <p>{describeVisitDate(visit)}</p>
                                </div>
                                <time dateTime={visit.marked_at}>
                                    {formatDateTime(visit.marked_at)}
                                </time>
                            </li>
                        ))
                    )}
                </ul>
            </SurfaceCard>
        </div>
    )
}
