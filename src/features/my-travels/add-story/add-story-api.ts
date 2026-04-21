import { requestForm, requestJson } from '../../../shared/api/http'
import {
    mapCityResponseToOption,
    mapCountryResponseToOption,
    type CityResponseDto,
    type CountryResponseDto,
    type CreateVisitPayload,
    type UpdateVisitPayload,
    type VisitResponseDto,
} from './add-story-mappers'
import type { CityOption, CountryOption } from './add-story-types'

interface PaginatedResponse<T> {
    items: T[]
}

export interface VisitFileResponseDto {
    id: string
    file_url: string
    filename: string | null
    file_type: string | null
    visit_id: string | null
    user_id: string | null
    is_private: boolean
    is_cover: boolean
}

const VISITS_ENDPOINT = '/api/v1/visits'
const FILES_ENDPOINT = '/api/v1/files'
const COUNTRIES_ENDPOINT = '/api/v1/geo/countries'
const CITIES_ENDPOINT = '/api/v1/geo/cities'

const createSearchParams = (payload: Record<string, string | number | undefined>): string => {
    const params = new URLSearchParams()
    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            params.set(key, String(value))
        }
    })
    return params.toString()
}

export const searchCountries = async (query: string): Promise<CountryOption[]> => {
    const params = createSearchParams({
        limit: 8,
        offset: 0,
        name_ilike: query,
    })
    const response = await requestJson<PaginatedResponse<CountryResponseDto>>(
        `${COUNTRIES_ENDPOINT}?${params}`,
    )
    return response.items.map(mapCountryResponseToOption)
}

export const searchCities = async (countryCode: string, query: string): Promise<CityOption[]> => {
    const params = createSearchParams({
        limit: 8,
        offset: 0,
        country_code: countryCode,
        name_ilike: query,
    })
    const response = await requestJson<PaginatedResponse<CityResponseDto>>(`${CITIES_ENDPOINT}?${params}`)
    return response.items.map(mapCityResponseToOption)
}

export const createVisitDraft = async (payload: CreateVisitPayload): Promise<VisitResponseDto> => {
    return requestJson<VisitResponseDto>(VISITS_ENDPOINT, {
        method: 'POST',
        body: payload,
    })
}

export const updateVisitDraft = async (
    visitId: string,
    payload: UpdateVisitPayload,
): Promise<VisitResponseDto> => {
    return requestJson<VisitResponseDto>(`${VISITS_ENDPOINT}/${visitId}`, {
        method: 'PATCH',
        body: payload,
    })
}

export const uploadVisitPhoto = async (visitId: string, file: File): Promise<VisitFileResponseDto> => {
    const formData = new FormData()
    formData.append('visit_id', visitId)
    formData.append('file', file, file.name)

    if (file.name.trim().length > 0) {
        formData.append('filename', file.name)
    }

    if (file.type.trim().length > 0) {
        formData.append('file_type', file.type)
    }

    return requestForm<VisitFileResponseDto>(FILES_ENDPOINT, {
        method: 'POST',
        body: formData,
    })
}
