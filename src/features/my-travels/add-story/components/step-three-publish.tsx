import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MAX_STORY_PHOTOS } from '../add-story-types'
import type { FieldErrors, StoryPhoto } from '../add-story-types'
import './step-three-publish.css'

interface StepThreePublishProps {
    storyTitle: string
    storyLocation: string
    storyPeriod: string
    description: string
    uploadedFiles: StoryPhoto[]
    canAddMorePhotos: boolean
    fieldErrors: FieldErrors
    onDescriptionChange: (value: string) => void
    onFilesSelected: (files: FileList | null) => void
    onSelectCover: (localId: string) => void
    onRetryUpload: (localId: string) => void
    onRemovePhoto: (localId: string) => void
}

const UploadedStoryPhotoCard = ({
    photo,
    onSelectCover,
    onRetryUpload,
    onRemovePhoto,
}: {
    photo: StoryPhoto
    onSelectCover: (localId: string) => void
    onRetryUpload: (localId: string) => void
    onRemovePhoto: (localId: string) => void
}) => {
    const { t } = useTranslation('myTravels')

    if (photo.status === 'failed') {
        return (
            <article className="add-story-photo-card add-story-photo-card--failed">
                <header>
                    <span>{photo.file.name}</span>
                    <button type="button" onClick={() => onRemovePhoto(photo.localId)}>
                        ×
                    </button>
                </header>
                <p>{photo.error ?? t('addStory.upload.failed')}</p>
                <button type="button" onClick={() => onRetryUpload(photo.localId)}>
                    {t('addStory.upload.retry')}
                </button>
            </article>
        )
    }

    if (photo.status === 'uploading') {
        return (
            <article className="add-story-photo-card add-story-photo-card--uploading">
                <p>{t('addStory.upload.uploading')}</p>
                <small>{photo.file.name}</small>
            </article>
        )
    }

    return (
        <article
            className={
                photo.isCover
                    ? 'add-story-photo-card add-story-photo-card--uploaded add-story-photo-card--cover'
                    : 'add-story-photo-card add-story-photo-card--uploaded'
            }
            style={{ backgroundImage: `url(${photo.previewUrl})` }}
        >
            <div className="add-story-photo-card__overlay">
                <button type="button" onClick={() => onSelectCover(photo.localId)}>
                    {photo.isCover ? t('addStory.upload.coverSelected') : t('addStory.upload.makeCover')}
                </button>
                <button type="button" onClick={() => onRemovePhoto(photo.localId)}>
                    {t('addStory.upload.remove')}
                </button>
            </div>
        </article>
    )
}

export const StepThreePublish = ({
    storyTitle,
    storyLocation,
    storyPeriod,
    description,
    uploadedFiles,
    canAddMorePhotos,
    fieldErrors,
    onDescriptionChange,
    onFilesSelected,
    onSelectCover,
    onRetryUpload,
    onRemovePhoto,
}: StepThreePublishProps) => {
    const { t } = useTranslation('myTravels')
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const occupiedCards = uploadedFiles.slice(0, MAX_STORY_PHOTOS)
    const showAddButton = canAddMorePhotos
    const placeholdersCount = Math.max(
        MAX_STORY_PHOTOS - occupiedCards.length - (showAddButton ? 1 : 0),
        0,
    )

    return (
        <>
            <section className="add-story-summary-card">
                <header>
                    <p>{t('addStory.step3.summaryLabel')}</p>
                    <span>{storyPeriod}</span>
                </header>
                <h2>{storyTitle}</h2>
                <p>{storyLocation}</p>
            </section>

            <label className="add-story-field">
                <span>{t('addStory.step3.descriptionLabel')}</span>
                <textarea
                    value={description}
                    onChange={(event) => onDescriptionChange(event.target.value)}
                    placeholder={t('addStory.step3.descriptionPlaceholder')}
                    rows={4}
                />
            </label>

            <section className="add-story-field">
                <span>{t('addStory.step3.photosLabel', { count: MAX_STORY_PHOTOS })}</span>
                <div className="add-story-photo-grid">
                    {occupiedCards.map((photo) => (
                        <UploadedStoryPhotoCard
                            key={photo.localId}
                            photo={photo}
                            onSelectCover={onSelectCover}
                            onRetryUpload={onRetryUpload}
                            onRemovePhoto={onRemovePhoto}
                        />
                    ))}

                    {showAddButton && (
                        <button
                            type="button"
                            className="add-story-photo-add"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {t('addStory.upload.add')}
                        </button>
                    )}

                    {Array.from({ length: placeholdersCount }).map((_, index) => (
                        <span key={`placeholder-${index}`} className="add-story-photo-placeholder" />
                    ))}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(event) => {
                        onFilesSelected(event.target.files)
                        event.target.value = ''
                    }}
                />
                <p>{t('addStory.upload.hint')}</p>
                {fieldErrors.publish && <p className="add-story-field__error">{t(fieldErrors.publish)}</p>}
            </section>
        </>
    )
}
