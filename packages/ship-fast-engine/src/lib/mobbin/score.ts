/**
 * Mobbin Pro coverage scoring + aurora-relax filter + verbatim-copy detector.
 * Lifted from scripts/forge-mobbin.mjs. Pure module.
 */
import { COPY_EXAMPLES } from './dna.js'
import type { MobbinAnchor, MobbinDna } from './types.js'

interface VerifyResult {
  ok: boolean
  feedback: string
  auroraRelaxed?: boolean
  originalFeedback?: string
}

interface CoveragePalette {
  hits: number
  total: number
  ratio: number
  hexHits: string[]
}

interface CoverageDoctrine {
  hits: number
  total: number
  ratio: number
}

interface CoverageResult {
  palette: CoveragePalette
  doctrine: CoverageDoctrine
}

interface VerbatimMatch {
  app: string
  location: string
  verbatim: string
}

interface VerbatimResult {
  count: number
  matches: VerbatimMatch[]
}

export function anchorAvoidsAurora(dna: MobbinDna | null): boolean {
  if (!dna || !Array.isArray(dna.avoid)) return false
  const flat = dna.avoid.join(' ').toLowerCase()
  return /aurora|multi-?color|multi-?colour|gradient blob/.test(flat)
}

/**
 * Does this anchor's DNA reject the standard B2B-SaaS marketing rigor
 * (pricing band + FAQ + aurora visuals)? True for travel/retail/editorial/
 * lifestyle anchors (Airbnb, Patagonia, Apple, NYT, Vogue, etc.) — those
 * pages don't have SaaS pricing bands or FAQ accordions. False for true
 * B2B SaaS anchors (Linear, Stripe, Vercel, etc.) which DO follow that
 * pattern.
 *
 * Used to skip the engine's Nova marketing-bar degeneracy check when the
 * anchor explicitly rejects the SaaS template — otherwise the check would
 * reject every correctly-built anchor-aware page for missing pricing/FAQ.
 */
export function anchorAvoidsSaasMarketing(dna: MobbinDna | null): boolean {
  if (!dna || !Array.isArray(dna.avoid)) return false
  const flat = dna.avoid.join(' ').toLowerCase()
  return /b2b|saas|developer-tone|feature grid|trust strip|code snippet|dashboard preview/i.test(
    flat,
  )
}

/**
 * Filter an aurora-audit failure to OK status when the active anchor's DNA
 * explicitly rejects aurora visuals. Without this, the engine's
 * `passesHomepagePublicDesignVerification` aurora-tier rules cause a model
 * that CORRECTLY followed an anti-aurora anchor (Linear/Airbnb/Apple/etc) to
 * fail verification and get replaced by the renderer fallback — throwing
 * away every Mobbin DNA inheritance the model just did.
 *
 * Positive-list filter: rules we KEEP enforcing even for anti-aurora anchors
 * are theme-agnostic structural checks (data-reveal, data-magnet, contrast).
 * Everything else is treated as aurora-tier scaffolding and dropped.
 */
export function relaxAuroraAuditForAnchor(
  verify: VerifyResult,
  dnaOrFlag: boolean | MobbinDna | null,
): VerifyResult {
  if (!verify || verify.ok) return verify
  const nonAurora =
    typeof dnaOrFlag === 'boolean' ? dnaOrFlag : anchorAvoidsAurora(dnaOrFlag)
  if (!nonAurora) return verify

  const feedback = String(verify.feedback || '')
  if (!feedback) return verify

  const reasonsStr = feedback
    .replace(/^Quality audit:\s*/i, '')
    .replace(/^Revise [^:]*:\s*/i, '')

  const knownAuroraSuffixes = [
    /;\s*combine [^;]*blobs?/i,
    /;\s*combine [^;]*\b(violet|teal|amber|magenta|cyan|aurora)\b[^;]*/i,
  ]
  let normalised = reasonsStr
  for (const re of knownAuroraSuffixes) {
    normalised = normalised.replace(re, (m) => m.replace(';', ','))
  }
  const reasons = normalised
    .split(/\s*;\s*/)
    .map((r) => r.trim())
    .filter(Boolean)
  if (!reasons.length) return verify

  const keepRules = [
    /\bdata-reveal\b/i,
    /\bdata-magnet\b/i,
    /\bcontrast\b/i,
    /\btext-slate-500\b/i,
  ]
  const remaining = reasons.filter((r) => keepRules.some((re) => re.test(r)))
  if (!remaining.length) {
    return {
      ok: true,
      feedback: '',
      auroraRelaxed: true,
      originalFeedback: feedback,
    }
  }
  return {
    ok: false,
    feedback: feedback.startsWith('Quality audit:')
      ? `Quality audit: ${remaining.join('; ')}`
      : remaining.join('; '),
    auroraRelaxed: false,
    originalFeedback: feedback,
  }
}

/**
 * Score how well HTML inherited a single session anchor's DNA.
 *
 * Production analog of forge's scoreMobbinCoverage(html, data) — but takes a
 * resolved anchor instead of the multi-category byCategory data shape since
 * production picks ONE anchor per session.
 */
export function scoreMobbinCoverage(
  html: string,
  anchor: MobbinAnchor,
): CoverageResult {
  if (!html || !anchor) {
    return {
      palette: { hits: 0, total: 0, ratio: 0, hexHits: [] },
      doctrine: { hits: 0, total: 0, ratio: 0 },
    }
  }
  const text = html.toLowerCase()

  const accents = anchor.palette?.length
    ? anchor.palette
    : Array.isArray(anchor.dna?.accents)
      ? anchor.dna.accents
      : []
  const allHex = [...new Set(accents.filter((h) => /^#[0-9a-f]{6}$/i.test(h)))]
  const hexHits = allHex.filter((hex) => text.includes(hex.toLowerCase()))

  const markers: string[] = []
  const dna = anchor.dna
  if (dna) {
    if (dna.display)
      markers.push(
        ...(dna.display.toLowerCase().match(/[a-z][a-z0-9]+/g) || []),
      )
    if (dna.layout) {
      const m = dna.layout.toLowerCase().match(/[a-z][a-z0-9-]{4,}/g) || []
      markers.push(...m.slice(0, 6))
    }
  }
  const uniqMarkers = [...new Set(markers)].filter((m) => m.length > 4)
  const markerHits = uniqMarkers.filter((m) => text.includes(m))

  return {
    palette: {
      hits: hexHits.length,
      total: allHex.length,
      ratio: allHex.length ? hexHits.length / allHex.length : 0,
      hexHits,
    },
    doctrine: {
      hits: markerHits.length,
      total: uniqMarkers.length,
      ratio: uniqMarkers.length ? markerHits.length / uniqMarkers.length : 0,
    },
  }
}

/**
 * Detect verbatim borrowing of known anchor marketing copy in generated HTML.
 * Returns { count, matches[] } — info-only by default; production audit can
 * surface this as a soft warning.
 */
export function detectVerbatimAnchorCopy(html: string): VerbatimResult {
  if (!html) return { count: 0, matches: [] }
  const text = html.toLowerCase()
  const matches: VerbatimMatch[] = []
  for (const [app, cx] of Object.entries(COPY_EXAMPLES)) {
    if (cx.headlines) {
      for (const h of cx.headlines) {
        const words = h.split(/\s+/).length
        if (words < 3 || h.length < 14) continue
        if (text.includes(h.toLowerCase())) {
          matches.push({ app, location: 'headline', verbatim: h })
        }
      }
    }
    if (cx.subs) {
      for (const s of cx.subs) {
        const words = s.split(/\s+/).length
        if (words < 6) continue
        if (text.includes(s.toLowerCase())) {
          matches.push({ app, location: 'sub', verbatim: s.slice(0, 80) })
        }
      }
    }
    if (cx.products && cx.products.length >= 3) {
      const clusterHits = cx.products.filter((p) => {
        const word = p.toLowerCase()
        const re = new RegExp(
          `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
          'i',
        )
        return re.test(html)
      })
      if (clusterHits.length >= 3) {
        matches.push({
          app,
          location: 'product-noun-cluster',
          verbatim: clusterHits.join(' + '),
        })
      }
    }
  }
  return { count: matches.length, matches }
}
