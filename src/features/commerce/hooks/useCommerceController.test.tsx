// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { persistAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { useCommerceController } from './useCommerceController'

const commerceState = vi.hoisted(() => ({
  config: undefined as unknown,
}))

vi.mock('convex/react', () => ({
  useQuery: () => commerceState.config,
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
    commerceState.config = undefined
    window.localStorage.clear()
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    cleanup()
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
      await result.current.provisionCommerce()
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
          anonymousOwnerSecret: 'owner-secret-from-storage',
          products,
        }),
      },
    )
    await waitFor(() => {
      expect(result.current.commerceHandoff?.tenantId).toBe(sessionId)
    })
    expect(result.current.commerceError).toBeUndefined()
    expect(result.current.isSaving).toBe(false)
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
      await result.current.provisionCommerce()
    })

    expect(result.current.commerceError).toBe('Medusa Store API is unavailable')
    expect(result.current.commerceHandoff).toBeUndefined()
    expect(result.current.isSaving).toBe(false)
  })
})
