import { createFileRoute } from '@tanstack/react-router'

import { createHealthApiResponse } from '@/features/health/server/health-api-response'

export const Route = createFileRoute('/health')({
  server: {
    handlers: {
      GET: async () => await createHealthApiResponse(),
    },
  },
})
