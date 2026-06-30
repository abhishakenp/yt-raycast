// Client-safe model catalog (NO provider SDK imports). Lists every model wired up
// in model.ts so all of them are selectable in the picker for testing — including
// the small/fast ones. Default is the strongest reliable model.

export type ModelProvider = 'groq' | 'gemini' | 'talaas' | 'windsurf'

export interface ShipFastModel {
  id: string
  label: string
  provider: ModelProvider
}

export const SHIP_FAST_MODELS: readonly ShipFastModel[] = [
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
  { id: 'swe-1-6', label: 'SWE-1.6 (Windsurf)', provider: 'windsurf' },
  {
    id: 'swe-1-6-fast',
    label: 'SWE-1.6 Fast (Windsurf)',
    provider: 'windsurf',
  },
  { id: 'glm-5-2', label: 'GLM-5.2 (Windsurf)', provider: 'windsurf' },
  {
    id: 'glm-5-2-none',
    label: 'GLM-5.2 No-Thinking (Windsurf)',
    provider: 'windsurf',
  },
]

// Default to GLM-5.2 with thinking OFF (-none suffix) via the Windsurf/Codeium
// backend (windsurf provider). Thinking is encoded in the model id suffix
// (-none/-low/-medium/-high/-max); -none disables it. Verified live: swe-1-6
// rejects thinking variants with permission_denied (no thinking support), while
// glm-5-2-none is accepted and runs with thinking off.
export const DEFAULT_MODEL = 'glm-5-2-none'

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
