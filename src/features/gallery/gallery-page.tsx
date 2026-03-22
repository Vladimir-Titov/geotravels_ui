import './gallery-page.css'
import { DisabledActionButton, SectionHeader, SurfaceCard } from '../../shared/ui'

interface GalleryItem {
    title: string
    location: string
}

const galleryItems: GalleryItem[] = [
    { title: 'Roman Holiday', location: 'Rome, Italy' },
    { title: 'Old Harbor', location: 'Marseille, France' },
    { title: 'Northern Wind', location: 'Reykjavik, Iceland' },
    { title: 'Ocean Rhythm', location: 'Lisbon, Portugal' },
    { title: 'Mountain Trails', location: 'Tbilisi, Georgia' },
    { title: 'Golden Hour', location: 'Istanbul, Turkey' },
]

export const GalleryPage = () => {
    return (
        <div className="gallery-page">
            <SectionHeader
                title="Photo Archive"
                subtitle="Frozen moments of your discoveries"
                action={<DisabledActionButton>Add frames</DisabledActionButton>}
            />

            <div className="gallery-grid">
                {galleryItems.map((item, index) => (
                    <SurfaceCard key={`${item.title}-${item.location}`} className="gallery-card">
                        <div className={`gallery-card__preview gallery-card__preview--${index % 6}`} />
                        <div className="gallery-card__body">
                            <h2>{item.title}</h2>
                            <p>{item.location}</p>
                        </div>
                    </SurfaceCard>
                ))}
            </div>
        </div>
    )
}
