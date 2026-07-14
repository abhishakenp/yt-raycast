import { describe, expect, it } from 'vitest'

import { createTranslateResponse } from './translate-response'

describe('translate response non-linguistic token release gate', () => {
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
