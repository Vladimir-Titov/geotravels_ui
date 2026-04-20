import type { DashboardHeader as DashboardHeaderData } from '../../../shared/api/types'
import './dashboard-header.css'

interface DashboardHeaderProps {
    header: DashboardHeaderData
    onAddStory: () => void
    onUploadPhotos: () => void
}

export const DashboardHeader = ({ header, onAddStory, onUploadPhotos }: DashboardHeaderProps) => {
    return (
        <header className="my-travels-head">
            <div className="my-travels-head__text">
                <h1>{header.title}</h1>
                <p>{header.subtitle}</p>
            </div>

            <div className="my-travels-head__actions">
                <span className="my-travels-badge">{header.recapBadge}</span>
                <div className="my-travels-head__buttons">
                    <button
                        type="button"
                        className="my-travels-btn my-travels-btn--primary"
                        onClick={onAddStory}
                    >
                        + Add story
                    </button>
                    <button
                        type="button"
                        className="my-travels-btn my-travels-btn--secondary"
                        onClick={onUploadPhotos}
                    >
                        Upload photos
                    </button>
                </div>
            </div>
        </header>
    )
}
