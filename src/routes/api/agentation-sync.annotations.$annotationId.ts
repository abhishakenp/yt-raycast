import { createFileRoute } from '@tanstack/react-router'

import {
  deleteAgentationAnnotationResponse,
  updateAgentationAnnotationResponse,
} from '@/features/agentation/server/agentation-sync-response'

export const Route = createFileRoute(
  '/api/agentation-sync/annotations/$annotationId',
)({
  server: {
    handlers: {
      PATCH: async ({ params, request }) =>
        await updateAgentationAnnotationResponse(params.annotationId, request),
      DELETE: async ({ params }) =>
        await deleteAgentationAnnotationResponse(params.annotationId),
    },
  },
})
