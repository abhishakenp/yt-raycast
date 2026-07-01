import { describe, expect, it } from 'vitest'

import { createTranslateResponse } from './translate-response'

// Observed via:
// npx convex run sessions:listPublicSessions '{"limit":5,"page":1}'
// npx convex run customLanguages:list '{}'
const DB_OBSERVED_TEXT = {
  brand: 'Craft Beer Brewery',
  customCode: 'dothraki',
  menuItem: 'Pineapple Saison',
  taproom: 'Portland taproom',
}

describe('createTranslateResponse', () => {
  it('rejects invalid JSON', async () => {
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: '{bad-json',
      }),
      async () => 'unused',
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Invalid JSON',
    })
  })

  it('requires text', async () => {
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({ texts: [], locale: 'hi' }),
      }),
      async () => 'unused',
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Text is required.',
    })
  })

  it('skips English without calling the model', async () => {
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({ texts: ['Start now'], locale: 'en' }),
      }),
      async () => {
        throw new Error('model should not run')
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      translations: ['Start now'],
      locale: 'en',
      translated: false,
      skipped: 'english',
    })
  })

  it('translates a browser-compatible locale through one positional model response when cache misses', async () => {
    const calls: Array<{ user: string }> = []
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({ texts: [DB_OBSERVED_TEXT.brand], locale: 'lt' }),
      }),
      async (_system, user) => {
        calls.push({ user })
        return JSON.stringify([DB_OBSERVED_TEXT.taproom])
      },
      null,
    )

    await expect(response.json()).resolves.toMatchObject({
      translations: [DB_OBSERVED_TEXT.taproom],
      locale: 'lt',
      translated: true,
      cached: false,
    })
    expect(calls).toHaveLength(1)
    expect(calls[0].user).toContain(JSON.stringify([DB_OBSERVED_TEXT.brand]))
  })

  it('translates all cache misses in one positional model call and stores them', async () => {
    const calls: Array<{ user: string }> = []
    const stored: Array<{
      locale: string
      entries: Array<{ text: string; translation: string }>
    }> = []
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          texts: [DB_OBSERVED_TEXT.brand, DB_OBSERVED_TEXT.menuItem],
          locale: 'fr',
        }),
      }),
      async (_system, user) => {
        calls.push({ user })
        return JSON.stringify([
          DB_OBSERVED_TEXT.taproom,
          DB_OBSERVED_TEXT.brand,
        ])
      },
      {
        getBatch: async () => [null, null],
        setBatch: async (input) => {
          stored.push(input)
        },
      },
    )

    await expect(response.json()).resolves.toMatchObject({
      translations: [DB_OBSERVED_TEXT.taproom, DB_OBSERVED_TEXT.brand],
      locale: 'fr',
      translated: true,
      cached: false,
    })
    expect(calls).toHaveLength(1)
    expect(calls[0].user).toContain(
      JSON.stringify([DB_OBSERVED_TEXT.brand, DB_OBSERVED_TEXT.menuItem]),
    )
    expect(stored).toEqual([
      {
        locale: 'fr',
        entries: [
          {
            text: DB_OBSERVED_TEXT.brand,
            translation: DB_OBSERVED_TEXT.taproom,
          },
          {
            text: DB_OBSERVED_TEXT.menuItem,
            translation: DB_OBSERVED_TEXT.brand,
          },
        ],
      },
    ])
  })

  it('returns cached translations without calling the model', async () => {
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          texts: [DB_OBSERVED_TEXT.brand, DB_OBSERVED_TEXT.menuItem],
          locale: 'fr',
        }),
      }),
      async () => {
        throw new Error('model should not run')
      },
      {
        getBatch: async () => [
          DB_OBSERVED_TEXT.taproom,
          DB_OBSERVED_TEXT.brand,
        ],
        setBatch: async () => {
          throw new Error('cache write should not run')
        },
      },
    )

    await expect(response.json()).resolves.toMatchObject({
      translations: [DB_OBSERVED_TEXT.taproom, DB_OBSERVED_TEXT.brand],
      locale: 'fr',
      translated: true,
      cached: true,
    })
  })

  it('merges cache hits with one positional model call for misses only', async () => {
    const observedCachedText = DB_OBSERVED_TEXT.brand
    const observedCachedTranslation = DB_OBSERVED_TEXT.taproom
    const calls: Array<{ user: string }> = []
    const stored: Array<{
      locale: string
      entries: Array<{ text: string; translation: string }>
    }> = []

    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          texts: [
            observedCachedText,
            DB_OBSERVED_TEXT.menuItem,
            DB_OBSERVED_TEXT.taproom,
          ],
          locale: 'fr',
        }),
      }),
      async (_system, user) => {
        calls.push({ user })
        return JSON.stringify([DB_OBSERVED_TEXT.brand, DB_OBSERVED_TEXT.brand])
      },
      {
        getBatch: async () => [observedCachedTranslation, null, null],
        setBatch: async (input) => {
          stored.push(input)
        },
      },
    )

    await expect(response.json()).resolves.toMatchObject({
      translations: [
        observedCachedTranslation,
        DB_OBSERVED_TEXT.brand,
        DB_OBSERVED_TEXT.brand,
      ],
      locale: 'fr',
      translated: true,
      cached: false,
    })
    expect(calls).toHaveLength(1)
    expect(calls[0].user).toContain(
      JSON.stringify([DB_OBSERVED_TEXT.menuItem, DB_OBSERVED_TEXT.taproom]),
    )
    expect(calls[0].user).not.toContain(observedCachedText)
    expect(stored).toEqual([
      {
        locale: 'fr',
        entries: [
          {
            text: DB_OBSERVED_TEXT.menuItem,
            translation: DB_OBSERVED_TEXT.brand,
          },
          {
            text: DB_OBSERVED_TEXT.taproom,
            translation: DB_OBSERVED_TEXT.brand,
          },
        ],
      },
    ])
  })

  it('translates custom language slugs instead of skipping them as unsupported', async () => {
    const calls: Array<{ user: string }> = []
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          texts: [DB_OBSERVED_TEXT.brand],
          locale: DB_OBSERVED_TEXT.customCode,
        }),
      }),
      async (_system, user) => {
        calls.push({ user })
        return JSON.stringify([DB_OBSERVED_TEXT.menuItem])
      },
      null,
    )

    await expect(response.json()).resolves.toMatchObject({
      translations: [DB_OBSERVED_TEXT.menuItem],
      locale: DB_OBSERVED_TEXT.customCode,
      translated: true,
    })
    expect(calls).toHaveLength(1)
    expect(calls[0].user).toContain(JSON.stringify([DB_OBSERVED_TEXT.brand]))
  })

  it('translates Hinglish with the same positional batch contract', async () => {
    const calls: Array<{ user: string }> = []
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          texts: [DB_OBSERVED_TEXT.taproom],
          locale: 'hinglish',
        }),
      }),
      async (_system, user) => {
        calls.push({ user })
        return JSON.stringify([DB_OBSERVED_TEXT.brand])
      },
      null,
    )

    await expect(response.json()).resolves.toMatchObject({
      translations: [DB_OBSERVED_TEXT.brand],
      locale: 'hinglish',
      translated: true,
    })
    expect(calls).toHaveLength(1)
    expect(calls[0].user).toContain(JSON.stringify([DB_OBSERVED_TEXT.taproom]))
  })

  it('returns the source text with a 502 when the model fails', async () => {
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({ texts: ['Start now'], locale: 'fr' }),
      }),
      async () => {
        throw new Error('model unavailable')
      },
      null,
    )

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toMatchObject({
      error: 'model unavailable',
      translations: ['Start now'],
      locale: 'fr',
      translated: false,
    })
  })
})
