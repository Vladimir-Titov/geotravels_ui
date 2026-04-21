import type { CityOption, CountryOption, TravelStoryDraft, VisibilityOption } from './add-story-types'

export type ApiStoryVisibility = 'private' | 'followers' | 'public'

export interface VisitResponseDto {
    id: string
    country_code: string
    title: string
    description: string | null
    visibility: ApiStoryVisibility
    date_from: string
    date_to: string | null
    city_ids: string[]
    cover_file_id: string | null
}

export interface CountryResponseDto {
    iso_a2: string
    name: string
}

export interface CityResponseDto {
    id: string
    country_code: string
    name: string
}

export interface CreateVisitPayload {
    country_code: string
    title: string
    visibility: ApiStoryVisibility
    date_from?: string
    date_to?: string
    city_ids?: string[]
    description?: string
}

export interface UpdateVisitPayload {
    country_code?: string
    title?: string
    description?: string
    visibility?: ApiStoryVisibility
    date_from?: string
    date_to?: string | null
    city_ids?: string[]
    cover_file_id?: string | null
}

export const mapVisibilityOptionToApi = (value: VisibilityOption): ApiStoryVisibility => {
    if (value === 'friends') {
        return 'followers'
    }
    return value
}

export const mapVisibilityApiToOption = (value: ApiStoryVisibility): VisibilityOption => {
    if (value === 'followers') {
        return 'friends'
    }
    return value
}

const normalizeOptionalText = (value: string): string | undefined => {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : undefined
}

export const mapDraftToCreateVisitPayload = (
    draft: TravelStoryDraft,
    visibility: ApiStoryVisibility,
): CreateVisitPayload => {
    const payload: CreateVisitPayload = {
        country_code: draft.country?.code ?? '',
        title: draft.title.trim(),
        visibility,
    }

    if (draft.dateFrom) {
        payload.date_from = draft.dateFrom
    }

    if (draft.dateTo) {
        payload.date_to = draft.dateTo
    }

    if (draft.cities.length > 0) {
        payload.city_ids = draft.cities.map((city) => city.id)
    }

    const description = normalizeOptionalText(draft.description)
    if (description) {
        payload.description = description
    }

    return payload
}

export const mapDraftToUpdateVisitPayload = (
    draft: TravelStoryDraft,
    visibility: ApiStoryVisibility,
    coverFileId: string | null,
): UpdateVisitPayload => {
    return {
        country_code: draft.country?.code,
        title: draft.title.trim(),
        description: normalizeOptionalText(draft.description),
        visibility,
        date_from: draft.dateFrom || undefined,
        date_to: draft.dateTo || null,
        city_ids: draft.cities.map((city) => city.id),
        cover_file_id: coverFileId,
    }
}

export const mapCountryResponseToOption = (country: CountryResponseDto): CountryOption => {
    return {
        code: country.iso_a2.toUpperCase(),
        name: country.name,
    }
}

export const mapCityResponseToOption = (city: CityResponseDto): CityOption => {
    return {
        id: city.id,
        name: city.name,
        countryCode: city.country_code.toUpperCase(),
    }
}

export const mapVisitResponseToDraft = (visit: VisitResponseDto): TravelStoryDraft => {
    return {
        title: visit.title,
        country: {
            code: visit.country_code.toUpperCase(),
            name: visit.country_code.toUpperCase(),
        },
        cities: visit.city_ids.map((id) => ({
            id,
            name: id,
            countryCode: visit.country_code.toUpperCase(),
        })),
        dateFrom: visit.date_from,
        dateTo: visit.date_to ?? '',
        description: visit.description ?? '',
    }
}
