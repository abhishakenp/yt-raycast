import { createFileRoute } from '@tanstack/react-router'

import {
  getMedusaBackendUrl,
  getMedusaPublishableKey,
} from '@/features/commerce/server/medusa-store-env'

export const Route = createFileRoute('/api/medusa-checkout')({
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

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json(
            { error: 'Invalid checkout request body' },
            { status: 400 },
          )
        }
        const baseUrl = getMedusaBackendUrl()

        try {
          const response = await fetch(`${baseUrl}/store/checkout`, {
            method: 'POST',
            headers: {
              'x-publishable-api-key': publishableKey.trim(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })

          if (!response.ok) {
            return Response.json(
              { error: 'checkout failed' },
              { status: response.status },
            )
          }

          const data = await response.json()
          return Response.json(data)
        } catch {
          return Response.json({ error: 'checkout failed' }, { status: 500 })
        }
      },
    },
  },
})
