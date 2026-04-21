import { describe, expect, it } from 'vitest'
import type { AddStoryState } from '../../../features/my-travels/add-story/add-story-types'
import {
    selectIsPublishDisabled,
    selectIsStep1NextDisabled,
    selectIsStep2NextDisabled,
    validatePublish,
    validateStep1,
    validateStep2,
} from '../../../features/my-travels/add-story/add-story-validation'

const createState = (): AddStoryState => ({
    step: 'step1',
    draft: {
        title: 'Weekend in Istanbul',
        country: {
            code: 'TR',
            name: 'Turkey',
        },
        cities: [],
        dateFrom: '2026-04-01',
        dateTo: '2026-04-05',
        description: '',
    },
    draftId: 'visit-1',
    uploadedFiles: [],
    selectedVisibility: 'friends',
    pendingAction: null,
    fieldErrors: {},
    requestError: null,
})

describe('add-story validation', () => {
    it('validates step 1 required fields', () => {
        const errors = validateStep1({
            title: '',
            country: null,
            cities: [],
            dateFrom: '',
            dateTo: '',
            description: '',
        })

        expect(errors).toEqual({
            title: 'addStory.validation.titleRequired',
            country: 'addStory.validation.countryRequired',
        })
    })

    it('validates step 2 date range', () => {
        const errors = validateStep2({
            title: 'Trip',
            country: { code: 'TR', name: 'Turkey' },
            cities: [],
            dateFrom: '2026-04-05',
            dateTo: '2026-04-01',
            description: '',
        })

        expect(errors.dateRange).toBe('addStory.validation.dateRangeInvalid')
    })

    it('disables step next buttons only when data is incomplete', () => {
        const state = createState()

        expect(selectIsStep1NextDisabled(state)).toBe(false)
        expect(selectIsStep2NextDisabled(state)).toBe(false)

        const withoutCountry = {
            ...state,
            draft: {
                ...state.draft,
                country: null,
            },
        }
        expect(selectIsStep1NextDisabled(withoutCountry)).toBe(true)
    })

    it('requires saved draft and finished uploads before publish', () => {
        const state = createState()
        expect(validatePublish(state)).toEqual({})
        expect(selectIsPublishDisabled(state)).toBe(false)

        const withoutDraftId = { ...state, draftId: null }
        expect(validatePublish(withoutDraftId).publish).toBe('addStory.validation.draftMissing')

        const withUploading = {
            ...state,
            uploadedFiles: [
                {
                    localId: 'photo-1',
                    file: new File(['content'], 'one.jpg', { type: 'image/jpeg' }),
                    previewUrl: 'blob:one',
                    status: 'uploading' as const,
                    fileId: null,
                    fileUrl: null,
                    error: null,
                    isCover: false,
                },
            ],
        }
        expect(validatePublish(withUploading).publish).toBe('addStory.validation.uploadInProgress')
    })
})
