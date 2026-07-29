/**
 * composition-runner.ts — orchestrates the generative composition pipeline.
 *
 * Flow: prompt → LLM → parseComposition → compileComposition → OpenUI source
 *
 * Uses motifs + @design intent instead of fixed section templates.
 * `runComposition` conforms to the `RunShipFastEngine` signature.
 */
import { writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { generateText, generateTextStream } from '../generate.ts'
import { DEFAULT_MODEL } from '../model-list.ts'
import { requirePromptText } from '../prompt'
import { saveSiteSpec, type SiteSpecProject } from '../spec/index.ts'
import { buildCompositionPrompt } from './composition-prompt.ts'
import { generateGenome } from './genome.ts'
import { parseComposition } from './composition-parser.ts'
import {
  compileComposition,
  type CompositionCompileResult,
} from './composition-compiler.ts'
import { serializeDesignIntent } from '../../../ship-fast-blocks/src/primitives/design-system.ts'
import { pickThemeForDesignIntent } from './theme-affinity.ts'
import type { PlanCacheClient } from './plan-cache-client.ts'

// ─── Session context (matches RunShipFastEngine) ─────────────────────────

export interface CompositionSessionCtx {
  id: string
  broadcast: (payload: unknown) => void
  setPrompt: (prompt: string) => void
  setTasks: (tasks: unknown[]) => void
  updateTask: (task: unknown) => void
  signalHomepageReady: () => void
  signalOpenuiReady: () => void
  setElapsed: (elapsed: number) => void
  setCost: (cost: number) => void
  cacheClient?: unknown
}

export interface CompositionRunnerOptions {
  prompt?: string
  workspace?: string
  sessionCtx?: CompositionSessionCtx
  integrations?: {
    afterSiteSpecSaved?: (opts: {
      workspace: string
      siteSpec: unknown
      log: (msg: string) => void
      status: (message: string, phase: string) => void
    }) => Promise<void>
  }
  preferredLanguage?: string
  signal?: AbortSignal
  cacheClient?: unknown
  planCacheClient?: PlanCacheClient
  promptCacheKey?: string
  sessionId?: string
  model?: string
}

export interface CompositionRunnerResult {
  source: string
  parsed: ReturnType<typeof parseComposition>
  compiled: CompositionCompileResult
  raw: string
  duration: number
}

/**
 * Run the generative composition pipeline.
 *
 * 1. Build prompt (system + user) from the user's brief
 * 2. Call LLM to generate the composition DSL
 * 3. Parse the DSL into a ParsedComposition
 * 4. Compile into OpenUI source string
 * 5. Write workspace artifacts (home.openui, site-spec.json, tasks.json)
 * 6. Broadcast source to sessionCtx for incremental dashboard rendering
 *
 * Conforms to the RunShipFastEngine signature.
 */
export async function runComposition(
  opts: CompositionRunnerOptions = {},
): Promise<CompositionRunnerResult> {
  const t0 = Date.now()
  const userPrompt = requirePromptText(opts.prompt)
  const ws = opts.workspace || process.cwd()
  const model = opts.model ?? DEFAULT_MODEL
  const locale = opts.preferredLanguage ?? 'en'

  // ── Build prompt ──────────────────────────────────────────────────
  const genomeSeed = opts.sessionCtx?.id || opts.sessionId || ws
  const genome = generateGenome(genomeSeed)
  const { system, user } = buildCompositionPrompt(userPrompt, {
    locale,
    genome,
  })

  opts.sessionCtx?.setPrompt?.(userPrompt)

  const tasks = [
    {
      id: 'home.composition',
      label: 'Generate composition',
      status: 'IN_PROGRESS' as const,
      filename: 'home.openui',
      files: ['home.openui', 'site-spec.json'],
    },
  ]
  opts.sessionCtx?.setTasks?.(tasks)

  // Write initial tasks.json so the adapter can read it
  writeFileSync(join(ws, 'tasks.json'), JSON.stringify({ tasks }, null, 2))

  // ── Call LLM (streaming — broadcast source incrementally) ─────────
  const controller = new AbortController()

  // Honor external abort signal
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort(opts.signal.reason)
    else
      opts.signal.addEventListener(
        'abort',
        () => controller.abort(opts.signal!.reason),
        { once: true },
      )
  }

  let raw = ''
  raw = await generateTextStream(
    model,
    system,
    user,
    controller.signal,
    (chunk: string) => {
      raw += chunk
      // Try to parse and compile incrementally — broadcast partial source
      // so the dashboard can render the preview before the full LLM response
      try {
        const partialParsed = parseComposition(raw)
        if (partialParsed.sections.length > 0) {
          compileComposition(partialParsed, {
            brand: partialParsed.brand,
            title: partialParsed.title,
          })
            .then((partialCompiled) => {
              opts.sessionCtx?.broadcast?.({
                type: 'source',
                text: partialCompiled.source,
              })
            })
            .catch(() => {
              // Partial compile failed — skip
            })
        }
      } catch {
        // Partial parse — skip until we have enough
      }
    },
    2, // retries
  )

  // ── Parse ─────────────────────────────────────────────────────────
  const parsed = parseComposition(raw)

  if (parsed.sections.length === 0) {
    throw new Error(
      'Composition parser produced 0 sections — LLM output may be malformed',
    )
  }

  // ── Compile ───────────────────────────────────────────────────────
  const compiled = await compileComposition(parsed, {
    brand: parsed.brand,
    title: parsed.title,
  })

  // ── Validate svelte blocks (if any) ───────────────────────────────
  const svelteSections = parsed.sections.filter((s) => s.svelte?.source)
  if (svelteSections.length > 0) {
    const { validateSvelteSource } = await import('./svelte-compiler.ts')
    const failing = svelteSections
      .map((s) => ({
        motif: s.motif,
        result: validateSvelteSource(s.svelte!.source),
      }))
      .filter((r) => !r.result.valid)

    if (failing.length > 0) {
      const errorLines = failing
        .map((f) => `Block "${f.motif}": ${f.result.errors.join('; ')}`)
        .join('\n')
      opts.sessionCtx?.broadcast?.({
        type: 'log',
        message: `Svelte validation errors (non-fatal):\n${errorLines}`,
      })
    }
  }

  // ── Persist workspace artifacts ───────────────────────────────────
  // home.openui — the OpenUI source the renderer consumes
  writeFileSync(join(ws, 'home.openui'), compiled.source)

  // ── Pick theme based on @design intent (seeded for determinism) ───
  const themeSeed = opts.sessionCtx?.id || ws
  const themeRng = makeSeededRng(themeSeed)
  const themeName = pickThemeForDesignIntent(parsed.design, themeRng)

  // site-spec.json — the site spec the dashboard/export pipeline reads
  const siteSpec: SiteSpecProject = {
    brand: compiled.brand,
    projectName: compiled.title,
    tagline: compiled.title,
    theme: themeName,
    locale,
    skeleton: compiled.skeleton,
    modules: compiled.pageSources,
    pages: compiled.pages.map((pageId) => ({
      id: pageId,
      label: compiled.navLabels?.[pageId] ?? pageId,
    })),
    siteType: 'composition',
    userPrompt,
    // Fullstack wiring — lakebed, convex backend, data bindings
    lakebed: compiled.lakebed,
    convexBackend: compiled.convexBackend,
    dataBindings: compiled.dataBindings,
    fullstackManifest: compiled.fullstackManifest,
  }
  saveSiteSpec(ws, siteSpec)

  // ── Write Convex backend files to workspace ───────────────────────
  if (compiled.convexBackend) {
    for (const [filePath, content] of Object.entries(compiled.convexBackend)) {
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
  }

  // ── Write svelte scripts ──────────────────────────────────────────
  if (compiled.svelteScripts) {
    for (const [scriptPath, content] of Object.entries(
      compiled.svelteScripts,
    )) {
      if (content.length === 0) continue
      const fullPath = join(ws, scriptPath)
      const dir = fullPath.slice(0, fullPath.lastIndexOf('/'))
      try {
        if (!existsSync(dir)) {
          await import('node:fs/promises').then((fs) =>
            fs.mkdir(dir, { recursive: true }),
          )
        }
        writeFileSync(fullPath, content)
      } catch {
        // non-fatal — svelte scripts are optional artifacts
      }
    }
  }

  // ── Write openui-manifest.json ────────────────────────────────────
  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    home: 'home.openui',
    pages: compiled.pages.map((pageId) => ({
      route: pageId,
      title: pageId === 'home' ? 'Home' : pageId,
      file: `${pageId}.openui`,
      ready: true,
    })),
  }
  writeFileSync(
    join(ws, 'openui-manifest.json'),
    JSON.stringify(manifest, null, 2),
  )

  // composition-spec.json — detailed composition metadata for debugging
  writeFileSync(
    join(ws, 'composition-spec.json'),
    JSON.stringify(
      {
        brand: compiled.brand,
        title: compiled.title,
        design: compiled.design,
        pages: compiled.pages,
        navLabels: compiled.navLabels,
        sections: parsed.sections.map((s) => ({
          motif: s.motif,
          props: s.props,
          nested: s.nested,
          design: s.design ? serializeDesignIntent(s.design) : undefined,
          svelte: s.svelte ? { hasSource: true } : undefined,
        })),
        lakebed: compiled.lakebed,
        dataBindings: compiled.dataBindings,
        fullstackManifest: compiled.fullstackManifest,
      },
      null,
      2,
    ),
  )

  // tasks.json — mark task as DONE
  tasks[0].status = 'DONE'
  writeFileSync(join(ws, 'tasks.json'), JSON.stringify({ tasks }, null, 2))

  // ── Broadcast ─────────────────────────────────────────────────────
  // Broadcast source for incremental dashboard rendering
  opts.sessionCtx?.broadcast?.({ type: 'source', text: compiled.source })
  opts.sessionCtx?.updateTask?.(tasks[0])
  opts.sessionCtx?.signalOpenuiReady?.()
  opts.sessionCtx?.signalHomepageReady?.()

  // Run afterSiteSpecSaved hook if provided
  if (opts.integrations?.afterSiteSpecSaved) {
    await opts.integrations.afterSiteSpecSaved({
      workspace: ws,
      siteSpec,
      log: (msg: string) =>
        opts.sessionCtx?.broadcast?.({ type: 'log', message: msg }),
      status: (message: string, phase: string) =>
        opts.sessionCtx?.broadcast?.({ type: 'status', message, phase }),
    })
  }

  const duration = Date.now() - t0
  opts.sessionCtx?.setElapsed?.(duration)

  return {
    source: compiled.source,
    parsed,
    compiled,
    raw,
    duration,
  }
}

/**
 * Stream the composition pipeline with incremental source updates.
 *
 * As the LLM streams tokens, we parse incrementally and broadcast partial
 * source so the dashboard can render progressively.
 */
export async function streamComposition(
  opts: CompositionRunnerOptions = {},
): Promise<CompositionRunnerResult> {
  const t0 = Date.now()
  const userPrompt = requirePromptText(opts.prompt)
  const ws = opts.workspace || process.cwd()
  const model = opts.model ?? DEFAULT_MODEL
  const locale = opts.preferredLanguage ?? 'en'

  const genomeSeed = opts.sessionCtx?.id || opts.sessionId || ws
  const genome = generateGenome(genomeSeed)
  const { system, user } = buildCompositionPrompt(userPrompt, {
    locale,
    genome,
  })

  opts.sessionCtx?.setPrompt?.(userPrompt)

  const tasks = [
    {
      id: 'home.composition',
      label: 'Generate composition',
      status: 'IN_PROGRESS' as const,
      filename: 'home.openui',
      files: ['home.openui', 'site-spec.json'],
    },
  ]
  opts.sessionCtx?.setTasks?.(tasks)
  writeFileSync(join(ws, 'tasks.json'), JSON.stringify({ tasks }, null, 2))

  // ── Stream LLM output ─────────────────────────────────────────────
  let raw = ''
  const controller = new AbortController()

  if (opts.signal) {
    if (opts.signal.aborted) controller.abort(opts.signal.reason)
    else
      opts.signal.addEventListener(
        'abort',
        () => controller.abort(opts.signal!.reason),
        { once: true },
      )
  }

  await generateTextStream(
    model,
    system,
    user,
    controller.signal,
    (chunk: string) => {
      raw += chunk
      // Try to parse and compile incrementally
      try {
        const partialParsed = parseComposition(raw)
        if (partialParsed.sections.length > 0) {
          compileComposition(partialParsed, {
            brand: partialParsed.brand,
            title: partialParsed.title,
          })
            .then((partialCompiled) => {
              opts.sessionCtx?.broadcast?.({
                type: 'source',
                text: partialCompiled.source,
              })
            })
            .catch(() => {
              // Partial compile failed — skip
            })
        }
      } catch {
        // Partial parse — skip until we have enough
      }
    },
  )

  // ── Final parse + compile ─────────────────────────────────────────
  const parsed = parseComposition(raw)

  if (parsed.sections.length === 0) {
    throw new Error(
      'Composition parser produced 0 sections — LLM output may be malformed',
    )
  }

  const compiled = await compileComposition(parsed, {
    brand: parsed.brand,
    title: parsed.title,
  })

  // Persist artifacts
  writeFileSync(join(ws, 'home.openui'), compiled.source)

  // ── Pick theme based on @design intent (seeded for determinism) ───
  const themeSeed = opts.sessionCtx?.id || ws
  const themeRng = makeSeededRng(themeSeed)
  const themeName = pickThemeForDesignIntent(parsed.design, themeRng)

  const siteSpec: SiteSpecProject = {
    brand: compiled.brand,
    projectName: compiled.title,
    tagline: compiled.title,
    theme: themeName,
    locale,
    skeleton: compiled.skeleton,
    modules: compiled.pageSources,
    pages: compiled.pages.map((pageId) => ({
      id: pageId,
      label: compiled.navLabels?.[pageId] ?? pageId,
    })),
    siteType: 'composition',
    userPrompt,
    // Fullstack wiring — lakebed, convex backend, data bindings
    lakebed: compiled.lakebed,
    convexBackend: compiled.convexBackend,
    dataBindings: compiled.dataBindings,
    fullstackManifest: compiled.fullstackManifest,
  }
  saveSiteSpec(ws, siteSpec)

  // ── Write Convex backend files to workspace ───────────────────────
  if (compiled.convexBackend) {
    for (const [filePath, content] of Object.entries(compiled.convexBackend)) {
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
  }

  // ── Write svelte scripts ──────────────────────────────────────────
  if (compiled.svelteScripts) {
    for (const [scriptPath, content] of Object.entries(
      compiled.svelteScripts,
    )) {
      if (content.length === 0) continue
      const fullPath = join(ws, scriptPath)
      const dir = fullPath.slice(0, fullPath.lastIndexOf('/'))
      try {
        if (!existsSync(dir)) {
          await import('node:fs/promises').then((fs) =>
            fs.mkdir(dir, { recursive: true }),
          )
        }
        writeFileSync(fullPath, content)
      } catch {
        // non-fatal — svelte scripts are optional artifacts
      }
    }
  }

  // ── Write openui-manifest.json ────────────────────────────────────
  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    home: 'home.openui',
    pages: compiled.pages.map((pageId) => ({
      route: pageId,
      title: pageId === 'home' ? 'Home' : pageId,
      file: `${pageId}.openui`,
      ready: true,
    })),
  }
  writeFileSync(
    join(ws, 'openui-manifest.json'),
    JSON.stringify(manifest, null, 2),
  )

  tasks[0].status = 'DONE'
  writeFileSync(join(ws, 'tasks.json'), JSON.stringify({ tasks }, null, 2))

  opts.sessionCtx?.broadcast?.({ type: 'source', text: compiled.source })
  opts.sessionCtx?.updateTask?.(tasks[0])
  opts.sessionCtx?.signalOpenuiReady?.()
  opts.sessionCtx?.signalHomepageReady?.()
  opts.sessionCtx?.setElapsed?.(Date.now() - t0)

  return {
    source: compiled.source,
    parsed,
    compiled,
    raw,
    duration: Date.now() - t0,
  }
}

// ─── Seeded RNG (mulberry32) — deterministic theme pick per session ──────

function makeSeededRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
