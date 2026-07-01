// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LocalizationPanel } from './LocalizationPanel'

const realLithuanianCustomLanguage = {
  code: 'lt',
  name: 'Lithuanian',
  nativeName: 'Lithuanian',
}

const realCraftBeerPrompt =
  'a craft beer brewery with taproom tours and seasonal releases in portland'

const originalFetch = globalThis.fetch

describe('LocalizationPanel', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    cleanup()
    globalThis.fetch = originalFetch
  })

  it('posts the current text and real DB-derived locale to the translation endpoint', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({
        translations: [realCraftBeerPrompt],
        locale: realLithuanianCustomLanguage.code,
        translated: false,
        skipped: 'browser_native',
      }),
    )
    const view = render(
      <LocalizationPanel
        preferredLanguage={realLithuanianCustomLanguage.code}
        prompt={realCraftBeerPrompt}
      />,
    )

    fireEvent.click(view.getByRole('button', { name: /translate/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: [realCraftBeerPrompt],
          locale: realLithuanianCustomLanguage.code,
        }),
      })
    })
    expect(view.getByText('browser_native')).toBeTruthy()
    expect(view.getAllByText(realCraftBeerPrompt)).toHaveLength(2)
  })

  it('keeps user-edited text when parent prompt props change', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({
        translations: ['Bonjour'],
        locale: 'fr',
        translated: true,
      }),
    )
    const view = render(
      <LocalizationPanel
        preferredLanguage="fr"
        prompt="Original landing page headline"
      />,
    )
    const textarea = view.getByLabelText(/text/i)

    fireEvent.change(textarea, {
      target: { value: 'Edited landing page headline' },
    })
    view.rerender(
      <LocalizationPanel
        preferredLanguage="fr"
        prompt="Updated prompt from parent"
      />,
    )
    fireEvent.click(view.getByRole('button', { name: /translate/i }))

    await waitFor(() => {
      expect(
        JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body)),
      ).toEqual({
        texts: ['Edited landing page headline'],
        locale: 'fr',
      })
    })
    expect((textarea as HTMLTextAreaElement).value).toBe(
      'Edited landing page headline',
    )
  })

  it('surfaces translation API errors and clears stale result output', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        Response.json({
          translations: ['Hola'],
          locale: 'es-MX',
          translated: true,
        }),
      )
      .mockResolvedValueOnce(
        Response.json({ error: 'model unavailable' }, { status: 502 }),
      )
    const view = render(
      <LocalizationPanel preferredLanguage="es-MX" prompt="Book a tour" />,
    )

    fireEvent.click(view.getByRole('button', { name: /translate/i }))
    await waitFor(() => expect(view.getByText('Hola')).toBeTruthy())

    fireEvent.click(view.getByRole('button', { name: /translate/i }))

    await waitFor(() =>
      expect(view.getByText('model unavailable')).toBeTruthy(),
    )
    expect(view.queryByText('Hola')).toBeNull()
  })

  it('shows a stable translation error when the endpoint returns malformed HTML', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('<!doctype html><h1>Gateway failure</h1>', {
        headers: { 'content-type': 'text/html' },
        status: 502,
      }),
    )
    const view = render(
      <LocalizationPanel
        preferredLanguage={realLithuanianCustomLanguage.code}
        prompt={realCraftBeerPrompt}
      />,
    )

    fireEvent.click(view.getByRole('button', { name: /translate/i }))

    await waitFor(() =>
      expect(view.getByText(/translation failed/i)).toBeTruthy(),
    )
    expect(view.container.textContent).not.toMatch(
      /unexpected token|valid json|doctype|gateway failure/i,
    )
  })
})
