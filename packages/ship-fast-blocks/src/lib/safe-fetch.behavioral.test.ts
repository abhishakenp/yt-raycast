import { describe, expect, it, vi } from 'vitest'

import { readJsonOrThrow } from './safe-fetch.ts'

const FALLBACK_MESSAGE = 'Unable to load integration configuration'

class JsonOnlyResponse extends Response {
  constructor(private readonly payload: unknown) {
    super(null, { headers: { 'content-type': 'application/json' } })
  }

  override async text(): Promise<string> {
    throw new Error('Text stream unavailable')
  }

  override async json(): Promise<unknown> {
    return this.payload
  }
}

class BrokenResponse extends Response {
  constructor() {
    super(null, { headers: { 'content-type': 'application/json' } })
  }

  override async text(): Promise<string> {
    throw new Error('Text stream unavailable')
  }

  override async json(): Promise<unknown> {
    throw new Error('JSON stream unavailable')
  }
}

describe('Blocks readJsonOrThrow', () => {
  it('parses JSON objects and arrays from real Response bodies', async () => {
    await expect(
      readJsonOrThrow<{ enabled: boolean }>(
        new Response('{"enabled":true}', {
          headers: { 'content-type': 'application/json; charset=utf-8' },
        }),
        FALLBACK_MESSAGE,
      ),
    ).resolves.toEqual({ enabled: true })

    await expect(
      readJsonOrThrow(
        new Response('[{"id":"first"},{"id":"second"}]'),
        FALLBACK_MESSAGE,
      ),
    ).resolves.toEqual([{ id: 'first' }, { id: 'second' }])
  })

  it('rejects declared HTML without consuming the response body', async () => {
    const response = new Response('<html>gateway timeout</html>', {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
    const text = vi.spyOn(response, 'text')

    await expect(readJsonOrThrow(response, FALLBACK_MESSAGE)).rejects.toThrow(
      FALLBACK_MESSAGE,
    )
    expect(text).not.toHaveBeenCalled()
  })

  it('rejects HTML-shaped bodies even when the server claims JSON', async () => {
    const response = new Response('  \n\t<!doctype html><h1>Not found</h1>', {
      headers: { 'content-type': 'application/json' },
    })

    await expect(readJsonOrThrow(response, FALLBACK_MESSAGE)).rejects.toThrow(
      FALLBACK_MESSAGE,
    )
  })

  it('converts malformed and empty response bodies to the stable fallback error', async () => {
    for (const body of ['', 'not-json', '{"missing":']) {
      await expect(
        readJsonOrThrow(new Response(body), FALLBACK_MESSAGE),
      ).rejects.toThrow(FALLBACK_MESSAGE)
    }
  })

  it('uses response.json when the text stream cannot be read', async () => {
    await expect(
      readJsonOrThrow(
        new JsonOnlyResponse({ recovered: true }),
        FALLBACK_MESSAGE,
      ),
    ).resolves.toEqual({ recovered: true })
  })

  it('returns the stable fallback error when neither body reader works', async () => {
    await expect(
      readJsonOrThrow(new BrokenResponse(), FALLBACK_MESSAGE),
    ).rejects.toThrow(FALLBACK_MESSAGE)
  })
})
