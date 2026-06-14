import { createFileRoute } from '@tanstack/react-router'

import { getMedusaBackendUrl, getMedusaPublishableKey } from '@/features/commerce/server/medusa-store-env'

export const Route = createFileRoute('/api/medusa-store/cart/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const publishableKey = getMedusaPublishableKey()

        if (!publishableKey.trim()) {
          return Response.json({ error: 'Medusa Store API not configured' }, { status: 503 })
        }

        const baseUrl = getMedusaBackendUrl()

        try {
          const response = await fetch(`${baseUrl}/store/carts/${params.id}`, {
            headers: {
              'x-publishable-api-key': publishableKey.trim(),
            },
          })

          if (!response.ok) {
            return Response.json({ error: 'cart retrieve failed' }, { status: response.status })
          }

          const data = await response.json()
          return Response.json({ cart: data.cart })
        } catch (e) {
          return Response.json({ error: e?.message || 'cart retrieve failed' }, { status: 500 })
        }
      },
    },
  },
})
