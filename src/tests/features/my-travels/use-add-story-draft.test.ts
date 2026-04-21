import { describe, expect, it } from 'vitest'
import {
    addStoryDraftReducer,
    createInitialAddStoryState,
} from '../../../features/my-travels/add-story/use-add-story-draft'

describe('use-add-story-draft reducer', () => {
    it('resets cities when country changes', () => {
        const initial = createInitialAddStoryState()
        const withCountry = addStoryDraftReducer(initial, {
            type: 'setCountry',
            country: {
                code: 'TR',
                name: 'Turkey',
            },
        })

        const withCity = addStoryDraftReducer(withCountry, {
            type: 'addCity',
            city: {
                id: 'city-1',
                name: 'Istanbul',
                countryCode: 'TR',
            },
        })

        const withNewCountry = addStoryDraftReducer(withCity, {
            type: 'setCountry',
            country: {
                code: 'FR',
                name: 'France',
            },
        })

        expect(withCity.draft.cities).toHaveLength(1)
        expect(withNewCountry.draft.cities).toEqual([])
    })

    it('marks the first uploaded file as cover by default', () => {
        const initial = createInitialAddStoryState()
        const withQueued = addStoryDraftReducer(initial, {
            type: 'addPhotos',
            photos: [
                {
                    localId: 'photo-1',
                    file: new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
                    previewUrl: 'blob:a',
                    status: 'uploading',
                    fileId: null,
                    fileUrl: null,
                    error: null,
                    isCover: false,
                },
                {
                    localId: 'photo-2',
                    file: new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
                    previewUrl: 'blob:b',
                    status: 'uploading',
                    fileId: null,
                    fileUrl: null,
                    error: null,
                    isCover: false,
                },
            ],
        })

        const firstUploaded = addStoryDraftReducer(withQueued, {
            type: 'setPhotoUploaded',
            localId: 'photo-1',
            fileId: 'file-1',
            fileUrl: '/api/v1/files/file-1/download',
        })
        const secondUploaded = addStoryDraftReducer(firstUploaded, {
            type: 'setPhotoUploaded',
            localId: 'photo-2',
            fileId: 'file-2',
            fileUrl: '/api/v1/files/file-2/download',
        })

        expect(secondUploaded.uploadedFiles.find((photo) => photo.localId === 'photo-1')?.isCover).toBe(true)
        expect(secondUploaded.uploadedFiles.find((photo) => photo.localId === 'photo-2')?.isCover).toBe(false)
    })

    it('allows selecting another cover photo', () => {
        const initial = createInitialAddStoryState()
        const withFiles = {
            ...initial,
            uploadedFiles: [
                {
                    localId: 'one',
                    file: new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
                    previewUrl: 'blob:a',
                    status: 'uploaded' as const,
                    fileId: 'file-1',
                    fileUrl: '/api/v1/files/file-1/download',
                    error: null,
                    isCover: true,
                },
                {
                    localId: 'two',
                    file: new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
                    previewUrl: 'blob:b',
                    status: 'uploaded' as const,
                    fileId: 'file-2',
                    fileUrl: '/api/v1/files/file-2/download',
                    error: null,
                    isCover: false,
                },
            ],
        }

        const updated = addStoryDraftReducer(withFiles, {
            type: 'setCoverPhoto',
            localId: 'two',
        })

        expect(updated.uploadedFiles.find((photo) => photo.localId === 'one')?.isCover).toBe(false)
        expect(updated.uploadedFiles.find((photo) => photo.localId === 'two')?.isCover).toBe(true)
    })
})
