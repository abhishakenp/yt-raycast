import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/features/moderation/server/enforce-user-input-moderation', () => ({
  enforceUserInputModeration: vi.fn(async () => undefined),
  moderationErrorResponse: vi.fn(() => null),
}))

import { translateHits } from '@/lib/rate-limit'

import { createTranslateResponse } from './translate-response'

describe('translate response non-linguistic token release gate', () => {
  const originalClerk = process.env.VITE_DISABLE_CLERK

  beforeEach(() => {
    // The translate endpoint is now Pro/auth-gated; this suite exercises the
    // model-preservation logic (not auth), so bypass the entitlement gate.
    process.env.VITE_DISABLE_CLERK = 'true'
    translateHits.clear()
  })

  afterEach(() => {
    process.env.VITE_DISABLE_CLERK = originalClerk
  })

  it('never sends cart counts, prices, or URLs to the translation model', async () => {
    const texts = ['0', '2', '$18.00', 'https://example.com/menu?id=42']
    let modelCalls = 0
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ locale: 'hi', texts }),
      }),
      async () => {
        modelCalls += 1
        return JSON.stringify(texts)
      },
      null,
    )

    expect(response.status).toBe(200)
    expect(modelCalls).toBe(0)
    await expect(response.json()).resolves.toMatchObject({
      translations: texts,
      translated: false,
      cached: true,
    })
  })
})
