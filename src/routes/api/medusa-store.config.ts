import { createFileRoute } from '@tanstack/react-router'

import {
  getConfiguredMedusaBackendUrl,
  getMedusaPublishableKey,
} from '@/features/commerce/server/medusa-store-env'

const localBackendHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0'])

const isProductionLocalBackendUrl = (backendUrl: string): boolean => {
  if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
    return false
  }

  try {
    return localBackendHosts.has(new URL(backendUrl).hostname)
  } catch {
    return false
  }
}

export const Route = createFileRoute('/api/medusa-store/config')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = getConfiguredMedusaBackendUrl()
        const publishableKey = getMedusaPublishableKey()
        const enabled = Boolean(
          baseUrl &&
          publishableKey.trim() &&
          !isProductionLocalBackendUrl(baseUrl),
        )

        return Response.json({
          enabled,
          ...(!enabled || baseUrl === undefined ? {} : { backendUrl: baseUrl }),
        })
      },
    },
  },
})
