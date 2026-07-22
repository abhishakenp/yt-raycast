/**
 * Small formatting helpers for the real, event-driven export/deploy
 * progress bars (ExportPanel, DeploymentPanel). No timers or simulated
 * progress live here — these only format numbers the server already
 * computed from actual completed pipeline stages.
 */

export function formatDurationShort(ms: number): string {
  if (ms < 1000) return '<1s'
  const totalSeconds = Math.round(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`
}

/**
 * Simple linear ETA projection from this run's own observed pace:
 * "elapsed / percent-so-far * remaining-percent". Self-corrects to how
 * fast THIS build is actually going instead of a fixed guess. Returns
 * null when there isn't enough signal yet (0% or already done).
 */
export function estimateRemainingMs(
  elapsedMs: number,
  percent: number,
): number | null {
  if (percent <= 0 || percent >= 100 || elapsedMs <= 0) return null
  return Math.max(0, Math.round((elapsedMs * (100 - percent)) / percent))
}

export type ObservedProgressTiming = {
  now: number
  percent: number
  progressSampleCount?: number
  progressStartedAt?: number
  progressUpdatedAt?: number
}

/**
 * ETA from real server progress observations only.
 *
 * The first non-zero percent is not enough signal: fast setup stages can
 * finish in milliseconds and would project nonsense like "<1s left". Wait
 * until the server has recorded at least three stage samples for this run,
 * then project from the run's actual observed average rate and count down
 * locally between server updates.
 */
export function estimateObservedRemainingMs({
  now,
  percent,
  progressSampleCount,
  progressStartedAt,
  progressUpdatedAt,
}: ObservedProgressTiming): number | null {
  if (
    progressSampleCount === undefined ||
    progressSampleCount < 3 ||
    progressStartedAt === undefined ||
    progressUpdatedAt === undefined
  ) {
    return null
  }

  const elapsedAtLastServerSample = progressUpdatedAt - progressStartedAt
  const remainingAtLastServerSample = estimateRemainingMs(
    elapsedAtLastServerSample,
    percent,
  )
  if (remainingAtLastServerSample === null) return null

  const elapsedSinceLastServerSample = Math.max(0, now - progressUpdatedAt)
  return Math.max(0, remainingAtLastServerSample - elapsedSinceLastServerSample)
}
