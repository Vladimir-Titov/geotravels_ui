import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { TopNavigation } from '../../../shared/ui'

describe('TopNavigation', () => {
    it('renders brand and sign out action', () => {
        const onSignOut = vi.fn()
        render(
            <MemoryRouter>
                <TopNavigation onSignOut={onSignOut} />
            </MemoryRouter>,
        )

        expect(screen.getByText('Tripmark')).toBeInTheDocument()
        screen.getByRole('button', { name: /logout/i }).click()
        expect(onSignOut).toHaveBeenCalledTimes(1)
    })
})
