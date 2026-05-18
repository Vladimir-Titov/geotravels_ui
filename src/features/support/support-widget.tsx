import { useId, useMemo, useState, type FormEvent } from 'react'
import { Check, MessageCircle, Send, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createSupportTicket } from './support-api'
import './support-widget.css'

const SUPPORT_CONTENT_MAX_LENGTH = 1000

export const SupportWidget = () => {
    const { t } = useTranslation('common')
    const fieldId = useId()
    const descriptionId = useId()
    const errorId = useId()
    const [isOpen, setIsOpen] = useState(false)
    const [content, setContent] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSent, setIsSent] = useState(false)

    const trimmedContent = content.trim()
    const remainingCharacters = SUPPORT_CONTENT_MAX_LENGTH - content.length
    const isNearLimit = remainingCharacters <= 120
    const isOverLimit = remainingCharacters < 0
    const canSubmit = trimmedContent.length > 0 && !isOverLimit && !isSending

    const counterClassName = useMemo(() => {
        if (isOverLimit) {
            return 'support-widget__counter support-widget__counter--error'
        }
        if (isNearLimit) {
            return 'support-widget__counter support-widget__counter--warning'
        }
        return 'support-widget__counter'
    }, [isNearLimit, isOverLimit])

    const closeForm = (): void => {
        setIsOpen(false)
        setError(null)
        setIsSent(false)
    }

    const openForm = (): void => {
        setIsOpen(true)
        setIsSent(false)
    }

    const submitTicket = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        setError(null)
        setIsSent(false)

        if (!trimmedContent) {
            setError(t('support.validation.required'))
            return
        }

        if (content.length > SUPPORT_CONTENT_MAX_LENGTH) {
            setError(t('support.validation.tooLong', { max: SUPPORT_CONTENT_MAX_LENGTH }))
            return
        }

        setIsSending(true)
        try {
            await createSupportTicket(trimmedContent)
            setContent('')
            setIsSent(true)
        } catch (submitError) {
            if (submitError instanceof Error && submitError.message.trim().length > 0) {
                setError(submitError.message)
            } else {
                setError(t('support.errors.submitFailed'))
            }
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className={isOpen ? 'support-widget support-widget--open' : 'support-widget'}>
            {!isOpen && (
                <button type="button" className="support-widget__trigger" onClick={openForm}>
                    <MessageCircle size={15} aria-hidden="true" />
                    {t('support.trigger')}
                </button>
            )}

            {isOpen && (
                <section className="support-widget__panel" aria-labelledby="support-widget-title">
                    <header className="support-widget__header">
                        <div>
                            <h2 id="support-widget-title">{t('support.title')}</h2>
                            <p>{t('support.subtitle')}</p>
                        </div>
                        <button type="button" className="support-widget__close" onClick={closeForm} aria-label={t('support.close')}>
                            <X size={16} aria-hidden="true" />
                        </button>
                    </header>

                    <form className="support-widget__form" onSubmit={(event) => void submitTicket(event)}>
                        <label className="support-widget__field" htmlFor={fieldId}>
                            {t('support.fieldLabel')}
                        </label>
                        <textarea
                            id={fieldId}
                            value={content}
                            maxLength={SUPPORT_CONTENT_MAX_LENGTH}
                            rows={4}
                            placeholder={t('support.placeholder')}
                            aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ''}`}
                            aria-invalid={Boolean(error) || isOverLimit}
                            onChange={(event) => {
                                setContent(event.target.value)
                                setError(null)
                                setIsSent(false)
                            }}
                        />
                        <div id={descriptionId} className="support-widget__meta">
                            <span>{t('support.limit', { max: SUPPORT_CONTENT_MAX_LENGTH })}</span>
                            <span className={counterClassName} aria-live="polite">
                                {t('support.counter', {
                                    count: content.length,
                                    max: SUPPORT_CONTENT_MAX_LENGTH,
                                })}
                            </span>
                        </div>

                        {error && (
                            <p id={errorId} role="alert" className="support-widget__message support-widget__message--error">
                                {error}
                            </p>
                        )}
                        {isSent && (
                            <p role="status" className="support-widget__message support-widget__message--success">
                                <Check size={15} aria-hidden="true" />
                                {t('support.success')}
                            </p>
                        )}

                        <button type="submit" className="support-widget__submit" disabled={!canSubmit}>
                            <Send size={15} aria-hidden="true" />
                            {isSending ? t('support.sending') : t('support.submit')}
                        </button>
                    </form>
                </section>
            )}
        </div>
    )
}
