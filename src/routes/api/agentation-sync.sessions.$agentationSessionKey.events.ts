import { createFileRoute } from '@tanstack/react-router'

import { createAgentationEventsResponse } from '@/features/agentation/server/agentation-sync-response'

export const Route = createFileRoute(
  '/api/agentation-sync/sessions/$agentationSessionKey/events',
)({
  server: {
    handlers: {
      GET: async () => createAgentationEventsResponse(),
    },
  },
})
