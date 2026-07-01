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
})
