import { createFileRoute } from '@tanstack/react-router'

import {
  getMedusaBackendUrl,
  getMedusaPublishableKey,
} from '@/features/commerce/server/medusa-store-env'
import {
  createMedusaRequestInit,
  isValidMedusaResourceId,
} from '@/features/commerce/server/medusa-store-request'

export const Route = createFileRoute('/api/medusa-store/cart/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const publishableKey = getMedusaPublishableKey()

        if (!publishableKey.trim()) {
          return Response.json(
            { error: 'Medusa Store API not configured' },
            { status: 503 },
          )
        }

        const cartId = params.id.trim()
        if (!isValidMedusaResourceId(cartId)) {
          return Response.json({ error: 'Invalid cart id' }, { status: 400 })
        }

        const baseUrl = getMedusaBackendUrl()

        try {
          const response = await fetch(
            `${baseUrl}/store/carts/${encodeURIComponent(cartId)}`,
            createMedusaRequestInit({
              headers: {
                'x-publishable-api-key': publishableKey.trim(),
              },
            }),
          )

          if (!response.ok) {
            return Response.json(
              { error: 'cart retrieve failed' },
              { status: response.status },
            )
          }

          const data = await response.json()
          return Response.json({ cart: data.cart })
        } catch {
          return Response.json(
            { error: 'cart retrieve failed' },
            { status: 500 },
          )
        }
      },
    },
  },
})
