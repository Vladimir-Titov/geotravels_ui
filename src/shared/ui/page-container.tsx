import type { PropsWithChildren } from 'react'
import './page-container.css'

interface PageContainerProps extends PropsWithChildren {
    className?: string
}

export const PageContainer = ({ className, children }: PageContainerProps) => {
    const classes = ['tm-page-container', className].filter(Boolean).join(' ')

    return <div className={classes}>{children}</div>
}
