import { afterEach, describe, expect, it, vi } from 'vitest'

const generateTextMock = vi.hoisted(() => vi.fn())

vi.mock('@ship-fast/engine', () => ({
  generateText: generateTextMock,
}))

vi.mock('@ship-fast/engine/model-list.js', () => ({
  DEFAULT_MODEL: 'test-model',
}))

import { Route } from './rewrite'
import { callRouteHandler } from './-route-handler.test-helper'

function postRewrite(body: string, headers?: HeadersInit) {
  const request = new Request('https://ship-fast.ai/api/rewrite', {
    body,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    method: 'POST',
  })
  return callRouteHandler(Route, 'POST', { request })
}

function stallUntilAbort(
  _modelId: string,
  _system: string,
  _user: string,
  signal: AbortSignal,
): Promise<string> {
  return new Promise((_resolve, reject) => {
    signal.addEventListener(
      'abort',
      () => reject(new DOMException('aborted', 'AbortError')),
      { once: true },
    )
  })
}

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('/api/rewrite security and resilience', () => {
  it('rejects unauthenticated model requests before spending inference', async () => {
    generateTextMock.mockResolvedValue('Rewritten copy')

    const response = await postRewrite(
      JSON.stringify({ instruction: 'shorten', text: 'Original copy' }),
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: 'Authentication required',
    })
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('returns validation JSON for a valid JSON null body instead of throwing', async () => {
    const response = await postRewrite('null', {
      Authorization: 'Bearer user-token',
    })

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toEqual({
      error: 'Text and instruction are required',
    })
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('rejects oversized model payloads before loading the inference runtime', async () => {
    const response = await postRewrite(
      JSON.stringify({
        instruction: 'shorten',
        text: 'x'.repeat(1_000_000),
      }),
      { Authorization: 'Bearer user-token' },
    )

    expect(response.status).toBe(413)
    await expect(response.json()).resolves.toEqual({
      error: 'Rewrite request is too large',
    })
    expect(generateTextMock).not.toHaveBeenCalled()
  })

  it('treats blank model output as an upstream failure', async () => {
    generateTextMock.mockResolvedValue('   ')

    const response = await postRewrite(
      JSON.stringify({ instruction: 'shorten', text: 'Original copy' }),
      { Authorization: 'Bearer user-token' },
    )

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({ error: 'Rewrite failed.' })
  })

  it('aborts a stalled model request within thirty seconds', async () => {
    vi.useFakeTimers()
    generateTextMock.mockImplementation(stallUntilAbort)
    let response: Response | undefined

    void postRewrite(
      JSON.stringify({ instruction: 'shorten', text: 'Original copy' }),
      { Authorization: 'Bearer user-token' },
    ).then((result) => {
      response = result
    })

    await vi.advanceTimersByTimeAsync(30_001)

    expect(response?.status).toBe(502)
  })
})
