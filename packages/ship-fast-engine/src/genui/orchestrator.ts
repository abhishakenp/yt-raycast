import { mergeStatements } from "@openuidev/lang-core"
import { generateText } from "../generate.ts"
import { pageSystemPrompt, componentCatalog } from "./prompt.ts"
import { stripFences } from "./parser.ts"
import { DEFAULT_MODEL } from "./model-list.ts"
import { BLOCK_TAXONOMY, pickBlock } from "@ship-fast/blocks"
import { THEME_CATALOG, isKnownTheme, pickRandomTheme } from "@ship-fast/blocks"

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
  | { type: "module_start"; id: string }
  | { type: "module_retry"; id: string; attempt: number }
  | { type: "module"; id: string; text: string; failed?: boolean }
  | { type: "done"; modules: number; ms: number }
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
{"brand":"<short brand/product name>","tagline":"<one short sentence>","theme":"<theme-name>","pages":[{"label":"<short nav word>","brief":"<one line of what this page covers>","blocks":["<BlockName>", "<BlockName>"]}]}

Rules:
- "pages": 3 to 5 entries; the FIRST is the home/landing route. For a single-purpose request (e.g. just a sign-in screen) a single page is allowed.
- "blocks": 1 to 4 block NAMES copied EXACTLY from the catalog above, ordered most-relevant first. Choose blocks whose DESCRIPTION genuinely fits this page's purpose AND the overall site (e.g. a ramen shop's home picks a restaurant home block, a pricing page picks a pricing block). The home page's blocks must be landing/home-style blocks.
- "theme": ONE theme NAME copied EXACTLY from the THEMES list, whose vibe matches the brand and request (e.g. a luxury restaurant -> "elegant-luxury", a dev tool -> "vercel" or "supabase", a kids site -> "candyland").
- Labels are short nav words (Home, Features, Pricing, About, Contact, Shop, Work, Menu, Blog …).
- brand, tagline and briefs must be specific to the request.`
}

const isKnownBlock = (name: unknown): name is string =>
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
  return { brand, tagline, theme, pages }
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
  return { brand, tagline: `${brand} — built for what's next.`, theme: pickRandomTheme(rng), pages }
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
