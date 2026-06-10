import { createFileRoute } from '@tanstack/react-router'
import { GROQ_API_KEY } from '@ship-fast/engine/config.js'
import { groq } from '@ship-fast/engine/llm/groq.js'
import { trimInlineAiText } from '@ship-fast/engine/llm/utils.js'

const OUT_MAX = 4
const LINE_MAX = 380
const MIN_TAIL = 6
const PARTIAL_MAX = 480

const extractJsonObject = (text: unknown): { suggestions?: unknown } | null => {
  const s = String(text || '').trim()
  if (s.length > 50_000) return null
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  try {
    const jsonStr = s.slice(start, end + 1)
    if (jsonStr.length > 10_000) return null
    return JSON.parse(jsonStr) as { suggestions?: unknown }
  } catch {
    return null
  }
}

const getPromptSuggestions = async (partial: string): Promise<string[]> => {
  const p = String(partial ?? '').trim()
  if (p.length < 2 || p.length > PARTIAL_MAX) return []
  if (!GROQ_API_KEY) return []

  const system = [
    'You complete partial prompts for an AI that generates marketing websites.',
    `Output only valid JSON: {"suggestions":["..."]} with at most ${OUT_MAX} strings.`,
    'Each string must begin with the user partial copied verbatim from the user message (same characters and spacing).',
    'Then continue into one flowing sentence describing the site (audience, sections, tone).',
    `Each full string under ${LINE_MAX} characters; add at least ${MIN_TAIL} new characters after the prefix.`,
    'Vary the angles across suggestions. Match the user language and script.',
    'No markdown, no numbering, no explanation outside the JSON.',
  ].join(' ')

  const response = await groq(`Partial prompt:\n${p}`, {
    system,
    temperature: 0.35,
    maxTokens: 700,
  })

  if (response.error || !response.content) return []

  const data = extractJsonObject(trimInlineAiText(response.content))
  const raw = Array.isArray(data?.suggestions) ? data.suggestions : []
  const seen = new Set<string>()
  const out: string[] = []

  for (const item of raw) {
    if (typeof item !== 'string') continue
    const suggestion = item.replace(/\s+/g, ' ').trim()
    if (!suggestion.startsWith(p)) continue
    if (suggestion.length > LINE_MAX) continue
    if (suggestion.length < p.length + MIN_TAIL) continue
    const key = suggestion.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(suggestion)
    if (out.length >= OUT_MAX) break
  }

  return out
}

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

export const Route = createFileRoute('/api/prompt-suggestions')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { partial?: unknown } = {}
        try {
          body = await request.json()
        } catch {
          return json({ suggestions: [] }, { status: 400 })
        }

        const partial = typeof body.partial === 'string' ? body.partial : ''
        try {
          const suggestions = await getPromptSuggestions(partial)
          return json({ suggestions })
        } catch {
          return json({ suggestions: [] }, { status: 500 })
        }
      },
    },
  },
})
