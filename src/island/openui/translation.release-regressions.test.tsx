// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider, T } from './_providers/translation'

declare global {
  interface Window {
    Translator?: unknown
    translation?: unknown
  }
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function requestTexts(init?: RequestInit): string[] {
  const parsed: unknown = JSON.parse(String(init?.body))
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('texts' in parsed) ||
    !Array.isArray(parsed.texts) ||
    !parsed.texts.every(isString)
  ) {
    throw new Error('Translation request did not contain a string texts array')
  }
  return parsed.texts
}

const flushTranslation = async (delayMs = 0) => {
  await act(async () => {
    if (delayMs > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, delayMs))
    }
    await new Promise((resolve) => window.setTimeout(resolve, 0))
    await new Promise((resolve) => window.setTimeout(resolve, 0))
  })
}

describe('OpenUI translation release regressions', () => {
  beforeEach(() => {
    window.localStorage.clear()
    delete window.Translator
    delete window.translation
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('preserves visible whitespace between translated inline text nodes', async () => {
    async function fetchTranslations(
      _input: RequestInfo | URL,
      init?: RequestInit,
    ) {
      expect(requestTexts(init)).toEqual(['Release window', 'opens today'])
      return new Response(
        JSON.stringify({
          translations: ['Fenetre de sortie', "s'ouvre aujourd'hui"],
        }),
        { headers: { 'content-type': 'application/json' } },
      )
    }

    const fetchMock = vi.fn(fetchTranslations)
    vi.stubGlobal('fetch', fetchMock)

    const { container } = render(
      <I18nProvider locale="fr">
        <T>
          <span>Release window </span>
          <strong>opens today</strong>
        </T>
      </I18nProvider>,
    )

    await flushTranslation()

    expect(container.textContent).toBe("Fenetre de sortie s'ouvre aujourd'hui")
  })

  it('translates text when React updates an existing text node', async () => {
    async function fetchTranslations(
      _input: RequestInfo | URL,
      init?: RequestInit,
    ) {
      const translations = requestTexts(init).map((text) =>
        text === 'Release draft state' ? 'Etat brouillon' : 'Etat final',
      )
      return new Response(JSON.stringify({ translations }), {
        headers: { 'content-type': 'application/json' },
      })
    }

    const fetchMock = vi.fn(fetchTranslations)
    vi.stubGlobal('fetch', fetchMock)

    const { getByTestId, rerender } = render(
      <I18nProvider locale="fr">
        <T>
          <span data-testid="release-state">Release draft state</span>
        </T>
      </I18nProvider>,
    )
    await flushTranslation()
    expect(getByTestId('release-state').textContent).toBe('Etat brouillon')

    rerender(
      <I18nProvider locale="fr">
        <T>
          <span data-testid="release-state">Release final state</span>
        </T>
      </I18nProvider>,
    )
    await flushTranslation(70)

    expect(getByTestId('release-state').textContent).toBe('Etat final')
  })

  it('translates generated control accessible names with their visible labels', async () => {
    const translatedBySource: Record<string, string> = {
      Search: 'खोजें',
      Cart: 'कार्ट',
      'Add to Cart': 'कार्ट में जोड़ें',
    }

    async function fetchTranslations(
      _input: RequestInfo | URL,
      init?: RequestInit,
    ) {
      return new Response(
        JSON.stringify({
          translations: requestTexts(init).map(
            (text) => translatedBySource[text] ?? text,
          ),
        }),
        { headers: { 'content-type': 'application/json' } },
      )
    }

    vi.stubGlobal('fetch', vi.fn(fetchTranslations))

    const { getByTestId } = render(
      <I18nProvider locale="hi">
        <T>
          <button data-testid="search-control" aria-label="Search">
            Search
          </button>
          <button data-testid="cart-control" aria-label="Cart">
            Cart
          </button>
          <button
            data-testid="add-control"
            aria-label="Add to Cart Chocolate Chip Cookie"
          >
            Add to Cart
          </button>
        </T>
      </I18nProvider>,
    )

    await flushTranslation()

    expect(getByTestId('add-control').textContent).toBe('कार्ट में जोड़ें')
    expect({
      add: getByTestId('add-control').getAttribute('aria-label'),
      cart: getByTestId('cart-control').getAttribute('aria-label'),
      search: getByTestId('search-control').getAttribute('aria-label'),
    }).toEqual({
      add: 'चॉकलेट चिप कुकी कार्ट में जोड़ें',
      cart: 'कार्ट',
      search: 'खोजें',
    })
  })
})
