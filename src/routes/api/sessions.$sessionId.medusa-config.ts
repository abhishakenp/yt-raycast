import { createFileRoute } from '@tanstack/react-router'

import { createSessionMedusaConfigResponse } from '@/features/commerce/server/commerce-api-response'

export const Route = createFileRoute('/api/sessions/$sessionId/medusa-config')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { sessionId: string } }) =>
        await createSessionMedusaConfigResponse(params.sessionId),
    },
  },
})
