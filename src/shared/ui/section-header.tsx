import type { ReactNode } from 'react'
import './section-header.css'

interface SectionHeaderProps {
    title: string
    subtitle?: string
    action?: ReactNode
    className?: string
}

export const SectionHeader = ({ title, subtitle, action, className }: SectionHeaderProps) => {
    const classes = ['tm-section-header', className].filter(Boolean).join(' ')

    return (
        <header className={classes}>
            <div className="tm-section-header__text">
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {action && <div className="tm-section-header__action">{action}</div>}
        </header>
    )
}
