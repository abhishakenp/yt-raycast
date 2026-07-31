/**
 * Shared session TTL constants.
 *
 * Single source of truth for time-to-live values that must stay in sync
 * between the Convex backend (scheduled cleanup jobs) and the client
 * (localStorage cache expiry). Import from here — never duplicate the
 * literal in two places.
 */

/**
 * How long a draft (speculative) session lives before the Convex scheduled
 * job hard-deletes it if still a draft.
 *
 * The client-side prompt-session cache uses the same value so that a cached
 * speculative session expires from localStorage at the same time the
 * backend would delete the draft — preventing the client from trying to
 * reuse a session that no longer exists.
 */
export const DRAFT_SESSION_TTL_MS = 15 * 60 * 1_000

/**
 * How long a session can stay in `queued` or `running` status before the
 * stuck-session cleanup cron marks it as `failed`. The VPS generation
 * handler normally updates the status within minutes; anything older than
 * this is assumed to have crashed or lost its worker.
 */
export const STUCK_SESSION_TIMEOUT_MS = 60 * 60 * 1_000 // 1 hour
