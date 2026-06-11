import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/medusa-admin/config')({
  server: {
    handlers: {
      GET: async () => {
        const adminUrl = process.env.MEDUSA_ADMIN_URL || 'http://localhost:7001'
        const backendUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'

        return Response.json({
          enabled: Boolean(adminUrl),
          adminUrl,
          backendUrl,
        })
      },
    },
  },
})
