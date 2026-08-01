/**
 * Global model-spend cap and kill switch.
 *
 * Every LLM route is individually rate limited, but nothing bounded the TOTAL:
 * with N routes at M requests each, per-route limits multiply into an
 * unbounded bill. This adds one shared daily ceiling across all of them, plus
 * a manual switch to stop model spend immediately without a deploy.
 *
 * Counting is process-local (same trade-off as the rate limiter), so with
 * multiple replicas the effective ceiling is `replicas × MODEL_DAILY_CALL_CAP`.
 * Set the cap accordingly. It is a backstop against runaway cost, not an
 * accounting system.
 */

const DAY_MS = 24 * 60 * 60 * 1000

type SpendWindow = { startedAt: number; calls: number }

let window: SpendWindow | undefined

/** Exposed for tests. */
export function resetSpendCounters(): void {
  window = undefined
}

export function isModelSpendKilled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (env.DISABLE_MODEL_SPEND ?? '').trim().toLowerCase() === 'true'
}

export function dailyCallCap(env: NodeJS.ProcessEnv = process.env): number {
  const configured = Number.parseInt(env.MODEL_DAILY_CALL_CAP ?? '', 10)
  return Number.isSafeInteger(configured) && configured > 0
    ? configured
    : Number.POSITIVE_INFINITY
}

export type SpendDecision =
  | { allowed: true }
  | { allowed: false; reason: 'kill_switch' | 'daily_cap' }

/**
 * Record one model call against the global budget and say whether it may
 * proceed. Call this immediately before dispatching to a model.
 */
export function admitModelCall(
  now = Date.now(),
  env: NodeJS.ProcessEnv = process.env,
): SpendDecision {
  if (isModelSpendKilled(env)) {
    return { allowed: false, reason: 'kill_switch' }
  }

  const cap = dailyCallCap(env)
  if (cap === Number.POSITIVE_INFINITY) return { allowed: true }

  const currentWindow =
    window === undefined || now - window.startedAt >= DAY_MS
      ? { startedAt: now, calls: 0 }
      : window

  if (currentWindow.calls >= cap) {
    window = currentWindow
    return { allowed: false, reason: 'daily_cap' }
  }

  currentWindow.calls += 1
  window = currentWindow
  return { allowed: true }
}

export function modelSpendBlockedResponse(reason: SpendDecision): Response {
  const killed = reason.allowed === false && reason.reason === 'kill_switch'
  return new Response(
    JSON.stringify({
      error: killed
        ? 'AI generation is temporarily disabled.'
        : 'AI generation is temporarily unavailable. Please try again later.',
    }),
    {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Retry-After': '3600',
      },
    },
  )
}
