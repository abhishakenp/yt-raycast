// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

// Stub the heavy runtime + on-device translator so importing the provider
// module stays lightweight; only the pure shimmer-removal helper is exercised.
vi.mock('@ship-fast/blocks/runtime', () => ({
  useQuery: vi.fn(),
  QueryClient: class {},
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}))
vi.mock('./chrome-translator', () => ({
  translateOnDevice: vi.fn().mockResolvedValue(null),
  canUseChromeTranslator: vi.fn().mockReturnValue(false),
}))

import { applyTranslationResult } from './translation'

describe('translation shimmer removal', () => {
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
})
