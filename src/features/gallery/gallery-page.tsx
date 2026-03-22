import './gallery-page.css'
import { DisabledActionButton, SectionHeader, SurfaceCard } from '../../shared/ui'

interface GalleryItem {
    title: string
    location: string
}

const galleryItems: GalleryItem[] = [
    { title: 'Римские каникулы', location: 'Рим, Италия' },
    { title: 'Старый порт', location: 'Марсель, Франция' },
    { title: 'Северный ветер', location: 'Рейкьявик, Исландия' },
    { title: 'Океанский ритм', location: 'Лиссабон, Португалия' },
    { title: 'Горные тропы', location: 'Тбилиси, Грузия' },
    { title: 'Золотой час', location: 'Стамбул, Турция' },
]

export const GalleryPage = () => {
    return (
        <div className="gallery-page">
            <SectionHeader
                title="Фото-архив"
                subtitle="Застывшие моменты ваших открытий"
                action={<DisabledActionButton>Добавить кадры</DisabledActionButton>}
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
