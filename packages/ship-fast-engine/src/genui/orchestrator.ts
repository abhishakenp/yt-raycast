import { mergeStatements } from "@openuidev/lang-core"
import { formatLlmFailureMessage, generateText, isHardLlmFailure } from "../generate.ts"
import { pageSystemPrompt, componentCatalog } from "./prompt.ts"
import { stripFences } from "./parser.ts"
import { DEFAULT_MODEL } from "./model-list.ts"
import { BLOCK_TAXONOMY, pickBlock, componentNames } from "@ship-fast/blocks"
import { THEME_CATALOG, isKnownTheme, pickRandomTheme } from "@ship-fast/blocks"
import type { ClonedPage, ClonedSection, ExtractedTokens } from "../clone/types.ts"
import { generateFallbackSection } from "../clone/fallback.ts"
import { validateOpenUISource } from "../pipeline/openui-validate.js"
import { normalizeUrl } from "../clone/crawler.ts"

// Server-side, SYSTEM-controlled site assembly.
//
// EVERY consumer app is a multi-page navigable site. The model only supplies
// per-page CONTENT DATA — the orchestrator owns the structure:
//   1. ONE AI call (Groq gpt-oss-120b by default) returns { brand, tagline, pages },
//      and for EACH page a relevance-ranked shortlist of block names, chosen by the
//      model from the block CATALOG (name + description only — never block source).
//      The system then RANDOM-picks one block from each shortlist (variety). There are
//      NO keyword heuristics anywhere — the AI judges relevance from descriptions.
//   2. the skeleton (`$page` seed + `root = PageSwitch([labels],[home,p1,…])`)
//      is emitted immediately so the shell paints before content arrives
//   3. ALL pages fan out in parallel, one content-only generateText per page
//   4. done. AUTH stays a single-page special case when the model returns one
//      sign-in page whose chosen block is an auth block.

export type GenUIEvent =
  | { type: "status"; message: string }
  | { type: "skeleton"; text: string }
  | { type: "plan"; ids: string[] }
  | { type: "theme"; name: string }
  | { type: "locale"; code: string }
  | { type: "module_start"; id: string }
  | { type: "module_retry"; id: string; attempt: number }
  | { type: "module"; id: string; text: string; failed?: boolean }
  | { type: "source"; text: string }
  | { type: "done"; modules: number; ms: number; source?: string }
  | { type: "error"; message: string }

const MAX_PARALLEL = 8
const SUBTREE_TIMEOUT_MS = 60_000
const SUBTREE_RETRIES = 4

// Randomness, the same way generate.ts does it (Math.random). A factory so the
// pseudo-random source is named + swappable without touching call sites.
function makeRng(): () => number {
  return Math.random
}

interface PlannedPage {
  id: string
  label: string
  brief: string
  block: string
}
interface Plan {
  brand: string
  tagline: string
  theme: string
  locale: string
  pages: PlannedPage[]
}

// The blocks the AI may choose from: name + description only, sourced from the
// generated component spec (NOT block source/content) and limited to registered
// page blocks (BLOCK_TAXONOMY keys). The description is the relevance signal.
// First sentence (capped) of a description — enough for relevance, keeps the
// selection prompt small enough to scale to hundreds of blocks (5+ per category).
function oneLine(d: string): string {
  const firstSentence = d.split(/(?<=[.!?])\s/)[0] ?? d
  const s = firstSentence.length <= 200 ? firstSentence : d.slice(0, 197)
  return s.length > 200 ? `${s.slice(0, 197)}…` : s
}

function pageBlockCatalog(): Array<{ name: string; description: string }> {
  return componentCatalog()
    .filter((c) => c.name in BLOCK_TAXONOMY && typeof c.description === "string" && c.description)
    .map((c) => ({ name: c.name, description: oneLine(c.description as string) }))
}

// Derive a passable brand from the raw prompt when the model gives us none.
function brandFromPrompt(prompt: string): string {
  const words = prompt
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
  if (words.length === 0) return "Studio"
  return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
}

function planSystem(): string {
  return `You are a product architect and UI block selector. You are given a CATALOG of available page blocks, each with a NAME and a DESCRIPTION of exactly what it is and when to use it. Given a build request you (1) name the brand and a one-line tagline, (2) decide the 3–5 pages the site needs, and (3) for EACH page choose the MOST RELEVANT blocks from the catalog by matching the page's purpose AND the overall site to the block descriptions, and (4) pick the single THEME whose vibe best fits the brand/request from the THEME palette list. Reply with STRICT JSON only — no prose, no markdown, no code fences.`
}

function planUser(
  prompt: string,
  catalog: Array<{ name: string; description: string }>,
  themes: Array<{ name: string; description: string }>,
): string {
  const list = catalog.map((c) => `- ${c.name}: ${c.description}`).join("\n")
  const themeList = themes.map((t) => `- ${t.name}: ${t.description}`).join("\n")
  return `Build request: ${prompt}

AVAILABLE PAGE BLOCKS (name: description) — choose ONLY from these:
${list}

AVAILABLE THEMES (name: vibe) — pick ONE whose mood best fits the request:
${themeList}

Return ONLY this JSON shape (no markdown, no code fences):
{"brand":"<short brand/product name>","tagline":"<one short sentence>","theme":"<theme-name>","locale":"<ISO 639-1 code for the language of this request, e.g. en, hi, ne, es, fr, ja, zh, ar; for a romanized / Latin-script request append \"-latn\" (e.g. hi-latn); for a Hindi-English code-mix use \"hinglish\"; for another Indian-language+English mix append \"-en\" (e.g. ta-en)>","pages":[{"label":"<short nav word>","brief":"<one line of what this page covers>","blocks":["<BlockName>", "<BlockName>"]}]}

Rules:
- "pages": 3 to 5 entries; the FIRST is the home/landing route. For a single-purpose request (e.g. just a sign-in screen) a single page is allowed.
- "blocks": 1 to 4 block NAMES copied EXACTLY from the catalog above, ordered most-relevant first. Choose blocks whose DESCRIPTION genuinely fits this page's purpose AND the overall site (e.g. a ramen shop's home picks a restaurant home block, a pricing page picks a pricing block). The home page's blocks must be landing/home-style blocks.
- "theme": ONE theme NAME copied EXACTLY from the THEMES list, whose vibe matches the brand and request (e.g. a luxury restaurant -> "elegant-luxury", a dev tool -> "vercel" or "supabase", a kids site -> "candyland").
- "locale": The ISO 639-1 language code matching the language of the build request (e.g. "en" for English, "hi" for Hindi, "ne" for Nepali, "es" for Spanish, "fr" for French, "ja" for Japanese). Default to "en" if the request is in English or you cannot determine the language. For a ROMANIZED / Latin-script version of an Indian language — pure language in Latin letters (e.g. "roman hindi", "romanized nepali", "hindi in english letters") — append "-latn" to the base code: hi-latn, ne-latn, mr-latn. For a CODE-MIX (the language blended WITH English words) use: "hinglish" for Hindi+English, or "<base>-en" for others (e.g. "tanglish"/"tamil english mix" → ta-en, "marathi english mix" → mr-en). "hinglish" is a code-mix, NOT the same as romanized "hi-latn".
- Labels are short nav words (Home, Features, Pricing, About, Contact, Shop, Work, Menu, Blog …).
- brand, tagline and briefs must be specific to the request.
- Home/landing pages should support answer-engine optimization: clear product definition, target audience, benefits, and realistic FAQ-style copy where the chosen block supports it.`
}

const isKnownBlock = (name: unknown): boolean =>
  typeof name === "string" && name in BLOCK_TAXONOMY

const BLOCK_NAME_INDEX = Object.keys(BLOCK_TAXONOMY)
const BLOCK_NAME_KEY_INDEX = Object.fromEntries(
  BLOCK_NAME_INDEX.map((name) => [name.toLowerCase(), name]),
)
const BLOCK_NAME_COMPACT_INDEX = Object.fromEntries(
  BLOCK_NAME_INDEX.map((name) => [name.toLowerCase().replace(/[^a-z0-9]/g, ""), name]),
)

// Normalize model-returned block IDs so small format drift does not silently
// collapse every page to placeholders.
function normalizeBlockName(raw: string): string | undefined {
  const cleaned = raw.trim().replace(/^[-*\s]*|[*`'"]$/g, "").trim()
  if (!cleaned) return

  const compact = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "")

  if (isKnownBlock(cleaned)) return cleaned

  const lowered = cleaned.toLowerCase()
  if (BLOCK_NAME_KEY_INDEX[lowered]) return BLOCK_NAME_KEY_INDEX[lowered]

  const compactMatch = BLOCK_NAME_COMPACT_INDEX[compact(cleaned)]
  if (compactMatch) return compactMatch

  const m = /^(.+?)(Page\d*)$/i.exec(cleaned)
  if (m) {
    const base = m[1]
    const suffix = m[2]
    if (!/kimi/i.test(base)) {
      const kimiForm = `${base}Kimi${suffix}`
      if (isKnownBlock(kimiForm)) return kimiForm
    }
    const baseMatch = BLOCK_NAME_COMPACT_INDEX[compact(`${base}Kimi${suffix}`)]
    if (baseMatch) return baseMatch
  }

  return
}

// Random pick from an AI-returned shortlist (variety); fall back if none are valid.
function pickFrom(rng: () => number, names: unknown, fallback: string): string {
  const normalized = Array.isArray(names)
    ? names.map((name) => (typeof name === "string" ? normalizeBlockName(name) : undefined)).filter(
        (name): name is string => Boolean(name),
      )
    : []

  const valid = normalized.filter(isKnownBlock)
  if (!valid.length) return fallback
  return valid[Math.min(valid.length - 1, Math.floor(rng() * valid.length))]
}

// Sentinel fallback when the model cannot propose a valid block.
const PLACEHOLDER_BLOCK = "__coming_soon__"
const placeholderNode = (id: string) => `${id} = Box([Text("Coming soon")])`

function fallbackBlock(rng: () => number, isHome: boolean): string {
  const navTypeFallback = isHome ? ["home", "landing"] : ["list", "index", "detail", "about", "contact"]
  return (
    pickBlock(
      rng,
      (meta) => {
        if (isHome) {
          return navTypeFallback.includes(meta.navPageType)
        }
        return meta.allowHero
      },
      PLACEHOLDER_BLOCK,
    ) || PLACEHOLDER_BLOCK
  )
}

// Parse the combined brief+selection call. For each page, random-pick from the
// model's relevance shortlist. Throws if no pages, so the caller can fall back.
function parsePlan(raw: string, rng: () => number, prompt: string): Plan {
  const parsed = JSON.parse(stripFences(raw)) as {
    brand?: unknown
    tagline?: unknown
    theme?: unknown
    locale?: unknown
    pages?: Array<{ label?: unknown; brief?: unknown; blocks?: unknown }>
  }
  const rawPages = Array.isArray(parsed.pages) ? parsed.pages : []
  const pages: PlannedPage[] = rawPages
    .filter((p) => !!p && typeof p.label === "string" && p.label.trim().length > 0)
    .slice(0, 5)
    .map((p, i) => {
      const label = (p.label as string).trim()
      const brief = (typeof p.brief === "string" && p.brief.trim()) || label
      const block = pickFrom(rng, p.blocks, fallbackBlock(rng, i === 0))
      return { id: i === 0 ? "home" : `p${i}`, label, brief, block }
    })
  if (pages.length === 0) throw new Error("no pages in plan")
  const brand =
    typeof parsed.brand === "string" && parsed.brand.trim()
      ? parsed.brand.trim()
      : brandFromPrompt(prompt)
  const tagline =
    typeof parsed.tagline === "string" && parsed.tagline.trim()
      ? parsed.tagline.trim()
      : `${brand} — built for what's next.`
  const theme = isKnownTheme(parsed.theme) ? parsed.theme : pickRandomTheme(rng)
  const rawLocale = typeof parsed.locale === "string" ? parsed.locale.trim().toLowerCase() : ""
  const locale = (/^[a-z]{2}$/.test(rawLocale) || /^[a-z]{2,8}-latn$/.test(rawLocale)) ? rawLocale : "en"
  return { brand, tagline, theme, locale, pages }
}

// Last-resort plan when the AI call/JSON entirely fails. Deliberately generic and
// keyword-free — a rare safety net, not the primary path.
function fallbackPlan(prompt: string, rng: () => number): Plan {
  const brand = brandFromPrompt(prompt)
  const labels = ["Home", "Features", "Pricing", "About", "Contact"]
  const pages: PlannedPage[] = labels.map((label, i) => ({
    id: i === 0 ? "home" : `p${i}`,
    label,
    brief: label,
    block: fallbackBlock(rng, i === 0),
  }))
  return { brand, tagline: `${brand} — built for what's next.`, theme: pickRandomTheme(rng), locale: "en", pages }
}

function pageUser(
  brand: string,
  navLabels: string[],
  page: PlannedPage,
  tagline: string,
): string {
  const navJson = JSON.stringify(navLabels)
  return `Brand: ${brand}
Tagline: ${tagline}
Site navigation (reuse VERBATIM): ${navJson}
This page: "${page.label}" — ${page.brief}

Output ONLY ONE statement, nothing else:
${page.id} = ${page.block}({...props})

Rules:
- Fill EVERY content field of ${page.block}'s signature with rich, specific, on-prompt copy and data — no placeholders, no lorem ipsum, no "Item 1".
- The first two arguments MUST be exactly ${JSON.stringify(brand)} then ${navJson} (verbatim).
- Use semantic, intent-shaped copy: one clear value proposition, a concise direct-answer style overview near the top when the page is home/landing, realistic FAQ items when the block includes them, and specific benefits/use cases instead of generic "Welcome" headings.
- Mention brand name, what the product does, who it is for, and key benefits naturally in the visible copy.
- Write numbers/currency PLAINLY ($48 or 1,245) — never LaTeX or markdown.
- NO styling, NO image src, NO urls, NO className. The block owns all design, images, and nav wiring.
- Output openui-lang only. No markdown, no code fences, no extra statements.`
}

// Validate a generated page module. The model occasionally emits openui-lang that
// doesn't parse (or doesn't define this page id); merging such text wipes the whole
// program (mergeStatements returns "" on a bad fragment). So we probe it against a
// stub root, and on failure substitute the chosen block instantiated with just
// brand+nav — its rich defaults render a complete, on-theme page (never blank).
// If there is no valid chosen block, emit the server-authored unstyled placeholder node.
function validateModule(
  page: PlannedPage,
  raw: string,
  brand: string,
  labels: string[],
): { text: string; failed: boolean } {
  // A page module must define ONLY its own subtree. Models sometimes emit a stray
  // `root = …` or `$page = …` line; merging that clobbers the system-owned root
  // (PageSwitch) and wipes every other page. Strip any such illegal top-level
  // statement before validating/merging — openui-lang is line-oriented.
  const text = stripFences(raw)
    .split("\n")
    .filter((line) => {
      const t = line.trim()
      return !/^root\s*=/.test(t) && !/^\$\w+\s*=/.test(t)
    })
    .join("\n")
    .trim()
  const definesId = new RegExp(`(^|\\n)\\s*${page.id}\\s*=`).test(text)
  if (definesId) {
    try {
      const probe = mergeStatements(`root = Box([${page.id}])`, text)
      if (probe && probe.trim() && probe.includes(`${page.id} =`)) {
        return { text, failed: false }
      }
    } catch {
      // fall through to fallback
    }
  }
  return {
    text: isKnownBlock(page.block)
      ? `${page.id} = ${page.block}(${JSON.stringify(brand)}, ${JSON.stringify(labels)})`
      : placeholderNode(page.block),
    failed: true,
  }
}

function authUser(brand: string, block: string): string {
  return `Build request brand: ${brand}

Output ONLY this single root statement for a sign-in screen, nothing else:
root = ${block}(${JSON.stringify(brand)})
You may add { ...content... } as the third argument with on-brand sign-in copy (heading, subheading), but keep the first argument exactly ${JSON.stringify(brand)}. No markdown, no other statements.`
}

function withParentAbort(parent: AbortController, ms: number) {
  const sub = new AbortController()
  const onAbort = () => sub.abort()
  parent.signal.addEventListener("abort", onAbort, { once: true })
  const timer = setTimeout(() => sub.abort(), ms)
  return {
    signal: sub.signal,
    cleanup: () => {
      clearTimeout(timer)
      parent.signal.removeEventListener("abort", onAbort)
    },
  }
}

// minimal async channel so parallel workers can emit events in real time
function channel<T>() {
  const buf: T[] = []
  let wake: (() => void) | null = null
  let closed = false
  return {
    push(v: T) {
      buf.push(v)
      wake?.()
      wake = null
    },
    close() {
      closed = true
      wake?.()
      wake = null
    },
    async *drain(): AsyncGenerator<T> {
      while (true) {
        if (buf.length) {
          yield buf.shift() as T
          continue
        }
        if (closed) return
        await new Promise<void>((r) => {
          wake = r
        })
      }
    },
  }
}

export async function* generateUI(
  prompt: string,
  modelId: string = DEFAULT_MODEL,
  parentSignal?: AbortSignal,
): AsyncGenerator<GenUIEvent> {
  const startedAt = Date.now()
  const abort = new AbortController()
  parentSignal?.addEventListener("abort", () => abort.abort(), { once: true })
  const ch = channel<GenUIEvent>()
  const rng = makeRng()

  const run = (async () => {
    try {
      ch.push({ type: "status", message: "Designing…" })

      // Guard: an empty catalog means the component registry failed to load (no kimi
      // page blocks registered in the library / BLOCK_TAXONOMY). Without this, the AI
      // gets an empty "choose from these" list and EVERY page silently falls back to
      // the placeholder node. Surface it as a hard error instead of an all-"Coming soon" page.
      const catalog = pageBlockCatalog()
      if (catalog.length === 0) {
        ch.push({
          type: "error",
          message:
            "Block catalog is empty — the component registry failed to load (no kimi page blocks registered). Aborting instead of rendering an all-placeholder page.",
        })
        return
      }

      // 1. ONE AI call: brand + tagline + pages, and per page a relevance-ranked
      //    block shortlist chosen by the model from the catalog (name + description).
      //    The system random-picks from each shortlist below — no keyword heuristics.
      let plan: Plan
      try {
        const raw = await generateText(
          modelId,
          planSystem(),
          planUser(prompt, catalog, THEME_CATALOG),
          abort.signal,
          2,
        )
        plan = parsePlan(raw, rng, prompt)
      } catch {
        plan = fallbackPlan(prompt, rng)
      }

      // Emit the chosen theme ASAP so the preview can apply it before content lands.
      ch.push({ type: "theme", name: plan.theme })
      ch.push({ type: "locale", code: plan.locale })

      // AUTH single-page special case — the model returned one sign-in page whose
      // chosen block is an auth block: render just that screen, no fan-out.
      const homeBlock = plan.pages[0].block
      if (plan.pages.length === 1 && BLOCK_TAXONOMY[homeBlock]?.category === "auth") {
        ch.push({ type: "status", message: "Building sign-in…" })
        ch.push({ type: "skeleton", text: "" })
        ch.push({ type: "plan", ids: ["root"] })
        ch.push({ type: "module_start", id: "root" })
        const { signal, cleanup } = withParentAbort(abort, SUBTREE_TIMEOUT_MS)
        try {
          const text = await generateText(
            modelId,
            pageSystemPrompt(homeBlock),
            authUser(plan.brand, homeBlock),
            signal,
            SUBTREE_RETRIES,
            (attempt) => ch.push({ type: "module_retry", id: "root", attempt }),
          )
          const safe = stripFences(text)
          const ok = /(^|\n)\s*root\s*=\s*\w+\(/.test(safe)
          ch.push({
            type: "module",
            id: "root",
            text: ok ? safe : `root = ${homeBlock}(${JSON.stringify(plan.brand)})`,
          })
        } catch {
          ch.push({
            type: "module",
            id: "root",
            text: `root = ${homeBlock}(${JSON.stringify(plan.brand)})`,
          })
        } finally {
          cleanup()
        }
        ch.push({ type: "done", modules: 1, ms: Date.now() - startedAt })
        return
      }

      // 2. Pages + their AI-selected (random-picked) blocks are ready.
      const pages = plan.pages.map((p) => ({ ...p }))
      const labels = pages.map((p) => p.label)
      const ids = pages.map((p) => p.id)

      // 3. Emit the skeleton immediately so the shell paints first.
      const skeleton = buildSkeleton(labels[0], labels, ids)
      ch.push({ type: "skeleton", text: skeleton })

      // 4. Fan out ALL pages in parallel.
      ch.push({ type: "plan", ids })
      ch.push({ type: "status", message: `Building ${pages.length} pages in parallel…` })

      const running = new Set<Promise<void>>()
      let next = 0
      const startOne = (page: PlannedPage) => {
        ch.push({ type: "module_start", id: page.id })
        // No valid kimi block for this page -> emit the server-authored unstyled
        // "Coming soon" placeholder node directly. No model call, no ComingSoon block.
        if (!isKnownBlock(page.block)) {
          ch.push({ type: "module", id: page.id, text: placeholderNode(page.id), failed: true })
          return
        }
        const { signal, cleanup } = withParentAbort(abort, SUBTREE_TIMEOUT_MS)
        const p = generateText(
          modelId,
          pageSystemPrompt(page.block),
          pageUser(plan.brand, labels, page, plan.tagline),
          signal,
          SUBTREE_RETRIES,
          (attempt) => ch.push({ type: "module_retry", id: page.id, attempt }),
        )
          .then((text) => {
            const { text: safe, failed } = validateModule(page, text, plan.brand, labels)
            ch.push({ type: "module", id: page.id, text: safe, failed })
          })
          .catch(() => {
            // On generation failure, render the chosen block with just brand+nav —
            // its rich defaults are a complete, on-theme page. If there is no valid
            // chosen block, emit the server-authored unstyled placeholder node.
            ch.push({
              type: "module",
              id: page.id,
              text: isKnownBlock(page.block)
                ? `${page.id} = ${page.block}(${JSON.stringify(plan.brand)}, ${JSON.stringify(labels)})`
                : placeholderNode(page.id),
              failed: true,
            })
          })
          .finally(cleanup)
        running.add(p)
        void p.finally(() => running.delete(p))
      }

      while (next < pages.length && running.size < MAX_PARALLEL) startOne(pages[next++])
      while (running.size > 0) {
        await Promise.race(running)
        while (next < pages.length && running.size < MAX_PARALLEL) startOne(pages[next++])
      }

      // 5. done.
      ch.push({ type: "done", modules: pages.length, ms: Date.now() - startedAt })
    } catch (e) {
      const err = e as { name?: string; message?: string }
      if (err?.name !== "AbortError") {
        ch.push({ type: "error", message: err?.message ?? "generation failed" })
      }
    } finally {
      ch.close()
    }
  })()

  for await (const ev of ch.drain()) yield ev
  await run
}

function buildSkeleton(firstLabel: string, labels: string[], ids: string[]): string {
  const labelsJson = JSON.stringify(labels)
  return `$page = ${JSON.stringify(firstLabel)}
root = PageSwitch(${labelsJson}, [${ids.join(", ")}])`
}

// SINGLE-PAGE skeleton (Tier 1): a flat site with no real multi-page nav roots
// DIRECTLY in a Stack of the home page's section refs — NO PageSwitch, NO `$page`,
// NO `home =` indirection. validateOpenUISource requires a literal `Stack([...])`
// root (it rejects `root = home`), so we inline the refs. The skeleton references
// the section var names that the home module later defines, exactly as the
// multi-page skeleton references page ids before they're defined.
function buildSinglePageSkeleton(sections: ClonedSection[]): string {
  const refs = sections.map(sectionVarName).join(", ")
  return `root = Stack([${refs}])`
}

// Assemble a SINGLE-PAGE program: the home section programs, then a Stack root of
// their refs. Mirrors assembleClone but with no PageSwitch wrapper.
function assembleSinglePage(sections: ClonedSection[]): string {
  const refs = sections.map(sectionVarName).join(", ")
  const programs = sections.map((s) => s.program).join("\n")
  return `${programs}\nroot = Stack([${refs}])`
}

// Selection-only entry point (the AI block picker WITHOUT the fan-out / content
// generation) — for testing and observability of how prompts map to blocks.
export async function selectPlan(
  prompt: string,
  modelId: string = DEFAULT_MODEL,
  parentSignal?: AbortSignal,
): Promise<{ brand: string; tagline: string; theme: string; pages: { label: string; block: string }[] }> {
  const abort = new AbortController()
  parentSignal?.addEventListener("abort", () => abort.abort(), { once: true })
  const rng = makeRng()
  let plan: Plan
  try {
    const raw = await generateText(
      modelId,
      planSystem(),
      planUser(prompt, pageBlockCatalog(), THEME_CATALOG),
      abort.signal,
      2,
    )
    plan = parsePlan(raw, rng, prompt)
  } catch {
    plan = fallbackPlan(prompt, rng)
  }
  return {
    brand: plan.brand,
    tagline: plan.tagline,
    theme: plan.theme,
    pages: plan.pages.map((p) => ({ label: p.label, block: p.block })),
  }
}

// The primitive spine a scraped/fallback section program may reference. Per
// CONTRACT, section programs may reference ONLY these primitives — NOT the heavy
// page blocks (MarketingKimiPage, …) that `componentNames` also exposes. We pin
// the spine explicitly and intersect with the live library so a spine primitive
// that was renamed/removed upstream is caught here rather than passing validation
// against a name the contract library no longer defines.
const PRIMITIVE_SPINE = [
  "Stack", "Grid", "Box", "Section", "Spacer", "Heading", "Text",
  "Button", "Card", "Badge", "Tabs", "Separator", "Image",
] as const
const LIBRARY_COMPONENT_NAMES = new Set<string>(componentNames)
const ALLOWED_COMPONENT_NAMES = new Set<string>(
  PRIMITIVE_SPINE.filter((name) => LIBRARY_COMPONENT_NAMES.has(name)),
)

// A section program must define EXACTLY `section_${kind}_${index}` and may
// reference ONLY the primitive spine. We probe it by wrapping the defined var in
// a Stack root (the shape validateOpenUISource accepts) — a real parse + component
// check. Returns false on parse failure, missing definition, or any component name
// outside the spine, so the caller can swap in a native fallback section.
function sectionVarName(section: { kind: string; index: number }): string {
  return `section_${section.kind}_${section.index}`
}

function sectionProgramValid(section: ClonedSection): boolean {
  const varName = sectionVarName(section)
  const program = String(section.program || "")
  const definesVar = new RegExp(`(^|\\n)\\s*${varName}\\s*=`).test(program)
  if (!definesVar) return false
  // No stray root/PageSwitch seed inside a section program.
  if (/(^|\n)\s*root\s*=/.test(program)) return false
  // Every PascalCase component call must be in the allowed spine (blocks library).
  for (const m of program.matchAll(/\b([A-Z][A-Za-z0-9_]*)\s*\(/g)) {
    if (!ALLOWED_COMPONENT_NAMES.has(m[1])) return false
  }
  // Real parse against the contract library, wrapped in an accepted Stack root.
  const probe = validateOpenUISource(`root = Stack([${varName}])\n${program}`)
  return probe.ok
}

// Assemble ONE page: concat section programs, then `${pageId} = Stack([refs])`.
function assemblePage(pageId: string, sections: ClonedSection[]): string {
  const refs = sections.map(sectionVarName).join(", ")
  const programs = sections.map((s) => s.program).join("\n")
  return `${pageId} = Stack([${refs}])\n${programs}`
}

// validateOpenUISource (openui-validate.js) is Stack-root-only — it categorically
// rejects any non-Stack root. The full assembled clone program roots in
// `PageSwitch([...])`, so the WHOLE program can never pass that validator. The
// contract is therefore enforced PER PAGE: each page is a `Stack([sectionRefs])`
// program, the exact shape validateOpenUISource accepts. We probe every page Stack
// (real parse + component-spine check) and the PageSwitch root is assembled only
// from pages that pass — so every page subtree the PageSwitch references is valid.
function pageProgramValid(_pageId: string, sections: ClonedSection[]): boolean {
  if (sections.length === 0) return false
  // Each referenced section var must be defined by its own program.
  for (const section of sections) {
    if (!sectionProgramValid(section)) return false
  }
  // Probe the page as a Stack-rooted program — the shape validateOpenUISource
  // accepts — by rooting the page's section refs directly in `root = Stack([...])`.
  const refs = sections.map(sectionVarName).join(", ")
  const programs = sections.map((s) => s.program).join("\n")
  const probe = validateOpenUISource(`root = Stack([${refs}])\n${programs}`)
  return probe.ok
}

// Assemble the FULL program: per-page Stacks + their section programs, then the
// skeleton `root = PageSwitch([labels], [pageIds])`.
function assembleClone(
  pages: { id: string; sections: ClonedSection[] }[],
  labels: string[],
): string {
  const pageBlocks = pages.map((p) => assemblePage(p.id, p.sections)).join("\n")
  const labelsJson = labels.map((l) => JSON.stringify(l)).join(", ")
  const pageRefs = pages.map((p) => p.id).join(", ")
  return `${pageBlocks}\nroot = PageSwitch([${labelsJson}], [${pageRefs}])`
}

// The clone job currently hardcodes ClonedPage.title to `Cloned: <url>` /
// `Cloned (fallback): <url>` — a URL string, NOT a real page title. Surfacing that
// as a nav label (or brand) prints raw URLs in the UI. Until a real <title> is
// extracted upstream, treat any such placeholder title as ABSENT and synthesize a
// readable label from the page's URL path instead.
const PLACEHOLDER_TITLE_RE = /^\s*Cloned(?:\s*\(fallback\))?\s*:/i

function isPlaceholderTitle(title: unknown): boolean {
  return typeof title !== "string" || !title.trim() || PLACEHOLDER_TITLE_RE.test(title)
}

// Title-case a slug/host fragment: "our-team" -> "Our Team", "api_docs" -> "Api Docs".
function humanize(raw: string): string {
  const words = raw
    .replace(/[-_]+/g, " ")
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return ""
  return words
    .slice(0, 4)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
}

// A readable nav label for a non-home page derived from its URL: the last
// meaningful path segment ("/company/pricing" -> "Pricing"), falling back to the
// host, then a positional label.
function labelFromUrl(url: string, index: number): string {
  try {
    const u = new URL(url)
    const segs = u.pathname.split("/").filter(Boolean)
    const last = segs[segs.length - 1] || ""
    const slug = last.replace(/\.[a-z0-9]+$/i, "") // drop trailing extension
    const fromSlug = humanize(slug)
    if (fromSlug) return fromSlug
    const fromHost = humanize(u.hostname.replace(/^www\./, "").split(".")[0] || "")
    if (fromHost) return fromHost
  } catch {
    /* not a parseable URL */
  }
  return `Page ${index + 1}`
}

// The nav label for a cloned page: real <title> if present, else URL-derived.
function cloneLabel(page: ClonedPage, index: number): string {
  if (index === 0) return "Home"
  if (!isPlaceholderTitle(page.title)) return page.title.trim()
  return labelFromUrl(page.url, index)
}

// Clone mode: accept pre-built OpenUI-Lang programs from the clone job, assemble +
// validate the full multi-page program, repairing broken sections with native
// fallbacks. Streams a skeleton-first, then progressive page modules, then the
// final validated source (emitted as a `source` event and on `done`).
export async function* generateFromClone(
  clonedPages: ClonedPage[],
  theme: ExtractedTokens,
  brand: string,
  parentSignal?: AbortSignal,
): AsyncGenerator<GenUIEvent> {
  const startedAt = Date.now()
  const abort = new AbortController()
  parentSignal?.addEventListener("abort", () => abort.abort(), { once: true })
  const ch = channel<GenUIEvent>()

  const run = (async () => {
    try {
      ch.push({ type: "status", message: `Assembling ${brand}…` })

      if (clonedPages.length === 0) {
        ch.push({ type: "error", message: "No pages were cloned" })
        return
      }

      // NEAR-DUPLICATE PAGE COLLAPSE (general, structure-driven). The crawler can
      // follow in-content links and capture pages that are structurally identical
      // (or near-identical) to the home page — e.g. a single-page site whose nav
      // anchors resolve to the same document, or paginated views with the same
      // section skeleton. Promoting each to its own PageSwitch tab fabricates a
      // multi-page site that does not exist and prints duplicate tabs. We collapse
      // pages whose ordered section content-signature substantially overlaps an
      // already-kept page, keeping the FIRST occurrence (home wins). Signature is
      // derived from each section's program-literal content — never URLs/slugs.
      const pageSignature = (p: ClonedPage): string =>
        p.sections
          .map((s) =>
            (s.program.match(/"((?:\\.|[^"\\])*)"/g) || [])
              .join("|")
              .toLowerCase()
              .replace(/[^a-z0-9|]+/g, ""),
          )
          .join("§")
      const tokenize = (sig: string): Set<string> =>
        new Set(sig.split(/[|§]/).filter((t) => t.length >= 4))
      const jaccard = (a: Set<string>, b: Set<string>): number => {
        if (a.size === 0 && b.size === 0) return 1
        let inter = 0
        for (const t of a) if (b.has(t)) inter++
        const union = a.size + b.size - inter
        return union === 0 ? 0 : inter / union
      }
      // A page is SUBSTANTIVE only if it carries real rendered copy beyond a lone
      // heading. In-content anchors on a single-page site frequently crawl to
      // empty/near-empty documents (or fragment targets) whose only section is a
      // bare heading; promoting those to PageSwitch tabs fabricates a multi-page
      // site (e.g. a meaningless one-extra-tab nav). We require >=2 distinct
      // content literals OR a single literal of real length — structure-driven,
      // never URL/slug based. The first page (home) is always kept regardless so
      // a genuinely minimal single-page site still renders.
      // Normalize a literal for case/whitespace-insensitive comparison.
      const normLit = (v: string): string => v.toLowerCase().replace(/\s+/g, " ").trim()
      // The home page's "identity" literals: the brand and its FIRST heading literal.
      // A non-home page whose ONLY content echoes one of these is a bare link-target
      // (e.g. a one-heading page that just repeats the site name) — not a real page.
      // Structural, never URL/slug based.
      const home0 = clonedPages[0]
      const homeFirstLiteral = (() => {
        for (const s of home0?.sections ?? []) {
          const m = s.program.match(/"((?:\\.|[^"\\])*)"/)
          if (m) return normLit(m[1])
        }
        return ""
      })()
      const homeEchoes = new Set<string>(
        [normLit(brand || ""), homeFirstLiteral].filter((v) => v.length > 0),
      )
      const substantive = (p: ClonedPage): boolean => {
        const lits = new Set<string>()
        for (const s of p.sections) {
          for (const m of s.program.matchAll(/"((?:\\.|[^"\\])*)"/g)) {
            const v = normLit(m[1])
            if (v.length >= 3) lits.add(v)
          }
        }
        // A page whose sole/dominant literal is just an echo of the home brand or
        // home's first heading is a one-heading link-target — not substantive.
        if (lits.size <= 1) {
          const sole = [...lits][0]
          if (sole !== undefined && homeEchoes.has(sole)) return false
        }
        if (lits.size >= 2) return true
        // A single literal counts only if it is a real sentence/phrase (>= 24
        // chars), not a one-word heading echoed as the whole "page".
        return [...lits].some((v) => v.length >= 24)
      }

      const keptPages: ClonedPage[] = []
      const keptSigs: Set<string>[] = []
      clonedPages.forEach((page, i) => {
        const toks = tokenize(pageSignature(page))
        // A page that is >=85% the same content as one already kept is a
        // near-duplicate tab — drop it. Always keep the first page (home).
        const dup =
          keptPages.length > 0 && keptSigs.some((s) => jaccard(toks, s) >= 0.85)
        // Non-home pages with no substantive content are spurious tabs — drop.
        const empty = i !== 0 && !substantive(page)
        if (dup || empty) return
        keptPages.push(page)
        keptSigs.push(toks)
      })
      const uniquePages = keptPages.length > 0 ? keptPages : clonedPages

      // TABS = REAL SITE-NAV ONLY (Tier 2). The crawler captures every same-domain
      // in-content link it follows; a flat link-hub (e.g. info.cern.ch) thereby
      // yields many "pages" that are NOT part of the site's own navigation. Promoting
      // each to a PageSwitch tab fabricates a multi-tab site that does not exist. The
      // home page carries `navLinks` — the normalized URLs of anchors that live inside
      // its nav/header landmark = the site's REAL navigation. A non-home crawled page
      // becomes a TAB only if its normalized URL is one of those nav destinations;
      // non-nav crawled pages are dropped from the rendered program (background only),
      // never fabricated as tabs. Read the contract field structurally (no `as any`).
      const navLinks = (clonedPages[0] as { navLinks?: string[] }).navLinks ?? []
      const navSet = new Set<string>(navLinks.map((u) => normalizeUrl(u)))
      // When the home page exposes NO real nav landmark (navSet empty), the extra
      // crawled pages can only have come from in-content links — a flat link-hub
      // (info.cern.ch) or a single landing page. Per the contract there are then NO
      // tabs: render the home page alone as a single Stack; the extras stay
      // background-only (reachable through the rendered in-content links, never
      // fabricated as top nav). With real nav present, tabs = home + nav-backed pages.
      const renderedPages =
        navSet.size > 0
          ? [uniquePages[0], ...uniquePages.slice(1).filter((p) => navSet.has(normalizeUrl(p.url)))]
          : [uniquePages[0]]
      const droppedToBackground = uniquePages.length - renderedPages.length
      if (droppedToBackground > 0) {
        console.warn(
          `[clone] ${droppedToBackground} crawled page(s) kept background-only (not real site-nav destinations); not rendered as tabs`,
        )
      }

      // theme name keys the preview palette; tokens drive the actual CSS vars at render.
      ch.push({ type: "theme", name: "cloned" })
      ch.push({ type: "locale", code: "en" })

      // Use the cloned brand (param) as the home/site label so the nav reflects the
      // brand; non-home labels come from the real <title> when present, else a
      // readable label synthesized from the page URL — never a raw `Cloned: <url>`.
      const labels = renderedPages.map((p, i) =>
        i === 0 ? brand || cloneLabel(p, i) : cloneLabel(p, i),
      )
      const ids = renderedPages.map((_, i) => (i === 0 ? "home" : `p${i}`))

      // Repair pass (per CONTRACT): a page is a `Stack([sectionRefs])` program — the
      // shape validateOpenUISource accepts. For each page we (1) swap any invalid
      // section for a native fallback keyed on the SAME kind+index, then (2) validate
      // the FULL page Stack. If a page still fails to parse, fall every still-broken
      // section back once more and re-validate. We never emit a page Stack that does
      // not pass validateOpenUISource, so every subtree the PageSwitch references is
      // valid — even though the PageSwitch root itself can't be fed to that
      // (Stack-root-only) validator.
      // The original section HTML may be carried on the section (clone path stamps
      // `sourceHtml`). Read it via a structural guard so the repair can rebuild from
      // REAL content instead of canned per-kind filler. No `as any`, no type edit.
      const sourceHtmlOf = (section: ClonedSection): string | undefined => {
        const h = (section as { sourceHtml?: unknown }).sourceHtml
        return typeof h === "string" && h.trim() ? h : undefined
      }
      // Rebuild an invalid section. CRITICAL: pass the original section HTML so the
      // fallback DOM-reconstructs the real headings/paragraphs/list-items/links in
      // reading order. Omitting it (the prior behaviour) collapsed a broken section
      // to generic "Overview / Read more about this." canned copy — the degenerate
      // single-fallback render the dogfood audit flagged. Generic: the html is the
      // ground truth, never per-site.
      const repairSection = (section: ClonedSection, pageUrl: string): ClonedSection => {
        if (sectionProgramValid(section)) return section
        const html = sourceHtmlOf(section)
        const fallback = generateFallbackSection(section.kind, pageUrl, section.index, theme, html)
        return sectionProgramValid(fallback) ? fallback : section
      }

      const pagePlan = renderedPages.map((page, i) => {
        const id = ids[i]
        let sections = page.sections.map((section) => repairSection(section, page.url))
        if (!pageProgramValid(id, sections)) {
          // Force-fallback every section that still doesn't validate, then re-check.
          sections = sections.map((section) =>
            sectionProgramValid(section)
              ? section
              : generateFallbackSection(
                  section.kind,
                  page.url,
                  section.index,
                  theme,
                  sourceHtmlOf(section),
                ),
          )
          if (!pageProgramValid(id, sections)) {
            console.warn(`[clone] page "${id}" invalid after fallback`)
          }
        }
        return { id, sections }
      })

      // SINGLE-PAGE (Tier 1): exactly one page survived the nav/substantive filters —
      // a flat link-hub clone. Root DIRECTLY in a Stack of the home page's section
      // refs (no PageSwitch, no `$page`, no tabs). The home module defines those
      // section vars; the skeleton references them before they're defined, exactly as
      // the multi-page skeleton references page ids before their modules land.
      const single = pagePlan.length === 1
      let fullSource: string
      if (single) {
        const { id, sections } = pagePlan[0]
        const skeleton = buildSinglePageSkeleton(sections)
        ch.push({ type: "skeleton", text: skeleton })
        ch.push({ type: "plan", ids })
        ch.push({ type: "module_start", id })
        ch.push({ type: "module", id, text: assemblePage(id, sections) })
        // Assemble the FULL program: the home sections rooted in a literal Stack —
        // the exact shape validateOpenUISource accepts (it rejects a non-Stack root).
        fullSource = assembleSinglePage(sections)
      } else {
        // Skeleton first so the shell paints before page content lands.
        const skeleton = buildSkeleton(labels[0], labels, ids)
        ch.push({ type: "skeleton", text: skeleton })
        ch.push({ type: "plan", ids })

        // Progressive page modules (home first, then the rest in order).
        for (let i = 0; i < pagePlan.length; i++) {
          const { id, sections } = pagePlan[i]
          ch.push({ type: "module_start", id })
          ch.push({ type: "module", id, text: assemblePage(id, sections) })
        }

        // Assemble the FULL program: validated per-page Stacks + the PageSwitch root.
        // Each page Stack already passed validateOpenUISource above; the PageSwitch root
        // is system-authored from the validated page ids, so the whole program is valid
        // by construction.
        fullSource = assembleClone(pagePlan, labels)
      }

      // Hand the final source to the caller (for persistence + streaming).
      ch.push({ type: "source", text: fullSource })
      ch.push({ type: "done", modules: pagePlan.length, ms: Date.now() - startedAt, source: fullSource })
    } catch (e) {
      const err = e as { name?: string; message?: string }
      if (err?.name !== "AbortError") {
        ch.push({ type: "error", message: err?.message ?? "clone generation failed" })
      }
    } finally {
      ch.close()
    }
  })()

  for await (const ev of ch.drain()) yield ev
  await run
}
