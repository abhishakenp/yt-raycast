import { inferVisualKind, renderArtDirectedImageSurface } from './media-surfaces.js'

const REFUSAL = /\b(i'?m sorry|i can(?:'|no)t (?:fulfill|help|assist|comply|create)|as an ai|unable to (?:fulfill|comply))/i

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
  if (route?.primary?.app === 'Figma' && /portfolio|agency|designer|brand|creative|studio/.test(text)) {
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

export function replaceInlineMedia(value) {
  return String(value ?? '')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, '<i data-lucide="sparkles" class="h-5 w-5"></i>')
    .replace(/<img\b[^>]*>/gi, '<div data-img="brand asset" class="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-[#111827] via-[#374151] to-[#8b5cf6]"></div>')
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

export function beautifyImagePlaceholders(value, plan, route) {
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
    if (end === -1) continue
    const className = attrs.match(/\bclass=["']([^"']*)["']/i)?.[1] || ''
    out += html.slice(cursor, start)
    out += renderArtDirectedImageSurface(subject, className, plan, index++, route)
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

export function ensureHeroScale(value, plan) {
  if (plan?.pageKind === 'app-shell') return String(value ?? '')
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

export function ensureLucidePreview(html) {
  if (!/data-lucide=/.test(html)) return html
  if (/unpkg\.com\/lucide|lucide@/.test(html)) return html
  const tag = `<script src="https://unpkg.com/lucide@latest"></script><script>window.addEventListener('load',()=>{try{lucide.createIcons()}catch(e){}})</script>`
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${tag}\n</body>`) : `${html}\n${tag}`
}

export function looksLikeBadLeg(value) {
  const html = stripFences(value)
  const blocks = (html.match(/<(section|div|main|header|article|nav|table|ul)\b/gi) || []).length
  return !html || html.length < 300 || (REFUSAL.test(html) && blocks === 0)
}

export function sanitizeHtml(value, plan, route) {
  return ensureLucidePreview(
    ensureHeroScale(compressExcessiveSpacing(wrapCodeBlocks(annotateDataImgSurfaces(beautifyImagePlaceholders(replaceInlineMedia(rewriteAnchorAccentLeaks(rewriteInternalCopyLeaks(rewriteKnownVerbatimCopy(forceCloseHtml(stripRefusal(stripFences(value))))), plan, route)), plan, route), plan, route))), plan)
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/\sstyle=["'][^"']*["']/gi, ''),
  )
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

export function ensureMinimumVerticalSections(html, plan, minSections = 6, route) {
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
