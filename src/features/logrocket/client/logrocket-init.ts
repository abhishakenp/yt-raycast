/**
 * LogRocket client-side initialization with first-party proxy.
 *
 * All LogRocket traffic is routed through `/api/logrocket/*` on our own
 * domain so ad blockers never see requests to `cdn.logrocket.com` or
 * `r.lr-ingest.com`. This is the 2026 best practice: first-party proxy
 * > CNAME > direct third-party (which gets blocked by ~40% of browsers).
 *
 * The `_lrAsyncScript` global MUST be set before the LogRocket module is
 * imported, otherwise the async loader fetches from the default CDN. We
 * set it in the HTML `<head>` via `rootHead()` in `__root.tsx`.
 *
 * Recording is gated to production only (hostname === ship-fast.ai).
 * Staging (*.devliv.io), localhost, and preview deployments are excluded.
 */

import LogRocket from 'logrocket'

/** The canonical production domain. Only this host triggers recording. */
const PRODUCTION_HOST = 'ship-fast.ai'

/**
 * Read the LogRocket app ID from env at call time (not module load time)
 * so tests can override `import.meta.env`.
 */
function getAppId(): string | undefined {
  return import.meta.env.VITE_LOGROCKET_APP_ID
}

/**
 * Whether LogRocket is enabled. Requires all of:
 *  1. An app ID configured via `VITE_LOGROCKET_APP_ID`
 *  2. Running in the browser (not SSR)
 *  3. Production Vite build (`import.meta.env.PROD`)
 *  4. Served from the production domain (`ship-fast.ai`)
 */
export function isLogRocketEnabled(): boolean {
  return shouldEnableLogRocket(
    typeof window !== 'undefined',
    getAppId(),
    import.meta.env.PROD,
    typeof window !== 'undefined' ? window.location.hostname : '',
  )
}

/**
 * Pure predicate extracted for unit testing — the public `isLogRocketEnabled`
 * delegates here with runtime values.
 */
export function shouldEnableLogRocket(
  hasWindow: boolean,
  appId: string | undefined,
  isProd: boolean,
  hostname: string,
): boolean {
  if (!hasWindow) return false
  if (!appId || appId.trim().length === 0) return false
  if (!isProd) return false
  if (hostname !== PRODUCTION_HOST) return false
  return true
}

/**
 * Initialize LogRocket with first-party proxy endpoints.
 *
 * - `serverURL`: sends session data to our proxy instead of r.lr-ingest.com
 * - `_lrAsyncScript` (set in HTML head): serves the async SDK script from
 *   our proxy instead of cdn.logrocket.com
 *
 * Both paths point to `/api/logrocket/*` routes on our own domain.
 */
export function initLogRocket(): void {
  if (!isLogRocketEnabled()) return
  if (window.__logRocketInitialized) return
  window.__logRocketInitialized = true

  LogRocket.init(getAppId()!, {
    serverURL: '/api/logrocket/ingest/i',
  })
}

/**
 * Identify a user in LogRocket for session attribution.
 * Call this when a user signs in or when their profile loads.
 *
 * Uses the Clerk user ID as the immutable UID, and passes name + email
 * as traits so sessions are searchable by name/email in the LogRocket dashboard.
 *
 * Safe to call before init — LogRocket queues the identify call.
 */
export function identifyLogRocketUser(params: {
  userId: string
  name?: string
  email?: string
  traits?: Record<string, string | number | boolean>
}): void {
  if (!isLogRocketEnabled()) return
  const traits: Record<string, string | number | boolean> = {
    ...params.traits,
  }
  if (params.name) traits.name = params.name
  if (params.email) traits.email = params.email
  LogRocket.identify(params.userId, traits)
}

/**
 * Track a custom event in the current LogRocket session.
 * Events appear in the session timeline and can be used for funnel analysis.
 *
 * Safe to call before init — LogRocket queues the track call.
 */
export function trackLogRocketEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean | string[]>,
): void {
  if (!isLogRocketEnabled()) return
  LogRocket.track(eventName, properties)
}

/**
 * Get the current LogRocket session URL. Useful for including in support
 * tickets, Slack notifications, or error reports.
 *
 * Returns `null` when LogRocket is not initialized or the session URL
 * is not yet available.
 */
export function getLogRocketSessionURL(): Promise<string | null> {
  if (!isLogRocketEnabled() || !window.__logRocketInitialized) {
    return Promise.resolve(null)
  }
  return new Promise((resolve) => {
    try {
      LogRocket.getSessionURL((url: string) => resolve(url))
    } catch {
      resolve(null)
    }
  })
}

/**
 * Manually report an exception to LogRocket.
 * Useful for catching errors in try/catch blocks that don't propagate to
 * the global error handler.
 */
export function captureLogRocketException(
  error: Error,
  options?: { tags?: Record<string, string | number | boolean> },
): void {
  if (!isLogRocketEnabled()) return
  LogRocket.captureException(error, options)
}

// Augment the Window interface to track initialization state.
declare global {
  interface Window {
    __logRocketInitialized?: boolean
  }
}
