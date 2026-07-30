import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { applyReferralDiscountForUser } from '@/features/referrals/server/referral-discount'
import {
  sendBusinessNotification,
  inviteeJoinedEvent,
} from '@/features/notifications/slack-business'

type ReferralConvexClient = Pick<
  ConvexHttpClient,
  'query' | 'mutation' | 'setAuth'
>

type ApplyReferralDiscount = typeof applyReferralDiscountForUser

function json(body: unknown, init?: ResponseInit) {
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

/** GET /api/referrals/status — ensure the user's code exists and return state. */
export async function createReferralStatusApiResponse(
  request: Request,
  clientOverride?: ReferralConvexClient,
): Promise<Response> {
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
export async function createReferralRecordApiResponse(
  request: Request,
  clientOverride?: ReferralConvexClient,
  applyDiscount: ApplyReferralDiscount = applyReferralDiscountForUser,
): Promise<Response> {
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
    })) as {
      recorded: boolean
      reason: string
      referrerJustUnlocked?: string | null
    }

    // If the referrer's reward just unlocked (referred user already had an
    // active subscription), apply the provider discount best-effort. For
    // Stripe this attaches the forever coupon to the referrer's existing
    // subscription → discount applies from the next billing period. For
    // Razorpay the discount applies at the referrer's next checkout. Never
    // blocks the response — the referral is already recorded.
    if (result.referrerJustUnlocked) {
      void applyDiscount(process.env, result.referrerJustUnlocked).catch(
        () => ({ applied: false, reason: 'unhandled' }),
      )
    }

    // Best-effort Slack notification when a referral is successfully recorded.
    if (result.recorded) {
      let referredUserId = 'unknown'
      let referredUserName: string | undefined
      let referredUserEmail: string | undefined
      try {
        const token = getBearerToken(request)
        if (token) {
          const payload = token.split('.')[1]
          if (payload) {
            const decoded = JSON.parse(
              Buffer.from(payload, 'base64url').toString('utf-8'),
            )
            referredUserId =
              decoded.sub ?? decoded['https://clerk.com/user_id'] ?? 'unknown'
            referredUserName = decoded.name ?? decoded['https://clerk.com/name']
            referredUserEmail =
              decoded.email ?? decoded['https://clerk.com/email']
          }
        }
      } catch {}

      void sendBusinessNotification(
        inviteeJoinedEvent({
          referredUserId,
          referredUserName,
          referredUserEmail: referredUserEmail ?? email,
          referrerUserId: result.referrerJustUnlocked ?? 'unknown',
          code,
        }),
      ).catch(() => {})
    }

    return json(result)
  } catch {
    return json({ error: 'Unable to record referral.' }, { status: 503 })
  }
}
