import { describe, expect, it } from 'vitest'
import indexHtml from '../../../index.html?raw'

describe('index.html', () => {
    it('does not load Telegram scripts before the app bundle', () => {
        expect(indexHtml).not.toContain('telegram.org/js/telegram-web-app.js')
        expect(indexHtml).not.toContain('telegram.org/js/telegram-widget.js')
    })
})
