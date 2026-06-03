import { geminiText } from "@tanstack/ai-gemini"
import { groqText } from "@tanstack/ai-groq"
import { DEFAULT_MODEL } from "./model-list.ts"

// Map each model id to a factory that builds its typed adapter. Using literal ids
// keeps geminiText/groqText's model-union types satisfied without any casts.
// API keys are read from env by the adapters (GEMINI_API_KEY / GROQ_API_KEY).
const ADAPTERS: Record<string, () => ReturnType<typeof geminiText> | ReturnType<typeof groqText>> = {
  "llama-3.3-70b-versatile": () => groqText("llama-3.3-70b-versatile"),
  "openai/gpt-oss-120b": () => groqText("openai/gpt-oss-120b"),
  "openai/gpt-oss-20b": () => groqText("openai/gpt-oss-20b"),
  "meta-llama/llama-4-scout-17b-16e-instruct": () =>
    groqText("meta-llama/llama-4-scout-17b-16e-instruct"),
  "qwen/qwen3-32b": () => groqText("qwen/qwen3-32b"),
  "llama-3.1-8b-instant": () => groqText("llama-3.1-8b-instant"),
  "gemini-3.5-flash": () => geminiText("gemini-3.5-flash"),
  "gemini-2.5-flash": () => geminiText("gemini-2.5-flash"),
  "gemini-2.0-flash": () => geminiText("gemini-2.0-flash"),
}

export function getAdapter(modelId: string) {
  const make = ADAPTERS[modelId] ?? ADAPTERS[DEFAULT_MODEL]
  return make()
}
