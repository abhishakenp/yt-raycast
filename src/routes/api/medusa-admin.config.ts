import { createFileRoute } from '@tanstack/react-router'

import { getMedusaAdminUrl, getMedusaBackendUrl } from '@/features/commerce/server/medusa-store-env'

export const Route = createFileRoute('/api/medusa-admin/config')({
  server: {
    handlers: {
      GET: async () => {
        const adminUrl = getMedusaAdminUrl()
        const backendUrl = getMedusaBackendUrl()

        return Response.json({
          enabled: Boolean(adminUrl),
          adminUrl,
          backendUrl,
        })
      },
    },
  },
})
