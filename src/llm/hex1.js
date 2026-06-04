import { RUNPOD_API_URL, RUNPOD_API_KEY, RUNPOD_MODEL, LLM_CONFIG } from '../config.js'
import { withLLMRetry } from './retry.js'

const HEX1_TIMEOUT_MS = 180_000 // 3 minutes — accounts for cold starts

async function hex1Fetch({
  system,
  prompt,
  temperature = LLM_CONFIG.default.temperature,
  maxTokens = LLM_CONFIG.default.maxTokens,
}) {
  if (!RUNPOD_API_URL) throw new Error('RUNPOD_API_URL not set')
  if (!RUNPOD_API_KEY) throw new Error('RUNPOD_API_KEY not set')

  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: prompt },
  ]

  const res = await withLLMRetry(async () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), HEX1_TIMEOUT_MS)
    try {
      const res = await fetch(`${RUNPOD_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RUNPOD_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: RUNPOD_MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
        signal: controller.signal,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`hex-1 RunPod request failed (${res.status}): ${text.slice(0, 200)}`)
      }
      return res
    } finally {
      clearTimeout(timer)
    }
  })

  const data = await res.json()
  if (data.error) return { content: '', error: data.error.message ?? String(data.error), tps: 0 }

  const usage = data.usage ?? {}
  const inputTokens = usage.prompt_tokens ?? 0
  const outputTokens = usage.completion_tokens ?? 0

  return {
    content: data.choices?.[0]?.message?.content ?? '',
    tps: 0,
    inputTokens,
    outputTokens,
    model: RUNPOD_MODEL,
    cost: 0,
  }
}

export async function hex1(prompt, opts = {}) {
  return hex1Fetch({ prompt, ...opts })
}

export async function hex1Parallel(calls, opts = {}) {
  return Promise.all(
    calls.map((call) =>
      hex1Fetch({
        prompt: call.prompt,
        system: call.system,
        temperature: call.temperature ?? opts.temperature ?? LLM_CONFIG.parallel.temperature,
        maxTokens: call.maxTokens ?? opts.maxTokens ?? LLM_CONFIG.parallel.maxTokens,
      }),
    ),
  )
}
