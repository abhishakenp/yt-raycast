import { describe, expect, it, vi } from 'vitest'

import { createSessionCreateResponse } from './session-create-response'

const endpoint = 'https://ship-fast.test/api/sessions/create'

const successfulMutation = () =>
  vi.fn().mockResolvedValue({
    cached: false,
    remaining: 1,
    sessionId: 'release-session',
  })

describe('public session creation release operations', () => {
  it('rejects cross-origin browser-simple bodies before mutation', async () => {
    const mutation = successfulMutation()
    const response = await createSessionCreateResponse(
      new Request(endpoint, {
        body: JSON.stringify({ prompt: 'Build a release demo site' }),
        headers: {
          'content-type': 'text/plain;charset=UTF-8',
          origin: 'https://hostile-origin.example',
        },
        method: 'POST',
      }),
      { mutation },
    )

    expect(response.status).toBe(415)
    await expect(response.json()).resolves.toEqual({
      error: 'Content-Type must be application/json.',
    })
    expect(mutation).not.toHaveBeenCalled()
  })

  it('rejects JSON bodies larger than one MiB before mutation', async () => {
    const mutation = successfulMutation()
    const response = await createSessionCreateResponse(
      new Request(endpoint, {
        body: JSON.stringify({ prompt: 'x'.repeat(1_048_576) }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
      { mutation },
    )

    expect(response.status).toBe(413)
    await expect(response.json()).resolves.toEqual({
      error: 'Request body is too large.',
    })
    expect(mutation).not.toHaveBeenCalled()
  })

  it('marks state-changing responses private and non-sniffable', async () => {
    const mutation = successfulMutation()
    const response = await createSessionCreateResponse(
      new Request(endpoint, {
        body: JSON.stringify({ prompt: 'Build a release demo site' }),
        headers: {
          'content-type': 'application/json; charset=utf-8',
          origin: 'https://hostile-origin.example',
        },
        method: 'POST',
      }),
      { mutation },
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(response.headers.get('access-control-allow-origin')).not.toBe('*')
    expect(response.headers.get('set-cookie')).toBeNull()
  })
})
