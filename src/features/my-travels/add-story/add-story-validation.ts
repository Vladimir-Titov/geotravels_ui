import type { AddStoryState, FieldErrors, TravelStoryDraft } from './add-story-types'
import { STORY_TITLE_MAX_LENGTH } from './add-story-types'

const toDate = (value: string): Date | null => {
    if (!value) {
        return null
    }

    const parsed = new Date(`${value}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) {
        return null
    }

    return parsed
}

export const isStep1Complete = (draft: TravelStoryDraft): boolean => {
    const title = draft.title.trim()
    return title.length > 0 && title.length <= STORY_TITLE_MAX_LENGTH && draft.country !== null
}

export const isStep2Complete = (draft: TravelStoryDraft): boolean => {
    if (!draft.dateFrom) {
        return false
    }

    const fromDate = toDate(draft.dateFrom)
    if (!fromDate) {
        return false
    }

    if (!draft.dateTo) {
        return true
    }

    const toDateValue = toDate(draft.dateTo)
    return toDateValue !== null && toDateValue >= fromDate
}

export const hasUploadingFiles = (state: AddStoryState): boolean => {
    return state.uploadedFiles.some((photo) => photo.status === 'uploading')
}

export const validateStep1 = (draft: TravelStoryDraft): FieldErrors => {
    const errors: FieldErrors = {}
    const title = draft.title.trim()

    if (title.length === 0) {
        errors.title = 'addStory.validation.titleRequired'
    } else if (title.length > STORY_TITLE_MAX_LENGTH) {
        errors.title = 'addStory.validation.titleTooLong'
    }

    if (!draft.country) {
        errors.country = 'addStory.validation.countryRequired'
    }

    return errors
}

export const validateStep2 = (draft: TravelStoryDraft): FieldErrors => {
    const errors: FieldErrors = {}

    if (!draft.dateFrom) {
        errors.dateFrom = 'addStory.validation.dateFromRequired'
        return errors
    }

    const fromDate = toDate(draft.dateFrom)
    const toDateValue = toDate(draft.dateTo)

    if (!fromDate || (draft.dateTo && (!toDateValue || toDateValue < fromDate))) {
        errors.dateRange = 'addStory.validation.dateRangeInvalid'
    }

    return errors
}

export const validatePublish = (state: AddStoryState): FieldErrors => {
    const errors: FieldErrors = {}

    if (!state.draftId) {
        errors.publish = 'addStory.validation.draftMissing'
    } else if (hasUploadingFiles(state)) {
        errors.publish = 'addStory.validation.uploadInProgress'
    }

    return errors
}

const hasErrors = (errors: FieldErrors): boolean => Object.keys(errors).length > 0

export const selectIsStep1NextDisabled = (state: AddStoryState): boolean => {
    return state.pendingAction === 'save-draft' || !isStep1Complete(state.draft)
}

export const selectIsStep2NextDisabled = (state: AddStoryState): boolean => {
    return state.pendingAction === 'save-draft' || !isStep2Complete(state.draft)
}

export const selectIsPublishDisabled = (state: AddStoryState): boolean => {
    if (state.pendingAction === 'publish' || state.pendingAction === 'save-draft') {
        return true
    }
    return hasErrors(validatePublish(state))
}
