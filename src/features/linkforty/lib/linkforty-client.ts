/**
 * Server-side LinkForty API client.
 *
 * Used by Convex actions (which can make HTTP calls) to create short links
 * on the self-hosted LinkForty instance. The referral code becomes the
 * LinkForty customCode, so links.ship-fast.ai/CODE redirects to
 * ship-fast.ai/?ref=CODE — the existing client-side capture flow is unchanged.
 */

export type LinkFortyCreateLinkResponse = {
  id: string
  short_code: string
  original_url: string
  user_id: string
}

export type LinkFortyCreateLinkInput = {
  apiUrl: string
  serviceUserId: string
  code: string
  originalUrl: string
  title?: string
}

export async function createLinkFortyShortLink(
  input: LinkFortyCreateLinkInput,
): Promise<LinkFortyCreateLinkResponse> {
  const response = await fetch(`${input.apiUrl}/api/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: input.serviceUserId,
      customCode: input.code,
      originalUrl: input.originalUrl,
      title: input.title ?? `Referral link — ${input.code}`,
    }),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(
      `LinkForty create link failed: ${response.status} ${body.slice(0, 200)}`,
    )
  }
  return (await response.json()) as LinkFortyCreateLinkResponse
}

/**
 * Verify a LinkForty webhook HMAC-SHA256 signature.
 *
 * LinkForty sends `X-LinkForty-Signature: sha256=<hex>` where the hex is
 * HMAC-SHA256(secret, rawRequestBody). This function recomputes the HMAC
 * over the raw body and compares in constant time.
 */
export async function verifyLinkFortyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  // Header format: "sha256=<hex>"
  const prefix = 'sha256='
  if (!signatureHeader.startsWith(prefix)) return false
  const provided = signatureHeader.slice(prefix.length)

  const encoder = new TextEncoder()
  const key = encoder.encode(secret)
  const message = encoder.encode(rawBody)

  // Use Web Crypto API (available in both Node 18+ and Cloudflare Workers)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message)
  const computed = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return timingSafeEqual(computed, provided)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let match = true
  for (let i = 0; i < a.length; i += 1) {
    if (a.charCodeAt(i) !== b.charCodeAt(i)) match = false
  }
  return match
}
