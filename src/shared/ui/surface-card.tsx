import type { ReactNode } from 'react'
import './surface-card.css'

interface SurfaceCardProps {
    className?: string
    children: ReactNode
}

export const SurfaceCard = ({ className, children }: SurfaceCardProps) => {
    const classes = ['tm-surface-card', className].filter(Boolean).join(' ')

    return <section className={classes}>{children}</section>
}
