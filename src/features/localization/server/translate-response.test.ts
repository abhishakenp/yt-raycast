import { afterEach, beforeEach, describe, expect, it } from 'vitest'

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
  const originalClerk = process.env.VITE_DISABLE_CLERK

  beforeEach(() => {
    process.env.VITE_DISABLE_CLERK = 'true'
  })

  afterEach(() => {
    process.env.VITE_DISABLE_CLERK = originalClerk
  })
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

  it('stores browser-native translation entries without calling the model', async () => {
    const stored: Array<{
      locale: string
      entries: Array<{ text: string; translation: string }>
    }> = []
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          locale: 'lt',
          entries: [
            {
              text: DB_OBSERVED_TEXT.brand,
              translation: 'Amatinio alaus darykla',
            },
          ],
        }),
      }),
      async () => {
        throw new Error('model should not run')
      },
      {
        getBatch: async () => [],
        setBatch: async (input) => {
          stored.push(input)
        },
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      locale: 'lt',
      stored: 1,
      translated: true,
      cached: true,
    })
    expect(stored).toEqual([
      {
        locale: 'lt',
        entries: [
          {
            text: DB_OBSERVED_TEXT.brand,
            translation: 'Amatinio alaus darykla',
          },
        ],
      },
    ])
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

  it('does not model-translate native Hindi text that is already in a Hindi preview', async () => {
    const calls: Array<{ user: string }> = []
    const stored: Array<{
      locale: string
      entries: Array<{ text: string; translation: string }>
    }> = []

    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          texts: ['पॉलिश किया हुआ', 'Standard Glass'],
          locale: 'hi',
        }),
      }),
      async (_system, user) => {
        calls.push({ user })
        return JSON.stringify(['मानक कांच'])
      },
      {
        getBatch: async () => ['प्रिल्लिषक्य', null],
        setBatch: async (input) => {
          stored.push(input)
        },
      },
    )

    await expect(response.json()).resolves.toMatchObject({
      translations: ['पॉलिश किया हुआ', 'मानक कांच'],
      locale: 'hi',
      translated: true,
      cached: false,
    })
    expect(calls).toHaveLength(1)
    expect(calls[0].user).toContain(JSON.stringify(['Standard Glass']))
    expect(calls[0].user).not.toContain('पॉलिश किया हुआ')
    expect(stored).toEqual([
      {
        locale: 'hi',
        entries: [{ text: 'Standard Glass', translation: 'मानक कांच' }],
      },
    ])
  })

  it('refuses to persist native Hindi text as a Hindi translation cache entry', async () => {
    const stored: Array<{
      locale: string
      entries: Array<{ text: string; translation: string }>
    }> = []

    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          locale: 'hi',
          entries: [
            {
              text: 'मानक कांचमानक शीशा',
              translation: 'मोनक काँचमाक',
            },
            {
              text: 'Standard Glass',
              translation: 'मानक कांच',
            },
          ],
        }),
      }),
      async () => {
        throw new Error('model should not run')
      },
      {
        getBatch: async () => [],
        setBatch: async (input) => {
          stored.push(input)
        },
      },
    )

    await expect(response.json()).resolves.toMatchObject({
      locale: 'hi',
      stored: 1,
      translated: true,
      cached: true,
    })
    expect(stored).toEqual([
      {
        locale: 'hi',
        entries: [{ text: 'Standard Glass', translation: 'मानक कांच' }],
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

  it('splits a large cache-miss batch into smaller parallel model calls instead of one giant request (regression: a full-page-sized batch of ~100+ unique strings took ~12s in ONE model call, right at the request timeout, causing silent whole-page translation failures under normal latency variance)', async () => {
    const calls: Array<{ user: string }> = []
    const texts = Array.from(
      { length: 65 },
      (_, i) => `Unique landing copy line ${i}`,
    )
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({ texts, locale: 'hi' }),
      }),
      async (_system, user) => {
        calls.push({ user })
        // Echo back a "translated" marker per line in this call's batch so
        // we can verify correct reassembly order across chunks.
        const parsed = JSON.parse(user.slice(user.indexOf('['))) as string[]
        return JSON.stringify(parsed.map((t) => `HI:${t}`))
      },
      null,
    )

    const body = (await response.json()) as { translations: string[] }

    // Must be split into more than one call — a single 65-item call is
    // exactly the scenario that measured ~12s in production.
    expect(calls.length).toBeGreaterThan(1)
    // No single call should carry the whole batch.
    for (const call of calls) {
      const parsed = JSON.parse(
        call.user.slice(call.user.indexOf('[')),
      ) as string[]
      expect(parsed.length).toBeLessThan(texts.length)
    }
    // Reassembly must preserve original order across chunks.
    expect(body.translations).toEqual(texts.map((t) => `HI:${t}`))
  })

  it('returns a stable public error with source text when the model fails', async () => {
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          texts: [DB_OBSERVED_TEXT.brand, DB_OBSERVED_TEXT.menuItem],
          locale: 'fr',
        }),
      }),
      async () => {
        throw new Error(
          'translation model unavailable for k574ms14ma9f94keq30r7dq24x89n1k2 Pineapple Saison',
        )
      },
      null,
    )
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body).toEqual({
      error: 'Translation failed.',
      translations: [DB_OBSERVED_TEXT.brand, DB_OBSERVED_TEXT.menuItem],
      locale: 'fr',
      translated: false,
    })
    expect(JSON.stringify(body)).not.toContain(
      'k574ms14ma9f94keq30r7dq24x89n1k2',
    )
    expect(JSON.stringify(body)).not.toContain('model unavailable')
  })
})
