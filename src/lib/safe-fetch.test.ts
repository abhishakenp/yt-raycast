import { describe, expect, it, vi } from 'vitest'

import { readJsonOrThrow } from './safe-fetch'

interface MockResponseInit {
  contentType?: string
  text?: string | (() => Promise<string>)
  json?: unknown | (() => Promise<unknown>)
}

function mockResponse(init: MockResponseInit): Response {
  const headers = new Map<string, string>()
  if (init.contentType !== undefined) {
    headers.set('content-type', init.contentType)
  }
  const textImpl =
    typeof init.text === 'function' ? init.text : async () => init.text ?? ''
  const jsonImpl: () => Promise<unknown> =
    typeof init.json === 'function'
      ? (init.json as () => Promise<unknown>)
      : async () => init.json

  return {
    headers: {
      get: (name) => headers.get(name.toLowerCase()) ?? null,
    },
    text: vi.fn(textImpl) as unknown as Response['text'],
    json: vi.fn(jsonImpl) as unknown as Response['json'],
  } as Partial<Response> as Response
}

const FALLBACK = 'Unable to load resource'

describe('readJsonOrThrow', () => {
  it('throws the fallback message when content-type is text/html', async () => {
    const res = mockResponse({
      contentType: 'text/html; charset=utf-8',
      text: '<!doctype html><html></html>',
    })

    await expect(readJsonOrThrow(res, FALLBACK)).rejects.toThrow(FALLBACK)
    expect(res.text).not.toHaveBeenCalled()
  })

  it('throws the fallback message when the body starts with "<"', async () => {
    const res = mockResponse({
      contentType: 'application/json',
      text: '<!doctype html><html>gateway error</html>',
    })

    await expect(readJsonOrThrow(res, FALLBACK)).rejects.toThrow(FALLBACK)
  })

  it('throws the fallback when body starts with "<" after leading whitespace', async () => {
    const res = mockResponse({
      contentType: 'application/json',
      text: '   \n  <html>oops</html>',
    })

    await expect(readJsonOrThrow(res, FALLBACK)).rejects.toThrow(FALLBACK)
  })

  it('returns the parsed object for valid JSON', async () => {
    const payload = { ok: true, items: [1, 2, 3] }
    const res = mockResponse({
      contentType: 'application/json',
      text: JSON.stringify(payload),
    })

    await expect(readJsonOrThrow(res, FALLBACK)).resolves.toEqual(payload)
  })

  it('returns parsed JSON when content-type is absent but body is valid JSON', async () => {
    const res = mockResponse({ text: '{"a":1}' })

    await expect(readJsonOrThrow(res, FALLBACK)).resolves.toEqual({ a: 1 })
  })

  it('throws the fallback message for invalid JSON text', async () => {
    const res = mockResponse({
      contentType: 'application/json',
      text: 'not json at all',
    })

    await expect(readJsonOrThrow(res, FALLBACK)).rejects.toThrow(FALLBACK)
  })

  it('falls back to response.json() when text() throws but json() works', async () => {
    const payload = { recovered: true }
    const res = mockResponse({
      contentType: 'application/json',
      text: () => Promise.reject(new Error('text unavailable')),
      json: payload,
    })

    await expect(readJsonOrThrow(res, FALLBACK)).resolves.toEqual(payload)
    expect(res.text).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalled()
  })

  it('throws the fallback when both text() and json() throw', async () => {
    const res = mockResponse({
      contentType: 'application/json',
      text: () => Promise.reject(new Error('text unavailable')),
      json: () => Promise.reject(new Error('json unavailable')),
    })

    await expect(readJsonOrThrow(res, FALLBACK)).rejects.toThrow(FALLBACK)
  })

  it('throws the fallback when headers is undefined (no content-type) and body is HTML', async () => {
    const res = {
      headers: undefined,
      text: async () => '<html>no headers</html>',
      json: async () => ({}),
    } as Partial<Response> as Response

    await expect(readJsonOrThrow(res, FALLBACK)).rejects.toThrow(FALLBACK)
  })

  it('parses a JSON array', async () => {
    const res = mockResponse({
      contentType: 'application/json',
      text: '[{"before":"a","after":"b"}]',
    })

    await expect(readJsonOrThrow(res, FALLBACK)).resolves.toEqual([
      { before: 'a', after: 'b' },
    ])
  })
})
