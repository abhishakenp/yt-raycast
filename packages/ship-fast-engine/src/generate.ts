import { chat, maxIterations } from '@tanstack/ai'
import type { InferSchemaType, SchemaInput, Tool } from '@tanstack/ai'
import { getProvider, supportsReasoningEffort } from './model-list.ts'
import { getAdapter } from './model.ts'
import {
  providerFallbackModelIds,
  recordProviderFailure,
  recordProviderSuccess,
} from './provider-fallback.ts'
import { talaasChat } from './talaas.ts'

// Resilient single-shot text generation over @tanstack/ai. Critically, it detects
// RUN_ERROR chunks (which streamToText silently swallows -> "") and retries
// transient provider failures (503 / overload / rate limit) with backoff.

/**
 * Build provider-appropriate model options. Not all providers support the same
 * parameters — e.g. Cerebras rejects `citation_options` with a 400. This helper
 * only includes options the provider accepts.
 */
export function buildModelOptions(modelId: string): Record<string, unknown> {
  const provider = getProvider(modelId)
  const isReasoning = supportsReasoningEffort(modelId)
  const opts: Record<string, unknown> = {
    top_p: 1,
  }
  // reasoning_effort is only for gpt-oss reasoning models
  if (isReasoning) {
    opts.reasoning_effort = 'low'
  }
  // include_reasoning and citation_options are Groq-specific.
  // include_reasoning is only valid for reasoning models on Groq.
  // Cerebras rejects both with 400.
  if (provider === 'groq') {
    if (isReasoning) opts.include_reasoning = false
    opts.citation_options = 'disabled'
  }
  return opts
}

/**
 * Harmony prefill that forces the model to skip the analysis (reasoning)
 * channel and output directly into the final channel. gpt-oss models use
 * OpenAI's harmony response format where reasoning goes to an `analysis`
 * channel and the answer goes to a `final` channel. By prefilling the
 * assistant message with a completed (empty) analysis channel and the
 * start of the final channel, the model is forced to continue in the
 * final channel — producing ZERO reasoning tokens.
 *
 * This works on Groq because Groq passes the assistant prefill through to
 * the model's harmony renderer. Measured: 0 reasoning tokens vs 17 without.
 *
 * Only applies to gpt-oss models (the only ones using harmony format).
 */
const HARMONY_NO_THINK_PREFILL =
  '<|start|>assistant<|channel|>analysis<|message|><|end|><|start|>assistant<|channel|>final<|message|>'

export function buildMessages(
  modelId: string,
  user: string,
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const msgs: Array<{ role: 'user' | 'assistant'; content: string }> = [
    { role: 'user', content: user },
  ]
  if (
    supportsReasoningEffort(modelId) &&
    process.env.DISABLE_HARMONY_PREFILL !== '1'
  ) {
    msgs.push({ role: 'assistant', content: HARMONY_NO_THINK_PREFILL })
  }
  return msgs
}

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

async function withProviderFallback<T>(
  modelId: string,
  signal: AbortSignal,
  retries: number,
  onRetry: ((attempt: number) => void) | undefined,
  operation: (candidateModelId: string) => Promise<T>,
  hasResult: (value: T) => boolean,
): Promise<T> {
  let last: unknown = new Error('generation failed')

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (signal.aborted) throw new DOMException('aborted', 'AbortError')

    for (const candidateModelId of providerFallbackModelIds(modelId)) {
      try {
        const result = await operation(candidateModelId)
        if (!hasResult(result)) {
          throw new Error('empty model output')
        }
        recordProviderSuccess(candidateModelId)
        return result
      } catch (error) {
        if ((error as { name?: string })?.name === 'AbortError') throw error
        last = error
        recordProviderFailure(candidateModelId)
      }
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
            messages: buildMessages(modelId, user),
            modelOptions: buildModelOptions(modelId),
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
      messages: buildMessages(modelId, user),
      tools,
      agentLoopStrategy: maxIterations(4),
      modelOptions: buildModelOptions(modelId),
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
      messages: buildMessages(modelId, user),
      tools,
      outputSchema,
      agentLoopStrategy: maxIterations(4),
      modelOptions: buildModelOptions(modelId),
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
  return withProviderFallback(
    modelId,
    signal,
    retries,
    onRetry,
    (candidateModelId) => once(candidateModelId, system, user, signal),
    (text) => text.trim().length > 0,
  )
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
  return withProviderFallback(
    modelId,
    signal,
    retries,
    onRetry,
    (candidateModelId) =>
      onceStream(candidateModelId, system, user, signal, onLine),
    (text) => text.trim().length > 0,
  )
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
            messages: buildMessages(modelId, user),
            modelOptions: buildModelOptions(modelId),
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
  return withProviderFallback(
    modelId,
    signal,
    retries,
    onRetry,
    (candidateModelId) =>
      onceWithTools(candidateModelId, system, user, tools, signal),
    (result) => result.text.trim().length > 0 || result.toolCalls.length > 0,
  )
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
  return withProviderFallback(
    modelId,
    signal,
    retries,
    onRetry,
    (candidateModelId) =>
      onceStructuredWithTools(
        candidateModelId,
        system,
        user,
        tools,
        outputSchema,
        signal,
      ),
    () => true,
  )
}
