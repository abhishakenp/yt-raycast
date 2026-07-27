import { chat, maxIterations } from '@tanstack/ai'
import type { InferSchemaType, SchemaInput, Tool } from '@tanstack/ai'
import { getProvider, supportsReasoningEffort } from './model-list.ts'
import { getAdapter } from './model.ts'
import { talaasChat } from './talaas.ts'

// Resilient single-shot text generation over @tanstack/ai. Critically, it detects
// RUN_ERROR chunks (which streamToText silently swallows -> "") and retries
// transient provider failures (503 / overload / rate limit) with backoff.

const RETRYABLE =
  /\b(503|429|500|502|504)\b|unavailable|overload|high demand|try again|rate.?limit|temporar|timeout/i

export type GeneratedToolCall = {
  id: string
  tool: string
  input: unknown
}

export type GenerateWithToolsResult = {
  text: string
  toolCalls: GeneratedToolCall[]
}

type ToolCallState = {
  id: string
  tool: string
  arguments: string
}

function parseToolInput(value: string): unknown {
  const trimmed = value.trim()
  if (!trimmed) return {}
  try {
    return JSON.parse(trimmed)
  } catch {
    return {}
  }
}

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
    : 'Model API unavailable. Check GROQ_API_KEY and restart the dev server after updating .env.'
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(t)
        reject(new DOMException('aborted', 'AbortError'))
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
  signal.addEventListener('abort', onAbort, { once: true })
  try {
    const provider = getProvider(modelId)
    const stream =
      provider === 'talaas'
        ? talaasChat(modelId, system, user, ac.signal)
        : chat({
            adapter: getAdapter(modelId),
            systemPrompts: [system],
            messages: [{ role: 'user', content: user }],
            modelOptions: {
              ...(supportsReasoningEffort(modelId)
                ? { reasoning_effort: 'low', include_reasoning: false }
                : {}),
              citation_options: 'disabled',
              top_p: 1,
            },
            abortController: ac,
          })
    let text = ''
    let runError: string | null = null
    for await (const chunk of stream) {
      if (chunk.type === 'TEXT_MESSAGE_CONTENT' && chunk.delta)
        text += chunk.delta
      else if (chunk.type === 'RUN_ERROR')
        runError = chunk.message ?? 'run error'
    }
    if (runError && !text.trim()) throw new Error(runError)

    return text
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    signal.removeEventListener('abort', onAbort)
  }
}

async function onceWithTools(
  modelId: string,
  system: string,
  user: string,
  tools: Tool[],
  signal: AbortSignal,
): Promise<GenerateWithToolsResult> {
  const provider = getProvider(modelId)
  if (provider === 'talaas') {
    return {
      text: await once(modelId, system, user, signal),
      toolCalls: [],
    }
  }

  const ac = new AbortController()
  const onAbort = () => ac.abort()
  signal.addEventListener('abort', onAbort, { once: true })
  try {
    const stream = chat({
      adapter: getAdapter(modelId),
      systemPrompts: [system],
      messages: [{ role: 'user', content: user }],
      tools,
      agentLoopStrategy: maxIterations(4),
      modelOptions: {
        ...(supportsReasoningEffort(modelId)
          ? { reasoning_effort: 'low', include_reasoning: false }
          : {}),
        citation_options: 'disabled',
        top_p: 1,
      },
      abortController: ac,
    })
    let text = ''
    let runError: string | null = null
    const activeToolCalls = new Map<string, ToolCallState>()
    const toolCalls: GeneratedToolCall[] = []

    for await (const chunk of stream) {
      const record = chunk as Record<string, unknown>
      if (chunk.type === 'TEXT_MESSAGE_CONTENT' && chunk.delta) {
        text += chunk.delta
      } else if (chunk.type === 'TOOL_CALL_START') {
        const id = String(record.toolCallId ?? '')
        const tool = String(record.toolCallName ?? record.toolName ?? '')
        if (id && tool) activeToolCalls.set(id, { id, tool, arguments: '' })
      } else if (chunk.type === 'TOOL_CALL_ARGS') {
        const id = String(record.toolCallId ?? '')
        const state = activeToolCalls.get(id)
        if (state) {
          state.arguments =
            typeof record.args === 'string'
              ? record.args
              : `${state.arguments}${String(record.delta ?? '')}`
        }
      } else if (chunk.type === 'TOOL_CALL_END') {
        const id = String(record.toolCallId ?? '')
        const state = activeToolCalls.get(id)
        const tool = String(
          record.toolCallName ?? record.toolName ?? state?.tool ?? '',
        )
        if (id && tool) {
          toolCalls.push({
            id,
            tool,
            input:
              record.input !== undefined
                ? record.input
                : parseToolInput(state?.arguments ?? ''),
          })
        }
        activeToolCalls.delete(id)
      } else if (chunk.type === 'RUN_ERROR') {
        runError = chunk.message ?? 'run error'
      }
    }
    if (runError && !text.trim() && toolCalls.length === 0) {
      throw new Error(runError)
    }

    return { text, toolCalls }
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    signal.removeEventListener('abort', onAbort)
  }
}

async function onceStructuredWithTools<TSchema extends SchemaInput>(
  modelId: string,
  system: string,
  user: string,
  tools: Tool[],
  outputSchema: TSchema,
  signal: AbortSignal,
): Promise<InferSchemaType<TSchema>> {
  const provider = getProvider(modelId)
  if (provider === 'talaas') {
    throw new Error('structured tool generation is not supported by talaas')
  }

  const ac = new AbortController()
  const onAbort = () => ac.abort()
  signal.addEventListener('abort', onAbort, { once: true })
  try {
    return (await chat({
      adapter: getAdapter(modelId),
      systemPrompts: [system],
      messages: [{ role: 'user', content: user }],
      tools,
      outputSchema,
      agentLoopStrategy: maxIterations(4),
      modelOptions: {
        ...(supportsReasoningEffort(modelId)
          ? { reasoning_effort: 'low', include_reasoning: false }
          : {}),
        citation_options: 'disabled',
        top_p: 1,
      },
      abortController: ac,
    })) as InferSchemaType<TSchema>
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    signal.removeEventListener('abort', onAbort)
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
    if (signal.aborted) throw new DOMException('aborted', 'AbortError')
    try {
      const text = await once(modelId, system, user, signal)
      if (text.trim()) {
        return text
      }
      last = new Error('empty model output')
    } catch (e) {
      if ((e as { name?: string })?.name === 'AbortError') throw e
      last = e
      const msg = String((e as { message?: string })?.message ?? e)
      if (!RETRYABLE.test(msg)) throw e
    }
    if (attempt < retries) {
      onRetry?.(attempt + 1)
      await sleep(
        Math.min(8000, 600 * 2 ** attempt) + Math.floor(Math.random() * 300),
        signal,
      )
    }
  }
  throw last instanceof Error ? last : new Error('generation failed')
}

/**
 * Streaming variant of generateText. Calls onLine for each complete line
 * (newline-delimited) as it arrives from the provider stream, enabling
 * incremental parsing/compilation. Returns the full accumulated text for
 * backward compatibility.
 *
 * Same retry/backoff logic as generateText. onLine is only called for the
 * successful attempt (retries restart accumulation).
 */
export async function generateTextStream(
  modelId: string,
  system: string,
  user: string,
  signal: AbortSignal,
  onLine: (line: string) => void,
  retries = 4,
  onRetry?: (attempt: number) => void,
): Promise<string> {
  let last: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal.aborted) throw new DOMException('aborted', 'AbortError')
    try {
      const text = await onceStream(modelId, system, user, signal, onLine)
      if (text.trim()) {
        return text
      }
      last = new Error('empty model output')
    } catch (e) {
      if ((e as { name?: string })?.name === 'AbortError') throw e
      last = e
      const msg = String((e as { message?: string })?.message ?? e)
      if (!RETRYABLE.test(msg)) throw e
    }
    if (attempt < retries) {
      onRetry?.(attempt + 1)
      await sleep(
        Math.min(8000, 600 * 2 ** attempt) + Math.floor(Math.random() * 300),
        signal,
      )
    }
  }
  throw last instanceof Error ? last : new Error('generation failed')
}

/**
 * Like once(), but calls onLine for each complete line as it streams.
 * Accumulates and returns the full text.
 */
async function onceStream(
  modelId: string,
  system: string,
  user: string,
  signal: AbortSignal,
  onLine: (line: string) => void,
): Promise<string> {
  const ac = new AbortController()
  const onAbort = () => ac.abort()
  signal.addEventListener('abort', onAbort, { once: true })
  try {
    const provider = getProvider(modelId)
    const stream =
      provider === 'talaas'
        ? talaasChat(modelId, system, user, ac.signal)
        : chat({
            adapter: getAdapter(modelId),
            systemPrompts: [system],
            messages: [{ role: 'user', content: user }],
            modelOptions: {
              ...(supportsReasoningEffort(modelId)
                ? { reasoning_effort: 'low', include_reasoning: false }
                : {}),
              citation_options: 'disabled',
              top_p: 1,
            },
            abortController: ac,
          })
    let text = ''
    let lineBuffer = ''
    let runError: string | null = null
    for await (const chunk of stream) {
      if (chunk.type === 'TEXT_MESSAGE_CONTENT' && chunk.delta) {
        text += chunk.delta
        lineBuffer += chunk.delta
        // Emit complete lines as they arrive
        let nl: number
        while ((nl = lineBuffer.indexOf('\n')) !== -1) {
          const line = lineBuffer.slice(0, nl)
          lineBuffer = lineBuffer.slice(nl + 1)
          onLine(line)
        }
      } else if (chunk.type === 'RUN_ERROR') {
        runError = chunk.message ?? 'run error'
      }
    }
    // Flush any remaining partial line
    if (lineBuffer.length > 0) {
      onLine(lineBuffer)
    }
    if (runError && !text.trim()) throw new Error(runError)

    return text
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    signal.removeEventListener('abort', onAbort)
  }
}

export async function generateWithTools(
  modelId: string,
  system: string,
  user: string,
  tools: Tool[],
  signal: AbortSignal,
  retries = 4,
  onRetry?: (attempt: number) => void,
): Promise<GenerateWithToolsResult> {
  let last: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal.aborted) throw new DOMException('aborted', 'AbortError')
    try {
      const result = await onceWithTools(modelId, system, user, tools, signal)
      if (result.text.trim() || result.toolCalls.length > 0) return result
      last = new Error('empty model output')
    } catch (e) {
      if ((e as { name?: string })?.name === 'AbortError') throw e
      last = e
      const msg = String((e as { message?: string })?.message ?? e)
      if (!RETRYABLE.test(msg)) throw e
    }
    if (attempt < retries) {
      onRetry?.(attempt + 1)
      await sleep(
        Math.min(8000, 600 * 2 ** attempt) + Math.floor(Math.random() * 300),
        signal,
      )
    }
  }
  throw last instanceof Error ? last : new Error('generation failed')
}

export async function generateStructuredWithTools<TSchema extends SchemaInput>(
  modelId: string,
  system: string,
  user: string,
  tools: Tool[],
  outputSchema: TSchema,
  signal: AbortSignal,
  retries = 4,
  onRetry?: (attempt: number) => void,
): Promise<InferSchemaType<TSchema>> {
  let last: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal.aborted) throw new DOMException('aborted', 'AbortError')
    try {
      return await onceStructuredWithTools(
        modelId,
        system,
        user,
        tools,
        outputSchema,
        signal,
      )
    } catch (e) {
      if ((e as { name?: string })?.name === 'AbortError') throw e
      last = e
      const msg = String((e as { message?: string })?.message ?? e)
      if (!RETRYABLE.test(msg)) throw e
    }
    if (attempt < retries) {
      onRetry?.(attempt + 1)
      await sleep(
        Math.min(8000, 600 * 2 ** attempt) + Math.floor(Math.random() * 300),
        signal,
      )
    }
  }
  throw last instanceof Error ? last : new Error('generation failed')
}
