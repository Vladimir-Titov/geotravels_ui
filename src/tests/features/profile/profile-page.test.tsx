import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfilePage } from '../../../features/profile'

describe('ProfilePage', () => {
    it('renders profile card and keeps edit action disabled', () => {
        render(<ProfilePage />)

        expect(screen.getByRole('heading', { name: 'Профиль' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Редактировать/i })).toBeDisabled()
        expect(screen.getByText('12')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
    })
})
