import './atlas-map.css'
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import { useId, useMemo, useRef, useState } from 'react'
import type { CountriesGeoJson, GeoFeature } from './countries-api'

interface AtlasMapProps {
    geoJson: CountriesGeoJson
    selectedCountryCode: string | null
    visitedCountryCodes: Set<string>
    onCountrySelect: (country: { code: string; name: string }) => void
}

interface ViewBox {
    x: number
    y: number
    width: number
    height: number
}

const MAP_WIDTH = 1200
const MAP_HEIGHT = 720
const MIN_ZOOM = 1
const MAX_ZOOM = 3.2
const ZOOM_STEP = 1.2
const CANVAS_PADDING = 44
const PALETTE = [
    '#d6d9b3',
    '#e2c0a0',
    '#d3b8cf',
    '#bdd7e2',
    '#e8d786',
    '#c7dfa0',
    '#f0c29d',
    '#cfc9e4',
    '#d7e4c6',
    '#e3d3a8',
    '#c6d9d6',
    '#e5cfc0',
    '#c6cfdf',
]

const INITIAL_VIEW_BOX: ViewBox = {
    x: 0,
    y: 0,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
}

const clamp = (value: number, min: number, max: number): number => {
    return Math.min(max, Math.max(min, value))
}

const clampViewBox = (viewBox: ViewBox): ViewBox => {
    const maxX = MAP_WIDTH - viewBox.width
    const maxY = MAP_HEIGHT - viewBox.height

    return {
        ...viewBox,
        x: clamp(viewBox.x, 0, Math.max(0, maxX)),
        y: clamp(viewBox.y, 0, Math.max(0, maxY)),
    }
}

const getBaseCountryFill = (feature: GeoFeature): string => {
    const mapColor = feature.properties?.mapcolor13
    const countryCode = feature.properties?.iso_a2 ?? ''
    const paletteIndex =
        typeof mapColor === 'number' && Number.isFinite(mapColor)
            ? Math.abs(mapColor) % PALETTE.length
            : countryCode.split('').reduce((total, char) => total + char.charCodeAt(0), 0) %
              PALETTE.length

    return PALETTE[paletteIndex] ?? PALETTE[0]
}

const isCountryTarget = (target: EventTarget | null): boolean => {
    return target instanceof Element && Boolean(target.closest('[data-country-code]'))
}

export const AtlasMap = ({
    geoJson,
    selectedCountryCode,
    visitedCountryCodes,
    onCountrySelect,
}: AtlasMapProps) => {
    const [viewBox, setViewBox] = useState<ViewBox>(INITIAL_VIEW_BOX)
    const [hoveredCountryCode, setHoveredCountryCode] = useState<string | null>(null)
    const dragStateRef = useRef<{
        pointerId: number
        clientX: number
        clientY: number
        viewBox: ViewBox
    } | null>(null)

    const clipPathId = useId()
    const projection = useMemo(() => {
        return geoNaturalEarth1().fitExtent(
            [
                [CANVAS_PADDING, CANVAS_PADDING],
                [MAP_WIDTH - CANVAS_PADDING, MAP_HEIGHT - CANVAS_PADDING],
            ],
            geoJson,
        )
    }, [geoJson])
    const pathGenerator = useMemo(() => geoPath(projection), [projection])
    const graticule = useMemo(() => geoGraticule10(), [])
    const graticulePath = pathGenerator(graticule) ?? ''
    const spherePath = pathGenerator({ type: 'Sphere' }) ?? ''
    const zoomLevel = MAP_WIDTH / viewBox.width
    const isZoomed = zoomLevel > 1.02

    const updateZoom = (
        nextZoom: number,
        focusX = MAP_WIDTH / 2,
        focusY = MAP_HEIGHT / 2,
    ): void => {
        setViewBox((currentViewBox) => {
            const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM)
            const nextWidth = MAP_WIDTH / clampedZoom
            const nextHeight = MAP_HEIGHT / clampedZoom
            const focusRatioX = (focusX - currentViewBox.x) / currentViewBox.width
            const focusRatioY = (focusY - currentViewBox.y) / currentViewBox.height

            return clampViewBox({
                x: focusX - focusRatioX * nextWidth,
                y: focusY - focusRatioY * nextHeight,
                width: nextWidth,
                height: nextHeight,
            })
        })
    }

    const resetView = (): void => {
        setViewBox(INITIAL_VIEW_BOX)
    }

    const beginPan = (event: ReactPointerEvent<SVGSVGElement>): void => {
        if (!isZoomed || isCountryTarget(event.target)) {
            return
        }

        event.currentTarget.setPointerCapture(event.pointerId)
        dragStateRef.current = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            viewBox,
        }
    }

    const movePan = (event: ReactPointerEvent<SVGSVGElement>): void => {
        const dragState = dragStateRef.current
        if (!dragState || dragState.pointerId !== event.pointerId) {
            return
        }

        const rect = event.currentTarget.getBoundingClientRect()
        const deltaX = ((event.clientX - dragState.clientX) / rect.width) * dragState.viewBox.width
        const deltaY =
            ((event.clientY - dragState.clientY) / rect.height) * dragState.viewBox.height

        setViewBox(
            clampViewBox({
                ...dragState.viewBox,
                x: dragState.viewBox.x - deltaX,
                y: dragState.viewBox.y - deltaY,
            }),
        )
    }

    const endPan = (event?: ReactPointerEvent<SVGSVGElement>): void => {
        if (event && dragStateRef.current?.pointerId === event.pointerId) {
            event.currentTarget.releasePointerCapture(event.pointerId)
        }
        dragStateRef.current = null
    }

    const handleWheel = (event: ReactWheelEvent<SVGSVGElement>): void => {
        event.preventDefault()

        const rect = event.currentTarget.getBoundingClientRect()
        const focusX = viewBox.x + ((event.clientX - rect.left) / rect.width) * viewBox.width
        const focusY = viewBox.y + ((event.clientY - rect.top) / rect.height) * viewBox.height
        const nextZoom = event.deltaY < 0 ? zoomLevel * ZOOM_STEP : zoomLevel / ZOOM_STEP

        updateZoom(nextZoom, focusX, focusY)
    }

    return (
        <div className="atlas-shell">
            <div className="atlas-toolbar">
                <button
                    type="button"
                    onClick={() => updateZoom(zoomLevel * ZOOM_STEP)}
                    aria-label="Zoom in"
                >
                    +
                </button>
                <button
                    type="button"
                    onClick={() => updateZoom(zoomLevel / ZOOM_STEP)}
                    aria-label="Zoom out"
                >
                    -
                </button>
                <button type="button" onClick={resetView} aria-label="Reset map view">
                    Reset
                </button>
            </div>

            <svg
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                className={isZoomed ? 'atlas-canvas atlas-canvas-zoomed' : 'atlas-canvas'}
                data-testid="atlas-map"
                onPointerDown={beginPan}
                onPointerMove={movePan}
                onPointerUp={endPan}
                onPointerLeave={(event) => {
                    setHoveredCountryCode(null)
                    endPan(event)
                }}
                onPointerCancel={endPan}
                onWheel={handleWheel}
            >
                <defs>
                    <clipPath id={clipPathId}>
                        <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} rx="28" ry="28" />
                    </clipPath>
                </defs>

                <g clipPath={`url(#${clipPathId})`}>
                    <rect
                        x="0"
                        y="0"
                        width={MAP_WIDTH}
                        height={MAP_HEIGHT}
                        className="atlas-paper"
                    />
                    <path d={spherePath} className="atlas-ocean" />
                    <path d={graticulePath} className="atlas-graticule" />

                    {geoJson.features.map((feature) => {
                        const countryCode = feature.properties?.iso_a2?.toUpperCase()
                        const countryName =
                            feature.properties?.name ?? countryCode ?? 'Unknown country'
                        const countryPath = pathGenerator(feature)

                        if (!countryCode || !countryPath) {
                            return null
                        }

                        const isSelected = selectedCountryCode === countryCode
                        const isHovered = hoveredCountryCode === countryCode
                        const isVisited = visitedCountryCodes.has(countryCode)
                        const fill = isVisited ? '#0e8f14' : getBaseCountryFill(feature)
                        const stroke = isSelected ? '#2f5367' : isVisited ? '#556545' : '#8c8478'
                        const strokeWidth = isSelected ? 2.2 : isHovered ? 1.5 : 0.9

                        return (
                            <path
                                key={countryCode}
                                d={countryPath}
                                role="button"
                                tabIndex={0}
                                aria-label={countryName}
                                aria-pressed={isSelected}
                                data-country-code={countryCode}
                                className="atlas-country"
                                style={{
                                    fill,
                                    stroke,
                                    strokeWidth,
                                    opacity: isHovered || isSelected ? 1 : 0.95,
                                }}
                                onClick={() =>
                                    onCountrySelect({ code: countryCode, name: countryName })
                                }
                                onMouseEnter={() => setHoveredCountryCode(countryCode)}
                                onMouseLeave={() =>
                                    setHoveredCountryCode((currentValue) =>
                                        currentValue === countryCode ? null : currentValue,
                                    )
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault()
                                        onCountrySelect({ code: countryCode, name: countryName })
                                    }
                                }}
                            />
                        )
                    })}
                </g>
            </svg>
        </div>
    )
}
