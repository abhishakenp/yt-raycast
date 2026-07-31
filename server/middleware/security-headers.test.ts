import { describe, expect, it, vi } from 'vitest'

import securityHeaders from './security-headers'

type CapturedEvent = {
  headers: Record<string, string>
  path: string
}

vi.mock('h3', () => ({
  defineEventHandler: (handler: (event: CapturedEvent) => void) => handler,
  getRequestURL: (event: CapturedEvent) =>
    new URL(event.path, 'https://ship-fast.ai'),
  setResponseHeaders: (
    event: CapturedEvent,
    headers: Record<string, string>,
  ) => {
    Object.assign(event.headers, headers)
  },
}))

const runFor = (path: string): Record<string, string> => {
  const event: CapturedEvent = { headers: {}, path }
  ;(securityHeaders as unknown as (event: CapturedEvent) => void)(event)
  return event.headers
}

describe('app security headers middleware', () => {
  it('sets a restrictive baseline policy on app routes', () => {
    const headers = runFor('/dashboard')

    expect(headers['X-Content-Type-Options']).toBe('nosniff')
    expect(headers['X-Frame-Options']).toBe('SAMEORIGIN')
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin')
    expect(headers['Content-Security-Policy']).toContain("object-src 'none'")
    expect(headers['Content-Security-Policy']).toContain(
      "frame-ancestors 'self'",
    )
    expect(headers['Content-Security-Policy']).toContain("base-uri 'self'")
  })

  it('leaves routes that serve untrusted generated HTML to set their own headers', () => {
    expect(runFor('/api/sessions/abc123/preview-raw')).toEqual({})
    expect(runFor('/deployed/my-site/index.html')).toEqual({})
  })

  it('omits HSTS outside production so local http development still works', () => {
    const previous = process.env.NODE_ENV
    try {
      process.env.NODE_ENV = 'development'
      expect(runFor('/')['Strict-Transport-Security']).toBeUndefined()
      process.env.NODE_ENV = 'production'
      expect(runFor('/')['Strict-Transport-Security']).toContain(
        'max-age=31536000',
      )
    } finally {
      process.env.NODE_ENV = previous
    }
  })
})
