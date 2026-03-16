import { useEffect, useRef } from 'react'
import { TELEGRAM_BOT_NAME } from '../../shared/config/env'
import type { TelegramAuthData } from '../../shared/api/types'

interface Props {
    onAuth: (data: TelegramAuthData) => void
}

export const TelegramLoginButton = ({ onAuth }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const onAuthRef = useRef(onAuth)

    useEffect(() => {
        onAuthRef.current = onAuth
    }, [onAuth])

    useEffect(() => {
        ; (window as Record<string, unknown>)['__tgOnAuth'] = (user: TelegramAuthData) =>
            onAuthRef.current(user)


        const script = document.createElement('script')
        script.src = 'https://telegram.org/js/telegram-widget.js?22'
        script.setAttribute('data-telegram-login', TELEGRAM_BOT_NAME)
        script.setAttribute('data-size', 'large')
        script.setAttribute('data-onauth', '__tgOnAuth(user)')
        script.setAttribute('data-request-access', 'write')
        script.async = true

        const container = containerRef.current
        container?.appendChild(script)

        return () => {
            container?.removeChild(script)
            delete (window as Record<string, unknown>)['__tgOnAuth']
        }
    }, [])

    return <div ref={containerRef} className='tg-login-widget' />
}
