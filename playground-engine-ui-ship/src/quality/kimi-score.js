const BAD_SURFACE_TERMS = ['placeholder', 'lorem ipsum', 'coming soon', 'brand asset placeholder']
const INTERNAL_TERMS = ['Mobbin DNA', 'Signature moves:', 'deterministic shell', 'page genome']
const SCHEMATIC_TERMS = ['feature composition', 'issue note', 'field quote', 'release card', 'case 2', 'case 3']

function visibleText(html) {
  return String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function navText(html) {
  const m = String(html ?? '').match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i)
  return m ? visibleText(m[1]) : ''
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
  const nav = navText(source)
  const lower = text.toLowerCase()
  const issues = []
  let penalty = 0

  const articleTags = countMatches(source, /<article\b/gi)
  const postMeta = countMatches(source, /\b(?:read (?:more|the (?:post|article|story|essay))|min read|posted on|published|byline|cover story|featured (?:post|essay|story)|issue no\.|from the archive|latest posts|recent posts)\b/gi)
  const hasPostGrid = countMatches(source, /\bgrid-cols-(?:2|3|4)\b/g) >= 1
    && (articleTags >= 2 || postMeta >= 3)
  const featuredPostOpener = /\b(?:cover story|featured (?:post|essay|story)|issue no\.|volume [ivx\d]+)\b/i.test(text)
    && /\b(?:min read|by [A-Z][a-z]+|read (?:the )?(?:post|story|essay))\b/i.test(text)
  const saasDrift =
    /\b(?:open.?source|github|repository|pull request|platform|dashboard|telemetry|api docs|explore the repo)\b/i.test(text) ||
    /\b(?:features|pricing|testimonials|docs)\b/i.test(nav)
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
  if (sections < (plan?.pageKind === 'app-shell' ? 4 : route?.siteHint === 'blog' ? 5 : 6)) {
    score -= route?.siteHint === 'blog' ? 10 : 16
    issues.push('too few substantial sections')
  }
  if (!hasTailwindConfig || !hasFontLink) {
    score -= 12
    issues.push('missing tailwind config or google fonts')
  }
  if (isPublicationBrief(brief, route)) {
    if (hasHeroScale) {
      score -= 14
      issues.push('blog home uses marketing hero viewport scale')
    }
  } else if (!hasHeroScale) {
    score -= 12
    issues.push('first viewport lacks decisive hero scale')
  }
  if (!hasRealSpecificity) {
    score -= 10
    issues.push('copy lacks concrete names or numbers')
  }
  if (artSurfaces > 2 && !isPublicationBrief(brief, route)) {
    score -= Math.min(28, 8 + artSurfaces * 3)
    issues.push('over-reliance on schematic art-surface blocks')
  }
  if (isPublicationBrief(brief, route)) {
    const photoCount = countMatches(source, /<img\b[^>]*\bsrc=["']https?:\/\//gi)
    const emptyThumbs = countMatches(source, /\bdata-visual=["']art-surface["']/gi)
    if (photoCount < 4 && emptyThumbs >= 3) {
      score -= 22
      issues.push('publication cards missing photo thumbnails (empty placeholder blocks)')
    } else if (photoCount >= 4) {
      score += Math.min(8, photoCount)
    }
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

  const publicationFit = scorePublicationFit(source, brief, route)
  if (publicationFit.penalty) {
    score -= publicationFit.penalty
    issues.push(...publicationFit.issues)
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
