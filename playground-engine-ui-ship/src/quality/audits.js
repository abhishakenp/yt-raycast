import { scoreKimiReadiness, scoreVisualRichness } from './kimi-score.js'
import { auditPublicationHomepage } from './publication-audit.js'
import { detectVisualSignature } from './variety-metrics.js'

export function validateFullWidthSections(html, { minSections = 6 } = {}) {
  const issues = []
  const sections = [...String(html ?? '').matchAll(/<section\b[^>]*>/gi)]
  if (sections.length < minSections) issues.push(`only ${sections.length} sections`)
  if (/<style\b/i.test(html) && !/kimi-ambient|data-reveal/.test(html)) issues.push('custom style block')
  if (/<svg\b/i.test(html)) issues.push('inline SVG')
  if (/<img\b/i.test(html)) issues.push('img tag')
  return { ok: issues.length === 0, issues, sectionCount: sections.length }
}

export function runDeterministicAudits(html, { plan, route, seed, brief } = {}) {
  const structure = validateFullWidthSections(html, {
    minSections: plan?.pageKind === 'app-shell' ? 4 : route?.siteHint === 'blog' ? 5 : 6,
  })
  const kimi = scoreKimiReadiness(html, { plan, route, brief })
  const richness = scoreVisualRichness(html, { plan })
  const signature = detectVisualSignature(html, { plan, route, seed })
  const publication = auditPublicationHomepage(html, { plan, route, brief })
  return {
    ok: structure.ok && kimi.ok && (publication.skipped || publication.ok),
    structure,
    kimi,
    richness,
    signature,
    publication,
  }
}
