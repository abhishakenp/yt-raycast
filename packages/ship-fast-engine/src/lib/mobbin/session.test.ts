import { describe, expect, it } from 'vitest'
import {
  importSessionFromBrowserCookie,
  SUPABASE_COOKIE_PREFIX,
} from './session.js'

describe('importSessionFromBrowserCookie', () => {
  it('parses chunked Supabase auth cookies', () => {
    const session = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 9999999999,
      user: { email: 'test@example.com' },
    }
    const encoded = `base64-${Buffer.from(JSON.stringify(session), 'utf8').toString('base64')}`
    const cookie = `${SUPABASE_COOKIE_PREFIX}.0=${encoded}`
    const auth = importSessionFromBrowserCookie(cookie)
    expect(auth?.access_token).toBe('test-access-token')
    expect(auth?.refresh_token).toBe('test-refresh-token')
    expect(auth?.user?.email).toBe('test@example.com')
  })
})
