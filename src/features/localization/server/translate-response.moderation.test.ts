import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ContentModerationError } from '@/features/moderation/server/enforce-user-input-moderation'
import { translateHits } from '@/lib/rate-limit'

import { createTranslateResponse } from './translate-response'

const createRequest = (
  body: Record<string, unknown>,
  bearerToken = 'user-token',
) =>
  new Request('https://ship-fast.test/api/translate', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${bearerToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

const createCacheClient = () => ({
  claimBatch: vi.fn(async () => [{ state: 'claimed' as const }]),
  completeBatch: vi.fn(async () => ['Traduction']),
  getBatch: vi.fn(async () => [null]),
  releaseBatch: vi.fn(async () => null),
  setBatch: vi.fn(async () => null),
})

describe('createTranslateResponse moderation boundary', () => {
  const originalClerk = process.env.VITE_DISABLE_CLERK

  beforeEach(() => {
    process.env.VITE_DISABLE_CLERK = 'true'
    translateHits.clear()
  })

  afterEach(() => {
    process.env.VITE_DISABLE_CLERK = originalClerk
  })

  it.each(['deterministic', 'semantic'])(
    'blocks %s decisions before translation cache or model work',
    async () => {
      const model = vi.fn(async () => JSON.stringify(['Traduction']))
      const cache = createCacheClient()
      const enforceModeration = vi.fn(async () => {
        throw new ContentModerationError(
          'CONTENT_POLICY',
          '🚫 Not shipping that. Ship Fast blocks harmful, hateful, explicit, or exploitative content. This request was flagged—try a safe idea instead.',
          422,
        )
      })

      const response = await createTranslateResponse(
        createRequest({
          anonymousOwnerSecret: 'anonymous-owner',
          locale: 'fr',
          sessionId: 'session-1',
          texts: ['Harmful source text'],
        }),
        model,
        cache,
        async () => ({ allowed: true, code: 'ok' }),
        enforceModeration,
      )

      expect(response.status).toBe(422)
      await expect(response.json()).resolves.toEqual({
        code: 'CONTENT_POLICY',
        error:
          '🚫 Not shipping that. Ship Fast blocks harmful, hateful, explicit, or exploitative content. This request was flagged—try a safe idea instead.',
      })
      expect(model).not.toHaveBeenCalled()
      expect(cache.claimBatch).not.toHaveBeenCalled()
      expect(cache.completeBatch).not.toHaveBeenCalled()
      expect(cache.getBatch).not.toHaveBeenCalled()
      expect(cache.setBatch).not.toHaveBeenCalled()
      expect(cache.releaseBatch).not.toHaveBeenCalled()
    },
  )

  it('returns moderation unavailable before translation cache or model work', async () => {
    const model = vi.fn(async () => JSON.stringify(['Traduction']))
    const cache = createCacheClient()
    const enforceModeration = vi.fn(async () => {
      throw new ContentModerationError(
        'CONTENT_MODERATION_UNAVAILABLE',
        'Ship Fast’s safety check is temporarily unavailable. Try again shortly.',
        503,
      )
    })

    const response = await createTranslateResponse(
      createRequest({
        locale: 'fr',
        sessionId: 'session-1',
        texts: ['Safe source text'],
      }),
      model,
      cache,
      async () => ({ allowed: true, code: 'ok' }),
      enforceModeration,
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      code: 'CONTENT_MODERATION_UNAVAILABLE',
      error:
        'Ship Fast’s safety check is temporarily unavailable. Try again shortly.',
    })
    expect(model).not.toHaveBeenCalled()
    expect(cache.claimBatch).not.toHaveBeenCalled()
    expect(cache.getBatch).not.toHaveBeenCalled()
  })

  it('moderates the full normalized text array once before safe translation', async () => {
    const model = vi.fn(async () => JSON.stringify(['Bonjour', 'Monde']))
    const enforceModeration = vi.fn(async () => undefined)

    const response = await createTranslateResponse(
      createRequest({
        anonymousOwnerSecret: 'anonymous-owner',
        locale: 'fr',
        sessionId: 'session-1',
        texts: ['  Hello  ', 'World'],
      }),
      model,
      null,
      async () => ({ allowed: true, code: 'ok' }),
      enforceModeration,
    )

    expect(response.status).toBe(200)
    expect(enforceModeration).toHaveBeenCalledTimes(1)
    expect(enforceModeration).toHaveBeenCalledWith({
      anonymousClientId: 'anonymous-owner',
      bearerToken: 'user-token',
      fields: { translationSource: JSON.stringify(['Hello', 'World']) },
      sessionId: 'session-1',
      surface: 'translation_source',
    })
    expect(model).toHaveBeenCalledTimes(1)
  })

  it('moderates the maximum accepted text batch exactly once before translating', async () => {
    const texts = Array.from({ length: 120 }, (_, index) => {
      const prefix = `Source ${index}: `
      return `${prefix}${'x'.repeat(1200 - prefix.length)}`
    })
    const model = vi.fn(async () =>
      JSON.stringify(Array.from({ length: 30 }, () => 'Traduction')),
    )
    const enforceModeration = vi.fn(async () => undefined)

    expect(texts).toHaveLength(120)
    expect(texts.every((text) => text.length === 1200)).toBe(true)

    const response = await createTranslateResponse(
      createRequest({
        anonymousOwnerSecret: 'anonymous-owner',
        locale: 'fr',
        sessionId: 'session-1',
        texts,
      }),
      model,
      null,
      async () => ({ allowed: true, code: 'ok' }),
      enforceModeration,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      locale: 'fr',
      translated: true,
      translations: Array.from({ length: 120 }, () => 'Traduction'),
    })
    expect(enforceModeration).toHaveBeenCalledTimes(1)
    expect(enforceModeration).toHaveBeenCalledWith({
      anonymousClientId: 'anonymous-owner',
      bearerToken: 'user-token',
      fields: { translationSource: JSON.stringify(texts) },
      sessionId: 'session-1',
      surface: 'translation_source',
    })
    expect(model).toHaveBeenCalledTimes(4)
  })

  it('does not moderate browser cache-write entries', async () => {
    const cache = createCacheClient()
    const enforceModeration = vi.fn(async () => {
      throw new Error('cache-write entries must not be moderated')
    })

    const response = await createTranslateResponse(
      createRequest({
        entries: [{ text: 'Hello', translation: 'Bonjour' }],
        locale: 'fr',
        sessionId: 'session-1',
      }),
      async () => {
        throw new Error('model must not run')
      },
      cache,
      async () => ({ allowed: true, code: 'ok' }),
      enforceModeration,
    )

    expect(response.status).toBe(200)
    expect(enforceModeration).not.toHaveBeenCalled()
    expect(cache.setBatch).toHaveBeenCalledTimes(1)
  })

  it('does not moderate English skips', async () => {
    const enforceModeration = vi.fn(async () => {
      throw new Error('English skips must not be moderated')
    })

    const response = await createTranslateResponse(
      createRequest({ locale: 'en', texts: ['Hello'] }),
      async () => {
        throw new Error('model must not run')
      },
      null,
      async () => ({ allowed: true, code: 'ok' }),
      enforceModeration,
    )

    expect(response.status).toBe(200)
    expect(enforceModeration).not.toHaveBeenCalled()
  })

  it('does not moderate requests denied by entitlement', async () => {
    delete process.env.VITE_DISABLE_CLERK
    const enforceModeration = vi.fn(async () => {
      throw new Error('denied requests must stop before moderation')
    })

    const response = await createTranslateResponse(
      createRequest({
        locale: 'fr',
        sessionId: 'session-1',
        texts: ['Hello'],
      }),
      async () => {
        throw new Error('model must not run')
      },
      null,
      async () => ({
        allowed: false,
        code: 'payment_required',
        message: 'Subscribe to Pro.',
      }),
      enforceModeration,
    )

    expect(response.status).toBe(402)
    expect(enforceModeration).not.toHaveBeenCalled()
  })
})
