import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './auth-context'
import { telegramAppLogin } from './auth-api'

export const TelegramAppPage = () => {
    const { onAuthSuccess } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://telegram.org/js/telegram-web-app.js'
        script.onload = () => {
            const initData = (window as Window & { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData
            if (!initData) {
                navigate('/auth', { replace: true })
                return
            }
            telegramAppLogin(initData)
                .then((tokens) => {
                    onAuthSuccess(tokens)
                    navigate('/map', { replace: true })
                })
                .catch(() => navigate('/auth', { replace: true }))
        }
        script.onerror = () => navigate('/auth', { replace: true })
        document.head.appendChild(script)
    }, [])

    return null
}
