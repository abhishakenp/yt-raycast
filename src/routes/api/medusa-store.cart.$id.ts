import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/medusa-store/cart/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const publishableKey =
          process.env.MEDUSA_PUBLISHABLE_API_KEY ||
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
          ''

        if (!publishableKey.trim()) {
          return Response.json({ error: 'Medusa Store API not configured' }, { status: 503 })
        }

        const baseUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'

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
