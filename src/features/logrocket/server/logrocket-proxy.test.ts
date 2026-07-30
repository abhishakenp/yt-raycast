import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  parseLogRocketProxyPath,
  buildUpstreamUrl,
  proxyLogRocketRequest,
} from './logrocket-proxy'

describe('parseLogRocketProxyPath', () => {
  it('parses a CDN path with query string', () => {
    const result = parseLogRocketProxyPath(
      'http://localhost:3000/api/logrocket/cdn/LogRocket.min.js?v=1',
    )
    expect(result).toEqual({
      target: 'cdn',
      upstreamPath: '/LogRocket.min.js?v=1',
    })
  })

  it('parses an ingest path', () => {
    const result = parseLogRocketProxyPath(
      'http://ship-fast.ai/api/logrocket/ingest/i/sessions',
    )
    expect(result).toEqual({
      target: 'ingest',
      upstreamPath: '/i/sessions',
    })
  })

  it('parses a path with nested segments', () => {
    const result = parseLogRocketProxyPath(
      'http://localhost/api/logrocket/cdn/logger.min.js',
    )
    expect(result).toEqual({
      target: 'cdn',
      upstreamPath: '/logger.min.js',
    })
  })

  it('returns null for invalid target segment', () => {
    expect(
      parseLogRocketProxyPath('http://localhost/api/logrocket/evil/script.js'),
    ).toBeNull()
  })

  it('returns null when path does not contain the prefix', () => {
    expect(parseLogRocketProxyPath('http://localhost/api/health')).toBeNull()
  })

  it('returns null when no path after target', () => {
    expect(
      parseLogRocketProxyPath('http://localhost/api/logrocket/cdn'),
    ).toBeNull()
  })
})

describe('buildUpstreamUrl', () => {
  it('builds CDN upstream URL', () => {
    expect(buildUpstreamUrl('cdn', '/LogRocket.min.js')).toBe(
      'https://cdn.logrocket.com/LogRocket.min.js',
    )
  })

  it('builds ingest upstream URL', () => {
    expect(buildUpstreamUrl('ingest', '/i/sessions')).toBe(
      'https://r.lr-ingest.com/i/sessions',
    )
  })

  it('preserves query strings', () => {
    expect(buildUpstreamUrl('cdn', '/script.js?v=2')).toBe(
      'https://cdn.logrocket.com/script.js?v=2',
    )
  })
})

describe('proxyLogRocketRequest', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('returns 404 for non-proxy paths', async () => {
    const request = new Request('http://localhost/api/health')
    const response = await proxyLogRocketRequest(request)
    expect(response.status).toBe(404)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('proxies a GET request to the CDN upstream', async () => {
    const mockBody = 'console.log("LogRocket")'
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(mockBody, {
        status: 200,
        headers: { 'content-type': 'application/javascript' },
      }),
    )

    const request = new Request(
      'http://localhost/api/logrocket/cdn/LogRocket.min.js',
      { method: 'GET' },
    )
    const response = await proxyLogRocketRequest(request)

    expect(response.status).toBe(200)
    expect(await response.text()).toBe(mockBody)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://cdn.logrocket.com/LogRocket.min.js',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('proxies a POST request to the ingest upstream with body', async () => {
    const payload = '{"event":"session_start"}'
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('{"ok":true}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const request = new Request(
      'http://localhost/api/logrocket/ingest/i/sessions',
      {
        method: 'POST',
        body: payload,
        headers: { 'content-type': 'application/json' },
      },
    )
    const response = await proxyLogRocketRequest(request)

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://r.lr-ingest.com/i/sessions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
      }),
    )
    const init = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1]
    expect(init.body).toBeInstanceOf(ArrayBuffer)
  })

  it('strips hop-by-hop headers from the upstream request', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('', { status: 200 }),
    )

    const request = new Request('http://localhost/api/logrocket/cdn/test.js', {
      method: 'GET',
      headers: {
        host: 'localhost',
        connection: 'keep-alive',
        'x-custom': 'keep-me',
      },
    })
    await proxyLogRocketRequest(request)

    const init = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1]
    const headers = init.headers as Headers
    expect(headers.has('host')).toBe(false)
    expect(headers.has('connection')).toBe(false)
    expect(headers.get('x-custom')).toBe('keep-me')
  })

  it('passes through upstream status codes', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('Not Found', { status: 404 }),
    )

    const request = new Request('http://localhost/api/logrocket/cdn/missing.js')
    const response = await proxyLogRocketRequest(request)
    expect(response.status).toBe(404)
  })
})
