import {
  GEMINI_API_KEY,
  GEMINI_MODEL,
  GROQ_API_KEY,
  HOMEPAGE_MODEL,
  HYBRID_PLANNER_MODEL,
} from '../config.js'
import { groq } from './groq.js'
import { stripFences } from './utils.js'
import {
  isTruncatedFragment,
  stitchHybridHtml,
} from './hybrid-seam-repair.js'

const PLANNER_SYSTEM =
  'You are a world-class art director + product designer. Decide what the brand\'s front door should BE, invent a distinctive visual world, and lay out its sections. Output ONLY compact JSON.'

function parseJson(t) {
  try {
    return JSON.parse(t)
  } catch {}
  const m = String(t).match(/\{[\s\S]*\}/)
  if (m) {
    try {
      return JSON.parse(m[0])
    } catch {}
  }
  return null
}

function plannerUser(brief, specAppend = '') {
  return `Brief: ${brief}${specAppend}

Decide the best front-door page. Look beyond "marketing landing": it may be the actual product UI (dashboard/console), a gallery, an editorial spread, a catalog, an events wall, etc. Pick what a great team would ship for THIS brand.

layoutMode: "app-shell" ONLY for genuine operational software (dashboard/console/admin with live data + persistent controls); "vertical-doc" for everything else (default).

Invent a distinctive identity: bold, harmonious palette (exact hex — vary the GROUND across brands: dark, jewel-toned, paper/cream, or high-key), a real Google-Fonts pairing (avoid generic Inter/Roboto unless apt), an edge language, a mood, a reference, and a concrete DECOR treatment (grain, duotone, tape/sticker, hard shadows, hairline rules, glow, halftone, etc.).

Then list 6-9 SECTIONS for a vertical-doc (or the key regions for an app-shell), each a full-width band, in order, concrete to this brand.

Output ONLY:
{
  "archetype": "...", "layoutMode": "vertical-doc"|"app-shell",
  "art": { "bg":"#hex","surface":"#hex","text":"#hex","muted":"#hex","accent":"#hex","accent2":"#hex|null",
           "fontDisplay":"...","fontBody":"...","radius":"...","mood":"...","reference":"...","decor":"..." },
  "sections": [ { "role":"...", "contains":"concrete content (real, specific)" }, ... ]
}`
}

async function planHomepage(brief, specAppend = '') {
  const t0 = Date.now()
  let r = await groq(plannerUser(brief, specAppend), {
    system: PLANNER_SYSTEM,
    model: HYBRID_PLANNER_MODEL,
    temperature: 0.9,
    maxTokens: 1600,
  })
  let p = parseJson(r.content)
  if (!p?.art || !Array.isArray(p.sections)) {
    r = await groq(
      `${plannerUser(brief, specAppend)}\n\nReturn ONLY valid JSON, no prose, no markdown fences.`,
      { system: PLANNER_SYSTEM, model: HYBRID_PLANNER_MODEL, temperature: 0.4, maxTokens: 1600 },
    )
    p = parseJson(r.content)
  }
  return {
    plan: p,
    ms: Date.now() - t0,
    inputTokens: (r.inputTokens ?? 0) * (p?.art ? 1 : 2),
    outputTokens: (r.outputTokens ?? 0) * (p?.art ? 1 : 2),
    cost: (r.cost ?? 0) * (p?.art ? 1 : 2),
  }
}

async function geminiGenerate({ user, maxOut = 3000, temperature = 0.6 }) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
  const t0 = Date.now()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { temperature, maxOutputTokens: maxOut, thinkingConfig: { thinkingBudget: 0 } },
    }),
  })
  const ms = Date.now() - t0
  const raw = await res.text()
  if (!res.ok) throw new Error(`gemini ${res.status}: ${raw.slice(0, 200)}`)
  const d = JSON.parse(raw)
  return { text: d?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '', ms }
}

function repairAttrs(html) {
  return String(html || '').replace(/\bclass\s+[A-Za-z][\w-]*\s*=/g, 'class=')
}

function contract(brief, p) {
  const a = p.art
  const acc2 = a.accent2 && a.accent2 !== 'null' ? `, secondary ${a.accent2}` : ''
  return `Brand: ${brief}
This page is a "${p.archetype}". Build it like a world-class designer would — aim for the polish of the very best Tailwind sites (Linear, Vercel, Stripe, Kimi-grade craft).

VISUAL WORLD (obey EXACTLY so independently-built parts fuse):
- Palette: bg ${a.bg}, surface ${a.surface}, text ${a.text}, muted ${a.muted}, accent ${a.accent}${acc2}. Use Tailwind arbitrary hex values: bg-[${a.bg}], text-[${a.text}], bg-[${a.accent}], border-[${a.muted}].
- Fonts: "${a.fontDisplay}" display + "${a.fontBody}" body (Google Fonts <link> + inline tailwind.config). Use a confident type scale (large, tight-tracked display headings).
- Edge: ${a.radius}. Mood: ${a.mood}. Reference: ${a.reference}.
- DECOR — apply it for craft/depth: ${a.decor}.

HARD RULES:
- Tailwind utilities ONLY (Tailwind CDN). NO <style>, NO custom CSS.
- Every section is a FULL-WIDTH band: <section class="w-full ..."> with ONE inner <div class="mx-auto max-w-7xl px-6 ...">. NO fixed-width structural blocks.
- GRID RULE: collections MUST be responsive grids spanning the full inner width.
- SIMPLE-LAYOUT RULE: no position:absolute/fixed, negative margins, rotation, or overlapping cards for effect.
- PROSE RULE: long paragraphs in max-w-2xl blocks or balanced 2-col splits — never a tall narrow grid cell.
- NO JAVASCRIPT: do NOT write <script> tags except Tailwind CDN + tailwind.config inline block.
- ICONS: never <svg>; use <i data-lucide="name"> sized with Tailwind.
- IMAGES: never inline images; use <div data-img="short subject" class="w-full aspect-[4/3] bg-[${a.muted}] rounded-..."></div>.
- HERO: headline, subhead, 1-2 CTAs — no forms crammed in.
- Real, specific copy (no lorem). Generous spacing (py-20+).`
}

function sanitizeHybridHtml(html) {
  let h = repairAttrs(String(html || ''))
  h = h.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  h = h.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (m, attrs, body) => {
    if (/cdn\.tailwindcss\.com|tailwindcss/i.test(attrs)) return m
    if (/tailwind\s*\.\s*config|tailwind\s*=\s*\{/i.test(body)) return m
    return ''
  })
  return h
}

const listSections = (arr) => arr.map((s, i) => `${i + 1}. ${s.role} — ${s.contains}`).join('\n')

async function buildVerticalHybrid(brief, p, revision = '') {
  const c = contract(brief, p) + (revision ? `\n\nMANDATORY REVISION:\n${revision}` : '')
  const secs = p.sections || []
  const topN = Math.min(3, Math.max(2, Math.ceil(secs.length / 2)))
  const top = secs.slice(0, topN)
  const tail = secs.slice(topN)

  const geminiCall = geminiGenerate({
    user: `${c}

Build the TOP of the page in ONE coherent pass: <!DOCTYPE html>, <head> (Tailwind CDN + Google Fonts links + inline tailwind.config + base background ${p.art.bg} and text ${p.art.text} on <body>), the <body ...> opening tag, a sticky full-width <nav>, a STUNNING full-width hero, THEN these full-width sections:
${listSections(top)}
Make it gorgeous: confident display type, strong hierarchy, generous rhythm, the DECOR applied. Close every tag you open. Do NOT close </body> or </html>.`,
    maxOut: 4096,
    temperature: 0.6,
  })

  const ossCall = tail.length
    ? groq(
        `${c}

The <head>, <body>, sticky <nav>, hero, and the first ${topN} sections ALREADY EXIST above — do NOT repeat them. Append these remaining FULL-WIDTH sections, then a full-width multi-column <footer>, then close </body></html>:
${listSections(tail)}
Match the palette + fonts + DECOR EXACTLY. Start directly with the first <section>.`,
        {
          model: HOMEPAGE_MODEL,
          temperature: 0.6,
          maxTokens: 5000,
          reasoningEffort: 'low',
        },
      )
    : Promise.resolve({ content: '\n</body></html>', inputTokens: 0, outputTokens: 0, cost: 0 })

  const [g, o] = await Promise.all([geminiCall, ossCall])
  let topHtml = repairAttrs(stripFences(g.text).replace(/<\/body>\s*<\/html>\s*$/i, ''))
  let tailHtml = stripFences(o.content || '')
  if (!tailHtml || tailHtml.length < 200 || /\bi'?m sorry\b/i.test(tailHtml.slice(0, 120))) tailHtml = ''
  if (!/<\/html>/i.test(tailHtml)) tailHtml += '\n</body></html>'

  let stitched = stitchHybridHtml(topHtml, tailHtml)
  let html = stitched.html

  // Retry tail once when Gemini truncated or stitch validation fails (column-collapse seam).
  if (
    tail.length &&
    (!stitched.validation.ok || isTruncatedFragment(topHtml)) &&
    !revision
  ) {
    const seamIssues = stitched.validation.issues.join('; ')
    const tailRetry = await groq(
      `${c}

The page head, nav, hero, and first ${topN} sections already exist above. Your previous tail caused a layout seam (${seamIssues || 'nested sections'}).
Append ONLY the remaining FULL-WIDTH sections as sibling <section class="w-full"> bands — never nest inside a grid cell. Each section: outer w-full + inner mx-auto max-w-7xl px-6. Then footer, then </body></html>:
${listSections(tail)}
Start directly with <section — no preamble.`,
      { model: HOMEPAGE_MODEL, temperature: 0.45, maxTokens: 5000, reasoningEffort: 'low' },
    )
    tailHtml = stripFences(tailRetry.content || '')
    if (!/<\/html>/i.test(tailHtml)) tailHtml += '\n</body></html>'
    stitched = stitchHybridHtml(topHtml, tailHtml)
    html = stitched.html
    return {
      html: sanitizeHybridHtml(html),
      legMs: [g.ms, 0],
      inputTokens: (o.inputTokens ?? 0) + (tailRetry.inputTokens ?? 0),
      outputTokens: (o.outputTokens ?? 0) + (tailRetry.outputTokens ?? 0),
      cost: (o.cost ?? 0) + (tailRetry.cost ?? 0),
      stitchValidation: stitched.validation,
      topTruncated: isTruncatedFragment(g.text),
    }
  }

  return {
    html: sanitizeHybridHtml(html),
    legMs: [g.ms, 0],
    inputTokens: o.inputTokens ?? 0,
    outputTokens: o.outputTokens ?? 0,
    cost: o.cost ?? 0,
    stitchValidation: stitched.validation,
    topTruncated: isTruncatedFragment(g.text),
  }
}

async function buildAppShellHybrid(brief, p, revision = '') {
  const c = contract(brief, p) + (revision ? `\n\nMANDATORY REVISION:\n${revision}` : '')
  const regions = (p.sections || []).map((s) => `- ${s.role}: ${s.contains}`).join('\n')
  const r = await geminiGenerate({
    user: `${c}\n\nBuild the COMPLETE coherent operational interface as ONE document: <!DOCTYPE html>, <head>, full <body>, </body></html>. Regions:\n${regions}\nMake it feel like one real production tool.`,
    maxOut: 4000,
    temperature: 0.55,
  })
  let html = stripFences(r.text)
  if (!/<\/html>/i.test(html)) html += '\n</body></html>'
  return { html: sanitizeHybridHtml(html), legMs: [r.ms], inputTokens: 0, outputTokens: 0, cost: 0 }
}

/**
 * Gemini-top + Groq-tail hybrid homepage (forge-gemini-native shape).
 * Returns groqHomepage-compatible { content, inputTokens, outputTokens, cost, ... }.
 */
export async function generateHybridHomepage(brief, { specAppend = '', revision = '' } = {}) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')

  const t0 = Date.now()
  const planned = await planHomepage(brief, specAppend)
  const p = planned.plan
  if (!p?.art || !Array.isArray(p.sections)) throw new Error('hybrid planner returned invalid JSON plan')

  const layoutMode = p.layoutMode === 'app-shell' ? 'app-shell' : 'vertical-doc'
  const built =
    layoutMode === 'app-shell'
      ? await buildAppShellHybrid(brief, p, revision)
      : await buildVerticalHybrid(brief, p, revision)

  return {
    content: built.html,
    inputTokens: planned.inputTokens + built.inputTokens,
    outputTokens: planned.outputTokens + built.outputTokens,
    cost: planned.cost + built.cost,
    engine: 'hybrid',
    layoutMode,
    archetype: p.archetype,
    wall: Date.now() - t0,
    plan: p,
    legMs: built.legMs,
    stitchValidation: built.stitchValidation,
    topTruncated: built.topTruncated,
  }
}

export function hybridEngineAvailable() {
  return Boolean(GROQ_API_KEY && GEMINI_API_KEY)
}
