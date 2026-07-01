import { describe, expect, it, vi } from 'vitest'

import { readJsonOrThrow } from './safe-fetch'

describe('readJsonOrThrow', () => {
  it('returns parsed JSON from a normal API response', async () => {
    await expect(
      readJsonOrThrow<{ ok: boolean }>(
        new Response(JSON.stringify({ ok: true }), {
          headers: { 'content-type': 'application/json' },
        }),
        'Unable to load data.',
      ),
    ).resolves.toEqual({ ok: true })
  })

  it('throws the caller fallback message for HTML responses', async () => {
    await expect(
      readJsonOrThrow(
        new Response('<!doctype html><h1>gateway failure</h1>', {
          headers: { 'content-type': 'text/html; charset=utf-8' },
          status: 502,
        }),
        'Unable to load billing.',
      ),
    ).rejects.toThrow('Unable to load billing.')
  })

  it('does not leak JSON parser text when HTML is served with a JSON content type', async () => {
    await expect(
      readJsonOrThrow(
        new Response('   <html>captcha</html>', {
          headers: { 'content-type': 'application/json' },
          status: 200,
        }),
        'Unable to load referrals.',
      ),
    ).rejects.toThrow('Unable to load referrals.')
  })

  it('throws the fallback message for malformed non-HTML JSON', async () => {
    await expect(
      readJsonOrThrow(
        new Response('{"ok":', {
          headers: { 'content-type': 'application/json' },
          status: 200,
        }),
        'Unable to load gallery.',
      ),
    ).rejects.toThrow('Unable to load gallery.')
  })

  it('supports fetch mocks that implement json() but not text()', async () => {
    const response = {
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({ fromJsonFallback: true }),
      text: vi.fn().mockRejectedValue(new Error('no text reader')),
    } as unknown as Response

    await expect(
      readJsonOrThrow(response, 'Unable to load mocked data.'),
    ).resolves.toEqual({ fromJsonFallback: true })
  })

  it('throws the fallback message when both text() and json() fail', async () => {
    const response = {
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockRejectedValue(new SyntaxError('bad json')),
      text: vi.fn().mockRejectedValue(new Error('body unavailable')),
    } as unknown as Response

    await expect(
      readJsonOrThrow(response, 'Unable to load mocked data.'),
    ).rejects.toThrow('Unable to load mocked data.')
  })
})
