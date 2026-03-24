import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './auth-context'
import { telegramAppLogin } from './auth-api'

export const TelegramAppPage = () => {
    const { onAuthSuccess } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const initData = (window as any).Telegram?.WebApp?.initData
        if (!initData) {
            navigate('/auth', { replace: true })
            return
        }
        telegramAppLogin(initData)
            .then((tokens) => {
                onAuthSuccess(tokens)
                navigate('/map', { replace: true })
            })
            .catch(() => {
                navigate('/auth', { replace: true })
            })
    }, [])

    return null
}
