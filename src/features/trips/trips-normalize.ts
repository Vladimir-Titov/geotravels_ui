import { API_BASE_URL } from '../../shared/config/env'
import type {
    ChecklistStatus,
    CityOption,
    CountryOption,
    FavoriteCity,
    Pagination,
    TripCard,
    TripCardsResponse,
    TripChecklistItem,
    TripDetails,
    TripPhoto,
    TripPlace,
    TripsByCountry,
    TripStatistics,
    TripStatus,
    TripVisit,
} from './trips-types'

const asRecord = (value: unknown): Record<string, unknown> =>
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const asString = (value: unknown, fallback = ''): string =>
    typeof value === 'string' && value.trim().length > 0 ? value : fallback

const asNullableString = (value: unknown): string | null =>
    typeof value === 'string' && value.trim().length > 0 ? value : null

const asNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    if (typeof value === 'string') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }

    return fallback
}

const asBoolean = (value: unknown, fallback = false): boolean =>
    typeof value === 'boolean' ? value : fallback

const normalizeStatus = (value: unknown): TripStatus => {
    if (value === 'planned' || value === 'in_trip' || value === 'visited') {
        return value
    }
    return 'visited'
}

const normalizeChecklistStatus = (value: unknown): ChecklistStatus => {
    if (value === 'done') {
        return 'done'
    }
    return 'to_do'
}

export const toAbsoluteApiUrl = (url: string | null): string | null => {
    if (!url) {
        return null
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    if (url.startsWith('/')) {
        return `${API_BASE_URL}${url}`
    }

    return url
}

const normalizePagination = (value: unknown): Pagination => {
    const pagination = asRecord(value)
    const limit = pagination.limit === null ? null : Math.max(0, asNumber(pagination.limit, 100))

    return {
        limit,
        offset: Math.max(0, asNumber(pagination.offset)),
        total: Math.max(0, asNumber(pagination.total)),
    }
}

const normalizeTripCard = (value: unknown): TripCard => {
    const card = asRecord(value)

    return {
        id: asString(card.id),
        status: normalizeStatus(card.status),
        title: asString(card.title),
        countryCode: asString(card.country_code),
        countryName: asNullableString(card.country_name),
        cityId: asNullableString(card.city_id),
        cityName: asNullableString(card.city_name),
        dateFrom: asNullableString(card.date_from),
        dateTo: asNullableString(card.date_to),
        coverUrl: toAbsoluteApiUrl(asNullableString(card.cover_url)),
        photosCount: Math.max(0, asNumber(card.photos_count)),
        checklistTotal: Math.max(0, asNumber(card.checklist_total)),
        checklistDone: Math.max(0, asNumber(card.checklist_done)),
        placesTotal: Math.max(0, asNumber(card.places_total)),
        placesVisited: Math.max(0, asNumber(card.places_visited)),
    }
}

export const normalizeTripCardsResponse = (value: unknown): TripCardsResponse => {
    const response = asRecord(value)
    return {
        items: asArray(response.items).map(normalizeTripCard).filter((card) => card.id.length > 0),
        pagination: normalizePagination(response.pagination),
    }
}

const normalizeTripVisit = (value: unknown): TripVisit => {
    const visit = asRecord(value)

    return {
        id: asString(visit.id),
        status: normalizeStatus(visit.status),
        title: asString(visit.title),
        description: asNullableString(visit.description),
        countryCode: asString(visit.country_code),
        countryName: asNullableString(visit.country_name),
        cityId: asNullableString(visit.city_id),
        cityName: asNullableString(visit.city_name),
        cityIds: asArray(visit.city_ids).map((item) => asString(item)).filter(Boolean),
        dateFrom: asNullableString(visit.date_from),
        dateTo: asNullableString(visit.date_to),
        coverFileId: asNullableString(visit.cover_file_id),
        coverUrl: toAbsoluteApiUrl(asNullableString(visit.cover_url)),
        created: asString(visit.created),
        updated: asString(visit.updated),
    }
}

const normalizePhoto = (value: unknown): TripPhoto => {
    const photo = asRecord(value)

    return {
        id: asString(photo.id),
        fileUrl: toAbsoluteApiUrl(asNullableString(photo.file_url)) ?? '',
        filename: asNullableString(photo.filename),
        fileType: asNullableString(photo.file_type),
        isPrivate: asBoolean(photo.is_private),
        isCover: asBoolean(photo.is_cover),
    }
}

const normalizeChecklistItem = (value: unknown): TripChecklistItem => {
    const item = asRecord(value)

    return {
        id: asString(item.id),
        visitId: asString(item.visit_id),
        content: asString(item.content),
        status: normalizeChecklistStatus(item.status),
        created: asString(item.created),
        updated: asString(item.updated),
    }
}

const normalizePlace = (value: unknown): TripPlace => {
    const place = asRecord(value)

    return {
        id: asString(place.id),
        visitId: asString(place.visit_id),
        title: asString(place.title),
        isVisited: asBoolean(place.is_visited),
        created: asString(place.created),
        updated: asString(place.updated),
    }
}

export const normalizeCountryOption = (value: unknown): CountryOption => {
    const country = asRecord(value)
    const displayName = asString(country.display_name)

    return {
        code: asString(country.iso_a2).toUpperCase(),
        name: displayName || asString(country.name),
    }
}

export const normalizeCityOption = (value: unknown): CityOption => {
    const city = asRecord(value)
    const displayName = asString(city.display_name)

    return {
        id: asString(city.id),
        name: displayName || asString(city.name),
        countryCode: asString(city.country_code).toUpperCase(),
    }
}

export const normalizeTripDetails = (value: unknown): TripDetails => {
    const details = asRecord(value)

    return {
        visit: normalizeTripVisit(details.visit),
        photos: asArray(details.photos).map(normalizePhoto).filter((photo) => photo.id.length > 0),
        checklist: asArray(details.checklist)
            .map(normalizeChecklistItem)
            .filter((item) => item.id.length > 0),
        places: asArray(details.places).map(normalizePlace).filter((place) => place.id.length > 0),
        cities: asArray(details.cities).map(normalizeCityOption).filter((city) => city.id.length > 0),
    }
}

const normalizeFavoriteCity = (value: unknown): FavoriteCity | null => {
    if (!value) {
        return null
    }

    const city = asRecord(value)
    const cityId = asString(city.city_id)
    if (!cityId) {
        return null
    }

    return {
        cityId,
        cityName: asString(city.city_name, cityId),
        visitsCount: Math.max(0, asNumber(city.visits_count)),
    }
}

const normalizeTripsByCountry = (value: unknown): TripsByCountry => {
    const country = asRecord(value)
    return {
        countryName: asNullableString(country.country_name),
        tripsCount: Math.max(0, asNumber(country.trips_count)),
    }
}

export const normalizeTripStatistics = (value: unknown): TripStatistics => {
    const stats = asRecord(value)

    return {
        visitedCount: Math.max(0, asNumber(stats.visited_count)),
        plannedCount: Math.max(0, asNumber(stats.planned_count)),
        countriesCount: Math.max(0, asNumber(stats.countries_count)),
        citiesCount: Math.max(0, asNumber(stats.cities_count)),
        repeatedCountriesCount: Math.max(0, asNumber(stats.repeated_countries_count)),
        favoriteCity: normalizeFavoriteCity(stats.favorite_city),
        tripsByCountry: asArray(stats.trips_by_country).map(normalizeTripsByCountry),
    }
}
