import { createFileRoute } from '@tanstack/react-router'

import { createSessionCreateResponse } from '@/features/session/server/session-create-response'

export const Route = createFileRoute('/api/sessions/create')({
  server: {
    handlers: {
      POST: async ({ request }) => await createSessionCreateResponse(request),
    },
  },
})
