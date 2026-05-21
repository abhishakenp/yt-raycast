const BAD_SURFACE_TERMS = ['placeholder', 'lorem ipsum', 'coming soon', 'brand asset placeholder']
const INTERNAL_TERMS = ['Mobbin DNA', 'Signature moves:', 'deterministic shell', 'page genome']
const SCHEMATIC_TERMS = ['feature composition', 'issue note', 'field quote', 'release card', 'case 2', 'case 3']

function visibleText(html) {
  return String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function countMatches(text, pattern) {
  return (String(text ?? '').match(pattern) || []).length
}

export function scoreKimiReadiness(html, { plan, route } = {}) {
  const source = String(html ?? '')
  const text = visibleText(source)
  const lower = text.toLowerCase()
  const issues = []

  const sections = countMatches(source, /<section\b/gi)
  const dataImgs = countMatches(source, /<div\b[^>]*\bdata-img=/gi)
  const artSurfaces = countMatches(source, /\bdata-visual=["']art-surface["']/gi)
  const blurOrbs = countMatches(source, /\bblur-3xl\b/gi)
  const rotations = countMatches(source, /-rotate-/gi)
  const schematicLabels = SCHEMATIC_TERMS.filter((t) => lower.includes(t))
  const hasHeroScale = /\b(?:min-h-\[7[0-9]vh\]|min-h-screen|text-7xl|text-8xl|text-\[clamp|text-5xl md:text-7xl)/.test(source)
  const hasTailwindConfig = /tailwind\.config/i.test(source)
  const hasFontLink = /fonts\.googleapis\.com/i.test(source)
  const hasRealSpecificity = countMatches(text, /\b(?:\d+[%xk]?|\$[\d,.]+|[A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b/g) >= 6
  const badTerms = BAD_SURFACE_TERMS.filter((t) => lower.includes(t.toLowerCase()))
  const internalTerms = INTERNAL_TERMS.filter((t) => lower.includes(t.toLowerCase()))

  let score = 100
  if (sections < (plan?.pageKind === 'app-shell' ? 4 : 6)) {
    score -= 16
    issues.push('too few substantial sections')
  }
  if (!hasTailwindConfig || !hasFontLink) {
    score -= 12
    issues.push('missing tailwind config or google fonts')
  }
  if (!hasHeroScale) {
    score -= 12
    issues.push('first viewport lacks decisive hero scale')
  }
  if (!hasRealSpecificity) {
    score -= 10
    issues.push('copy lacks concrete names or numbers')
  }
  if (artSurfaces > 2) {
    score -= Math.min(28, 8 + artSurfaces * 3)
    issues.push('over-reliance on schematic art-surface blocks')
  }
  if (blurOrbs > 6) {
    score -= Math.min(20, blurOrbs * 2)
    issues.push('too many decorative blur orbs (template noise)')
  }
  if (rotations > 2) {
    score -= 12
    issues.push('rotated/overlapping layout (breaks on scroll)')
  }
  if (schematicLabels.length >= 2) {
    score -= 16
    issues.push(`schematic labels visible: ${schematicLabels.slice(0, 3).join(', ')}`)
  }
  if (badTerms.length) {
    score -= 20
    issues.push(`unfinished terms: ${badTerms.join(', ')}`)
  }
  if (internalTerms.length) {
    score -= 20
    issues.push(`engine terms leaked: ${internalTerms.join(', ')}`)
  }
  if (dataImgs > 0 && dataImgs < 2 && sections >= 6) {
    score -= 6
    issues.push('thin visual storytelling')
  }

  const bounded = Math.max(0, Math.min(100, score))
  return {
    ok: bounded >= 72,
    score: bounded,
    issues,
    signals: {
      sections,
      dataImgCount: dataImgs,
      artSurfaces,
      blurOrbs,
      rotations,
      hasHeroScale,
      hasTailwindConfig,
      hasFontLink,
      hasRealSpecificity,
    },
  }
}

export function scoreVisualRichness(html, { plan } = {}) {
  const source = String(html ?? '')
  const sections = (source.match(/<section\b/gi) || []).length
  const typography = (source.match(/\btext-(?:5xl|6xl|7xl|8xl)/g) || []).length
  const spacing = (source.match(/\bpy-(?:16|20|24|32)\b/g) || []).length
  let score = Math.min(100, sections * 8 + typography * 6 + spacing * 4)
  if (plan?.reference) score += 6
  return { score: Math.min(100, score), sections, typography, spacing }
}
