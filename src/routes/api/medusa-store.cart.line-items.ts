import { createFileRoute } from '@tanstack/react-router'

import {
  getMedusaBackendUrl,
  getMedusaPublishableKey,
} from '@/features/commerce/server/medusa-store-env'

export const Route = createFileRoute('/api/medusa-store/cart/line-items')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const publishableKey = getMedusaPublishableKey()

        if (!publishableKey.trim()) {
          return Response.json(
            { error: 'Medusa Store API not configured' },
            { status: 503 },
          )
        }

        let body: Record<string, unknown>
        try {
          body = (await request.json()) as Record<string, unknown>
        } catch {
          return Response.json(
            { error: 'Invalid line item request body' },
            { status: 400 },
          )
        }
        const cartId = String(body?.cart_id || '').trim()
        const variantId = String(body?.variant_id || '').trim()
        const quantity = Math.max(
          1,
          Number.parseInt(String(body?.quantity || '1'), 10) || 1,
        )

        if (!cartId || !variantId) {
          return Response.json(
            { error: 'cart_id and variant_id required' },
            { status: 400 },
          )
        }

        const baseUrl = getMedusaBackendUrl()

        try {
          const response = await fetch(
            `${baseUrl}/store/carts/${cartId}/line-items`,
            {
              method: 'POST',
              headers: {
                'x-publishable-api-key': publishableKey.trim(),
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ variant_id: variantId, quantity }),
            },
          )

          if (!response.ok) {
            return Response.json(
              { error: 'line item failed' },
              { status: response.status },
            )
          }

          const data = await response.json()
          return Response.json({ cart: data.cart })
        } catch {
          return Response.json({ error: 'line item failed' }, { status: 500 })
        }
      },
    },
  },
})
