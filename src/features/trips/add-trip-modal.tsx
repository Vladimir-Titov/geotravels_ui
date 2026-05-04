import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Camera, Check, CheckSquare, Map, MapPin, Plane, Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
    createChecklistItem,
    createVisit,
    searchCities,
    searchCountries,
    updateVisit,
    uploadVisitPhoto,
} from './trips-api'
import type {
    AddTripDraft,
    CityOption,
    CountryOption,
    CreateVisitPayload,
    QueuedTripPhoto,
    VisibleTripStatus,
} from './trips-types'

interface AddTripModalProps {
    initialStatus: VisibleTripStatus
    onClose: () => void
    onSaved: (status: VisibleTripStatus, visitId: string) => void
}

type Step = 1 | 2 | 3 | 4

const MAX_PHOTOS = 6

const createPhotoId = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random()}`
}

const createInitialDraft = (status: VisibleTripStatus): AddTripDraft => ({
    status,
    country: null,
    city: null,
    dateFrom: '',
    dateTo: '',
    notes: '',
    checklist: [],
    photos: [],
})

const normalizeOptionalText = (value: string): string | undefined => {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : undefined
}

const buildTitle = (draft: AddTripDraft): string => {
    return draft.city?.name ?? draft.country?.name ?? 'Trip'
}

const buildCreatePayload = (draft: AddTripDraft): CreateVisitPayload => {
    const payload: CreateVisitPayload = {
        country_code: draft.country?.code ?? '',
        title: buildTitle(draft),
        visibility: 'private',
        status: draft.status,
    }

    const description = normalizeOptionalText(draft.notes)
    if (description) {
        payload.description = description
    }

    if (draft.dateFrom) {
        payload.date_from = draft.dateFrom
    }

    if (draft.dateTo) {
        payload.date_to = draft.dateTo
    }

    if (draft.city) {
        payload.city_ids = [draft.city.id]
    }

    return payload
}

const hasInvalidDateRange = (draft: AddTripDraft): boolean => {
    return Boolean(draft.dateFrom && draft.dateTo && draft.dateTo < draft.dateFrom)
}

export const AddTripModal = ({ initialStatus, onClose, onSaved }: AddTripModalProps) => {
    const { t, i18n } = useTranslation('trips')
    const [step, setStep] = useState<Step>(1)
    const [draft, setDraft] = useState<AddTripDraft>(() => createInitialDraft(initialStatus))
    const [countryQuery, setCountryQuery] = useState('')
    const [cityQuery, setCityQuery] = useState('')
    const [countryOptions, setCountryOptions] = useState<CountryOption[]>([])
    const [cityOptions, setCityOptions] = useState<CityOption[]>([])
    const [countrySearchDone, setCountrySearchDone] = useState(false)
    const [citySearchDone, setCitySearchDone] = useState(false)
    const [newChecklistItem, setNewChecklistItem] = useState('')
    const [requestError, setRequestError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const photoUrlsRef = useRef<string[]>([])
    const checklistSuggestions = t('modal.details.suggestions', { returnObjects: true }) as string[]
    const language = i18n.resolvedLanguage ?? i18n.language

    useEffect(() => {
        const previous = photoUrlsRef.current
        const current = draft.photos.map((photo) => photo.previewUrl)
        previous
            .filter((url) => !current.includes(url))
            .forEach((url) => {
                URL.revokeObjectURL(url)
            })
        photoUrlsRef.current = current
    }, [draft.photos])

    useEffect(() => {
        return () => {
            photoUrlsRef.current.forEach((url) => {
                URL.revokeObjectURL(url)
            })
        }
    }, [])

    useEffect(() => {
        if (step !== 2) {
            return
        }

        const query = countryQuery.trim()
        if (query.length < 2) {
            setCountryOptions([])
            setCountrySearchDone(false)
            return
        }

        let isCancelled = false
        const timeoutId = window.setTimeout(() => {
            void (async () => {
                try {
                    const results = await searchCountries(query, language)
                    if (!isCancelled) {
                        setCountryOptions(results)
                        setCountrySearchDone(true)
                    }
                } catch {
                    if (!isCancelled) {
                        setCountryOptions([])
                        setCountrySearchDone(true)
                    }
                }
            })()
        }, 240)

        return () => {
            isCancelled = true
            window.clearTimeout(timeoutId)
        }
    }, [countryQuery, language, step])

    useEffect(() => {
        if (step !== 2 || !draft.country) {
            setCityOptions([])
            setCitySearchDone(false)
            return
        }

        const query = cityQuery.trim()
        if (query.length < 2) {
            setCityOptions([])
            setCitySearchDone(false)
            return
        }

        let isCancelled = false
        const timeoutId = window.setTimeout(() => {
            void (async () => {
                try {
                    const results = await searchCities(draft.country!.code, query, language)
                    if (!isCancelled) {
                        setCityOptions(results)
                        setCitySearchDone(true)
                    }
                } catch {
                    if (!isCancelled) {
                        setCityOptions([])
                        setCitySearchDone(true)
                    }
                }
            })()
        }, 240)

        return () => {
            isCancelled = true
            window.clearTimeout(timeoutId)
        }
    }, [cityQuery, draft.country, language, step])

    const stepTitle = useMemo(() => {
        if (step === 1) {
            return t('modal.steps.type')
        }
        if (step === 2) {
            return t('modal.steps.destination')
        }
        if (step === 3) {
            return t('modal.steps.dates')
        }
        return t('modal.steps.details')
    }, [step, t])

    const canContinue = (): boolean => {
        if (step === 2) {
            return draft.country !== null
        }

        if (step === 3) {
            return !hasInvalidDateRange(draft)
        }

        return true
    }

    const setStatus = (status: VisibleTripStatus): void => {
        setDraft((current) => ({ ...current, status }))
    }

    const selectCountry = (country: CountryOption): void => {
        setDraft((current) => ({ ...current, country, city: null }))
        setCountryQuery(country.name)
        setCityQuery('')
        setCountryOptions([])
        setCountrySearchDone(false)
    }

    const selectCity = (city: CityOption): void => {
        setDraft((current) => ({ ...current, city }))
        setCityQuery(city.name)
        setCityOptions([])
        setCitySearchDone(false)
    }

    const addChecklistItem = (): void => {
        const value = newChecklistItem.trim()
        if (!value || draft.checklist.includes(value)) {
            return
        }

        setDraft((current) => ({ ...current, checklist: [...current.checklist, value] }))
        setNewChecklistItem('')
    }

    const addSuggestedChecklistItem = (value: string): void => {
        if (draft.checklist.includes(value)) {
            return
        }
        setDraft((current) => ({ ...current, checklist: [...current.checklist, value] }))
    }

    const removeChecklistItem = (value: string): void => {
        setDraft((current) => ({
            ...current,
            checklist: current.checklist.filter((item) => item !== value),
        }))
    }

    const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const files = event.target.files
        if (!files || files.length === 0) {
            return
        }

        const availableSlots = MAX_PHOTOS - draft.photos.length
        const photos: QueuedTripPhoto[] = Array.from(files)
            .slice(0, availableSlots)
            .map((file) => ({
                id: createPhotoId(),
                file,
                previewUrl: URL.createObjectURL(file),
            }))

        setDraft((current) => ({ ...current, photos: [...current.photos, ...photos] }))
        event.target.value = ''
    }

    const removePhoto = (photoId: string): void => {
        setDraft((current) => ({
            ...current,
            photos: current.photos.filter((photo) => photo.id !== photoId),
        }))
    }

    const saveTrip = async (): Promise<void> => {
        if (!draft.country || hasInvalidDateRange(draft)) {
            return
        }

        setIsSaving(true)
        setRequestError(null)

        try {
            const created = await createVisit(buildCreatePayload(draft))
            const uploaded = []

            for (const photo of draft.photos) {
                uploaded.push(await uploadVisitPhoto(created.id, photo.file))
            }

            if (uploaded[0]) {
                await updateVisit(created.id, { cover_file_id: uploaded[0].id })
            }

            if (draft.status === 'planned') {
                for (const item of draft.checklist) {
                    await createChecklistItem(created.id, item)
                }
            }

            onSaved(draft.status, created.id)
        } catch (error) {
            if (error instanceof Error && error.message.trim().length > 0) {
                setRequestError(error.message)
            } else {
                setRequestError(t('modal.errors.saveFailed'))
            }
        } finally {
            setIsSaving(false)
        }
    }

    const goNext = (): void => {
        if (!canContinue()) {
            return
        }
        setStep((current) => Math.min(4, current + 1) as Step)
    }

    const goBack = (): void => {
        setStep((current) => Math.max(1, current - 1) as Step)
    }

    return (
        <div className="trip-modal" role="dialog" aria-modal="true" aria-labelledby="trip-modal-title">
            <div className="trip-modal__backdrop" onClick={onClose} />
            <section className="trip-modal__panel">
                <header className="trip-modal__header">
                    <div>
                        <h2 id="trip-modal-title">{t('modal.title')}</h2>
                        <p>{stepTitle}</p>
                    </div>
                    <button type="button" className="trip-icon-button" onClick={onClose} aria-label={t('modal.close')}>
                        <X size={18} />
                    </button>
                </header>

                <div className="trip-modal__progress" aria-label={t('modal.progress')}>
                    {[1, 2, 3, 4].map((item) => (
                        <span key={item} className={item === step ? 'is-active' : ''} />
                    ))}
                </div>

                <div className="trip-modal__body">
                    {step === 1 && (
                        <div className="trip-type-grid">
                            <button
                                type="button"
                                className={draft.status === 'visited' ? 'trip-choice is-selected' : 'trip-choice'}
                                onClick={() => setStatus('visited')}
                            >
                                <Plane size={28} />
                                <strong>{t('modal.type.visited.title')}</strong>
                                <span>{t('modal.type.visited.text')}</span>
                            </button>
                            <button
                                type="button"
                                className={draft.status === 'planned' ? 'trip-choice is-selected' : 'trip-choice'}
                                onClick={() => setStatus('planned')}
                            >
                                <Map size={28} />
                                <strong>{t('modal.type.planned.title')}</strong>
                                <span>{t('modal.type.planned.text')}</span>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="trip-form-grid">
                            <label className="trip-field">
                                <span>{t('modal.destination.country')}</span>
                                <input
                                    value={countryQuery}
                                    onChange={(event) => {
                                        setCountryQuery(event.target.value)
                                        setDraft((current) => ({ ...current, country: null, city: null }))
                                    }}
                                    placeholder={t('modal.destination.countryPlaceholder')}
                                />
                            </label>
                            {countryOptions.length > 0 && (
                                <div className="trip-suggestions">
                                    {countryOptions.map((country) => (
                                        <button key={country.code} type="button" onClick={() => selectCountry(country)}>
                                            {country.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {countrySearchDone && countryQuery.trim().length >= 2 && countryOptions.length === 0 && !draft.country && (
                                <p className="trip-field-note">{t('modal.destination.noCountries')}</p>
                            )}

                            <label className="trip-field">
                                <span>{t('modal.destination.city')}</span>
                                <input
                                    value={cityQuery}
                                    disabled={!draft.country}
                                    onChange={(event) => {
                                        setCityQuery(event.target.value)
                                        setDraft((current) => ({ ...current, city: null }))
                                    }}
                                    placeholder={t('modal.destination.cityPlaceholder')}
                                />
                            </label>
                            {cityOptions.length > 0 && (
                                <div className="trip-suggestions">
                                    {cityOptions.map((city) => (
                                        <button key={city.id} type="button" onClick={() => selectCity(city)}>
                                            {city.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {citySearchDone && cityQuery.trim().length >= 2 && cityOptions.length === 0 && !draft.city && (
                                <p className="trip-field-note">{t('modal.destination.noCities')}</p>
                            )}
                            {!draft.country && step === 2 && (
                                <p className="trip-field-note">{t('modal.validation.countryRequired')}</p>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="trip-form-grid">
                            <label className="trip-field">
                                <span>{t('modal.dates.start')}</span>
                                <input
                                    type="date"
                                    value={draft.dateFrom}
                                    onChange={(event) => setDraft((current) => ({ ...current, dateFrom: event.target.value }))}
                                />
                            </label>
                            <label className="trip-field">
                                <span>{t('modal.dates.end')}</span>
                                <input
                                    type="date"
                                    value={draft.dateTo}
                                    onChange={(event) => setDraft((current) => ({ ...current, dateTo: event.target.value }))}
                                />
                            </label>
                            <p className={hasInvalidDateRange(draft) ? 'trip-field-error' : 'trip-field-note'}>
                                {hasInvalidDateRange(draft)
                                    ? t('modal.validation.dateRange')
                                    : t('modal.dates.optional')}
                            </p>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="trip-form-grid">
                            <label className="trip-field">
                                <span>{t('modal.details.notes')}</span>
                                <textarea
                                    value={draft.notes}
                                    onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                                    placeholder={t('modal.details.notesPlaceholder')}
                                    rows={3}
                                />
                            </label>

                            {draft.status === 'planned' && (
                                <section className="trip-inline-section">
                                    <div className="trip-inline-section__title">
                                        <CheckSquare size={16} />
                                        <strong>{t('modal.details.preparation')}</strong>
                                    </div>
                                    <div className="trip-add-row">
                                        <input
                                            value={newChecklistItem}
                                            onChange={(event) => setNewChecklistItem(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.preventDefault()
                                                    addChecklistItem()
                                                }
                                            }}
                                            placeholder={t('modal.details.taskPlaceholder')}
                                        />
                                        <button type="button" onClick={addChecklistItem} aria-label={t('modal.details.addTask')}>
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="trip-suggestion-pills">
                                        {checklistSuggestions.map((item) => (
                                            <button key={item} type="button" onClick={() => addSuggestedChecklistItem(item)}>
                                                + {item}
                                            </button>
                                        ))}
                                    </div>
                                    {draft.checklist.length > 0 && (
                                        <ul className="trip-draft-list">
                                            {draft.checklist.map((item) => (
                                                <li key={item}>
                                                    <span>{item}</span>
                                                    <button type="button" onClick={() => removeChecklistItem(item)}>
                                                        <X size={14} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </section>
                            )}

                            <section className="trip-inline-section">
                                <div className="trip-inline-section__title">
                                    <Camera size={16} />
                                    <strong>{t('modal.details.photos')}</strong>
                                </div>
                                <div className="trip-photo-picker">
                                    {draft.photos.map((photo) => (
                                        <span key={photo.id} className="trip-photo-preview">
                                            <img src={photo.previewUrl} alt="" />
                                            <button type="button" onClick={() => removePhoto(photo.id)}>
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    {draft.photos.length < MAX_PHOTOS && (
                                        <label className="trip-photo-add">
                                            <Camera size={18} />
                                            <span>{t('modal.details.addPhoto')}</span>
                                            <input type="file" accept="image/*" multiple onChange={handlePhotoChange} />
                                        </label>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {requestError && <p className="trip-field-error">{requestError}</p>}
                </div>

                <footer className="trip-modal__footer">
                    <button type="button" className="trip-button trip-button--ghost" onClick={step === 1 ? onClose : goBack}>
                        {step === 1 ? t('modal.cancel') : t('modal.back')}
                    </button>
                    {step < 4 ? (
                        <button type="button" className="trip-button" disabled={!canContinue()} onClick={goNext}>
                            {t('modal.next')}
                            <MapPin size={16} />
                        </button>
                    ) : (
                        <button type="button" className="trip-button" disabled={isSaving || !canContinue()} onClick={() => void saveTrip()}>
                            <Check size={16} />
                            {isSaving ? t('modal.saving') : t('modal.save')}
                        </button>
                    )}
                </footer>
            </section>
        </div>
    )
}
