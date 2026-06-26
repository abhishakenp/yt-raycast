import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { createTranslateResponse } from './translate-response'

describe('createTranslateResponse', () => {
  it('keeps the engine text-generation runtime behind the default model path', () => {
    const source = readFileSync(
      join(
        process.cwd(),
        'src/features/localization/server/translate-response.ts',
      ),
      'utf8',
    )
    const imports = source.slice(0, source.indexOf('type TranslateModel'))

    expect(imports).not.toContain('@ship-fast/engine')
    expect(source).toContain("import('@ship-fast/engine')")
    expect(source).toContain("import('@ship-fast/engine/model-list.js')")
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
        body: JSON.stringify({ locale: 'hi' }),
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
        body: JSON.stringify({ text: 'Start now', locale: 'en' }),
      }),
      async () => {
        throw new Error('model should not run')
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      translation: 'Start now',
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
        body: JSON.stringify({ text: 'Apply now', locale: 'hi' }),
      }),
      async (system, user) => {
        calls.push({ system, user })
        return '"अभी आवेदन करें"'
      },
    )

    await expect(response.json()).resolves.toMatchObject({
      translation: 'अभी आवेदन करें',
      locale: 'hi',
      translated: true,
    })
    expect(calls[0].system).toContain('Hindi')
    expect(calls[0].system).toContain('native script')
    expect(calls[0].user).toContain('Apply now')
  })

  it('builds a romanized/code-mixed prompt for Hinglish', async () => {
    const calls: Array<{ system: string; user: string }> = []
    const response = await createTranslateResponse(
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({ text: 'Book a call today', locale: 'hinglish' }),
      }),
      async (system, user) => {
        calls.push({ system, user })
        return 'Aaj hi call book karein'
      },
    )

    await expect(response.json()).resolves.toMatchObject({
      translation: 'Aaj hi call book karein',
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
        body: JSON.stringify({ text: 'Start now', locale: 'fr' }),
      }),
      async () => {
        throw new Error('model unavailable')
      },
    )

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toMatchObject({
      error: 'model unavailable',
      translation: 'Start now',
      locale: 'fr',
      translated: false,
    })
  })
})
