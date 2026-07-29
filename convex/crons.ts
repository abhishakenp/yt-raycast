import { cronJobs } from 'convex/server'

import { internal } from './_generated/api'

/**
 * Periodic cleanup jobs for session lifecycle.
 *
 * - `cleanupStuckSessions`: marks sessions stuck mid-generation (`queued`,
 *   `validating` or `streaming`) for more than 1 hour as `failed`. Runs every
 *   15 minutes.
 */
const crons = cronJobs()

crons.interval(
  'cleanupStuckSessions',
  { minutes: 15 },
  internal.sessions.cleanupStuckSessions,
)

// Re-check only existing commerce instances hourly so suspension/deletion
// follows paid-through entitlement without scanning the entire table.
crons.interval(
  'commerce instance lifecycle sweep',
  { hours: 1 },
  internal.commerceInstances.runLifecycleSweep,
)

crons.cron(
  'clear expired session IP hashes',
  '0 3 * * *',
  internal.sessions.clearExpiredClientIpHashes,
  {},
)

export default crons
