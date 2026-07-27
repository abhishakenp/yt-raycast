// v3 engine orchestrator — site-plan + macros. Mirrors runner-v2.ts shape.
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { generateText, generateTextStream } from '../generate.ts'
import { DEFAULT_MODEL } from '../model-list.ts'
import { pickRandomTheme } from '../theme-apply.ts'
import { requirePromptText } from '../prompt'
import { saveSiteSpec } from '../spec/index.ts'
import type { SiteSpecProject } from '../spec/index.ts'
// @ts-ignore -- legacy JS module lacks TypeScript declarations.
import { resolvePipelineLanguage } from '../pipeline/prompt-language'
import type { PlanCacheClient } from './plan-cache-client'

import type { ConfidenceResult, V3SiteSpec, Section } from './types.ts'
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
import { validateSvelteSource } from './svelte-compiler.ts'
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
  planCacheClient,
  promptCacheKey,
}: {
  prompt?: string
  workspace?: string
  sessionCtx?: any
  integrations?: any
  preferredLanguage?: string
  planCacheClient?: PlanCacheClient
  promptCacheKey?: string
} = {}): Promise<unknown> {
  const _log = log(sessionCtx)
  const _status = status(sessionCtx)
  const t0 = Date.now()
  const normalizedPrompt = requirePromptText(prompt)
  const ws = workspace || process.cwd()

  const timings: Record<string, number> = { t0 }

  timings.lang_start = Date.now()
  const languageMode = await resolvePipelineLanguage({
    prompt: normalizedPrompt,
    preferredLanguage,
    workspace: ws,
  })
  timings.lang_end = Date.now()

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
    // Final kind is known after this block — needed for theme pre-computation.
    let finalKind: string
    if (conf.confidence >= 0.65) {
      finalKind = conf.kind
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
      finalKind = resolvedKind
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

    // ── Pre-compute theme (before LLM call) ──────────────────────────────────
    // Theme only depends on session id, kind, and prompt — all known now.
    // Pre-computing lets us compile sections incrementally during the stream.
    const themeSeed = sessionCtx?.id || ws
    const themeRng = makeSeededRng(themeSeed)
    const themeRoll = themeRng()
    const familyForThemePre = getDefaultFamily(finalKind)
    const preComputedTheme =
      pickThemeForContext({
        prompt: normalizedPrompt,
        familyName: familyForThemePre,
        rng: () => themeRoll,
      }) ?? pickRandomTheme(themeRng)

    // ── Streaming parser + incremental compile ──────────────────────────────
    // The parser is fed line-by-line as the LLM streams. On each section
    // completion, we rebuild the FULL OpenUI source (navbar + sections +
    // footer + Stack wrapper + PageSwitch skeleton) and broadcast it so the
    // dashboard can render incrementally. The source is always structurally
    // valid — the error boundary + last-known-good handle any render crashes.
    timings.stream_start = Date.now()
    const streamParser = new StreamingParser()
    const streamedSections: Section[] = []
    let streamedBrand = DEFAULT_BRAND
    let streamedNavLabels: Record<string, string> = {}

    streamParser.onSectionStart((role) => {
      _status(`Section: ${role}`, 'section')
    })
    streamParser.onMetadata((key, value) => {
      if (key === 'brand' && value.length >= 2) streamedBrand = value
      if (key === 'nav') {
        // Rebuild nav labels from current parser state
        streamedNavLabels = { ...streamParser.navLabels }
      }
    })
    streamParser.onSectionComplete((section) => {
      sessionCtx?.broadcast?.({ type: 'module', id: section.role, text: '' })
      streamedSections.push(section)
      // Rebuild the full source with all sections seen so far
      try {
        const partialSource = buildStreamingSource()
        if (partialSource) {
          sessionCtx?.broadcast?.({
            type: 'source',
            text: partialSource,
          })
        }
      } catch {
        // Skip if rebuild fails — the final full compile will handle it
      }
    })

    /**
     * Build a complete, structurally-valid OpenUI source from the sections
     * seen so far. Mirrors compileSitePlan's structure:
     *   navbar → authored sections → footer → Stack([...]) → PageSwitch skeleton
     * Secondary pages are omitted during streaming (only home); the final
     * compile adds them. Nav labels for future pages still appear in the
     * navbar but all map to home in the PageSwitch target map.
     */
    function buildStreamingSource(): string {
      const pages = streamParser.pages
      const nav = [
        streamedNavLabels.home || 'Home',
        ...pages.map((p: string) => streamedNavLabels[p] || pascalCase(p)),
      ]

      const navbarSection = streamedSections.find(
        (s) => s.role === 'navbar',
      ) ?? {
        role: 'navbar',
        content: [],
      }
      const footerSection = streamedSections.find(
        (s) => s.role === 'footer',
      ) ?? {
        role: 'footer',
        content: [],
      }

      const homeStmts: string[] = []
      const homeRefs: string[] = []

      // 1. Navbar first
      {
        const { statements, ref } = compileSection(
          navbarSection,
          finalKind,
          'home',
          streamedBrand,
          nav,
        )
        if (ref) {
          homeStmts.push(...statements)
          homeRefs.push(ref)
        }
      }

      // 2. Authored sections (skip navbar/footer — handled explicitly)
      for (const section of streamedSections) {
        if (section.role === 'navbar' || section.role === 'footer') continue
        const { statements, ref } = compileSection(
          section,
          finalKind,
          'home',
          streamedBrand,
          nav,
        )
        if (ref) {
          homeStmts.push(...statements)
          homeRefs.push(ref)
        }
      }

      // 3. Footer last
      {
        const { statements, ref } = compileSection(
          footerSection,
          finalKind,
          'home',
          streamedBrand,
          nav,
        )
        if (ref) {
          homeStmts.push(...statements)
          homeRefs.push(ref)
        }
      }

      // 4. Stack wrapper
      homeStmts.push(`home = Stack([${homeRefs.join(', ')}])`)

      // 5. Skeleton — only home during streaming; all nav labels map to home
      const targetMap: Record<string, string> = {}
      for (const label of nav) {
        targetMap[label] = 'home'
      }
      const skeleton = `root = PageSwitch(${JSON.stringify(nav)}, [home], "", ${JSON.stringify(targetMap)})`

      return `${homeStmts.join('\n')}\n${skeleton}`
    }

    // ── LLM call (with plan-level prompt cache) ─────────────────────────────
    // Check the plan cache before calling the LLM. A cache hit skips the
    // expensive plan call entirely — the raw DSL is reused, but the per-session
    // seed still re-randomizes theme/layout via compileSitePlan downstream.
    let raw: string
    if (planCacheClient && promptCacheKey) {
      timings.cache_lookup_start = Date.now()
      const cached = await planCacheClient
        .get({ promptCacheKey })
        .catch(() => null)
      timings.cache_lookup_end = Date.now()
      if (typeof cached === 'string' && cached.trim()) {
        raw = cached
        _status('Reusing cached site-plan (prompt cache hit)', 'plan')
        _log('  plan cache hit — skipping LLM call')
        timings.llm_start = Date.now()
        timings.llm_end = timings.llm_start
        // Feed cached raw through the streaming parser for incremental compile
        for (const line of raw.split('\n')) {
          streamParser.feed(line + '\n')
        }
        streamParser.flush?.()
      } else {
        _status('Generating site-plan…', 'plan')
        timings.llm_start = Date.now()
        const controller = new AbortController()
        raw = await generateTextStream(
          DEFAULT_MODEL,
          system,
          user,
          controller.signal,
          (line) => streamParser.feed(line + '\n'),
          2,
        )
        streamParser.flush?.()
        timings.llm_end = Date.now()
        void planCacheClient
          .set({ promptCacheKey, rawPlan: raw })
          .catch(() => undefined)
        _log('  plan cache miss — wrote raw plan to cache')
      }
    } else {
      _status('Generating site-plan…', 'plan')
      timings.llm_start = Date.now()
      const controller = new AbortController()
      raw = await generateTextStream(
        DEFAULT_MODEL,
        system,
        user,
        controller.signal,
        (line) => streamParser.feed(line + '\n'),
        2,
      )
      streamParser.flush?.()
      timings.llm_end = Date.now()
    }
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
    timings.quality_gate_retry_start = Date.now()
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
        // The retry produced a richer plan — update the cache so future
        // generations for this prompt get the better plan instead of the thin
        // original. Best-effort.
        if (planCacheClient && promptCacheKey) {
          void planCacheClient
            .set({ promptCacheKey, rawPlan: strictRaw })
            .catch(() => undefined)
        }
      }
    }
    timings.quality_gate_retry_end = Date.now()

    sessionCtx?.broadcast?.({
      type: 'plan',
      ids: ['home', ...plan.pages],
    })
    timings.parse_end = Date.now()

    // ── Svelte compile-error retry loop ─────────────────────────────────────
    // If the plan has @svelte blocks, validate each one with the Svelte compiler.
    // If any fail to compile, re-prompt the LLM once with the error messages so
    // it can emit corrected Svelte source. Never ship a plan with broken Svelte.
    timings.svelte_validation_start = Date.now()
    const svelteSections = plan.sections.filter((s) => s.svelte)
    if (svelteSections.length > 0) {
      const failing = svelteSections
        .map((s) => ({
          role: s.role,
          result: validateSvelteSource(s.svelte!.source),
        }))
        .filter((r) => !r.result.valid)
      if (failing.length > 0 && attempts <= 2) {
        _status(
          `Svelte compile error in ${failing.length} block(s) — retrying with error feedback`,
          'plan',
        )
        const errorLines = failing
          .map((f) => `Block "${f.role}": ${f.result.errors.join('; ')}`)
          .join('\n')
        const svelteFixSystem = `${system}\n\nYour previous output contained @svelte blocks with Svelte compile errors. Fix them and re-emit the ENTIRE site-plan.\n\nCompile errors:\n${errorLines}\n\nCommon fixes:\n- Close all tags (e.g. <div>...</div>)\n- Use Svelte 4 syntax: on:click, bind:value, {#each}, {#if} — NOT Svelte 5 runes\n- Ensure <script> tags are closed with </script>\n- Use class= not className=`
        const svelteFixController = new AbortController()
        const fixedRaw = await generateText(
          DEFAULT_MODEL,
          svelteFixSystem,
          user,
          svelteFixController.signal,
          2,
        )
        const fixedResult = retryLoop(fixedRaw, conf.kind)
        // Only adopt the fixed plan if it has at least as many sections AND
        // its svelte blocks now validate.
        const fixedSvelteSections = fixedResult.plan.sections.filter(
          (s) => s.svelte,
        )
        const stillFailing = fixedSvelteSections
          .map((s) => validateSvelteSource(s.svelte!.source))
          .filter((r) => !r.valid)
        if (
          fixedResult.plan.sections.length >= plan.sections.length &&
          stillFailing.length < failing.length
        ) {
          raw = fixedRaw
          plan = fixedResult.plan
          attempts = fixedResult.attempts
          valid = fixedResult.valid
          _log(
            `  site-plan (svelte retry): ${plan.sections.length} sections, ${stillFailing.length} svelte errors remaining`,
          )
          if (planCacheClient && promptCacheKey) {
            void planCacheClient
              .set({ promptCacheKey, rawPlan: fixedRaw })
              .catch(() => undefined)
          }
        }
      }
    }
    timings.svelte_validation_end = Date.now()

    // ── Theme (pre-computed before LLM call for streaming) ──────────────────
    // Theme was pre-computed above so sections could compile during the stream.
    // plan.kind may differ from finalKind if the quality gate or svelte retry
    // replaced the plan — but the kind never changes, only the content. Use
    // the pre-computed theme for consistency with what was already streamed.
    const theme = preComputedTheme
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
    const result: CompileResult = await compileSitePlan(plan, compileOptions)

    sessionCtx?.broadcast?.({ type: 'skeleton', text: result.skeleton })

    // Write compiled Svelte DOM JS scripts to the workspace.
    if (result.svelteScripts && ws) {
      for (const [scriptPath, jsSource] of Object.entries(
        result.svelteScripts,
      )) {
        try {
          const fullPath = join(ws, scriptPath)
          const dir = fullPath.slice(0, fullPath.lastIndexOf('/'))
          if (!existsSync(dir)) {
            await import('node:fs/promises').then((fs) =>
              fs.mkdir(dir, { recursive: true }),
            )
          }
          writeFileSync(fullPath, jsSource)
        } catch {
          // non-fatal — svelte scripts are optional artifacts
        }
      }
    }

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

    // ── Integrations hook ───────────────────────────────────────────────────
    timings.persist_start = Date.now()
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

    timings.persist_end = Date.now()
    timings.total_end = Date.now()
    const phaseTimings: Record<string, number> = {}
    const phases: Array<[string, string, string]> = [
      ['language', 'lang_start', 'lang_end'],
      ['kind_inference', 'kind_start', 'kind_end'],
      ['prompt_build', 'prompt_start', 'prompt_end'],
      ['cache_lookup', 'cache_lookup_start', 'cache_lookup_end'],
      ['llm_call', 'llm_start', 'llm_end'],
      ['stream_parse', 'stream_start', 'stream_end'],
      ['retry_parse', 'parse_start', 'parse_end'],
      [
        'quality_gate_retry',
        'quality_gate_retry_start',
        'quality_gate_retry_end',
      ],
      ['svelte_validation', 'svelte_validation_start', 'svelte_validation_end'],
      ['compile', 'compile_start', 'compile_end'],
      ['persist', 'persist_start', 'persist_end'],
    ]
    for (const [name, startKey, endKey] of phases) {
      const s = timings[startKey]
      const e = timings[endKey]
      if (typeof s === 'number' && typeof e === 'number') {
        phaseTimings[name] = e - s
      }
    }
    phaseTimings.total = timings.total_end - t0
    _log(`  ⏱ v3 phase timings (ms): ${JSON.stringify(phaseTimings)}`)
    sessionCtx?.broadcast?.({ type: 'timings', phases: phaseTimings })

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
