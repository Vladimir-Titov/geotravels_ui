import { requestJson } from '../../shared/api/http'
import type { CountriesListResponse } from '../../shared/api/types'

export interface GeoFeature {
  type: 'Feature'
  properties?: Record<string, unknown>
  geometry: unknown
}

export interface CountriesGeoJson {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

export const fetchCountries = async (): Promise<CountriesListResponse> => {
  return requestJson<CountriesListResponse>('/api/v1/countries')
}

export const fetchCountriesGeoJson = async (): Promise<CountriesGeoJson> => {
  return requestJson<CountriesGeoJson>('/api/v1/countries/geojson')
}
