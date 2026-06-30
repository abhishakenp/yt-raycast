// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('browser native language resolver', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).Translator
  })

  it('resolves a typed language name to a browser-supported locale generically', async () => {
    const availability = vi.fn(async ({ targetLanguage }) =>
      targetLanguage === 'lt' ? 'available' : 'unavailable',
    )
    ;(globalThis as Record<string, unknown>).Translator = {
      availability,
      create: vi.fn(),
    }

    const { resolveBrowserNativeLanguage } =
      await import('./browser-native-language')

    await expect(
      resolveBrowserNativeLanguage('Lithuanian'),
    ).resolves.toMatchObject({
      code: 'lt',
      name: 'Lithuanian',
      nativeName: 'lietuvių',
    })
    expect(availability).toHaveBeenCalledWith({
      sourceLanguage: 'en',
      targetLanguage: 'lt',
    })
  })

  it('derives native display names and script fonts without per-language metadata', async () => {
    ;(globalThis as Record<string, unknown>).Translator = {
      availability: vi.fn(async ({ targetLanguage }) =>
        targetLanguage === 'zh' ? 'available' : 'unavailable',
      ),
      create: vi.fn(),
    }

    const { resolveBrowserNativeLanguage } =
      await import('./browser-native-language')

    await expect(
      resolveBrowserNativeLanguage('Chinese'),
    ).resolves.toMatchObject({
      code: 'zh',
      nativeName: '中文',
      fontFamily: 'Noto Sans SC, sans-serif',
    })
  })

  it('returns null when the browser translator does not support the matched locale', async () => {
    ;(globalThis as Record<string, unknown>).Translator = {
      availability: vi.fn(async () => 'unavailable'),
      create: vi.fn(),
    }

    const { resolveBrowserNativeLanguage } =
      await import('./browser-native-language')

    await expect(resolveBrowserNativeLanguage('Lithuanian')).resolves.toBeNull()
  })
})
