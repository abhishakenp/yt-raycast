import { describe, expect, test } from 'bun:test'
import { withAuthTokenHeader } from './auth-fetch'

describe('withAuthTokenHeader', () => {
  test('adds a bearer token without dropping existing headers', async () => {
    const result = await withAuthTokenHeader(
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      async () => 'clerk-session-token',
    )

    const headers = result.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer clerk-session-token')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(result.method).toBe('POST')
  })

  test('preserves an explicit authorization header', async () => {
    const result = await withAuthTokenHeader(
      { headers: { Authorization: 'Bearer existing-token' } },
      async () => 'new-token',
    )

    expect((result.headers as Headers).get('Authorization')).toBe('Bearer existing-token')
  })

  test('keeps anonymous requests anonymous when no token is available', async () => {
    const result = await withAuthTokenHeader({ headers: { Accept: 'application/json' } }, async () => '')

    const headers = result.headers as Headers
    expect(headers.has('Authorization')).toBe(false)
    expect(headers.get('Accept')).toBe('application/json')
  })
})
