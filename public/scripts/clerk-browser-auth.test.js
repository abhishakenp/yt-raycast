// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import {
  getClerkSessionToken,
  initClerkBrowserAuth,
} from './clerk-browser-auth.js'

describe('public Clerk browser auth helper', () => {
  it('does not initialize Clerk without a publishable key', async () => {
    await expect(initClerkBrowserAuth('')).resolves.toBeNull()
    expect(window.Clerk).toBeUndefined()
  })

  it('returns an empty token when no session exists or token retrieval fails', async () => {
    await expect(getClerkSessionToken(null)).resolves.toBe('')
    await expect(
      getClerkSessionToken({
        session: {
          getToken: vi.fn(async () => {
            throw new Error('token unavailable')
          }),
        },
      }),
    ).resolves.toBe('')
  })

  it('returns the current Clerk session token for exported page requests', async () => {
    const getToken = vi.fn(async () => 'session-token-123')

    await expect(
      getClerkSessionToken({
        session: { getToken },
      }),
    ).resolves.toBe('session-token-123')
    expect(getToken).toHaveBeenCalledTimes(1)
  })
})
