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
// @ts-ignore -- legacy JS module lacks TypeScript declarations.
import { translateHtml } from '../llm/translator'

import type { ConfidenceResult, V3SiteSpec, ParsedSitePlan } from './types.ts'
import { inferKind, KIND_NAMES, getDefaultFamily } from './kinds.ts'
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
import { pickThemeForContext } from '../genui/theme-affinity.ts'
import { getVocabulary } from './vocabulary.ts'

/** Count roles in a kind's vocabulary (for the content-substance quality gate). */
function getVocabularyRoleCount(kind: string): number {
  return getVocabulary(kind).roles.length
}

function log(sessionCtx: any) {
  return (msg: string) => {
    console.log(msg)
    sessionCtx?.broadcast?.({ type: 'log', message: msg })
  }
}

function status(sessionCtx: any) {
  return (message: string, phase: string) => {
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

// No heuristic brand fallback — the LLM extracts the brand via the @brand
// metadata line (instructed in the prompt, enforced by the quality gate). If
// the LLM still omits it, a minimal generic constant is the last resort so
// downstream components don't receive an empty string.
const DEFAULT_BRAND = 'Studio'

function pascalCase(s: string): string {
  return s
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join('')
}

export async function runAllV3({
  prompt,
  workspace,
  sessionCtx,
  integrations,
  preferredLanguage,
}: {
  prompt?: string
  workspace?: string
  sessionCtx?: any
  integrations?: any
  preferredLanguage?: string
} = {}): Promise<unknown> {
  const _log = log(sessionCtx)
  const _status = status(sessionCtx)
  const t0 = Date.now()
  const normalizedPrompt = requirePromptText(prompt)
  const ws = workspace || process.cwd()

  const languageMode = await resolvePipelineLanguage({
    prompt: normalizedPrompt,
    preferredLanguage,
    workspace: ws,
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
    writeFileSync(join(ws, 'tasks.json'), JSON.stringify({ tasks }, null, 2))
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
    let raw = await generateText(
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
    let { plan, attempts, valid } = retryLoop(raw, conf.kind)
    _log(
      `  site-plan: ${plan.sections.length} sections, ${plan.pages.length} pages (attempts: ${attempts}, valid: ${valid})`,
    )

    // ── Content-substance quality gate (ported from v1 enough()) ─────────────
    // The home must be substantially filled: a hero (or first content section)
    // plus at least half the kind's vocabulary roles. If not, retry the LLM
    // call once with a stricter instruction — never ship a thin homepage.
    const vocabRoles = getVocabularyRoleCount(plan.kind)
    const hasHero = plan.sections.some((s) => s.role.toLowerCase() === 'hero')
    const enoughSections =
      plan.sections.length >= Math.max(3, Math.ceil(vocabRoles / 2))
    if ((!hasHero || !enoughSections) && attempts <= 1) {
      _status(
        'Content quality gate failed — retrying with stricter prompt',
        'plan',
      )
      const strictSystem = `${system}\n\nYou MUST fill EVERY section listed for the chosen kind with rich, distinct content. NEVER return an empty or partial plan. ALWAYS include a hero section. Emit @brand, @title, and @nav metadata lines.`
      const strictController = new AbortController()
      const strictRaw = await generateText(
        DEFAULT_MODEL,
        strictSystem,
        user,
        strictController.signal,
        2,
      )
      const strictResult = retryLoop(strictRaw, conf.kind)
      if (strictResult.plan.sections.length >= plan.sections.length) {
        raw = strictRaw
        plan = strictResult.plan
        attempts = strictResult.attempts
        valid = strictResult.valid
        _log(
          `  site-plan (retry): ${plan.sections.length} sections, ${plan.pages.length} pages`,
        )
      }
    }

    sessionCtx?.broadcast?.({
      type: 'plan',
      ids: ['home', ...plan.pages],
    })
    timings.parse_end = Date.now()

    // ── Theme (seeded RNG + category-aware mood pools, ported from v1) ───────
    // pickThemeForContext narrows the pick to a mood pool for commerce kinds
    // (luxury/street-bold/organic-craft/pop-retail/tech-mono/fresh-active) so a
    // jewelry atelier doesn't land on 'doom-64'. Non-commerce → full catalog.
    const seed = sessionCtx?.id || ws
    const rng = makeSeededRng(seed)
    const themeRoll = rng()
    const familyForTheme = getDefaultFamily(plan.kind)
    const theme =
      pickThemeForContext({
        prompt: normalizedPrompt,
        familyName: familyForTheme,
        rng: () => themeRoll,
      }) ?? pickRandomTheme(rng)
    sessionCtx?.broadcast?.({ type: 'theme', name: theme })
    sessionCtx?.broadcast?.({ type: 'locale', code: languageMode.code })
    _log(`  theme: ${theme}`)

    // ── Compile ─────────────────────────────────────────────────────────────
    timings.compile_start = Date.now()
    // LLM-extracted brand (from @brand line) is the only source — no heuristic
    // fallback. The prompt + quality gate enforce emitting @brand; DEFAULT_BRAND
    // is the last resort if the LLM still omits it.
    const brand =
      (plan.brand && plan.brand.length >= 2 ? plan.brand : undefined) ||
      DEFAULT_BRAND
    // LLM-decided descriptive title (from @title line) — falls back to brand.
    const title =
      (plan.title && plan.title.length >= 2 ? plan.title : undefined) || brand
    // LLM-suggested nav labels (from @nav line) — falls back to PascalCase.
    const navLabels = plan.navLabels ?? {}
    const nav = [
      navLabels.home || 'Home',
      ...plan.pages.map((p) => navLabels[p] || pascalCase(p)),
    ]
    const tagline = title
    const compileOptions: CompileOptions = {
      brand,
      theme,
      locale: languageMode.code,
      nav,
      kind: plan.kind,
      tagline,
      title,
    }
    const result: CompileResult = compileSitePlan(plan, compileOptions)

    sessionCtx?.broadcast?.({ type: 'skeleton', text: result.skeleton })

    // Per-section module events for home page (decision #24: streaming-style).
    // signalHomepageReady fires when the first section's OpenUI is emitted.
    let homepageSignaled = false
    for (const section of plan.sections) {
      const { statements } = compileSection(
        section,
        plan.kind,
        'home',
        brand,
        nav,
      )
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
    saveSiteSpec(ws, siteSpec as unknown as SiteSpecProject)

    writeFileSync(join(ws, 'home.openui'), result.source)

    // openui-manifest.json (simplified upsertManifest pattern).
    const manifestPath = join(ws, 'openui-manifest.json')
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

    // ── Write Convex backend files to workspace ─────────────────────────────
    // The compiler generates actual Convex schema + function files from the
    // lakebed. Write them to the workspace so they're deployable.
    if (result.siteSpec.convexBackend) {
      for (const [filePath, content] of Object.entries(
        result.siteSpec.convexBackend,
      )) {
        if (content.length === 0) continue
        const fullPath = join(ws, filePath)
        const dir = fullPath.slice(0, fullPath.lastIndexOf('/'))
        try {
          if (!existsSync(dir)) {
            await import('node:fs/promises').then((fs) =>
              fs.mkdir(dir, { recursive: true }),
            )
          }
          writeFileSync(fullPath, content)
        } catch {
          // non-fatal — convex files are optional artifacts
        }
      }
      _log(
        `  convex backend: ${Object.keys(result.siteSpec.convexBackend).length} files written`,
      )
    }

    // ── SSR: render OpenUI → index.html (required by engine adapter) ────────
    timings.ssr_start = Date.now()
    _status('Rendering preview…', 'render')
    try {
      await renderPreviewToWorkspace(siteSpec as unknown as SiteSpecProject, ws)
    } catch (ssrErr) {
      _log(
        `  SSR render failed: ${(ssrErr as Error)?.message} — writing shell fallback`,
      )
      // Fallback: write a minimal shell so the adapter doesn't throw
      writeFileSync(
        join(ws, 'index.html'),
        `<!DOCTYPE html><html><head><script src="/scripts/tailwind-browser.js"></script></head>` +
          `<body class="min-h-screen bg-background text-foreground"><div id="openui-root"></div>` +
          `<script src="/scripts/openui-preview-client.js"></script></body></html>`,
      )
    }
    timings.ssr_end = Date.now()

    // ── Post-render translation (ported from v1 phase-openui-home) ──────────
    // If the pipeline language needs translation (non-English locale), translate
    // the rendered index.html visible text in-place. The LLM authors in the
    // target locale, but for Indian-language locales the translator polishes
    // and ensures native-script output where the LLM may have mixed scripts.
    if (languageMode?.needsTranslation) {
      try {
        const previewPath = join(ws, 'index.html')
        if (existsSync(previewPath)) {
          const translatedPreview = await translateHtml(
            readFileSync(previewPath, 'utf-8'),
            {
              code: languageMode.code,
              name: languageMode.name,
              nativeName: languageMode.nativeName,
              script: languageMode.script,
              language: languageMode.language ?? undefined,
            },
          )
          if (translatedPreview?.content && !translatedPreview.error) {
            writeFileSync(previewPath, translatedPreview.content)
            _log(`  v3: translated preview to ${languageMode.code}`)
          } else {
            _log(
              `  v3: translation skipped — ${translatedPreview?.error ?? 'empty response'}`,
            )
          }
        }
      } catch (error: any) {
        _log(`  v3: translation error — ${error?.message || String(error)}`)
      }
    }

    // ── Integrations hook ───────────────────────────────────────────────────
    if (integrations?.afterSiteSpecSaved) {
      await integrations.afterSiteSpecSaved({
        workspace: ws,
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
