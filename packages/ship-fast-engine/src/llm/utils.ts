export function trimInlineAiText(s: string) {
  let t = String(s || '').trim()
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim()
  }
  if (t.startsWith('```')) {
    t = t
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```\s*$/i, '')
      .trim()
  }
  return t
}

export function trimInlineAiHtmlFragment(s: string) {
  let t = String(s || '').trim()
  if (t.startsWith('```')) {
    t = t
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```\s*$/i, '')
      .trim()
  }
  const first = t.indexOf('<')
  if (first > 0) t = t.slice(first)
  t = t.replace(/\n?```\s*$/i, '').trim()
  return t
}

export function compactStyleFragmentHtml(html: string) {
  return String(html || '').replace(
    /data:image\/[a-z0-9+.@-]+;base64,[A-Za-z0-9+/=\s]{800,}/gi,
    'data:image/png;base64,[embedded image omitted]',
  )
}

// Strip "thinking" / reasoning blocks that some Groq-hosted models leak into
// the response when reasoning isn't fully hidden:
//   <think>…</think>                   — Qwen 3 chat template default
//   <think>…</redacted_thinking>       — earlier Anthropic-style leak we hit
//   <thinking>…</thinking>              — alt format some models emit
//   <|thinking|>…<|/thinking|>          — provider-specific channel markers
// Each gets a separate regex so a missing closing tag in one format doesn't
// swallow the rest of the response.
export function stripGroqReasoningLeak(text: string) {
  return String(text || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*?<\/redacted_thinking>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<\|thinking\|>[\s\S]*?<\|\/thinking\|>/gi, '')
    .trimStart()
}

export function stripFences(html: string) {
  let content = html
  const first = content.indexOf('<')
  if (first > 0) content = content.slice(first)
  return content.replace(/\n?```\s*$/, '').trim()
}

const PRICING: Record<string, { in: number; out: number }> = {
  'openai/gpt-oss-120b': { in: 0.6, out: 0.8 },
  'llama3-70b-8192': { in: 0.59, out: 0.79 },
  'llama3-8b-8192': { in: 0.05, out: 0.08 },
  'llama-3.1-70b-versatile': { in: 0.59, out: 0.79 },
  'llama-3.1-8b-instant': { in: 0.05, out: 0.08 },
  default: { in: 0.5, out: 1.0 },
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cachedInputTokens = 0,
) {
  void cachedInputTokens
  const p = PRICING[model] || PRICING.default
  const cost =
    (inputTokens / 1_000_000) * p.in + (outputTokens / 1_000_000) * p.out
  return cost
}

export function formatTps(result: {
  outputTokens?: number
  inputTokens?: number
  tps?: number
  model?: string
}) {
  const ot = result.outputTokens ?? 0
  const pt = result.inputTokens ?? 0
  const tps = result.tps ?? 0
  const model = result.model ?? ''

  let costStr = ''
  if (model && (ot > 0 || pt > 0)) {
    const cost = calculateCost(model, pt, ot)
    costStr = ` | $${cost.toFixed(4)}`
  }

  if (tps > 0 && ot > 0) {
    return `${tps} tps (${ot} out, ${pt} in)${costStr}`
  }
  if (ot > 0) {
    return `${ot} out, ${pt} in${costStr}`
  }
  return ''
}
