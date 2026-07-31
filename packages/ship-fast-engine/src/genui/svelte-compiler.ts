// v3 engine — Svelte 4 compilation pipeline.
// Compiles LLM-emitted Svelte source into SSR HTML + DOM JS using svelte/compiler.
// The SSR HTML is used for gallery/preview rendering; the DOM JS is shipped to
// the browser for client-side interactivity (Svelte island pattern).

import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { Worker } from 'node:worker_threads'

import { validateSvelteAst } from './svelte-ast-validator'

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

/**
 * Security patterns that must be blocked in LLM-emitted Svelte source.
 * The Svelte compiler catches syntax errors but not XSS — {@html} with
 * untrusted input, inline event handlers, and javascript: URIs can all
 * execute arbitrary code in the browser.
 */
const XSS_PATTERNS: Array<{ re: RegExp; message: string }> = [
  {
    re: /\{@html\s+/,
    message:
      '{@html} is blocked — it renders raw HTML and bypasses Svelte escaping, allowing XSS.',
  },
  {
    // Inline HTML event handlers (onclick=, onerror=) — NOT Svelte's on:click
    re: /\bon(click|error|load|mouseover|submit|change|input|focus|blur|mouseout|keyup|keydown|keypress)\s*=/i,
    message:
      'Inline event handlers (on*) are blocked — use Svelte on: directives instead.',
  },
  {
    re: /javascript:/i,
    message: 'javascript: URIs are blocked — they can execute arbitrary code.',
  },
  {
    // External script imports are blocked; inline <script> is allowed for
    // Svelte component logic (it's compiled, not rendered as-is).
    re: /<script\s+src\s*=/i,
    message: 'External <script src=> imports are blocked in Svelte components.',
  },
  {
    re: /<iframe\b/i,
    message: '<iframe> tags are blocked in Svelte components.',
  },
  {
    re: /document\.(cookie|domain|write)|window\.(location|open)|eval\(|Function\(/,
    message:
      'DOM access to sensitive APIs (document.cookie, eval, etc.) is blocked.',
  },
  // Obfuscation-resistant patterns: catch string-concatenation bypasses
  {
    re: /document\s*\[\s*['"](cookie|domain|write)['"]\s*\]/i,
    message: 'Obfuscated document[...] access is blocked.',
  },
  {
    re: /window\s*\[\s*['"](location|open)['"]\s*\]/i,
    message: 'Obfuscated window[...] access is blocked.',
  },
  {
    re: /\beval\s*\(|Function\s*\(/,
    message: 'eval() and Function() are blocked — they execute arbitrary code.',
  },
  {
    re: /document\.createElement\s*\(\s*['"]script['"]/i,
    message: 'document.createElement("script") is blocked.',
  },
  {
    re: /document\.createElement\s*\(\s*['"]iframe['"]/i,
    message: 'document.createElement("iframe") is blocked.',
  },
  {
    re: /\.innerHTML\s*=/,
    message:
      '.innerHTML assignment is blocked — use Svelte reactivity instead.',
  },
  {
    re: /\.outerHTML\s*=/,
    message: '.outerHTML assignment is blocked.',
  },
  {
    re: /insertAdjacentHTML\s*\(/,
    message: 'insertAdjacentHTML() is blocked.',
  },
  {
    re: /document\.write\s*\(/,
    message: 'document.write() is blocked.',
  },
  {
    re: /import\s*\(/,
    message:
      'Dynamic import() is blocked in Svelte components — use static imports.',
  },
  {
    re: /require\s*\(/,
    message: 'require() is blocked in Svelte components.',
  },
  {
    re: /fetch\s*\(/,
    message:
      'fetch() is blocked in Svelte components — data fetching must happen outside the preview.',
  },
  {
    re: /XMLHttpRequest/,
    message: 'XMLHttpRequest is blocked in Svelte components.',
  },
  {
    re: /WebSocket/,
    message: 'WebSocket is blocked in Svelte components.',
  },
  {
    re: /navigator\.(sendBeacon|geolocation|mediaDevices)/,
    message: 'Sensitive navigator APIs are blocked in Svelte components.',
  },
  {
    re: /window\.postMessage|document\.postMessage/,
    message: 'postMessage is blocked in Svelte components.',
  },
]

/** Validate Svelte source by attempting to compile it.
 *  Returns structured errors/warnings without evaluating the output.
 *  Also blocks XSS patterns that the Svelte compiler doesn't catch.
 *
 *  Two layers of defense:
 *  1. Regex-based XSS_PATTERNS — catches common patterns in source text
 *  2. AST-based validation — walks the Svelte compiler's ESTree AST to
 *     detect dangerous patterns structurally (impossible to bypass with
 *     obfuscation, string concatenation, or unicode escapes)
 */
export function validateSvelteSource(source: string): SvelteValidationResult {
  // Layer 1: Pre-compilation regex check — catches common patterns quickly.
  const errors: string[] = []
  const warnings: string[] = []
  for (const { re, message } of XSS_PATTERNS) {
    if (re.test(source)) {
      errors.push(`Security: ${message}`)
    }
  }

  // Dynamic import — svelte/compiler is an ESM module
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { compile } = require('svelte/compiler')
    try {
      const result = compile(source, {
        name: pascalCase('Validation'),
        generate: 'ssr',
      })
      for (const w of result.warnings ?? []) {
        warnings.push((w as { message?: string }).message ?? String(w))
      }

      // Layer 2: AST-based validation — walks the compiled AST to detect
      // dangerous patterns structurally. This catches obfuscated patterns
      // that regex can miss (e.g., window["lo"+"cation"] resolves to a
      // MemberExpression with object=window, property=location in the AST).
      const astResult = validateSvelteAst(result.ast)
      if (!astResult.valid) {
        errors.push(...astResult.errors)
      }
    } catch (err: unknown) {
      const svelteErr = err as { message?: string; code?: string }
      errors.push(svelteErr.message ?? String(err))
    }
    return { valid: errors.length === 0, errors, warnings }
  } catch {
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : ['svelte/compiler not available'],
      warnings,
    }
  }
}

/** Compile a Svelte block into SSR HTML + DOM JS.
 *  Throws on compile error. Use validateSvelteSource first for non-throwing validation. */
export async function compileSvelteBlock(
  source: string,
  roleName: string,
): Promise<CompiledSvelte> {
  // Defense-in-depth: validate XSS patterns before compiling, even though
  // composition-runner.ts also validates. This prevents direct callers from
  // bypassing the security check.
  const validation = validateSvelteSource(source)
  if (!validation.valid) {
    throw new Error(
      `Svelte block "${roleName}" failed XSS validation: ${validation.errors.join('; ')}`,
    )
  }

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

  // Post-compilation sanitization: strip any script tags, event handlers,
  // or javascript: URIs from the rendered SSR HTML. The Svelte compiler
  // should already escape text content, but defense-in-depth against
  // LLM-generated components that might embed dangerous markup via
  // template expressions or computed attributes.
  const sanitizedSsrHtml = sanitizeSsrHtml(ssrHtml)

  return {
    ssrHtml: sanitizedSsrHtml,
    domJs: domResult.js.code,
    css,
    warnings,
  }
}

/**
 * Sanitize Svelte SSR HTML output — strip script tags, inline event handlers,
 * javascript: URIs, and other XSS vectors that could have been introduced
 * through template expressions or computed attribute values.
 */
function sanitizeSsrHtml(html: string): string {
  if (!html || typeof html !== 'string') return ''
  let result = html

  // Remove any <script> tags and their content
  result = result.replace(/<script[\s\S]*?<\/script>/gi, '')

  // Remove inline event handler attributes (on*=)
  result = result.replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
  result = result.replace(/\son\w+\s*=\s*'[^']*'/gi, '')
  result = result.replace(/\son\w+\s*=\s*[^\s>]+/gi, '')

  // Remove javascript: URIs in href, src, xlink:href
  result = result.replace(
    /((?:xlink:)?href|src)\s*=\s*"[^"]*javascript:[^"]*"/gi,
    '',
  )
  result = result.replace(
    /((?:xlink:)?href|src)\s*=\s*'[^']*javascript:[^']*'/gi,
    '',
  )

  // Remove data:text/html URIs
  result = result.replace(
    /((?:xlink:)?href|src)\s*=\s*"[^"]*data:text\/html[^"]*"/gi,
    '',
  )

  // Remove <iframe> tags
  result = result.replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
  result = result.replace(/<iframe[^>]*>/gi, '')

  return result
}

/** Where model-authored SSR modules are staged.
 *
 *  It has to sit under `node_modules` so the module's `svelte/internal`
 *  imports resolve, but NOT in the project source root: files written there
 *  are picked up by the dev-server file watcher, swept into builds, and show
 *  up as untracked files in `git status`. `node_modules/.cache` is ignored by
 *  all three. */
function ssrScratchDirectory(): string {
  const directory = join(
    process.cwd(),
    'node_modules',
    '.cache',
    'ship-fast-svelte-ssr',
  )
  mkdirSync(directory, { recursive: true })
  return directory
}

/** Hard ceilings for model-authored SSR evaluation. */
const SSR_EVAL_TIMEOUT_MS = 5_000
const SSR_EVAL_MAX_OLD_GENERATION_MB = 128

const SSR_WORKER_SOURCE = `
import { parentPort, workerData } from 'node:worker_threads'

const run = async () => {
  const mod = await import(workerData.modulePath)
  const Component = mod.default
  if (!Component || typeof Component.render !== 'function') {
    throw new Error('SSR module does not export a component with render()')
  }
  return Component.render()?.html ?? ''
}

run().then(
  (html) => parentPort.postMessage({ ok: true, html }),
  (error) =>
    parentPort.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    }),
)
`

/** Evaluate a compiled Svelte SSR module and call its render() to get HTML.
 *
 *  The module is MODEL-AUTHORED code. It runs in a worker thread with a wall
 *  clock timeout and a heap ceiling so a generated infinite loop or runaway
 *  allocation cannot take the server process down with it — previously this
 *  was a bare `await import()` on the main thread, with no way to interrupt it.
 *  (A worker is not a security sandbox; the real gate is the AST validator
 *  that must pass before anything reaches this function.) */
async function evaluateSsrModule(ssrJsCode: string): Promise<string> {
  const tmpFilePath = join(
    ssrScratchDirectory(),
    `svelte-ssr-${randomBytes(12).toString('hex')}.mjs`,
  )
  writeFileSync(tmpFilePath, ssrJsCode)

  try {
    return await new Promise<string>((resolve, reject) => {
      const worker = new Worker(SSR_WORKER_SOURCE, {
        eval: true,
        workerData: { modulePath: tmpFilePath },
        resourceLimits: {
          maxOldGenerationSizeMb: SSR_EVAL_MAX_OLD_GENERATION_MB,
        },
      })

      const timer = setTimeout(() => {
        void worker.terminate()
        reject(
          new Error(
            `SSR evaluation exceeded ${SSR_EVAL_TIMEOUT_MS}ms and was terminated`,
          ),
        )
      }, SSR_EVAL_TIMEOUT_MS)

      const settle = (finish: () => void) => {
        clearTimeout(timer)
        void worker.terminate()
        finish()
      }

      worker.once(
        'message',
        (message: { ok: boolean; html?: string; message?: string }) => {
          settle(() =>
            message.ok
              ? resolve(message.html ?? '')
              : reject(new Error(message.message ?? 'SSR evaluation failed')),
          )
        },
      )
      worker.once('error', (error) => settle(() => reject(error)))
      worker.once('exit', (code) => {
        if (code !== 0) {
          settle(() =>
            reject(new Error(`SSR evaluation worker exited with code ${code}`)),
          )
        }
      })
    })
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
