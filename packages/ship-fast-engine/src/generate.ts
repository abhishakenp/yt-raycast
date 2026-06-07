import { chat } from "@tanstack/ai"
import { getProvider } from "./model-list.ts"
import { getAdapter } from "./model.ts"
import { talaasChat } from "./talaas.ts"

// Resilient single-shot text generation over @tanstack/ai. Critically, it detects
// RUN_ERROR chunks (which streamToText silently swallows -> "") and retries
// transient provider failures (503 / overload / rate limit) with backoff.

const RETRYABLE = /\b(503|429|500|502|504)\b|unavailable|overload|high demand|try again|rate.?limit|temporar|timeout/i

/** Auth/config failures should not silently degrade to placeholder site output. */
export function isHardLlmFailure(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message ?? err)
  return /invalid api key|401|403|unauthorized|authentication|api[_ ]?key|groq_api_key|gemini_api_key/i.test(
    msg,
  )
}

export function formatLlmFailureMessage(err: unknown): string {
  const detail = String((err as { message?: string })?.message ?? err).trim()
  return detail
    ? `Model API unavailable (${detail}). Check GROQ_API_KEY and restart the dev server after updating .env.`
    : "Model API unavailable. Check GROQ_API_KEY and restart the dev server after updating .env."
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(t)
        reject(new DOMException("aborted", "AbortError"))
      },
      { once: true },
    )
  })
}

async function once(
  modelId: string,
  system: string,
  user: string,
  signal: AbortSignal,
): Promise<string> {
  const ac = new AbortController()
  const onAbort = () => ac.abort()
  signal.addEventListener("abort", onAbort, { once: true })
  try {
    const systemPreview = system.length > 500 ? system.slice(0, 500) + `... (${system.length} chars)` : system
    const userPreview = user.length > 500 ? user.slice(0, 500) + `... (${user.length} chars)` : user
    console.log(`[KIMI REQUEST] model=${modelId}`)
    console.log(`[KIMI REQUEST] system:`, systemPreview)
    console.log(`[KIMI REQUEST] user:`, userPreview)

    const stream =
      getProvider(modelId) === "talaas"
        ? talaasChat(modelId, system, user, ac.signal)
        : chat({
          adapter: getAdapter(modelId),
          systemPrompts: [system],
          messages: [{ role: "user", content: user }],
          abortController: ac,
        })
    let text = ""
    let runError: string | null = null
    for await (const chunk of stream) {
      if (chunk.type === "TEXT_MESSAGE_CONTENT" && chunk.delta) text += chunk.delta
      else if (chunk.type === "RUN_ERROR") runError = chunk.message ?? "run error"
    }
    if (runError && !text.trim()) throw new Error(runError)

    const responsePreview = text.length > 500 ? text.slice(0, 500) + `... (${text.length} chars)` : text
    console.log(`[KIMI RESPONSE] model=${modelId} length=${text.length}`)
    console.log(`[KIMI RESPONSE] content:`, responsePreview)

    return text
  } finally {
    signal.removeEventListener("abort", onAbort)
  }
}

export async function generateText(
  modelId: string,
  system: string,
  user: string,
  signal: AbortSignal,
  retries = 4,
  onRetry?: (attempt: number) => void,
): Promise<string> {
  let last: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal.aborted) throw new DOMException("aborted", "AbortError")
    try {
      const text = await once(modelId, system, user, signal)
      if (text.trim()) {
        return text
      }
      last = new Error("empty model output")
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") throw e
      last = e
      const msg = String((e as { message?: string })?.message ?? e)
      console.log(`[KIMI ERROR] model=${modelId} attempt=${attempt + 1}/${retries + 1} error:`, msg)
      // non-retryable hard error -> fail fast
      if (!RETRYABLE.test(msg)) throw e
    }
    if (attempt < retries) {
      console.log(`[KIMI RETRY] model=${modelId} attempt=${attempt + 1}/${retries + 1}`)
      onRetry?.(attempt + 1)
      await sleep(Math.min(8000, 600 * 2 ** attempt) + Math.floor(Math.random() * 300), signal)
    }
  }
  throw last instanceof Error ? last : new Error("generation failed")
}
