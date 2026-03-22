import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GalleryPage } from '../../../features/gallery'

describe('GalleryPage', () => {
    it('renders page and keeps add button disabled', () => {
        render(<GalleryPage />)

        expect(screen.getByRole('heading', { name: 'Photo Archive' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Add frames/i })).toBeDisabled()
    })
})
