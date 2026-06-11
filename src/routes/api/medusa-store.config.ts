import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/medusa-store/config')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
        const publishableKey =
          process.env.MEDUSA_PUBLISHABLE_API_KEY ||
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
          ''

        return Response.json({
          enabled: Boolean(publishableKey.trim()),
          backendUrl: baseUrl,
        })
      },
    },
  },
})
