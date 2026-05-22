import { decorPromptLine } from '../media/ambient-effects.js'
import { grammarPromptBlock } from '../grammars.js'
import { mediaStrategyBlock } from '../media/media-presets.js'
import { mobbinDoctrineBlock, mobbinSessionBlock } from './mobbin-blocks.js'

export const BUILDER_SYSTEM =
  'You are a world-class frontend designer. Output raw HTML only. No markdown fences, no prose.'

/** Fast bench path only — set KIMI_FAST=1 */
export const FAST_MODE = process.env.KIMI_FAST === '1'

function siteKindRules(route) {
  if (route?.siteHint === 'portfolio') {
    return 'PORTFOLIO: solo freelance designer — typographic hero + ONE tasteful visual. Never a Designers/Engineers/PM persona trio.'
  }
  if (route?.siteHint === 'agency') {
    return 'AGENCY: studio for hire — confident split hero, client proof, services band. Not a personal résumé.'
  }
  if (route?.siteHint === 'fitness') {
    return 'FITNESS: schedule-first hero with class times and membership CTA. High-energy training floor, not spa/hotel.'
  }
  return ''
}

function qualityLayoutRules(a) {
  return `HARD RULES (release-quality):
- Tailwind utilities ONLY via CDN. NO model-authored <style> blocks. NO @apply.
- Every section: <section class="w-full ..."> with ONE inner <div class="mx-auto max-w-7xl px-6 ...">. Sections are siblings — never nest a new <section> inside an open grid from above.
- GRID RULE: collections (products, cases, classes, rooms, posts) use a responsive grid spanning the full inner width (e.g. grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6). Never a lone narrow column or half-empty row.
- SIMPLE-LAYOUT: straightforward grids and stacks only. No rotation, negative margins, or fanned/overlapping cards for effect. Shallow DOM; every <div> closed.
- NO BLUR ORBS: Never use blur-3xl or blur-2xl as decorative background effects. No ambient glow blobs. Achieve depth via solid surface colors, borders, and box-shadow only.
- NO ROTATIONS: Never use -rotate- on any element. No tilted cards. Use color and border weight for visual accent.
- PROSE RULE: long copy in max-w-2xl/3xl or a balanced 2-col split — never a tall narrow paragraph cell beside short cards.
- NO page JS except harmless hover transitions. Everything visible on load — no opacity-0 reveal states.
- ICONS: <i data-lucide="name" class="w-5 h-5"></i> only — never <svg>.
- IMAGES: <div data-img="short concrete subject" class="w-full aspect-[4/3] rounded-xl bg-[${a.muted}]/40 border border-[${a.muted}]/30"></div> — never <img>, never raw URLs in tags. Pair each image box with real titles/captions; never a wall of empty boxes.
- HERO: headline, subhead, 1-2 CTAs, optional ONE side visual. No forms or dense widgets in hero.
- STICKY NAV: if sticky, every <section> needs scroll-mt-24.
- Real specific copy (no lorem, no generic SaaS filler). Generous vertical rhythm (py-16–py-24).
- SPECIFICITY (REQUIRED): Include at least 6 concrete data points — real named people ("Yuki Nakamura, Head Brewer"), real numbers ("37 seasonal varieties", "$24 per flight", "Since 1987"), real locations, real product names. Never write "Team Member Name", "00%", "$0.00", or generic filler.`
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
${siteKindRules(route)}
Rules: Tailwind CDN only; <i data-lucide>; simple <div data-img> with aspect ratio; full-width sections; real copy; tags closed.`
  }

  return `Brand: ${brief}
This page is a "${plan.archetype}". Build it like a world-class designer — Kimi / Linear / Vercel grade craft, not a schematic template.

VISUAL WORLD (obey EXACTLY so stitched parts fuse):
- Palette: bg ${a.bg}, surface ${a.surface}, text ${a.text}, muted ${a.muted}, accent ${a.accent}${acc2}. Use arbitrary hex: bg-[${a.bg}], text-[${a.text}], bg-[${a.accent}], border-[${a.muted}].
- Fonts: "${a.fontDisplay}" display + "${a.fontBody}" body (Google Fonts <link> + inline tailwind.config). Confident type scale — large, tight-tracked display headings.
- Mood: ${a.mood}. Reference: ${reference}. DECOR (apply for depth, not noise): ${a.decor}.

${grammarPromptBlock(grammar, variety)}
${mediaStrategyBlock(route.siteHint, variety, grammar)}
${mobbinSessionBlock(route.primary, route.secondary)}

${siteKindRules(route)}
${qualityLayoutRules(a)}
${mobbinDoctrineBlock()}

Treatment hint: ${decorPromptLine(treatment)}`
}

export function sectionList(sections) {
  return (sections || []).map((s, i) => `${i + 1}. ${s.role} — ${s.contains}`).join('\n')
}
