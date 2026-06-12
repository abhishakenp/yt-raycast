import { createFileRoute } from '@tanstack/react-router'

import { createAgentationHealthResponse } from '@/features/agentation/server/agentation-sync-response'

export const Route = createFileRoute('/api/agentation-sync/health')({
  server: {
    handlers: {
      GET: async () => createAgentationHealthResponse(),
    },
  },
})
