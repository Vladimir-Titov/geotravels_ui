import { useMemo, useReducer } from 'react'
import type {
    AddStoryFieldErrorKey,
    AddStoryState,
    CityOption,
    CountryOption,
    FieldErrors,
    PendingAction,
    StepKey,
    StoryPhoto,
    VisibilityOption,
} from './add-story-types'

const createInitialDraft = () => ({
    title: '',
    country: null,
    cities: [],
    dateFrom: '',
    dateTo: '',
    description: '',
})

export const createInitialAddStoryState = (): AddStoryState => ({
    step: 'step1',
    draft: createInitialDraft(),
    draftId: null,
    uploadedFiles: [],
    selectedVisibility: 'private',
    pendingAction: null,
    fieldErrors: {},
    requestError: null,
})

export type AddStoryDraftAction =
    | { type: 'setStep'; step: StepKey }
    | { type: 'setTitle'; title: string }
    | { type: 'setCountry'; country: CountryOption | null }
    | { type: 'addCity'; city: CityOption }
    | { type: 'removeCity'; cityId: string }
    | { type: 'setDateFrom'; dateFrom: string }
    | { type: 'setDateTo'; dateTo: string }
    | { type: 'setDescription'; description: string }
    | { type: 'setVisibility'; visibility: VisibilityOption }
    | { type: 'setDraftId'; draftId: string | null }
    | { type: 'setPendingAction'; pendingAction: PendingAction }
    | { type: 'clearPendingAction'; expected?: Exclude<PendingAction, null> }
    | { type: 'setFieldErrors'; errors: FieldErrors }
    | { type: 'clearFieldError'; field: AddStoryFieldErrorKey }
    | { type: 'setRequestError'; requestError: string | null }
    | { type: 'addPhotos'; photos: StoryPhoto[] }
    | { type: 'setPhotoUploading'; localId: string }
    | { type: 'setPhotoUploaded'; localId: string; fileId: string; fileUrl: string }
    | { type: 'setPhotoFailed'; localId: string; error: string }
    | { type: 'setCoverPhoto'; localId: string }
    | { type: 'removePhoto'; localId: string }

const clearField = (errors: FieldErrors, field: AddStoryFieldErrorKey): FieldErrors => {
    const next = { ...errors }
    delete next[field]
    return next
}

const nextFilesAfterRemoval = (uploadedFiles: StoryPhoto[], localId: string): StoryPhoto[] => {
    const nextFiles = uploadedFiles.filter((photo) => photo.localId !== localId)
    const hasCover = nextFiles.some((photo) => photo.isCover && photo.status === 'uploaded')
    if (hasCover) {
        return nextFiles
    }

    const firstUploaded = nextFiles.find((photo) => photo.status === 'uploaded')
    if (!firstUploaded) {
        return nextFiles
    }

    return nextFiles.map((photo) => ({
        ...photo,
        isCover: photo.localId === firstUploaded.localId,
    }))
}

export const addStoryDraftReducer = (
    state: AddStoryState,
    action: AddStoryDraftAction,
): AddStoryState => {
    switch (action.type) {
        case 'setStep':
            return {
                ...state,
                step: action.step,
                fieldErrors: {},
                requestError: null,
            }
        case 'setTitle':
            return {
                ...state,
                draft: { ...state.draft, title: action.title },
                fieldErrors: clearField(state.fieldErrors, 'title'),
            }
        case 'setCountry':
            return {
                ...state,
                draft: {
                    ...state.draft,
                    country: action.country,
                    cities: [],
                },
                fieldErrors: clearField(state.fieldErrors, 'country'),
            }
        case 'addCity': {
            if (state.draft.cities.some((city) => city.id === action.city.id)) {
                return state
            }
            return {
                ...state,
                draft: { ...state.draft, cities: [...state.draft.cities, action.city] },
            }
        }
        case 'removeCity':
            return {
                ...state,
                draft: {
                    ...state.draft,
                    cities: state.draft.cities.filter((city) => city.id !== action.cityId),
                },
            }
        case 'setDateFrom':
            return {
                ...state,
                draft: { ...state.draft, dateFrom: action.dateFrom },
                fieldErrors: clearField(clearField(state.fieldErrors, 'dateFrom'), 'dateRange'),
            }
        case 'setDateTo':
            return {
                ...state,
                draft: { ...state.draft, dateTo: action.dateTo },
                fieldErrors: clearField(clearField(state.fieldErrors, 'dateFrom'), 'dateRange'),
            }
        case 'setDescription':
            return {
                ...state,
                draft: { ...state.draft, description: action.description },
            }
        case 'setVisibility':
            return {
                ...state,
                selectedVisibility: action.visibility,
            }
        case 'setDraftId':
            return {
                ...state,
                draftId: action.draftId,
            }
        case 'setPendingAction':
            return {
                ...state,
                pendingAction: action.pendingAction,
            }
        case 'clearPendingAction':
            if (action.expected && state.pendingAction !== action.expected) {
                return state
            }
            return {
                ...state,
                pendingAction: null,
            }
        case 'setFieldErrors':
            return {
                ...state,
                fieldErrors: action.errors,
            }
        case 'clearFieldError':
            return {
                ...state,
                fieldErrors: clearField(state.fieldErrors, action.field),
            }
        case 'setRequestError':
            return {
                ...state,
                requestError: action.requestError,
            }
        case 'addPhotos':
            return {
                ...state,
                uploadedFiles: [...state.uploadedFiles, ...action.photos],
            }
        case 'setPhotoUploading':
            return {
                ...state,
                uploadedFiles: state.uploadedFiles.map((photo) =>
                    photo.localId === action.localId
                        ? {
                              ...photo,
                              status: 'uploading',
                              error: null,
                          }
                        : photo,
                ),
            }
        case 'setPhotoUploaded': {
            const hasCover = state.uploadedFiles.some(
                (photo) => photo.status === 'uploaded' && photo.isCover && photo.localId !== action.localId,
            )
            return {
                ...state,
                uploadedFiles: state.uploadedFiles.map((photo) => {
                    if (photo.localId !== action.localId) {
                        return photo
                    }
                    return {
                        ...photo,
                        status: 'uploaded',
                        fileId: action.fileId,
                        fileUrl: action.fileUrl,
                        error: null,
                        isCover: hasCover ? photo.isCover : true,
                    }
                }),
            }
        }
        case 'setPhotoFailed':
            return {
                ...state,
                uploadedFiles: state.uploadedFiles.map((photo) =>
                    photo.localId === action.localId
                        ? {
                              ...photo,
                              status: 'failed',
                              error: action.error,
                          }
                        : photo,
                ),
            }
        case 'setCoverPhoto':
            return {
                ...state,
                uploadedFiles: state.uploadedFiles.map((photo) => ({
                    ...photo,
                    isCover: photo.status === 'uploaded' && photo.localId === action.localId,
                })),
            }
        case 'removePhoto':
            return {
                ...state,
                uploadedFiles: nextFilesAfterRemoval(state.uploadedFiles, action.localId),
            }
        default:
            return state
    }
}

export interface AddStoryDraftActions {
    setStep: (step: StepKey) => void
    setTitle: (title: string) => void
    setCountry: (country: CountryOption | null) => void
    addCity: (city: CityOption) => void
    removeCity: (cityId: string) => void
    setDateFrom: (dateFrom: string) => void
    setDateTo: (dateTo: string) => void
    setDescription: (description: string) => void
    setVisibility: (visibility: VisibilityOption) => void
    setDraftId: (draftId: string | null) => void
    setPendingAction: (pendingAction: PendingAction) => void
    clearPendingAction: (expected?: Exclude<PendingAction, null>) => void
    setFieldErrors: (errors: FieldErrors) => void
    clearFieldError: (field: AddStoryFieldErrorKey) => void
    setRequestError: (requestError: string | null) => void
    addPhotos: (photos: StoryPhoto[]) => void
    setPhotoUploading: (localId: string) => void
    setPhotoUploaded: (localId: string, fileId: string, fileUrl: string) => void
    setPhotoFailed: (localId: string, error: string) => void
    setCoverPhoto: (localId: string) => void
    removePhoto: (localId: string) => void
}

export const useAddStoryDraft = (): { state: AddStoryState; actions: AddStoryDraftActions } => {
    const [state, dispatch] = useReducer(addStoryDraftReducer, undefined, createInitialAddStoryState)

    const actions = useMemo<AddStoryDraftActions>(
        () => ({
            setStep: (step) => dispatch({ type: 'setStep', step }),
            setTitle: (title) => dispatch({ type: 'setTitle', title }),
            setCountry: (country) => dispatch({ type: 'setCountry', country }),
            addCity: (city) => dispatch({ type: 'addCity', city }),
            removeCity: (cityId) => dispatch({ type: 'removeCity', cityId }),
            setDateFrom: (dateFrom) => dispatch({ type: 'setDateFrom', dateFrom }),
            setDateTo: (dateTo) => dispatch({ type: 'setDateTo', dateTo }),
            setDescription: (description) => dispatch({ type: 'setDescription', description }),
            setVisibility: (visibility) => dispatch({ type: 'setVisibility', visibility }),
            setDraftId: (draftId) => dispatch({ type: 'setDraftId', draftId }),
            setPendingAction: (pendingAction) => dispatch({ type: 'setPendingAction', pendingAction }),
            clearPendingAction: (expected) => dispatch({ type: 'clearPendingAction', expected }),
            setFieldErrors: (errors) => dispatch({ type: 'setFieldErrors', errors }),
            clearFieldError: (field) => dispatch({ type: 'clearFieldError', field }),
            setRequestError: (requestError) => dispatch({ type: 'setRequestError', requestError }),
            addPhotos: (photos) => dispatch({ type: 'addPhotos', photos }),
            setPhotoUploading: (localId) => dispatch({ type: 'setPhotoUploading', localId }),
            setPhotoUploaded: (localId, fileId, fileUrl) =>
                dispatch({ type: 'setPhotoUploaded', localId, fileId, fileUrl }),
            setPhotoFailed: (localId, error) => dispatch({ type: 'setPhotoFailed', localId, error }),
            setCoverPhoto: (localId) => dispatch({ type: 'setCoverPhoto', localId }),
            removePhoto: (localId) => dispatch({ type: 'removePhoto', localId }),
        }),
        [],
    )

    return {
        state,
        actions,
    }
}
