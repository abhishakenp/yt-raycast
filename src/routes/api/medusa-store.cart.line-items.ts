import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/medusa-store/cart/line-items')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const publishableKey =
          process.env.MEDUSA_PUBLISHABLE_API_KEY ||
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
          ''

        if (!publishableKey.trim()) {
          return Response.json({ error: 'Medusa Store API not configured' }, { status: 503 })
        }

        const body = await request.json()
        const cartId = String(body?.cart_id || '').trim()
        const variantId = String(body?.variant_id || '').trim()
        const quantity = Math.max(1, Number.parseInt(String(body?.quantity || '1'), 10) || 1)

        if (!cartId || !variantId) {
          return Response.json({ error: 'cart_id and variant_id required' }, { status: 400 })
        }

        const baseUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'

        try {
          const response = await fetch(`${baseUrl}/store/carts/${cartId}/line-items`, {
            method: 'POST',
            headers: {
              'x-publishable-api-key': publishableKey.trim(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ variant_id: variantId, quantity }),
          })

          if (!response.ok) {
            return Response.json({ error: 'line item failed' }, { status: response.status })
          }

          const data = await response.json()
          return Response.json({ cart: data.cart })
        } catch (e) {
          return Response.json({ error: e?.message || 'line item failed' }, { status: 500 })
        }
      },
    },
  },
})
