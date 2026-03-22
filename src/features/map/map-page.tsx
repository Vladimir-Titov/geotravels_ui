import './map-page.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, AuthExpiredError } from '../../shared/api/http'
import type { Country } from '../../shared/api/types'
import { DisabledActionButton, SectionHeader, StatCard, SurfaceCard } from '../../shared/ui'
import { AtlasMap } from './atlas-map'
import { fetchCountries, fetchCountriesGeoJson, type CountriesGeoJson } from './countries-api'
import { createVisit, fetchVisits } from '../visits/visits-api'

interface SelectedCountry {
    code: string
    name: string
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
    const [visitsCount, setVisitsCount] = useState(0)
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

        setVisitedCodes(
            new Set(visitsPayload.visited_country_codes.map((code) => code.toUpperCase())),
        )
        setVisitsCount(visitsPayload.visits.length)
    }, [])

    const loadInitialState = useCallback(async (): Promise<void> => {
        setLoading(true)
        setError(null)

        try {
            const [countriesPayload, geoPayload] = await Promise.all([
                fetchCountries(),
                fetchCountriesGeoJson(),
            ])

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
        return <p className="state-message">Loading map data...</p>
    }

    if (!geoJson) {
        return <p className="state-message">GeoJSON is unavailable.</p>
    }

    return (
        <div className="map-page">
            <SectionHeader
                title="Explorer Journal"
                subtitle="Where should we go next?"
                action={<DisabledActionButton>New expedition</DisabledActionButton>}
            />

            <div className="map-page__layout">
                <SurfaceCard className="map-page__card map-page__card--atlas">
                    <div className="map-page__card-head">
                        <h2>World Map</h2>
                        <p>Select a country and add it to your visited list.</p>
                    </div>

                    <AtlasMap
                        geoJson={geoJson}
                        selectedCountryCode={selectedCountry?.code ?? null}
                        visitedCountryCodes={visitedCodes}
                        onCountrySelect={({ code, name }) => {
                            setSelectedCountry({
                                code,
                                name: countryNameByCode.get(code) ?? name,
                            })
                        }}
                    />
                </SurfaceCard>

                <aside className="map-page__sidebar">
                    <SurfaceCard className="map-page__card map-page__card--selection">
                        <h3>Selected country</h3>

                        {selectedCountry ? (
                            <>
                                <p className="country-name">{selectedCountry.name}</p>
                                <p className="country-code">{selectedCountry.code}</p>

                                <label htmlFor="trip-date">Trip date</label>
                                <input
                                    id="trip-date"
                                    type="date"
                                    value={tripDate}
                                    onChange={(event) => setTripDate(event.target.value)}
                                />

                                <button
                                    className="map-page__submit"
                                    onClick={() => void onMarkVisit()}
                                    disabled={isSavingVisit}
                                >
                                    {isSavingVisit ? 'Saving...' : 'Mark as visited'}
                                </button>
                            </>
                        ) : (
                            <p className="map-page__hint">
                                Pick a country on the map to create a visit event.
                            </p>
                        )}

                        {error && <p className="form-error">{error}</p>}
                    </SurfaceCard>

                    <div className="map-page__stats">
                        <StatCard
                            label="Travel notes"
                            value={visitsCount}
                            hint={
                                visitsCount > 0
                                    ? `Latest entry: ${new Date().toLocaleDateString('en-US')}`
                                    : 'Create your first entry'
                            }
                        />
                        <StatCard
                            label="Countries visited"
                            value={visitedCodes.size}
                            hint={`${visitedCodes.size} marked on the map`}
                        />
                    </div>
                </aside>
            </div>
        </div>
    )
}
