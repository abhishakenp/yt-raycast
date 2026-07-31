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
