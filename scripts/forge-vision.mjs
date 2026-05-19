/**
 * Vision judge — score a homepage screenshot via Groq's Llama-4 Scout vision model.
 *
 * Returns { score, harmony, hierarchy, spacing, copy, artDirection, reasons[], mobbinFidelity? }.
 * Each rubric axis 0-25, rubric total 0-100. When a Mobbin reference image is
 * provided, also returns mobbinFidelity (0-25) measuring how much the
 * generated page inherits the reference's palette+hierarchy+visual signature.
 * mobbinFidelity is OUTSIDE the 100-point rubric total — forge-loop weights or
 * gates on it independently.
 *
 * Cost: ~$0.0008/judgment, ~3-4s. Two-image (reference + generated) calls
 * cost roughly 1.5-2× single-image. Uses GROQ_API_KEY (same as the rest of forge).
 */
import { readFileSync, existsSync } from 'node:fs'
import { GROQ_API_KEY, GROQ_HOST } from '@ship-fast/engine/config.js'

const VISION_MODEL = process.env.FORGE_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'

const RUBRIC_SYSTEM = `You are a senior product-design critic reviewing AI-generated SaaS marketing homepage screenshots. You output ONLY strict JSON, no prose, no markdown.

Score the screenshot on four axes (0-25 each, integer):
- hierarchy: typographic hierarchy + section rhythm. 25 = strong oversized hero h1, clear scale steps, distinct section voicing. 0 = uniform soup.
- harmony: color + surface harmony. 25 = intentional palette, layered surfaces, real depth. 0 = flat boxes / muddy contrast / template violet-on-gray.
- spacing: spacing + composition. 25 = considered whitespace, asymmetric or bento where appropriate, no empty bands. 0 = cramped or massive empty bands or visibly missing content.
- copy: copy specificity + production-credible content. 25 = specific feature names, real numbers, real testimonials shape. 0 = lorem-ipsum / generic AI slogans / blank.
- artDirection: art direction. 25 = looks deliberately designed, distinctive aesthetic, signature flourish. 0 = interchangeable AI template.

Also list up to 3 short reasons (each ≤ 90 chars) describing the WORST failures, prefixed with the axis name. Empty array if all axes ≥ 20.

Return EXACTLY this shape:
{"hierarchy":N,"harmony":N,"spacing":N,"copy":N,"artDirection":N,"score":SUM,"reasons":["axis: short failure", ...]}

The score MUST equal hierarchy + harmony + spacing + copy + artDirection.`

const RUBRIC_SYSTEM_WITH_REFERENCE = `You are a senior product-design critic reviewing AI-generated SaaS marketing homepage screenshots. You output ONLY strict JSON, no prose, no markdown.

You will receive TWO images:
- Image 1 (REFERENCE) — a trending Mobbin Pro screen from a real B2B SaaS product. This is the inheritance target.
- Image 2 (GENERATED) — the AI-generated homepage to be judged.

Score the GENERATED image on four rubric axes (0-25 each, integer):
- hierarchy: typographic hierarchy + section rhythm. 25 = strong oversized hero h1, clear scale steps, distinct section voicing. 0 = uniform soup.
- harmony: color + surface harmony. 25 = intentional palette, layered surfaces, real depth. 0 = flat boxes / muddy contrast / template violet-on-gray.
- spacing: spacing + composition. 25 = considered whitespace, asymmetric or bento where appropriate, no empty bands. 0 = cramped or massive empty bands or visibly missing content.
- copy: copy specificity + production-credible content. 25 = specific feature names, real numbers, real testimonials shape. 0 = lorem-ipsum / generic AI slogans / blank.
- artDirection: art direction. 25 = looks deliberately designed, distinctive aesthetic, signature flourish. 0 = interchangeable AI template.

Then ALSO score a separate axis on a 0-25 integer scale:
- mobbinFidelity: how much the GENERATED image inherits the REFERENCE's palette, typographic register, density, and visual signature. 25 = a side-by-side reviewer would assume they ship from the same design system. 12 = same family but visibly weaker. 0 = no observable inheritance.

List up to 3 short reasons (each ≤ 100 chars) describing the WORST failures across the 5 dimensions, prefixed with the dimension name. Empty array if all axes ≥ 20.

Return EXACTLY this shape:
{"hierarchy":N,"harmony":N,"spacing":N,"copy":N,"artDirection":N,"score":SUM,"mobbinFidelity":N,"reasons":["axis: short failure", ...]}

The score MUST equal hierarchy + harmony + spacing + copy + artDirection (NOT including mobbinFidelity — that is reported separately).`

function imageBlock(filePath) {
  const buf = readFileSync(filePath)
  const b64 = buf.toString('base64')
  // Detect MIME from file extension so JPEG thumbs (used by visionJudgeCompare
  // to stay under Groq's multi-image request size limit) are sent correctly.
  const lower = filePath.toLowerCase()
  const mime = lower.endsWith('.jpg') || lower.endsWith('.jpeg') ? 'image/jpeg' : 'image/png'
  return {
    type: 'image_url',
    image_url: { url: `data:${mime};base64,${b64}` },
  }
}

/**
 * Comparative vision judge — picks the best among N screenshots for the
 * same brief. Designed for Best-of-K selection where the absolute scorer
 * (visionJudge below) saturates at 100 and can't discriminate.
 *
 * Input: array of screenshot paths (≥2), optional context string.
 * Output: { winner: idx (0-indexed), ranking: [idxs best→worst],
 *           winnerReasons: [...], loserCritiques: [{ variant, issues }] }
 *
 * Latency ~5-8s for N=3 (multi-image vision call).
 *
 * ⚠ EXPERIMENTAL — used by scripts/forge-best-of-k.mjs only. NOT in the
 * default forge path. Reason: tested 2026-05-19, llama-4-scout-17b's
 * aesthetic preferences do NOT match the human reviewer's. Comparative
 * judging works (it discriminates and returns concrete reasoning) but it
 * picks variants the human wouldn't choose. See the header comment on
 * scripts/forge-best-of-k.mjs for the full trace + next steps.
 */
const COMPARE_RUBRIC_SYSTEM = `You are a senior product-design critic comparing AI-generated marketing homepage screenshots.

You will see N screenshots labeled "VARIANT 1", "VARIANT 2", ..., generated for the SAME brief. Pick the BEST one and explain why in concrete design terms (typography hierarchy, color/surface harmony, spacing rhythm, copy specificity, art-direction distinctiveness).

Be DISCRIMINATING — there IS a best among these, even if all look competent. Identify the subtle differences: which has more deliberate art direction? Which has stronger hierarchy? Which has the most credible copy? Which feels most like a real production site vs a template? Don't say "all are equal".

Return EXACTLY this JSON (1-indexed variant numbers):
{"winner":N,"ranking":[N,N,N],"winnerReasons":["why winner wins #1","#2","#3"],"loserCritiques":[{"variant":N,"issues":["concrete failure","..."]},...]}

winnerReasons: 2-4 concrete short reasons (≤100 chars each) why the winner wins.
loserCritiques: one entry per non-winner variant, with 2-3 specific failures each.`

export async function visionJudgeCompare(shotPaths, context = '') {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')
  if (!Array.isArray(shotPaths) || shotPaths.length < 2) {
    throw new Error('visionJudgeCompare needs ≥2 screenshots')
  }
  for (const p of shotPaths) {
    if (!existsSync(p)) throw new Error(`shot not found: ${p}`)
  }

  const userContent = [
    {
      type: 'text',
      text: `Compare ${shotPaths.length} homepage variants for the same brief. ${context ? `Context: ${context}.` : ''} Pick the best, rank all, explain. Return JSON only.`,
    },
  ]
  for (let i = 0; i < shotPaths.length; i++) {
    userContent.push({ type: 'text', text: `VARIANT ${i + 1}:` })
    userContent.push(imageBlock(shotPaths[i]))
  }

  const body = {
    model: VISION_MODEL,
    messages: [
      { role: 'system', content: COMPARE_RUBRIC_SYSTEM },
      { role: 'user', content: userContent },
    ],
    temperature: 0.2,
    max_tokens: 900,
    response_format: { type: 'json_object' },
    stream: false,
  }

  const t0 = Date.now()
  const res = await fetch(`${GROQ_HOST}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const ms = Date.now() - t0
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { winner: 0, ms, error: `vision-compare ${res.status}: ${text.slice(0, 200)}` }
  }
  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content ?? ''
  let parsed = null
  try {
    parsed = JSON.parse(raw)
  } catch {
    const m = raw.match(/\{[\s\S]*\}/)
    if (m) {
      try {
        parsed = JSON.parse(m[0])
      } catch {}
    }
  }
  if (!parsed) {
    return { winner: 0, ms, error: 'vision-compare: bad JSON', raw: raw.slice(0, 300) }
  }
  // Convert 1-indexed to 0-indexed; clamp to valid range.
  const N = shotPaths.length
  const toIdx = (v) => {
    const n = Number(v)
    return Number.isFinite(n) && n >= 1 && n <= N ? n - 1 : 0
  }
  const winner = toIdx(parsed.winner)
  const ranking = Array.isArray(parsed.ranking)
    ? parsed.ranking.map(toIdx).filter((v, i, arr) => arr.indexOf(v) === i)
    : [winner]
  return {
    winner,
    ranking,
    winnerReasons: Array.isArray(parsed.winnerReasons) ? parsed.winnerReasons.slice(0, 4) : [],
    loserCritiques: Array.isArray(parsed.loserCritiques)
      ? parsed.loserCritiques.map((c) => ({
          variant: toIdx(c.variant),
          issues: Array.isArray(c.issues) ? c.issues.slice(0, 3) : [],
        }))
      : [],
    ms,
    model: VISION_MODEL,
  }
}

function inlineImageBlock(b64, mimeType = 'image/webp') {
  return {
    type: 'image_url',
    image_url: { url: `data:${mimeType};base64,${b64}` },
  }
}

/**
 * Score a screenshot.
 *
 * @param {string} shotPath - path to the generated screenshot PNG
 * @param {string} context - free-text context (e.g. "B2B SaaS marketing homepage")
 * @param {object} [opts]
 * @param {{ b64: string, mimeType: string, app?: string, palette?: string[] }} [opts.reference]
 *   Optional Mobbin Pro reference image. When provided, the judge scores a
 *   mobbinFidelity axis (0-25) measuring inheritance from the reference.
 */
export async function visionJudge(shotPath, context = '', opts = {}) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')
  if (!existsSync(shotPath)) throw new Error(`shot not found: ${shotPath}`)

  const reference = opts.reference?.b64 ? opts.reference : null
  const system = reference ? RUBRIC_SYSTEM_WITH_REFERENCE : RUBRIC_SYSTEM

  const refSummary = reference
    ? `Reference app: ${reference.app || 'unknown'}. Reference palette (sampled hex): ${(reference.palette || []).join(', ') || 'n/a'}. The generated page should echo this palette, typographic register, and visual signature.`
    : ''

  const userText = reference
    ? `Image 1 = REFERENCE (trending Mobbin Pro screen). Image 2 = GENERATED (the homepage to judge). ${context ? `Context: ${context}.` : ''} ${refSummary} Return JSON only.`
    : `Score this homepage screenshot using the rubric. ${context ? `Context: ${context}.` : ''} Return JSON only.`

  const content = [{ type: 'text', text: userText }]
  if (reference) content.push(inlineImageBlock(reference.b64, reference.mimeType || 'image/webp'))
  content.push(imageBlock(shotPath))

  const body = {
    model: VISION_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content },
    ],
    temperature: 0.2,
    max_tokens: 700,
    response_format: { type: 'json_object' },
    stream: false,
  }

  const t0 = Date.now()
  const res = await fetch(`${GROQ_HOST}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const ms = Date.now() - t0
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { score: 0, ms, error: `vision ${res.status}: ${text.slice(0, 200)}` }
  }
  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content ?? ''
  let parsed = null
  try {
    parsed = JSON.parse(raw)
  } catch {
    const m = raw.match(/\{[\s\S]*\}/)
    if (m) {
      try {
        parsed = JSON.parse(m[0])
      } catch {}
    }
  }
  if (!parsed) return { score: 0, ms, error: 'vision: bad JSON', raw: raw.slice(0, 300) }
  const axes = ['hierarchy', 'harmony', 'spacing', 'copy', 'artDirection']
  for (const a of axes) {
    const v = Number(parsed[a])
    parsed[a] = Number.isFinite(v) ? Math.max(0, Math.min(25, Math.round(v))) : 0
  }
  const recomputed = axes.reduce((acc, a) => acc + parsed[a], 0)
  parsed.score = Math.min(100, recomputed)
  if (reference) {
    const mf = Number(parsed.mobbinFidelity)
    parsed.mobbinFidelity = Number.isFinite(mf) ? Math.max(0, Math.min(25, Math.round(mf))) : 0
  }
  parsed.reasons = Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 3) : []
  parsed.ms = ms
  parsed.model = VISION_MODEL
  // v8: composite11 — a single number that can exceed 10 only when both the
  // 100-point rubric AND the 25-point mobbinFidelity are near-perfect.
  // Defined as: rubric/10 (max 10) + fidelity/25 (max 1) — total cap 11.
  // Lands at 10.0 for a rubric-perfect generic page (no fidelity), at 11.0
  // for a rubric-perfect AND fidelity-perfect Mobbin-inherited page, and
  // at lower values otherwise. Surfaces the "beyond-rubric" inheritance
  // bonus that v7's gates and v6's fix pass were built to chase.
  parsed.composite11 = composite11(parsed.score, parsed.mobbinFidelity)
  return parsed
}

/**
 * Composite-11 metric: rubric/10 (cap 10) + mobbinFidelity/25 (cap 1).
 * Pure function so callers (forge-loop, forge-once, leaderboard sort) can
 * recompute without re-judging.
 *
 * Returns a number in [0, 11], rounded to one decimal place.
 */
export function composite11(rubricScore = 0, mobbinFidelity = null) {
  const base = Math.max(0, Math.min(100, Number(rubricScore) || 0)) / 10
  const bonus = Number.isFinite(mobbinFidelity)
    ? Math.max(0, Math.min(25, Number(mobbinFidelity))) / 25
    : 0
  return Math.round((base + bonus) * 10) / 10
}
