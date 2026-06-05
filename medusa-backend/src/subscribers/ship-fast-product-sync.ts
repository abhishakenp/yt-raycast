import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

/**
 * On any product change in this tenant, nudge ship-fast to pull the updated
 * catalogue back into the generated storefront — so editing a product in the
 * Medusa admin reflects in the live preview without anyone clicking
 * "Sync from Medusa".
 *
 * Wiring comes entirely from env injected by the per-session compose
 * (src/server/medusa-provision.js):
 *   SHIP_FAST_SYNC_URL        dashboard origin to call back (e.g. host.docker.internal:7420)
 *   SHIP_FAST_SESSION_ID      the ship-fast session this tenant belongs to
 *   SHIP_FAST_WEBHOOK_SECRET  optional shared secret the dashboard validates
 *
 * Best-effort: failures are swallowed so admin operations never block, and the
 * manual sync button stays as a fallback. The dashboard side debounces, so a
 * burst of product.updated events collapses into a single re-sync.
 */
export default async function shipFastProductSync({
  event,
}: SubscriberArgs<{ id: string }>) {
  const base = (process.env.SHIP_FAST_SYNC_URL || "").trim().replace(/\/$/, "")
  const sessionId = (process.env.SHIP_FAST_SESSION_ID || "").trim()
  if (!base || !sessionId) return

  const secret = (process.env.SHIP_FAST_WEBHOOK_SECRET || "").trim()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    await fetch(`${base}/api/sessions/${encodeURIComponent(sessionId)}/medusa-webhook`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...(secret ? { "x-shipfast-webhook-secret": secret } : {}),
      },
      body: JSON.stringify({
        productId: (event.data as { id?: string } | undefined)?.id ?? null,
      }),
    })
  } catch {
    // best-effort — manual "Sync from Medusa" remains available
  } finally {
    clearTimeout(timeout)
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated", "product.deleted"],
}
