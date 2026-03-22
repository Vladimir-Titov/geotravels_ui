import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CommunityPage } from '../../../features/community'

describe('CommunityPage', () => {
    it('renders members and keeps social actions disabled', () => {
        render(<CommunityPage />)

        expect(screen.getByRole('heading', { name: 'Сообщество' })).toBeInTheDocument()

        const followButtons = screen.getAllByRole('button', { name: /Подписаться/i })
        followButtons.forEach((button) => {
            expect(button).toBeDisabled()
        })

        expect(screen.getByRole('button', { name: 'Ваши подписки' })).toBeDisabled()
    })
})
