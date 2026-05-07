import { GROQ_API_KEY } from '../config.js'
import { groq } from '@ship-fast/engine/llm/groq.js'
import { trimInlineAiText } from '@ship-fast/engine/llm/utils.js'

const PARTIAL_MAX = 480
const OUT_MAX = 4
const LINE_MAX = 380
const MIN_TAIL = 6

function extractJsonObject(text) {
  const s = String(text || '').trim()
  if (s.length > 50000) return null // Size limit

  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end <= start) return null

  try {
    const jsonStr = s.slice(start, end + 1)
    if (jsonStr.length > 10000) return null // Additional size check
    return JSON.parse(jsonStr)
  } catch (error) {
    console.warn('JSON parse error in extractJsonObject:', error)
    return null
  }
}

export async function getPartialPromptSuggestions(partial) {
  const p = String(partial ?? '').trim()
  if (p.length < 2) return []
  if (p.length > PARTIAL_MAX) return []
  if (!GROQ_API_KEY) return []

  const system = [
    'You complete partial prompts for an AI that generates marketing websites.',
    `Output only valid JSON: {"suggestions":["..."]} with at most ${OUT_MAX} strings.`,
    'Each string must begin with the user partial copied verbatim from the user message (same characters and spacing).',
    `Then continue into one flowing sentence describing the site (audience, sections, tone).`,
    `Each full string under ${LINE_MAX} characters; add at least ${MIN_TAIL} new characters after the prefix.`,
    'Vary the angles across suggestions. Match the user language and script.',
    'No markdown, no numbering, no explanation outside the JSON.',
  ].join(' ')

  const r = await groq(`Partial prompt:\n${p}`, {
    system,
    temperature: 0.35,
    maxTokens: 700,
  })

  if (r.error || !r.content) return []

  const cleaned = trimInlineAiText(r.content)
  const data = extractJsonObject(cleaned)
  if (!data || !Array.isArray(data.suggestions)) return []

  const seen = new Set()
  const out = []
  for (const item of data.suggestions) {
    if (typeof item !== 'string') continue
    const s = item.replace(/\s+/g, ' ').trim()
    if (!s.startsWith(p)) continue
    if (s.length > LINE_MAX) continue
    if (s.length < p.length + MIN_TAIL) continue
    const key = s.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s)
    if (out.length >= OUT_MAX) break
  }
  return out
}
