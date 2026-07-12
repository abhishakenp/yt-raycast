import { chat } from '@tanstack/ai'
import { getAdapter } from '../../model.ts'

export type TimedResult = {
  ttftMs: number
  totalMs: number
  markMs?: number
  text: string
  chars: number
  error?: string
}

/**
 * Single streaming model call instrumented for latency: records time-to-first
 * token (TTFT) and total wall-clock. Mirrors generate.ts `once` but exposes the
 * timing the benchmark needs. No retries — the benchmark measures raw latency.
 */
export async function timedCall(opts: {
  modelId: string
  system: string
  user: string
  signal?: AbortSignal
  /** Elapsed (ms) recorded the first time `mark` matches the accumulated text. */
  mark?: RegExp
}): Promise<TimedResult> {
  const ac = new AbortController()
  if (opts.signal)
    opts.signal.addEventListener('abort', () => ac.abort(), { once: true })
  const start = performance.now()
  let ttftMs = -1
  let markMs = -1
  let text = ''
  let error: string | undefined
  try {
    const stream = chat({
      adapter: getAdapter(opts.modelId),
      systemPrompts: [opts.system],
      messages: [{ role: 'user', content: opts.user }],
      modelOptions: {
        reasoning_effort: 'low',
        include_reasoning: false,
        citation_options: 'disabled',
        top_p: 1,
      },
      abortController: ac,
    })
    for await (const chunk of stream) {
      if (chunk.type === 'TEXT_MESSAGE_CONTENT' && chunk.delta) {
        if (ttftMs < 0) ttftMs = performance.now() - start
        text += chunk.delta
        if (markMs < 0 && opts.mark && opts.mark.test(text))
          markMs = performance.now() - start
      } else if (chunk.type === 'RUN_ERROR') {
        error = chunk.message ?? 'run error'
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }
  return {
    ttftMs: ttftMs < 0 ? performance.now() - start : ttftMs,
    totalMs: performance.now() - start,
    markMs: markMs < 0 ? undefined : markMs,
    text,
    chars: text.length,
    error,
  }
}

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b)
  return s.length ? s[Math.floor(s.length / 2)] : 0
}
