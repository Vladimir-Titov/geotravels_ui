import type { DashboardInboxPreview } from '../../../shared/api/types'
import './inbox-preview-panel.css'

interface InboxPreviewPanelProps {
    inboxPreview: DashboardInboxPreview
    unreadInboxCount: number
}

export const InboxPreviewPanel = ({ inboxPreview, unreadInboxCount }: InboxPreviewPanelProps) => {
    return (
        <section className="my-travels-panel my-travels-inbox">
            <header>
                <h2>{inboxPreview.title}</h2>
                <span>{unreadInboxCount} unread</span>
            </header>
            <p>{inboxPreview.subtitle}</p>

            <div className="my-travels-inbox__list">
                {inboxPreview.items.map((item) => (
                    <article key={item.id} className="inbox-item">
                        <span
                            className={`inbox-item__dot ${item.tone === 'warning' ? 'is-warning' : ''}`}
                            aria-hidden="true"
                        />
                        <div className="inbox-item__body">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>
                        <strong>{item.status}</strong>
                    </article>
                ))}
            </div>
        </section>
    )
}
