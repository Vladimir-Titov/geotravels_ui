import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AtlasMap } from '../../../features/map/atlas-map'
import type { CountriesGeoJson } from '../../../features/map/countries-api'

const geoJsonFixture: CountriesGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        iso_a2: 'FR',
        name: 'France',
        mapcolor13: 1,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-5, 42],
            [8, 42],
            [8, 51],
            [-5, 51],
            [-5, 42],
          ],
        ],
      },
    },
  ],
}

describe('AtlasMap', () => {
  it('selects a country when its SVG path is clicked', async () => {
    const onCountrySelect = vi.fn()

    render(
      <AtlasMap
        geoJson={geoJsonFixture}
        selectedCountryCode={null}
        visitedCountryCodes={new Set()}
        onCountrySelect={onCountrySelect}
      />,
    )

    fireEvent.click(await screen.findByRole('button', { name: 'France' }))

    expect(onCountrySelect).toHaveBeenCalledWith({
      code: 'FR',
      name: 'France',
    })
  })

  it('keeps country selection working after zoom changes', async () => {
    const onCountrySelect = vi.fn()

    render(
      <AtlasMap
        geoJson={geoJsonFixture}
        selectedCountryCode={null}
        visitedCountryCodes={new Set(['FR'])}
        onCountrySelect={onCountrySelect}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    fireEvent.click(await screen.findByRole('button', { name: 'France' }))

    expect(onCountrySelect).toHaveBeenCalledWith({
      code: 'FR',
      name: 'France',
    })
  })

  it('does not start pan capture when clicking a country after zoom', async () => {
    const onCountrySelect = vi.fn()

    render(
      <AtlasMap
        geoJson={geoJsonFixture}
        selectedCountryCode={null}
        visitedCountryCodes={new Set()}
        onCountrySelect={onCountrySelect}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))

    const svg = screen.getByTestId('atlas-map')
    const setPointerCapture = vi.fn()
    Object.defineProperty(svg, 'setPointerCapture', {
      value: setPointerCapture,
      configurable: true,
    })

    fireEvent.pointerDown(screen.getByRole('button', { name: 'France' }), { pointerId: 1 })

    expect(setPointerCapture).not.toHaveBeenCalled()
  })
})
