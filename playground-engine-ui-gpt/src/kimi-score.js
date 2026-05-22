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

function isPublicationBrief(brief, route) {
  const text = String(brief ?? '').toLowerCase()
  return route?.siteHint === 'blog' || (route?.siteHint === 'editorial' && /\bblog\b/.test(text))
}

function scorePublicationFit(html, brief, route) {
  if (!isPublicationBrief(brief, route)) return { penalty: 0, issues: [] }
  const source = String(html ?? '')
  const text = visibleText(source)
  const issues = []
  let penalty = 0

  const articleTags = countMatches(source, /<article\b/gi)
  const postMeta = countMatches(source, /\b(?:read (?:more|the (?:post|article|story|essay))|min read|posted on|published|byline|cover story|featured (?:post|essay|story)|issue no\.|from the archive|latest posts|recent posts)\b/gi)
  const hasPostGrid = countMatches(source, /\bgrid-cols-(?:2|3|4)\b/g) >= 1
    && (articleTags >= 2 || postMeta >= 3)
  const featuredPostOpener = /\b(?:cover story|featured (?:post|essay|story)|issue no\.|volume [ivx\d]+)\b/i.test(text)
    && /\b(?:min read|by [A-Z][a-z]+|read (?:the )?(?:post|story|essay))\b/i.test(text)
  const saasDrift = /\b(?:open.?source|github|repository|pull request|platform|dashboard|telemetry|api docs|features|testimonials|explore the repo)\b/i.test(text)
  const marketingHero = /\bmin-h-\[(?:7[0-9]|8[0-9])vh\]|min-h-screen\b/.test(source)
    && !hasPostGrid
    && !featuredPostOpener

  if (saasDrift) {
    penalty += 28
    issues.push('blog brief drifted into SaaS/platform language')
  }
  if (marketingHero) {
    penalty += 18
    issues.push('blog home uses generic marketing hero instead of featured post index')
  }
  if (!hasPostGrid && articleTags < 2 && postMeta < 3) {
    penalty += 10
    issues.push('blog home lacks a dense latest-posts grid')
  }
  if (!featuredPostOpener && !postMeta) {
    penalty += 8
    issues.push('blog home lacks publication/post metadata cues')
  }

  return { penalty, issues }
}

export function scoreKimiReadiness(html, { plan, route, brief } = {}) {
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
  if (sections < (plan?.pageKind === 'app-shell' ? 4 : route?.siteHint === 'blog' ? 5 : 6)) {
    score -= route?.siteHint === 'blog' ? 10 : 14
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
    score -= isPublicationBrief(brief, route) ? 4 : 10
    issues.push(isPublicationBrief(brief, route)
      ? 'publication opener lacks strong featured-post scale'
      : 'first viewport lacks a decisive hero scale')
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

  const publicationFit = scorePublicationFit(source, brief, route)
  if (publicationFit.penalty) {
    score -= publicationFit.penalty
    issues.push(...publicationFit.issues)
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
