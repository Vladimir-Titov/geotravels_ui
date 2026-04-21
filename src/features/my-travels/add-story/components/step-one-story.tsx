import { useTranslation } from 'react-i18next'
import { STORY_TITLE_MAX_LENGTH } from '../add-story-types'
import type { CityOption, CountryOption, FieldErrors } from '../add-story-types'
import './step-one-story.css'

interface StepOneStoryProps {
    title: string
    countryQuery: string
    cityQuery: string
    selectedCities: CityOption[]
    countryOptions: CountryOption[]
    cityOptions: CityOption[]
    isCountryLoading: boolean
    isCityLoading: boolean
    cityInputDisabled: boolean
    showCountryEmpty: boolean
    showCityEmpty: boolean
    countrySearchError: string | null
    citySearchError: string | null
    fieldErrors: FieldErrors
    onTitleChange: (title: string) => void
    onCountryQueryChange: (query: string) => void
    onSelectCountry: (country: CountryOption) => void
    onCityQueryChange: (query: string) => void
    onToggleCity: (city: CityOption) => void
    onRemoveCity: (cityId: string) => void
}

const hasCity = (selectedCities: CityOption[], cityId: string): boolean => {
    return selectedCities.some((city) => city.id === cityId)
}

export const StepOneStory = ({
    title,
    countryQuery,
    cityQuery,
    selectedCities,
    countryOptions,
    cityOptions,
    isCountryLoading,
    isCityLoading,
    cityInputDisabled,
    showCountryEmpty,
    showCityEmpty,
    countrySearchError,
    citySearchError,
    fieldErrors,
    onTitleChange,
    onCountryQueryChange,
    onSelectCountry,
    onCityQueryChange,
    onToggleCity,
    onRemoveCity,
}: StepOneStoryProps) => {
    const { t } = useTranslation('myTravels')

    return (
        <>
            <section className="add-story-step-card">
                <div className="add-story-step-card__icon">✦</div>
                <div>
                    <h2>{t('addStory.step1.heroTitle')}</h2>
                    <p>{t('addStory.step1.heroSubtitle')}</p>
                </div>
            </section>

            <label className="add-story-field">
                <span>{t('addStory.step1.titleLabel')}</span>
                <input
                    type="text"
                    value={title}
                    maxLength={STORY_TITLE_MAX_LENGTH}
                    onChange={(event) => onTitleChange(event.target.value)}
                    placeholder={t('addStory.step1.titlePlaceholder')}
                />
                <small>{`${title.trim().length}/${STORY_TITLE_MAX_LENGTH}`}</small>
                {fieldErrors.title && (
                    <p className="add-story-field__error">{t(fieldErrors.title)}</p>
                )}
            </label>

            <label className="add-story-field">
                <span>{t('addStory.step1.countryLabel')}</span>
                <input
                    type="text"
                    value={countryQuery}
                    onChange={(event) => onCountryQueryChange(event.target.value)}
                    placeholder={t('addStory.step1.countryPlaceholder')}
                />
                {fieldErrors.country && (
                    <p className="add-story-field__error">{t(fieldErrors.country)}</p>
                )}
                {isCountryLoading && <p>{t('addStory.search.loading')}</p>}
                {countrySearchError && <p className="add-story-field__error">{countrySearchError}</p>}
                {!isCountryLoading && countryOptions.length > 0 && (
                    <ul className="add-story-suggestion-list">
                        {countryOptions.map((country) => (
                            <li key={country.code}>
                                <button type="button" onClick={() => onSelectCountry(country)}>
                                    <strong>{country.name}</strong>
                                    <span>{country.code}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {showCountryEmpty && <p>{t('addStory.search.noCountries')}</p>}
            </label>

            <section className="add-story-field">
                <span>{t('addStory.step1.citiesLabel')}</span>
                <input
                    type="text"
                    value={cityQuery}
                    onChange={(event) => onCityQueryChange(event.target.value)}
                    placeholder={t('addStory.step1.citiesPlaceholder')}
                    disabled={cityInputDisabled}
                />
                {cityInputDisabled && <p>{t('addStory.search.selectCountryFirst')}</p>}

                {selectedCities.length > 0 && (
                    <div className="add-story-city-chips">
                        {selectedCities.map((city) => (
                            <button
                                key={city.id}
                                type="button"
                                className="add-story-city-chip"
                                onClick={() => onRemoveCity(city.id)}
                            >
                                {city.name}
                            </button>
                        ))}
                    </div>
                )}

                {isCityLoading && <p>{t('addStory.search.loading')}</p>}
                {citySearchError && <p className="add-story-field__error">{citySearchError}</p>}
                {!isCityLoading && cityOptions.length > 0 && (
                    <ul className="add-story-suggestion-list">
                        {cityOptions.map((city) => {
                            const selected = hasCity(selectedCities, city.id)
                            return (
                                <li key={city.id}>
                                    <button type="button" onClick={() => onToggleCity(city)}>
                                        <strong>{city.name}</strong>
                                        <span>
                                            {selected
                                                ? t('addStory.step1.citySelected')
                                                : t('addStory.step1.cityAdd')}
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
                {showCityEmpty && <p>{t('addStory.search.noCities')}</p>}
            </section>
        </>
    )
}
