// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BillingPanel } from './BillingPanel'

/**
 * Hoisted auth mock so the `vi.mock` factory (which vitest hoists above the
 * imports) can reference the same `getToken` spy the tests assert against.
 */
const auth = vi.hoisted(() => ({
  getToken:
    vi.fn<(options?: { template?: string }) => Promise<string | null>>(),
  isSignedIn: true,
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: () => ({
    getToken: auth.getToken,
    isSignedIn: auth.isSignedIn,
    isLoaded: true,
  }),
}))

const fetchMock = vi.fn<typeof globalThis.fetch>()

const json = (body: unknown, ok = true) =>
  ({ ok, json: async () => body, status: ok ? 200 : 400 }) as Response

describe('BillingPanel — Convex JWT usage', () => {
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    auth.getToken.mockReset()
    auth.getToken.mockResolvedValue('convex-jwt-token')
    auth.isSignedIn = true

    originalFetch = globalThis.fetch
    fetchMock.mockReset()
    fetchMock.mockImplementation((input) => {
      const url = String(input)
      if (url.includes('/api/billing-overview')) {
        return Promise.resolve(
          json({
            credits: { remaining: 5 },
            exportAccess: { unlocked: false },
          }),
        )
      }
      // checkout/start — return a subscription id so the component sets
      // checkoutState instead of navigating via window.location.href.
      return Promise.resolve(json({ subscriptionId: 'sub_123' }))
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    cleanup()
    vi.stubGlobal('fetch', originalFetch)
  })

  it('requests a Convex-template JWT for the billing-overview query on mount', async () => {
    render(createElement(BillingPanel, { sessionId: 'session_123' }))

    await waitFor(() => {
      expect(auth.getToken).toHaveBeenCalledWith({ template: 'convex' })
    })

    // The overview fetch must carry the Convex JWT as a bearer token.
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/billing-overview',
        expect.objectContaining({
          headers: { Authorization: 'Bearer convex-jwt-token' },
        }),
      )
    })
  })

  it('requests a Convex-template JWT for the checkout mutation path', async () => {
    render(createElement(BillingPanel, { sessionId: 'session_123' }))

    // Wait for the mount-time overview call to settle.
    await waitFor(() => {
      expect(auth.getToken).toHaveBeenCalledTimes(1)
    })

    const upgradeButton = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Upgrade to Pro'),
    )!
    fireEvent.click(upgradeButton)

    await waitFor(() => {
      expect(auth.getToken).toHaveBeenCalledTimes(2)
    })

    // Both calls — query (overview) and mutation (checkout) — must use the
    // Convex JWT template. No bare getToken() call (no template) is allowed.
    expect(auth.getToken.mock.calls).toHaveLength(2)
    for (const call of auth.getToken.mock.calls) {
      expect(call[0]).toEqual({ template: 'convex' })
    }

    // The checkout POST must carry the Convex JWT as a bearer token.
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/checkout/start',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer convex-jwt-token',
          }),
        }),
      )
    })
  })

  it('never calls getToken without a template', async () => {
    render(createElement(BillingPanel, { sessionId: 'session_123' }))

    // Let the mount-time overview call finish so the Upgrade button is no
    // longer disabled (it's disabled while isLoading is true).
    await waitFor(() => {
      expect(auth.getToken).toHaveBeenCalledTimes(1)
    })

    const upgradeButton = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Upgrade to Pro'),
    )!
    fireEvent.click(upgradeButton)

    await waitFor(() => {
      expect(auth.getToken).toHaveBeenCalledTimes(2)
    })

    for (const call of auth.getToken.mock.calls) {
      expect(call[0]).toBeDefined()
      expect(call[0]?.template).toBe('convex')
    }
  })
})
