import type { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { timingSafeEqual } from '@/lib/timingSafeEqual'
import { getWebhookVerificationSecrets } from '@/lib/webhook-secret-rotation'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type GitHubWebhookEnv = NodeJS.ProcessEnv
type GitHubWebhookClient = Pick<ConvexHttpClient, 'mutation'>
type GitHubWebhookDependencies = {
  client?: GitHubWebhookClient
  env?: GitHubWebhookEnv
}

const MAX_WEBHOOK_BODY_BYTES = 1_048_576

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

const toHex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

const hmacSha256 = async (secret: string, payload: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return toHex(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)),
  )
}

export const verifyGitHubWebhookSignature = async (
  rawBody: string,
  signatureHeader: string,
  secrets: string[],
) => {
  const signature = signatureHeader.trim()
  if (!signature.startsWith('sha256=') || secrets.length === 0) return false
  const supplied = signature.slice('sha256='.length)
  const expected = await Promise.all(
    secrets.map((secret) => hmacSha256(secret, rawBody)),
  )
  return expected.reduce(
    (matched, candidate) => timingSafeEqual(candidate, supplied) || matched,
    false,
  )
}

/**
 * Verifies GitHub's SHA-256 signature against the raw request body, then
 * records `X-GitHub-Delivery` in Convex before acknowledging the event.
 * Event-specific side effects must happen only after this idempotency gate.
 */
export const createGitHubWebhookResponse = async (
  request: Request,
  dependencies: GitHubWebhookDependencies = {},
) => {
  const env = dependencies.env ?? process.env
  const deliveryId = request.headers.get('x-github-delivery')?.trim()
  const signature = request.headers.get('x-hub-signature-256') ?? ''
  const mutationSecret = env.GITHUB_WEBHOOK_MUTATION_SECRET?.trim()
  const secrets = getWebhookVerificationSecrets(env, 'GITHUB_WEBHOOK_SECRET')
  if (!mutationSecret || secrets.length === 0) {
    return json({ error: 'GitHub webhook is not configured.' }, { status: 503 })
  }
  if (!deliveryId) {
    return json({ error: 'Missing GitHub delivery ID.' }, { status: 400 })
  }
  const contentLength = Number(request.headers.get('content-length'))
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_WEBHOOK_BODY_BYTES
  ) {
    return json({ error: 'Webhook body too large.' }, { status: 413 })
  }
  const rawBody = await request.text()
  if (
    !rawBody ||
    new TextEncoder().encode(rawBody).byteLength > MAX_WEBHOOK_BODY_BYTES
  ) {
    return json({ error: 'Webhook body too large.' }, { status: 413 })
  }
  if (!(await verifyGitHubWebhookSignature(rawBody, signature, secrets))) {
    return json({ error: 'Invalid GitHub webhook signature.' }, { status: 401 })
  }
  try {
    JSON.parse(rawBody)
  } catch {
    return json({ error: 'Invalid webhook body.' }, { status: 400 })
  }
  try {
    const client = dependencies.client ?? createRuntimeConvexHttpClient()
    const result = (await client.mutation(
      api.billing.recordGitHubWebhookDelivery,
      {
        secret: mutationSecret,
        deliveryId,
      },
    )) as { inserted: boolean }
    return json({ received: true, duplicate: !result.inserted })
  } catch {
    return json({ error: 'Webhook processing failed.' }, { status: 502 })
  }
}
