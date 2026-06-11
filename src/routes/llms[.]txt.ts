import { createFileRoute } from '@tanstack/react-router'

import { createPublicMetadataResponse } from '@/features/deployments/server/public-metadata-response'

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async ({ request }) =>
        await createPublicMetadataResponse('llms', request),
    },
  },
})
