const DEFAULT_GROQ_HOST = 'https://api.groq.com'

export async function completeGroq({
  prompt,
  system,
  model = process.env.SHIP_ENGINE_GROQ_MODEL || process.env.KIMI_ENGINE_GROQ_MODEL || process.env.GPT_ENGINE_GROQ_MODEL || 'openai/gpt-oss-120b',
  temperature = 0.7,
  maxTokens = 4000,
  reasoningEffort = 'low',
  responseFormat,
} = {}) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')
  const host = (process.env.GROQ_HOST || DEFAULT_GROQ_HOST).replace(/\/$/, '')
  const body = {
    model,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      { role: 'user', content: prompt },
    ],
    temperature,
    max_tokens: maxTokens,
  }
  if (responseFormat) body.response_format = responseFormat
  if (model.startsWith('openai/gpt-oss')) body.reasoning_effort = reasoningEffort

  const t0 = Date.now()
  const res = await fetch(`${host}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const ms = Date.now() - t0
  const raw = await res.text()
  if (!res.ok) throw new Error(`groq ${res.status}: ${raw.slice(0, 240)}`)
  const data = JSON.parse(raw)
  const usage = data.usage || {}
  const outputTokens = usage.completion_tokens || usage.output_tokens || 0
  return {
    content: data.choices?.[0]?.message?.content || '',
    model: data.model || model,
    ms,
    inputTokens: usage.prompt_tokens || usage.input_tokens || 0,
    outputTokens,
    tps: outputTokens && ms ? Math.round((outputTokens / ms) * 1000) : 0,
    raw: data,
  }
}
