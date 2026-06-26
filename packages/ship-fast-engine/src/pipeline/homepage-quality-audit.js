const stripTags = (html) =>
  String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

const stripScripts = (html) =>
  String(html || '').replace(/<script[\s\S]*?<\/script>/gi, '')

const NOVA_VISUAL_SITE_TYPES = new Set([
  'saas',
  'landing',
  'portfolio',
  'blog',
  'marketplace',
  'community',
])

const collectNovaVisualCraftIssues = (html, siteType) => {
  const st = String(siteType || '').toLowerCase()
  if (!NOVA_VISUAL_SITE_TYPES.has(st)) return []
  const s = String(html || '')
  const issues = []
  const markup = stripScripts(s)
  if (!/<canvas\b/i.test(s)) {
    issues.push(
      'Nova-tier marketing: add a <canvas> in the hero (particle/grid/constellation) animated with requestAnimationFrame, pointer-reactive like the public SaaS exemplar',
    )
  }
  if (!/(blur-3xl|blur-\[\d)/i.test(s)) {
    issues.push(
      'Nova-tier: stack multiple blurred gradient layers (blur-3xl or blur-[…px]) behind hero content',
    )
  }
  const radialN = (s.match(/radial-gradient/gi) || []).length
  if (radialN < 3) {
    issues.push(
      `Nova-tier: need >=3 radial-gradient stacks in aurora/mesh hero (have ${radialN}); combine violet/teal/amber blobs`,
    )
  }
  const reveals = (markup.match(/\bdata-reveal\b/gi) || []).length
  if (reveals < 4) {
    issues.push(
      `Nova-tier: need >=4 scroll-reveal blocks (data-reveal + IntersectionObserver); have ${reveals}`,
    )
  }
  const magnets = (markup.match(/\bdata-magnet\b/gi) || []).length
  if (magnets < 2) {
    issues.push(
      `Nova-tier: wire data-magnet on at least two primary CTAs with pointer parallax (have ${magnets})`,
    )
  }
  const hasKeyframeBlock = /keyframes\s*:\s*\{/.test(s)
  const hasLiquidMotion =
    /\banimation:\s*liquid\b|\[animation:\s*liquid\b|animate-liquid\b|keyframes[\s\S]{0,6000}\bliquid\b/i.test(
      s,
    ) ||
    (/animation:\s*\w+/i.test(markup) && hasKeyframeBlock)
  if (!hasLiquidMotion) {
    issues.push(
      'Nova-tier: theme.extend.keyframes + slow ambient motion (e.g. liquid drift) on hero mesh layers or gradient orbs; respect motion-reduce',
    )
  }
  const diagonal =
    /skew-(?:x-|y-)?(?:1|2|3|6|12)|-skew|rotate-(?:1|2|3|6)|clip-path|polygon\(|skewY|skewX/i.test(
      markup,
    ) || /keyframes[\s\S]{0,12000}transform[^}]*rotate/i.test(s)
  if (!diagonal) {
    issues.push(
      'Nova-tier: add diagonal energy — skew/rotate/clip-path on a band OR keyframed transform rotation on aurora/mesh layers',
    )
  }
  if (
    /<p[^>]*(?:text-lg|text-base|max-w-xl|max-w-lg|max-w-md|leading-relaxed)[^>]*\btext-slate-500\b/i.test(
      markup,
    )
  ) {
    issues.push(
      'contrast: do not use text-slate-500 on marketing paragraphs (text-lg/text-base); use text-slate-300 or text-slate-400 on dark surfaces',
    )
  }
  return issues
}

export const collectHomepageQualityIssues = (
  html,
  { siteType = '', prompt = '' } = {},
) => {
  const s = String(html || '')
  const issues = []
  const st = String(siteType || '').toLowerCase()
  if (st === 'game') return issues

  if (!/name=["']viewport["']/i.test(s))
    issues.push('missing viewport meta in head')

  const h1 = (s.match(/<h1\b/gi) || []).length
  if (h1 < 1) issues.push('missing <h1>')
  if (st !== 'dashboard' && st !== 'docs' && h1 > 2)
    issues.push('too many <h1> elements (want 1 primary)')
  if ((st === 'dashboard' || st === 'docs') && h1 > 24)
    issues.push('too many <h1> elements (cap for sanity)')

  if (!/(?:cdn\.tailwindcss\.com|\/scripts\/tailwind-browser\.js)/i.test(s))
    issues.push('missing Tailwind runtime (/scripts/tailwind-browser.js)')
  else if (
    !/tailwind\.config\s*=\s*\{[\s\S]*theme\s*:\s*\{[\s\S]*extend/i.test(s)
  )
    issues.push('tailwind.config missing theme.extend (colors/fonts/shadows)')

  const hashAnchors = (s.match(/href\s*=\s*["']#["']/gi) || []).length
  if (hashAnchors > 55)
    issues.push(
      `too many href="#" placeholders (${hashAnchors}); wire real anchors or omit`,
    )

  const inlineScripts =
    s.match(/<script(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/gi) || []
  const inlineLen = inlineScripts.join('').length
  if (inlineLen < 280)
    issues.push(
      'homepage needs a substantive inline <script> (vanilla JS for nav/pricing/FAQ/carousel)',
    )

  const btn = (s.match(/<button\b/gi) || []).length
  const minBtn = st === 'docs' ? 2 : 3
  const btnSiteTypes = [
    'saas',
    'landing',
    'portfolio',
    'blog',
    'marketplace',
    'community',
    'ecommerce',
    'docs',
    'institutional',
    'dashboard',
  ]
  if (btnSiteTypes.includes(st) && btn < minBtn)
    issues.push(`too few <button> elements (${btn}); add real CTAs`)

  const links = (s.match(/<a\s[^>]*href=/gi) || []).length
  const minLinks = st === 'dashboard' ? 2 : 8
  if (links < minLinks)
    issues.push(
      `too few navigational links (${links}); add dense header/footer routes`,
    )

  const low = stripTags(s)
  if (/\blorem ipsum\b/.test(low))
    issues.push('remove lorem ipsum placeholder copy')
  if (/\bplaceholder text\b/.test(low))
    issues.push('remove generic placeholder copy')

  const p = String(prompt || '').toLowerCase()
  if (/\b(ecommerce|store|shop|cart|retail)\b/.test(p) || st === 'ecommerce') {
    if (!/data-open-drawer|data-cart|cart-toggle|data-add\b/i.test(s))
      issues.push(
        'ecommerce: add cart or add-to-cart wiring (data-open-drawer, data-cart-*, or data-add)',
      )
  }

  issues.push(...collectNovaVisualCraftIssues(s, st))

  return issues
}
