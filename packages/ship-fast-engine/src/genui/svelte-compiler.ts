// v3 engine — Svelte 4 compilation pipeline.
// Compiles LLM-emitted Svelte source into SSR HTML + DOM JS using svelte/compiler.
// The SSR HTML is used for gallery/preview rendering; the DOM JS is shipped to
// the browser for client-side interactivity (Svelte island pattern).

import { writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'

/** Result of a successful Svelte compilation. */
export interface CompiledSvelte {
  /** Server-rendered HTML string (from Svelte SSR output). */
  ssrHtml: string
  /** Compiled DOM JS module source (ESM, imports from svelte/internal). */
  domJs: string
  /** Extracted CSS (may be empty if component has no <style>). */
  css: string
  /** Compiler warnings (non-fatal). */
  warnings: string[]
}

/** Validation result for a Svelte source string. */
export interface SvelteValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/** Pascal-case a role name for the Svelte component name. */
function pascalCase(name: string): string {
  return name
    .split(/[^a-zA-Z0-9]+/)
    .filter((s) => s.length > 0)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join('')
}

/** Validate Svelte source by attempting to compile it.
 *  Returns structured errors/warnings without evaluating the output. */
export function validateSvelteSource(source: string): SvelteValidationResult {
  // Dynamic import — svelte/compiler is an ESM module
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { compile } = require('svelte/compiler')
    const errors: string[] = []
    const warnings: string[] = []
    try {
      const result = compile(source, {
        name: pascalCase('Validation'),
        generate: 'ssr',
      })
      for (const w of result.warnings ?? []) {
        warnings.push((w as { message?: string }).message ?? String(w))
      }
    } catch (err: unknown) {
      const svelteErr = err as { message?: string; code?: string }
      errors.push(svelteErr.message ?? String(err))
    }
    return { valid: errors.length === 0, errors, warnings }
  } catch {
    return {
      valid: false,
      errors: ['svelte/compiler not available'],
      warnings: [],
    }
  }
}

/** Compile a Svelte block into SSR HTML + DOM JS.
 *  Throws on compile error. Use validateSvelteSource first for non-throwing validation. */
export async function compileSvelteBlock(
  source: string,
  roleName: string,
): Promise<CompiledSvelte> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { compile } = require('svelte/compiler')
  const componentName = pascalCase(roleName) || 'SvelteBlock'

  // Compile SSR output
  const ssrResult = compile(source, {
    name: componentName,
    generate: 'ssr',
  })

  // Compile DOM output
  const domResult = compile(source, {
    name: componentName,
    generate: 'dom',
  })

  const warnings = (ssrResult.warnings ?? [])
    .map((w: { message?: string }) => w.message ?? String(w))
    .filter((m: string) => m.length > 0)

  // Evaluate SSR module to get HTML
  const ssrHtml = await evaluateSsrModule(ssrResult.js.code)
  const css = domResult.css?.code ?? ssrResult.css?.code ?? ''

  return {
    ssrHtml,
    domJs: domResult.js.code,
    css,
    warnings,
  }
}

/** Evaluate a compiled Svelte SSR module and call its render() to get HTML.
 *  Writes the module to a temp .mjs file inside the project so that
 *  `svelte/internal` imports resolve from node_modules. */
async function evaluateSsrModule(ssrJsCode: string): Promise<string> {
  const tmpFileName = `.svelte-ssr-${randomBytes(6).toString('hex')}.mjs`
  // Write inside the project root so node_modules resolution works
  const tmpFilePath = join(process.cwd(), tmpFileName)
  writeFileSync(tmpFilePath, ssrJsCode)
  try {
    const mod = await import(tmpFilePath)
    const Component = mod.default
    if (!Component || typeof Component.render !== 'function') {
      throw new Error('SSR module does not export a component with render()')
    }
    const result = Component.render()
    return result.html ?? ''
  } finally {
    try {
      unlinkSync(tmpFilePath)
    } catch {
      // non-fatal
    }
  }
}

/** Compile a Svelte block with retry-on-error support.
 *  Returns the compiled result or null if all attempts fail.
 *  The retryCallback is called with the error message to allow the caller
 *  to re-prompt the LLM for a corrected version. */
export async function compileSvelteWithRetries(
  source: string,
  roleName: string,
  maxAttempts: number,
  retryCallback: (error: string, attempt: number) => Promise<string | null>,
): Promise<CompiledSvelte | null> {
  let currentSource = source
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await compileSvelteBlock(currentSource, roleName)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      if (attempt >= maxAttempts) {
        return null
      }
      const corrected = await retryCallback(errorMsg, attempt)
      if (!corrected) return null
      currentSource = corrected
    }
  }
  return null
}
