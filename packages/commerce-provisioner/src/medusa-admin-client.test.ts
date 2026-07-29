import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MedusaAdminApiError,
  ensureStoreSalesChannelAndPublishableKey,
} from './medusa-admin-client'

const config = {
  backendUrl: 'https://instance-1.commerce.ship-fast.ai',
  adminApiToken: 'admin-token',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ensureStoreSalesChannelAndPublishableKey', () => {
  it('creates a new sales channel and publishable key and links them when none exist', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ sales_channels: [] })) // list channels
      .mockResolvedValueOnce(
        jsonResponse({ sales_channel: { id: 'sc_1', name: 'Storefront A' } }),
      ) // create channel
      .mockResolvedValueOnce(jsonResponse({ api_keys: [] })) // list keys
      .mockResolvedValueOnce(
        jsonResponse({
          api_key: { id: 'apk_1', token: 'pk_generated_token' },
        }),
      ) // create key
      .mockResolvedValueOnce(jsonResponse({})) // link key to channel

    const result = await ensureStoreSalesChannelAndPublishableKey(
      config,
      'Storefront A',
    )

    expect(result).toEqual({
      salesChannelId: 'sc_1',
      publishableKeyId: 'apk_1',
      publishableKey: 'pk_generated_token',
    })
    expect(fetchSpy).toHaveBeenCalledTimes(5)
    expect(fetchSpy.mock.calls[1][0]).toBe(
      'https://instance-1.commerce.ship-fast.ai/admin/sales-channels',
    )
    expect(fetchSpy.mock.calls[4][0]).toBe(
      'https://instance-1.commerce.ship-fast.ai/admin/api-keys/apk_1/sales-channels',
    )
    for (const [, init] of fetchSpy.mock.calls) {
      const headers = (init as RequestInit).headers as Record<string, string>
      expect(headers.Authorization).toBe('Bearer admin-token')
    }
  })

  it('reuses an existing sales channel and publishable key instead of creating duplicates', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        jsonResponse({ sales_channels: [{ id: 'sc_existing' }] }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          api_keys: [{ id: 'apk_existing', token: 'pk_existing' }],
        }),
      )
      .mockResolvedValueOnce(jsonResponse({}))

    const result = await ensureStoreSalesChannelAndPublishableKey(
      config,
      'Storefront A',
    )

    expect(result).toEqual({
      salesChannelId: 'sc_existing',
      publishableKeyId: 'apk_existing',
      publishableKey: 'pk_existing',
    })
    // Only the two lookups plus the link call — no create calls for either.
    expect(fetchSpy).toHaveBeenCalledTimes(3)
  })

  it('throws a MedusaAdminApiError with the operation and status on a failed call', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('unauthorized', { status: 401 }),
    )

    await expect(
      ensureStoreSalesChannelAndPublishableKey(config, 'Storefront A'),
    ).rejects.toThrow(MedusaAdminApiError)
  })
})
