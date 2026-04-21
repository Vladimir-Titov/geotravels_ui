export type StepKey = 'step1' | 'step2' | 'step3'

export type VisibilityOption = 'private' | 'friends' | 'public'

export type UploadStatus = 'uploading' | 'uploaded' | 'failed'

export type PendingAction =
    | 'search-country'
    | 'search-city'
    | 'save-draft'
    | 'upload-photo'
    | 'publish'
    | null

export type AddStoryFieldErrorKey =
    | 'title'
    | 'country'
    | 'dateFrom'
    | 'dateRange'
    | 'publish'

export type ValidationMessageKey =
    | 'addStory.validation.titleRequired'
    | 'addStory.validation.titleTooLong'
    | 'addStory.validation.countryRequired'
    | 'addStory.validation.dateFromRequired'
    | 'addStory.validation.dateRangeInvalid'
    | 'addStory.validation.draftMissing'
    | 'addStory.validation.uploadInProgress'

export type FieldErrors = Partial<Record<AddStoryFieldErrorKey, ValidationMessageKey>>

export interface CountryOption {
    code: string
    name: string
}

export interface CityOption {
    id: string
    name: string
    countryCode: string
}

export interface TravelStoryDraft {
    title: string
    country: CountryOption | null
    cities: CityOption[]
    dateFrom: string
    dateTo: string
    description: string
}

export interface StoryPhoto {
    localId: string
    file: File
    previewUrl: string
    status: UploadStatus
    fileId: string | null
    fileUrl: string | null
    error: string | null
    isCover: boolean
}

export interface AddStoryState {
    step: StepKey
    draft: TravelStoryDraft
    draftId: string | null
    uploadedFiles: StoryPhoto[]
    selectedVisibility: VisibilityOption
    pendingAction: PendingAction
    fieldErrors: FieldErrors
    requestError: string | null
}

export const STORY_TITLE_MAX_LENGTH = 80
export const MAX_STORY_PHOTOS = 6
