import type { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { verifyLinkFortyWebhookSignature } from '../lib/linkforty-client'

type LinkFortyWebhookEnv = {
  LINKFORTY_ENABLED?: string
  LINKFORTY_WEBHOOK_SECRET?: string
}

type LinkFortyWebhookDependencies = {
  convexClient?: Pick<ConvexHttpClient, 'mutation'>
  env?: LinkFortyWebhookEnv
}

/**
 * Click event payload from LinkForty webhook.
 * Fields match the clickEventData object in LinkForty's redirect.ts.
 */
type LinkFortyClickEvent = {
  id: string
  linkId: string
  shortCode: string
  originalUrl: string
  clickedAt: string
  deviceType?: string
  platform?: string
  countryCode?: string
  countryName?: string
  city?: string
  isBot?: boolean
  botReason?: string | null
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  referrer?: string
}

type LinkFortyWebhookPayload = {
  event: string
  event_id: string
  timestamp: string
  data: LinkFortyClickEvent
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

function getEnvironment(
  override: LinkFortyWebhookEnv | undefined,
): LinkFortyWebhookEnv {
  return override ?? process.env
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function isClickEvent(value: unknown): value is LinkFortyClickEvent {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.linkId === 'string' &&
    typeof value.shortCode === 'string'
  )
}

function isClickEventPayload(value: unknown): value is LinkFortyWebhookPayload {
  if (!isRecord(value)) return false
  return (
    typeof value.event === 'string' &&
    typeof value.event_id === 'string' &&
    isClickEvent(value.data)
  )
}

/**
 * Handle a LinkForty webhook POST.
 *
 * Verifies the HMAC-SHA256 signature over the raw body, parses the payload,
 * and records the click event in Convex via an internal mutation. Only
 * `click_event` events are processed; other event types are acknowledged
 * with 200 but ignored (future: install_event, conversion_event).
 *
 * Idempotency: the Convex mutation checks for an existing clickId before
 * inserting, so duplicate webhook deliveries (LinkForty retries) are safe.
 */
export async function createLinkFortyWebhookResponse(
  request: Request,
  dependencies: LinkFortyWebhookDependencies = {},
): Promise<Response> {
  const env = getEnvironment(dependencies.env)
  if (env.LINKFORTY_ENABLED?.trim().toLowerCase() !== 'true') {
    return json({ error: 'LinkForty not enabled.' }, { status: 404 })
  }

  const secret = env.LINKFORTY_WEBHOOK_SECRET
  if (!secret) {
    return json({ error: 'Webhook secret not configured.' }, { status: 503 })
  }

  // Read raw body for signature verification (must not parse first).
  const rawBody = await request.text()
  if (!rawBody) {
    return json({ error: 'Empty body.' }, { status: 400 })
  }

  const signatureHeader = request.headers.get('x-linkforty-signature') ?? ''
  const verified = await verifyLinkFortyWebhookSignature(
    rawBody,
    signatureHeader,
    secret,
  )
  if (!verified) {
    return json({ error: 'Invalid signature.' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  if (!isClickEventPayload(payload)) {
    return json({ error: 'Invalid payload.' }, { status: 400 })
  }

  // Only click_event is processed; acknowledge others without storing.
  if (payload.event !== 'click_event') {
    return json({ received: true, ignored: true })
  }

  const click = payload.data
  try {
    const client = dependencies.convexClient ?? createRuntimeConvexHttpClient()
    await client.mutation(api.linkforty.recordClickEvent, {
      secret: process.env.BILLING_WEBHOOK_MUTATION_SECRET ?? '',
      clickId: click.id,
      shortCode: click.shortCode,
      linkId: click.linkId,
      clickedAt: new Date(click.clickedAt).getTime(),
      deviceType: click.deviceType ?? undefined,
      platform: click.platform ?? undefined,
      countryCode: click.countryCode ?? undefined,
      countryName: click.countryName ?? undefined,
      city: click.city ?? undefined,
      isBot: click.isBot ?? false,
      botReason: click.botReason ?? undefined,
      utmSource: click.utmSource ?? undefined,
      utmMedium: click.utmMedium ?? undefined,
      utmCampaign: click.utmCampaign ?? undefined,
      referrer: click.referrer ?? undefined,
    })
    return json({ received: true })
  } catch {
    return json({ error: 'Failed to record click event.' }, { status: 502 })
  }
}
