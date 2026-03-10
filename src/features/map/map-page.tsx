import type { Layer } from 'leaflet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet'
import { ApiError, AuthExpiredError } from '../../shared/api/http'
import type { Country } from '../../shared/api/types'
import { fetchCountries, fetchCountriesGeoJson, type CountriesGeoJson, type GeoFeature } from './countries-api'
import { createVisit, fetchVisits } from '../visits/visits-api'

interface SelectedCountry {
  code: string
  name: string
}

const mapCenter: [number, number] = [18, 0]

const getCountryCode = (feature?: GeoFeature): string | null => {
  if (!feature?.properties) {
    return null
  }

  const code = feature.properties['iso_a2']
  if (typeof code !== 'string') {
    return null
  }

  return code.toUpperCase()
}

const getCountryName = (feature?: GeoFeature): string | null => {
  if (!feature?.properties) {
    return null
  }

  const name = feature.properties['name']
  if (typeof name !== 'string') {
    return null
  }

  return name
}

const toErrorMessage = (caught: unknown): string => {
  if (caught instanceof AuthExpiredError) {
    return 'Session expired. Please sign in again.'
  }
  if (caught instanceof ApiError) {
    return caught.message
  }
  return 'Request failed. Try again.'
}

export const MapPage = () => {
  const [countries, setCountries] = useState<Country[]>([])
  const [geoJson, setGeoJson] = useState<CountriesGeoJson | null>(null)
  const [visitedCodes, setVisitedCodes] = useState<Set<string>>(new Set())
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null)
  const [tripDate, setTripDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSavingVisit, setIsSavingVisit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const countryNameByCode = useMemo(() => {
    return new Map(countries.map((country) => [country.iso_a2.toUpperCase(), country.name]))
  }, [countries])

  const reloadVisitedCodes = useCallback(async (): Promise<void> => {
    const visitsPayload = await fetchVisits()
    setVisitedCodes(new Set(visitsPayload.visited_country_codes.map((code) => code.toUpperCase())))
  }, [])

  const loadInitialState = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const [countriesPayload, geoPayload] = await Promise.all([fetchCountries(), fetchCountriesGeoJson()])

      setCountries(countriesPayload.items)
      setGeoJson(geoPayload)
      await reloadVisitedCodes()
    } catch (caught) {
      setError(toErrorMessage(caught))
    } finally {
      setLoading(false)
    }
  }, [reloadVisitedCodes])

  useEffect(() => {
    void loadInitialState()
  }, [loadInitialState])

  const onMarkVisit = useCallback(async (): Promise<void> => {
    if (!selectedCountry) {
      return
    }

    setIsSavingVisit(true)
    setError(null)

    try {
      await createVisit({
        country_code: selectedCountry.code,
        trip_date: tripDate || undefined,
      })
      await reloadVisitedCodes()
      setSelectedCountry(null)
      setTripDate('')
    } catch (caught) {
      setError(toErrorMessage(caught))
    } finally {
      setIsSavingVisit(false)
    }
  }, [reloadVisitedCodes, selectedCountry, tripDate])

  if (loading) {
    return <p className='state-message'>Loading map data...</p>
  }

  if (!geoJson) {
    return <p className='state-message'>GeoJSON is unavailable.</p>
  }

  return (
    <div className='map-layout'>
      <section className='map-card'>
        <div className='map-heading'>
          <h1>World Map</h1>
          <p>Click a country to mark it as visited.</p>
        </div>

        <MapContainer center={mapCenter} zoom={2} minZoom={2} maxZoom={6} className='world-map'>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          <GeoJSON
            data={geoJson as GeoJSON.GeoJsonObject}
            style={(feature) => {
              const code = getCountryCode(feature as GeoFeature | undefined)
              const isVisited = code ? visitedCodes.has(code) : false

              return {
                color: isVisited ? '#075985' : '#2f4858',
                weight: isVisited ? 1.2 : 0.8,
                fillColor: isVisited ? '#22c55e' : '#7db0c6',
                fillOpacity: isVisited ? 0.55 : 0.2,
              }
            }}
            onEachFeature={(feature, layer: Layer) => {
              layer.on({
                click: () => {
                  const code = getCountryCode(feature as GeoFeature)
                  if (!code) {
                    return
                  }

                  const fallbackName = getCountryName(feature as GeoFeature) ?? code
                  setSelectedCountry({
                    code,
                    name: countryNameByCode.get(code) ?? fallbackName,
                  })
                },
              })
            }}
          />
        </MapContainer>
      </section>

      <aside className='map-sidebar'>
        <h2>Selection</h2>
        {selectedCountry ? (
          <>
            <p className='country-name'>{selectedCountry.name}</p>
            <p className='country-code'>{selectedCountry.code}</p>

            <label htmlFor='trip-date'>Trip date (optional)</label>
            <input
              id='trip-date'
              type='date'
              value={tripDate}
              onChange={(event) => setTripDate(event.target.value)}
            />

            <button onClick={() => void onMarkVisit()} disabled={isSavingVisit}>
              {isSavingVisit ? 'Saving...' : 'Mark as visited'}
            </button>
          </>
        ) : (
          <p>Pick a country on the map to create a visit event.</p>
        )}

        <div className='visited-summary'>
          <h3>Visited countries</h3>
          <p>{visitedCodes.size} total</p>
        </div>

        {error && <p className='form-error'>{error}</p>}
      </aside>
    </div>
  )
}
