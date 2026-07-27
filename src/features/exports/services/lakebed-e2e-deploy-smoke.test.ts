// @vitest-environment node

/**
 * End-to-end Lakebed deployment smoke tests.
 *
 * These tests do what no other test in the suite does: they deploy a REAL
 * Lakebed app to a real *.lakebed.app URL, load it in a real Chrome browser
 * via agent-browser, and assert:
 *   1. #app is populated (client bundle didn't crash)
 *   2. Zero console errors (from ANY source — our component, lakebed runtime,
 *      browser extensions, anything)
 *   3. Zero page errors (uncaught exceptions, unhandled rejections)
 *   4. Expected content actually renders in the DOM
 *
 * This catches the class of bug that JSDOM + esbuild bundle tests cannot:
 *   - defineCapsule/sanitizeProps being stripped by lakebed export → raw
 *     component receives unsanitized LLM props → crash
 *   - lakebed runtime API mismatches (real lakebed/client vs stub)
 *   - browser-only issues (CSS, hydration, module loading)
 *   - errors from ANY source, not just the component under test
 *
 * SLOW — real deploy + real browser. Skipped by default.
 * Run with: LAKEBED_E2E_SMOKE=1 bunx vitest run lakebed-e2e-deploy-smoke
 */

import { execFileSync } from 'node:child_process'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { deployLakebedProjectFiles } from '@/features/deployments/server/lakebed-deploy-service'
import { buildOpenUILakebedProjectFiles } from './openui-lakebed-export-builder'

const SMOKE_ENABLED = true
const test = it

type DeployedApp = {
  url: string
  deployId: string
}

const deployedApps: DeployedApp[] = []

/**
 * Deploy a Lakebed app from OpenUI source and return the live URL.
 * Uses real fetch (not mocked) to hit the real Lakebed deploy API.
 */
async function deployApp(
  source: string,
  sessionId: string,
): Promise<DeployedApp> {
  const built = await buildOpenUILakebedProjectFiles({
    source,
    siteSpecJson: JSON.stringify({ projectName: `E2E Smoke ${sessionId}` }),
    sessionId,
    target: 'lakebed',
  })

  const result = await deployLakebedProjectFiles({
    files: built.files,
    inspectPolicy: 'public',
  })

  const app: DeployedApp = {
    deployId: result.deployId,
    url: result.url,
  }
  deployedApps.push(app)
  return app
}

/**
 * Run an agent-browser CLI command and return its stdout.
 * Throws on non-zero exit code so test fails immediately on browser issues.
 */
function browserExec(args: string[], timeoutMs = 30000): string {
  try {
    return execFileSync('agent-browser', args, {
      encoding: 'utf8',
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
    }).trim()
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`agent-browser ${args.join(' ')} failed: ${msg}`)
  }
}

/**
 * Open a URL in agent-browser, wait for it to load, and collect
 * console logs, page errors, and the #app HTML.
 *
 * Returns a structured result that tests can assert against.
 */
async function loadAndInspect(
  url: string,
  opts: { waitForMs?: number } = {},
): Promise<{
  consoleOutput: string
  errorOutput: string
  appHtml: string
  appText: string
  pageTitle: string
}> {
  // Navigate to the URL
  browserExec(['open', url], 30000)

  // Wait for client bundle to execute and render.
  // Use a longer wait for the first test (cold start) and try waiting
  // for the #app element to appear.
  const waitMs = opts.waitForMs ?? 5000
  browserExec(['wait', String(waitMs)], 15000)

  // Try waiting for #app to have children (element selector)
  try {
    browserExec(['wait', '#app > *', '10000'], 15000)
  } catch {
    // #app might not have children if client bundle crashed — that's ok,
    // we'll catch it in the assertion below
  }

  // Collect console logs (all levels)
  const consoleOutput = browserExec(['console', '--clear'], 10000)

  // Collect page errors (uncaught exceptions + unhandled rejections)
  const errorOutput = browserExec(['errors', '--clear'], 10000)

  // Get #app HTML — use eval for reliability (get html can fail on timing)
  let appHtml = ''
  try {
    appHtml = browserExec(
      ['eval', 'document.getElementById("app")?.innerHTML || ""'],
      10000,
    )
  } catch {
    // #app might not exist if client bundle crashed
  }

  // Get #app text content — use eval to get FULL textContent including
  // collapsed <details> elements (get text only returns visible text)
  let appText = ''
  try {
    appText = browserExec(
      ['eval', 'document.getElementById("app")?.textContent || ""'],
      10000,
    )
  } catch {
    // #app might not exist
  }

  // Get page title
  let pageTitle = ''
  try {
    pageTitle = browserExec(['get', 'title'], 10000)
  } catch {
    // ignore
  }

  return { consoleOutput, errorOutput, appHtml, appText, pageTitle }
}

/**
 * Assert no console errors or page errors on the deployed app.
 * This is the foolproof check: ANY error from ANY source fails the test.
 */
function assertNoBrowserErrors(
  consoleOutput: string,
  errorOutput: string,
  context: string,
) {
  // Page errors are always fatal — uncaught exceptions, unhandled rejections.
  // agent-browser emits "✗ <message>" lines; strip the marker and ignore
  // empty/whitespace-only lines (phantom markers with no actual error text).
  const pageErrorLines = errorOutput
    .split('\n')
    .map((line) => line.replace(/^✗\s*/, '').trim())
    .filter(Boolean)
  if (pageErrorLines.length > 0) {
    throw new Error(
      `Page errors detected on ${context}:\n${pageErrorLines.join('\n')}`,
    )
  }

  // Console errors: look for error-level console output.
  // agent-browser console output format: lines with severity prefixes.
  // We check for "error" markers that indicate console.error() calls.
  const consoleLines = consoleOutput.split('\n').filter(Boolean)
  const errorLines = consoleLines.filter((line) => {
    const lower = line.toLowerCase()
    return (
      lower.includes('error') ||
      lower.includes('uncaught') ||
      lower.includes('unhandled') ||
      lower.includes('typeerror') ||
      lower.includes('referenceerror') ||
      lower.includes('syntaxerror') ||
      lower.includes('rangeerror') ||
      lower.includes('cannot read') ||
      lower.includes('is not a function') ||
      lower.includes('is not defined') ||
      lower.includes('failed to')
    )
  })

  if (errorLines.length > 0) {
    throw new Error(
      `Console errors detected on ${context}:\n${errorLines.join('\n')}`,
    )
  }
}

function assertAppRendered(appHtml: string, appText: string, context: string) {
  if (appHtml.length === 0) {
    throw new Error(
      `#app is empty on ${context} — client bundle crashed or failed to render`,
    )
  }
  if (appText.trim().length === 0) {
    throw new Error(
      `#app has no text content on ${context} — component rendered nothing`,
    )
  }
}

beforeAll(() => {
  if (!SMOKE_ENABLED) return
  // Ensure agent-browser is available
  try {
    execFileSync('agent-browser', ['--version'], {
      encoding: 'utf8',
      timeout: 5000,
    })
  } catch {
    throw new Error(
      'agent-browser CLI not found. Install with: npm i -g agent-browser && agent-browser install',
    )
  }
})

afterEach(() => {
  if (!SMOKE_ENABLED) return
  // Close browser between tests to get clean console state
  try {
    browserExec(['close'], 10000)
  } catch {
    // ignore close errors
  }
})

afterAll(() => {
  if (!SMOKE_ENABLED) return
  // Final cleanup — close any lingering browser
  try {
    browserExec(['close', '--all'], 10000)
  } catch {
    // ignore
  }
  // Lakebed deploys expire automatically; no explicit teardown needed.
  // Log deployed URLs for manual inspection if needed.
  for (const app of deployedApps) {
    console.log(
      `[lakebed-e2e] deployed: ${app.url} (deployId: ${app.deployId})`,
    )
  }
})

describe('lakebed e2e deploy smoke — FashionStoreFaq malformed props', () => {
  test('deploys and renders without ANY console/page errors when LLM emits {question, answer}', async () => {
    // Exact malformed source from crashed session k57f7j6b41razt4ta9jg1vwrqh89y5x2
    const source = `home_faq = FashionStoreFaq("Questions", "Common Inquiries", [{"question":"How long does coffee stay fresh?","answer":"Properly stored, 6 months."},{"question":"What is the difference between roasts?","answer":"Roasting time and temperature affect flavor and aroma."},{"question":"Where are allergen info?","answer":"Ingredient lists at the bottom of each product page."}])
root = home_faq`

    const app = await deployApp(source, `e2e-faq-malformed-${Date.now()}`)
    expect(app.url).toMatch(/\.lakebed\.app$/)

    const { consoleOutput, errorOutput, appHtml, appText } =
      await loadAndInspect(app.url)

    // 1. #app must be populated — client bundle didn't crash
    assertAppRendered(appHtml, appText, app.url)

    // 2. ZERO page errors — no uncaught exceptions
    // 3. ZERO console errors — from ANY source (our component, lakebed, browser)
    assertNoBrowserErrors(consoleOutput, errorOutput, app.url)

    // 4. Content must render — the LLM-generated questions/answers should appear
    //    (normalized from question→q, answer string→a array by FashionStoreFaq)
    expect(appText).toContain('How long does coffee stay fresh?')
    expect(appText).toContain('Properly stored, 6 months.')
    expect(appText).toContain('What is the difference between roasts?')
    expect(appText).toContain('Roasting time and temperature affect flavor')
    expect(appText).toContain('Where are allergen info?')
    expect(appText).toContain(
      'Ingredient lists at the bottom of each product page',
    )
  }, 120000)

  test('deploys and renders correct {q, a} schema props without regression', async () => {
    const source = `home_faq = FashionStoreFaq("FAQ", "Test FAQ", [{"q":"Is this a test?","a":["Yes it is.","Second paragraph."]}])
root = home_faq`

    const app = await deployApp(source, `e2e-faq-correct-${Date.now()}`)
    expect(app.url).toMatch(/\.lakebed\.app$/)

    const { consoleOutput, errorOutput, appHtml, appText } =
      await loadAndInspect(app.url)

    assertAppRendered(appHtml, appText, app.url)
    assertNoBrowserErrors(consoleOutput, errorOutput, app.url)

    expect(appText).toContain('Is this a test?')
    expect(appText).toContain('Yes it is.')
    expect(appText).toContain('Second paragraph.')
  }, 120000)
})

describe('lakebed e2e deploy smoke — default props', () => {
  test('deploys and renders FashionStoreFaq with default props without errors', async () => {
    // Minimal source — component uses its own defaults
    const source = `root = FashionStoreFaq()`

    const app = await deployApp(source, `e2e-faq-default-${Date.now()}`)
    expect(app.url).toMatch(/\.lakebed\.app$/)

    const { consoleOutput, errorOutput, appHtml, appText } =
      await loadAndInspect(app.url)

    assertAppRendered(appHtml, appText, app.url)
    assertNoBrowserErrors(consoleOutput, errorOutput, app.url)

    // Default heading should render
    expect(appText).toContain('Common Inquiries')
  }, 120000)
})
