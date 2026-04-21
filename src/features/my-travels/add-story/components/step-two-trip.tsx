import { useTranslation } from 'react-i18next'
import type { FieldErrors, VisibilityOption } from '../add-story-types'
import './step-two-trip.css'

interface StepTwoTripProps {
    dateFrom: string
    dateTo: string
    selectedVisibility: VisibilityOption
    fieldErrors: FieldErrors
    onDateFromChange: (value: string) => void
    onDateToChange: (value: string) => void
    onVisibilityChange: (value: VisibilityOption) => void
}

const VISIBILITY_ORDER: VisibilityOption[] = ['public', 'friends', 'private']

export const StepTwoTrip = ({
    dateFrom,
    dateTo,
    selectedVisibility,
    fieldErrors,
    onDateFromChange,
    onDateToChange,
    onVisibilityChange,
}: StepTwoTripProps) => {
    const { t } = useTranslation('myTravels')

    return (
        <>
            <section className="add-story-step-card">
                <div className="add-story-step-card__icon">◫</div>
                <div>
                    <h2>{t('addStory.step2.heroTitle')}</h2>
                    <p>{t('addStory.step2.heroSubtitle')}</p>
                </div>
            </section>

            <section className="add-story-step-two__dates">
                <label className="add-story-field">
                    <span>{t('addStory.step2.dateFromLabel')}</span>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => onDateFromChange(event.target.value)}
                    />
                </label>
                <label className="add-story-field">
                    <span>{t('addStory.step2.dateToLabel')}</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(event) => onDateToChange(event.target.value)}
                    />
                </label>
            </section>

            {(fieldErrors.dateFrom || fieldErrors.dateRange) && (
                <p className="add-story-field__error">
                    {fieldErrors.dateFrom ? t(fieldErrors.dateFrom) : t(fieldErrors.dateRange!)}
                </p>
            )}

            <section className="add-story-field">
                <span>{t('addStory.step2.visibilityLabel')}</span>
                <div className="add-story-step-two__visibility-list">
                    {VISIBILITY_ORDER.map((option) => {
                        const isActive = selectedVisibility === option
                        return (
                            <button
                                key={option}
                                type="button"
                                className={
                                    isActive
                                        ? 'add-story-step-two__visibility-card add-story-step-two__visibility-card--active'
                                        : 'add-story-step-two__visibility-card'
                                }
                                onClick={() => onVisibilityChange(option)}
                            >
                                <strong>{t(`addStory.step2.visibilityIcons.${option}`)}</strong>
                                <span>{t(`addStory.step2.visibility.${option}`)}</span>
                            </button>
                        )
                    })}
                </div>
            </section>
        </>
    )
}
