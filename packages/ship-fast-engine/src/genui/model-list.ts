// Client-safe model catalog (NO provider SDK imports). Lists every model wired up
// in model.ts so all of them are selectable in the picker for testing — including
// the small/fast ones. Default is the strongest reliable model.

export type GenUIProvider = "groq" | "gemini" | "talaas"

export interface GenUIModel {
  id: string
  label: string
  provider: GenUIProvider
}

export const GENUI_MODELS: readonly GenUIModel[] = [
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B", provider: "groq" },
  { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B", provider: "groq" },
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", provider: "groq" },
  { id: "meta-llama/llama-4-scout-17b-16e-instruct", label: "Llama 4 Scout 17B", provider: "groq" },
  { id: "qwen/qwen3-32b", label: "Qwen3 32B", provider: "groq" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant", provider: "groq" },
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash", provider: "gemini" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "gemini" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "gemini" },
  { id: "llama3.1-8B", label: "Llama 3.1 8B (Talaas)", provider: "talaas" },
]

// Strongest reliable default (no free-tier rate limits, strong instruction-following).
export const DEFAULT_MODEL = "openai/gpt-oss-120b"

export function isKnownModel(id: string): boolean {
  return GENUI_MODELS.some((m) => m.id === id)
}

export function getProvider(id: string): GenUIProvider | undefined {
  return GENUI_MODELS.find((m) => m.id === id)?.provider
}
