import { createFileRoute } from '@tanstack/react-router'

import { createSessionMedusaProvisionResponse } from '@/features/commerce/server/commerce-api-response'

export const Route = createFileRoute('/api/sessions/$sessionId/provision/medusa')({
  server: {
    handlers: {
      POST: async ({
        params,
        request,
      }: {
        params: { sessionId: string }
        request: Request
      }) => await createSessionMedusaProvisionResponse(params.sessionId, request),
    },
  },
})
