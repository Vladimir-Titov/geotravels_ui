interface PageStateProps {
    title: string
    text: string
    actionLabel?: string
    onAction?: () => void
    role?: 'status' | 'alert'
}

export const PageState = ({ title, text, actionLabel, onAction, role = 'status' }: PageStateProps) => {
    return (
        <section className="trips-state" role={role} aria-live={role === 'alert' ? 'assertive' : 'polite'}>
            <h1>{title}</h1>
            <p>{text}</p>
            {actionLabel && onAction && (
                <button type="button" onClick={onAction}>
                    {actionLabel}
                </button>
            )}
        </section>
    )
}
