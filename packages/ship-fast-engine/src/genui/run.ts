import {
  runV2ComposedGeneration,
  type V2Event,
  type ComposedContent,
} from './v2-compose.ts'
import { DEFAULT_MODEL } from './model-list.ts'
import { detectLanguage } from '../pipeline/detect-language'
import type { GenUIEvent, GeneratedArtifact } from './events.ts'

export type { ComposedContent } from './v2-compose.ts'

export interface OrchestratorResult {
  /** Final assembled openui-lang program (PageSwitch over composed Stack pages). */
  source: string
  /** Seeded theme name (caffeine, elegant-luxury, …) — drives the preview palette. */
  theme: string | null
  /** Detected locale (ISO 639-1 code) — drives translation provider. */
  locale: string
  /** Brand string used across the composed pages. */
  brand: string
  /** Vertical family the engine composed (Cafe, LawFirm, Newsroom, …). */
  category?: string
  /** Fullstack/admin sidecar artifacts (manifest, …). */
  artifacts?: GeneratedArtifact[]
}

/** Adapt the engine's V2 events to the frontend stream's GenUIEvent shape. */
function toGenUIEvent(event: V2Event): GenUIEvent {
  switch (event.type) {
    case 'module':
      return { type: 'module', id: event.id, text: event.text }
    case 'done':
      return { type: 'done', modules: 0, ms: 0 }
    default:
      return event
  }
}

/**
 * THE generation engine entry. A single composable path for every prompt: the
 * homepage is authored in the first pass (vertical pick + props) and the other
 * pages fan out in parallel. Output is valid OpenUI by construction — no
 * fallback, no per-vertical engines.
 */
export async function runHomepageOrchestrator(p: {
  prompt: string
  preferredLanguage?: string
  modelId?: string
  sessionSeed?: string
  ownerEmail?: string
  signal?: AbortSignal
  /** Reuse cached AI content (per-prompt) — the seed still re-randomizes layout. */
  cachedContent?: ComposedContent
  /** Receives the (cache-augmented) content to persist for future sessions. */
  onContent?: (content: ComposedContent) => void
  onEvent?: (event: GenUIEvent) => void
  onSource?: (source: string) => void
}): Promise<OrchestratorResult> {
  const languageMode = p.cachedContent
    ? { code: p.preferredLanguage || 'en' }
    : await detectLanguage(p.prompt, p.preferredLanguage || 'en')
  const modelId = p.modelId || DEFAULT_MODEL
  const onEvent = p.onEvent
  const result = await runV2ComposedGeneration({
    prompt: p.prompt,
    modelId,
    sessionSeed: p.sessionSeed,
    preferredLanguage: languageMode.code,
    signal: p.signal,
    cachedContent: p.cachedContent,
    onContent: p.onContent,
    onSource: p.onSource,
    onEvent: onEvent ? (event) => onEvent(toGenUIEvent(event)) : undefined,
  })
  return {
    source: result.source,
    theme: result.theme,
    locale: result.locale,
    brand: result.brand,
    category: result.category,
    artifacts: result.artifacts,
  }
}
