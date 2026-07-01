// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const translationMocks = vi.hoisted(() => ({
  canUseChromeTranslator: vi.fn().mockReturnValue(false),
  translateOnDevice: vi.fn().mockResolvedValue(null),
}))

// Stub the heavy runtime + on-device translator so importing the provider
// module stays lightweight; only the pure shimmer-removal helper is exercised.
vi.mock('@ship-fast/blocks/runtime', () => ({
  useQuery: vi.fn(),
  QueryClient: class {},
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}))
vi.mock('./chrome-translator', () => ({
  translateOnDevice: translationMocks.translateOnDevice,
  canUseChromeTranslator: translationMocks.canUseChromeTranslator,
}))

import { I18nProvider, T, applyTranslationResult } from './translation'

describe('translation shimmer removal', () => {
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
    translationMocks.translateOnDevice.mockReset()
    translationMocks.translateOnDevice.mockResolvedValue(null)
    translationMocks.canUseChromeTranslator.mockReset()
    translationMocks.canUseChromeTranslator.mockReturnValue(false)
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    globalThis.fetch = originalFetch
  })

  it('removes the shimmer class even when the translation equals the original text', () => {
    const parent = document.createElement('span')
    parent.classList.add('sf-shimmer-loading')
    parent.style.backgroundImage = 'linear-gradient(90deg, #0000, currentColor)'
    document.body.appendChild(parent)
    const node = document.createTextNode('Hello')
    parent.appendChild(node)

    applyTranslationResult(parent, node, 'Hello', 'Hello')

    expect(parent.classList.contains('sf-shimmer-loading')).toBe(false)
    expect(parent.style.backgroundImage).toBe('')
    // textContent must stay unchanged when the translation equals the original
    expect(node.textContent).toBe('Hello')
  })

  it('updates text content only when the translation differs from the original', () => {
    const parent = document.createElement('span')
    parent.classList.add('sf-shimmer-loading')
    document.body.appendChild(parent)
    const node = document.createTextNode('Hello')
    parent.appendChild(node)

    applyTranslationResult(parent, node, 'Bonjour', 'Hello')

    expect(parent.classList.contains('sf-shimmer-loading')).toBe(false)
    expect(node.textContent).toBe('Bonjour')
  })

  it('clears all shimmer-related inline styles, not just the class', () => {
    const parent = document.createElement('span')
    parent.classList.add('sf-shimmer-loading')
    parent.style.backgroundImage = 'linear-gradient(90deg, #0000, currentColor)'
    parent.style.backgroundClip = 'text'
    parent.style.color = 'transparent'
    document.body.appendChild(parent)
    const node = document.createTextNode('Hello')
    parent.appendChild(node)

    applyTranslationResult(parent, node, 'Bonjour', 'Hello')

    expect(parent.style.backgroundImage).toBe('')
    expect(parent.style.color).toBe('')
  })

  it('does not throw when the parent element is missing', () => {
    const node = document.createTextNode('Hello')
    expect(() =>
      applyTranslationResult(null, node, 'Hello', 'Hello'),
    ).not.toThrow()
  })

  it('translates collected text nodes with one positional array request', async () => {
    const requests: string[][] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
      }
      requests.push(body.texts ?? [])
      return {
        ok: true,
        json: async () => ({
          translations: ['Commencer', 'Reserver'],
        }),
      } as Response
    }) as unknown as typeof fetch

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'fr' },
        createElement(
          T,
          null,
          createElement('span', null, 'Start now'),
          createElement('span', null, 'Book'),
        ),
      ),
    )

    await waitFor(() => {
      expect(getByText('Commencer')).toBeTruthy()
      expect(getByText('Reserver')).toBeTruthy()
    })
    expect(requests).toEqual([['Start now', 'Book']])
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('reuses cached translations for the same locale and text without another API call', async () => {
    globalThis.fetch = vi.fn(async () => {
      return {
        ok: true,
        json: async () => ({
          translations: ['Bonjour'],
        }),
      } as Response
    }) as unknown as typeof fetch

    const first = render(
      createElement(
        I18nProvider,
        { locale: 'fr' },
        createElement(T, null, createElement('span', null, 'Hello')),
      ),
    )

    await waitFor(() => expect(first.getByText('Bonjour')).toBeTruthy())
    first.unmount()

    const second = render(
      createElement(
        I18nProvider,
        { locale: 'fr' },
        createElement(T, null, createElement('span', null, 'Hello')),
      ),
    )

    await waitFor(() => expect(second.getByText('Bonjour')).toBeTruthy())
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('uses on-device browser translations without calling the model-backed API', async () => {
    translationMocks.translateOnDevice.mockImplementation(async (text) =>
      text === 'Explore menu' ? 'Naršyti meniu' : 'Rezervuoti',
    )
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network translator should not run')
    }) as unknown as typeof fetch

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'lt' },
        createElement(
          T,
          null,
          createElement('span', null, 'Explore menu'),
          createElement('span', null, 'Reserve'),
        ),
      ),
    )

    await waitFor(() => {
      expect(getByText('Naršyti meniu')).toBeTruthy()
      expect(getByText('Rezervuoti')).toBeTruthy()
    })
    expect(translationMocks.translateOnDevice).toHaveBeenCalledTimes(2)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('sends only on-device misses to the API and preserves positional output', async () => {
    const requests: string[][] = []
    translationMocks.translateOnDevice.mockImplementation(async (text) =>
      text === 'Browser local' ? 'Naršyklės vertimas' : null,
    )
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
      }
      requests.push(body.texts ?? [])
      return {
        ok: true,
        json: async () => ({
          translations: ['Modelio vertimas'],
        }),
      } as Response
    }) as unknown as typeof fetch

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'lt' },
        createElement(
          T,
          null,
          createElement('span', null, 'Browser local'),
          createElement('span', null, 'Model miss'),
        ),
      ),
    )

    await waitFor(() => {
      expect(getByText('Naršyklės vertimas')).toBeTruthy()
      expect(getByText('Modelio vertimas')).toBeTruthy()
    })
    expect(requests).toEqual([['Model miss']])
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('sends a single collected text node as a one-element positional array', async () => {
    const requests: string[][] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
      }
      requests.push(body.texts ?? [])
      return {
        ok: true,
        json: async () => ({
          translations: ['Contacto'],
        }),
      } as Response
    }) as unknown as typeof fetch

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'es-MX' },
        createElement(T, null, createElement('span', null, 'Contact')),
      ),
    )

    await waitFor(() => expect(getByText('Contacto')).toBeTruthy())
    expect(requests).toEqual([['Contact']])
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })
})
