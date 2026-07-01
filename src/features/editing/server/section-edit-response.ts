import { Buffer } from 'node:buffer'
import { brotliDecompressSync } from 'node:zlib'

import { ConvexHttpClient } from 'convex/browser'
import { renderToStaticMarkup } from 'react-dom/server'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import type { InspectorSelection } from '@/features/editing/element-path'

type SectionEditClient = Pick<ConvexHttpClient, 'query' | 'mutation'>

type JsonBody = Record<string, unknown>

type GenerateText = (
  model: string,
  system: string,
  user: string,
  signal: AbortSignal,
  retries?: number,
) => Promise<string>
type GenerateTextRuntime = {
  generateText: GenerateText
  DEFAULT_MODEL: string
}
type CapsuleSmokeGlobals = typeof globalThis & {
  React?: typeof import('react')
  __jsxRuntime?: typeof import('react/jsx-runtime')
}

const SECTION_EDIT_TIMEOUT_MS = 45000
const DEFAULT_SECTION_EDIT_MODEL = 'openai/gpt-oss-120b'
const MAX_INSTRUCTION_CHARS = 2000
const MAX_SELECTION_HTML_CHARS = 8000
const MAX_TSX_SOURCE_CHARS = 30000
const MAX_AUTO_FIX_RETRIES = 3

const asSessionId = (sessionId: string): Id<'sessions'> =>
  sessionId as Id<'sessions'>

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const loadGenerateTextRuntime = async (): Promise<GenerateTextRuntime> => {
  const [{ generateText }, { DEFAULT_MODEL }] = await Promise.all([
    import('@ship-fast/engine'),
    import('@ship-fast/engine/model-list.js'),
  ])
  return { generateText, DEFAULT_MODEL }
}

const getString = (body: JsonBody, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = body[key]
    if (typeof value === 'string') return value
  }
  return undefined
}

const getOwnerSecret = (request: Request, body: JsonBody): string | undefined =>
  getString(body, ['anonymousOwnerSecret']) ??
  request.headers.get('x-anonymous-owner-secret') ??
  undefined

const readJsonBody = async (request: Request): Promise<JsonBody> => {
  const text = await request.text()
  return JSON.parse(text) as JsonBody
}

const truncate = (value: string, max: number): string =>
  value.length > max ? `${value.slice(0, max)}…` : value

type GenerationViewSnapshot = {
  homeModule?: { source: string } | null
  latestPreview?: { html: string } | null
}

/** Determine if the session is HTML (iframe srcDoc) or OpenUI (component tree). */
const isHtmlSession = (snapshot: GenerationViewSnapshot): boolean => {
  const source = snapshot.homeModule?.source ?? ''
  // HTML sessions have <!DOCTYPE html> or <html> at the start
  return /^\s*(?:<!DOCTYPE\s+html|<html)/i.test(source.trim())
}

// ─── LLM Prompt Builders ────────────────────────────────────────────────────

const buildHtmlSectionEditPrompt = (
  selection: InspectorSelection,
  instruction: string,
  previewHtml: string,
): { system: string; user: string } => {
  const system = [
    'You are a frontend engineer editing a section of an HTML page.',
    'You will receive the current full HTML of the page and a user instruction.',
    'Return ONLY the complete replacement HTML page (full <!DOCTYPE html>...</html>).',
    'Preserve all content outside the targeted section unless the instruction explicitly asks to change it.',
    'Keep all existing styles, scripts, and structure intact except for the requested edit.',
    'Do not add comments or explanations — output only the HTML.',
  ].join('\n')

  const user = [
    `User instruction: ${truncate(instruction, MAX_INSTRUCTION_CHARS)}`,
    '',
    `Selected element tag: ${selection.tag}`,
    `Selected element path: ${selection.elementPath}`,
    `Selected element outerHTML: ${truncate(
      selection.outerHTML,
      MAX_SELECTION_HTML_CHARS,
    )}`,
    '',
    'Current full page HTML:',
    truncate(previewHtml, 50000),
    '',
    'Return the complete replacement HTML page now.',
  ].join('\n')

  return { system, user }
}

const buildOpenUiCapsuleEditPrompt = (
  selection: InspectorSelection,
  instruction: string,
  capsuleSource: string,
  similarCapsules: string[],
): { system: string; user: string } => {
  const system = [
    'You are a React/TypeScript engineer rewriting an OpenUI capsule component.',
    'The capsule is a React component that receives props and renders a UI section.',
    'You will receive the capsule source code and a user instruction.',
    'Return ONLY a complete TSX module that exports a default React component.',
    'The component must accept a props object and render the section.',
    'Use inline Tailwind classes for styling. Do not import external CSS.',
    'You may import from "react" only. Do not import other modules.',
    'Preserve interactivity (onClick, useState, etc.) where appropriate.',
    'Do not add comments or explanations — output only the TSX code.',
    'The component signature must be: `function ComponentName(props: Record<string, any>): JSX.Element`',
    'Export it as default: `export default ComponentName`',
  ].join('\n')

  const user = [
    `User instruction: ${truncate(instruction, MAX_INSTRUCTION_CHARS)}`,
    '',
    `Target capsule: ${selection.openuiComponent}`,
    `Source variable: ${selection.openuiVar ?? '(none)'}`,
    `Selected element: ${selection.tag} at ${selection.elementPath}`,
    `Selected element outerHTML: ${truncate(
      selection.outerHTML,
      MAX_SELECTION_HTML_CHARS,
    )}`,
    '',
    'Current capsule source:',
    truncate(capsuleSource, MAX_TSX_SOURCE_CHARS),
    '',
    similarCapsules.length > 0
      ? `Similar capsules for reference (do not copy, just for pattern awareness): ${similarCapsules.join(', ')}`
      : '',
    '',
    'Return the complete TSX module now.',
  ].join('\n')

  return { system, user }
}

// ─── TSX Compilation + Validation ───────────────────────────────────────────

type CompileResult =
  | { ok: true; compiledJs: string }
  | { ok: false; error: string }

const compileTsx = async (tsxSource: string): Promise<CompileResult> => {
  try {
    // Dynamic import so esbuild (and its native fsevents dep) is only loaded
    // server-side, not pulled into Vite's client dependency scan.
    const esbuild = await import('esbuild')
    const result = await esbuild.build({
      stdin: {
        contents: tsxSource,
        resolveDir: process.cwd(),
        loader: 'tsx',
      },
      bundle: true,
      format: 'esm',
      target: 'es2020',
      jsx: 'automatic',
      write: false,
      // Keep react external — we'll rewrite the import statements to use
      // global React (available in the browser) so the compiled JS can be
      // loaded via Blob URL without an import map.
      external: ['react', 'react/jsx-runtime'],
    })
    const output = result.outputFiles[0]
    if (!output) {
      return { ok: false, error: 'esbuild produced no output' }
    }
    let compiledJs = new TextDecoder().decode(output.contents)
    // Replace external React imports with global references so the compiled
    // JS can be loaded via Blob URL in the browser (where there's no import
    // map) and via data: URL in Node.js (where globalThis.React is set up
    // by the smoke test).
    compiledJs = compiledJs
      .replace(
        /import\s+React\s+from\s+["']react["'];?\s*/g,
        'const React = globalThis.React;',
      )
      .replace(
        /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']react\/jsx-runtime["'];?\s*/g,
        'const { $1 } = globalThis.__jsxRuntime;',
      )
      .replace(
        /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']react["'];?\s*/g,
        'const { $1 } = globalThis.React;',
      )
    return { ok: true, compiledJs }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, error: message }
  }
}

type SmokeTestResult = { ok: true } | { ok: false; error: string }

/** Dynamic-import the compiled JS and verify it exports a renderable component.
 *  Uses a data: URL which works in both Node.js (>=20) and browsers.
 *  Sets up globalThis.React and globalThis.__jsxRuntime so the compiled JS
 *  (which references these globals instead of importing 'react') can run. */
const smokeTestCapsule = async (
  compiledJs: string,
): Promise<SmokeTestResult> => {
  try {
    const smokeGlobals: CapsuleSmokeGlobals = globalThis
    // Set up globals that the compiled JS references instead of 'react' imports
    if (!smokeGlobals.React) {
      smokeGlobals.React = await import('react')
    }
    if (!smokeGlobals.__jsxRuntime) {
      smokeGlobals.__jsxRuntime = await import('react/jsx-runtime')
    }

    // data: URL with base64 encoding works in Node.js 20+ and all browsers
    const dataUrl = `data:text/javascript;base64,${Buffer.from(compiledJs).toString('base64')}`
    const module = await import(/* @vite-ignore */ dataUrl)

    const Component = module.default
    if (typeof Component !== 'function') {
      return { ok: false, error: 'Module does not export a default function' }
    }

    // Try rendering with empty props — if it throws, the capsule is broken
    const element = Component({})
    const html = renderToStaticMarkup(element)
    if (typeof html !== 'string') {
      return { ok: false, error: 'Component did not render to HTML string' }
    }
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, error: message }
  }
}

type AutoFixResult =
  | { ok: true; compiledJs: string; tsxSource: string }
  | { ok: false; error: string; attempts: number }

/** Compile + smoke-test the TSX. On failure, ask the LLM to fix, up to 3 retries. */
const compileAndValidateWithAutoFix = async (
  tsxSource: string,
  generate: GenerateText,
  model: string,
  originalInstruction: string,
): Promise<AutoFixResult> => {
  let currentSource = tsxSource

  for (let attempt = 0; attempt <= MAX_AUTO_FIX_RETRIES; attempt++) {
    const compiled = await compileTsx(currentSource)
    if (!compiled.ok) {
      if (attempt >= MAX_AUTO_FIX_RETRIES) {
        return {
          ok: false,
          error: `Compilation failed after ${attempt} attempts: ${compiled.error}`,
          attempts: attempt,
        }
      }
      currentSource = await requestAutoFix(
        generate,
        model,
        currentSource,
        compiled.error,
        originalInstruction,
      )
      continue
    }

    const smoke = await smokeTestCapsule(compiled.compiledJs)
    if (smoke.ok) {
      return {
        ok: true,
        compiledJs: compiled.compiledJs,
        tsxSource: currentSource,
      }
    }

    if (attempt >= MAX_AUTO_FIX_RETRIES) {
      return {
        ok: false,
        error: `Smoke test failed after ${attempt} attempts: ${smoke.error}`,
        attempts: attempt,
      }
    }
    currentSource = await requestAutoFix(
      generate,
      model,
      currentSource,
      smoke.error,
      originalInstruction,
    )
  }

  return {
    ok: false,
    error: 'Exhausted auto-fix retries',
    attempts: MAX_AUTO_FIX_RETRIES,
  }
}

const requestAutoFix = async (
  generate: GenerateText,
  model: string,
  brokenSource: string,
  error: string,
  originalInstruction: string,
): Promise<string> => {
  const system = [
    'You are fixing a broken React/TypeScript component.',
    'The previous version failed to compile or render.',
    'Return ONLY the fixed TSX code — no explanations.',
    'Keep the same component signature and export default.',
  ].join('\n')

  const user = [
    `Original instruction: ${truncate(originalInstruction, 500)}`,
    '',
    `Error: ${error}`,
    '',
    'Broken source:',
    truncate(brokenSource, MAX_TSX_SOURCE_CHARS),
    '',
    'Return the fixed TSX code now.',
  ].join('\n')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SECTION_EDIT_TIMEOUT_MS)
  try {
    return await generate(model, system, user, controller.signal, 1)
  } finally {
    clearTimeout(timeout)
  }
}

// ─── OpenUI Source Patching ─────────────────────────────────────────────────

/** Replace the capsule reference in OpenUI source with the AI capsule name. */
export const patchOpenUiSourceWithAiCapsule = (
  source: string,
  originalCapsuleName: string,
  aiCapsuleName: string,
  varName?: string,
): string => {
  // OpenUI source looks like: `hero = SaasHero({...})`
  // We replace `SaasHero` with `AICustom_SaasHero_v1`
  if (varName) {
    // Replace the specific variable assignment
    const pattern = new RegExp(
      `(${escapeRegExp(varName)}\\s*=\\s*)${escapeRegExp(originalCapsuleName)}\\b`,
      'g',
    )
    return source.replace(pattern, `$1${aiCapsuleName}`)
  }
  // Fallback: replace all references to the capsule name
  return source.replace(
    new RegExp(`\\b${escapeRegExp(originalCapsuleName)}\\b`, 'g'),
    aiCapsuleName,
  )
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// ─── Main Handler ───────────────────────────────────────────────────────────

export const createSectionEditResponse = async (
  sessionId: string,
  request: Request,
  options: {
    client?: SectionEditClient
    generate?: GenerateText
    model?: string
  } = {},
): Promise<Response> => {
  let body: JsonBody
  try {
    body = await readJsonBody(request)
  } catch {
    return json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const instruction = getString(body, ['instruction', 'prompt'])?.trim()
  if (!instruction) {
    return json({ error: 'Instruction is required.' }, { status: 400 })
  }

  const selectionRaw = body.selection as unknown
  if (
    !selectionRaw ||
    typeof selectionRaw !== 'object' ||
    !('elementPath' in selectionRaw)
  ) {
    return json({ error: 'Selection is required.' }, { status: 400 })
  }
  const selection = selectionRaw as InspectorSelection

  const client = options.client ?? createRuntimeConvexHttpClient(60000)
  const anonymousOwnerSecret = getOwnerSecret(request, body)

  // Load current artifacts
  const generationView = (await client.query(api.sessions.getGenerationView, {
    sessionId: asSessionId(sessionId),
  })) as GenerationViewSnapshot | null

  if (!generationView) {
    return json({ error: 'Session not found.' }, { status: 404 })
  }

  const htmlSession = isHtmlSession(generationView)
  const runtime = options.generate ? null : await loadGenerateTextRuntime()
  const generate = options.generate ?? runtime!.generateText
  const model =
    options.model ?? runtime?.DEFAULT_MODEL ?? DEFAULT_SECTION_EDIT_MODEL

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SECTION_EDIT_TIMEOUT_MS)

  try {
    if (htmlSession) {
      // ─── HTML Session: generate replacement HTML ───
      const previewHtml = generationView.latestPreview?.html ?? ''
      const prompt = buildHtmlSectionEditPrompt(
        selection,
        instruction,
        previewHtml,
      )

      const replacementHtml = await generate(
        model,
        prompt.system,
        prompt.user,
        controller.signal,
        1,
      )

      // Basic validation: must contain <html or <!DOCTYPE
      if (!/<(?:!DOCTYPE\s+)?html/i.test(replacementHtml)) {
        return json(
          { error: 'AI did not return valid HTML. Please try again.' },
          { status: 502 },
        )
      }

      const result = await client.mutation(api.sessions.applySectionEdit, {
        sessionId: asSessionId(sessionId),
        anonymousOwnerSecret,
        replacementHtml,
        instruction,
      })

      return json({ ...result, mode: 'html' })
    } else {
      // ─── OpenUI Session: generate AI capsule ───
      const capsuleName = selection.openuiComponent
      if (!capsuleName) {
        return json(
          { error: 'No OpenUI capsule found in selection.' },
          { status: 400 },
        )
      }

      // Load capsule source from the generated manifest
      const { findSimilarCapsules } =
        await import('@ship-fast/blocks/generated')
      const similar = findSimilarCapsules(capsuleName, 5)

      // Load the capsule source for the LLM prompt
      const capsuleSource = await loadCapsuleSource(capsuleName)

      const prompt = buildOpenUiCapsuleEditPrompt(
        selection,
        instruction,
        capsuleSource,
        similar,
      )

      const tsxSource = await generate(
        model,
        prompt.system,
        prompt.user,
        controller.signal,
        1,
      )

      // Compile + validate with auto-fix loop
      const validationResult = await compileAndValidateWithAutoFix(
        tsxSource,
        generate,
        model,
        instruction,
      )

      if (!validationResult.ok) {
        return json(
          {
            error: 'AI capsule failed validation.',
            details: validationResult.error,
            attempts: validationResult.attempts,
          },
          { status: 502 },
        )
      }

      // Generate deterministic AI capsule name (re-edits update same row)
      const aiCapsuleName = generateAiCapsuleName(
        capsuleName,
        selection.openuiVar,
      )

      // Patch the OpenUI source to reference the new AI capsule
      const originalSource = generationView.homeModule?.source ?? ''
      const patchedSource = patchOpenUiSourceWithAiCapsule(
        originalSource,
        capsuleName,
        aiCapsuleName,
        selection.openuiVar,
      )

      const result = await client.mutation(api.sessions.applySectionEdit, {
        sessionId: asSessionId(sessionId),
        anonymousOwnerSecret,
        replacementOpenUiSource: patchedSource,
        aiCapsule: {
          capsuleName: aiCapsuleName,
          parentCapsule: capsuleName,
          compiledJs: validationResult.compiledJs,
          description: instruction.slice(0, 200),
        },
        instruction,
      })

      return json({ ...result, mode: 'openui', aiCapsuleName })
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Section edit failed'
    return json({ error: message }, { status: 500 })
  } finally {
    clearTimeout(timeout)
  }
}

/** Generate a deterministic AI capsule name based on the parent capsule and
 *  optional source variable. This ensures re-edits update the same capsule
 *  row instead of creating orphan duplicates. */
const generateAiCapsuleName = (
  parentName: string,
  varName?: string,
): string => {
  if (varName) {
    return `AICustom_${parentName}_${varName}`
  }
  return `AICustom_${parentName}`
}

// Cache for decompressed capsule source manifest
let capsuleSourceIndex: Record<
  string,
  { file: string; source: string } | undefined
> | null = null

/** Load the actual TSX source code of a capsule by name from the compressed
 *  react-export-sources manifest. This gives the LLM the real source to edit. */
const loadCapsuleSource = async (capsuleName: string): Promise<string> => {
  try {
    if (capsuleSourceIndex === null) {
      const { reactExportSourcesBase64, reactExportSourcesEncoding } =
        await import('@ship-fast/blocks/generated')
      if (reactExportSourcesEncoding !== 'br+base64') {
        throw new Error(`Unsupported encoding: ${reactExportSourcesEncoding}`)
      }
      const manifestJson = brotliDecompressSync(
        Buffer.from(reactExportSourcesBase64, 'base64'),
      ).toString('utf8')
      capsuleSourceIndex = JSON.parse(manifestJson)
    }
    const entry = capsuleSourceIndex?.[capsuleName]
    if (!entry?.source) {
      return `// Source not available for ${capsuleName}`
    }
    return entry.source
  } catch {
    return `// Could not load source for ${capsuleName}`
  }
}
