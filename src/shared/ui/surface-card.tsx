import type { ReactNode } from 'react'
import './surface-card.css'

interface SurfaceCardProps {
    className?: string
    children: ReactNode
}

interface StatCardProps {
    label: string
    value: string | number
    hint?: string
    className?: string
}

export const SurfaceCard = ({ className, children }: SurfaceCardProps) => {
    const classes = ['tm-surface-card', className].filter(Boolean).join(' ')

    return <section className={classes}>{children}</section>
}

export const StatCard = ({ label, value, hint, className }: StatCardProps) => {
    const classes = ['tm-stat-card', className].filter(Boolean).join(' ')

    return (
        <SurfaceCard className={classes}>
            <p className="tm-stat-card__label">{label}</p>
            <p className="tm-stat-card__value">{value}</p>
            {hint && <p className="tm-stat-card__hint">{hint}</p>}
        </SurfaceCard>
    )
}
