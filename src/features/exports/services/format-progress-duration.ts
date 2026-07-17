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
