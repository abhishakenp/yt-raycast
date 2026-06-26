import { parseHTML } from 'linkedom'

import type { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

// Prompt-driven targeted text edits over a verbatim clone. We extract a handful of
// high-signal visible strings from the cloned HOME html (title, h1-h3, hero/CTA
// buttons, brand-ish strings), ask the model for a small JSON array of
// {before, after} replacements, then stream each as a `text` edit via createEdit.
//
// Generic by design: no per-site/slug logic. The model only sees extracted
// candidate strings + the user's brief, and may only rewrite brand/heading/tagline/
// hero/CTA copy. Every `before` is verified to literally appear in homeHtml before
// we apply it, and ops whose substring is missing are skipped (never abort).

const MAX_OPS = 12
const MAX_CANDIDATES = 40
const MAX_CANDIDATE_CHARS = 160
const EDIT_PASS_TIMEOUT_MS = 25_000

type TargetedEditClient = Pick<ConvexHttpClient, 'mutation'>

type GenerateText = (
  model: string,
  system: string,
  user: string,
  signal: AbortSignal,
  retries?: number,
) => Promise<string>

interface GenerateTextRuntime {
  generateText: GenerateText
  DEFAULT_MODEL: string
}

// Dynamic import keeps the heavy engine (and its provider SDKs) out of the route's
// static graph — same pattern as chat-refinement-response / translate-response.
const loadGenerateTextRuntime = async (): Promise<GenerateTextRuntime> => {
  const [{ generateText }, { DEFAULT_MODEL }] = await Promise.all([
    import('@ship-fast/engine'),
    import('@ship-fast/engine/model-list.js'),
  ])
  return { generateText, DEFAULT_MODEL }
}

const SYSTEM_PROMPT =
  "You adapt a cloned website to the user's brief by emitting TARGETED text " +
  'replacements. Output ONLY a JSON array of {"before":"<exact substring ' +
  'currently on the page>","after":"<replacement>"}. Only change brand names, ' +
  'headings, taglines, hero/CTA copy. `before` MUST be an exact, reasonably-' +
  'unique substring that appears in the page. Max 12 ops. No prose.'

interface ReplaceOp {
  before: string
  after: string
}

// Pull high-signal visible text from the cloned home html. We grab the title,
// h1-h3 headings, hero/CTA buttons & links, and short brand-ish strings (the
// site name in header/nav). Whitespace-collapsed, deduped, length-capped.
function extractCandidates(homeHtml: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()

  const push = (raw: string | null | undefined) => {
    if (!raw) return
    const text = raw.replace(/\s+/g, ' ').trim()
    if (!text || text.length > MAX_CANDIDATE_CHARS) return
    if (seen.has(text)) return
    seen.add(text)
    out.push(text)
  }

  try {
    const { document } = parseHTML(homeHtml)

    push(document.querySelector('title')?.textContent)

    for (const sel of ['h1', 'h2', 'h3']) {
      for (const el of Array.from(document.querySelectorAll(sel))) {
        push(el.textContent)
      }
    }

    // Hero / CTA buttons and links.
    for (const el of Array.from(
      document.querySelectorAll(
        'a[class*="cta" i], a[class*="button" i], a[class*="btn" i], button, [role="button"]',
      ),
    )) {
      push(el.textContent)
    }

    // Brand-ish strings: text inside header/nav landmarks, logo alts.
    for (const el of Array.from(
      document.querySelectorAll(
        'header a, nav a, [class*="logo" i], [class*="brand" i]',
      ),
    )) {
      push(el.textContent)
    }
    for (const img of Array.from(document.querySelectorAll('img[alt]'))) {
      push(img.getAttribute('alt'))
    }
  } catch {
    // Malformed html — fall back to no candidates; the pass becomes a no-op.
  }

  return out.slice(0, MAX_CANDIDATES)
}

// Tolerant JSON parse: strip ``` code fences, then extract the first [...] array.
function parseReplaceOps(raw: string): ReplaceOp[] {
  let text = raw.trim()
  // Strip leading/trailing code fences (```json ... ```).
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

  let candidate = text
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start !== -1 && end !== -1 && end > start) {
    candidate = text.slice(start, end + 1)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(candidate)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const ops: ReplaceOp[] = []
  for (const item of parsed) {
    if (item === null || typeof item !== 'object') continue
    const before = (item as Record<string, unknown>).before
    const after = (item as Record<string, unknown>).after
    if (typeof before !== 'string' || typeof after !== 'string') continue
    if (!before.trim()) continue
    ops.push({ before, after })
    if (ops.length >= MAX_OPS) break
  }
  return ops
}

export async function runTargetedEdits(input: {
  client: TargetedEditClient
  sessionId: string
  anonymousOwnerSecret?: string
  homeHtml: string
  brief: string
}): Promise<void> {
  const { client, sessionId, anonymousOwnerSecret, homeHtml, brief } = input

  const trimmedBrief = brief.trim()
  if (!trimmedBrief) return

  const candidates = extractCandidates(homeHtml)
  if (candidates.length === 0) return

  const { generateText, DEFAULT_MODEL } = await loadGenerateTextRuntime()

  const userPrompt =
    `Brief:\n${trimmedBrief}\n\n` +
    `Candidate strings currently on the page (rewrite only what the brief calls for):\n` +
    candidates.map((c, i) => `${i + 1}. ${c}`).join('\n')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), EDIT_PASS_TIMEOUT_MS)

  let rawOutput: string
  try {
    rawOutput = await generateText(
      DEFAULT_MODEL,
      SYSTEM_PROMPT,
      userPrompt,
      controller.signal,
    )
  } catch (err) {
    console.warn(
      `[clone] targeted-edit generation failed for ${sessionId}:`,
      (err as Error)?.message ?? err,
    )
    return
  } finally {
    clearTimeout(timer)
  }

  const ops = parseReplaceOps(rawOutput)
  if (ops.length === 0) return

  // Apply sequentially (stream). Skip any op whose `before` isn't literally on the
  // page; createEdit will no-op or fail otherwise, and the model can hallucinate.
  const applied = new Set<string>()
  for (const op of ops) {
    if (!op.before || op.before === op.after) continue
    if (applied.has(op.before)) continue
    if (!homeHtml.includes(op.before)) continue
    applied.add(op.before)

    try {
      await client.mutation(api.sessions.createEdit, {
        sessionId: sessionId as Id<'sessions'>,
        editType: 'text',
        beforeText: op.before,
        afterText: op.after,
        anonymousOwnerSecret,
      })
    } catch (err) {
      // A single failed edit must not abort the rest of the pass.
      console.warn(
        `[clone] targeted-edit apply failed for ${sessionId}:`,
        (err as Error)?.message ?? err,
      )
    }
  }
}
