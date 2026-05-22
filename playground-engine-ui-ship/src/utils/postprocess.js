import { hydratePublicationImages } from '../media/publication-hydration.js'
import { inferVisualKind, renderArtDirectedImageSurface } from '../media/content-imagery.js'
import { isPublicationRoute } from './publication-route.js'
import { stripOrphanCloseBurst } from './seam-repair.js'

const REFUSAL = /\b(i'?m sorry|i can(?:'|no)t (?:fulfill|help|assist|comply|create)|as an ai|unable to (?:fulfill|comply))/i

export function repairAttrs(html) {
  return String(html || '').replace(/\bclass\s+[A-Za-z][\w-]*\s*=/g, 'class=')
}

export function repairMalformedSectionTags(html) {
  let out = String(html ?? '')
  out = out.replace(/(<[^>]*\bclass=["'])([^"']*)(["'][^>]*)\bclass=["'][^"']*["']/gi, '$1$2$3')
  while (/<section(?=<section)/i.test(out)) {
    out = out.replace(/<section(?=<section)/gi, '')
  }
  return out
}

/** Groq sometimes emits data-img + class then a raw https URL instead of a closed tag. */
export function repairMalformedMediaDivs(html) {
  return String(html ?? '')
    .replace(
      /<div\s+data-img\s+class="([^"]*)"\s*(https?:\/\/[^\s>]+)[^>]*>/gi,
      '<div data-img="work tile" class="relative w-full aspect-[4/3] rounded-xl overflow-hidden">',
    )
    .replace(
      /<div\s+data-img\s+class="([^"]*)"\s*style="[^"]*url\([^)]+\)[^"]*"[^>]*>/gi,
      '<div data-img="work tile" class="relative w-full aspect-[4/3] rounded-xl overflow-hidden">',
    )
}

/** @deprecated use closeTopSegmentSafely from seam-repair.js */
export function balanceTopDivs(topHtml) {
  const opens = (topHtml.match(/<div\b/gi) || []).length
  const closes = (topHtml.match(/<\/div>/gi) || []).length
  const deficit = Math.min(8, Math.max(0, opens - closes))
  return deficit > 0 ? topHtml + '\n' + '</div>'.repeat(deficit) : topHtml
}

export function stripFences(value) {
  return String(value ?? '')
    .replace(/^```(?:html|json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
}

export function stripRefusal(value) {
  return String(value ?? '')
    .replace(/^[^<]*?(i'?m sorry[^<]*)/i, '')
    .replace(/(i'?m sorry[^<]*)$/i, '')
    .trim()
}

export function forceCloseHtml(value) {
  let html = String(value ?? '').trim()
  if (!/^<!DOCTYPE html>/i.test(html)) html = `<!DOCTYPE html>\n${html}`
  if (!/<\/body>/i.test(html)) html += '\n</body>'
  if (!/<\/html>/i.test(html)) html += '\n</html>'
  return html
}

const VERBATIM_REWRITES = new Map([
  ['Move work forward', 'Turn plans into shipped work'],
  ['Accept payments online', 'Start taking payments today'],
  ['Develop. Preview. Ship.', 'Draft, preview, and release'],
  ['The AI code editor', 'A sharper workspace for builders'],
  ['Your AI everything app', 'One workspace for assisted work'],
  ['Nothing great is made alone', 'Great work needs a shared canvas'],
  ['The complete developer platform', 'A connected platform for builders'],
  ['Async video for work', 'Recorded context for busy teams'],
  ['The Data Intelligence Platform', 'A unified home for operational data'],
  ['Banking engineered for the ambitious', 'Financial tools for serious operators'],
  ['How developers build successful products', 'How product teams find better signals'],
  ['Dev Mode', 'Handoff Studio'],
  ['FigJam', 'Workshop Board'],
  ['Slides', 'Pitch Systems'],
  ['Cycles', 'Loops'],
  ['Triage', 'Signal Desk'],
  ['Initiatives', 'Roadlines'],
  ['Connect', 'Relay'],
  ['Atlas', 'Launchpad'],
  ['Radar', 'Risk Lens'],
  ['Workers', 'Edge Tasks'],
  ['R2', 'Object Vault'],
  ['D1', 'Data Cells'],
])

export function rewriteKnownVerbatimCopy(value) {
  let html = String(value ?? '')
  for (const [needle, replacement] of VERBATIM_REWRITES) {
    html = html.replaceAll(needle, replacement)
  }
  return html
}

export function rewriteInternalCopyLeaks(value) {
  return String(value ?? '')
    .replace(/\bProof point\s+\d+\b/gi, 'Product detail')
    .replace(/\bNamed proof\b/gi, 'Measured proof')
    .replace(/\bplaceholder filler\b/gi, 'thin copy')
    .replace(/\bSignature moves:\s*/gi, 'Operating notes: ')
    .replace(/\bMobbin DNA routed into a deterministic shell\.[^<]*/gi, 'The highest-priority signals open in a single inspectable workspace.')
    .replace(/\bdeterministic shell\b/gi, 'operating workspace')
}

export function rewriteAnchorAccentLeaks(value, plan, route) {
  const text = String(plan?.brief || '').toLowerCase()
  let html = String(value ?? '')
  if (route?.primary?.app === 'Airbnb' && /hotel|room|suite|coast|guest|spa/.test(text)) {
    const accent = plan?.visualWorld?.accent || '#0f766e'
    const accent2 = plan?.visualWorld?.accent2 || '#b45309'
    html = html
      .replace(/#(?:FF385C|ff385c|E61E4D|e61e4d|FD5B61|fd5b61)/g, accent)
      .replace(/#(?:FFB400|ffb400)/g, accent2)
  }
  if (route?.siteHint === 'agency' || (route?.primary?.app === 'Figma' && /\b(agency|creative studio|design agency)\b/.test(text))) {
    html = html
      .replace(/\bbg-\[#0acf83\]/gi, 'bg-[#f6f1e9]')
      .replace(/\b(from|via|to)-\[#0acf83\]/gi, '$1-[#f6f1e9]')
      .replace(/\btext-\[#0acf83\]/gi, 'text-[#0f766e]')
      .replace(/\bborder-\[#0acf83\]/gi, 'border-[#0f766e]')
      .replace(/\bbg-\[#f24e1e\]/gi, 'bg-[#17211f]')
      .replace(/\b(from|via|to)-\[#f24e1e\]/gi, '$1-[#17211f]')
      .replace(/\btext-\[#f24e1e\]/gi, 'text-[#b45309]')
      .replace(/\bborder-\[#f24e1e\]/gi, 'border-[#b45309]')
      .replace(/\bbg-\[#1abcfe\]/gi, 'bg-[#e0f2fe]')
      .replace(/\b(from|via|to)-\[#1abcfe\]/gi, '$1-[#e0f2fe]')
      .replace(/\btext-\[#1abcfe\]/gi, 'text-[#0369a1]')
      .replace(/\bborder-\[#1abcfe\]/gi, 'border-[#0369a1]')
      .replace(/\bbg-\[#a259ff\]/gi, 'bg-[#6d28d9]')
      .replace(/\b(from|via|to)-\[#a259ff\]/gi, '$1-[#6d28d9]')
      .replace(/\btext-\[#a259ff\]/gi, 'text-[#6d28d9]')
      .replace(/\bborder-\[#a259ff\]/gi, 'border-[#6d28d9]')
  }
  return html
}

export function compressExcessiveSpacing(value) {
  return String(value ?? '')
    .replace(/\bpy-48\b/g, 'py-24')
    .replace(/\bpt-48\b/g, 'pt-24')
    .replace(/\bpb-48\b/g, 'pb-24')
    .replace(/\bmt-48\b/g, 'mt-24')
    .replace(/\bmb-48\b/g, 'mb-24')
    .replace(/\bpy-40\b/g, 'py-24')
    .replace(/\bpt-40\b/g, 'pt-20')
    .replace(/\bpb-40\b/g, 'pb-20')
    .replace(/\bmt-40\b/g, 'mt-20')
    .replace(/\bmb-40\b/g, 'mb-20')
}

export function replaceInlineMedia(value, { publication = false } = {}) {
  let html = String(value ?? '')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, '<i data-lucide="sparkles" class="h-5 w-5"></i>')
  if (publication) {
    return html.replace(/<img\b(?![^>]*\bsrc=["']https?:\/\/)[^>]*>/gi, '<div data-img="editorial cover" class="w-full aspect-[16/10] rounded-xl bg-gradient-to-br from-[#111827] via-[#374151] to-[#8b5cf6]"></div>')
  }
  return html.replace(/<img\b[^>]*>/gi, '<div data-img="brand asset" class="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-[#111827] via-[#374151] to-[#8b5cf6]"></div>')
}

function findMatchingDivEnd(html, openEnd) {
  const token = /<\/?div\b[^>]*>/gi
  token.lastIndex = openEnd
  let depth = 1
  let match
  while ((match = token.exec(html))) {
    if (/^<div\b/i.test(match[0])) depth += 1
    else depth -= 1
    if (depth === 0) return token.lastIndex
  }
  return -1
}

function openingSectionCount(html, index) {
  return (String(html).slice(0, index).match(/<section\b/gi) || []).length
}

export function stripFigmaPersonaLeaks(html, route) {
  if (route?.siteHint !== 'portfolio') return String(html ?? '')
  return String(html ?? '').replace(
    /<section\b[^>]*>[\s\S]*?<h3[^>]*>\s*Designers\s*<\/h3>[\s\S]*?<h3[^>]*>\s*Product Managers\s*<\/h3>[\s\S]*?<\/section>/gi,
    '',
  )
}

export function beautifyImagePlaceholders(value, plan, route, brief) {
  if (isPublicationRoute(route, brief || plan?.brief)) return String(value ?? '')
  const html = String(value ?? '')
  const open = /<div\b([^>]*\bdata-img=["']([^"']*)["'][^>]*)>/gi
  let out = ''
  let cursor = 0
  let index = 0
  let match
  while ((match = open.exec(html))) {
    const [tag, attrs, subject] = match
    const start = match.index
    if (/\bdata-visual=["']art-surface["']/i.test(attrs)) continue
    const end = findMatchingDivEnd(html, open.lastIndex)
    if (end > open.lastIndex && /data-visual=["']art-surface["']/i.test(html.slice(open.lastIndex, end))) continue
    if (end === -1) continue
    const className = attrs.match(/\bclass=["']([^"']*)["']/i)?.[1] || ''
    const heroCompact = openingSectionCount(html, start) <= 1
    out += html.slice(cursor, start)
    out += renderArtDirectedImageSurface(subject, className, plan, index++, route, { heroCompact })
    cursor = end
    open.lastIndex = end
  }
  return out + html.slice(cursor)
}

export function annotateDataImgSurfaces(value, plan, route) {
  return String(value ?? '').replace(/<div\b([^>]*\bdata-img=["']([^"']*)["'][^>]*)>/gi, (full, attrs, subject) => {
    if (/\bdata-visual=["']art-surface["']/i.test(attrs)) return full
    const kind = inferVisualKind(subject, { plan, route })
    return `<div${attrs} data-visual="art-surface" data-visual-kind="${kind}">`
  })
}

export function ensureHeroScale(value, plan, route, brief) {
  if (plan?.pageKind === 'app-shell') return String(value ?? '')
  if (isPublicationRoute(route, brief || plan?.brief)) return String(value ?? '')
  let changedSection = false
  let changedH1 = false
  return String(value ?? '')
    .replace(/<section\b([^>]*\bclass=["'])([^"']*)(["'][^>]*)>/i, (full, before, cls, after) => {
      if (changedSection || /\b(?:min-h-\[|min-h-screen)\b/.test(cls)) return full
      changedSection = true
      return `<section${before}${cls} min-h-[76vh] flex items-center${after}>`
    })
    .replace(/<h1\b([^>]*\bclass=["'])([^"']*)(["'][^>]*)>/i, (full, before, cls, after) => {
      if (changedH1 || /\b(?:text-7xl|text-8xl|text-\[clamp)\b/.test(cls)) return full
      changedH1 = true
      return `<h1${before}${cls} text-5xl md:text-7xl${after}>`
    })
}

export function wrapCodeBlocks(value) {
  return String(value ?? '')
    .replace(/<pre\b([^>]*)class=["']([^"']*)["']([^>]*)>/gi, (full, before, cls, after) => {
      const additions = ['whitespace-pre-wrap', 'break-words'].filter((token) => !cls.includes(token)).join(' ')
      return `<pre${before}class="${cls}${additions ? ` ${additions}` : ''}"${after}>`
    })
    .replace(/<pre\b((?:(?!class=)[^>])*)>/gi, '<pre$1 class="whitespace-pre-wrap break-words">')
}

export function ensureSectionScrollMargin(html) {
  return String(html ?? '').replace(/<section class="([^"]*)"/gi, (full, cls) => {
    if (/scroll-mt-/.test(cls)) return full
    return `<section class="${cls} scroll-mt-24"`
  })
}

export function ensureLucidePreview(html) {
  let h = String(html ?? '')
  h = h.replace(/<script[^>]*lucide[^>]*>[\s\S]*?<\/script>\s*/gi, '')
  const labelCss = process.env.KIMI_PREVIEW_LABELS === '1'
    ? `[data-img]::after{content:attr(data-img);position:absolute;inset:auto 0 0 0;padding:.35rem .5rem;font:600 .65rem/1.2 ui-sans-serif,sans-serif;color:#64748b;background:rgba(255,255,255,.75)}`
    : ''
  const inject = `<script src="https://unpkg.com/lucide@latest"></script>
<style>
[data-reveal],.opacity-0,[class*="reveal"],[class*="fade"]{opacity:1!important;transform:none!important;visibility:visible!important}
[data-img]{position:relative;min-height:6rem;border:1px solid rgba(148,163,184,.28);background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(15,23,42,.06))}
${labelCss}
</style>
<script>window.addEventListener('load',()=>{try{lucide.createIcons()}catch(e){}})</script>`
  if (/unpkg\.com\/lucide/.test(h) && /\[data-img\]\{/.test(h)) return h
  return /<\/body>/i.test(h) ? h.replace(/<\/body>/i, `${inject}\n</body>`) : `${h}\n${inject}`
}

function stripRogueScripts(html) {
  return String(html ?? '').replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (full, attrs, body) => {
    if (/cdn\.tailwindcss\.com|tailwindcss/i.test(attrs)) return full
    if (/tailwind\s*\.\s*config|tailwind\s*=\s*\{/i.test(body)) return full
    if (/lucide\.createIcons/i.test(body)) return full
    return ''
  })
}

function stripModelStyleBlocks(html) {
  return String(html ?? '').replace(/<style\b(?![^>]*\bid=["']kimi-ambient["'])[^>]*>[\s\S]*?<\/style>/gi, '')
}

export function looksLikeBadLeg(value) {
  const html = stripFences(value)
  const blocks = (html.match(/<(section|div|main|header|article|nav|table|ul)\b/gi) || []).length
  return !html || html.length < 300 || (REFUSAL.test(html) && blocks === 0)
}

const USE_ART_SURFACES = process.env.KIMI_ART_SURFACES === '1'

function isPublicationBrief(brief, route) {
  return isPublicationRoute(route, brief)
}

function publicationTopicLabel(brief) {
  const text = String(brief ?? '').trim()
  if (!text) return 'the topic'
  const cleaned = text
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/\b(blog|newsletter|homepage|website|site|about|for)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const chunk = cleaned.split(/[—–,-]/)[0]?.trim() || cleaned
  const words = chunk.split(/\s+/).filter(Boolean).slice(0, 4)
  return words.join(' ') || 'the topic'
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function decodeBasicEntities(value) {
  return String(value ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
}

function toTitle(value) {
  return String(value ?? '')
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim()
}

function singularizeTopic(value) {
  return String(value ?? '')
    .replace(/\bdogs\b/gi, 'dog')
    .replace(/\bcats\b/gi, 'cat')
    .replace(/\bpets\b/gi, 'pet')
    .replace(/\bpuppies\b/gi, 'puppy')
    .replace(/\bstories\b/gi, 'story')
    .replace(/\bguides\b/gi, 'guide')
    .replace(/\breviews\b/gi, 'review')
    .replace(/\btips\b/gi, 'tips')
    .replace(/\b([a-z]{4,})s\b/gi, '$1')
}

function readableList(items) {
  const values = items.filter(Boolean)
  if (values.length <= 1) return values[0] || ''
  if (values.length === 2) return `${values[0]} and ${values[1]}`
  return `${values.slice(0, -1).join(', ')}, and ${values.at(-1)}`
}

function extractPublicationIdentity(brief) {
  const raw = String(brief ?? '').replace(/\s+/g, ' ').trim()
  const lower = raw.toLowerCase()
  const afterAbout = raw.match(/\b(?:about|for|covering)\s+([^—–.;]+)/i)?.[1] || raw
  const subjectChunk = afterAbout
    .split(/\b(?:training tips|breed guides|adoption stories|product reviews|reviews|tips|guides|stories)\b/i)[0]
    .replace(/\b(?:a|an|the|blog|newsletter|homepage|website|site|publication|journal|magazine|home|for|about|and)\b/gi, ' ')
    .replace(/[—–,.;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const audience =
    raw.match(/\bfor\s+([^—–.;]+)[.;]?$/i)?.[1]?.trim().replace(/\.$/, '') ||
    (subjectChunk ? `${singularizeTopic(subjectChunk)} readers` : 'curious readers')
  const subject = singularizeTopic(subjectChunk || audience.replace(/\b(readers|owners|fans|teams|operators)\b/gi, '')).trim()
  const subjectTitle = toTitle(subject || 'Field')
  const audienceTitle = toTitle(audience)

  const topicRules = [
    ['training', 'Training tips'],
    ['breed', 'Breed guides'],
    ['adoption', 'Adoption stories'],
    ['review', 'Product reviews'],
    ['gear', 'Gear reviews'],
    ['health', 'Health'],
    ['groom', 'Grooming'],
    ['policy', 'Policy'],
    ['infrastructure', 'Infrastructure'],
    ['interview', 'Interviews'],
    ['essay', 'Essays'],
  ]
  const topics = []
  for (const [needle, label] of topicRules) {
    if (lower.includes(needle) && !topics.includes(label)) topics.push(label)
  }
  if (!topics.length) {
    const afterDash = raw.split(/[—–:]/)[1] || raw
    for (const part of afterDash.split(/,|\band\b/i)) {
      const cleaned = part
        .replace(/\b(?:and|for|with|about|owners|readers)\b/gi, ' ')
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (cleaned.length > 3) topics.push(toTitle(cleaned).slice(0, 28))
      if (topics.length >= 4) break
    }
  }
  while (topics.length < 4) {
    for (const fallback of ['Field notes', 'Guides', 'Reviews', 'Stories']) {
      if (!topics.includes(fallback)) topics.push(fallback)
      if (topics.length >= 4) break
    }
  }

  const core = subjectTitle.replace(/\bDog Owners?\b/i, 'Dog Owner')
  const brand = /\bowners?\b/i.test(audience)
    ? `The ${singularizeTopic(audienceTitle).replace(/\bOwner$/i, "Owner's")} Field Guide`
    : `The ${core} Field Guide`
  const scope = readableList(topics.slice(0, 4).map((t) => t.toLowerCase()))
  const h1 = `${toTitle(scope.charAt(0))}${scope.slice(1)} for ${audience.toLowerCase()}`
  const deck = `A practical publication for ${audience.toLowerCase()}, with reported advice, clear comparisons, and field-tested recommendations.`

  return {
    brand: brand.replace(/\s+/g, ' '),
    h1,
    deck,
    topics: topics.slice(0, 5),
  }
}

function extractExistingPublicationBrand(html) {
  const source = String(html ?? '')
  const candidates = [
    source.match(/<a[^>]*class="[^"]*(?:logo|brand|font-bold|font-heading)[^"]*"[^>]*>([^<]{2,80})</i)?.[1],
    source.match(/<p[^>]*class="[^"]*tracking-\[[^\]]+\][^"]*"[^>]*>([^<]{2,80})</i)?.[1],
  ]
  const brand = decodeBasicEntities(candidates.find(Boolean)?.replace(/\s+/g, ' ').trim() || '')
  if (!brand) return ''
  if (/^(dog blog|pet blog|the blog|my blog|blog home|homepage|untitled)$/i.test(brand)) return ''
  if (/\b(?:home|archive|about|subscribe|latest|featured)\b/i.test(brand)) return ''
  return brand
}

function normalizeLatestPostsBand(html) {
  let out = String(html ?? '')
  out = out.replace(
    /<section\b(?![^>]*\bid=)([^>]*)>([\s\S]*?)<\/section>/gi,
    (full, attrs, body) => {
      if (!/<h2[^>]*>\s*Latest\s+(?:Articles|Stories|Reads|Guides|Posts)\s*<\/h2>/i.test(body)) return full
      if (!/<article\b/i.test(body)) return full
      return `<section id="latest"${attrs}>${body}</section>`
    },
  )
  out = out.replace(/>\s*Latest\s+(?:Articles|Stories|Reads|Guides)\s*</i, '>Latest posts<')
  return out
}

function hasScopedPublicationMasthead(html, identity) {
  const h1 = String(html ?? '').match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || ''
  const text = h1.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase()
  const hits = identity.topics.filter((topic) => text.includes(topic.split(/\s+/)[0].toLowerCase())).length
  return hits >= 2 && text.length > 20
}

export function polishPublicationIdentity(html, plan, route, brief) {
  if (!isPublicationBrief(brief || plan?.brief, route)) return html
  const identity = extractPublicationIdentity(brief || plan?.brief)
  let out = String(html ?? '')
  const a = plan?.visualWorld || {
    bg: '#faf7f2',
    surface: '#ffffff',
    text: '#1c1917',
    muted: '#78716c',
    accent: '#b45309',
    accent2: '#0369a1',
  }
  const existingBrand = extractExistingPublicationBrand(out)
  if (existingBrand) identity.brand = existingBrand

  out = out.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(identity.brand)} - ${escapeHtml(readableList(identity.topics.slice(0, 4)))}</title>`)
  out = out
    .replace(/>\s*(?:Dog Blog|Pet Blog|The Blog|Blog Home)\s*</gi, `>${escapeHtml(identity.brand)}<`)
    .replace(/\b(?:Dog Blog|Pet Blog|The Blog|Blog Home)\b/gi, identity.brand)
    .replace(/\bAbout\s+(?:Dog Blog|Pet Blog|The Blog|Blog Home)\b/gi, `About ${identity.brand}`)
    .replace(/\b©\s*(\d{4})\s+(?:Dog Blog|Pet Blog|The Blog|Blog Home)\b/gi, `© $1 ${identity.brand}`)

  const navLinks = identity.topics
    .slice(0, 4)
    .map((topic) => `<a href="#" class="hover:text-[${a.accent}]">${escapeHtml(topic)}</a>`)
    .join('\n        ')
  out = out.replace(/<nav\b([^>]*)>[\s\S]*?<\/nav>/i, `<nav$1>
        ${navLinks}
        <a href="#" class="hover:text-[${a.accent}]">Subscribe</a>
      </nav>`)

  if (!hasScopedPublicationMasthead(out, identity)) {
    const masthead = `<section id="masthead" class="w-full bg-[${a.surface}] py-10 border-y border-[${a.muted}]/20 scroll-mt-24">
  <div class="mx-auto max-w-7xl px-6">
    <p class="text-xs uppercase tracking-[0.24em] text-[${a.accent}]">${escapeHtml(identity.brand)}</p>
    <h1 class="mt-3 max-w-5xl font-display text-4xl md:text-6xl font-semibold leading-tight text-[${a.text}]">${escapeHtml(identity.h1)}</h1>
    <p class="mt-4 max-w-3xl text-base md:text-lg leading-7 text-[${a.muted}]">${escapeHtml(identity.deck)}</p>
  </div>
</section>`
    if (/<\/nav>/i.test(out)) {
      const navSection = out.match(/<section\b[\s\S]*?<\/section>/i)?.[0]
      if (navSection && /<nav\b/i.test(navSection)) {
        out = out.replace(navSection, `${navSection}\n${masthead}`)
      } else {
        out = out.replace(/<\/nav>/i, `</nav>\n${masthead}`)
      }
    } else {
      out = out.replace(/<body([^>]*)>/i, `<body$1>\n${masthead}`)
    }
  }

  return normalizeLatestPostsBand(out)
}

/** Strip marketing-hero viewport treatment from blog/publication homes (article index, not landing page). */
export function normalizePublicationLayout(html, plan, route, brief) {
  if (!isPublicationBrief(brief || plan?.brief, route)) return html
  let out = String(html ?? '')
  out = out.replace(/\bmin-h-\[(?:6[0-9]|[7-9][0-9])vh\]/gi, '')
  out = out.replace(/\bmin-h-screen\b/g, 'min-h-0')
  out = out.replace(
    /(<section\b[^>]*\bid=["']featured["'][^>]*\bclass=["'])([^"']*)(["'])/i,
    (_full, before, cls, after) => {
      const next = cls
        .replace(/\bflex\b/g, '')
        .replace(/\bitems-center\b/g, '')
        .replace(/\bjustify-center\b/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      return `${before}${next}${after}`
    },
  )
  out = out.replace(
    /(<section\b[^>]*\bid=["']featured["'][\s\S]*?<h1\b[^>]*\bclass=["'])([^"']*)(["'])/i,
    (_full, before, cls, after) => {
      const next = cls
        .replace(/\btext-7xl\b/g, 'text-4xl')
        .replace(/\btext-8xl\b/g, 'text-5xl')
        .replace(/\btext-5xl md:text-7xl\b/g, 'text-3xl md:text-5xl')
        .replace(/\btext-6xl\b/g, 'text-4xl')
        .replace(/\s+/g, ' ')
        .trim()
      return `${before}${next}${after}`
    },
  )
  out = out.replace(/<!--\s*[^>]*\bHERO\b[^>]*-->/gi, '<!-- featured post -->')
  return out
}

function blogHasPostGrid(html) {
  const source = String(html ?? '')
  const articleTags = (source.match(/<article\b/gi) || []).length
  const gridCols = (source.match(/\bgrid-cols-(?:2|3|4)\b/gi) || []).length
  if (articleTags >= 2 && gridCols >= 1) return true
  const readLinks = (source.match(/\bread (?:more|→|the (?:post|article|story))/gi) || []).length
  return gridCols >= 1 && readLinks >= 3
}

function publicationPostStubs(brief) {
  const topic = publicationTopicLabel(brief)
  const labels = ['Guide', 'Story', 'Notes', 'Review', 'Field report', 'Archive']
  return labels.map((label) => [
    `${label}: ${topic}`,
    `A reader-focused piece on ${topic} with concrete details and a clear takeaway.`,
    `${topic} ${label.toLowerCase()} cover`,
    label,
  ])
}

/** Inject latest-posts grid when hybrid stitch dropped the archive band (blog publication index contract). */
export function ensureBlogPublicationIndex(html, plan, route, brief) {
  if (!isPublicationBrief(brief || plan?.brief, route)) return html
  if (blogHasPostGrid(html)) return html
  const a = plan.visualWorld
  const cards = publicationPostStubs(brief)
    .map(
      ([title, excerpt, imgSubject, category]) => `<article class="rounded-xl border border-[${a.muted}]/30 overflow-hidden bg-[${a.surface}] hover:shadow-lg transition-shadow">
        <div class="img w-full h-48 bg-cover bg-center rounded-none"></div>
        <div class="p-4">
          <span class="text-xs uppercase tracking-wider text-[${a.accent}] font-semibold">${category}</span>
          <h3 class="mt-2 text-xl font-semibold text-[${a.text}]">${title}</h3>
          <p class="mt-2 text-sm text-[${a.muted}]">${excerpt}</p>
          <a href="#" class="mt-4 inline-flex items-center text-sm font-medium text-[${a.accent}] hover:underline">Read more →</a>
        </div>
      </article>`,
    )
    .join('\n')
  const section = `<section id="latest" class="w-full bg-[${a.surface}] py-16 scroll-mt-24">
  <div class="mx-auto max-w-7xl px-6">
    <h2 class="font-display text-3xl md:text-4xl font-bold text-[${a.text}] mb-8">Latest posts</h2>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">${cards}</div>
  </div>
</section>`
  if (/<footer\b/i.test(html)) return html.replace(/<footer\b/i, `${section}\n<footer`)
  return html.replace(/<\/body>/i, `${section}\n</body>`)
}

export function sanitizeHtml(value, plan, route, brief) {
  const resolvedBrief = brief || plan?.brief
  const publication = isPublicationRoute(route, resolvedBrief)
  let html = forceCloseHtml(stripRefusal(stripFences(value)))
  html = repairMalformedSectionTags(html)
  html = repairAttrs(html)
  html = rewriteKnownVerbatimCopy(html)
  html = rewriteInternalCopyLeaks(html)
  html = rewriteAnchorAccentLeaks(html, plan, route)
  html = stripFigmaPersonaLeaks(html, route)
  html = repairMalformedMediaDivs(html)
  html = replaceInlineMedia(html, { publication })
  if (USE_ART_SURFACES && !publication) {
    html = beautifyImagePlaceholders(html, plan, route, resolvedBrief)
    html = annotateDataImgSurfaces(html, plan, route)
  }
  html = wrapCodeBlocks(html)
  html = compressExcessiveSpacing(html)
  html = ensureHeroScale(html, plan, route, resolvedBrief)
  html = normalizePublicationLayout(html, plan, route, resolvedBrief)
  if (publication) {
    html = polishPublicationIdentity(html, plan, route, resolvedBrief)
    html = hydratePublicationImages(html, resolvedBrief)
  }
  html = ensureSectionScrollMargin(html)
  html = stripModelStyleBlocks(html)
  html = stripRogueScripts(html)
  html = ensureLucidePreview(html)
  html = stripOrphanCloseBurst(html)
  return html
}

function fallbackBand(plan, route, index, current) {
  let hint = route?.siteHint || plan?.archetype || 'homepage'
  const brief = String(plan?.brief || '').toLowerCase()
  if (hint === 'local-experience') {
    if (/hotel|room|suite|coast|guest|spa/.test(brief)) hint = 'hotel'
    else if (/fitness|training|class|trainer|workout/.test(brief)) hint = 'fitness'
    else hint = 'restaurant'
  }
  if (hint === 'commerce') {
    hint = /skin|beauty|oil|makeup|cosmetic/.test(brief) ? 'ecommerce' : 'ecommerce'
  }
  const library = {
    saas: [
      ['Operational Proof', 'Benchmarks, integration details, and buyer-ready numbers sit close to the product surface.'],
      ['Release Flow', 'The page shows how a team moves from first signal to confident rollout.'],
      ['Buying Path', 'Pricing, trust markers, and next action stay visible without breaking the visual rhythm.'],
    ],
    ecommerce: [
      ['Ingredient Logic', 'The products get texture, sourcing, and usage context instead of a flat catalog grid.'],
      ['Routine Builder', 'Customers can compare formulas, cadence, and subscription choices in one scan.'],
      ['Material Proof', 'Packaging, origin, batch size, and care details support the promise.'],
    ],
    restaurant: [
      ['Menu Notes', 'Specific dishes, sourcing, and service moments carry the brand beyond the opening image.'],
      ['A Night Here', 'The section gives visitors a sense of pacing, seating, and what to order first.'],
      ['Reservation Flow', 'Hours, location, and the primary booking path stay easy to find.'],
    ],
    portfolio: [
      ['Selected Outcome', 'The work is framed through client names, constraints, and visible before-after movement.'],
      ['Process Notes', 'Discovery, visual systems, and handoff details explain how the work becomes useful.'],
      ['Client Fit', 'The page makes it clear which projects, budgets, and collaboration styles belong here.'],
    ],
    agency: [
      ['System In Motion', 'Brand strategy, product surfaces, and launch assets are shown as one connected system.'],
      ['Launch Proof', 'Named clients, timeline, and measurable output support the studio positioning.'],
      ['Handoff Rhythm', 'The page clarifies what a team receives and how the work keeps moving after launch.'],
    ],
    fitness: [
      ['Training Rhythm', 'Class times, pack options, and coaching style are specific enough to plan a first visit.'],
      ['Member Proof', 'Progress stories and practical numbers make the intensity feel credible.'],
      ['Next Class', 'The conversion path keeps schedule, pricing, and booking within reach.'],
    ],
    hotel: [
      ['Stay Details', 'Rooms, food, spa, and landscape are composed as a stay, not a loose amenities list.'],
      ['Local Texture', 'Trail, coast, fire pit, and restaurant details make the destination concrete.'],
      ['Reserve Flow', 'Availability, room types, and the next booking action stay calm and obvious.'],
    ],
    'ops-console': [
      ['Operator Confidence', 'The frame keeps status, exceptions, and next action in the same field of view.'],
      ['Incident Flow', 'Alerts, ownership, and escalation details are written for a real control room.'],
      ['System Health', 'Telemetry, logs, and recovery paths stay inspectable without visual collision.'],
    ],
  }
  const candidates = library[hint] || library.saas
  const [title, body] = candidates[index % candidates.length]
  const rawInventory = plan.contentInventory?.[(index + current) % Math.max(1, plan.contentInventory.length)] || ''
  const inventory = /\b(footer|nav|hero|section|band|links)\b/i.test(rawInventory) ? '' : rawInventory
  return { title, body, inventory }
}

export function ensureMinimumVerticalSections(html, plan, minSections = 6, route, brief) {
  if (isPublicationRoute(route, brief || plan?.brief)) return html
  const current = (String(html).match(/<section\b/gi) || []).length
  if (current >= minSections) return html
  const a = plan.visualWorld
  const needed = minSections - current
  const additions = Array.from({ length: needed }, (_, index) => {
    const band = fallbackBand(plan, route, index, current)
    return `<section class="w-full bg-[${index % 2 ? a.bg : a.surface}] py-16">
  <div class="mx-auto max-w-7xl px-6">
    <p class="text-xs uppercase tracking-[0.22em] text-[${a.accent}]">Operational proof</p>
    <h2 class="mt-3 font-display text-3xl font-semibold tracking-tight text-[${a.text}]">${band.title}</h2>
    <p class="mt-4 max-w-3xl text-sm leading-6 text-[${a.muted}]">${band.body}${band.inventory ? ` ${band.inventory}.` : ''}</p>
    <div class="mt-8 grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-[${a.accent}]/25 p-4"><p class="text-sm font-semibold">Measured proof</p><p class="mt-2 text-sm opacity-75">Numbers, names, and timing make the promise easier to trust.</p></div>
      <div class="rounded-2xl border border-[${a.accent}]/25 p-4"><p class="text-sm font-semibold">Material detail</p><p class="mt-2 text-sm opacity-75">The offer gains a specific product, service, or editorial surface.</p></div>
      <div class="rounded-2xl border border-[${a.accent}]/25 p-4"><p class="text-sm font-semibold">Next action</p><p class="mt-2 text-sm opacity-75">The route forward stays clear without flattening the composition.</p></div>
    </div>
  </div>
</section>`
  }).join('\n')
  return /<footer\b/i.test(html)
    ? html.replace(/<footer\b/i, `${additions}\n<footer`)
    : html.replace(/<\/body>/i, `${additions}\n</body>`)
}

export function sanitizeFragment(value) {
  return stripRefusal(stripFences(value))
    .replace(/<!DOCTYPE[\s\S]*?<body[^>]*>/i, '')
    .replace(/<\/body>\s*<\/html>\s*$/i, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\sstyle=["'][^"']*["']/gi, '')
    .replace(/<section\b/gi, '<div')
    .replace(/<\/section>/gi, '</div>')
    .trim()
}

/** Strip full-page chrome when models return a homepage inside an app-shell island slot. */
export function sanitizeIslandFragment(value) {
  let html = sanitizeFragment(value)
  for (let i = 0; i < 3; i++) {
    const next = html
      .replace(/<nav\b[\s\S]*?<\/nav>/gi, '')
      .replace(/<header\b[^>]*class="[^"]*sticky[^"]*"[\s\S]*?<\/header>/gi, '')
      .replace(/<footer\b[\s\S]*?<\/footer>/gi, '')
    if (next === html) break
    html = next
  }
  return html
    .replace(/\bmin-h-screen\b/g, 'min-h-0')
    .replace(/\bsticky\s+top-0\b/g, '')
    .trim()
}
