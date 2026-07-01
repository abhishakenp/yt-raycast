import { describe, expect, it } from 'vitest'

import { createTranslateResponse } from './translate-response'

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

  it('builds a native-script translation prompt for Indian languages', async () => {
    const calls: Array<{ system: string; user: string }> = []
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({ texts: ['Apply now'], locale: 'hi' }),
      }),
      async (system, user) => {
        calls.push({ system, user })
        return '["अभी आवेदन करें"]'
      },
      null,
    )

    await expect(response.json()).resolves.toMatchObject({
      translations: ['अभी आवेदन करें'],
      locale: 'hi',
      translated: true,
    })
    expect(calls[0].system).toContain('Hindi')
    expect(calls[0].system).toContain('native script')
    expect(calls[0].user).toContain('Apply now')
  })

  it('translates all cache misses in one positional model call and stores them', async () => {
    const calls: Array<{ system: string; user: string }> = []
    const stored: Array<{
      locale: string
      entries: Array<{ text: string; translation: string }>
    }> = []
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          texts: ['Start now', 'Book a call'],
          locale: 'fr',
        }),
      }),
      async (system, user) => {
        calls.push({ system, user })
        return '["Commencer", "Reserver un appel"]'
      },
      {
        getBatch: async () => [null, null],
        setBatch: async (input) => {
          stored.push(input)
        },
      },
    )

    await expect(response.json()).resolves.toMatchObject({
      translations: ['Commencer', 'Reserver un appel'],
      locale: 'fr',
      translated: true,
      cached: false,
    })
    expect(calls).toHaveLength(1)
    expect(calls[0].user).toContain('["Start now","Book a call"]')
    expect(stored).toEqual([
      {
        locale: 'fr',
        entries: [
          { text: 'Start now', translation: 'Commencer' },
          { text: 'Book a call', translation: 'Reserver un appel' },
        ],
      },
    ])
  })

  it('returns cached translations without calling the model', async () => {
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          texts: ['Start now', 'Book a call'],
          locale: 'fr',
        }),
      }),
      async () => {
        throw new Error('model should not run')
      },
      {
        getBatch: async () => ['Commencer', 'Reserver un appel'],
        setBatch: async () => {
          throw new Error('cache write should not run')
        },
      },
    )

    await expect(response.json()).resolves.toMatchObject({
      translations: ['Commencer', 'Reserver un appel'],
      locale: 'fr',
      translated: true,
      cached: true,
    })
  })

  it('merges cache hits with one positional model call for misses only', async () => {
    const observedCachedText = 'Hand-selected blends for every palate'
    const observedCachedTranslation = 'Hand-selected blends for every palate'
    const calls: Array<{ system: string; user: string }> = []
    const stored: Array<{
      locale: string
      entries: Array<{ text: string; translation: string }>
    }> = []

    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          texts: [observedCachedText, 'The Beer Store', 'Portland taproom'],
          locale: 'fr',
        }),
      }),
      async (system, user) => {
        calls.push({ system, user })
        return JSON.stringify([
          'Hand-selected blends for every palate',
          'Hand-selected blends for every palate',
        ])
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
        'Hand-selected blends for every palate',
        'Hand-selected blends for every palate',
      ],
      locale: 'fr',
      translated: true,
      cached: false,
    })
    expect(calls).toHaveLength(1)
    expect(calls[0].user).toContain('["The Beer Store","Portland taproom"]')
    expect(calls[0].user).not.toContain(observedCachedText)
    expect(stored).toEqual([
      {
        locale: 'fr',
        entries: [
          {
            text: 'The Beer Store',
            translation: 'Hand-selected blends for every palate',
          },
          {
            text: 'Portland taproom',
            translation: 'Hand-selected blends for every palate',
          },
        ],
      },
    ])
  })

  it('translates custom language slugs instead of skipping them as unsupported', async () => {
    const calls: Array<{ system: string; user: string }> = []
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({ texts: ['Start now'], locale: 'dothraki' }),
      }),
      async (system, user) => {
        calls.push({ system, user })
        return '["Me nem nesa"]'
      },
      null,
    )

    await expect(response.json()).resolves.toMatchObject({
      translations: ['Me nem nesa'],
      locale: 'dothraki',
      translated: true,
    })
    expect(calls).toHaveLength(1)
    expect(calls[0].system).toContain('dothraki')
    expect(calls[0].system).toContain('native script')
  })

  it('builds a romanized/code-mixed prompt for Hinglish', async () => {
    const calls: Array<{ system: string; user: string }> = []
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({
          texts: ['Book a call today'],
          locale: 'hinglish',
        }),
      }),
      async (system, user) => {
        calls.push({ system, user })
        return '["Aaj hi call book karein"]'
      },
      null,
    )

    await expect(response.json()).resolves.toMatchObject({
      translations: ['Aaj hi call book karein'],
      locale: 'hinglish',
      translated: true,
    })
    expect(calls[0].system).toContain('code-mixed')
    expect(calls[0].system).toContain('Latin/English letters')
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
