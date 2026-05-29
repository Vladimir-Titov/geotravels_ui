import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AddTripModal } from '../../../features/trips/add-trip-modal'

const apiMocks = vi.hoisted(() => ({
    createChecklistItem: vi.fn(),
    createVisit: vi.fn(),
    createVisitPlaces: vi.fn(),
    searchCities: vi.fn(),
    searchCountries: vi.fn(),
    suggestCityPlaces: vi.fn(),
    updateVisit: vi.fn(),
    uploadVisitPhoto: vi.fn(),
}))

vi.mock('../../../features/trips/trips-api', async () => {
    const actual = await vi.importActual<Record<string, unknown>>(
        '../../../features/trips/trips-api',
    )
    return {
        ...actual,
        createChecklistItem: apiMocks.createChecklistItem,
        createVisit: apiMocks.createVisit,
        createVisitPlaces: apiMocks.createVisitPlaces,
        searchCities: apiMocks.searchCities,
        searchCountries: apiMocks.searchCountries,
        suggestCityPlaces: apiMocks.suggestCityPlaces,
        updateVisit: apiMocks.updateVisit,
        uploadVisitPhoto: apiMocks.uploadVisitPhoto,
    }
})

describe('AddTripModal', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        apiMocks.searchCountries.mockResolvedValue([{ code: 'IT', name: 'Italy' }])
        apiMocks.searchCities.mockResolvedValue([{ id: 'city-1', name: 'Rome', countryCode: 'IT' }])
        apiMocks.suggestCityPlaces.mockResolvedValue([
            {
                title: 'Colosseum',
                address: 'Piazza del Colosseo',
                description: 'Ancient amphitheatre in the center of Rome.',
            },
        ])
        apiMocks.createVisit.mockResolvedValue({
            id: 'visit-1',
            status: 'planned',
            cover_file_id: null,
        })
        apiMocks.createChecklistItem.mockResolvedValue(undefined)
        apiMocks.createVisitPlaces.mockResolvedValue(undefined)
        apiMocks.updateVisit.mockResolvedValue({
            id: 'visit-1',
            status: 'planned',
            cover_file_id: null,
        })
        apiMocks.uploadVisitPhoto.mockResolvedValue({
            id: 'file-1',
            file_url: '/file',
            is_cover: false,
        })
    })

    it('creates planned trip with optional dates and checklist', async () => {
        const onSaved = vi.fn()

        render(<AddTripModal initialStatus="planned" onClose={vi.fn()} onSaved={onSaved} />)

        fireEvent.click(screen.getByRole('button', { name: /next/i }))

        fireEvent.change(screen.getByPlaceholderText('For example, Italy'), {
            target: { value: 'Ita' },
        })
        await waitFor(() => expect(apiMocks.searchCountries).toHaveBeenCalled())
        fireEvent.click(await screen.findByRole('button', { name: 'Italy' }))

        fireEvent.change(screen.getByPlaceholderText('For example, Rome'), {
            target: { value: 'Rom' },
        })
        await waitFor(() => expect(apiMocks.searchCities).toHaveBeenCalled())
        fireEvent.click(await screen.findByRole('button', { name: 'Rome' }))

        fireEvent.click(screen.getByRole('button', { name: /next/i }))
        fireEvent.click(screen.getByRole('button', { name: /next/i }))

        fireEvent.change(screen.getByPlaceholderText('Add task...'), {
            target: { value: 'Book hotel' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Add task' }))
        fireEvent.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(apiMocks.createVisit).toHaveBeenCalledWith(
                expect.objectContaining({
                    country_code: 'IT',
                    city_ids: ['city-1'],
                    status: 'planned',
                    title: 'Rome',
                }),
            )
        })
        expect(apiMocks.createVisit.mock.calls[0][0]).not.toHaveProperty('trip_start')
        await waitFor(() =>
            expect(apiMocks.createChecklistItem).toHaveBeenCalledWith('visit-1', 'Book hotel'),
        )
        expect(onSaved).toHaveBeenCalledWith('planned', 'visit-1')
    })

    it('adds places to the trip draft', async () => {
        render(<AddTripModal initialStatus="planned" onClose={vi.fn()} onSaved={vi.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: /next/i }))

        fireEvent.change(screen.getByPlaceholderText('For example, Italy'), {
            target: { value: 'Ita' },
        })
        await waitFor(() => expect(apiMocks.searchCountries).toHaveBeenCalled())
        fireEvent.click(await screen.findByRole('button', { name: 'Italy' }))

        fireEvent.click(screen.getByRole('button', { name: /next/i }))
        fireEvent.click(screen.getByRole('button', { name: /next/i }))

        fireEvent.change(screen.getByPlaceholderText('Add place...'), {
            target: { value: 'Colosseum' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Add place' }))

        expect(screen.getByText('Places to visit')).toBeInTheDocument()
        expect(screen.getByText('Colosseum')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Ask AI' })).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /save/i }))
        await waitFor(() =>
            expect(apiMocks.createVisitPlaces).toHaveBeenCalledWith('visit-1', [
                { title: 'Colosseum', address: null, description: null },
            ]),
        )
    })

    it('adds AI suggested places with address and description', async () => {
        render(<AddTripModal initialStatus="planned" onClose={vi.fn()} onSaved={vi.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: /next/i }))

        fireEvent.change(screen.getByPlaceholderText('For example, Italy'), {
            target: { value: 'Ita' },
        })
        await waitFor(() => expect(apiMocks.searchCountries).toHaveBeenCalled())
        fireEvent.click(await screen.findByRole('button', { name: 'Italy' }))

        fireEvent.change(screen.getByPlaceholderText('For example, Rome'), {
            target: { value: 'Rom' },
        })
        await waitFor(() => expect(apiMocks.searchCities).toHaveBeenCalled())
        fireEvent.click(await screen.findByRole('button', { name: 'Rome' }))

        fireEvent.click(screen.getByRole('button', { name: /next/i }))
        fireEvent.click(screen.getByRole('button', { name: /next/i }))
        fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }))

        expect(await screen.findByText('Piazza del Colosseo')).toBeInTheDocument()
        expect(screen.getByText('Ancient amphitheatre in the center of Rome.')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Add' }))
        fireEvent.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() =>
            expect(apiMocks.createVisitPlaces).toHaveBeenCalledWith('visit-1', [
                {
                    title: 'Colosseum',
                    address: 'Piazza del Colosseo',
                    description: 'Ancient amphitheatre in the center of Rome.',
                },
            ]),
        )
    })
})
