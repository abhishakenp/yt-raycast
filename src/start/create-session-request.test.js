import { describe, expect, it } from 'vitest'
import {
  createShipfastGeneration,
  normalizeGenerationRequest,
  resolveGeneratorOrigin,
} from './create-session-request.js'

describe('Start generation bridge', () => {
  it('normalizes prompt requests without blocking short but meaningful prompts', () => {
    expect(normalizeGenerationRequest({ prompt: 'SaaS' })).toEqual({
      prompt: 'SaaS',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      authToken: '',
    })
  })

  it('rejects blank prompts', () => {
    expect(() => normalizeGenerationRequest({ prompt: '   ' })).toThrow(
      'Add a website prompt before generating.',
    )
  })

  it('uses the configured generator origin without a trailing slash', () => {
    expect(resolveGeneratorOrigin({ SHIPFAST_GENERATOR_ORIGIN: 'http://localhost:7420/' })).toBe(
      'http://localhost:7420',
    )
  })

  it('posts to the Shipfast session API and returns the Start workspace session id', async () => {
    const calls = []
    const result = await createShipfastGeneration(
      { prompt: 'A boutique bakery homepage' },
      {
        env: { SHIPFAST_GENERATOR_ORIGIN: 'http://generator.local/' },
        fetchImpl: async (url, init) => {
          calls.push({ url, init })
          return new Response(JSON.stringify({ id: 'abc123', cached: false, remaining: 1 }), {
            status: 200,
          })
        },
      },
    )

    expect(result).toEqual({
      sessionId: 'abc123',
      cached: false,
      remaining: 1,
      anonOwnerSecret: null,
      owner: { type: 'anonymous' },
    })
    expect(calls[0].url).toBe('http://generator.local/api/sessions')
    expect(JSON.parse(calls[0].init.body)).toEqual({
      prompt: 'A boutique bakery homepage',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
    })
  })

  it('claims Start-created anonymous sessions for verified Clerk users', async () => {
    const claimed = []
    const result = await createShipfastGeneration(
      { prompt: 'A boutique bakery homepage', authToken: 'clerk-token' },
      {
        env: { SHIPFAST_GENERATOR_ORIGIN: 'http://generator.local/' },
        resolveAuthUser: async ({ authToken }) => ({ uid: `user_${authToken}` }),
        claimSession: (sessionId, userId) => claimed.push({ sessionId, userId }),
        fetchImpl: async () =>
          new Response(
            JSON.stringify({
              id: 'abc123',
              cached: false,
              remaining: 1,
              anonOwnerSecret: 'anon-secret',
            }),
            { status: 200 },
          ),
      },
    )

    expect(claimed).toEqual([{ sessionId: 'abc123', userId: 'user_clerk-token' }])
    expect(result).toMatchObject({
      sessionId: 'abc123',
      anonOwnerSecret: null,
      owner: { type: 'user', id: 'user_clerk-token' },
    })
  })
})
