import type {} from '@tanstack/react-start'
import { createFileRoute } from '@tanstack/react-router'

import { createPublicMetadataResponse } from '@/features/deployments/server/public-metadata-response'

export const Route = createFileRoute('/preview/$slug/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ params, request }) =>
        await createPublicMetadataResponse('sitemap', request, {
          slug: params.slug,
        }),
    },
  },
})
