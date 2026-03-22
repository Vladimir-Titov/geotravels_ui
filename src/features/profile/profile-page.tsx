import './profile-page.css'
import { DisabledActionButton, SectionHeader, StatCard, SurfaceCard } from '../../shared/ui'

export const ProfilePage = () => {
    return (
        <div className="profile-page">
            <SectionHeader title="Профиль" subtitle="Твоя личная карточка путешественника" />

            <SurfaceCard className="profile-card">
                <div className="profile-card__cover" />
                <div className="profile-card__avatar" />

                <div className="profile-card__head">
                    <div>
                        <h2>Твое Имя</h2>
                        <p>@wanderlust_spirit</p>
                    </div>
                    <DisabledActionButton>Редактировать</DisabledActionButton>
                </div>

                <blockquote>
                    "Не все те, кто блуждают, потеряны."
                </blockquote>
                <p className="profile-card__description">
                    Исследователь мира. Оставляю свои следы на пыльных тропах. Верю, что каждое
                    путешествие — это новая глава жизни.
                </p>

                <div className="profile-card__stats">
                    <StatCard label="Открыто стран" value={12} />
                    <StatCard label="Достижения" value={5} />
                </div>
            </SurfaceCard>
        </div>
    )
}
