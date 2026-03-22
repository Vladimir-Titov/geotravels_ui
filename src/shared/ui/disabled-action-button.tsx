import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './disabled-action-button.css'

interface DisabledActionButtonProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
    children: ReactNode
    badgeText?: string
}

export const DisabledActionButton = ({
    children,
    className,
    badgeText = 'Soon',
    type = 'button',
    ...buttonProps
}: DisabledActionButtonProps) => {
    const classes = ['tm-disabled-action', className].filter(Boolean).join(' ')

    return (
        <button {...buttonProps} type={type} className={classes} disabled>
            <span>{children}</span>
            <span className="tm-disabled-action__badge" aria-hidden="true">
                {badgeText}
            </span>
        </button>
    )
}
