import { CalendarDays, CheckSquare, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { TripCard as TripCardModel } from './trips-types'

interface TripCardProps {
    trip: TripCardModel
    coverUrl?: string | null
    showPlanProgress?: boolean
}

const PLACEHOLDER_GRADIENTS_COUNT = 6

const getPlaceholderGradientClass = (trip: TripCardModel): string => {
    const seed = `${trip.id}${trip.title}${trip.countryCode}`
    const hash = Array.from(seed).reduce((sum, character) => sum + character.charCodeAt(0), 0)
    return `trip-card__media--gradient-${hash % PLACEHOLDER_GRADIENTS_COUNT}`
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
    const cityNames = trip.cities.map((city) => city.name).filter(Boolean)
    if (cityNames.length > 0) {
        return cityNames.join(', ')
    }
    return trip.countryName ?? trip.countryCode
}

export const TripCard = ({ trip, coverUrl, showPlanProgress = false }: TripCardProps) => {
    const navigate = useNavigate()
    const { t, i18n } = useTranslation('trips')
    const language = i18n.resolvedLanguage ?? i18n.language
    const dateFrom = formatTripDate(trip.tripStart, language)
    const dateTo = formatTripDate(trip.tripEnd, language)
    const dateLabel = dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : (dateFrom ?? dateTo)
    const progressLabel = t('cards.planProgress', {
        done: trip.placesVisited,
        total: trip.placesTotal,
    })

    return (
        <button type="button" className="trip-card" onClick={() => navigate(`/trips/${trip.id}`)}>
            <span
                className={
                    coverUrl
                        ? 'trip-card__media'
                        : `trip-card__media trip-card__media--placeholder ${getPlaceholderGradientClass(trip)}`
                }
                aria-hidden="true"
            >
                {coverUrl && <img src={coverUrl} alt="" loading="lazy" decoding="async" />}
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
