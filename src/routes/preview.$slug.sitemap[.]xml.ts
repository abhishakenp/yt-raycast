import type {} from '@tanstack/react-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/preview/$slug/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const { createPublicMetadataResponse } =
          await import('@/features/deployments/server/public-metadata-response')
        return await createPublicMetadataResponse('sitemap', request, {
          slug: params.slug,
        })
      },
    },
  },
})
