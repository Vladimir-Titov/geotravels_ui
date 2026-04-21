import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AddStoryPage } from '../../../features/my-travels/add-story'

const searchCountriesMock = vi.fn()
const searchCitiesMock = vi.fn()
const createVisitDraftMock = vi.fn()
const updateVisitDraftMock = vi.fn()
const uploadVisitPhotoMock = vi.fn()
const refetchMock = vi.fn(async () => undefined)

vi.mock('../../../features/my-travels/add-story/add-story-api', () => ({
    searchCountries: (...args: unknown[]) => searchCountriesMock(...args),
    searchCities: (...args: unknown[]) => searchCitiesMock(...args),
    createVisitDraft: (...args: unknown[]) => createVisitDraftMock(...args),
    updateVisitDraft: (...args: unknown[]) => updateVisitDraftMock(...args),
    uploadVisitPhoto: (...args: unknown[]) => uploadVisitPhotoMock(...args),
}))

vi.mock('../../../features/my-travels/use-my-travels-dashboard', () => ({
    useMyTravelsDashboard: () => ({
        refetch: refetchMock,
    }),
}))

describe('AddStoryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        searchCountriesMock.mockResolvedValue([
            {
                code: 'TR',
                name: 'Turkey',
            },
        ])
        searchCitiesMock.mockResolvedValue([
            {
                id: 'city-1',
                name: 'Istanbul',
                countryCode: 'TR',
            },
        ])
        createVisitDraftMock.mockResolvedValue({
            id: 'visit-1',
            country_code: 'TR',
            title: 'Weekend in Istanbul',
            description: null,
            visibility: 'private',
            date_from: '2026-04-01',
            date_to: null,
            city_ids: [],
            cover_file_id: null,
        })
        updateVisitDraftMock.mockResolvedValue({
            id: 'visit-1',
            country_code: 'TR',
            title: 'Weekend in Istanbul',
            description: 'Great trip',
            visibility: 'followers',
            date_from: '2026-04-01',
            date_to: null,
            city_ids: [],
            cover_file_id: null,
        })
    })

    it('keeps CTA disabled until required fields are filled', () => {
        render(
            <MemoryRouter>
                <AddStoryPage />
            </MemoryRouter>,
        )

        expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled()
    })

    it('completes 3-step flow and redirects after publish', async () => {
        render(
            <MemoryRouter initialEntries={['/my-travels/add-story']}>
                <Routes>
                    <Route path="/my-travels/add-story" element={<AddStoryPage />} />
                    <Route path="/my-travels" element={<div>Dashboard page</div>} />
                </Routes>
            </MemoryRouter>,
        )

        fireEvent.change(screen.getByPlaceholderText('Weekend in Istanbul'), {
            target: { value: 'Weekend in Istanbul' },
        })
        fireEvent.change(screen.getByPlaceholderText('Start typing country...'), {
            target: { value: 'Tur' },
        })

        await waitFor(() => expect(searchCountriesMock).toHaveBeenCalled())
        fireEvent.click(await screen.findByRole('button', { name: /Turkey/i }))

        fireEvent.click(screen.getByRole('button', { name: /Next/i }))
        expect(await screen.findByRole('heading', { name: 'When was it?' })).toBeInTheDocument()

        fireEvent.change(screen.getByLabelText('Start date'), {
            target: { value: '2026-04-01' },
        })
        fireEvent.click(screen.getByRole('button', { name: /Friends/i }))
        fireEvent.click(screen.getByRole('button', { name: /Next/i }))

        await waitFor(() => {
            expect(createVisitDraftMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    country_code: 'TR',
                    title: 'Weekend in Istanbul',
                    visibility: 'private',
                    date_from: '2026-04-01',
                }),
            )
        })

        expect(await screen.findByRole('heading', { name: 'Share the details' })).toBeInTheDocument()

        fireEvent.change(screen.getByPlaceholderText('What was memorable? Any recommendations?'), {
            target: { value: 'Great trip' },
        })

        fireEvent.click(screen.getByRole('button', { name: /Publish/i }))

        await waitFor(() => {
            expect(updateVisitDraftMock).toHaveBeenLastCalledWith(
                'visit-1',
                expect.objectContaining({
                    visibility: 'followers',
                    description: 'Great trip',
                }),
            )
        })

        await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
        expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
    })
})
