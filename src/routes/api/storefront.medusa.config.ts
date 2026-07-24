import { createFileRoute } from '@tanstack/react-router'

import {
  getMedusaBackendUrl,
  getMedusaPublishableKey,
} from '@/features/commerce/server/medusa-store-env'

export const Route = createFileRoute('/api/storefront/medusa/config')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = getMedusaBackendUrl()
        const publishableKey = getMedusaPublishableKey()

        return Response.json({
          enabled: Boolean(publishableKey.trim()),
          backendUrl: baseUrl,
        })
      },
    },
  },
})
