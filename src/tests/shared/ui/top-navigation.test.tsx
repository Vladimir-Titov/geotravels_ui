import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { TopNavigation } from '../../../shared/ui'

describe('TopNavigation', () => {
    it('renders user and inbox from props', () => {
        render(
            <MemoryRouter>
                <TopNavigation
                    onSignOut={vi.fn()}
                    userFullName="Olivia Parker"
                    unreadInboxCount={7}
                />
            </MemoryRouter>,
        )

        expect(screen.getByText('Inbox 7')).toBeInTheDocument()
        expect(screen.getByText('Olivia')).toBeInTheDocument()
        expect(screen.getByText('Parker')).toBeInTheDocument()
    })

    it('falls back to generic user state when data is missing', () => {
        render(
            <MemoryRouter>
                <TopNavigation onSignOut={vi.fn()} />
            </MemoryRouter>,
        )

        expect(screen.getByText('Inbox 0')).toBeInTheDocument()
        expect(screen.getByText('Traveler')).toBeInTheDocument()
    })
})
