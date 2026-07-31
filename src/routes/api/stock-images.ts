import { createFileRoute } from '@tanstack/react-router'

import { createStockImageSearchResponse } from '@/features/images/server/stock-image-search-response'

export const Route = createFileRoute('/api/stock-images')({
  server: {
    handlers: {
      GET: async ({ request }) => createStockImageSearchResponse(request),
    },
  },
})
