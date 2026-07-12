// v3 engine orchestrator — site-plan + macros. Mirrors runner-v2.ts shape.
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { generateText } from '../generate.ts'
import { DEFAULT_MODEL } from '../model-list.ts'
import { pickRandomTheme } from '../theme-apply.ts'
import { requirePromptText } from '../prompt'
import { saveSiteSpec } from '../spec/index.ts'
import type { SiteSpecProject } from '../spec/index.ts'
// @ts-ignore -- legacy JS module lacks TypeScript declarations.
import { resolvePipelineLanguage } from '../pipeline/prompt-language'
// @ts-ignore -- renderers module lacks TypeScript declarations.
import { renderPreviewToWorkspace } from '../renderers/index.ts'

import type { ConfidenceResult, V3SiteSpec } from './types.ts'
import { inferKind, KIND_NAMES } from './kinds.ts'
import { retryLoop } from './retry.ts'
import {
  compileSitePlan,
  compileSection,
  type CompileOptions,
  type CompileResult,
} from './compiler.ts'
import {
  buildPrompt,
  buildLowConfidenceKindPrompt,
  buildLowConfidenceFillPrompt,
} from './prompt.ts'
import { StreamingParser } from './streaming.ts'

function log(sessionCtx: any) {
  return (msg) => {
    console.log(msg)
    sessionCtx?.broadcast?.({ type: 'log', message: msg })
  }
}

function status(sessionCtx: any) {
  return (message, phase) => {
    console.log(`  [${phase}] ${message}`)
    sessionCtx?.broadcast?.({ type: 'status', message, phase })
  }
}

// Seeded RNG (mulberry32-style) — deterministic theme pick per session.
function makeSeededRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let state = h >>> 0 || 1
  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Derive a brand name from the prompt: first 1-3 significant words, Title-Cased.
const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'about',
  'site',
  'shop',
  'store',
  'make',
  'build',
  'app',
  'website',
  'a',
  'an',
  'of',
  'to',
  'in',
  'on',
  'my',
  'our',
])

function deriveBrand(prompt: string): string {
  const words = prompt
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^A-Za-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w.toLowerCase()))
    .slice(0, 3)
  if (words.length === 0) return 'Brand'
  return words
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function pascalCase(s: string): string {
  return s
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join('')
}

export async function runAllV3(
  {
    prompt,
    workspace,
    sessionCtx,
    integrations,
    preferredLanguage,
  }: {
    prompt?: string
    workspace: string
    sessionCtx?: any
    integrations?: any
    preferredLanguage?: string
  } = {} as any,
): Promise<unknown> {
  const _log = log(sessionCtx)
  const _status = status(sessionCtx)
  const t0 = Date.now()
  const normalizedPrompt = requirePromptText(prompt)

  const languageMode = await resolvePipelineLanguage({
    prompt: normalizedPrompt,
    preferredLanguage,
    workspace,
  })

  const timings: Record<string, number> = { t0 }

  const tasks = [
    {
      id: 'home.openui',
      label: 'Generate v3 homepage',
      status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'FAILED',
      filename: 'home.openui',
      files: ['home.openui', 'site-spec.json'],
    },
  ]

  const persistTasks = () => {
    writeFileSync(
      join(workspace, 'tasks.json'),
      JSON.stringify({ tasks }, null, 2),
    )
  }

  sessionCtx?.setPrompt?.(normalizedPrompt)
  sessionCtx?.setTasks?.(tasks)
  persistTasks()

  tasks[0].status = 'IN_PROGRESS'
  sessionCtx?.updateTask?.(tasks[0])
  persistTasks()

  try {
    // ── Kind inference ──────────────────────────────────────────────────────
    timings.kind_start = Date.now()
    const conf: ConfidenceResult = inferKind(normalizedPrompt)
    _status(
      `Inferred kind: ${conf.kind} (confidence ${conf.confidence.toFixed(2)})`,
      'kind',
    )
    timings.kind_end = Date.now()

    // ── Theme (seeded RNG) ──────────────────────────────────────────────────
    const seed = sessionCtx?.id || workspace
    const rng = makeSeededRng(seed)
    const theme = pickRandomTheme(rng)
    sessionCtx?.broadcast?.({ type: 'theme', name: theme })
    sessionCtx?.broadcast?.({ type: 'locale', code: languageMode.code })
    _log(`  theme: ${theme}`)

    // ── Build prompt (one-call vs two-call) ─────────────────────────────────
    timings.prompt_start = Date.now()
    let system: string
    let user: string
    if (conf.confidence >= 0.65) {
      const built = buildPrompt({
        prompt: normalizedPrompt,
        confidence: conf,
        locale: languageMode.code,
      })
      system = built.system
      user = built.user
    } else {
      _status('Low-confidence kind — two-call path', 'kind')
      const kindPrompt = buildLowConfidenceKindPrompt(normalizedPrompt)
      const controller1 = new AbortController()
      const kindRaw = await generateText(
        DEFAULT_MODEL,
        kindPrompt.system,
        kindPrompt.user,
        controller1.signal,
        2,
      )
      const kindName = kindRaw.trim().toLowerCase()
      const resolvedKind = KIND_NAMES.includes(kindName)
        ? kindName
        : 'marketing'
      _status(`LLM chose kind: ${resolvedKind}`, 'kind')
      const fillPrompt = buildLowConfidenceFillPrompt({
        prompt: normalizedPrompt,
        kind: resolvedKind,
        locale: languageMode.code,
      })
      system = fillPrompt.system
      user = fillPrompt.user
    }
    timings.prompt_end = Date.now()

    // ── LLM call ────────────────────────────────────────────────────────────
    _status('Generating site-plan…', 'plan')
    timings.llm_start = Date.now()
    const controller = new AbortController()
    const raw = await generateText(
      DEFAULT_MODEL,
      system,
      user,
      controller.signal,
      2,
    )
    timings.llm_end = Date.now()

    // ── Streaming parse (decision #24) ──────────────────────────────────────
    timings.stream_start = Date.now()
    const streamParser = new StreamingParser()
    streamParser.onSectionStart((role) => {
      _status(`Section: ${role}`, 'section')
    })
    streamParser.onSectionComplete((section) => {
      sessionCtx?.broadcast?.({ type: 'module', id: section.role, text: '' })
    })
    const lines = raw.split('\n')
    for (const line of lines) {
      streamParser.feed(line + '\n')
    }
    streamParser.flush?.()
    timings.stream_end = Date.now()

    // ── Retry loop: parse → validate → fix ──────────────────────────────────
    timings.parse_start = Date.now()
    const { plan, attempts, valid } = retryLoop(raw, conf.kind)
    _log(
      `  site-plan: ${plan.sections.length} sections, ${plan.pages.length} pages (attempts: ${attempts}, valid: ${valid})`,
    )
    sessionCtx?.broadcast?.({
      type: 'plan',
      ids: ['home', ...plan.pages],
    })
    timings.parse_end = Date.now()

    // ── Compile ─────────────────────────────────────────────────────────────
    timings.compile_start = Date.now()
    const brand = deriveBrand(normalizedPrompt)
    const tagline = plan.sections[0]?.content?.[0] ?? brand
    const compileOptions: CompileOptions = {
      brand,
      theme,
      locale: languageMode.code,
      nav: ['Home', ...plan.pages.map((p) => pascalCase(p))],
      kind: plan.kind,
      tagline,
    }
    const result: CompileResult = compileSitePlan(plan, compileOptions)

    sessionCtx?.broadcast?.({ type: 'skeleton', text: result.skeleton })

    // Per-section module events for home page (decision #24: streaming-style).
    // signalHomepageReady fires when the first section's OpenUI is emitted.
    let homepageSignaled = false
    for (const section of plan.sections) {
      const { statements } = compileSection(section, plan.kind, 'home', brand, [
        'Home',
        ...plan.pages.map((p) => pascalCase(p)),
      ])
      const sectionId = `home_${section.role}`
      sessionCtx?.broadcast?.({
        type: 'module',
        id: sectionId,
        text: statements.join('\n'),
      })
      if (!homepageSignaled) {
        sessionCtx?.signalHomepageReady?.()
        sessionCtx?.signalOpenuiReady?.()
        homepageSignaled = true
      }
    }

    // Per-page module events for secondary pages.
    for (const page of plan.pages) {
      const pageId = pascalCase(page)
      const stmts = result.pageSources[pageId] ?? ''
      sessionCtx?.broadcast?.({ type: 'module', id: pageId, text: stmts })
    }
    sessionCtx?.broadcast?.({ type: 'source', text: result.source })
    sessionCtx?.broadcast?.({ type: 'lakebed', definition: result.lakebed })
    sessionCtx?.broadcast?.({ type: 'done' })
    timings.compile_end = Date.now()

    // ── Persist artifacts ───────────────────────────────────────────────────
    const siteSpec: V3SiteSpec = result.siteSpec
    saveSiteSpec(workspace, siteSpec as unknown as SiteSpecProject)

    writeFileSync(join(workspace, 'home.openui'), result.source)

    // openui-manifest.json (simplified upsertManifest pattern).
    const manifestPath = join(workspace, 'openui-manifest.json')
    let manifest: {
      version: number
      generatedAt: string
      home: string
      pages: Array<{
        route: string
        title: string
        file: string
        ready: boolean
      }>
    } = {
      version: 1,
      generatedAt: new Date().toISOString(),
      home: 'home.openui',
      pages: [],
    }
    if (existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
      } catch {
        // ignore — use fresh manifest
      }
    }
    if (!manifest.pages) manifest.pages = []
    manifest.pages = manifest.pages.filter((p) => p.route !== 'home')
    manifest.pages.push({
      route: 'home',
      title: 'Home',
      file: 'home.openui',
      ready: true,
    })
    for (const page of plan.pages) {
      const pageId = pascalCase(page)
      manifest.pages = manifest.pages.filter((p) => p.route !== page)
      manifest.pages.push({
        route: page,
        title: pageId,
        file: `${page}.openui`,
        ready: true,
      })
    }
    manifest.generatedAt = new Date().toISOString()
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

    // ── SSR: render OpenUI → index.html (required by engine adapter) ────────
    timings.ssr_start = Date.now()
    _status('Rendering preview…', 'render')
    try {
      await renderPreviewToWorkspace(
        siteSpec as unknown as SiteSpecProject,
        workspace,
      )
    } catch (ssrErr) {
      _log(
        `  SSR render failed: ${(ssrErr as Error)?.message} — writing shell fallback`,
      )
      // Fallback: write a minimal shell so the adapter doesn't throw
      writeFileSync(
        join(workspace, 'index.html'),
        `<!DOCTYPE html><html><head><script src="/scripts/tailwind-browser.js"></script></head>` +
          `<body class="min-h-screen bg-background text-foreground"><div id="openui-root"></div>` +
          `<script src="/scripts/openui-preview-client.js"></script></body></html>`,
      )
    }
    timings.ssr_end = Date.now()

    // ── Integrations hook ───────────────────────────────────────────────────
    if (integrations?.afterSiteSpecSaved) {
      await integrations.afterSiteSpecSaved({
        workspace,
        siteSpec,
        log: _log,
        status: _status,
      })
    }

    // ── Finalize ────────────────────────────────────────────────────────────
    tasks[0].status = 'DONE'
    sessionCtx?.updateTask?.(tasks[0])
    persistTasks()

    const elapsed = Number.parseFloat(((Date.now() - t0) / 1000).toFixed(1))
    sessionCtx?.setElapsed?.(elapsed)
    sessionCtx?.setCost?.(0.001)

    const completed = tasks.filter((t) => t.status === 'DONE').length
    _log(
      `  ✓ v3 generation complete: ${completed}/${tasks.length} tasks ready in ${elapsed}s`,
    )
    sessionCtx?.broadcast?.({
      type: 'run_completed',
      elapsed,
      completed,
      total: tasks.length,
    })

    return { elapsed, completed, total: tasks.length, siteSpec, result }
  } catch (err) {
    tasks[0].status = 'FAILED'
    sessionCtx?.setTasks?.(tasks)
    persistTasks()
    const message = (err as Error)?.message || String(err)
    _status(`Generation failed: ${message}`, 'failed')
    _log(`Error during v3 generation: ${message}`)
    throw err
  }
}
