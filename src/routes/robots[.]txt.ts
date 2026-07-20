import type {} from '@tanstack/react-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { createPublicMetadataResponse } =
          await import('@/features/deployments/server/public-metadata-response')
        return await createPublicMetadataResponse('robots', request)
      },
    },
  },
})
