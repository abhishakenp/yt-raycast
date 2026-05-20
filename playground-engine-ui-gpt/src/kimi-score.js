const BAD_SURFACE_TERMS = [
  'placeholder',
  'visual surface',
  'brand asset placeholder',
  'lorem ipsum',
  'coming soon',
]

const INTERNAL_TERMS = [
  'Mobbin DNA',
  'Signature moves:',
  'deterministic shell',
  'page genome',
]

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
  const dataImgs = [...source.matchAll(/<div\b[^>]*\bdata-img=["'][^"']*["'][^>]*>/gi)]
  const richKinds = [...source.matchAll(/\bdata-visual-kind=["']([^"']+)["']/gi)].map((match) => match[1])
  const artSurfaces = countMatches(source, /\bdata-visual=["']art-surface["']/gi)
  const uniqueKinds = new Set(richKinds)
  const hasHeroScale = /\b(?:min-h-\[7[0-9]vh\]|min-h-screen|text-7xl|text-8xl|text-\[clamp)/.test(source)
  const hasLayering = countMatches(source, /\babsolute\b/g) >= 8
  const hasDenseSurface = countMatches(source, /\bgrid\b/g) >= 8 || countMatches(source, /\btable\b/gi) >= 1
  const hasRealSpecificity = countMatches(text, /\b(?:\d+[%xk]?|\$[\d,.]+|[A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b/g) >= 8
  const badTerms = BAD_SURFACE_TERMS.filter((term) => lower.includes(term.toLowerCase()))
  const internalTerms = INTERNAL_TERMS.filter((term) => lower.includes(term.toLowerCase()))

  let score = 100
  if (sections < (plan?.pageKind === 'app-shell' ? 4 : 6)) {
    score -= 14
    issues.push('too few substantial sections')
  }
  if (dataImgs.length > 0 && artSurfaces < dataImgs.length) {
    score -= 12
    issues.push('some media blocks are not art-directed')
  }
  const needsMixedMediaKinds = route?.siteHint !== 'portfolio'
  if (needsMixedMediaKinds && dataImgs.length > 0 && uniqueKinds.size < Math.min(2, dataImgs.length)) {
    score -= 10
    issues.push('media surfaces do not vary enough')
  }
  if (!hasHeroScale) {
    score -= 10
    issues.push('first viewport lacks a decisive hero scale')
  }
  if (!hasLayering) {
    score -= 8
    issues.push('composition lacks layered visual craft')
  }
  if (!hasDenseSurface) {
    score -= 8
    issues.push('page lacks dense product/editorial surface detail')
  }
  if (!hasRealSpecificity) {
    score -= 8
    issues.push('copy lacks enough concrete names or numbers')
  }
  if (badTerms.length) {
    score -= 18
    issues.push(`unfinished surface terms leaked: ${badTerms.join(', ')}`)
  }
  if (internalTerms.length) {
    score -= 18
    issues.push(`engine terms leaked: ${internalTerms.join(', ')}`)
  }
  if (route?.siteHint === 'local-experience' && /api|kubernetes|dashboard|telemetry/i.test(text) && !/hotel|coffee|studio|class|room|menu/i.test(text)) {
    score -= 18
    issues.push('local-experience page drifted into software language')
  }

  const bounded = Math.max(0, Math.min(100, score))
  return {
    ok: bounded >= 76,
    score: bounded,
    issues,
    signals: {
      sections,
      dataImgCount: dataImgs.length,
      richVisualKinds: [...uniqueKinds],
      hasHeroScale,
      hasLayering,
      hasDenseSurface,
      hasRealSpecificity,
    },
  }
}
