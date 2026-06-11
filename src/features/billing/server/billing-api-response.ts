import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type BillingConvexClient = Pick<ConvexHttpClient, 'query' | 'setAuth'>

type BillingEndpoint = 'subscription-status' | 'credits' | 'billing-overview'

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const getBearerToken = (request: Request): string | null => {
  const auth = request.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

const getFunctionReference = (endpoint: BillingEndpoint) => {
  if (endpoint === 'subscription-status')
    return api.billing.getSubscriptionStatus
  if (endpoint === 'credits') return api.billing.getCreditBalance
  return api.billing.getBillingOverview
}

export const createBillingApiResponse = async (
  request: Request,
  endpoint: BillingEndpoint,
  clientOverride?: BillingConvexClient,
): Promise<Response> => {
  const token = getBearerToken(request)
  if (token === null) {
    return json({ error: 'Sign in to view billing details.' }, { status: 401 })
  }

  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    client.setAuth(token)
    const data = await client.query(getFunctionReference(endpoint), {})
    return json(data)
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load billing details.',
      },
      { status: 500 },
    )
  }
}
