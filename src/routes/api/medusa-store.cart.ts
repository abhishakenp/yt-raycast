import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/medusa-store/cart')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const publishableKey =
          process.env.MEDUSA_PUBLISHABLE_API_KEY ||
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
          ''

        if (!publishableKey.trim()) {
          return Response.json(
            { error: 'Medusa Store API not configured (set MEDUSA_PUBLISHABLE_API_KEY or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)' },
            { status: 503 },
          )
        }

        const baseUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'

        try {
          const regionsResponse = await fetch(`${baseUrl}/store/regions`, {
            headers: {
              'x-publishable-api-key': publishableKey.trim(),
            },
          })

          if (!regionsResponse.ok) {
            return Response.json({ error: 'regions fetch failed' }, { status: regionsResponse.status })
          }

          const regionsData = await regionsResponse.json()
          const regionId = regionsData.regions?.[0]?.id

          if (!regionId) {
            return Response.json({ error: 'No sales region in Medusa' }, { status: 500 })
          }

          const cartResponse = await fetch(`${baseUrl}/store/carts`, {
            method: 'POST',
            headers: {
              'x-publishable-api-key': publishableKey.trim(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ region_id: regionId }),
          })

          if (!cartResponse.ok) {
            return Response.json({ error: 'cart create failed' }, { status: cartResponse.status })
          }

          const cartData = await cartResponse.json()
          return Response.json({ cart: cartData.cart })
        } catch (e) {
          return Response.json({ error: e?.message || 'cart create failed' }, { status: 500 })
        }
      },
    },
  },
})
