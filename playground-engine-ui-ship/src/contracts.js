import { decorPromptLine } from './media/ambient-effects.js'
import { grammarPromptBlock } from './grammars.js'
import { mediaStrategyBlock } from './media/media-presets.js'
import { mobbinDoctrineBlock, mobbinSessionBlock } from './utils/mobbin-blocks.js'
import { isPublicationRoute } from './utils/publication-route.js'

export const BUILDER_SYSTEM =
  'You are a world-class frontend designer. Output raw HTML only. No markdown fences, no prose.'

/** Fast bench path — set SHIP_FAST=1 (or legacy KIMI_FAST=1) */
export const FAST_MODE = process.env.SHIP_FAST === '1' || process.env.KIMI_FAST === '1'

export { isPublicationRoute }

function siteKindRules(route, brief = '') {
  if (route?.siteHint === 'blog') {
    return `BLOG/PUBLICATION HOME (critical):
- Article index, NOT a SaaS landing or open-source developer platform.
- PRODUCTION BLOCK CONTRACT: (1) compact featured post split — cover photo LEFT, title + byline + date + excerpt + read link RIGHT; (2) "Latest posts" grid with 6+ cards — each card: photo thumbnail (img w-full h-48 object-cover), category pill, title, excerpt, read link; (3) topics/tags band; (4) newsletter signup; (5) footer.
- Use <div class="img w-full h-48 bg-cover bg-center rounded-md"></div> or <img class="w-full h-48 object-cover rounded-md" src="..."> for every card thumbnail — NEVER leave empty gray placeholder boxes.
- NEVER a marketing hero: no min-h-screen, no min-h-[70vh+], no full-viewport billboard, no aurora blobs, no dual signup CTAs above the fold.
- NO split marketing hero, NO repo/code mockup, NO dashboard panel, NO Features/Pricing nav, NO pricing tiers.
- Nav: Home, Archive, About, Subscribe (or topic-based: Articles, Breeds, Adoption, Reviews). Do not use the word "hero" in section comments.`
  }
  if (route?.siteHint === 'portfolio') {
    return 'PORTFOLIO: solo freelance designer — typographic hero + ONE tasteful visual. Never a Designers/Engineers/PM persona trio.'
  }
  if (route?.siteHint === 'agency') {
    return 'AGENCY: studio for hire — confident split hero, client proof, services band. Not a personal résumé.'
  }
  if (route?.siteHint === 'fitness') {
    return 'FITNESS: schedule-first hero with class times and membership CTA. High-energy training floor, not spa/hotel.'
  }
  if (route?.siteHint === 'editorial' && /\bblog\b/i.test(brief)) {
    return 'PUBLICATION: treat this as a blog/newsletter home — featured story + post grid. Avoid generic marketing hero CTAs.'
  }
  return ''
}

function qualityLayoutRules(a, route, brief) {
  const publication = isPublicationRoute(route, brief)
  const openerRule = publication
    ? '- FIRST VIEWPORT: compact featured post masthead only — normal section height (py-16 max), never min-h-screen, never min-h-[70vh+], never a marketing hero billboard.'
    : '- HERO: headline, subhead, 1-2 CTAs, optional ONE side visual. No forms or dense widgets in hero.'
  return `HARD RULES (release-quality):
- Tailwind utilities ONLY via CDN. NO model-authored <style> blocks. NO @apply.
- Every section: <section class="w-full ..."> with ONE inner <div class="mx-auto max-w-7xl px-6 ...">. Sections are siblings — never nest a new <section> inside an open grid from above.
- GRID RULE: collections (products, cases, classes, rooms, posts) use a responsive grid spanning the full inner width (e.g. grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6). Never a lone narrow column or half-empty row.
- SIMPLE-LAYOUT: straightforward grids and stacks only. No rotation, negative margins, or fanned/overlapping cards for effect. Shallow DOM; every <div> closed.
- PROSE RULE: long copy in max-w-2xl/3xl or a balanced 2-col split — never a tall narrow paragraph cell beside short cards.
- NO page JS except harmless hover transitions. Everything visible on load — no opacity-0 reveal states.
- ICONS: <i data-lucide="name" class="w-5 h-5"></i> only — never <svg>.
${publication
    ? `- IMAGES: every article card needs a photo thumbnail — <div class="img w-full h-48 bg-cover bg-center rounded-md"></div> or <img class="w-full h-48 object-cover rounded-md">. Featured cover uses the same img pattern. Never empty gray placeholder boxes.`
    : `- IMAGES: <div data-img="short concrete subject" class="w-full aspect-[4/3] rounded-xl bg-[${a.muted}]/40 border border-[${a.muted}]/30"></div> — never <img>, never raw URLs in tags.`}
${openerRule}
- STICKY NAV: if sticky, every <section> needs scroll-mt-24.
- Real specific copy (no lorem, no generic SaaS filler). Generous vertical rhythm (py-16–py-24).`
}

export function buildSharedContract(brief, plan, route, variety, grammar) {
  const a = plan.visualWorld
  const acc2 = a.accent2 && a.accent2 !== a.bg ? `, secondary ${a.accent2}` : ''
  const treatment = plan.mediaStrategy?.treatment || variety.mediaTreatment
  const reference = plan.reference || a.reference || route.primary?.app || 'category-leading craft'

  if (FAST_MODE) {
    return `Brand: ${brief}
Archetype: ${plan.archetype} · ${grammar.id}
Palette: bg ${a.bg}, surface ${a.surface}, text ${a.text}, muted ${a.muted}, accent ${a.accent}, accent2 ${a.accent2}
Fonts: "${a.fontDisplay}" + "${a.fontBody}" (Google Fonts + tailwind.config)
Mood: ${a.mood} · Decor: ${a.decor}
${siteKindRules(route, brief)}
Rules: Tailwind CDN only; <i data-lucide>; simple <div data-img> with aspect ratio; full-width sections; real copy; tags closed.`
  }

  return `Brand: ${brief}
This page is a "${plan.archetype}". Build it like a world-class designer — Kimi / Linear / Vercel grade craft, not a schematic template.

VISUAL WORLD (obey EXACTLY so stitched parts fuse):
- Palette: bg ${a.bg}, surface ${a.surface}, text ${a.text}, muted ${a.muted}, accent ${a.accent}${acc2}. Use arbitrary hex: bg-[${a.bg}], text-[${a.text}], bg-[${a.accent}], border-[${a.muted}].
- Fonts: "${a.fontDisplay}" display + "${a.fontBody}" body (Google Fonts <link> + inline tailwind.config). Confident type scale — large, tight-tracked display headings.
- Mood: ${a.mood}. Reference: ${reference}. DECOR (apply for depth, not noise): ${a.decor}.

${grammarPromptBlock(grammar, variety, route, brief)}
${mediaStrategyBlock(route.siteHint, variety, grammar, brief)}
${isPublicationRoute(route, brief) ? '' : mobbinSessionBlock(route.primary, route.secondary)}

${siteKindRules(route, brief)}
${qualityLayoutRules(a, route, brief)}
${isPublicationRoute(route, brief) ? '' : mobbinDoctrineBlock()}

Treatment hint: ${decorPromptLine(treatment, { publication: isPublicationRoute(route, brief) })}`
}

export function buildVerticalDocPrompt(brief, plan, route, variety, grammar) {
  const sections = (plan.sections || [])
    .map((section, index) => `${index + 1}. ${section.role}: ${section.contains}`)
    .join('\n')
  return `${buildSharedContract(brief, plan, route, variety, grammar)}

Build the COMPLETE vertical-doc page in one GPT-OSS pass. No stitching.

FULL-WIDTH BAND CONTRACT
- Every top-level content band is <section class="w-full ...">.
- Every band has exactly one main inner wrapper like <div class="mx-auto max-w-7xl px-6 ...">.
- Build 6-9 substantial full-width bands plus nav and footer.

Required content inventory:
${(plan.contentInventory || []).map((item) => `- ${item}`).join('\n')}

Section plan:
${sections}

Output the full document from <!DOCTYPE html> through </html>.`
}

export function sectionList(sections) {
  return (sections || []).map((s, i) => `${i + 1}. ${s.role} — ${s.contains}`).join('\n')
}
