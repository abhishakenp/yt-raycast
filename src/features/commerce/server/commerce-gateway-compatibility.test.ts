import { afterEach, describe, expect, it, vi } from 'vitest'

import { getLegacyMedusaCartResponse } from './commerce-gateway-compatibility'

describe('legacy Medusa gateway compatibility', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('preserves a trusted private server backend in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('MEDUSA_BACKEND_URL', 'http://localhost:9000')
    vi.stubEnv('MEDUSA_PUBLISHABLE_API_KEY', 'pk_legacy')
    const providerFetch = vi.fn().mockResolvedValue(
      Response.json({
        cart: {
          id: 'cart_legacy',
        },
      }),
    )
    vi.stubGlobal('fetch', providerFetch)

    const response = await getLegacyMedusaCartResponse('cart_legacy')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      cart: { id: 'cart_legacy' },
    })
    expect(providerFetch).toHaveBeenCalledOnce()
  })
})
