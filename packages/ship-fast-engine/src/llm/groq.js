import { withLLMRetry } from './retry.js'
import {
  GROQ_API_KEY,
  GROQ_HOST,
  GROQ_MODEL,
  LLM_CONFIG,
  OLLAMA_API_KEY,
  OLLAMA_HOST,
} from '../config.js'
import { calculateCost, stripGroqReasoningLeak } from './utils.js'

function resolveProvider(model) {
  if (model.endsWith(':cloud')) {
    if (!OLLAMA_API_KEY) throw new Error('OLLAMA_API_KEY not set')
    return {
      url: `${OLLAMA_HOST}/v1/chat/completions`,
      key: OLLAMA_API_KEY,
      extraHeaders: {},
    }
  }
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')
  return {
    url: `${GROQ_HOST}/openai/v1/chat/completions`,
    key: GROQ_API_KEY,
    extraHeaders: {},
  }
}

async function groqFetch({
  model = GROQ_MODEL,
  system,
  prompt,
  temperature = LLM_CONFIG.default.temperature,
  maxTokens = LLM_CONFIG.default.maxTokens,
  reasoningEffort = null,
  reasoningFormat = null,
  responseFormat,
}) {
  const provider = resolveProvider(model)

  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: prompt },
  ]

  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false,
  }
  if (reasoningEffort != null) body.reasoning_effort = reasoningEffort
  if (reasoningFormat != null) body.reasoning_format = reasoningFormat
  if (responseFormat) body.response_format = responseFormat

  const res = await withLLMRetry(() =>
    fetch(provider.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.key}`,
        'Content-Type': 'application/json',
        ...provider.extraHeaders,
      },
      body: JSON.stringify(body),
    }),
  )

  const data = await res.json()
  if (data.error)
    return {
      content: '',
      error: data.error.message ?? String(data.error),
      tps: 0,
    }

  const usage = data.usage ?? {}
  const tps =
    usage.completion_tokens && usage.total_time
      ? Math.round(usage.completion_tokens / usage.total_time)
      : 0

  const inputTokens = usage.prompt_tokens ?? 0
  const outputTokens = usage.completion_tokens ?? 0
  const cachedInputTokens = usage.prompt_tokens_details?.cached_tokens ?? 0
  const cost = calculateCost(
    model,
    inputTokens,
    outputTokens,
    cachedInputTokens,
  )
  const rawContent = data.choices?.[0]?.message?.content ?? ''

  return {
    content: stripGroqReasoningLeak(rawContent),
    tps,
    inputTokens,
    outputTokens,
    cachedInputTokens,
    model,
    cost,
  }
}

export async function groq(prompt, opts = {}) {
  return groqFetch({ prompt, ...opts })
}

/**
 * Full completion plus optional chunked `onToken` calls for dashboards (WebSocket deltas).
 * Uses the same `/chat/completions` path as plain `groq`; chunks are synthesized from the final text when streaming APIs are unavailable.
 */
export async function groqStream(prompt, opts = {}) {
  const { onToken, ...fetchOpts } = opts
  const result = await groqFetch({ prompt, ...fetchOpts })
  const content = stripGroqReasoningLeak(String(result?.content ?? ''))
  if (typeof onToken === 'function' && content.length > 0) {
    const chunkSize = Math.max(64, Math.ceil(content.length / 48))
    let accumulated = ''
    for (let i = 0; i < content.length; i += chunkSize) {
      const piece = content.slice(i, i + chunkSize)
      accumulated += piece
      onToken(piece, accumulated)
    }
  }
  return { ...result, content }
}

export async function groqParallel(calls, opts = {}) {
  return Promise.all(
    calls.map((call) =>
      groqFetch({
        prompt: call.prompt,
        system: call.system,
        temperature:
          call.temperature ??
          opts.temperature ??
          LLM_CONFIG.parallel.temperature,
        maxTokens:
          call.maxTokens ?? opts.maxTokens ?? LLM_CONFIG.parallel.maxTokens,
        model: call.model ?? opts.model,
      }),
    ),
  )
}
