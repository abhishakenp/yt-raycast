import { createFileRoute } from '@tanstack/react-router'

import { createBrandProfileResponse } from '@/features/brand/server/brand-profile-response'

export const Route = createFileRoute('/api/brand-profile')({
  server: {
    handlers: {
      GET: async ({ request }) => await createBrandProfileResponse(request),
    },
  },
})
