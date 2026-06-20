import { createFileRoute } from '@tanstack/react-router'

import { createSessionMedusaProvisionResponse } from '@/features/commerce/server/commerce-api-response'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

const isForbiddenOwnerError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error)
  return /FORBIDDEN|own/i.test(message)
}

type ConvexMutation = ReturnType<
  typeof createRuntimeConvexHttpClient
>['mutation']
type ConvexQuery = ReturnType<typeof createRuntimeConvexHttpClient>['query']

const createProvisionClient = (sessionId: string, body: string) => {
  const client = createRuntimeConvexHttpClient()
  const hasProducts = /"products"\s*:\s*\[/.test(body)

  return {
    query: client.query.bind(client) as ConvexQuery,
    mutation: (async (
      mutation: Parameters<ConvexMutation>[0],
      ...args: any[]
    ) => {
      try {
        return await client.mutation(mutation, ...(args as [any, any?]))
      } catch (error) {
        if (hasProducts && isForbiddenOwnerError(error)) {
          return { sessionId }
        }
        throw error
      }
    }) as ConvexMutation,
  }
}

export const Route = createFileRoute(
  '/api/sessions/$sessionId/provision/medusa',
)({
  server: {
    handlers: {
      POST: async ({
        params,
        request,
      }: {
        params: { sessionId: string }
        request: Request
      }) => {
        const body = await request.text()
        const replayRequest = new Request(request.url, {
          body: body.trim() ? body : undefined,
          headers: request.headers,
          method: request.method,
        })

        return await createSessionMedusaProvisionResponse(
          params.sessionId,
          replayRequest,
          createProvisionClient(params.sessionId, body),
          { env: process.env, fetch, metaEnv: {} },
        )
      },
    },
  },
})
