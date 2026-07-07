/**
 * Soft-warn Mobbin Pro coverage audit.
 *
 * Runs after homepage generation, with the chosen session anchor. Reports
 * palette inheritance, doctrine-marker inheritance, and verbatim-copy
 * borrowing. Returns a coverage report — info-only, not a gate. Callers can
 * log it and persist it to the session for later analysis.
 *
 * Hardening (turning these into gates) is intentionally a follow-up — we want
 * to see baseline numbers across real production sessions before deciding
 * which axis is the right one to fail-close on.
 */
import {
  scoreMobbinCoverage,
  detectVerbatimAnchorCopy,
} from '../lib/mobbin/score.js'
import type { MobbinAnchor } from '../lib/mobbin/types.js'

const PALETTE_WARN_RATIO = 0.4 // <40% of anchor hex strings appearing → warn
const DOCTRINE_WARN_RATIO = 0.15 // <15% doctrine markers → warn

export function auditMobbinCoverage(
  html: string,
  mobbinAnchor: MobbinAnchor | null,
) {
  if (!html || !mobbinAnchor?.app) {
    return {
      ok: true,
      anchor: null,
      warnings: [],
      score: null,
    }
  }
  const score = scoreMobbinCoverage(html, mobbinAnchor)
  const verbatim = detectVerbatimAnchorCopy(html)
  const warnings = []

  if (score.palette.total > 0 && score.palette.ratio < PALETTE_WARN_RATIO) {
    warnings.push(
      `palette: only ${score.palette.hits}/${score.palette.total} of ${mobbinAnchor.app}'s hex tokens appeared verbatim in HTML (target ≥${Math.ceil(score.palette.total * PALETTE_WARN_RATIO)})`,
    )
  }
  if (score.doctrine.total > 0 && score.doctrine.ratio < DOCTRINE_WARN_RATIO) {
    warnings.push(
      `doctrine: only ${score.doctrine.hits}/${score.doctrine.total} ${mobbinAnchor.app} doctrine markers appeared in the rendered HTML`,
    )
  }
  if (verbatim.count > 0) {
    const apps = [...new Set(verbatim.matches.map((m) => m.app))].join(', ')
    warnings.push(
      `verbatim borrowed copy detected from ${apps} — ${verbatim.count} match(es). The DNA bank is style-reference only; the output should paraphrase, never quote.`,
    )
  }

  return {
    ok: warnings.length === 0,
    anchor: mobbinAnchor.app,
    score,
    verbatim,
    warnings,
  }
}
