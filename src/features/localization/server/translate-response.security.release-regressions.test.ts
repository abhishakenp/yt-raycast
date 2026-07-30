import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/moderation/server/enforce-user-input-moderation', () => ({
  enforceUserInputModeration: vi.fn(async () => undefined),
  moderationErrorResponse: vi.fn(() => null),
}))

import { createTranslateResponse } from './translate-response'

describe('translate response cache-write authorization release gate', () => {
  it('rejects an unauthenticated browser-supplied translation cache write', async () => {
    const setBatch = vi.fn(async () => null)
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          locale: 'hi',
          entries: [{ text: 'Checkout', translation: 'attacker-controlled' }],
        }),
      }),
      async () => {
        throw new Error('model must not run for a cache-write request')
      },
      {
        getBatch: async () => [],
        setBatch,
      },
    )

    expect(response.status).toBe(401)
    expect(setBatch).not.toHaveBeenCalled()
  })
})
