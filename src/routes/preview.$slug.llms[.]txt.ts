import { createFileRoute } from '@tanstack/react-router'

import { createPublicMetadataResponse } from '@/features/deployments/server/public-metadata-response'

export const Route = createFileRoute('/preview/$slug/llms.txt')({
  server: {
    handlers: {
      GET: async ({ params, request }) =>
        await createPublicMetadataResponse('llms', request, {
          slug: params.slug,
        }),
    },
  },
})
