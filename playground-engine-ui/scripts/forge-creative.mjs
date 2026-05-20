// Shared core for the creative, archetype-varying homepage generator (v2).
//
// v2 changes (close the gap to Kimi while holding <20s):
//   - Planner also decides layoutMode (app-shell | vertical-doc) and a decor
//     spec (texture/decoration), so composition is LAYOUT-AWARE and pages have
//     more craft.
//   - vertical-doc archetypes  → 3-leg vertical stitch (Gemini chunk1 + GPT-OSS
//     chunks 2/3), which composes cleanly for stacked documents.
//   - app-shell archetypes     → SLOT composition: Gemini owns ONE layout — it
//     builds the whole shell (topbar/sidebar/grid) + primary view with two
//     named empty slots; GPT-OSS fills the slots as inner fragments. This
//     structurally prevents the chunk-collision that broke dashboard/console
//     pages when every chunk invented its own outer container.
//   - decor spec is injected into every leg → grain/gradient/motif/sticker/
//     shadow language, matching Kimi's richer art direction.
//   - density bump on the GPT-OSS legs; graceful guard if a leg fails.
//
// Pure: returns { html, archetype, layoutMode, plan, metrics }; no file writes.

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

Decide the layoutMode. Be STRICT — "vertical-doc" is correct for the large majority of brands:
- "app-shell" ONLY when the brand IS a piece of operational software whose front door is the working tool itself — a monitoring dashboard, an ops console, an admin panel, a trading/analytics terminal, a kanban/board app, a code editor, an inbox. Litmus test: a logged-in operator stares at this screen all day to DO their job, and there is live/streaming data + persistent controls. If the brand SELLS a physical product, runs a shop, serves food, shows a portfolio/gallery, books classes/rooms, or is a content/marketing site → it is NOT app-shell.
- "vertical-doc" for everything else — storefronts, catalogs, galleries, lookbooks, editorial, restaurants/butchers/cafes, fitness/wellness studios, hotels, portfolios, agencies, events, and all marketing pages. When in any doubt, choose "vertical-doc".

Then invent a DISTINCTIVE visual identity — deliberately different from a generic SaaS template and from a neighbouring brand. Vary the GROUND boldly across brands: sometimes a dark/near-black canvas, sometimes a saturated or jewel-toned ground, sometimes warm paper/cream, sometimes high-key white — avoid defaulting to the same light grey. Choose an unexpected-but-harmonious palette (exact hex), a real Google-Fonts pairing that is NOT just Inter/Montserrat unless it truly fits, an edge language, a layout philosophy, a mood, a design reference/era, AND a concrete DECOR treatment that gives the page craft (e.g. film grain/noise overlay, duotone gradient blocks, sticker/tape accents, hard offset shadows, hairline rules, ticker/marquee, dotted grid, glassmorphism, halftone) — be specific.

Then break the page into EXACTLY 3 build chunks that STACK vertically top-to-bottom (every chunk is a full-width horizontal band — this is how they compose).
- For "vertical-doc": chunk 1 is the identity-defining opening (compact); chunks 2 and 3 carry the bulk (grids, tables, repeated cards).
- For "app-shell": render the operational tool as STACKED FULL-WIDTH BANDS, never a left-sidebar layout. chunk 1 = a top app bar + a KPI/status strip + the primary view (map/board/table) as a full-width panel. chunks 2 and 3 = further full-width operational panels stacked below (e.g. a long data/registry table, an activity log, secondary analytics, controls).

Output ONLY this JSON shape:
{
  "archetype": "short label (e.g. 'fleet ops console', 'editorial lookbook')",
  "layoutMode": "app-shell" | "vertical-doc",
  "art": {
    "bg": "#hex", "surface": "#hex", "text": "#hex", "muted": "#hex",
    "accent": "#hex", "accent2": "#hex or null",
    "fontDisplay": "Google Font name", "fontBody": "Google Font name",
    "radius": "edge language", "mood": "3-6 words",
    "layout": "one-sentence layout philosophy", "reference": "a concrete design reference",
    "decor": "concrete decorative treatment that gives the page craft"
  },
  "chunks": [
    { "role": "chunk 1", "contains": "concrete elements, specific to this brand" },
    { "role": "chunk 2", "contains": "..." },
    { "role": "chunk 3 (ends with footer for vertical-doc)", "contains": "..." }
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
    maxTokens: 1300,
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
const REFUSAL = /\b(i'?m sorry|i can(?:'|no)t (?:fulfill|help|assist|comply|create)|as an ai|unable to (?:fulfill|comply))/i
function badLeg(s) {
  const t = stripFences(s)
  const blocks = (t.match(/<(section|div|main|header|article|nav|table|ul)\b/gi) || []).length
  return !t || t.length < 300 || (REFUSAL.test(t) && blocks === 0)
}
function stripRefusal(s) {
  return String(s).replace(/^[^<]*?(i'?m sorry[^<]*)/i, '').replace(/(i'?m sorry[^<]*)$/i, '')
}

function buildContract(brief, plan) {
  const a = plan.art
  const archetype = plan.archetype || 'web page'
  const accent2 = a.accent2 && a.accent2 !== 'null' ? `, secondary accent ${a.accent2}` : ''
  return `Brand: ${brief}

This page is a "${archetype}". Build it as a real, polished, working-looking ${archetype} — NOT a generic marketing landing unless that is literally the archetype.

SHARED VISUAL WORLD — obey EXACTLY so the parts form one coherent page:
- Background ${a.bg}; surfaces ${a.surface}; text ${a.text}; muted ${a.muted}; accent ${a.accent}${accent2}.
- Use Tailwind arbitrary values with these exact hexes, e.g. bg-[${a.bg}], text-[${a.text}], bg-[${a.accent}], border-[${a.muted}]. Tailwind via <script src="https://cdn.tailwindcss.com"></script>.
- Fonts: "${a.fontDisplay}" for display + "${a.fontBody}" for body (Google Fonts <link> + inline tailwind.config).
- Edge language: ${a.radius}. Mood: ${a.mood}. Layout: ${a.layout}. Reference: ${a.reference}.
- DECOR (apply it — this is what gives the page craft): ${a.decor || 'tasteful texture and depth'}.
- Real, specific content — no lorem, no placeholder text. Single-file HTML.`
}

// ── Single vertical-stitch builder for BOTH modes ────────────────────────────
// Every chunk is a full-width horizontal band that stacks. The ONLY difference
// between modes is how chunk 1 is framed: a marketing/editorial opening vs an
// operational interface rendered as STACKED BANDS (top bar + KPI strip +
// primary panel) — never a left-sidebar/2D layout, which is what made
// independently-generated chunks collide. This keeps composition reliable
// while still letting dashboards/consoles look like real tools.
async function buildStacked(brief, plan, opts) {
  const a = plan.art
  const isApp = plan.layoutMode === 'app-shell'
  const contract = buildContract(brief, plan)
  const chunkUser = (idx, opening) => `${contract}

${opening}

THIS CHUNK:
ROLE: ${plan.chunks[idx].role}
CONTAINS: ${plan.chunks[idx].contains}

Build only this chunk, fully realised in the visual world above. Apply the DECOR. Quality over raw length.`

  const c1Opening = isApp
    ? `Build ONLY CHUNK 1 and STOP. Output <!DOCTYPE html>, a <head> (Tailwind CDN + Google Fonts links + inline tailwind.config with the two fonts + base background ${a.bg} and text ${a.text} on <body>), then the <body ...> opening tag, then the TOP of an operational interface rendered as STACKED FULL-WIDTH HORIZONTAL BANDS: (1) a top app bar (brand + nav + key actions), (2) a KPI/status strip of metric tiles, (3) the primary view (live map / board / table / editor as fits) as a full-width panel. HARD layout rules so later sections compose: do NOT use a left sidebar; do NOT put position:fixed or position:absolute on the frame, bar, or panels; keep everything in normal vertical document flow, each band a full-width block. Do NOT close </body> or </html>.`
    : `Build ONLY CHUNK 1 and STOP. Output <!DOCTYPE html>, a <head> (Tailwind CDN + Google Fonts links + inline tailwind.config with the two fonts + base background ${a.bg} and text ${a.text} on <body>), then the <body ...> opening tag, then chunk 1's region as a full-width band. Keep chunk 1 COMPACT — roughly 120-200 lines; the rest comes later. Do NOT close </body> or </html>.`

  const laterOpening = isApp
    ? `The <head>, <body>, and the interface bands above ALREADY EXIST — do NOT repeat them, do NOT rebuild the top bar, do NOT output <!DOCTYPE>/<head>/<body>. Append a FULL-WIDTH band (a normal-flow <section>, no fixed/absolute, no sidebar).`
    : `The <head>, <body> opening, and earlier chunk(s) ALREADY EXIST — do NOT repeat them, do NOT output <!DOCTYPE>/<head>/<body>. Start directly with this chunk's full-width top-level container.`

  const c1 = chunkUser(0, c1Opening)
  const c2 = chunkUser(1, `${laterOpening} Do NOT close </body> or </html>.`)
  const c3 = chunkUser(2, `${laterOpening} End with a matching <footer>, then close </body></html>.`)

  const [r1, r2, r3] = await Promise.all([
    geminiGenerate({ user: c1, maxOut: isApp ? 2900 : 2400, temperature: 0.65, apiKey: opts.apiKey, model: opts.model }),
    forgeGenerate({ prompt: c2, temperature: 0.7, maxTokens: 5000, reasoningEffort: 'low' }),
    forgeGenerate({ prompt: c3, temperature: 0.7, maxTokens: 5000, reasoningEffort: 'low' }),
  ])
  const dropped = []
  let h1 = stripFences(r1.text).replace(/<\/body>\s*<\/html>\s*$/i, '')
  let h2 = badLeg(r2.content) ? (dropped.push('c2'), '') : stripRefusal(stripFences(r2.content)).replace(/<\/body>\s*<\/html>\s*$/i, '')
  let h3 = badLeg(r3.content) ? (dropped.push('c3'), '') : stripRefusal(stripFences(r3.content))
  if (!/<\/html>/i.test(h3)) h3 += '\n</body></html>'
  return { html: `${h1}\n${h2}\n${h3}`, legMs: { geminiMs: r1.ms, ossC2Ms: r2.ms, ossC3Ms: r3.ms }, dropped }
}

// ── app-shell path: ONE Gemini pass owns the whole 2D layout ─────────────────
// True operational UIs (sidebars, fixed panels, dense grids) cannot be stitched
// from independent legs without collisions. So for genuine app-shells we let
// Gemini build the entire coherent interface in a single call — like Kimi does,
// just capped to hold the <20s budget (trades some density for coherence). No
// GPT-OSS legs here; coherence beats raw length for these.
async function buildAppShellSingle(brief, plan, opts) {
  const contract = buildContract(brief, plan)
  const c = plan.chunks
  const user = `${contract}

Build the COMPLETE, coherent operational interface as a SINGLE self-contained HTML document. Output <!DOCTYPE html>, <head> (Tailwind CDN + Google Fonts links + inline tailwind.config with the two fonts + base palette on <body>), the full <body>, and close </body></html>.

You own the ENTIRE layout — use ONE consistent grid/flex system (a top bar, an optional left sidebar/rail, and a primary content area), with internal panels. It must read like a real production tool an operator uses, with live-looking data, status pills, charts/tables, and persistent controls. Build these regions, all inside the one coherent shell:
- ${c[0].role}: ${c[0].contains}
- ${c[1].role}: ${c[1].contains}
- ${c[2].role}: ${c[2].contains}
Apply the DECOR. Dense, specific, real content (no lorem). Make every region feel like part of the same app.`

  const r = await geminiGenerate({ user, maxOut: 3600, temperature: 0.55, apiKey: opts.apiKey, model: opts.model })
  let html = stripFences(r.text)
  if (!/<\/html>/i.test(html)) html += '\n</body></html>'
  return { html, legMs: { geminiMs: r.ms, ossC2Ms: 0, ossC3Ms: 0 }, dropped: null }
}

/**
 * Generate one creative, archetype + layout-aware homepage.
 * @returns {{ html, archetype, layoutMode, plan, metrics }}
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
  const layoutMode = plan.layoutMode === 'app-shell' ? 'app-shell' : 'vertical-doc'

  const built =
    layoutMode === 'app-shell'
      ? await buildAppShellSingle(brief, plan, { apiKey, model })
      : await buildStacked(brief, plan, { apiKey, model })

  return {
    html: built.html,
    archetype,
    layoutMode,
    plan,
    metrics: {
      wall: Date.now() - t0,
      chars: built.html.length,
      layoutMode,
      palette: `${a.bg}/${a.accent}`,
      fonts: `${a.fontDisplay}+${a.fontBody}`,
      decor: a.decor || null,
      plannerMs,
      ...built.legMs,
      dropped: built.dropped?.length ? built.dropped.join('+') : null,
    },
  }
}
