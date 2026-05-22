import { countPublicationPhotos } from '../media/publication-hydration.js'
import { isPublicationRoute } from '../utils/publication-route.js'

function visibleText(html) {
  return String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function navText(html) {
  const m = String(html ?? '').match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i)
  return m ? visibleText(m[1]) : ''
}

/** Structural audit for blog/publication homepages — no per-brief hardcoding. */
export function auditPublicationHomepage(html, { brief, route, plan } = {}) {
  const source = String(html ?? '')
  const resolvedRoute = route || { siteHint: plan?.siteHint }
  const resolvedBrief = brief || plan?.brief || ''
  if (!isPublicationRoute(resolvedRoute, resolvedBrief)) {
    return { ok: true, skipped: true, issues: [], checks: {} }
  }

  const issues = []
  const text = visibleText(source)
  const nav = navText(source)

  const viewportHero =
    /\bmin-h-\[(?:6[0-9]|[7-9][0-9])vh\]/i.test(source) ||
    /\bmin-h-screen\b/i.test(source)
  const featuredBillboard =
    /<section\b[^>]*\bid=["']featured["'][^>]*\bclass=["'][^"']*\bflex\b[^"']*\bitems-center\b/i.test(source)
  const heroComment = /<!--[^>]*\bhero\b[^>]*-->/i.test(source)
  const heroSectionLabel = /<section\b[^>]*\bid=["']hero["']/i.test(source)
  const articleCount = (source.match(/<article\b/gi) || []).length
  const gridCols = (source.match(/\bgrid-cols-(?:2|3|4)\b/gi) || []).length
  const latestBand = /\bid=["']latest["']/i.test(source) || /\blatest posts\b/i.test(text)
  const readLinks = (source.match(/\bread (?:more|→|the (?:post|article|story|essay))/gi) || []).length
  const hasArchiveGrid = gridCols >= 1 && (articleCount >= 4 || readLinks >= 4)
  const photoCount = (source.match(/<img\b[^>]*\bsrc=["']https?:\/\//gi) || []).length
  const saasNav = /\b(?:features|pricing|testimonials|docs)\b/i.test(nav)
  const saasHeroCopy = /\b(?:open.?source|get started free|start free trial|request a demo|platform overview)\b/i.test(text)

  if (viewportHero) issues.push('viewport hero height (min-h-screen or min-h-[60vh+])')
  if (featuredBillboard) issues.push('featured section uses marketing hero centering (flex items-center)')
  if (heroComment) issues.push('HTML comment labels section as HERO')
  if (heroSectionLabel) issues.push('section id="hero" on publication home')
  if (!latestBand) issues.push('missing latest-posts band (id="latest" or "Latest posts" heading)')
  if (!hasArchiveGrid) issues.push('missing dense archive grid (grid-cols-* with 4+ article/read links)')
  if (photoCount < 4) issues.push(`too few photo thumbnails (${photoCount}, need 4+)`)
  if (saasNav) issues.push('SaaS marketing nav labels (Features/Pricing/Testimonials)')
  if (saasHeroCopy) issues.push('SaaS marketing copy drift')

  return {
    ok: issues.length === 0,
    skipped: false,
    issues,
    checks: {
      viewportHero,
      featuredBillboard,
      heroComment,
      heroSectionLabel,
      articleCount,
      gridCols,
      latestBand,
      hasArchiveGrid,
      readLinks,
      photoCount,
      pexelsPhotos: countPublicationPhotos(source),
    },
  }
}
