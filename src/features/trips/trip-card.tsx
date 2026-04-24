import { CalendarDays, CheckSquare, Image, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { TripCard as TripCardModel } from './trips-types'

interface TripCardProps {
    trip: TripCardModel
    coverUrl?: string | null
    showPlanProgress?: boolean
}

const formatTripDate = (date: string | null, language: string): string | null => {
    if (!date) {
        return null
    }

    const parsed = new Date(`${date}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) {
        return null
    }

    return parsed.toLocaleDateString(language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

const resolveTripPlace = (trip: TripCardModel): string => {
    return trip.cityName ?? trip.countryName ?? trip.countryCode
}

export const TripCard = ({ trip, coverUrl, showPlanProgress = false }: TripCardProps) => {
    const navigate = useNavigate()
    const { t, i18n } = useTranslation('trips')
    const language = i18n.resolvedLanguage ?? i18n.language
    const dateFrom = formatTripDate(trip.dateFrom, language)
    const dateTo = formatTripDate(trip.dateTo, language)
    const dateLabel = dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : dateFrom ?? dateTo
    const progressLabel = t('cards.planProgress', {
        done: trip.placesVisited,
        total: trip.placesTotal,
    })

    return (
        <button
            type="button"
            className="trip-card"
            onClick={() => navigate(`/trips/${trip.id}`)}
        >
            <span className="trip-card__media" aria-hidden="true">
                {coverUrl ? <img src={coverUrl} alt="" /> : <Image size={24} />}
                {showPlanProgress && <span className="trip-card__counter">{progressLabel}</span>}
            </span>

            <span className="trip-card__body">
                <strong>{trip.title || resolveTripPlace(trip)}</strong>
                <span>
                    <MapPin size={14} aria-hidden="true" />
                    {resolveTripPlace(trip)}
                </span>
                {dateLabel && (
                    <span>
                        <CalendarDays size={14} aria-hidden="true" />
                        {dateLabel}
                    </span>
                )}
                {trip.checklistTotal > 0 && (
                    <span>
                        <CheckSquare size={14} aria-hidden="true" />
                        {t('cards.checklistProgress', {
                            done: trip.checklistDone,
                            total: trip.checklistTotal,
                        })}
                    </span>
                )}
            </span>
        </button>
    )
}
