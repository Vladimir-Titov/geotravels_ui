import type { ErrorEvent } from '@sentry/browser'

const YANDEX_AUTH_FRAME_MARKERS = [
    '/s3/passport-static/autofill/',
    '/s3/passport-sdk/autofill/',
    'yastatic.net/s3/passport',
    '/metrika/tag.js',
]

const YANDEX_AUTH_ERROR_MARKERS = ['_counter is undefined', 'property "params"']

const hasYandexAuthFrame = (event: ErrorEvent): boolean => {
    const frames = event.exception?.values?.flatMap((value) => value.stacktrace?.frames ?? []) ?? []

    return frames.some((frame) => {
        const filename = frame.filename ?? ''
        return YANDEX_AUTH_FRAME_MARKERS.some((marker) => filename.includes(marker))
    })
}

const hasYandexAuthMessage = (event: ErrorEvent): boolean => {
    const messages = [
        event.message,
        ...(event.exception?.values?.flatMap((value) => [value.value, value.type]) ?? []),
    ].filter((message): message is string => typeof message === 'string')

    return messages.some((message) =>
        YANDEX_AUTH_ERROR_MARKERS.every((marker) => message.includes(marker)),
    )
}

export const shouldDropSentryEvent = (event: ErrorEvent): boolean => {
    return hasYandexAuthFrame(event) && hasYandexAuthMessage(event)
}

export const beforeSend = (event: ErrorEvent): ErrorEvent | null => {
    if (shouldDropSentryEvent(event)) {
        return null
    }

    return event
}
