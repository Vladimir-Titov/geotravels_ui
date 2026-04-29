import { requestForm, requestJson } from '../../shared/api/http'
import type {
    ChecklistStatus,
    CityOption,
    CountryOption,
    CreateVisitPayload,
    TripCardsResponse,
    TripDetails,
    TripStatistics,
    TripStatus,
    UpdateVisitPayload,
    VisibleTripStatus,
} from './trips-types'
import {
    normalizeCityOption,
    normalizeCountryOption,
    normalizeTripCardsResponse,
    normalizeTripDetails,
    normalizeTripStatistics,
} from './trips-normalize'

interface PaginatedResponse<T> {
    items: T[]
}

interface VisitResponseDto {
    id: string
    status: TripStatus
    cover_file_id: string | null
}

interface VisitFileResponseDto {
    id: string
    file_url: string
    is_cover: boolean
}

const VISITS_ENDPOINT = '/api/v1/visits'
const COUNTRIES_ENDPOINT = '/api/v1/geo/countries'
const CITIES_ENDPOINT = '/api/v1/geo/cities'
const CHECKLIST_ENDPOINT = '/api/v1/visits/checklist'
const PLACES_ENDPOINT = '/api/v1/visits/places'

const createSearchParams = (payload: Record<string, string | number | undefined>): string => {
    const params = new URLSearchParams()
    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            params.set(key, String(value))
        }
    })
    return params.toString()
}

export const fetchTripCards = async (status: VisibleTripStatus): Promise<TripCardsResponse> => {
    const params = createSearchParams({ status, limit: 100, offset: 0 })
    const response = await requestJson<unknown>(`${VISITS_ENDPOINT}/cards?${params}`)
    return normalizeTripCardsResponse(response)
}

export const fetchTripDetails = async (visitId: string): Promise<TripDetails> => {
    const response = await requestJson<unknown>(`${VISITS_ENDPOINT}/${visitId}/details`)
    return normalizeTripDetails(response)
}

export const fetchTripStatistics = async (): Promise<TripStatistics> => {
    const response = await requestJson<unknown>(`${VISITS_ENDPOINT}/statistics`)
    return normalizeTripStatistics(response)
}

export const searchCountries = async (query: string): Promise<CountryOption[]> => {
    const params = createSearchParams({
        limit: 8,
        offset: 0,
        name_ilike: query,
    })
    const response = await requestJson<PaginatedResponse<unknown>>(`${COUNTRIES_ENDPOINT}?${params}`)
    return response.items.map(normalizeCountryOption).filter((country) => country.code && country.name)
}

export const searchCities = async (countryCode: string, query: string): Promise<CityOption[]> => {
    const params = createSearchParams({
        limit: 8,
        offset: 0,
        country_code: countryCode,
        name_ilike: query,
    })
    const response = await requestJson<PaginatedResponse<unknown>>(`${CITIES_ENDPOINT}?${params}`)
    return response.items.map(normalizeCityOption).filter((city) => city.id && city.name)
}

export const createVisit = async (payload: CreateVisitPayload): Promise<VisitResponseDto> => {
    return requestJson<VisitResponseDto>(VISITS_ENDPOINT, {
        method: 'POST',
        body: payload,
    })
}

export const updateVisit = async (
    visitId: string,
    payload: UpdateVisitPayload,
): Promise<VisitResponseDto> => {
    return requestJson<VisitResponseDto>(`${VISITS_ENDPOINT}/${visitId}`, {
        method: 'PATCH',
        body: payload,
    })
}

export const deleteVisit = async (visitId: string): Promise<void> => {
    await requestJson<void>(`${VISITS_ENDPOINT}/${visitId}`, {
        method: 'DELETE',
    })
}

export const createChecklistItem = async (visitId: string, content: string): Promise<void> => {
    await requestJson<unknown>(CHECKLIST_ENDPOINT, {
        method: 'POST',
        body: {
            visit_id: visitId,
            content,
        },
    })
}

export const updateChecklistItem = async (
    checklistId: string,
    status: ChecklistStatus,
): Promise<void> => {
    await requestJson<unknown>(`${CHECKLIST_ENDPOINT}/${checklistId}`, {
        method: 'PATCH',
        body: { status },
    })
}

export const createVisitPlace = async (visitId: string, title: string): Promise<void> => {
    await requestJson<unknown>(PLACES_ENDPOINT, {
        method: 'POST',
        body: {
            visit_id: visitId,
            title,
        },
    })
}

export const updateVisitPlace = async (placeId: string, isVisited: boolean): Promise<void> => {
    await requestJson<unknown>(`${PLACES_ENDPOINT}/${placeId}`, {
        method: 'PATCH',
        body: { is_visited: isVisited },
    })
}

export const uploadVisitPhoto = async (visitId: string, file: File): Promise<VisitFileResponseDto> => {
    const formData = new FormData()
    formData.append('file', file, file.name)
    formData.append('visibility', 'private')

    if (file.name.trim().length > 0) {
        formData.append('filename', file.name)
    }

    return requestForm<VisitFileResponseDto>(`${VISITS_ENDPOINT}/${visitId}/file`, {
        method: 'POST',
        body: formData,
    })
}
