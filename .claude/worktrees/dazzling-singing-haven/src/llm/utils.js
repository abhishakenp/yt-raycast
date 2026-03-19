export function stripFences(html) {
  let content = html
  const first = content.indexOf('<')
  if (first > 0) content = content.slice(first)
  return content.replace(/\n?```\s*$/, '').trim()
}

const PRICING = {
  'openai/gpt-oss-120b': { in: 0.6, out: 0.8 },
  'moonshotai/kimi-k2-instruct-0905': { in: 0.7, out: 1.4 },
  'llama3-70b-8192': { in: 0.59, out: 0.79 },
  'llama3-8b-8192': { in: 0.05, out: 0.08 },
  'llama-3.1-70b-versatile': { in: 0.59, out: 0.79 },
  'llama-3.1-8b-instant': { in: 0.05, out: 0.08 },
  default: { in: 0.5, out: 1.0 },
}

export function calculateCost(model, inputTokens, outputTokens) {
  const p = PRICING[model] || PRICING.default
  const cost = (inputTokens / 1_000_000) * p.in + (outputTokens / 1_000_000) * p.out
  return cost
}

export function formatTps(result) {
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
