import { createFileRoute } from '@tanstack/react-router'

import { createPublicMetadataResponse } from '@/features/deployments/server/public-metadata-response'

export const Route = createFileRoute('/preview/$slug/robots.txt')({
  server: {
    handlers: {
      GET: async ({ params, request }) =>
        await createPublicMetadataResponse('robots', request, {
          slug: params.slug,
        }),
    },
  },
})
