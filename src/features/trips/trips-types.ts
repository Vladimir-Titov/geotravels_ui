export type TripStatus = 'planned' | 'in_trip' | 'visited'
export type VisibleTripStatus = 'planned' | 'visited'
export type ChecklistStatus = 'to_do' | 'done'

export interface Pagination {
    limit: number | null
    offset: number
    total: number
}

export interface CountryOption {
    code: string
    name: string
}

export interface CityOption {
    id: string
    name: string
    countryCode: string
}

export interface TripCard {
    id: string
    status: TripStatus
    title: string
    countryCode: string
    countryName: string | null
    cityId: string | null
    cityName: string | null
    dateFrom: string | null
    dateTo: string | null
    coverUrl: string | null
    photosCount: number
    checklistTotal: number
    checklistDone: number
    placesTotal: number
    placesVisited: number
}

export interface TripCardsResponse {
    items: TripCard[]
    pagination: Pagination
}

export interface TripVisit {
    id: string
    status: TripStatus
    title: string
    description: string | null
    countryCode: string
    countryName: string | null
    cityId: string | null
    cityName: string | null
    cityIds: string[]
    dateFrom: string | null
    dateTo: string | null
    coverFileId: string | null
    coverUrl: string | null
    created: string
    updated: string
}

export interface TripPhoto {
    id: string
    fileUrl: string
    filename: string | null
    fileType: string | null
    isPrivate: boolean
    isCover: boolean
}

export interface TripChecklistItem {
    id: string
    visitId: string
    content: string
    status: ChecklistStatus
    created: string
    updated: string
}

export interface TripPlace {
    id: string
    visitId: string
    title: string
    isVisited: boolean
    created: string
    updated: string
}

export interface TripDetails {
    visit: TripVisit
    photos: TripPhoto[]
    checklist: TripChecklistItem[]
    places: TripPlace[]
    cities: CityOption[]
}

export interface TripsByCountry {
    countryName: string | null
    tripsCount: number
}

export interface FavoriteCity {
    cityId: string
    cityName: string
    visitsCount: number
}

export interface TripStatistics {
    visitedCount: number
    plannedCount: number
    countriesCount: number
    citiesCount: number
    repeatedCountriesCount: number
    favoriteCity: FavoriteCity | null
    tripsByCountry: TripsByCountry[]
}

export interface QueuedTripPhoto {
    id: string
    file: File
    previewUrl: string
}

export interface AddTripDraft {
    status: VisibleTripStatus
    country: CountryOption | null
    city: CityOption | null
    dateFrom: string
    dateTo: string
    notes: string
    checklist: string[]
    photos: QueuedTripPhoto[]
}

export interface CreateVisitPayload {
    country_code: string
    title: string
    description?: string
    visibility: 'private'
    status: VisibleTripStatus
    date_from?: string
    date_to?: string
    city_ids?: string[]
}

export interface UpdateVisitPayload {
    description?: string
    cover_file_id?: string | null
    date_from?: string | null
    date_to?: string | null
}
