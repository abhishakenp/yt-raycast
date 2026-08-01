import { geminiText } from '@tanstack/ai-gemini'
import { groqText } from '@tanstack/ai-groq'
import { cerebrasText } from './llm/cerebras.ts'
import { pollinationsText } from './llm/pollinations.ts'
import { DEFAULT_MODEL } from './model-list.ts'

// Map each model id to a factory that builds its typed adapter. Using literal ids
// keeps geminiText/groqText's model-union types satisfied without any casts.
// API keys are read from env by the adapters (GEMINI_API_KEY / GROQ_API_KEY /
// CEREBRAS_API_KEY).
const ADAPTERS: Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  () => any
> = {
  'cerebras/gpt-oss-120b': () => cerebrasText('gpt-oss-120b'),
  'pollinations/openai': () => pollinationsText('openai'),
  'llama-3.3-70b-versatile': () => groqText('llama-3.3-70b-versatile'),
  'openai/gpt-oss-120b': () => groqText('openai/gpt-oss-120b'),
  'openai/gpt-oss-20b': () => groqText('openai/gpt-oss-20b'),
  'meta-llama/llama-4-scout-17b-16e-instruct': () =>
    groqText('meta-llama/llama-4-scout-17b-16e-instruct'),
  'qwen/qwen3-32b': () => groqText('qwen/qwen3-32b'),
  'llama-3.1-8b-instant': () => groqText('llama-3.1-8b-instant'),
  'gemini-3.5-flash': () => geminiText('gemini-3.5-flash'),
  'gemini-2.5-flash': () => geminiText('gemini-2.5-flash'),
  'gemini-2.0-flash': () => geminiText('gemini-2.0-flash'),
}

// Adapter fallback used when the requested id (or the configured DEFAULT_MODEL)
// is not backed by a groq/gemini/cerebras SDK adapter — e.g. talaas ids that are
// selectable in the picker but routed through a different backend. Falling back to
// a known-good groq adapter keeps getAdapter total and always returns a valid
// provider.
const FALLBACK_ADAPTER = ADAPTERS['openai/gpt-oss-20b']

export function getAdapter(modelId: string) {
  const make = ADAPTERS[modelId] ?? ADAPTERS[DEFAULT_MODEL] ?? FALLBACK_ADAPTER
  return make()
}
