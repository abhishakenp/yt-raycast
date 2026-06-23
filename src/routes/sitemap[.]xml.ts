import type {} from '@tanstack/react-start'
import { createFileRoute } from '@tanstack/react-router'

import { createPublicMetadataResponse } from '@/features/deployments/server/public-metadata-response'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ request }) =>
        await createPublicMetadataResponse('sitemap', request),
    },
  },
})
