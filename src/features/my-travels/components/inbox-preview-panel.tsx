import { useTranslation } from 'react-i18next'
import type { MyTravelsDashboardResponse } from '../../../shared/api/types'
import './inbox-preview-panel.css'

interface InboxPreviewPanelProps {
    inboxPreview: MyTravelsDashboardResponse['inboxPreview']
}

const getNotificationTitle = (type: string, t: (key: string) => string): string => {
    switch (type.trim().toLowerCase()) {
        case 'like':
            return t('inbox.types.like')
        case 'follow':
            return t('inbox.types.follow')
        case 'comment':
            return t('inbox.types.comment')
        default:
            return t('inbox.types.notification')
    }
}

const formatNotificationDate = (value: string, language: string): string => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return ''
    }

    return parsed.toLocaleTimeString(language, {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export const InboxPreviewPanel = ({ inboxPreview }: InboxPreviewPanelProps) => {
    const { t, i18n } = useTranslation('myTravels')
    const language = i18n.resolvedLanguage ?? i18n.language

    return (
        <section className="my-travels-panel my-travels-inbox">
            <header>
                <h2>{t('inbox.title')}</h2>
                <span>{t('inbox.unread', { count: inboxPreview.unreadCount })}</span>
            </header>
            <p>{t('inbox.subtitle')}</p>

            <div className="my-travels-inbox__list">
                {inboxPreview.items.length === 0 && <p>{t('inbox.empty')}</p>}
                {inboxPreview.items.map((item) => (
                    <article key={`${item.type}-${item.createdAt}-${item.text}`} className="inbox-item">
                        <span
                            className={`inbox-item__dot ${!item.isRead ? 'is-warning' : ''}`}
                            aria-hidden="true"
                        />
                        <div className="inbox-item__body">
                            <h3>{getNotificationTitle(item.type, t)}</h3>
                            <p>{item.text}</p>
                        </div>
                        <strong>{formatNotificationDate(item.createdAt, language)}</strong>
                    </article>
                ))}
            </div>
        </section>
    )
}
