import { describe, expect, it, vi } from 'vitest'

const chromeTranslatorMocks = vi.hoisted(() => ({
  availableLocales: new Set<string>(),
  isAvailable: vi.fn(async (locale: string) =>
    chromeTranslatorMocks.availableLocales.has(locale),
  ),
}))

vi.mock('../../island/openui/_providers/chrome-translator', () => ({
  isChromeTranslatorLocaleAvailable: chromeTranslatorMocks.isAvailable,
}))

const { findBrowserNativeLocaleCandidates, resolveBrowserNativeLanguage } =
  await import('./browser-native-language')

describe('browser-native language resolver', () => {
  it('resolves any browser-supported native locale without requiring static picker entries', async () => {
    chromeTranslatorMocks.availableLocales = new Set(['lt', 'ja'])

    const lithuanian = await resolveBrowserNativeLanguage('Lithuanian')
    const japanese = await resolveBrowserNativeLanguage('Japanese')

    expect(lithuanian).toMatchObject({
      code: 'lt',
      name: 'Lithuanian',
      fontFamily: 'Inter, system-ui, sans-serif',
    })
    expect(lithuanian?.nativeName.toLowerCase()).toContain('lietu')
    expect(japanese).toMatchObject({
      code: 'ja',
      name: 'Japanese',
      fontFamily: 'Noto Sans JP, sans-serif',
    })
    expect(japanese?.nativeName).not.toBe('Japanese')
    expect(chromeTranslatorMocks.isAvailable).toHaveBeenCalledWith('lt')
    expect(chromeTranslatorMocks.isAvailable).toHaveBeenCalledWith('ja')
  })

  it('maps regional language hints to browser locales and lets availability choose the supported one', async () => {
    chromeTranslatorMocks.availableLocales = new Set(['es-MX'])

    expect(findBrowserNativeLocaleCandidates('Mexican')).toContain('es-MX')
    expect(findBrowserNativeLocaleCandidates('Mexican Spanish')).toContain(
      'es-MX',
    )

    const language = await resolveBrowserNativeLanguage('Mexican')

    expect(language).toMatchObject({
      code: 'es-MX',
      name: 'Mexican Spanish',
      nativeName: 'español de México',
      fontFamily: 'Inter, system-ui, sans-serif',
    })
  })

  it('returns null when the browser translator rejects every candidate', async () => {
    chromeTranslatorMocks.availableLocales = new Set(['fr'])

    await expect(resolveBrowserNativeLanguage('Lithuanian')).resolves.toBeNull()
  })
})
