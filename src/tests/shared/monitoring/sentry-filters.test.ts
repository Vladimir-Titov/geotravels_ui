import { describe, expect, it } from 'vitest'
import type { Event } from '@sentry/browser'
import { beforeSend, shouldDropSentryEvent } from '../../../shared/monitoring/sentry-filters'

describe('sentry filters', () => {
    it('drops the known Yandex auth SDK metrika counter error', () => {
        const event: Event = {
            type: undefined,
            exception: {
                values: [
                    {
                        type: 'TypeError',
                        value: `can't access property "params", n._counter is undefined`,
                        stacktrace: {
                            frames: [
                                {
                                    filename: '/s3/passport-static/autofill/1.82.1/client/suggest.js',
                                },
                                {
                                    filename: '/metrika/tag.js',
                                },
                            ],
                        },
                    },
                ],
            },
        }

        expect(shouldDropSentryEvent(event)).toBe(true)
        expect(beforeSend(event, {})).toBeNull()
    })

    it('keeps app errors even when the message is similar', () => {
        const event: Event = {
            type: undefined,
            exception: {
                values: [
                    {
                        type: 'TypeError',
                        value: `can't access property "params", n._counter is undefined`,
                        stacktrace: {
                            frames: [
                                {
                                    filename: 'https://tripmark.ru/assets/index.js',
                                },
                            ],
                        },
                    },
                ],
            },
        }

        expect(shouldDropSentryEvent(event)).toBe(false)
        expect(beforeSend(event, {})).toBe(event)
    })

    it('keeps other Yandex SDK errors', () => {
        const event: Event = {
            type: undefined,
            exception: {
                values: [
                    {
                        type: 'TypeError',
                        value: 'another Yandex auth error',
                        stacktrace: {
                            frames: [
                                {
                                    filename: '/s3/passport-static/autofill/1.82.1/client/suggest.js',
                                },
                            ],
                        },
                    },
                ],
            },
        }

        expect(shouldDropSentryEvent(event)).toBe(false)
        expect(beforeSend(event, {})).toBe(event)
    })
})
