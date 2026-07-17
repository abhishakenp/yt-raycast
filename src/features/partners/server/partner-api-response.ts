import type { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { createDubServerClient } from './dub-client'

type PartnerConvexClient = Pick<
  ConvexHttpClient,
  'mutation' | 'query' | 'setAuth'
>

type PartnerDubClient = {
  embedTokens: {
    referrals: (input: {
      tenantId: string
      partner: {
        email: string
        groupId: string
        image?: string | null
        name: string
        tenantId: string
      }
    }) => Promise<{ publicToken: string }>
  }
}

type PartnerApiEnv = {
  DUB_API_KEY?: string
  DUB_PARTNERS_ENABLED?: string
  DUB_PARTNER_GROUP_ID?: string
}

type PartnerApiDependencies = {
  convexClient?: PartnerConvexClient
  dubClient?: PartnerDubClient
  env?: PartnerApiEnv
}

function json(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

function getBearerToken(request: Request): string | null {
  const match = (request.headers.get('authorization') ?? '').match(
    /^Bearer\s+(.+)$/i,
  )
  return match?.[1]?.trim() || null
}

function isEnabled(env: PartnerApiEnv): boolean {
  return env.DUB_PARTNERS_ENABLED?.trim().toLowerCase() === 'true'
}

function getEnvironment(override: PartnerApiEnv | undefined): PartnerApiEnv {
  return override ?? process.env
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

export async function createPartnerAttributionApiResponse(
  request: Request,
  dependencies: PartnerApiDependencies = {},
): Promise<Response> {
  const env = getEnvironment(dependencies.env)
  if (!isEnabled(env)) {
    return json({ error: 'Partner program not found.' }, { status: 404 })
  }

  const token = getBearerToken(request)
  if (!token) {
    return json(
      { error: 'Sign in to record partner attribution.' },
      {
        status: 401,
      },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  if (!isRecord(body)) {
    return json({ error: 'Missing partner click identifier.' }, { status: 400 })
  }
  const clickId = typeof body.clickId === 'string' ? body.clickId.trim() : ''
  if (!clickId) {
    return json({ error: 'Missing partner click identifier.' }, { status: 400 })
  }

  try {
    const client = dependencies.convexClient ?? createRuntimeConvexHttpClient()
    client.setAuth(token)
    const result = await client.mutation(api.partners.claimDubAttribution, {
      clickId,
    })
    return json(result)
  } catch {
    return json(
      { error: 'Unable to record partner attribution.' },
      {
        status: 503,
      },
    )
  }
}

export async function createPartnerEmbedTokenApiResponse(
  request: Request,
  dependencies: PartnerApiDependencies = {},
): Promise<Response> {
  const env = getEnvironment(dependencies.env)
  if (!isEnabled(env)) {
    return json({ error: 'Partner program not found.' }, { status: 404 })
  }

  const token = getBearerToken(request)
  if (!token) {
    return json(
      { error: 'Sign in to view the partner portal.' },
      {
        status: 401,
      },
    )
  }
  if (!env.DUB_API_KEY || !env.DUB_PARTNER_GROUP_ID) {
    return json(
      { error: 'Partner portal is not configured.' },
      {
        status: 503,
      },
    )
  }

  try {
    const convexClient =
      dependencies.convexClient ?? createRuntimeConvexHttpClient()
    convexClient.setAuth(token)
    const identity = await convexClient.query(
      api.partners.getMyPartnerIdentity,
      {},
    )
    if (!identity.email || identity.emailVerified !== true) {
      return json({ error: 'A verified email is required.' }, { status: 422 })
    }

    const dubClient =
      dependencies.dubClient ?? createDubServerClient(env.DUB_API_KEY)
    const tokenResult = await dubClient.embedTokens.referrals({
      partner: {
        email: identity.email,
        groupId: env.DUB_PARTNER_GROUP_ID,
        image: identity.image,
        name: identity.name || identity.email.split('@')[0],
        tenantId: identity.tenantId,
      },
      tenantId: identity.tenantId,
    })
    if (!tokenResult.publicToken) {
      throw new Error('Dub returned an empty embed token')
    }

    return json(
      { publicToken: tokenResult.publicToken },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return json({ error: 'Unable to load partner portal.' }, { status: 503 })
  }
}
