// Client-safe model catalog (NO provider SDK imports). Lists every model wired up
// in model.ts so all of them are selectable in the picker for testing — including
// the small/fast ones. Default is the strongest reliable model.

export type ModelProvider = 'groq' | 'gemini' | 'talaas' | 'cerebras'

export interface ShipFastModel {
  id: string
  label: string
  provider: ModelProvider
}

export const SHIP_FAST_MODELS: readonly ShipFastModel[] = [
  {
    id: 'cerebras/gpt-oss-120b',
    label: 'GPT-OSS 120B (Cerebras)',
    provider: 'cerebras',
  },
  { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B', provider: 'groq' },
  { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B', provider: 'groq' },
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', provider: 'groq' },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    label: 'Llama 4 Scout 17B',
    provider: 'groq',
  },
  { id: 'qwen/qwen3-32b', label: 'Qwen3 32B', provider: 'groq' },
  {
    id: 'llama-3.1-8b-instant',
    label: 'Llama 3.1 8B Instant',
    provider: 'groq',
  },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', provider: 'gemini' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'gemini' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'gemini' },
  { id: 'llama3.1-8B', label: 'Llama 3.1 8B (Talaas)', provider: 'talaas' },
]

// Default to GPT-OSS 120B via Cerebras — same model quality as Groq 120B
// but at ~1800 tok/s (vs Groq's ~500 tok/s), measured ~3x faster
// (avg ~1.3s vs ~4.3s wall clock). Cerebras is an OpenAI-compatible backend;
// see llm/cerebras.ts for the adapter. reasoning_format='hidden' nukes
// reasoning from the streamed output (see buildModelOptions in generate.ts).
// Fallback: openai/gpt-oss-20b via Groq if CEREBRAS_API_KEY is not set.
// Benchmark: bun scripts/bench-model-comparison.mjs
export const DEFAULT_MODEL = process.env.CEREBRAS_API_KEY
  ? 'cerebras/gpt-oss-120b'
  : 'openai/gpt-oss-120b'

export function isKnownModel(id: string): boolean {
  return SHIP_FAST_MODELS.some((m) => m.id === id)
}

export function getProvider(id: string): ModelProvider | undefined {
  return SHIP_FAST_MODELS.find((m) => m.id === id)?.provider
}

// Only the gpt-oss reasoning models accept `reasoning_effort`; sending it to
// others (e.g. llama-3.1-8b-instant) returns a 400. Gate it so fast models are
// usable for latency-sensitive steps like classification.
export function supportsReasoningEffort(id: string): boolean {
  return /gpt-oss/i.test(id)
}
