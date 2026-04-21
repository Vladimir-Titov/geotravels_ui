import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMyTravelsDashboard } from '../use-my-travels-dashboard'
import {
    createVisitDraft,
    searchCities,
    searchCountries,
    updateVisitDraft,
    uploadVisitPhoto,
} from './add-story-api'
import {
    mapDraftToCreateVisitPayload,
    mapDraftToUpdateVisitPayload,
    mapVisibilityOptionToApi,
} from './add-story-mappers'
import { MAX_STORY_PHOTOS } from './add-story-types'
import type { CityOption, CountryOption, StoryPhoto, StepKey } from './add-story-types'
import {
    selectIsPublishDisabled,
    selectIsStep1NextDisabled,
    selectIsStep2NextDisabled,
    validatePublish,
    validateStep1,
    validateStep2,
} from './add-story-validation'
import { useAddStoryDraft } from './use-add-story-draft'
import { AddStoryStepShell, StepOneStory, StepThreePublish, StepTwoTrip } from './components'
import './add-story.css'

const hasValidationErrors = (errors: Record<string, unknown>): boolean => {
    return Object.keys(errors).length > 0
}

const createLocalPhotoId = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random()}`
}

const getRequestErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message
    }
    return fallback
}

const formatStoryPeriod = (dateFrom: string, language: string, fallback: string): string => {
    if (!dateFrom) {
        return fallback
    }

    const date = new Date(`${dateFrom}T00:00:00`)
    if (Number.isNaN(date.getTime())) {
        return fallback
    }

    return date.toLocaleDateString(language, {
        month: 'short',
        year: 'numeric',
    })
}

const getStepTitleKey = (step: StepKey): string => {
    if (step === 'step1') {
        return 'addStory.step1.title'
    }
    if (step === 'step2') {
        return 'addStory.step2.title'
    }
    return 'addStory.step3.title'
}

export const AddStoryPage = () => {
    const navigate = useNavigate()
    const { t, i18n } = useTranslation('myTravels')
    const { refetch } = useMyTravelsDashboard()
    const { state, actions } = useAddStoryDraft()

    const [countryQuery, setCountryQuery] = useState('')
    const [cityQuery, setCityQuery] = useState('')
    const [countryOptions, setCountryOptions] = useState<CountryOption[]>([])
    const [cityOptions, setCityOptions] = useState<CityOption[]>([])
    const [countrySearchError, setCountrySearchError] = useState<string | null>(null)
    const [citySearchError, setCitySearchError] = useState<string | null>(null)
    const [isCountryLoading, setIsCountryLoading] = useState(false)
    const [isCityLoading, setIsCityLoading] = useState(false)
    const [hasCountrySearchResponse, setHasCountrySearchResponse] = useState(false)
    const [hasCitySearchResponse, setHasCitySearchResponse] = useState(false)
    const uploadedPhotoUrlsRef = useRef<string[]>([])

    useEffect(() => {
        const previous = uploadedPhotoUrlsRef.current
        const current = state.uploadedFiles.map((photo) => photo.previewUrl)

        previous
            .filter((url) => !current.includes(url))
            .forEach((url) => {
                URL.revokeObjectURL(url)
            })

        uploadedPhotoUrlsRef.current = current
    }, [state.uploadedFiles])

    useEffect(() => {
        return () => {
            uploadedPhotoUrlsRef.current.forEach((url) => {
                URL.revokeObjectURL(url)
            })
        }
    }, [])

    useEffect(() => {
        if (state.step !== 'step1') {
            return
        }

        const query = countryQuery.trim()
        if (query.length < 2) {
            setCountryOptions([])
            setCountrySearchError(null)
            setIsCountryLoading(false)
            setHasCountrySearchResponse(false)
            actions.clearPendingAction('search-country')
            return
        }

        let isCancelled = false
        const timeoutId = window.setTimeout(() => {
            void (async () => {
                setIsCountryLoading(true)
                setCountrySearchError(null)
                actions.setPendingAction('search-country')
                try {
                    const results = await searchCountries(query)
                    if (isCancelled) {
                        return
                    }
                    setCountryOptions(results)
                    setHasCountrySearchResponse(true)
                } catch (error) {
                    if (isCancelled) {
                        return
                    }
                    setCountryOptions([])
                    setCountrySearchError(
                        getRequestErrorMessage(error, t('addStory.search.countryLoadFailed')),
                    )
                    setHasCountrySearchResponse(true)
                } finally {
                    if (!isCancelled) {
                        setIsCountryLoading(false)
                        actions.clearPendingAction('search-country')
                    }
                }
            })()
        }, 260)

        return () => {
            isCancelled = true
            window.clearTimeout(timeoutId)
        }
    }, [actions, countryQuery, state.step, t])

    useEffect(() => {
        if (state.step !== 'step1' || !state.draft.country) {
            setCityOptions([])
            setCitySearchError(null)
            setIsCityLoading(false)
            setHasCitySearchResponse(false)
            actions.clearPendingAction('search-city')
            return
        }

        const query = cityQuery.trim()
        if (query.length < 2) {
            setCityOptions([])
            setCitySearchError(null)
            setIsCityLoading(false)
            setHasCitySearchResponse(false)
            actions.clearPendingAction('search-city')
            return
        }

        let isCancelled = false
        const timeoutId = window.setTimeout(() => {
            void (async () => {
                setIsCityLoading(true)
                setCitySearchError(null)
                actions.setPendingAction('search-city')
                try {
                    const results = await searchCities(state.draft.country!.code, query)
                    if (isCancelled) {
                        return
                    }
                    setCityOptions(results)
                    setHasCitySearchResponse(true)
                } catch (error) {
                    if (isCancelled) {
                        return
                    }
                    setCityOptions([])
                    setCitySearchError(getRequestErrorMessage(error, t('addStory.search.cityLoadFailed')))
                    setHasCitySearchResponse(true)
                } finally {
                    if (!isCancelled) {
                        setIsCityLoading(false)
                        actions.clearPendingAction('search-city')
                    }
                }
            })()
        }, 260)

        return () => {
            isCancelled = true
            window.clearTimeout(timeoutId)
        }
    }, [actions, cityQuery, state.draft.country, state.step, t])

    const handleStepOneNext = () => {
        const stepErrors = validateStep1(state.draft)
        if (hasValidationErrors(stepErrors)) {
            actions.setFieldErrors(stepErrors)
            return
        }
        actions.setFieldErrors({})
        actions.setStep('step2')
    }

    const handleStepTwoNext = async () => {
        const stepErrors = validateStep2(state.draft)
        if (hasValidationErrors(stepErrors)) {
            actions.setFieldErrors(stepErrors)
            return
        }

        actions.setFieldErrors({})
        actions.setRequestError(null)
        actions.setPendingAction('save-draft')

        try {
            const privateVisibility = mapVisibilityOptionToApi('private')
            if (!state.draft.country) {
                actions.setFieldErrors({ country: 'addStory.validation.countryRequired' })
                return
            }

            if (state.draftId) {
                const updatePayload = mapDraftToUpdateVisitPayload(state.draft, privateVisibility, null)
                const updated = await updateVisitDraft(state.draftId, updatePayload)
                actions.setDraftId(updated.id)
            } else {
                const createPayload = mapDraftToCreateVisitPayload(state.draft, privateVisibility)
                const created = await createVisitDraft(createPayload)
                actions.setDraftId(created.id)
            }

            actions.setStep('step3')
        } catch (error) {
            actions.setRequestError(getRequestErrorMessage(error, t('addStory.errors.saveDraftFailed')))
        } finally {
            actions.clearPendingAction('save-draft')
        }
    }

    const uploadSinglePhoto = async (photo: StoryPhoto): Promise<void> => {
        if (!state.draftId) {
            actions.setPhotoFailed(photo.localId, t('addStory.errors.draftNotReady'))
            return
        }

        try {
            const response = await uploadVisitPhoto(state.draftId, photo.file)
            actions.setPhotoUploaded(photo.localId, response.id, response.file_url)
        } catch (error) {
            actions.setPhotoFailed(photo.localId, getRequestErrorMessage(error, t('addStory.upload.failed')))
        }
    }

    const handleFilesSelected = async (files: FileList | null) => {
        if (!files || files.length === 0) {
            return
        }

        const availableSlots = MAX_STORY_PHOTOS - state.uploadedFiles.length
        if (availableSlots <= 0) {
            return
        }

        const selectedFiles = Array.from(files).slice(0, availableSlots)
        const queuedPhotos: StoryPhoto[] = selectedFiles.map((file) => ({
            localId: createLocalPhotoId(),
            file,
            previewUrl: URL.createObjectURL(file),
            status: 'uploading',
            fileId: null,
            fileUrl: null,
            error: null,
            isCover: false,
        }))

        actions.addPhotos(queuedPhotos)
        actions.setPendingAction('upload-photo')

        for (const photo of queuedPhotos) {
            await uploadSinglePhoto(photo)
        }

        actions.clearPendingAction('upload-photo')
    }

    const handleRetryUpload = async (localId: string) => {
        const photo = state.uploadedFiles.find((item) => item.localId === localId)
        if (!photo) {
            return
        }

        actions.setPendingAction('upload-photo')
        actions.setPhotoUploading(localId)
        await uploadSinglePhoto(photo)
        actions.clearPendingAction('upload-photo')
    }

    const handlePublish = async () => {
        const publishErrors = validatePublish(state)
        if (hasValidationErrors(publishErrors)) {
            actions.setFieldErrors(publishErrors)
            return
        }

        if (!state.draftId) {
            actions.setFieldErrors({ publish: 'addStory.validation.draftMissing' })
            return
        }

        const coverFileId =
            state.uploadedFiles.find((photo) => photo.status === 'uploaded' && photo.isCover)?.fileId ?? null

        actions.setFieldErrors({})
        actions.setRequestError(null)
        actions.setPendingAction('publish')

        try {
            await updateVisitDraft(
                state.draftId,
                mapDraftToUpdateVisitPayload(
                    state.draft,
                    mapVisibilityOptionToApi(state.selectedVisibility),
                    coverFileId,
                ),
            )
            await refetch()
            navigate('/my-travels', { replace: true })
        } catch (error) {
            actions.setRequestError(getRequestErrorMessage(error, t('addStory.errors.publishFailed')))
        } finally {
            actions.clearPendingAction('publish')
        }
    }

    const handleCountryQueryChange = (query: string) => {
        setCountryQuery(query)
        setCountrySearchError(null)
        setHasCountrySearchResponse(false)

        if (state.draft.country && query.trim().toLowerCase() !== state.draft.country.name.toLowerCase()) {
            actions.setCountry(null)
            setCityQuery('')
            setCityOptions([])
        }
    }

    const handleCountrySelect = (country: CountryOption) => {
        actions.setCountry(country)
        setCountryQuery(country.name)
        setCountryOptions([])
        setCountrySearchError(null)
        setHasCountrySearchResponse(false)
        setCityQuery('')
        setCityOptions([])
    }

    const handleCityToggle = (city: CityOption) => {
        const isSelected = state.draft.cities.some((selectedCity) => selectedCity.id === city.id)
        if (isSelected) {
            actions.removeCity(city.id)
            return
        }
        actions.addCity(city)
    }

    const handlePhotoRemove = (localId: string) => {
        const photo = state.uploadedFiles.find((item) => item.localId === localId)
        if (photo) {
            URL.revokeObjectURL(photo.previewUrl)
        }
        actions.removePhoto(localId)
    }

    const storyLocation = useMemo(() => {
        const countryName = state.draft.country?.name
        const cities = state.draft.cities.map((city) => city.name).join(', ')
        if (countryName && cities) {
            return `${countryName} · ${cities}`
        }
        return countryName ?? t('addStory.step3.locationFallback')
    }, [state.draft.cities, state.draft.country, t])

    const storyPeriod = useMemo(() => {
        const language = i18n.resolvedLanguage ?? i18n.language
        return formatStoryPeriod(state.draft.dateFrom, language, t('addStory.step3.periodFallback'))
    }, [i18n.language, i18n.resolvedLanguage, state.draft.dateFrom, t])

    const showCountryEmpty =
        hasCountrySearchResponse &&
        !isCountryLoading &&
        countryOptions.length === 0 &&
        !countrySearchError &&
        countryQuery.trim().length >= 2

    const showCityEmpty =
        hasCitySearchResponse &&
        !isCityLoading &&
        cityOptions.length === 0 &&
        !citySearchError &&
        cityQuery.trim().length >= 2

    const primaryActionLabel =
        state.step === 'step3' ? t('addStory.cta.publish') : t('addStory.cta.next')

    const isPrimaryActionDisabled =
        state.step === 'step1'
            ? selectIsStep1NextDisabled(state)
            : state.step === 'step2'
              ? selectIsStep2NextDisabled(state)
              : selectIsPublishDisabled(state)

    const isPrimaryActionLoading = state.pendingAction === 'save-draft' || state.pendingAction === 'publish'

    const handlePrimaryAction = () => {
        if (state.step === 'step1') {
            handleStepOneNext()
            return
        }

        if (state.step === 'step2') {
            void handleStepTwoNext()
            return
        }

        void handlePublish()
    }

    const handleBack = () => {
        if (state.step === 'step2') {
            actions.setStep('step1')
            return
        }

        if (state.step === 'step3') {
            actions.setStep('step2')
        }
    }

    return (
        <div className="add-story-page">
            <AddStoryStepShell
                step={state.step}
                title={t(getStepTitleKey(state.step))}
                onBack={state.step === 'step1' ? undefined : handleBack}
                onPrimaryAction={handlePrimaryAction}
                primaryActionLabel={primaryActionLabel}
                primaryActionDisabled={isPrimaryActionDisabled}
                secondaryActionLabel={t('addStory.cta.back')}
                secondaryActionDisabled={state.pendingAction === 'save-draft'}
                isPrimaryActionLoading={isPrimaryActionLoading}
            >
                {state.step === 'step1' && (
                    <StepOneStory
                        title={state.draft.title}
                        countryQuery={countryQuery}
                        cityQuery={cityQuery}
                        selectedCities={state.draft.cities}
                        countryOptions={countryOptions}
                        cityOptions={cityOptions}
                        isCountryLoading={isCountryLoading}
                        isCityLoading={isCityLoading}
                        cityInputDisabled={!state.draft.country}
                        showCountryEmpty={showCountryEmpty}
                        showCityEmpty={showCityEmpty}
                        countrySearchError={countrySearchError}
                        citySearchError={citySearchError}
                        fieldErrors={state.fieldErrors}
                        onTitleChange={actions.setTitle}
                        onCountryQueryChange={handleCountryQueryChange}
                        onSelectCountry={handleCountrySelect}
                        onCityQueryChange={setCityQuery}
                        onToggleCity={handleCityToggle}
                        onRemoveCity={actions.removeCity}
                    />
                )}

                {state.step === 'step2' && (
                    <StepTwoTrip
                        dateFrom={state.draft.dateFrom}
                        dateTo={state.draft.dateTo}
                        selectedVisibility={state.selectedVisibility}
                        fieldErrors={state.fieldErrors}
                        onDateFromChange={actions.setDateFrom}
                        onDateToChange={actions.setDateTo}
                        onVisibilityChange={actions.setVisibility}
                    />
                )}

                {state.step === 'step3' && (
                    <StepThreePublish
                        storyTitle={state.draft.title.trim() || t('addStory.step3.untitled')}
                        storyLocation={storyLocation}
                        storyPeriod={storyPeriod}
                        description={state.draft.description}
                        uploadedFiles={state.uploadedFiles}
                        canAddMorePhotos={state.uploadedFiles.length < MAX_STORY_PHOTOS}
                        fieldErrors={state.fieldErrors}
                        onDescriptionChange={actions.setDescription}
                        onFilesSelected={(files) => void handleFilesSelected(files)}
                        onSelectCover={actions.setCoverPhoto}
                        onRetryUpload={(localId) => void handleRetryUpload(localId)}
                        onRemovePhoto={handlePhotoRemove}
                    />
                )}
            </AddStoryStepShell>

            {state.requestError && <p className="add-story-page__error">{state.requestError}</p>}
            <p className="add-story-page__hint">{t('addStory.sessionHint')}</p>
        </div>
    )
}
