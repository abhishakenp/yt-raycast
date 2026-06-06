import { mergeStatements } from '@openuidev/lang-core'
import { generateUI, type GenUIEvent } from './orchestrator.ts'
import { DEFAULT_MODEL } from './model-list.ts'

export interface OrchestratorResult {
  /** Final assembled openui-lang program (PageSwitch over AI-selected page blocks). */
  source: string
  /** AI-picked theme name (caffeine, elegant-luxury, …) — drives the preview palette. */
  theme: string | null
  /** AI-detected locale (ISO 639-1 code) — drives translation provider. */
  locale: string
  /** Brand string the model used for the page blocks. */
  brand: string
}

const FIRST_QUOTED = /=\s*[A-Za-z][A-Za-z0-9_]*\(\s*"((?:\\.|[^"\\])*)"/
/** Programs shorter than this are almost always block-default stubs, not real LLM output. */
const STUB_PROGRAM_MAX_CHARS = 900

/**
 * Run the GenUI orchestrator (the ported original engine) and assemble its
 * streamed events into a single renderable program. The orchestrator makes ONE
 * AI plan call (brand + tagline + pages + a vibe-matched theme, all by AI
 * relevance — no keyword heuristics), then generates each page's content against
 * a rich full-page KimiPage block in parallel. Throws on hard failure.
 */
export async function runHomepageOrchestrator(p: {
  prompt: string
  modelId?: string
  signal?: AbortSignal
  onEvent?: (event: GenUIEvent) => void
  /**
   * Live program callback. Fires with the FULL accumulated program every time a
   * statement (skeleton, then each page) lands — so the preview can paint the
   * skeleton immediately and pop each page in as it finishes, instead of waiting
   * for the whole run. This is what makes the stream live rather than a replay.
   */
  onSource?: (source: string) => void
}): Promise<OrchestratorResult> {
  let theme: string | null = null
  let locale = 'en'
  let source = ''
  let brand = ''
  let firstError = ''

  // Merge each streamed statement into the running program and surface it live.
  // The skeleton (PageSwitch) lands first, then each page module merges in as it
  // completes — pages generate in parallel, so they arrive out of order and
  // mergeStatements folds each into place. The auth single-page case has no
  // skeleton and a `root = …` module, so the first statement seeds the program.
  const mergeIn = (text: string) => {
    const t = (text || '').trim()
    if (!t) return
    if (!source) {
      source = t
    } else {
      try {
        const merged = mergeStatements(source, t)
        if (merged && merged.trim()) source = merged
      } catch {
        // skip an unmergeable fragment rather than wiping the program
      }
    }
    if (!brand) {
      const match = source.match(FIRST_QUOTED)
      if (match) brand = match[1]
    }
    p.onSource?.(source)
  }

  for await (const event of generateUI(p.prompt, p.modelId || DEFAULT_MODEL, p.signal)) {
    p.onEvent?.(event)
    if (event.type === 'theme') theme = event.name
    else if (event.type === 'locale') locale = event.code
    else if (event.type === 'skeleton') mergeIn(event.text)
    else if (event.type === 'module') mergeIn(event.text)
    else if (event.type === 'error') firstError ||= event.message
  }

  if (!source.trim()) {
    throw new Error(firstError || 'orchestrator produced an empty program')
  }

  return { source, theme, locale, brand }
}
