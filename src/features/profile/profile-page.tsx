import './profile-page.css'
import { DisabledActionButton, SectionHeader, StatCard, SurfaceCard } from '../../shared/ui'

export const ProfilePage = () => {
    return (
        <div className="profile-page">
            <SectionHeader title="Profile" subtitle="Your personal traveler card" />

            <SurfaceCard className="profile-card">
                <div className="profile-card__cover" />
                <div className="profile-card__avatar" />

                <div className="profile-card__head">
                    <div>
                        <h2>Your Name</h2>
                        <p>@wanderlust_spirit</p>
                    </div>
                    <DisabledActionButton>Edit profile</DisabledActionButton>
                </div>

                <blockquote>"Not all who wander are lost."</blockquote>
                <p className="profile-card__description">
                    World explorer. Leaving traces on dusty roads and collecting stories from every
                    horizon. Every journey is a new chapter.
                </p>

                <div className="profile-card__stats">
                    <StatCard label="Countries discovered" value={12} />
                    <StatCard label="Achievements" value={5} />
                </div>
            </SurfaceCard>
        </div>
    )
}
