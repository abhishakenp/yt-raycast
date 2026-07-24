// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  persistAnonymousOwnerSecret,
  resetAnonymousOwnerSecretPersistenceForTest,
} from '@/features/session/services/anonymous-owner-secret'
import { useCommerceController } from './useCommerceController'

type CommerceState = {
  config: unknown
}

const commerceState = vi.hoisted<CommerceState>(() => ({
  config: undefined,
}))

const authState = vi.hoisted(() => ({
  getToken: vi.fn(),
  isLoaded: true,
  isSignedIn: false,
}))

vi.mock('convex/react', () => ({
  useQuery: () => commerceState.config,
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: () => authState,
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      getCommerceConfig: 'sessions.getCommerceConfig',
    },
  },
}))

const realMedusaWarningCommerceConfig = {
  _id: 'nx717gt8wg6w2zwxe4c8502jw989h471',
  backendUrl: 'http://localhost:9000',
  configJson:
    '{"provider":"medusa","tenantMode":"session","tenantId":"k577jbx9tbkcc3bhs1fvqepf9989fm0w","publishableKeyConfigured":true,"liveStoreApiReady":false,"productSync":{"requested":0,"synced":0},"warning":"Medusa Store API is unavailable: fetch failed"}',
  createdAt: 1782640662802,
  errorMessage: 'Medusa Store API is unavailable: fetch failed',
  productCount: 0,
  sessionId: 'k577jbx9tbkcc3bhs1fvqepf9989fm0w',
  status: 'ready',
  updatedAt: 1782640662802,
}

const originalFetch = globalThis.fetch

describe('useCommerceController', () => {
  beforeEach(() => {
    authState.getToken.mockReset()
    authState.isSignedIn = false
    commerceState.config = undefined
    resetAnonymousOwnerSecretPersistenceForTest()
    window.localStorage.clear()
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    cleanup()
    resetAnonymousOwnerSecretPersistenceForTest()
    window.localStorage.clear()
    globalThis.fetch = originalFetch
  })

  it('exposes the real Convex commerce config shape to the panel', () => {
    commerceState.config = realMedusaWarningCommerceConfig

    const { result } = renderHook(() =>
      useCommerceController('k577jbx9tbkcc3bhs1fvqepf9989fm0w'),
    )

    expect(result.current.config).toEqual(realMedusaWarningCommerceConfig)
    expect(result.current.commerceError).toBeUndefined()
    expect(result.current.isSaving).toBe(false)
  })

  it('posts owner secret and visual products to the Medusa provision endpoint', async () => {
    const sessionId = 'k577jbx9tbkcc3bhs1fvqepf9989fm0w'
    persistAnonymousOwnerSecret(
      window.localStorage,
      sessionId,
      'owner-secret-from-storage',
    )
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({
        handoff: {
          adminUrl: 'https://admin.medusa.test',
          backendUrl: 'https://backend.medusa.test',
          storefrontUrl: 'https://store.medusa.test',
          tenantId: sessionId,
        },
      }),
    )
    const products = [
      {
        description: 'Seasonal taproom release',
        handle: 'portland-pale-ale',
        price: 8,
        title: 'Portland Pale Ale',
      },
    ]
    const { result } = renderHook(() =>
      useCommerceController(sessionId, products),
    )

    await act(async () => {
      await result.current.provisionCommerce({
        email: 'owner@store.test',
        password: 'admin-password',
      })
    })

    expect(fetch).toHaveBeenCalledWith(
      `/api/sessions/${sessionId}/provision/medusa`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ship-fast-owner-secret': 'owner-secret-from-storage',
        },
        body: JSON.stringify({
          adminEmail: 'owner@store.test',
          adminPassword: 'admin-password',
          anonymousOwnerSecret: 'owner-secret-from-storage',
          products,
        }),
      },
    )
    expect(authState.getToken).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(result.current.commerceHandoff?.tenantId).toBe(sessionId)
    })
    expect(result.current.commerceError).toBeUndefined()
    expect(result.current.isSaving).toBe(false)
  })

  it('omits admin credentials when hosted Medusa credentials are configured server-side', async () => {
    const sessionId = 'k577jbx9tbkcc3bhs1fvqepf9989fm0w'
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({}))
    const { result } = renderHook(() => useCommerceController(sessionId))

    await act(async () => {
      await result.current.provisionCommerce()
    })

    expect(fetch).toHaveBeenCalledWith(
      `/api/sessions/${sessionId}/provision/medusa`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: [],
        }),
      },
    )
    expect(result.current.commerceError).toBeUndefined()
  })

  it('requests a Convex token and sends it when provisioning as a signed-in owner', async () => {
    const sessionId = 'k577jbx9tbkcc3bhs1fvqepf9989fm0w'
    authState.isSignedIn = true
    authState.getToken.mockResolvedValue('convex-token')
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({}))
    const { result } = renderHook(() => useCommerceController(sessionId))

    await act(async () => {
      await result.current.provisionCommerce({
        email: 'owner@store.test',
        password: 'admin-password',
      })
    })

    expect(authState.getToken).toHaveBeenCalledWith({ template: 'convex' })
    expect(fetch).toHaveBeenCalledWith(
      `/api/sessions/${sessionId}/provision/medusa`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer convex-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: 'owner@store.test',
          adminPassword: 'admin-password',
          products: [],
        }),
      },
    )
    expect(result.current.commerceError).toBeUndefined()
  })

  it('surfaces Medusa provision errors and clears the saving state', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json(
        { error: 'Medusa Store API is unavailable' },
        { status: 502 },
      ),
    )
    const { result } = renderHook(() =>
      useCommerceController('k577jbx9tbkcc3bhs1fvqepf9989fm0w'),
    )

    await act(async () => {
      await result.current.provisionCommerce({
        email: 'owner@store.test',
        password: 'admin-password',
      })
    })

    expect(result.current.commerceError).toBe('Medusa Store API is unavailable')
    expect(result.current.commerceHandoff).toBeUndefined()
    expect(result.current.isSaving).toBe(false)
  })

  it('surfaces a stable error when provisioning succeeds with malformed HTML instead of JSON', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('<!doctype html><title>Medusa unavailable</title>', {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }),
    )
    const { result } = renderHook(() =>
      useCommerceController('k577jbx9tbkcc3bhs1fvqepf9989fm0w'),
    )

    await act(async () => {
      await result.current.provisionCommerce({
        email: 'owner@store.test',
        password: 'admin-password',
      })
    })

    expect(result.current.commerceError).toBe('Commerce provisioning failed')
    expect(result.current.commerceHandoff).toBeUndefined()
    expect(result.current.isSaving).toBe(false)
  })
})
