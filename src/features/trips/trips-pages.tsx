import { useMemo, useState, type ChangeEvent } from 'react'
import {
    CalendarDays,
    Camera,
    Check,
    CheckSquare,
    Globe2,
    MapPin,
    Plus,
    RotateCcw,
    Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AddTripModal } from './add-trip-modal'
import { PageState } from './page-state'
import { TripCard } from './trip-card'
import {
    createChecklistItem,
    createVisitPlace,
    deleteVisit,
    updateChecklistItem,
    updateVisit,
    updateVisitPlace,
    uploadVisitPhoto,
} from './trips-api'
import type { TripCard as TripCardModel, VisibleTripStatus } from './trips-types'
import { useProtectedImages } from './use-protected-images'
import { useTripCards, useTripDetails, useTripStatistics } from './use-trips-resource'
import './trips.css'

interface TripsListPageProps {
    status: VisibleTripStatus
}

const getErrorText = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message
    }
    return fallback
}

const formatDate = (date: string | null, language: string): string | null => {
    if (!date) {
        return null
    }

    const parsed = new Date(`${date}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) {
        return null
    }

    return parsed.toLocaleDateString(language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

const formatPeriod = (dateFrom: string | null, dateTo: string | null, language: string): string => {
    const from = formatDate(dateFrom, language)
    const to = formatDate(dateTo, language)
    if (from && to) {
        return `${from} - ${to}`
    }
    return from ?? to ?? ''
}

const TripsListPage = ({ status }: TripsListPageProps) => {
    const { t } = useTranslation('trips')
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { data, isLoading, error, refetch } = useTripCards(status)
    const trips = useMemo(() => data?.items ?? [], [data?.items])
    const imageSources = useMemo(
        () => trips.map((trip) => ({ id: trip.id, url: trip.coverUrl })),
        [trips],
    )
    const covers = useProtectedImages(imageSources)
    const isPlans = status === 'planned'

    const handleSaved = (nextStatus: VisibleTripStatus): void => {
        setIsModalOpen(false)
        void refetch()
        navigate(nextStatus === 'planned' ? '/plans' : '/visits', { replace: true })
    }

    if (isLoading) {
        return <PageState title={t('states.loading')} text={t('states.loadingText')} />
    }

    if (error) {
        return (
            <PageState
                title={t('states.error')}
                text={error}
                actionLabel={t('states.retry')}
                onAction={() => void refetch()}
                role="alert"
            />
        )
    }

    return (
        <section className="trips-page">
            <header className="trips-page__header">
                <div>
                    <h1>{isPlans ? t('plans.title') : t('visits.title')}</h1>
                    <p>
                        {isPlans
                            ? t('plans.count', { count: data?.pagination.total ?? 0 })
                            : t('visits.count', { count: data?.pagination.total ?? 0 })}
                    </p>
                </div>
                <button type="button" className="trip-button" onClick={() => setIsModalOpen(true)}>
                    <Plus size={17} />
                    {isPlans ? t('plans.cta') : t('visits.cta')}
                </button>
            </header>

            {trips.length === 0 ? (
                <div className="trips-empty">
                    <MapPin size={28} />
                    <h2>{isPlans ? t('plans.empty') : t('visits.empty')}</h2>
                    <button type="button" className="trip-button" onClick={() => setIsModalOpen(true)}>
                        <Plus size={17} />
                        {isPlans ? t('plans.cta') : t('visits.cta')}
                    </button>
                </div>
            ) : (
                <div className="trip-card-grid">
                    {trips.map((trip: TripCardModel) => (
                        <TripCard
                            key={trip.id}
                            trip={trip}
                            coverUrl={covers[trip.id]?.objectUrl ?? null}
                            showPlanProgress={isPlans}
                        />
                    ))}
                </div>
            )}

            {isModalOpen && (
                <AddTripModal
                    initialStatus={status}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </section>
    )
}

export const VisitsPage = () => <TripsListPage status="visited" />

export const PlansPage = () => <TripsListPage status="planned" />

export const StatisticsPage = () => {
    const { t } = useTranslation('trips')
    const { data, isLoading, error, refetch } = useTripStatistics()
    const maxCountryTrips = Math.max(...(data?.tripsByCountry.map((item) => item.tripsCount) ?? [0]), 1)

    if (isLoading) {
        return <PageState title={t('states.loading')} text={t('states.loadingText')} />
    }

    if (error) {
        return (
            <PageState
                title={t('states.error')}
                text={error}
                actionLabel={t('states.retry')}
                onAction={() => void refetch()}
                role="alert"
            />
        )
    }

    if (!data) {
        return <PageState title={t('states.empty')} text={t('statistics.empty')} />
    }

    const metrics = [
        { icon: <Camera size={18} />, value: data.visitedCount, label: t('statistics.visited') },
        { icon: <Globe2 size={18} />, value: data.countriesCount, label: t('statistics.countries') },
        { icon: <MapPin size={18} />, value: data.citiesCount, label: t('statistics.cities') },
        { icon: <RotateCcw size={18} />, value: data.repeatedCountriesCount, label: t('statistics.repeats') },
        { icon: <CalendarDays size={18} />, value: data.plannedCount, label: t('statistics.planned') },
    ]

    return (
        <section className="trips-page">
            <header className="trips-page__header">
                <div>
                    <h1>{t('statistics.title')}</h1>
                    <p>{t('statistics.subtitle')}</p>
                </div>
            </header>

            <div className="statistics-list">
                {metrics.map((metric) => (
                    <article key={metric.label} className="statistics-row">
                        <span aria-hidden="true">{metric.icon}</span>
                        <strong>{metric.value}</strong>
                        <p>{metric.label}</p>
                    </article>
                ))}
            </div>

            {data.favoriteCity && (
                <section className="statistics-panel">
                    <p>{t('statistics.favoriteCity')}</p>
                    <h2>{data.favoriteCity.cityName}</h2>
                    <span>{t('statistics.visitCount', { count: data.favoriteCity.visitsCount })}</span>
                </section>
            )}

            <section className="statistics-panel">
                <h2>{t('statistics.byCountry')}</h2>
                {data.tripsByCountry.length === 0 ? (
                    <p>{t('statistics.empty')}</p>
                ) : (
                    <div className="country-bars">
                        {data.tripsByCountry.map((country) => (
                            <div key={country.countryName ?? 'unknown'} className="country-bar">
                                <span>{country.countryName ?? t('statistics.unknownCountry')}</span>
                                <div>
                                    <span style={{ width: `${(country.tripsCount / maxCountryTrips) * 100}%` }} />
                                </div>
                                <strong>{country.tripsCount}</strong>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </section>
    )
}

export const TripDetailPage = () => {
    const { visitId } = useParams()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation('trips')
    const { data, isLoading, error, refetch } = useTripDetails(visitId)
    const [newChecklistItem, setNewChecklistItem] = useState('')
    const [newPlace, setNewPlace] = useState('')
    const [actionError, setActionError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const language = i18n.resolvedLanguage ?? i18n.language
    const imageSources = useMemo(
        () => data?.photos.map((photo) => ({ id: photo.id, url: photo.fileUrl })) ?? [],
        [data?.photos],
    )
    const photos = useProtectedImages(imageSources)

    if (isLoading) {
        return <PageState title={t('states.loading')} text={t('states.loadingText')} />
    }

    if (error) {
        return (
            <PageState
                title={t('states.error')}
                text={error}
                actionLabel={t('states.retry')}
                onAction={() => void refetch()}
                role="alert"
            />
        )
    }

    if (!data || !visitId) {
        return <PageState title={t('states.empty')} text={t('details.notFound')} />
    }

    const backPath = data.visit.status === 'planned' ? '/plans' : '/visits'
    const period = formatPeriod(data.visit.dateFrom, data.visit.dateTo, language)

    const runAction = async (action: () => Promise<void>): Promise<void> => {
        setActionError(null)
        try {
            await action()
            await refetch()
        } catch (requestError) {
            setActionError(getErrorText(requestError, t('details.actionFailed')))
        }
    }

    const addChecklistItem = async (): Promise<void> => {
        const content = newChecklistItem.trim()
        if (!content) {
            return
        }
        await runAction(async () => {
            await createChecklistItem(visitId, content)
            setNewChecklistItem('')
        })
    }

    const addPlace = async (): Promise<void> => {
        const title = newPlace.trim()
        if (!title) {
            return
        }
        await runAction(async () => {
            await createVisitPlace(visitId, title)
            setNewPlace('')
        })
    }

    const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const files = event.target.files
        if (!files || files.length === 0) {
            return
        }

        await runAction(async () => {
            const uploaded = await uploadVisitPhoto(visitId, files[0])
            if (data.photos.length === 0) {
                await updateVisit(visitId, { cover_file_id: uploaded.id })
            }
        })
        event.target.value = ''
    }

    const handleDeleteVisit = async (): Promise<void> => {
        if (isDeleting) {
            return
        }

        const confirmed = window.confirm(t('details.deleteConfirm', { title: data.visit.title }))
        if (!confirmed) {
            return
        }

        setActionError(null)
        setIsDeleting(true)
        try {
            await deleteVisit(visitId)
            navigate(backPath, { replace: true })
        } catch (requestError) {
            setIsDeleting(false)
            setActionError(getErrorText(requestError, t('details.deleteFailed')))
        }
    }

    return (
        <section className="trips-page trip-detail">
            <header className="trip-detail__header">
                <button type="button" className="trip-link-button" onClick={() => navigate(backPath)}>
                    {t('details.back')}
                </button>
                <div>
                    <h1>{data.visit.title}</h1>
                    <p>
                        {data.visit.cityName ?? data.visit.countryName ?? data.visit.countryCode}
                        {period ? ` · ${period}` : ''}
                    </p>
                </div>
                <button
                    type="button"
                    className="trip-link-button trip-link-button--danger"
                    onClick={() => void handleDeleteVisit()}
                    disabled={isDeleting}
                >
                    <Trash2 size={16} />
                    {isDeleting ? t('details.deleting') : t('details.delete')}
                </button>
            </header>

            {actionError && <p className="trip-field-error">{actionError}</p>}

            <section className="trip-detail-section">
                <header>
                    <h2>{t('details.photos')}</h2>
                    <label className="trip-link-button">
                        <Plus size={16} />
                        {t('details.addPhoto')}
                        <input type="file" accept="image/*" onChange={(event) => void handlePhotoChange(event)} />
                    </label>
                </header>
                {data.photos.length === 0 ? (
                    <p>{t('details.noPhotos')}</p>
                ) : (
                    <div className="trip-photo-grid">
                        {data.photos.map((photo) => (
                            <article key={photo.id} className="trip-photo-tile">
                                {photos[photo.id]?.objectUrl ? (
                                    <img src={photos[photo.id].objectUrl} alt="" loading="lazy" decoding="async" />
                                ) : (
                                    <Camera size={22} />
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="trip-detail-section">
                <header>
                    <h2>{t('details.checklist')}</h2>
                </header>
                <div className="trip-add-row">
                    <input
                        value={newChecklistItem}
                        onChange={(event) => setNewChecklistItem(event.target.value)}
                        placeholder={t('details.checklistPlaceholder')}
                    />
                    <button type="button" onClick={() => void addChecklistItem()}>
                        <Plus size={16} />
                    </button>
                </div>
                <div className="trip-detail-list">
                    {data.checklist.length === 0 ? (
                        <p>{t('details.noChecklist')}</p>
                    ) : (
                        data.checklist.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                    void runAction(() =>
                                        updateChecklistItem(item.id, item.status === 'done' ? 'to_do' : 'done'),
                                    )
                                }
                            >
                                <span className={item.status === 'done' ? 'is-done' : ''}>
                                    <CheckSquare size={16} />
                                    {item.content}
                                </span>
                                {item.status === 'done' && <Check size={16} />}
                            </button>
                        ))
                    )}
                </div>
            </section>

            <section className="trip-detail-section">
                <header>
                    <h2>{t('details.places')}</h2>
                </header>
                <div className="trip-add-row">
                    <input
                        value={newPlace}
                        onChange={(event) => setNewPlace(event.target.value)}
                        placeholder={t('details.placePlaceholder')}
                    />
                    <button type="button" onClick={() => void addPlace()}>
                        <Plus size={16} />
                    </button>
                </div>
                <div className="trip-detail-list">
                    {data.places.length === 0 ? (
                        <p>{t('details.noPlaces')}</p>
                    ) : (
                        data.places.map((place) => (
                            <button
                                key={place.id}
                                type="button"
                                onClick={() => void runAction(() => updateVisitPlace(place.id, !place.isVisited))}
                            >
                                <span className={place.isVisited ? 'is-done' : ''}>
                                    <MapPin size={16} />
                                    {place.title}
                                </span>
                                {place.isVisited && <Check size={16} />}
                            </button>
                        ))
                    )}
                </div>
            </section>

            <Link className="trip-link-button" to={backPath}>
                {t('details.back')}
            </Link>
        </section>
    )
}
