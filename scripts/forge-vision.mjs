/**
 * Vision judge — score a homepage screenshot via Groq's Llama-4 Scout vision model.
 *
 * Returns { score, harmony, hierarchy, spacing, copy, artDirection, reasons[] }.
 * Each axis 0-25, total 0-100.
 *
 * Cost: ~$0.0008/judgment, ~3-4s. Uses GROQ_API_KEY (same as the rest of forge).
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

function imageBlock(filePath) {
  const buf = readFileSync(filePath)
  const b64 = buf.toString('base64')
  return {
    type: 'image_url',
    image_url: { url: `data:image/png;base64,${b64}` },
  }
}

export async function visionJudge(shotPath, context = '') {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')
  if (!existsSync(shotPath)) throw new Error(`shot not found: ${shotPath}`)

  const userText =
    `Score this homepage screenshot using the rubric. ${context ? `Context: ${context}.` : ''} Return JSON only.`

  const body = {
    model: VISION_MODEL,
    messages: [
      { role: 'system', content: RUBRIC_SYSTEM },
      {
        role: 'user',
        content: [
          { type: 'text', text: userText },
          imageBlock(shotPath),
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 600,
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
  parsed.reasons = Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 3) : []
  parsed.ms = ms
  parsed.model = VISION_MODEL
  return parsed
}
