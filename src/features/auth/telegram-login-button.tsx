import { useEffect, useRef, useState } from 'react'
import { TELEGRAM_BOT_NAME } from '../../shared/config/env'
import type { TelegramAuthData } from '../../shared/api/types'

interface Props {
    onAuth: (data: TelegramAuthData) => void
}

type TelegramAuthWindow = Window & {
    __tgOnAuth?: (user: TelegramAuthData) => void
}

const TELEGRAM_WIDGET_SRC = 'https://telegram.org/js/telegram-widget.js?22'
const TELEGRAM_WIDGET_TIMEOUT_MS = 3500

export const TelegramLoginButton = ({ onAuth }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const onAuthRef = useRef(onAuth)
    const [isReady, setIsReady] = useState(false)
    const [isUnavailable, setIsUnavailable] = useState(TELEGRAM_BOT_NAME.trim().length === 0)

    useEffect(() => {
        onAuthRef.current = onAuth
    }, [onAuth])

    useEffect(() => {
        if (TELEGRAM_BOT_NAME.trim().length === 0) {
            return
        }

        const authWindow = window as TelegramAuthWindow
        let isDisposed = false
        let script: HTMLScriptElement | null = null
        let observer: MutationObserver | null = null
        let loadTimerId: number | undefined
        let timeoutId: number | undefined

        const cleanup = (): void => {
            if (loadTimerId !== undefined) {
                window.clearTimeout(loadTimerId)
                loadTimerId = undefined
            }
            if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId)
                timeoutId = undefined
            }
            observer?.disconnect()
            observer = null
            script?.parentElement?.removeChild(script)
            script = null
            delete authWindow.__tgOnAuth
        }

        const markUnavailable = (): void => {
            if (isDisposed) {
                return
            }
            cleanup()
            setIsUnavailable(true)
        }

        const markReady = (): void => {
            if (isDisposed || !containerRef.current?.querySelector('iframe')) {
                return
            }
            if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId)
                timeoutId = undefined
            }
            setIsReady(true)
        }

        authWindow.__tgOnAuth = (user: TelegramAuthData) => onAuthRef.current(user)

        loadTimerId = window.setTimeout(() => {
            const container = containerRef.current
            if (!container) {
                markUnavailable()
                return
            }

            observer = new MutationObserver(markReady)
            observer.observe(container, { childList: true, subtree: true })

            script = document.createElement('script')
            script.src = TELEGRAM_WIDGET_SRC
            script.setAttribute('data-telegram-login', TELEGRAM_BOT_NAME)
            script.setAttribute('data-size', 'medium')
            script.setAttribute('data-radius', '999')
            script.setAttribute('data-onauth', '__tgOnAuth(user)')
            script.setAttribute('data-request-access', 'write')
            script.async = true
            script.onload = () => window.setTimeout(markReady, 0)
            script.onerror = markUnavailable

            container.appendChild(script)
            timeoutId = window.setTimeout(markUnavailable, TELEGRAM_WIDGET_TIMEOUT_MS)
        }, 0)

        return () => {
            isDisposed = true
            cleanup()
        }
    }, [])

    if (isUnavailable) {
        return null
    }

    return (
        <div
            ref={containerRef}
            className={isReady ? 'tg-login-widget tg-login-widget--ready' : 'tg-login-widget'}
            aria-hidden={!isReady}
        />
    )
}
