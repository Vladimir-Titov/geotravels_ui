import './community-page.css'
import { DisabledActionButton, SectionHeader, SurfaceCard } from '../../shared/ui'

interface ExplorerCard {
    name: string
    handle: string
    countries: number
}

const explorers: ExplorerCard[] = [
    { name: 'Макс Иванов', handle: '@max_explorer', countries: 12 },
    { name: 'Денис Лебедев', handle: '@denis_nomad', countries: 8 },
    { name: 'Алиса Вондер', handle: '@alice_w', countries: 5 },
]

export const CommunityPage = () => {
    return (
        <div className="community-page">
            <SectionHeader
                title="Сообщество"
                subtitle="Находи новых друзей и делись маршрутами"
            />

            <div className="community-page__tabs">
                <button type="button" className="is-active">
                    Клуб Искателей
                </button>
                <button type="button" disabled>
                    Ваши подписки
                </button>
            </div>

            <div className="community-list">
                {explorers.map((explorer, index) => (
                    <SurfaceCard key={explorer.handle} className="community-card">
                        <div className={`community-card__avatar community-card__avatar--${index}`} />
                        <div className="community-card__meta">
                            <h2>{explorer.name}</h2>
                            <p>{explorer.handle}</p>
                            <span>{explorer.countries} стран</span>
                        </div>
                        <DisabledActionButton className="community-card__follow">
                            Подписаться
                        </DisabledActionButton>
                    </SurfaceCard>
                ))}
            </div>
        </div>
    )
}
