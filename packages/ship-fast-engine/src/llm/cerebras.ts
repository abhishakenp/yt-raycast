/**
 * cerebras.ts — Cerebras adapter for @tanstack/ai.
 *
 * Cerebras exposes an OpenAI-compatible Chat Completions endpoint at
 * https://api.cerebras.ai/v1. We drive it with the OpenAI SDK via a
 * baseURL override — the same pattern as @tanstack/ai-groq.
 *
 * Cerebras runs gpt-oss-120b at ~2300 tok/s (vs Groq's ~500 tok/s),
 * making it the fastest path for the 120B model. The adapter is
 * intentionally minimal — Cerebras is a drop-in OpenAI backend.
 */
import OpenAI from 'openai'
import { OpenAIBaseChatCompletionsTextAdapter } from '@tanstack/openai-base'
import type { Modality, TextOptions } from '@tanstack/ai'

const CEREBRAS_BASE_URL = 'https://api.cerebras.ai/v1'

function getCerebrasApiKeyFromEnv(): string {
  const key = process.env.CEREBRAS_API_KEY
  if (!key) {
    throw new Error(
      'CEREBRAS_API_KEY is not set. Get one at https://cerebras.ai and set it in your .env.local',
    )
  }
  return key
}

export class CerebrasTextAdapter<
  TModel extends string,
  TProviderOptions extends Record<string, unknown> = Record<string, unknown>,
  TInputModalities extends ReadonlyArray<Modality> = ReadonlyArray<Modality>,
> extends OpenAIBaseChatCompletionsTextAdapter<
  TModel,
  TProviderOptions,
  TInputModalities
> {
  override readonly kind = 'text' as const
  override readonly name = 'cerebras' as const

  constructor(apiKey: string, model: TModel) {
    super(model, 'cerebras', new OpenAI({ apiKey, baseURL: CEREBRAS_BASE_URL }))
  }

  /**
   * Cerebras emits `delta.reasoning_content` on reasoning models. Surface
   * it so the base routes reasoning through its standard hook.
   */
  protected override extractReasoning(
    chunk: OpenAI.Chat.Completions.ChatCompletionChunk,
  ): { text: string } | undefined {
    const delta = chunk.choices[0]?.delta as
      | { reasoning?: unknown; reasoning_content?: unknown }
      | undefined
    const raw = delta?.reasoning ?? delta?.reasoning_content
    if (typeof raw === 'string' && raw.length > 0) {
      return { text: raw }
    }
    return undefined
  }
}

/**
 * Creates a Cerebras text adapter with API key from CEREBRAS_API_KEY env var.
 *
 * @example
 * ```typescript
 * const adapter = cerebrasText('gpt-oss-120b');
 * ```
 */
export function cerebrasText<TModel extends string>(
  model: TModel,
): CerebrasTextAdapter<TModel> {
  const apiKey = getCerebrasApiKeyFromEnv()
  return new CerebrasTextAdapter(apiKey, model)
}
