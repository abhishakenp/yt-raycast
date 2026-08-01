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

crons.cron(
  'clear expired session IP hashes',
  '0 3 * * *',
  internal.sessions.clearExpiredClientIpHashes,
  {},
)

export default crons
