import { afterEach, describe, expect, it, vi } from 'vitest'

const getPartialPromptSuggestionsMock = vi.hoisted(() => vi.fn())

vi.mock('./-prompt-suggestions-logic.js', () => ({
  getPartialPromptSuggestions: getPartialPromptSuggestionsMock,
}))

import { Route } from './prompt-suggestions'
import { callRouteHandler } from './route-handler.test-helper'

function postPromptSuggestions(body: string) {
  const request = new Request('https://ship-fast.io/api/prompt-suggestions', {
    body,
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  return callRouteHandler(Route, 'POST', { request })
}

function neverResolve() {
  return new Promise(() => undefined)
}

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('/api/prompt-suggestions release failure modes', () => {
  it.each(['null', '[]', '42', 'true'])(
    'rejects valid JSON with the wrong top-level shape: %s',
    async function rejectsWrongShape(body) {
      const response = await postPromptSuggestions(body)

      expect(response.status).toBe(422)
      await expect(response.json()).resolves.toEqual({ suggestions: [] })
      expect(getPartialPromptSuggestionsMock).not.toHaveBeenCalled()
    },
  )

  it('rejects a non-string partial instead of silently treating it as empty', async () => {
    const response = await postPromptSuggestions(
      JSON.stringify({ partial: { nested: 'prompt' } }),
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({ suggestions: [] })
    expect(getPartialPromptSuggestionsMock).not.toHaveBeenCalled()
  })

  it('rejects an oversized partial before invoking the suggestion engine', async () => {
    const response = await postPromptSuggestions(
      JSON.stringify({ partial: 'x'.repeat(481) }),
    )

    expect(response.status).toBe(413)
    await expect(response.json()).resolves.toEqual({ suggestions: [] })
    expect(getPartialPromptSuggestionsMock).not.toHaveBeenCalled()
  })

  it('returns a bounded failure when the suggestion engine stalls', async () => {
    vi.useFakeTimers()
    getPartialPromptSuggestionsMock.mockImplementation(neverResolve)
    let response: Response | undefined

    void postPromptSuggestions(
      JSON.stringify({ partial: 'a storefront for handmade ceramics' }),
    ).then(function captureResponse(result) {
      response = result
    })

    await vi.advanceTimersByTimeAsync(5_001)

    expect(response?.status).toBe(504)
  })

  it('forwards valid language context and returns generated suggestions', async () => {
    getPartialPromptSuggestionsMock.mockResolvedValue([
      'एक आधुनिक दुकान के लिए स्पष्ट होमपेज',
    ])

    const response = await postPromptSuggestions(
      JSON.stringify({ language: 'hi', partial: 'एक आधुनिक दुकान' }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      suggestions: ['एक आधुनिक दुकान के लिए स्पष्ट होमपेज'],
    })
    expect(getPartialPromptSuggestionsMock).toHaveBeenCalledWith(
      'एक आधुनिक दुकान',
      { language: 'hi' },
    )
  })
})
