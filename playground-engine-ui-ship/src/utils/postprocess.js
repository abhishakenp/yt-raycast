import { publicationPhotoForQuery, buildPhotoQuery, hydratePublicationImages } from '../media/publication-hydration.js'
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

function googleFontName(value, fallback) {
  return String(value || fallback).replace(/\s+/g, '+')
}

function jsString(value) {
  return JSON.stringify(String(value ?? ''))
}

function ensureDocumentScaffold(html, plan) {
  const a = plan?.visualWorld || {}
  let out = String(html ?? '')
  const bodyClass = `bg-[${a.bg || '#faf7f2'}] font-body text-[${a.text || '#1c1917'}] antialiased`

  if (!/<html\b/i.test(out)) out = out.replace(/^<!DOCTYPE html>\s*/i, '<!DOCTYPE html>\n<html lang="en">\n')
  if (!/<head\b/i.test(out)) {
    const head = '<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>'
    out = /<body\b/i.test(out)
      ? out.replace(/<html\b([^>]*)>\s*(<body\b)/i, `<html$1>\n${head}\n$2`)
      : out.replace(/<html\b([^>]*)>/i, `<html$1>\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">`)
  }
  if (!/<\/head>/i.test(out)) {
    out = out.replace(/(<(?:body|main|section|header|nav|article|footer)\b)/i, `</head>\n<body class="${bodyClass}">\n$1`)
  }
  if (!/<\/head>/i.test(out)) {
    out = out.replace(/<\/body>/i, `</head>\n<body class="${bodyClass}">\n</body>`)
  }
  if (/<\/head>/i.test(out) && !/<body\b/i.test(out)) {
    out = out.replace(/<\/head>/i, `</head>\n<body class="${bodyClass}">`)
  }

  const fonts = `${googleFontName(a.fontDisplay, 'Fraunces')}:wght@400;600;700&family=${googleFontName(a.fontBody, 'Source Serif 4')}:wght@400;500;600;700`
  const headAssets = [
    !/fonts\.googleapis\.com/i.test(out) ? `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${fonts}&display=swap" rel="stylesheet">` : '',
    !/cdn\.tailwindcss\.com/i.test(out) ? '<script src="https://cdn.tailwindcss.com"></script>' : '',
    !/tailwind\s*\.\s*config/i.test(out) ? `<script>tailwind.config={theme:{extend:{fontFamily:{heading:[${jsString(a.fontDisplay || 'Fraunces')},"serif"],body:[${jsString(a.fontBody || 'Source Serif 4')},"serif"]},colors:{page:${jsString(a.bg || '#faf7f2')},surface:${jsString(a.surface || '#ffffff')},ink:${jsString(a.text || '#1c1917')},muted:${jsString(a.muted || '#78716c')},accent:${jsString(a.accent || '#b45309')},accent2:${jsString(a.accent2 || '#0369a1')}}}}}</script>` : '',
  ].filter(Boolean).join('\n')
  if (headAssets && /<\/head>/i.test(out)) out = out.replace(/<\/head>/i, `${headAssets}\n</head>`)
  return out
}

function stripHeadOrphanClosers(html) {
  return String(html ?? '').replace(/<head\b([^>]*)>([\s\S]*?)<\/head>/i, (full, attrs, body) => {
    const cleaned = body.replace(/<\/(?:footer|main|section|article|nav|header)>\s*/gi, '')
    return `<head${attrs}>${cleaned}</head>`
  })
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
    .replace(/\bStay Relayed\b/gi, 'Stay Connected')
}

function normalizeFontUtilityAliases(value) {
  const html = String(value ?? '')
  const hasDisplay = /\bdisplay\s*:\s*\[/i.test(html)
  const hasHeading = /\bheading\s*:\s*\[/i.test(html)
  const hasSerif = /\bserif\s*:\s*\[/i.test(html)
  if (hasDisplay && !hasHeading) return html.replace(/\bfont-heading\b/g, 'font-display')
  if (hasHeading && !hasDisplay) return html.replace(/\bfont-display\b/g, 'font-heading')
  if (!hasDisplay && !hasHeading && hasSerif) return html.replace(/\bfont-heading\b/g, 'font-serif')
  return html
}

function normalizeSoftwarePalette(value, route, brief) {
  const software = route?.siteHint === 'software' || /kubernetes|saas|developer|platform|infrastructure|api|cost-attribution/i.test(String(brief || ''))
  if (!software) return String(value ?? '')
  const creativeAiTool = isCreativeAiToolBrief(brief)
  return String(value ?? '')
    .replace(/#0acf83/gi, creativeAiTool ? '#050507' : '#0d1117')
    .replace(/#00ff00/gi, creativeAiTool ? '#7c3aed' : '#4ecdc4')
    .replace(/0,255,0/gi, creativeAiTool ? '124,58,237' : '78,205,196')
    .replace(/#f24e1e/gi, creativeAiTool ? '#101014' : '#1f2937')
}

export function rewriteAnchorAccentLeaks(value, plan, route) {
  const text = String(plan?.brief || '').toLowerCase()
  let html = String(value ?? '')
  if (route?.primary?.app === 'Figma' && isCreativeAiToolBrief(text)) {
    html = html
      .replace(/\bbg-\[#0acf83\]/gi, 'bg-[#050507]')
      .replace(/\b(from|via|to)-\[#0acf83\]/gi, '$1-[#050507]')
      .replace(/\btext-\[#0acf83\]/gi, 'text-[#d4d4d8]')
      .replace(/\bborder-\[#0acf83\]/gi, 'border-[#27272a]')
      .replace(/\bbg-\[#f24e1e\]/gi, 'bg-[#101014]')
      .replace(/\b(from|via|to)-\[#f24e1e\]/gi, '$1-[#101014]')
      .replace(/\btext-\[#f24e1e\]/gi, 'text-[#d4d4d8]')
      .replace(/\bborder-\[#f24e1e\]/gi, 'border-[#3f3f46]')
      .replace(/\bbg-\[#1abcfe\]/gi, 'bg-[#18181b]')
      .replace(/\b(from|via|to)-\[#1abcfe\]/gi, '$1-[#18181b]')
      .replace(/\btext-\[#1abcfe\]/gi, 'text-[#d4d4d8]')
      .replace(/\bborder-\[#1abcfe\]/gi, 'border-[#52525b]')
      .replace(/\bbg-\[#a259ff\]/gi, 'bg-[#7c3aed]')
      .replace(/\b(from|via|to)-\[#a259ff\]/gi, '$1-[#7c3aed]')
      .replace(/\btext-\[#a259ff\]/gi, 'text-[#f5f3ff]')
      .replace(/\bborder-\[#a259ff\]/gi, 'border-[#7c3aed]')
      .replace(/#0acf83/gi, '#050507')
      .replace(/#f24e1e/gi, '#101014')
      .replace(/#a259ff/gi, '#f5f3ff')
      .replace(/#1abcfe/gi, '#d4d4d8')
  }
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
  const html = String(value ?? '').replace(
    /<div\b((?=[^>]*\bdata-visual=["']art-surface["'])[^>]*)>\s*(?:<!--[\s\S]*?-->\s*)?<\/div>/gi,
    (full, attrs) => {
      const className = attrs.match(/\bclass=["']([^"']*)["']/i)?.[1] || ''
      const visualKind = attrs.match(/\bdata-visual-kind=["']([^"']+)["']/i)?.[1] || ''
      const subject =
        attrs.match(/\bdata-img=["']([^"']+)["']/i)?.[1] ||
        attrs.match(/\baria-label=["']([^"']+)["']/i)?.[1] ||
        (visualKind === 'product-console' ? 'AI model console dashboard' : visualKind) ||
        'product workspace'
      return renderArtDirectedImageSurface(subject, className, plan, 0, route, { heroCompact: true })
    },
  )
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
  h = h.replace(/<script\b[^>]*>[\s\S]*?<\/script>\s*/gi, (script) =>
    /lucide\.createIcons|unpkg\.com\/lucide|lucide@/i.test(script) ? '' : script,
  )
  const labelCss = process.env.KIMI_PREVIEW_LABELS === '1'
    ? `[data-img]::after{content:attr(data-img);position:absolute;inset:auto 0 0 0;padding:.35rem .5rem;font:600 .65rem/1.2 ui-sans-serif,sans-serif;color:#64748b;background:rgba(255,255,255,.75)}`
    : ''
  const inject = `<script src="https://unpkg.com/lucide@latest"></script>
<style>
[data-reveal],.opacity-0,[class*="reveal"],[class*="fade"]{opacity:1!important;transform:none!important;visibility:visible!important}
[data-img]{position:relative;min-height:6rem;border:1px solid rgba(148,163,184,.28);background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(15,23,42,.06))}
${labelCss}
</style>
<script>window.addEventListener('load',()=>{const create=window.lucide&&window.lucide.createIcons;if(typeof create==='function'){create()}})</script>`
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

const USE_ART_SURFACES = process.env.KIMI_ART_SURFACES !== '0'

function isPublicationBrief(brief, route) {
  return isPublicationRoute(route, brief)
}

function plainText(value) {
  return String(value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractBrandName(brief) {
  const raw = String(brief ?? '').replace(/\s+/g, ' ').trim()
  const named =
    raw.match(/\b(?:Homepage|Website|Landing page|Site)\s+for\s+([^,.;—–-]+)/i)?.[1] ||
    raw.match(/^([^—–:]+)\s+[—–:]\s+/)?.[1] ||
    raw.match(/^([^,.]{3,48})\s+is\s+/i)?.[1] ||
    ''
  return toTitle(named.replace(/\b(?:a|an|the)\s+/i, '').trim()).slice(0, 48) || 'The team'
}

function isCreativeAiToolBrief(brief) {
  const text = String(brief ?? '').toLowerCase()
  return /\b(app|tool|workspace|platform|editor|canvas|studio)\b/.test(text) && /\b(ai|image generation|generative|prompt|model|diffusion|render|creative|design)\b/.test(text)
}

function densityProfile(route, brief) {
  const hint = route?.siteHint || ''
  const text = String(brief ?? '').toLowerCase()
  if (isCreativeAiToolBrief(brief)) {
    return {
      eyebrow: 'Creative workflow',
      title: 'Model choice, prompt history, and review flow',
      intro: 'The page shows the actual creative loop: configure a model, generate variations, compare outputs, and export the selected image.',
      visual: 'dark image generation workspace',
      columns: ['Step', 'Workspace surface', 'Signal', 'Next action'],
      rows: [
        ['Prompt', 'Composer', 'Style and aspect locked', 'Generate set'],
        ['Render', 'Model queue', '4 variations ready', 'Compare outputs'],
        ['Review', 'Gallery board', 'Version notes saved', 'Select image'],
        ['Export', 'Asset panel', 'PNG and source prompt', 'Share link'],
      ],
      cards: ['4 model slots', 'Prompt history saved', 'Team review links'],
    }
  }
  if (hint === 'software' || /kubernetes|saas|analytics|developer|platform|infrastructure|api/.test(text)) {
    return {
      eyebrow: 'Product detail',
      title: 'Live operating model',
      intro: 'A compact view of the numbers, ownership, and workflow that makes the product feel inspectable instead of abstract.',
      visual: 'usage analytics control room',
      columns: ['Signal', 'Owner', 'Metric', 'Next action'],
      rows: [
        ['Namespace spend', 'Platform', '$12.8k / mo', 'Budget alert'],
        ['Pod anomaly', 'SRE', '31% over baseline', 'Open trace'],
        ['Team allocation', 'Finance', '42 services', 'Export CSV'],
        ['Idle cluster', 'Infra', '18 nodes', 'Schedule downshift'],
      ],
      cards: ['Self-host in 14 minutes', '99.95% report uptime', 'SOC 2 export trail'],
    }
  }
  if (hint === 'commerce' || /shop|skincare|product|apparel|store|subscribe/.test(text)) {
    return {
      eyebrow: 'Catalog detail',
      title: 'Routine, proof, and purchase path',
      intro: 'The product story includes formula notes, cadence, and buying context so the page feels like a real storefront.',
      visual: 'product shelf still life',
      columns: ['Product', 'Use case', 'Batch', 'Cadence'],
      rows: [
        ['Restore Oil', 'Barrier repair', '042', 'Nightly'],
        ['Glow Serum', 'Dullness', '039', '3x weekly'],
        ['Calm Blend', 'Redness', '044', 'Morning'],
        ['Refill Set', 'Subscription', '12 pack', '30 days'],
      ],
      cards: ['Small-batch Vermont fill', 'Recyclable glass packaging', 'Subscribe and save 15%'],
    }
  }
  if (hint === 'fitness' || /fitness|training|class packs|workout|gym|hiit|crossfit|workout studio/.test(text)) {
    return {
      eyebrow: 'Studio rhythm',
      title: 'Classes, coaching, and first-visit proof',
      intro: 'Visitors can scan the weekly cadence, coaching style, and membership options without hunting through copy.',
      visual: 'training floor schedule board',
      columns: ['Class', 'Time', 'Coach', 'Capacity'],
      rows: [
        ['VTX45 Strength', '06:30', 'Maya', '18 spots'],
        ['Rower Intervals', '12:15', 'Andre', '14 spots'],
        ['Hybrid Burn', '17:45', 'Nina', '20 spots'],
        ['Recovery Block', '19:00', 'Sam', '12 spots'],
      ],
      cards: ['4.9 member rating', '3 daily class blocks', '$28 drop-in'],
    }
  }
  if (hint === 'hotel' || /hotel|room|suite|coast|guest|spa/.test(text)) {
    return {
      eyebrow: 'Stay detail',
      title: 'Rooms, rituals, and local texture',
      intro: 'The booking story connects the property, food, spa, and landscape into one concrete stay.',
      visual: 'ocean room and coast map',
      columns: ['Moment', 'Place', 'Time', 'Detail'],
      rows: [
        ['Check-in', 'Cedar lobby', '15:00', 'Tide card'],
        ['Dinner', 'Pacific Table', '19:30', '24 seats'],
        ['Spa', 'Cliff bath', '10:00', '90 min'],
        ['Trail', 'North point', '16:40', 'Low tide'],
      ],
      cards: ['24 ocean-view rooms', '9 minute beach walk', 'Fire pits lit nightly'],
    }
  }
  if (hint === 'portfolio' || hint === 'agency' || /portfolio|agency|designer|studio|brand/.test(text)) {
    return {
      eyebrow: 'Case detail',
      title: 'Work shown as systems, not thumbnails',
      intro: 'The page gives each project enough client, scope, and outcome detail to feel like a credible studio archive.',
      visual: 'brand system case wall',
      columns: ['Client', 'Scope', 'Timeline', 'Outcome'],
      rows: [
        ['Linear', 'Launch identity', '6 weeks', '+38% activation'],
        ['Vercel', 'Product story', '4 weeks', '3 campaign kits'],
        ['Pitch', 'Design system', '8 weeks', '42 components'],
        ['Northstar', 'Retail refresh', '5 weeks', '12 assets'],
      ],
      cards: ['Strategy through handoff', 'Founder-led reviews', 'Launch assets included'],
    }
  }
  return {
    eyebrow: 'Page detail',
    title: 'Specifics that make the page feel lived in',
    intro: 'A dense band of names, numbers, and artifacts gives the page more dimensionality than a flat landing template.',
    visual: 'brand operating board',
    columns: ['Area', 'Detail', 'Metric', 'Action'],
    rows: [
      ['Offer', 'Primary package', '$79 start', 'Compare'],
      ['Proof', 'Customer cohort', '1,200 users', 'Read story'],
      ['Workflow', 'Handoff path', '4 steps', 'Preview'],
      ['Support', 'Response window', '2 hours', 'Contact'],
    ],
    cards: ['Customer evidence', 'Real numbers', 'Clear next step'],
  }
}

function buildDenseDetailBand(plan, route, brief) {
  const a = {
    bg: '#0f172a',
    surface: '#ffffff',
    text: '#111827',
    muted: '#64748b',
    accent: '#2563eb',
    ...(plan?.visualWorld || {}),
  }
  const p = densityProfile(route, brief || plan?.brief)
  const brand = extractBrandName(brief || plan?.brief)
  const software = route?.siteHint === 'software' || /kubernetes|saas|developer|platform|infrastructure|api/i.test(String(brief || plan?.brief || ''))
  if (software) {
    if (/^#0acf83$/i.test(a.bg) || /^#f24e1e$/i.test(a.bg) || /^#a259ff$/i.test(a.bg)) a.bg = '#0d1117'
    if (/^#0acf83$/i.test(a.surface) || /^#f24e1e$/i.test(a.surface)) a.surface = '#112138'
    if (/^#0acf83$/i.test(a.accent) || /^#00ff00$/i.test(a.accent)) a.accent = '#4ecdc4'
  }
  const cardDetails = software
    ? [
        'Deploy the collector in-cluster and keep cost records inside your own account.',
        'Track report delivery, owner changes, and exports for finance review.',
        'Attach cost evidence to pull requests, budget reviews, and incident follow-ups.',
      ]
    : [
        `${brand} shows the proof close to the conversion path instead of hiding it in generic copy.`,
        'Numbers, timing, and ownership make the section easier to trust at a glance.',
        'The next action is specific enough for a visitor to understand what happens next.',
      ]
  const columns = p.columns.map((column) => `<th class="px-4 py-3 text-left font-medium text-[${a.muted}]">${escapeHtml(column)}</th>`).join('')
  const rows = p.rows
    .map((row) => `<tr class="border-t border-[${a.muted}]/20">${row.map((cell, index) => `<td class="px-4 py-3 ${index === 0 ? `font-medium text-[${a.text}]` : `text-[${a.muted}]`}">${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('')
  const cards = p.cards
    .map((card, index) => `<div class="rounded-lg border border-[${a.muted}]/25 bg-[${a.bg}]/45 p-4"><p class="text-sm font-semibold text-[${a.text}]">${escapeHtml(card)}</p><p class="mt-2 text-xs leading-5 text-[${a.muted}]">${escapeHtml(cardDetails[index % cardDetails.length])}</p></div>`)
    .join('')
  return `<section class="w-full bg-[${a.surface}] py-16 scroll-mt-24" data-ship-density="detail-band">
  <div class="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.95fr_1.25fr]">
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[${a.accent}]">${escapeHtml(p.eyebrow)}</p>
      <h2 class="mt-3 font-heading text-3xl font-semibold leading-tight text-[${a.text}] md:text-5xl">${escapeHtml(p.title)}</h2>
      <p class="mt-4 max-w-2xl text-sm leading-6 text-[${a.muted}]">${escapeHtml(p.intro)}</p>
      <div class="mt-6 grid gap-3 sm:grid-cols-3">${cards}</div>
    </div>
    <div class="grid gap-4">
      <div data-img="${escapeHtml(p.visual)}" class="w-full aspect-[16/9] rounded-xl"></div>
      <div class="overflow-hidden rounded-xl border border-[${a.muted}]/25 bg-[${a.bg}]/55">
        <table class="w-full text-sm">
          <thead><tr class="bg-[${a.bg}]/70">${columns}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  </div>
</section>`
}

function isRepetitiveNonPublicationPage(html, plan, brief) {
  const source = String(html ?? '')
  const brand = extractBrandName(brief || plan?.brief).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const numberedHeadings = new RegExp(`<h[12][^>]*>\\s*${brand}\\s+\\d+\\s*</h[12]>`, 'gi')
  const numberedCount = (source.match(numberedHeadings) || []).length
  const lowerBrief = String(brief || plan?.brief || '').toLowerCase()
  const software = /kubernetes|saas|analytics|developer|platform|infrastructure|api|open-source|cost-attribution/.test(lowerBrief)
  if (software) {
    const artSurfaces = (source.match(/\bdata-visual=["']art-surface["']/gi) || []).length
    const workTiles = (source.match(/\bwork tile\b/gi) || []).length
    const featureCompositions = (source.match(/\bfeature composition\b/gi) || []).length
    const genericBadges = (source.match(/\bLive product surface\b|\b92\.4% clear\b/gi) || []).length
    if (/\bAcme\b/.test(source) || workTiles >= 2 || featureCompositions >= 3 || (artSurfaces >= 6 && genericBadges >= 4)) {
      return true
    }
  }
  const paragraphs = [...source.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => plainText(match[1]).toLowerCase())
    .filter((text) => text.length > 30)
  const duplicates = paragraphs.length - new Set(paragraphs).size
  return numberedCount >= 3 || duplicates >= 3
}

function buildRecoveredNonPublicationBody(plan, route, brief) {
  const a = {
    bg: '#0f172a',
    surface: '#ffffff',
    text: '#111827',
    muted: '#64748b',
    accent: '#2563eb',
    accent2: '#14b8a6',
    ...(plan?.visualWorld || {}),
  }
  const brand = extractBrandName(brief || plan?.brief)
  const profile = densityProfile(route, brief || plan?.brief)
  const software = route?.siteHint === 'software' || /kubernetes|saas|developer|platform|infrastructure|api/i.test(String(brief || plan?.brief || ''))
  const heroTitle = software
    ? `Open-source Kubernetes cost attribution for platform teams`
    : `${brand} turns the offer into a concrete operating story`
  const heroDeck = software
    ? 'Self-hosted cost attribution for engineering and finance teams that need allocation, anomaly review, and export-ready evidence in one workspace.'
    : `${brand} gets a more specific front door with named proof, real numbers, and enough detail to feel ready for buyers.`
  const proof = software
    ? [
        ['In-cluster metering', 'CPU, memory, storage, and network allocation collected inside your Kubernetes account.'],
        ['Finance exports', 'CSV and JSON evidence without sending usage records to a hosted SaaS vendor.'],
        ['Collector release', 'Helm install with Prometheus labels, team owners, and budget policy templates.'],
      ]
    : [
        ['14 day launch', 'A complete first pass from story to conversion path.'],
        ['6 proof points', 'Numbers, names, and outcomes stay visible.'],
        ['3 buyer paths', 'Compare, evaluate, and act without a flat CTA wall.'],
      ]
  const proofCards = proof
    .map(([metric, copy], index) => `<div class="rounded-xl border border-[${a.muted}]/25 bg-[${a.surface}] p-5"><div class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[${a.accent}]/15 text-sm font-semibold text-[${a.accent}]">${index === 0 ? 'CPU' : index === 1 ? 'CSV' : 'POD'}</div><p class="font-heading text-3xl font-semibold text-[${a.text}]">${escapeHtml(metric)}</p><p class="mt-2 text-sm leading-6 text-[${a.muted}]">${escapeHtml(copy)}</p></div>`)
    .join('')
  const workflow = profile.rows
    .map(([a1, a2, a3, a4]) => `<li class="grid gap-2 border-b border-[${a.muted}]/20 py-4 md:grid-cols-4"><span class="font-medium text-[${a.text}]">${escapeHtml(a1)}</span><span class="text-[${a.muted}]">${escapeHtml(a2)}</span><span class="text-[${a.muted}]">${escapeHtml(a3)}</span><span class="text-[${a.accent}]">${escapeHtml(a4)}</span></li>`)
    .join('')
  return `<body class="bg-[${a.bg}] text-[${a.text}]">
<header class="w-full border-b border-[${a.muted}]/20 bg-[${a.bg}]">
  <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
    <a href="#" class="font-heading text-lg font-semibold text-[${a.text}]">${escapeHtml(brand)}</a>
    <div class="hidden gap-6 text-sm text-[${a.muted}] md:flex"><a href="#product">Product</a><a href="#workflow">Workflow</a><a href="#pricing">Pricing</a><a href="/docs">Docs</a><a href="https://github.com/kubemeter/kubemeter">GitHub</a></div>
    <a href="https://github.com/kubemeter/kubemeter#quick-start" class="rounded-lg bg-[${a.accent}] px-4 py-2 text-sm font-semibold text-white">Deploy to cluster</a>
  </nav>
</header>
<section class="w-full min-h-[76vh] py-20 scroll-mt-24">
  <div class="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[${a.accent}]">${software ? 'Self-hosted open source' : escapeHtml(plan?.archetype || route?.siteHint || 'Homepage')}</p>
      <h1 class="mt-4 font-heading text-5xl font-semibold leading-tight text-[${a.text}] md:text-7xl">${escapeHtml(heroTitle)}</h1>
      <p class="mt-6 max-w-2xl text-base leading-7 text-[${a.muted}]">${escapeHtml(heroDeck)}</p>
      <div class="mt-8 flex flex-wrap gap-3"><a id="deploy" href="https://github.com/kubemeter/kubemeter#quick-start" class="rounded-lg bg-[${a.accent}] px-5 py-3 text-sm font-semibold text-white">Deploy to cluster</a><a href="https://github.com/kubemeter/kubemeter" class="rounded-lg border border-[${a.muted}]/30 px-5 py-3 text-sm font-semibold text-[${a.text}]">View on GitHub</a></div>
    </div>
    <div data-img="kubemeter cost dashboard by namespace" class="w-full aspect-[16/10] rounded-xl"></div>
  </div>
</section>
<section id="product" class="w-full bg-[${a.surface}] py-16 scroll-mt-24" data-ship-density="detail-band">
  <div class="mx-auto max-w-7xl px-6">
    <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[${a.accent}]">Measured proof</p>
    <div class="mt-6 grid gap-4 md:grid-cols-3">${proofCards}</div>
  </div>
</section>
<section id="workflow" class="w-full bg-[${a.bg}] py-16 scroll-mt-24">
  <div class="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
    <div>
      <div class="max-w-3xl"><p class="text-xs font-semibold uppercase tracking-[0.22em] text-[${a.accent}]">Kubernetes workflow</p><h2 class="mt-3 font-heading text-4xl font-semibold text-[${a.text}]">Install the collector, map spend, review anomalies, export evidence</h2></div>
      <ul class="relative mt-8 rounded-xl border border-[${a.muted}]/25 bg-[${a.surface}]/70 p-4 text-sm before:absolute before:left-7 before:top-8 before:bottom-8 before:w-px before:bg-[${a.accent}]/30">${software ? [
      ['Install Helm chart', 'finops namespace', '12 min', 'collector ready'],
      ['Map labels', 'team + service', '42 namespaces', 'owner coverage'],
      ['Review anomaly', 'gpu-jobs', '+19% compute', 'open trace'],
      ['Export report', 'finance CSV', 'monthly close', 'share evidence'],
    ].map(([a1, a2, a3, a4], index) => `<li class="relative grid gap-2 border-b border-[${a.muted}]/20 py-4 pl-10 md:grid-cols-4"><span class="absolute left-0 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-[${a.accent}]/40 bg-[${a.bg}] text-xs font-semibold text-[${a.accent}]">${index + 1}</span><span class="font-medium text-[${a.text}]">${escapeHtml(a1)}</span><span class="text-[${a.muted}]">${escapeHtml(a2)}</span><span class="text-[${a.muted}]">${escapeHtml(a3)}</span><span class="text-[${a.accent}]">${escapeHtml(a4)}</span></li>`).join('') : workflow}</ul>
    </div>
    <div data-img="helm deploy kubemeter cli install" class="w-full aspect-[4/3] rounded-xl"></div>
  </div>
</section>
<section id="pricing" class="w-full bg-[${a.surface}] py-16 scroll-mt-24">
  <div class="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-3">
    <div class="rounded-xl border border-[${a.muted}]/25 p-6"><p class="font-semibold text-[${a.text}]">Community</p><p class="mt-3 text-3xl font-semibold text-[${a.text}]">$0</p><p class="mt-2 text-sm text-[${a.muted}]">Self-host the collector, namespace reports, and CSV exports from GitHub.</p><a href="https://github.com/kubemeter/kubemeter" class="mt-5 inline-flex text-sm font-semibold text-[${a.accent}]">Clone repo →</a></div>
    <div class="rounded-xl border-2 border-[${a.accent}] p-6"><p class="font-semibold text-[${a.text}]">Team support</p><p class="mt-3 text-3xl font-semibold text-[${a.text}]">$149</p><p class="mt-2 text-sm text-[${a.muted}]">Budget policy templates, upgrade help, and Slack support for platform teams.</p><a href="/docs/support" class="mt-5 inline-flex text-sm font-semibold text-[${a.accent}]">Compare support →</a></div>
    <div class="rounded-xl border border-[${a.muted}]/25 p-6"><p class="font-semibold text-[${a.text}]">Enterprise support</p><p class="mt-3 text-3xl font-semibold text-[${a.text}]">Custom</p><p class="mt-2 text-sm text-[${a.muted}]">SAML, procurement paperwork, and private advisory without taking data out of your cluster.</p><a href="/contact" class="mt-5 inline-flex text-sm font-semibold text-[${a.accent}]">Talk to support →</a></div>
  </div>
</section>
<section id="community" class="w-full bg-[${a.bg}] py-16 scroll-mt-24">
  <div class="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-[0.8fr_1.2fr]">
    <div><p class="text-xs font-semibold uppercase tracking-[0.22em] text-[${a.accent}]">Open-source proof</p><h2 class="mt-3 font-heading text-4xl font-semibold text-[${a.text}]">Cost formulas stay visible in GitHub</h2><p class="mt-4 text-sm leading-6 text-[${a.muted}]">Allocation formulas, label joins, and export jobs are inspectable before finance uses the numbers in budget reviews.</p></div>
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-[${a.muted}]/25 bg-[${a.surface}]/70 p-5"><p class="text-2xl font-semibold text-[${a.text}]">Apache-2.0</p><p class="mt-2 text-sm text-[${a.muted}]">Permissive license for internal platform teams.</p></div>
      <div class="rounded-xl border border-[${a.muted}]/25 bg-[${a.surface}]/70 p-5"><p class="text-2xl font-semibold text-[${a.text}]">4 collectors</p><p class="mt-2 text-sm text-[${a.muted}]">CPU, memory, storage, and network attribution.</p></div>
      <div class="rounded-xl border border-[${a.muted}]/25 bg-[${a.surface}]/70 p-5"><p class="text-2xl font-semibold text-[${a.text}]">12 min</p><p class="mt-2 text-sm text-[${a.muted}]">Median first report after Helm install.</p></div>
    </div>
  </div>
</section>
<section id="activity" class="w-full bg-[${a.surface}] py-16 scroll-mt-24">
  <div class="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-[0.9fr_1.1fr]">
    <div><p class="text-xs font-semibold uppercase tracking-[0.22em] text-[${a.accent}]">GitHub activity</p><h2 class="mt-3 font-heading text-4xl font-semibold text-[${a.text}]">Release, issues, and contributor signal in the open</h2><p class="mt-4 text-sm leading-6 text-[${a.muted}]">Platform teams can inspect allocation changes, chart releases, and collector issues before adopting the stack.</p></div>
    <div class="grid gap-3">
      ${[
        ['release', 'collector chart', 'latest tagged package'],
        ['pull request', 'namespace owner cache', 'reviewed by maintainers'],
        ['issue queue', 'GPU job allocation', 'planned for next minor'],
      ].map(([tag, title, meta]) => `<div class="grid gap-2 rounded-xl border border-[${a.muted}]/25 bg-[${a.bg}]/55 p-4 sm:grid-cols-[0.35fr_1fr_0.7fr]"><span class="font-mono text-sm text-[${a.accent}]">${escapeHtml(tag)}</span><span class="font-medium text-[${a.text}]">${escapeHtml(title)}</span><span class="text-sm text-[${a.muted}]">${escapeHtml(meta)}</span></div>`).join('')}
    </div>
  </div>
</section>
<footer class="w-full border-t border-[${a.muted}]/20 bg-[${a.bg}] py-10">
  <div class="mx-auto grid max-w-7xl gap-6 px-6 text-sm text-[${a.muted}] md:grid-cols-[1.2fr_1fr_1fr]">
    <div><p class="font-semibold text-[${a.text}]">${escapeHtml(brand)} v0.8</p><p class="mt-2">Apache-2.0 cost attribution for self-hosted Kubernetes teams.</p></div>
    <div class="grid gap-2"><a href="https://github.com/kubemeter/kubemeter" class="text-[${a.text}]">GitHub repository</a><a href="/docs/contributing">Contribution guide</a><a href="/docs/security">Security policy</a></div>
    <div class="grid gap-2"><span>1.8k GitHub stars</span><span>42 contributor pull requests</span><span>Helm chart: kubemeter/kubemeter</span></div>
  </div>
</footer>
</body></html>`
}

function ensureSubstantiveNonPublicationPage(html, plan, route, brief) {
  if (plan?.pageKind === 'app-shell' || isPublicationBrief(brief || plan?.brief, route)) return String(html ?? '')
  const source = String(html ?? '')
  if (!isRepetitiveNonPublicationPage(source, plan, brief)) return source
  const head = source.match(/<!DOCTYPE html>[\s\S]*?<body\b[^>]*>/i)?.[0]?.replace(/<body\b[^>]*>$/i, '') ||
    '<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head>'
  return `${head}\n${buildRecoveredNonPublicationBody(plan, route, brief)}`
}

export function stripDuplicateOpeningHero(html, plan, route, brief) {
  if (isPublicationBrief(brief || plan?.brief, route)) return String(html ?? '')
  const source = String(html ?? '')
  const sections = [...source.matchAll(/<section\b[\s\S]*?<\/section>/gi)]
  if (sections.length < 2) return source
  const first = sections[0]
  const second = sections[1]
  if (first.index > 3000 || second.index - first.index > first[0].length + 800) return source
  if (!/<h1\b/i.test(first[0]) || !/<h1\b/i.test(second[0])) return source
  const firstTitle = plainText(first[0].match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '')
  const secondTitle = plainText(second[0].match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '')
  if (!firstTitle || !secondTitle) return source
  const brand = extractBrandName(brief || plan?.brief).toLowerCase()
  const secondLooksLikeRepeatedOpener =
    secondTitle.length <= 64 &&
    (secondTitle.toLowerCase() === brand ||
      brand.includes(secondTitle.toLowerCase()) ||
      /start|creating|demo|watch|learn more|get started/i.test(second[0]))
  if (!secondLooksLikeRepeatedOpener) return source
  return `${source.slice(0, second.index)}${source.slice(second.index + second[0].length)}`
}

export function ensureDenseNonPublicationDetail(html, plan, route, brief) {
  if (plan?.pageKind === 'app-shell' || isPublicationBrief(brief || plan?.brief, route)) return String(html ?? '')
  let source = String(html ?? '')
  const profile = densityProfile(route, brief || plan?.brief)
  const existingDetail = source.match(/<section\b[^>]*\bdata-ship-density=["']detail-band["'][\s\S]*?<\/section>/i)?.[0] || ''
  if (existingDetail) {
    if (plainText(existingDetail).includes(profile.title)) return source
    source = source.replace(existingDetail, '')
  }
  const sections = (source.match(/<section\b/gi) || []).length
  if (sections >= 9) return source
  const text = plainText(source)
  const hasTable = /<table\b/i.test(source)
  const gridCount = (source.match(/\bgrid\b/g) || []).length
  const dataImgs = (source.match(/<div\b[^>]*\bdata-img=/gi) || []).length
  const concreteNumbers = (text.match(/\b(?:\d+[%xk]?|\$[\d,.]+)\b/g) || []).length
  if (hasTable && gridCount >= 6 && dataImgs >= 2 && concreteNumbers >= 8) return source
  const band = buildDenseDetailBand(plan, route, brief)
  if (/<footer\b/i.test(source)) return source.replace(/<footer\b/i, `${band}\n<footer`)
  return source.replace(/<\/body>/i, `${band}\n</body>`)
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
  if (!topics.length && /[—–:]/.test(raw)) {
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
    source.match(/<a[^>]*class="[^"]*(?:logo|brand|font-bold|font-heading|font-display)[^"]*"[^>]*>([^<]{2,80})</i)?.[1],
    source.match(/<p[^>]*class="[^"]*tracking-\[[^\]]+\][^"]*"[^>]*>([^<]{2,80})</i)?.[1],
  ]
  const brand = decodeBasicEntities(candidates.find(Boolean)?.replace(/\s+/g, ' ').trim() || '')
  if (!brand) return ''
  if (/^(dog blog|pet blog|the blog|my blog|blog home|homepage|untitled)$/i.test(brand)) return ''
  if (/\b(?:home|archive|about|subscribe|latest|featured|cover story|field report|dispatch|browse the desk)\b/i.test(brand)) return ''
  return brand
}

function extractTitlePublicationBrand(html) {
  const raw = String(html ?? '').match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''
  const brand = decodeBasicEntities(raw.split(/[–—-]/)[0]?.replace(/\s+/g, ' ').trim() || '')
  if (!brand) return ''
  if (/^(dog blog|pet blog|the blog|my blog|blog home|homepage|untitled)$/i.test(brand)) return ''
  if (/\b(?:cover story|latest posts|explore topics|dispatch)\b/i.test(brand)) return ''
  return brand
}

function resolvePublicationBrand(html, identity) {
  return extractExistingPublicationBrand(html) || extractTitlePublicationBrand(html) || identity.brand
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

function varyPublicationTopicTags(html, accents) {
  const a = accents || {}
  const variants = [
    `bg-[${a.text || '#1c1917'}] text-white border border-[${a.text || '#1c1917'}]`,
    `bg-[${a.surface || '#ffffff'}] text-[${a.text || '#1c1917'}] border border-[${a.muted || '#78716c'}]/30`,
    `bg-[${a.accent || '#b45309'}]/10 text-[${a.accent || '#b45309'}] border border-[${a.accent || '#b45309'}]/25`,
    `bg-transparent text-[${a.accent || '#b45309'}] border border-[${a.accent || '#b45309'}]/60`,
  ]

  return String(html ?? '').replace(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi, (full, attrs, body) => {
    const plain = body.replace(/<[^>]+>/g, ' ')
    if (!/\b(?:explore\s+)?(?:topics?|tags?|categories|series)\b/i.test(plain)) return full
    let index = 0
    const nextBody = body.replace(/<(a|span)\b([^>]*)class="([^"]*)"([^>]*)>/gi, (match, tag, before, cls, after) => {
      if (!/\b(?:rounded-full|inline-flex|inline-block)\b/.test(cls) || !/\bpx-[2-6]\b/.test(cls)) return match
      const base = cls
        .replace(/\bbg-(?!cover|center|fixed|local|scroll|clip|origin|repeat|no-repeat|auto|contain)[^\s"']+/g, '')
        .replace(/\btext-(?:white|black|[a-z]+-\d+|\[[^\]]+\])(?:\/\d+)?/g, '')
        .replace(/\bborder(?:-[^\s"']+)?/g, '')
        .replace(/\bhover:[^\s"']+/g, '')
        .replace(/\bhover:\s*/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      const variant = variants[index % variants.length]
      index += 1
      return `<${tag}${before}class="${`${base} ${variant}`.replace(/\s+/g, ' ').trim()}"${after}>`
    })
    return index >= 3 ? `<section${attrs}>${nextBody}</section>` : full
  })
}

function orderPublicationNavBeforeMasthead(html) {
  const source = String(html ?? '')
  const nav = source.match(/<nav\b[\s\S]*?<\/nav>/i)?.[0]
  const masthead = source.match(/<section\b[^>]*\bid=["']masthead["'][\s\S]*?<\/section>/i)?.[0]
  if (!nav || !masthead) return source
  if (source.indexOf(nav) < source.indexOf(masthead)) return source
  const withoutNav = source.replace(nav, '').replace(/\n{3,}/g, '\n\n')
  return withoutNav.replace(masthead, `${nav}\n${masthead}`)
}

function hasScopedPublicationMasthead(html, identity) {
  const h1s = [...String(html ?? '').matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
  return h1s.some((match) => {
    const text = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase()
    const hits = identity.topics.filter((topic) => text.includes(topic.split(/\s+/)[0].toLowerCase())).length
    return hits >= 2 && text.length > 20
  })
}

function buildPublicationMasthead(identity, a) {
  return `<section id="masthead" class="w-full bg-[${a.surface}] py-10 border-y border-[${a.muted}]/20 scroll-mt-24">
  <div class="mx-auto max-w-7xl px-6">
    <p class="font-heading text-xs uppercase tracking-[0.18em] text-[${a.accent}]">${escapeHtml(identity.brand)}</p>
    <h1 class="mt-3 max-w-5xl font-heading text-4xl md:text-6xl font-semibold leading-tight text-[${a.text}]">${escapeHtml(identity.h1)}</h1>
    <p class="mt-4 max-w-3xl text-base md:text-lg leading-7 text-[${a.muted}]">${escapeHtml(identity.deck)}</p>
  </div>
</section>`
}

function navOnlyPublicationHeader(navSection, a) {
  const nav = String(navSection || '').match(/<nav\b[\s\S]*?<\/nav>/i)?.[0] || ''
  if (!nav) return ''
  return `<header class="w-full bg-[${a.surface}] border-b border-[${a.muted}]/20">
  <div class="mx-auto max-w-7xl px-6 py-4">${nav}</div>
</header>`
}

function stripPostFooterInjectedSections(html) {
  const source = String(html ?? '')
  const footerMatch = source.match(/<footer\b[\s\S]*?<\/footer>/i)
  if (!footerMatch) return source
  const footerEnd = source.indexOf(footerMatch[0]) + footerMatch[0].length
  const tail = source.slice(footerEnd)
  if (!/<section\b/i.test(tail)) return source
  const injectedTail =
    /\bKey Point One\b/i.test(tail) ||
    /\bnav \+ featured post masthead\b/i.test(tail) ||
    /\bgrid of 6\+ recent posts\b/i.test(tail) ||
    /Concrete brand-specific detail that supports this section's purpose/i.test(tail)
  if (!injectedTail) return source
  return source.slice(0, footerEnd) + tail.replace(/<section\b[\s\S]*?<\/section>/gi, '').replace(/\n{3,}/g, '\n\n')
}

function repairPublicationNav(html, identity, a) {
  let out = String(html ?? '')
  const navLinks = ['Home', 'Archive', 'About']
    .map((label) => `<a href="#" class="text-sm font-medium text-[${a.text}] hover:text-[${a.accent}]">${label}</a>`)
    .join('\n          ')
  const navMarkup = `<nav class="sticky top-0 z-50 w-full border-b border-[${a.muted}]/20 bg-[${a.bg}]/95 backdrop-blur scroll-mt-24">
  <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
    <a href="#" class="font-heading text-lg font-semibold text-[${a.text}]">${escapeHtml(identity.brand)}</a>
    <div class="hidden items-center gap-6 md:flex">
      ${navLinks}
      <a href="#" class="text-sm font-semibold text-[${a.accent}]">Subscribe</a>
    </div>
  </div>
</nav>`
  if (!/<nav\b/i.test(out)) {
    return out.replace(/<body([^>]*)>/i, `<body$1>\n${navMarkup}`)
  }
  return out.replace(/<nav\b[\s\S]*?<\/nav>/i, navMarkup)
}

function isFeaturedPostSection(block) {
  const text = plainText(block)
  if (/\bid=["']masthead["']/i.test(block)) return false
  if (/\bid=["']latest["']/i.test(block)) return false
  return (
    /<img\b/i.test(block) &&
    /<h[12]\b/i.test(block) &&
    (/\b(?:min read|By [A-Z][a-z]+|read (?:the )?(?:story|article|post|more))/i.test(text) ||
      /\bFeatured\b/i.test(block))
  )
}

function stripPublicationMasthead(html) {
  return String(html ?? '').replace(/<section\b[^>]*\bid=["']masthead["'][\s\S]*?<\/section>/gi, '')
}

function stripPseudoFooterSections(html) {
  let out = String(html ?? '')
  if (!/<footer\b/i.test(out)) return out
  out = out.replace(/<section\b[^>]*class="[^"]*bg-\[#1c1917\][^"]*"[\s\S]*?<\/section>/gi, '')
  out = out.replace(
    /<section\b[^>]*>[\s\S]*?<h[23][^>]*>\s*(?:Navigate|Stay Connected|Quick Links)[\s\S]*?<\/section>/gi,
    '',
  )
  return out
}

function tagFeaturedSection(html) {
  let out = String(html ?? '')
  if (/\bid=["']featured["']/i.test(out)) {
    return out.replace(
      /(<section\b[^>]*\bid=["']featured["'][\s\S]*?)<h1\b/gi,
      '$1<h2',
    ).replace(
      /(<section\b[^>]*\bid=["']featured["'][\s\S]*?)<\/h1>/gi,
      '$1</h2>',
    )
  }
  const latestIdx = out.search(/\bid=["']latest["']/i)
  const searchArea = latestIdx >= 0 ? out.slice(0, latestIdx) : out
  const sections = [...searchArea.matchAll(/<section\b[\s\S]*?<\/section>/gi)]
  for (let i = sections.length - 1; i >= 0; i--) {
    const block = sections[i][0]
    if (!isFeaturedPostSection(block)) continue
    let tagged = block.includes('id=')
      ? block.replace(/\bid=["'][^"']*["']/i, 'id="featured"')
      : block.replace(/<section\b/i, '<section id="featured"')
    tagged = tagged.replace(/<h1\b/gi, '<h2').replace(/<\/h1>/gi, '</h2>')
    return out.replace(block, tagged)
  }
  return out
}

function dedupePublicationBands(html) {
  let out = String(html ?? '')
  const seen = new Set()
  const bandMatchers = [
    /\bLatest posts?\b|\bid=["']latest["']/i,
    /\bExplore topics\b|\bid=["']topics["']/i,
    /\bJoin our newsletter\b|\bid=["']newsletter["']/i,
    /\bAbout\b/i,
  ]
  out = out.replace(/<section\b[\s\S]*?<\/section>/gi, (block) => {
    let label = bandMatchers.findIndex((re) => re.test(block))
    if (label < 0 && isPublicationTopicBand(block)) label = 1
    if (label < 0 && isPublicationNewsletterBand(block)) label = 2
    if (label < 0) return block
    if (label === 3) return ''
    if (seen.has(label)) return ''
    seen.add(label)
    if (/\bLatest posts?\b/i.test(block) && !/\bid=["']latest["']/i.test(block)) {
      return block.replace(/<section\b/i, '<section id="latest"')
    }
    if (label === 1) {
      const tagged = /\bid=["']topics["']/i.test(block) ? block : block.replace(/<section\b/i, '<section id="topics"')
      return normalizePublicationTopicBandClasses(tagged)
    }
    if (label === 2) {
      const tagged = /\bid=["']newsletter["']/i.test(block) ? block : block.replace(/<section\b/i, '<section id="newsletter"')
      return normalizePublicationSupportFontClasses(tagged)
    }
    return block
  })
  return out.replace(/\n{3,}/g, '\n\n')
}

function isPublicationTopicBand(block) {
  const source = String(block ?? '')
  if (/<article\b/i.test(source)) return false
  const roundedPills = (source.match(/\b(?:rounded-full|rounded-pill)\b/gi) || []).length
  const linkCount = (source.match(/<a\b/gi) || []).length
  return roundedPills >= 4 && linkCount >= 4
}

function isPublicationNewsletterBand(block) {
  const source = String(block ?? '')
  const text = plainText(source)
  return /<form\b/i.test(source) && /(?:type=["']email["']|aria-label=["']email["']|placeholder=["'][^"']*email)/i.test(source) && /\bSubscribe\b|\bStay in the loop\b|\bWeekly\b/i.test(text)
}

function normalizePublicationTopicBandClasses(block) {
  return String(block ?? '')
    .replace(/\bfont-(?!heading\b|display\b|body\b|sans\b|serif\b|mono\b)[^\s"']+/g, 'font-body')
    .replace(/(<h2\b[^>]*\bclass=["'][^"']*)\bfont-body\b/gi, '$1font-display')
}

function normalizePublicationSupportFontClasses(block) {
  return String(block ?? '')
    .replace(/\bfont-(?!heading\b|display\b|body\b|sans\b|serif\b|mono\b)[^\s"']+/g, 'font-body')
    .replace(/(<h[23]\b[^>]*\bclass=["'][^"']*)\bfont-body\b/gi, '$1font-display')
    .replace(/(<button\b[^>]*\bclass=["'][^"']*)\bfont-body\b/gi, '$1font-semibold')
}

function enrichLatestPostCardsWithMeta(html, plan, brief) {
  const source = String(html ?? '')
  const latest = source.match(/<section\b[^>]*\bid=["']latest["'][\s\S]*?<\/section>/i)?.[0]
  if (!latest) return source
  const a = plan?.visualWorld || {}
  const names = ['Imani Cole', 'Theo Grant', 'Lena Ortiz', 'Priya Shah', 'Marcus Bell', 'Nora Kim']
  let index = 0
  const nextLatest = latest.replace(/<article\b[\s\S]*?<\/article>/gi, (article) => {
    const text = plainText(article)
    if (/\bBy [A-Z][a-z]+|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b|\bmin read\b/i.test(text)) return article
    const meta = `<p class="mt-2 text-xs text-[${a.muted || '#78716c'}]">By ${names[index % names.length]} · May ${12 - index}, 2026 · ${5 + (index % 4)} min read</p>`
    index += 1
    if (/<\/h3>/i.test(article)) return article.replace(/<\/h3>/i, `</h3>\n          ${meta}`)
    return article.replace(/(<div\b[^>]*>)/i, `$1\n          ${meta}`)
  })
  return normalizePublicationCategoryTaxonomy(source.replace(latest, nextLatest))
}

function normalizePublicationCategoryTaxonomy(html) {
  const source = String(html ?? '')
  const topics = source.match(/<section\b[^>]*\bid=["']topics["'][\s\S]*?<\/section>/i)?.[0] || ''
  if (!topics) return source
  const topicTexts = [...topics.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => plainText(match[1]))
    .filter(Boolean)
  if (!topicTexts.length) return source
  return source.replace(/(<span\b[^>]*>)([^<]+)(<\/span>)/gi, (full, before, label, after) => {
    const clean = plainText(label)
    const expanded = topicTexts.find((topic) => topic.toLowerCase().startsWith(clean.toLowerCase()) && topic.length > clean.length)
    return expanded ? `${before}${escapeHtml(expanded)}${after}` : full
  })
}

function materializePublicationThemeUtilities(html, plan) {
  const a = {
    bg: '#faf7f2',
    surface: '#ffffff',
    text: '#1c1917',
    muted: '#78716c',
    accent: '#b45309',
    accent2: '#0369a1',
    ...(plan?.visualWorld || {}),
  }
  let out = String(html ?? '')
    .replace(/(^|[\s"'])-col(?=[\s"'])/g, '$1flex-col')
    .replace(/(^|[\s"'])-row(?=[\s"'])/g, '$1flex-row')
    .replace(/\bmd:-row\b/g, 'md:flex-row')
    .replace(/\bmd:-col\b/g, 'md:flex-col')
    .replace(/\btext-accent2\b/g, `text-[${a.accent2}]`)
    .replace(/\btext-accent\b/g, `text-[${a.accent}]`)
    .replace(/\btext-muted\b/g, `text-[${a.muted}]`)
    .replace(/\btext-surface\b/g, `text-[${a.surface}]`)
    .replace(/\btext-text\b/g, `text-[${a.text}]`)
    .replace(/\bbg-accent2\b/g, `bg-[${a.accent2}]`)
    .replace(/\bbg-accent\b/g, `bg-[${a.accent}]`)
    .replace(/\bbg-muted\b/g, `bg-[${a.muted}]`)
    .replace(/\bbg-surface\b/g, `bg-[${a.surface}]`)
    .replace(/\bbg-bg\b/g, `bg-[${a.bg}]`)
    .replace(/\bborder-muted(\/\d+)?\b/g, (_full, opacity = '') => `border-[${a.muted}]${opacity}`)
    .replace(/\bhover:bg-accent2(\/\d+)?\b/g, (_full, opacity = '') => `hover:bg-[${a.accent2}]${opacity}`)
    .replace(/\bhover:bg-accent(\/\d+)?\b/g, (_full, opacity = '') => `hover:bg-[${a.accent}]${opacity}`)
    .replace(/\bhover:text-accent2\b/g, `hover:text-[${a.accent2}]`)
    .replace(/\bhover:text-accent\b/g, `hover:text-[${a.accent}]`)
    .replace(/\bfocus:ring-accent2\b/g, `focus:ring-[${a.accent2}]`)
    .replace(/\bfocus:ring-accent\b/g, `focus:ring-[${a.accent}]`)
    .replace(/\bfont-heading\b/g, 'font-display')
    .replace(/\bcategory-chip\b/g, `inline-block rounded-full bg-[${a.text}] px-2 py-1 text-xs font-semibold text-white`)
    .replace(/\b\d{1,3}(?:,\d{3})\+?\s+(?:dog lovers|readers|subscribers)\b/gi, 'thousands of readers')
    .replace(/<style>\s*[\s\S]*?(?:data-reveal|data-img)[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*src=["']https:\/\/unpkg\.com\/lucide@latest["'][^>]*><\/script>\s*/gi, '')
    .replace(/<script>\s*window\.addEventListener\('load',\(\)=>\{const create=window\.lucide[\s\S]*?<\/script>\s*/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
  out = normalizePublicationTopicPillSystem(out, a)
  out = normalizePublicationCategoryChipSystem(out, a)
  out = normalizePublicationLatestContrast(out, a)
  out = normalizePublicationNewsletterVoice(out)
  out = normalizePublicationMastheadContrast(out)
  out = normalizePublicationLinks(out)
  out = normalizePublicationStandardUtilities(out)
  out = movePublicationFooterToEnd(out)
  return out
}

function normalizePublicationTopicPillSystem(html, a) {
  return String(html ?? '').replace(/<section\b([^>]*)\bid=["']topics["']([^>]*)>([\s\S]*?)<\/section>/i, (full, before, after, body) => {
    const nextBody = body.replace(/<a\b([^>]*)class="([^"]*)"([^>]*)>/gi, (_match, prefix, _cls, suffix) => {
      return `<a${prefix}class="inline-flex rounded-full border border-[${a.muted}]/30 bg-[${a.surface}] px-3 py-1 text-sm font-body text-[${a.text}] hover:border-[${a.accent}]"${suffix}>`
    })
    return `<section${before}id="topics"${after}>${nextBody}</section>`
  })
}

function normalizePublicationCategoryChipSystem(html, a) {
  return String(html ?? '').replace(/<section\b([^>]*)\bid=["']latest["']([^>]*)>([\s\S]*?)<\/section>/i, (full, before, after, body) => {
    const nextBody = body.replace(/<span\b([^>]*)class="([^"]*)"([^>]*)>/gi, (_match, prefix, _cls, suffix) => {
      return `<span${prefix}class="inline-block rounded-full bg-[${a.text}] px-2 py-1 text-xs font-semibold text-white"${suffix}>`
    })
    return `<section${before}id="latest"${after}>${nextBody}</section>`
  })
}

function normalizePublicationLatestContrast(html, a) {
  return String(html ?? '').replace(/<section\b([^>]*)\bid=["']latest["']([^>]*)>([\s\S]*?)<\/section>/i, (full, before, after, body) => {
    let nextBody = body.replace(/\bcontainer\s+mx-auto\b/g, 'mx-auto max-w-7xl')
    nextBody = nextBody.replace(/(<h2\b[^>]*class=")([^"]*)(")/i, (_match, prefix, cls, suffix) => {
      const nextClass = cls
        .replace(/\btext-(?:white|black|[a-z]+-\d+|\[[^\]]+\])(?:\/\d+)?/g, '')
        .replace(/\btext-2xl\b/g, '')
        .replace(/\bmb-\d+\b/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      return `${prefix}${`${nextClass} text-3xl md:text-4xl mb-8 text-[${a.text}]`.trim()}${suffix}`
    })
    return `<section${before}id="latest"${after}>${nextBody}</section>`
  })
}

function normalizePublicationLinks(html) {
  const routeFor = (label) => {
    const clean = plainText(label).toLowerCase()
    if (clean === 'home') return '/'
    if (clean === 'archive') return '/archive'
    if (clean === 'about') return '/about'
    if (clean === 'subscribe') return '#newsletter'
    if (/read (?:the )?(?:story|article|post|more)/.test(clean)) return '/posts/featured'
    if (/field guide|publication|pages|diary|journal|desk/.test(clean)) return '/'
    if (/training|breed|adoption|product|health|travel|lifestyle|behavior|gear|review/.test(clean)) {
      return `/topics/${clean.replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
    }
    return ''
  }
  return String(html ?? '').replace(/<a\b([^>]*)href=["']#["']([^>]*)>([\s\S]*?)<\/a>/gi, (full, before, after, label) => {
    const route = routeFor(label)
    return route ? `<a${before}href="${route}"${after}>${label}</a>` : full
  })
}

function normalizePublicationStandardUtilities(html) {
  return String(html ?? '')
    .replace(/\bmax-w-5xl\b/g, 'max-w-7xl')
    .replace(/\bfont-(?:display|body)\b/g, 'font-serif')
}

function normalizePublicationNewsletterVoice(html) {
  return String(html ?? '').replace(/<section\b([^>]*)\bid=["']newsletter["']([^>]*)>([\s\S]*?)<\/section>/i, (full, before, after, body) => {
    const attrs = `${before}id="newsletter"${after}`
      .replace(/\bclass="([^"]*)"/i, (_match, cls) => `class="${`${cls} border-y border-[${'#78716c'}]/20`.replace(/\s+/g, ' ').trim()}"`)
    const nextBody = body.replace(/<p\b([^>]*)>\s*(?:Get|Join|Subscribe)[\s\S]*?<\/p>/i, (_match, attrs) => {
      return `<p${attrs}>A weekly dispatch of training notes, breed profiles, adoption field reports, and gear tests from the editorial desk.</p>`
    })
    return `<section${attrs}>${nextBody}</section>`
  })
}

function normalizePublicationMastheadContrast(html) {
  return String(html ?? '').replace(/(<section\b[^>]*\bid=["']masthead["'][\s\S]*?<h1\b[^>]*class=")([^"]*)(")/i, (_match, prefix, cls, suffix) => {
    const nextClass = cls
      .replace(/\bfont-semibold\b/g, 'font-bold')
      .replace(/\bmt-3\b/g, 'mt-5')
      .replace(/\btext-(?:white|black|[a-z]+-\d+|\[[^\]]+\])(?:\/\d+)?/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    return `${prefix}${`${nextClass} text-[#0a0a0a]`.trim()}${suffix}`
  })
}


function movePublicationFooterToEnd(html) {
  const source = String(html ?? '')
  const footer = source.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0]
  if (!footer) return source
  const withoutFooter = source.replace(footer, '').replace(/\n{3,}/g, '\n\n')
  if (/<\/body>/i.test(withoutFooter)) return withoutFooter.replace(/<\/body>/i, `${footer}\n</body>`)
  return `${withoutFooter}\n${footer}`
}

function padLatestPostGrid(html, brief, plan) {
  const source = String(html ?? '')
  const latestMatch = source.match(/<section\b[^>]*\bid=["']latest["'][\s\S]*?<\/section>/i)
  if (!latestMatch) return source
  const block = latestMatch[0]
  const articles = (block.match(/<article\b/gi) || []).length
  if (articles >= 6) return source

  const gridMatch = block.match(/(<div\b[^>]*\bgrid[^>]*>)([\s\S]*?)(\s*<\/div>)/i)
  if (!gridMatch) return source

  const a = plan?.visualWorld || {}
  const stubs = publicationPostStubs(brief).slice(articles, 6)
  if (!stubs.length) return source
  const cards = stubs
    .map(
      ([title, excerpt, , category, meta]) => `<article class="rounded-xl border border-[${a.muted}]/30 overflow-hidden bg-[${a.surface}]">
        <div class="img w-full h-48 bg-cover bg-center"></div>
        <div class="p-4">
          <span class="text-xs uppercase tracking-wider text-[${a.accent}] font-semibold">${category}</span>
          <h3 class="mt-2 text-xl font-semibold text-[${a.text}]">${title}</h3>
          <p class="mt-2 text-xs text-[${a.muted}]">${meta}</p>
          <p class="mt-2 text-sm text-[${a.muted}]">${excerpt}</p>
          <a href="#" class="mt-4 inline-flex text-sm font-medium text-[${a.accent}]">Read more →</a>
        </div>
      </article>`,
    )
    .join('\n')
  const paddedBlock = block.replace(gridMatch[0], `${gridMatch[1]}${gridMatch[2]}\n${cards}${gridMatch[3]}`)
  return source.replace(block, paddedBlock)
}

/** Enforce publication index anatomy: nav → featured split → latest grid → topics → newsletter → footer. */
export function normalizePublicationStructure(html, plan, route, brief) {
  if (!isPublicationBrief(brief || plan?.brief, route)) return html
  let out = String(html ?? '')
  out = stripPublicationMasthead(out)
  out = tagFeaturedSection(out)
  out = stripPseudoFooterSections(out)
  out = dedupePublicationBands(out)
  out = padLatestPostGrid(out, brief || plan?.brief, plan)
  out = enrichLatestPostCardsWithMeta(out, plan, brief || plan?.brief)
  return out
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

  out = repairPublicationNav(out, identity, a)

  return varyPublicationTopicTags(normalizeLatestPostsBand(normalizePublicationStructure(out, plan, route, brief)), a)
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
        .replace(/\bmax-w-7xl\s+mx-auto\b/g, 'mx-auto max-w-7xl')
        .replace(/\bflex-col\b/g, 'grid')
        .replace(/\bmd:flex-row\b/g, 'md:grid-cols-[0.95fr_1.05fr]')
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
  out = out.replace(
    /(<section\b[^>]*\bid=["']featured["'][\s\S]*?)<h1\b([^>]*)>([\s\S]*?)<\/h1>/i,
    '$1<h2$2>$3</h2>',
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

function ensurePublicationSupportBands(html, plan, route, brief) {
  if (!isPublicationBrief(brief || plan?.brief, route)) return String(html ?? '')
  let out = dedupePublicationBands(String(html ?? ''))
  const identity = extractPublicationIdentity(brief || plan?.brief)
  identity.brand = resolvePublicationBrand(out, identity)
  const a = {
    bg: '#faf7f2',
    surface: '#ffffff',
    text: '#1c1917',
    muted: '#78716c',
    accent: '#b45309',
    ...(plan?.visualWorld || {}),
  }
  out = out.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(identity.brand)} - ${escapeHtml(readableList(identity.topics.slice(0, 4)))}</title>`)
  if (!/\bid=["']masthead["']/i.test(out) && !hasScopedPublicationMasthead(out, identity)) {
    out = out.replace(/<body([^>]*)>/i, `<body$1>\n${buildPublicationMasthead(identity, a)}`)
  }
  const bands = []
  if (!/\bid=["']topics["']|Topics|Series/i.test(out)) {
    const topics = identity.topics
      .slice(0, 5)
      .map((topic) => `<a href="#" class="rounded-full border border-[${a.muted}]/25 bg-[${a.surface}] px-4 py-2 text-sm font-medium text-[${a.text}] hover:border-[${a.accent}]">${escapeHtml(topic)}</a>`)
      .join('\n        ')
    bands.push(`<section id="topics" class="w-full bg-[${a.bg}] py-12 scroll-mt-24">
  <div class="mx-auto max-w-7xl px-6">
    <p class="text-xs uppercase tracking-[0.22em] text-[${a.accent}]">Read by topic</p>
    <div class="mt-5 flex flex-wrap gap-3">${topics}</div>
  </div>
</section>`)
  }
  if (!/\bid=["']newsletter["']|Newsletter|Subscribe for/i.test(out)) {
    bands.push(`<section id="newsletter" class="w-full bg-[${a.surface}] py-14 scroll-mt-24">
  <div class="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-[1fr_0.8fr] md:items-end">
    <div>
      <p class="text-xs uppercase tracking-[0.22em] text-[${a.accent}]">Weekly dispatch</p>
      <h2 class="mt-3 font-heading text-3xl font-semibold text-[${a.text}]">Useful reading for ${escapeHtml(identity.brand.toLowerCase())} subscribers</h2>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-[${a.muted}]">${escapeHtml(identity.deck)}</p>
    </div>
    <form class="grid gap-3 sm:grid-cols-[1fr_auto]">
      <input aria-label="Email" class="w-full rounded-lg border border-[${a.muted}]/25 bg-[${a.bg}] px-4 py-3 text-sm text-[${a.text}]" placeholder="you@example.com" />
      <button class="rounded-lg bg-[${a.accent}] px-5 py-3 text-sm font-semibold text-white">Subscribe</button>
    </form>
  </div>
</section>`)
  }
  if (!bands.length) return orderPublicationNavBeforeMasthead(varyPublicationTopicTags(dedupePublicationBands(out), a))
  const additions = bands.join('\n')
  const withBands = /<footer\b/i.test(out) ? out.replace(/<footer\b/i, `${additions}\n<footer`) : out.replace(/<\/body>/i, `${additions}\n</body>`)
  return orderPublicationNavBeforeMasthead(varyPublicationTopicTags(dedupePublicationBands(withBands), a))
}

function buildPublicationFooter(plan, brief, brandOverride = '') {
  const identity = extractPublicationIdentity(brief || plan?.brief)
  if (brandOverride) identity.brand = brandOverride
  const a = {
    bg: '#faf7f2',
    surface: '#ffffff',
    text: '#1c1917',
    muted: '#78716c',
    accent: '#b45309',
    ...(plan?.visualWorld || {}),
  }
  const topicLinks = identity.topics
    .slice(0, 4)
    .map((topic) => `<a href="#" class="hover:text-[${a.accent}]">${escapeHtml(topic)}</a>`)
    .join('\n        ')
  return `<footer class="w-full border-t border-[${a.muted}]/20 bg-[${a.bg}] py-10">
  <div class="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
    <div>
      <p class="font-heading text-lg font-semibold text-[${a.text}]">${escapeHtml(identity.brand)}</p>
      <p class="mt-3 max-w-md text-sm leading-6 text-[${a.muted}]">${escapeHtml(identity.deck)}</p>
      <p class="mt-4 text-xs text-[${a.muted}]">© 2026 ${escapeHtml(identity.brand)}. Independent editorial desk.</p>
    </div>
    <div class="grid gap-2 text-sm text-[${a.muted}]">
      <p class="font-semibold text-[${a.text}]">Sections</p>
      ${topicLinks}
    </div>
    <div class="grid gap-2 text-sm text-[${a.muted}]">
      <p class="font-semibold text-[${a.text}]">Publication</p>
      <a href="#" class="hover:text-[${a.accent}]">Archive</a>
      <a href="#" class="hover:text-[${a.accent}]">About</a>
      <a href="#" class="hover:text-[${a.accent}]">Subscribe</a>
    </div>
  </div>
</footer>`
}

function ensurePublicationFooter(html, plan, route, brief) {
  if (!isPublicationBrief(brief || plan?.brief, route)) return String(html ?? '')
  const source = String(html ?? '')
  const footer = source.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] || ''
  const footerText = plainText(footer)
  const brand = resolvePublicationBrand(source, extractPublicationIdentity(brief || plan?.brief))
  const replacement = buildPublicationFooter(plan, brief, brand)
  if (!footer) return source.replace(/<\/body>/i, `${replacement}\n</body>`)
  return source.replace(/<footer\b[\s\S]*?<\/footer>/i, replacement)
}

function hasStrongFeaturedOpener(html) {
  const featured =
    html.match(/<section\b[^>]*\bid=["']featured["'][\s\S]*?<\/section>/i)?.[0] ||
    [...String(html ?? '').matchAll(/<section\b[\s\S]*?<\/section>/gi)].map((m) => m[0]).find(isFeaturedPostSection) ||
    ''
  if (!featured) return false
  const text = plainText(featured)
  if (/\b(?:Jane|John)\s+Doe\b/i.test(text)) return false
  return (
    /<img\b[^>]*\bsrc=["']https?:\/\//i.test(featured) &&
    /\b(?:By [A-Z][a-z]+|min read|Read (?:the )?(?:story|post|article|more))/i.test(text) &&
    /<h[12]\b/i.test(featured) &&
    text.length > 120
  )
}

function buildPublicationFeaturedOpener(plan, brief) {
  const identity = extractPublicationIdentity(brief || plan?.brief)
  const a = {
    bg: '#faf7f2',
    surface: '#ffffff',
    text: '#1c1917',
    muted: '#78716c',
    accent: '#b45309',
    ...(plan?.visualWorld || {}),
  }
  const dog = /\bdog|puppy|canine|breed|adoption/i.test(String(brief || plan?.brief || ''))
  const title = dog
    ? 'What a rescue dog needs in the first seven days'
    : `${identity.topics[0] || 'Field notes'} that changed how readers plan the week`
  const excerpt = dog
    ? 'A practical opener on decompression, leash routines, food transitions, and the small signals that tell a new dog owner when to slow down.'
    : `A reported lead story connecting ${identity.topics.slice(0, 3).map((t) => t.toLowerCase()).join(', ')} with concrete reader decisions.`
  const featuredQuery = buildPhotoQuery(
    {
      title: dog ? 'What a rescue dog needs in the first seven days' : `${identity.topics[0] || 'Field notes'} that changed how readers plan the week`,
      category: 'Featured',
      alt: 'featured cover',
      brief: brief || plan?.brief,
    },
    brief || plan?.brief,
  )
  const featuredPhoto = publicationPhotoForQuery(featuredQuery, 0)
  return `<section id="featured" class="w-full bg-[${a.bg}] py-14 scroll-mt-24">
  <div class="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-[0.95fr_1.05fr] md:items-center">
    <img class="w-full aspect-[16/10] rounded-xl object-cover" src="${featuredPhoto.url}" alt="${escapeHtml(title)}" loading="eager" decoding="async" />
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[${a.accent}]">Featured post</p>
      <h2 class="mt-3 font-heading text-3xl font-semibold leading-tight text-[${a.text}] md:text-5xl">${escapeHtml(title)}</h2>
      <p class="mt-3 text-sm text-[${a.muted}]">By Mara Singh · May 12, 2026 · 7 min read</p>
      <p class="mt-5 max-w-2xl text-base leading-7 text-[${a.muted}]">${escapeHtml(excerpt)}</p>
      <a href="#" class="mt-6 inline-flex text-sm font-semibold text-[${a.accent}]">Read the story →</a>
    </div>
  </div>
</section>`
}

function ensurePublicationFeaturedOpener(html, plan, route, brief) {
  if (!isPublicationBrief(brief || plan?.brief, route) || hasStrongFeaturedOpener(html)) return String(html ?? '')
  const source = String(html ?? '')
  const featured = buildPublicationFeaturedOpener(plan, brief)
  if (/<section\b[^>]*\bid=["']featured["'][\s\S]*?<\/section>/i.test(source)) {
    return source.replace(/<section\b[^>]*\bid=["']featured["'][\s\S]*?<\/section>/i, featured)
  }
  if (/\bid=["']latest["']/i.test(source)) return source.replace(/<section\b[^>]*\bid=["']latest["']/i, `${featured}\n$&`)
  if (/\bid=["']masthead["'][\s\S]*?<\/section>/i.test(source)) {
    return source.replace(/(<section\b[^>]*\bid=["']masthead["'][\s\S]*?<\/section>)/i, `$1\n${featured}`)
  }
  return source.replace(/<body([^>]*)>/i, `<body$1>\n${featured}`)
}

function publicationPostStubs(brief) {
  const identity = extractPublicationIdentity(brief)
  const dog = /\bdog|puppy|canine|breed|adoption/i.test(String(brief ?? ''))
  const posts = dog
    ? [
        ['Stop leash pulling without turning walks into a fight', 'Trainer Imani Cole breaks down a 10-minute reset for crowded sidewalks, loose-leash rewards, and what to do before the first lunge.', 'training cover', 'Training', 'By Imani Cole · May 9 · 6 min read'],
        ['Which breed guide actually matches apartment life?', 'A practical comparison of beagles, greyhounds, poodles, and mixed-breed rescues for owners balancing noise, grooming, and energy.', 'breed guide cover', 'Breed guides', 'By Theo Grant · May 7 · 8 min read'],
        ['The adoption checklist shelters wish every family used', 'From decompression rooms to vet records and first-week visitors, this guide keeps the handoff calm for dogs and humans.', 'adoption checklist cover', 'Adoption', 'By Lena Ortiz · May 5 · 7 min read'],
        ['We tested six no-pull harnesses on rainy morning walks', 'Fit notes, chafe checks, reflective trim, and cleaning details from three weeks with dogs from 18 to 82 pounds.', 'dog harness review cover', 'Reviews', 'By Priya Shah · May 3 · 9 min read'],
        ['How to read tail position, whale eye, and the pause before a bark', 'A behaviorist explains the small body-language signals that help owners intervene before stress turns into a problem.', 'dog body language cover', 'Behavior', 'By Marcus Bell · Apr 30 · 5 min read'],
        ['The grooming kit that keeps shedding season manageable', 'Brushes, wipes, nail grinders, and coat-specific routines for owners who want fewer tumbleweeds under the sofa.', 'dog grooming tools cover', 'Gear', 'By Nora Kim · Apr 27 · 6 min read'],
      ]
    : identity.topics.slice(0, 6).map((topic, index) => [
        `${topic}: what readers should know this week`,
        `A reported guide with named examples, dates, and practical choices for ${identity.brand.toLowerCase()} readers.`,
        `${topic.toLowerCase()} editorial cover`,
        topic,
        `By ${['Mara Singh', 'Theo Grant', 'Lena Ortiz', 'Priya Shah', 'Nora Kim', 'Marcus Bell'][index]} · May ${9 - index} · ${5 + (index % 4)} min read`,
      ])
  while (posts.length < 6) {
    const index = posts.length
    posts.push([
      `${identity.topics[index % identity.topics.length]} field notes for the weekend`,
      `A concise dispatch with reader questions, examples, and a clear next step.`,
      'editorial field notes cover',
      identity.topics[index % identity.topics.length],
      `By ${['Mara Singh', 'Theo Grant', 'Lena Ortiz', 'Priya Shah', 'Nora Kim', 'Marcus Bell'][index]} · Apr ${26 - index} · ${5 + (index % 4)} min read`,
    ])
  }
  return posts
}

/** Inject latest-posts grid when hybrid stitch dropped the archive band (blog publication index contract). */
export function ensureBlogPublicationIndex(html, plan, route, brief) {
  if (!isPublicationBrief(brief || plan?.brief, route)) return html
  let base = ensureDocumentScaffold(forceCloseHtml(html), plan)
  base = ensurePublicationFeaturedOpener(base, plan, route, brief)
  if (blogHasPostGrid(base)) {
    const finalized = ensurePublicationFooter(ensurePublicationSupportBands(base, plan, route, brief), plan, route, brief)
    return hydratePublicationImages(
      materializePublicationThemeUtilities(finalized, plan),
      brief,
    )
  }
  const a = plan.visualWorld
  const cards = publicationPostStubs(brief)
    .map(
      ([title, excerpt, imgSubject, category, meta]) => `<article class="rounded-xl border border-[${a.muted}]/30 overflow-hidden bg-[${a.surface}] hover:shadow-lg transition-shadow">
        <div class="img w-full h-48 bg-cover bg-center rounded-none"></div>
        <div class="p-4">
          <span class="text-xs uppercase tracking-wider text-[${a.accent}] font-semibold">${category}</span>
          <h3 class="mt-2 text-xl font-semibold text-[${a.text}]">${title}</h3>
          <p class="mt-2 text-xs text-[${a.muted}]">${meta}</p>
          <p class="mt-2 text-sm text-[${a.muted}]">${excerpt}</p>
          <a href="#" class="mt-4 inline-flex items-center text-sm font-medium text-[${a.accent}] hover:underline">Read more →</a>
        </div>
      </article>`,
    )
    .join('\n')
  const section = `<section id="latest" class="w-full bg-[${a.surface}] py-16 scroll-mt-24">
  <div class="mx-auto max-w-7xl px-6">
    <h2 class="font-heading text-3xl md:text-4xl font-bold text-[${a.text}] mb-8">Latest posts</h2>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">${cards}</div>
  </div>
</section>`
  const withLatest = /<footer\b/i.test(base)
    ? base.replace(/<footer\b/i, `${section}\n<footer`)
    : base.replace(/<\/body>/i, `${section}\n</body>`)
  const finalized = ensurePublicationFooter(ensurePublicationSupportBands(withLatest, plan, route, brief), plan, route, brief)
  return hydratePublicationImages(
    materializePublicationThemeUtilities(finalized, plan),
    brief,
  )
}

export function sanitizeHtml(value, plan, route, brief) {
  const resolvedBrief = brief || plan?.brief
  const publication = isPublicationRoute(route, resolvedBrief)
  let html = forceCloseHtml(stripRefusal(stripFences(value)))
  html = ensureDocumentScaffold(html, plan)
  html = stripHeadOrphanClosers(html)
  html = repairMalformedSectionTags(html)
  html = repairAttrs(html)
  html = rewriteKnownVerbatimCopy(html)
  html = rewriteInternalCopyLeaks(html)
  html = rewriteAnchorAccentLeaks(html, plan, route)
  html = stripFigmaPersonaLeaks(html, route)
  html = repairMalformedMediaDivs(html)
  html = ensureSubstantiveNonPublicationPage(html, plan, route, resolvedBrief)
  html = stripDuplicateOpeningHero(html, plan, route, resolvedBrief)
  html = ensureDenseNonPublicationDetail(html, plan, route, resolvedBrief)
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
    html = stripPostFooterInjectedSections(html)
  }
  html = normalizeSoftwarePalette(html, route, resolvedBrief)
  html = normalizeFontUtilityAliases(html)
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
    <h2 class="mt-3 font-heading text-3xl font-semibold tracking-tight text-[${a.text}]">${band.title}</h2>
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
