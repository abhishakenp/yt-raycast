import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type ReferralConvexClient = Pick<
  ConvexHttpClient,
  'query' | 'mutation' | 'setAuth'
>

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const getBearerToken = (request: Request): string | null => {
  const match = (request.headers.get('authorization') ?? '').match(
    /^Bearer\s+(.+)$/i,
  )
  return match?.[1]?.trim() || null
}

/** GET /api/referrals/status — ensure the user's code exists and return state. */
export const createReferralStatusApiResponse = async (
  request: Request,
  clientOverride?: ReferralConvexClient,
): Promise<Response> => {
  const token = getBearerToken(request)
  if (token === null) {
    return json({ error: 'Sign in to view referrals.' }, { status: 401 })
  }

  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    client.setAuth(token)
    await client.mutation(api.referrals.getOrCreateMyReferralCode, {})
    const status = await client.query(api.referrals.getMyReferralStatus, {})
    return json(status)
  } catch {
    return json({ error: 'Unable to load referrals.' }, { status: 503 })
  }
}

/** POST /api/referrals/record — attribute the signed-in user to a ref code. */
export const createReferralRecordApiResponse = async (
  request: Request,
  clientOverride?: ReferralConvexClient,
): Promise<Response> => {
  const token = getBearerToken(request)
  if (token === null) {
    return json({ error: 'Sign in to record a referral.' }, { status: 401 })
  }

  let body: { code?: unknown; email?: unknown } = {}
  try {
    body = (await request.json()) as { code?: unknown; email?: unknown }
  } catch {
    return json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const code = typeof body.code === 'string' ? body.code : ''
  const email = typeof body.email === 'string' ? body.email : undefined
  if (!code) return json({ error: 'Missing referral code.' }, { status: 400 })

  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    client.setAuth(token)
    const result = (await client.mutation(api.referrals.recordReferralSignup, {
      code,
      email,
    })) as { recorded: boolean; reason: string }

    return json(result)
  } catch {
    return json({ error: 'Unable to record referral.' }, { status: 503 })
  }
}
