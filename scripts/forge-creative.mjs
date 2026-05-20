// Shared core for the creative, archetype-varying homepage generator.
//
// A high-temperature planner (cheap Groq model) invents an archetype + a
// distinctive visual world per brief; three legs build its chunks — Gemini
// 3.5 Flash for the identity-defining chunk 1, GPT-OSS-120B for chunks 2+3 —
// all bound to the planner's exact hex tokens so the seams fuse.
//
// Pure: returns { html, archetype, plan, metrics }; no file writes, no
// screenshots. Used by forge-playground.mjs and forge-vs-kimi.mjs.

import { forgeGenerate } from './forge-lib.mjs'

const PLANNER_MODEL = process.env.PLANNER_MODEL || 'llama-3.3-70b-versatile'

const PLANNER_SYSTEM =
  'You are a daring art director and product designer with broad taste across eras and disciplines. You decide what a brand\'s primary web page should actually BE, then invent a distinctive visual world for it. Output ONLY compact JSON, no prose, no markdown fences.'

function plannerUser(brief) {
  return `Brief: ${brief}

Decide, with taste and surprise, the best front-door web page for this brand. Look BEYOND the default "marketing landing page with a centered hero". Depending on the brand, the most fitting page is often the actual product itself rendered as a real, working-looking interface:
- a product app UI — a dashboard, a kanban board, a deploy console with a project/deployment list, a data table, a code editor, an analytics view, an inbox;
- a gallery / lookbook / case-study wall;
- an editorial long-read or manifesto;
- an interactive catalog or storefront;
- or, only if it genuinely fits best, a marketing homepage.
Pick whatever a great team would actually ship as the front door for THIS brand.

Then invent a DISTINCTIVE visual identity — deliberately different from a generic SaaS template and different from what you'd pick for a neighbouring brand. Vary the GROUND boldly across brands: sometimes a dark/near-black canvas, sometimes a saturated or jewel-toned ground, sometimes warm paper/cream, sometimes high-key white — avoid defaulting to the same light grey (#f7f7f7) every time. Choose an unexpected-but-harmonious palette (exact hex), a real Google-Fonts typographic pairing that is NOT just Inter/Montserrat unless it truly fits, a corner/edge language, a layout philosophy (grid, density, whitespace, asymmetry), a mood, and a design reference/era.

Then break the page into EXACTLY 3 build chunks that stack vertically into one scrollable document. Chunk 1 is the identity-defining opening region (for an app archetype this is the app shell / top bar / primary view header, NOT a marketing hero) — keep chunk 1 COMPACT and focused (it will be built first and must render fast). Put the BULK of the content (long tables, big grids, repeated cards, secondary panels) into chunks 2 and 3, which are heavier. Make all 3 concrete.

Output ONLY this JSON shape:
{
  "archetype": "short label of the kind of page (e.g. 'kanban app UI', 'deploy console', 'editorial lookbook', 'marketing homepage')",
  "art": {
    "bg": "#hex", "surface": "#hex", "text": "#hex", "muted": "#hex",
    "accent": "#hex", "accent2": "#hex or null",
    "fontDisplay": "Google Font name", "fontBody": "Google Font name",
    "radius": "edge language e.g. 'sharp / 0px' | 'rounded-2xl' | 'pill'",
    "mood": "3-6 words", "layout": "one-sentence layout philosophy", "reference": "a concrete design reference"
  },
  "chunks": [
    { "role": "what chunk 1 is", "contains": "concrete elements to build, specific to this brand" },
    { "role": "chunk 2", "contains": "..." },
    { "role": "chunk 3 (ends with footer)", "contains": "..." }
  ]
}`
}

function parseJson(text) {
  try { return JSON.parse(text) } catch {}
  const m = String(text).match(/\{[\s\S]*\}/)
  if (m) { try { return JSON.parse(m[0]) } catch {} }
  return null
}

async function planArtDirection(brief) {
  const t0 = Date.now()
  const res = await forgeGenerate({
    prompt: plannerUser(brief),
    system: PLANNER_SYSTEM,
    model: PLANNER_MODEL,
    temperature: 0.95,
    maxTokens: 1100,
  })
  return { plan: parseJson(res.content), ms: Date.now() - t0 }
}

async function geminiGenerate({ user, maxOut = 6000, temperature = 0.5, apiKey, model }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const body = {
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: { temperature, maxOutputTokens: maxOut, thinkingConfig: { thinkingBudget: 0 } },
  }
  const t0 = Date.now()
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const ms = Date.now() - t0
  const raw = await res.text()
  if (!res.ok) throw new Error(`gemini ${res.status}: ${raw.slice(0, 200)}`)
  const data = JSON.parse(raw)
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
  return { text, ms, tokens: data?.usageMetadata?.candidatesTokenCount }
}

const stripFences = (s) => String(s || '').replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/i, '').trim()

/**
 * Generate one creative, archetype-varying homepage.
 * @param {string} brief
 * @param {{ geminiKey?: string, geminiModel?: string }} opts
 * @returns {{ html, archetype, plan, metrics }}
 */
export async function generateCreativeHomepage(brief, opts = {}) {
  const apiKey = opts.geminiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  const model = opts.geminiModel || process.env.GEMINI_MODEL || 'gemini-3.5-flash'
  if (!apiKey) throw new Error('GEMINI_API_KEY / GOOGLE_API_KEY not set')

  const t0 = Date.now()
  const { plan, ms: plannerMs } = await planArtDirection(brief)
  if (!plan?.art || !Array.isArray(plan.chunks) || plan.chunks.length < 3) {
    throw new Error('planner produced no usable plan')
  }
  const a = plan.art
  const archetype = plan.archetype || 'web page'
  const accent2 = a.accent2 && a.accent2 !== 'null' ? `, secondary accent ${a.accent2}` : ''

  const contract = `Brand: ${brief}

This page is a "${archetype}". Build it as a real, polished, working-looking ${archetype} — NOT a generic marketing landing unless that is literally the archetype.

SHARED VISUAL WORLD — obey EXACTLY so the 3 chunks form one coherent page:
- Background ${a.bg}; surfaces ${a.surface}; text ${a.text}; muted ${a.muted}; accent ${a.accent}${accent2}.
- Use Tailwind arbitrary values with these exact hexes, e.g. bg-[${a.bg}], text-[${a.text}], bg-[${a.accent}], border-[${a.muted}]. Tailwind via <script src="https://cdn.tailwindcss.com"></script>.
- Fonts: "${a.fontDisplay}" for display + "${a.fontBody}" for body (Google Fonts <link> + inline tailwind.config).
- Edge language: ${a.radius}. Mood: ${a.mood}. Layout: ${a.layout}. Reference: ${a.reference}.
- Real, specific content — no lorem, no placeholder text. Single-file HTML.`

  const chunkUser = (idx, opening) => `${contract}

${opening}

THIS CHUNK:
ROLE: ${plan.chunks[idx].role}
CONTAINS: ${plan.chunks[idx].contains}

Build only this chunk, fully realised in the visual world above. Quality over raw length.`

  const c1 = chunkUser(0, `Build ONLY CHUNK 1 and STOP. Output <!DOCTYPE html>, a <head> (Tailwind CDN + Google Fonts links + inline tailwind.config with the two fonts + base background ${a.bg} and text ${a.text} on <body>), then the <body ...> opening tag, then chunk 1's region. Keep chunk 1 COMPACT — roughly 120-200 lines of HTML; it is the opening only, the rest of the page comes later. Do NOT close </body> or </html>. Do NOT build later chunks.`)
  const c2 = chunkUser(1, `The <head>, <body> opening, and CHUNK 1 ALREADY EXIST — do NOT repeat them, do NOT output <!DOCTYPE>/<head>/<body>. Start directly with this chunk's top-level container. Do NOT close </body> or </html>.`)
  const c3 = chunkUser(2, `The <head>, <body>, CHUNK 1 and CHUNK 2 ALREADY EXIST — do NOT repeat them. Start directly with this chunk's top-level container. End with a matching <footer>, then close </body></html>.`)

  const [r1, r2, r3] = await Promise.all([
    geminiGenerate({ user: c1, maxOut: 2200, temperature: 0.65, apiKey, model }),
    forgeGenerate({ prompt: c2, temperature: 0.7, maxTokens: 4200, reasoningEffort: 'low' }),
    forgeGenerate({ prompt: c3, temperature: 0.7, maxTokens: 4200, reasoningEffort: 'low' }),
  ])

  const REFUSAL = /\b(i'?m sorry|i can(?:'|no)t (?:fulfill|help|assist|comply|create)|as an ai|unable to (?:fulfill|comply))/i
  const badLeg = (s) => {
    const t = stripFences(s)
    const blocks = (t.match(/<(section|div|main|header|article|nav)\b/gi) || []).length
    return !t || t.length < 400 || (REFUSAL.test(t) && blocks === 0)
  }
  const dropped = []
  let c1Html = stripFences(r1.text).replace(/<\/body>\s*<\/html>\s*$/i, '')
  let c2Html = badLeg(r2.content) ? (dropped.push('c2'), '') : stripFences(r2.content).replace(/<\/body>\s*<\/html>\s*$/i, '')
  let c3Html = badLeg(r3.content) ? (dropped.push('c3'), '') : stripFences(r3.content)
  c2Html = c2Html.replace(/^[^<]*?(i'?m sorry[^<]*)/i, '')
  c3Html = c3Html.replace(/(i'?m sorry[^<]*)$/i, '')
  if (!/<\/html>/i.test(c3Html)) c3Html += '\n</body></html>'
  const html = `${c1Html}\n${c2Html}\n${c3Html}`

  return {
    html,
    archetype,
    plan,
    metrics: {
      wall: Date.now() - t0,
      chars: html.length,
      palette: `${a.bg}/${a.accent}`,
      fonts: `${a.fontDisplay}+${a.fontBody}`,
      plannerMs, geminiMs: r1.ms, ossC2Ms: r2.ms, ossC3Ms: r3.ms,
      dropped: dropped.length ? dropped.join('+') : null,
    },
  }
}
