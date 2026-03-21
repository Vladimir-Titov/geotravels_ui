import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { requestJson } from '../../shared/api/http'
import type { CountriesListResponse } from '../../shared/api/types'

export interface CountryFeatureProperties {
    iso_a2: string
    name: string
    mapcolor13?: number | null
}

export type GeoFeature = Feature<Geometry, CountryFeatureProperties>
export type CountriesGeoJson = FeatureCollection<Geometry, CountryFeatureProperties>

export const fetchCountries = async (): Promise<CountriesListResponse> => {
    return requestJson<CountriesListResponse>('/api/v1/countries')
}

export const fetchCountriesGeoJson = async (): Promise<CountriesGeoJson> => {
    return requestJson<CountriesGeoJson>('/api/v1/countries/geojson')
}
