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
const baseUrl = (args.get('--base-url') ?? process.env.SHIP_FAST_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const timeoutMs = Number(args.get('--timeout-ms') ?? 180000)
const stamp = Date.now()
const ownerSecret = `owner-cms-browser-${stamp}`
const sessionName = args.get('--browser-session') ?? `ship-fast-cms-${stamp}`
const screenshotPath = args.get('--screenshot') ?? `/tmp/ship-fast-cms-browser-${stamp}.png`
const browserExecutable = args.get('--executable-path') ?? process.env.AGENT_BROWSER_EXECUTABLE_PATH
const initialHeadline = `CMS browser headline ${stamp}`
const editedHeadline = `CMS edited headline ${stamp}`

const agentBrowser = createAgentBrowser({ sessionName, timeoutMs, browserExecutable })
const sessionId = createReadySession({
  prompt: initialHeadline,
  ownerSecret,
  timeoutMs,
  html: `<html><body><main><h1 data-cms="field:hero.headline type:text">${escapeHtml(initialHeadline)}</h1><p>CMS browser verifier.</p></main></body></html>`,
  openUiSource: `$page = "Home"\nroot = Text(${JSON.stringify(initialHeadline)})`,
  siteSpecJson: JSON.stringify({
    projectName: initialHeadline,
    hero: { headline: initialHeadline },
    pages: [{ id: 'home', title: initialHeadline, description: 'CMS browser verifier' }],
  }),
})

try {
  agentBrowser.closeAll()
  openDashboard({ agentBrowser, baseUrl, sessionId, ownerSecret })
  waitForBrowserState({
    agentBrowser,
    timeoutMs,
    label: 'initial CMS dashboard preview',
    predicate: getDashboardStatePredicate(initialHeadline),
  })

  agentBrowser.evalJson(`(() => {
    const button = document.querySelector('[data-rail-action="cms-studio"]');
    if (!(button instanceof HTMLButtonElement)) return { ok: false, reason: 'CMS rail button missing' };
    button.click();
    return { ok: true };
  })()`)
  waitForBrowserState({
    agentBrowser,
    timeoutMs,
    label: 'visible CMS rail',
    predicate: `() => {
      const field = document.querySelector('[data-cms-field="hero.headline"]');
      return { ok: field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement, hasField: !!field, text: document.body.innerText.slice(0, 500) };
    }`,
  })
  agentBrowser.evalJson(`(() => {
    const input = document.querySelector('[data-cms-field="hero.headline"]');
    const button = document.querySelector('[data-cms-save="hero.headline"]');
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) || !(button instanceof HTMLButtonElement)) {
      return { ok: false, reason: 'CMS controls missing' };
    }
    const value = ${JSON.stringify(editedHeadline)};
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value');
    descriptor?.set?.call(input, value);
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    button.click();
    return { ok: true };
  })()`)

  waitForBrowserState({
    agentBrowser,
    timeoutMs,
    label: 'CMS-edited preview',
    predicate: getDashboardStatePredicate(editedHeadline),
    intervalMs: 1000,
  })

  agentBrowser(['reload'], { timeoutMs: 30000 })
  waitForBrowserState({
    agentBrowser,
    timeoutMs,
    label: 'CMS-edited preview after reload',
    predicate: getDashboardStatePredicate(editedHeadline),
  })
  agentBrowser(['screenshot', screenshotPath], { timeoutMs: 30000 })

  const view = convexRun('sessions:getGenerationView', { lookup: sessionId }, timeoutMs)
  const history = convexRun('sessions:listPreviewHistory', { sessionId }, timeoutMs)
  const cmsContent = convexRun('sessions:listCmsContent', { sessionId }, timeoutMs)
  assert(view.latestPreview?.html?.includes(editedHeadline), 'Convex preview missing CMS edit')
  assert(view.homeModule?.source?.includes(editedHeadline), 'OpenUI source missing CMS edit')
  assert(view.siteSpec?.specJson?.includes(editedHeadline), 'site spec missing CMS edit')
  assert(history.some((item) => item.version === 2), 'preview history missing CMS version 2')
  assert(cmsContent.some((item) => item.field === 'hero.headline' && item.content === editedHeadline), 'CMS content entry missing edited headline')

  console.log(JSON.stringify({
    ok: true,
    baseUrl,
    sessionId,
    sessionName,
    screenshotPath,
    previewVersion: view.latestPreview?.version,
    historyVersions: history.map((item) => item.version),
    editedHeadline,
  }, null, 2))
} catch (error) {
  try {
    agentBrowser(['screenshot', screenshotPath], { timeoutMs: 10000 })
  } catch {}
  console.error(JSON.stringify({
    ok: false,
    reason: error instanceof Error ? error.message : String(error),
    sessionId,
    sessionName,
    screenshotPath,
  }, null, 2))
  process.exit(1)
}
