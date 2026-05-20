import { mobbinDoctrineBlock, mobbinSessionBlock } from './mobbin-blocks.js'

const BUILDER_SYSTEM = `You are a senior frontend designer and HTML compiler. Output raw HTML only. No markdown fences, no prose.`

export { BUILDER_SYSTEM }

export function buildSharedContract(brief, plan, route, variety) {
  const a = plan.visualWorld
  return `Brief:
${brief}

Page archetype: ${plan.archetype}
Page kind: ${plan.pageKind}
Run fingerprint: ${variety.fingerprint}

VISUAL WORLD
- Background ${a.bg}; surface ${a.surface}; text ${a.text}; muted ${a.muted}; accent ${a.accent}; secondary accent ${a.accent2}.
- Fonts: ${a.fontDisplay} for display, ${a.fontBody} for body. Use Google Fonts links.
- Mood: ${a.mood}
- Decor: ${a.decor}
- Layout grammar: ${a.layoutGrammar}
- Signature moves: ${plan.signatureMoves.join('; ')}

${mobbinDoctrineBlock()}
${mobbinSessionBlock(route.primary, route.secondary)}

STRICT OUTPUT RULES
- One self-contained HTML file with Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script>.
- Tailwind utility classes only. Do not write a <style> block, CSS file, @apply, or inline SVG illustration.
- Use Tailwind arbitrary values with exact hex strings, for example bg-[${a.bg}] text-[${a.text}] border-[${a.muted}].
- Use Lucide placeholders only for icons: <i data-lucide="rocket" class="w-5 h-5"></i>. Do not draw SVG paths.
- Use data-img render surfaces instead of img tags: <div data-img="short concrete subject" class="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-[${a.surface}] via-[${a.accent}] to-[${a.accent2}]"></div>. Do not use img tags or data URIs.
- A data-img block is a finished visual artifact, not a placeholder. Make each one look like the real product/place/service: dashboard panels, product bottles, room/window compositions, menu boards, schedule tiles, editorial spreads, maps, or brand boards. Never render a flat gray rectangle and never print the word "placeholder".
- First viewport must feel designed at Kimi/K2 quality: decisive hero scale, one memorable visual object, concrete named copy, and no generic SaaS filler.
- Real, specific copy. No lorem, no fake placeholder company names, no generic SaaS slogans, no exclamation marks.
- The page must be visible without JavaScript. Small inline JS is allowed only for harmless toggles and lucide.createIcons().
`
}

export function buildVerticalDocPrompt(brief, plan, route, variety) {
  const sections = plan.sections
    .map((section, index) => `${index + 1}. ${section.role}: ${section.contains}`)
    .join('\n')
  return `${buildSharedContract(brief, plan, route, variety)}

Build the COMPLETE vertical-doc page in one GPT-OSS pass. No stitching.

FULL-WIDTH BAND CONTRACT
- Every top-level content band is <section class="w-full ...">.
- Every band has exactly one main inner wrapper like <div class="mx-auto max-w-7xl px-6 ..."> or max-w-screen-2xl for dense product surfaces.
- Do not put max-w-md, w-80, w-96, w-[400px], fixed, or absolute on structural sections or outer frames.
- Build 6-9 substantial full-width bands plus nav and footer.
- Do not rely on the postprocessor to add missing bands. Complete the six-band minimum yourself, even when sections are compact.

Required content inventory:
${plan.contentInventory.map((item) => `- ${item}`).join('\n')}

Section plan:
${sections}

Output the full document from <!DOCTYPE html> through </html>.`
}

export function buildAppIslandPrompt(brief, plan, route, variety) {
  return `${buildSharedContract(brief, plan, route, variety)}

The deterministic shell already owns the outer 2D layout: top bar, left rail, main grid, responsive frame. You must fill inner islands only.

Return only JSON with HTML fragment strings:
{
  "identity": "<div>small brand/status strip fragment, no outer shell</div>",
  "primary": "<section>primary operator surface inner content</section>",
  "secondary": "<section>table/log/analytics inner content</section>",
  "tertiary": "<section>controls/proof/timeline inner content</section>"
}

Rules for island fragments:
- No <!DOCTYPE>, html, head, body, nav, aside, footer, script, style, fixed, absolute, or left sidebar.
- Use only normal-flow div/article/table/ul elements. Do not use <section> tags inside islands; the deterministic shell already provides top-level sections.
- Use Tailwind classes and exact palette hex arbitrary values.
- No style attributes. Tailwind classes only.
- Fill islands with realistic operational data, rows, statuses, counters, controls, and alerts.

Island plan:
${plan.appIslands.map((island) => `- ${island.slot}: ${island.contains}`).join('\n')}`
}
