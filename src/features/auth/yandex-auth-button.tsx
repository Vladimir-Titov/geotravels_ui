import { useEffect, useId, useRef, useState } from 'react'
import { getYandexRedirectUri, YANDEX_CLIENT_ID } from '../../shared/config/env'
import type { YandexAuthData } from '../../shared/api/types'

interface Props {
    loadingLabel: string
    onAuth: (data: YandexAuthData) => void | Promise<void>
}

interface YandexAuthSuggestResult {
    status: 'ok' | 'error'
    code?: string
    handler?: () => Promise<YandexAuthData>
}

interface YandexAuthSuggest {
    init: (
        oauthQueryParams: {
            client_id: string
            response_type: 'code'
            redirect_uri?: string
        },
        tokenPageOrigin: string,
        suggestParams: {
            view: 'button'
            parentId: string
            buttonView: 'main' | 'additional' | 'icon' | 'iconBG'
            buttonTheme: 'light' | 'dark'
            buttonSize: 'm' | 'l' | 'xl'
            buttonBorderRadius: number
        },
    ) => Promise<YandexAuthSuggestResult>
}

type YandexAuthWindow = Window & {
    YaAuthSuggest?: YandexAuthSuggest
}

const YANDEX_SUGGEST_SCRIPT_SRC =
    'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js'

const getOrigin = (url: string): string => {
    try {
        return new URL(url).origin
    } catch {
        return window.location.origin
    }
}

export const YandexAuthButton = ({ loadingLabel, onAuth }: Props) => {
    const generatedId = useId().replace(/:/g, '')
    const containerId = `yandex-auth-${generatedId}`
    const onAuthRef = useRef(onAuth)
    const [isReady, setIsReady] = useState(false)
    const [isUnavailable, setIsUnavailable] = useState(YANDEX_CLIENT_ID.trim().length === 0)

    useEffect(() => {
        onAuthRef.current = onAuth
    }, [onAuth])

    useEffect(() => {
        const clientId = YANDEX_CLIENT_ID.trim()

        if (clientId.length === 0) {
            return
        }

        const redirectUri = getYandexRedirectUri()

        let isDisposed = false
        let script: HTMLScriptElement | null = null

        const markUnavailable = (): void => {
            if (!isDisposed) {
                setIsUnavailable(true)
            }
        }

        const initializeButton = async (): Promise<void> => {
            const authSuggest = (window as YandexAuthWindow).YaAuthSuggest

            if (!authSuggest) {
                markUnavailable()
                return
            }

            try {
                const result = await authSuggest.init(
                    {
                        client_id: clientId,
                        response_type: 'code',
                        redirect_uri: redirectUri,
                    },
                    getOrigin(redirectUri),
                    {
                        view: 'button',
                        parentId: containerId,
                        buttonView: 'main',
                        buttonTheme: 'light',
                        buttonSize: 'm',
                        buttonBorderRadius: 12,
                    },
                )

                if (isDisposed) {
                    return
                }

                if (result.status !== 'ok' || !result.handler) {
                    markUnavailable()
                    return
                }

                const authPromise = result.handler()
                setIsReady(true)
                authPromise.then((data) => onAuthRef.current(data)).catch(() => undefined)
            } catch {
                markUnavailable()
            }
        }

        script = document.createElement('script')
        script.src = YANDEX_SUGGEST_SCRIPT_SRC
        script.async = true
        script.onload = () => void initializeButton()
        script.onerror = markUnavailable
        document.head.appendChild(script)

        return () => {
            isDisposed = true
            script?.parentElement?.removeChild(script)
        }
    }, [containerId])

    if (isUnavailable) {
        return null
    }

    return (
        <div className="ya-auth">
            {!isReady && (
                <button className="ya-auth-placeholder" disabled type="button">
                    {loadingLabel}
                </button>
            )}
            <div
                id={containerId}
                className={isReady ? 'ya-auth-widget ya-auth-widget--ready' : 'ya-auth-widget'}
                aria-hidden={!isReady}
            />
        </div>
    )
}
