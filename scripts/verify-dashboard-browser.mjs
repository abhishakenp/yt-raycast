#!/usr/bin/env node
import {
  assert,
  convexRun,
  createAgentBrowser,
  createReadySession,
  escapeHtml,
  getDashboardStatePredicate,
  openDashboard,
  parseArgs,
  waitForBrowserState,
} from './verify-browser-helpers.mjs'

const args = parseArgs()
const baseUrl = (
  args.get('--base-url') ??
  process.env.SHIP_FAST_BASE_URL ??
  'http://localhost:3000'
).replace(/\/$/, '')
const timeoutMs = Number(args.get('--timeout-ms') ?? 180000)
const stamp = Date.now()
const ownerSecret = `owner-dashboard-${stamp}`
const prompt = `Dashboard browser verifier ${stamp}`
const sessionName =
  args.get('--browser-session') ?? `ship-fast-dashboard-${stamp}`
const screenshotPath =
  args.get('--screenshot') ?? `/tmp/ship-fast-dashboard-browser-${stamp}.png`
const browserExecutable =
  args.get('--executable-path') ?? process.env.AGENT_BROWSER_EXECUTABLE_PATH

const agentBrowser = createAgentBrowser({
  sessionName,
  timeoutMs,
  browserExecutable,
})
const sessionId = createReadySession({
  prompt,
  ownerSecret,
  timeoutMs,
  html: `<html><body><main><h1>${escapeHtml(prompt)}</h1><p>Dashboard publish verifier.</p></main></body></html>`,
  openUiSource: `$page = "Home"\nroot = Text(${JSON.stringify(prompt)})`,
  siteSpecJson: JSON.stringify({
    projectName: prompt,
    hero: { headline: prompt },
  }),
})

try {
  agentBrowser.closeAll()
  openDashboard({ agentBrowser, baseUrl, sessionId, ownerSecret })
  waitForBrowserState({
    agentBrowser,
    timeoutMs,
    label: 'initial dashboard preview',
    predicate: getDashboardStatePredicate(prompt),
  })

  agentBrowser.evalJson(`(() => {
    const button = [...document.querySelectorAll('button')].find((candidate) =>
      /Publish preview|Republish latest preview/i.test(candidate.getAttribute('aria-label') || candidate.textContent || '')
    );
    if (!(button instanceof HTMLButtonElement)) return { ok: false, reason: 'publish button not found' };
    button.click();
    return { ok: true };
  })()`)

  const published = waitForBrowserState({
    agentBrowser,
    timeoutMs,
    label: 'published URL in dashboard',
    predicate: `() => {
      const urlText = document.querySelector('#url-text')?.textContent?.trim() || '';
      return { ok: /^https:\\/\\/[^/]+\\.ship-fast\\.io$/.test(urlText), urlText };
    }`,
  })

  agentBrowser(['reload'], { timeoutMs: 30000 })
  waitForBrowserState({
    agentBrowser,
    timeoutMs,
    label: 'published URL after reload',
    predicate: `() => {
      const urlText = document.querySelector('#url-text')?.textContent?.trim() || '';
      const text = document.querySelector('#preview-stage')?.innerText || '';
      return { ok: urlText === ${JSON.stringify(published.urlText)} && text.includes(${JSON.stringify(prompt)}), urlText, text: text.slice(0, 500) };
    }`,
  })
  agentBrowser(['screenshot', screenshotPath], { timeoutMs: 30000 })

  const deployment = convexRun(
    'sessions:getDeploymentStatus',
    { sessionId },
    timeoutMs,
  )
  assert(deployment?.status === 'ready', 'deployment status was not ready')
  assert(
    deployment?.url === published.urlText,
    'deployment URL did not match dashboard URL',
  )

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        sessionId,
        sessionName,
        screenshotPath,
        publishedUrl: published.urlText,
        deploymentPreviewVersion: deployment.previewVersion,
      },
      null,
      2,
    ),
  )
} catch (error) {
  try {
    agentBrowser(['screenshot', screenshotPath], { timeoutMs: 10000 })
  } catch {}
  console.error(
    JSON.stringify(
      {
        ok: false,
        reason: error instanceof Error ? error.message : String(error),
        sessionId,
        sessionName,
        screenshotPath,
      },
      null,
      2,
    ),
  )
  process.exit(1)
}
