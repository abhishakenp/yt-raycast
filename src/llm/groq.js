import { GROQ_API_KEY, GROQ_HOST, GROQ_MODEL, HOMEPAGE_MODEL } from '../config.js'
import { calculateCost } from './utils.js'

async function groqFetch({
  model = GROQ_MODEL,
  system,
  prompt,
  temperature = 0.3,
  maxTokens = 8000,
}) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')

  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: prompt },
  ]

  const res = await fetch(`${GROQ_HOST}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: false }),
  })

  const data = await res.json()
  if (data.error) return { content: '', error: data.error.message, tps: 0 }

  const usage = data.usage ?? {}
  const tps =
    usage.completion_tokens && usage.total_time
      ? Math.round(usage.completion_tokens / usage.total_time)
      : 0

  const inputTokens = usage.prompt_tokens ?? 0
  const outputTokens = usage.completion_tokens ?? 0
  const cost = calculateCost(model, inputTokens, outputTokens)

  return {
    content: data.choices?.[0]?.message?.content ?? '',
    tps,
    inputTokens,
    outputTokens,
    model,
    cost,
  }
}

export async function groq(prompt, opts = {}) {
  return groqFetch({ prompt, ...opts })
}

export async function groqHomepage(prompt) {
  return groqFetch({
    model: HOMEPAGE_MODEL,
    system:
      'You are an elite frontend engineer specializing in stunning dark-mode UIs. ' +
      'Output ONLY a complete, self-contained HTML file \u2014 no markdown, no explanation. ' +
      'Use Tailwind CSS via CDN and Google Fonts. ' +
      'Use inline SVG for icons, never emojis. ' +
      'Make it breathtaking \u2014 every pixel must feel intentional.',
    prompt,
    temperature: 0.2,
    maxTokens: 8000,
  })
}

export async function groqParallel(calls, opts = {}) {
  return Promise.all(
    calls.map((call) =>
      groqFetch({
        prompt: call.prompt,
        system: call.system,
        temperature: call.temperature ?? opts.temperature ?? 0.3,
        maxTokens: call.maxTokens ?? opts.maxTokens ?? 8000,
        model: call.model ?? opts.model,
      }),
    ),
  )
}
