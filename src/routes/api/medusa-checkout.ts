import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/medusa-checkout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const publishableKey =
          process.env.MEDUSA_PUBLISHABLE_API_KEY ||
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
          ''

        if (!publishableKey.trim()) {
          return Response.json(
            { error: 'Medusa Store API not configured' },
            { status: 503 },
          )
        }

        const body = await request.json()
        const baseUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'

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
            return Response.json({ error: 'checkout failed' }, { status: response.status })
          }

          const data = await response.json()
          return Response.json(data)
        } catch (e) {
          return Response.json({ error: e?.message || 'checkout failed' }, { status: 500 })
        }
      },
    },
  },
})
