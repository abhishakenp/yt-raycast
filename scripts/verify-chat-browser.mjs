#!/usr/bin/env node
import {
  assert,
  convexRun,
  createAgentBrowser,
  createReadySession,
  getDashboardStatePredicate,
  openDashboard,
  parseArgs,
  waitForBrowserState,
} from './verify-browser-helpers.mjs'

const args = parseArgs()
const baseUrl = (args.get('--base-url') ?? process.env.SHIP_FAST_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const timeoutMs = Number(args.get('--timeout-ms') ?? 180000)
const stamp = Date.now()
const ownerSecret = `owner-chat-browser-${stamp}`
const sessionName = args.get('--browser-session') ?? `ship-fast-chat-${stamp}`
const screenshotPath = args.get('--screenshot') ?? `/tmp/ship-fast-chat-browser-${stamp}.png`
const browserExecutable = args.get('--executable-path') ?? process.env.AGENT_BROWSER_EXECUTABLE_PATH
const initialHeadline = 'Old headline'
const refinedHeadline = 'Launch pastries faster'

const agentBrowser = createAgentBrowser({ sessionName, timeoutMs, browserExecutable })
const sessionId = createReadySession({
  prompt: `Chat browser verifier ${stamp}`,
  ownerSecret,
  timeoutMs,
  html: `<html><body><main><h1>${initialHeadline}</h1><a href="/start">Start now</a></main></body></html>`,
  openUiSource: `$page = "Home"\nroot = Text(${JSON.stringify(initialHeadline)})\ncta = Button("Start now")`,
  siteSpecJson: JSON.stringify({
    brand: 'Chat browser verifier',
    hero: { headline: initialHeadline, ctaLabel: 'Start now' },
    sections: [],
  }),
})

try {
  agentBrowser.closeAll()
  openDashboard({ agentBrowser, baseUrl, sessionId, ownerSecret })
  waitForBrowserState({
    agentBrowser,
    timeoutMs,
    label: 'initial chat dashboard preview',
    predicate: getDashboardStatePredicate(initialHeadline),
  })

  agentBrowser.evalJson(`(() => {
    const button = document.querySelector('[data-rail-action="chat"]');
    if (!(button instanceof HTMLButtonElement)) return { ok: false, reason: 'chat rail button missing' };
    button.click();
    return { ok: true };
  })()`)
  waitForBrowserState({
    agentBrowser,
    timeoutMs,
    label: 'visible chat rail',
    predicate: `() => {
      const input = document.querySelector('#chat-input');
      return { ok: input instanceof HTMLInputElement, hasInput: !!input, text: document.body.innerText.slice(0, 500) };
    }`,
  })
  const chatResult = agentBrowser.evalJson(`(async () => {
    const input = document.querySelector('#chat-input');
    if (!(input instanceof HTMLInputElement)) return { ok: false, reason: 'chat input missing' };
    const content = ${JSON.stringify(`Change headline to "${refinedHeadline}"`)};
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(input, content);
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: content }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    const response = await fetch(${JSON.stringify(`/api/sessions/${sessionId}/chat`)}, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        anonymousOwnerSecret: ${JSON.stringify(ownerSecret)},
        content,
      }),
    });
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  })()`, timeoutMs)
  assert(chatResult.ok === true, `browser chat route failed: ${JSON.stringify(chatResult)}`)

  waitForBrowserState({
    agentBrowser,
    timeoutMs,
    label: 'chat-refined preview',
    predicate: getDashboardStatePredicate(refinedHeadline),
    intervalMs: 1000,
  })

  agentBrowser(['reload'], { timeoutMs: 30000 })
  waitForBrowserState({
    agentBrowser,
    timeoutMs,
    label: 'chat-refined preview after reload',
    predicate: getDashboardStatePredicate(refinedHeadline),
  })
  agentBrowser(['screenshot', screenshotPath], { timeoutMs: 30000 })

  const view = convexRun('sessions:getGenerationView', { lookup: sessionId }, timeoutMs)
  const messages = convexRun('sessions:listChatMessages', { sessionId }, timeoutMs)
  assert(view.latestPreview?.html?.includes(refinedHeadline), 'Convex preview missing refined headline')
  assert(view.homeModule?.source?.includes(refinedHeadline), 'OpenUI source missing refined headline')
  assert(view.siteSpec?.specJson?.includes(refinedHeadline), 'site spec missing refined headline')
  assert(messages.length >= 2, 'chat messages were not persisted')

  console.log(JSON.stringify({
    ok: true,
    baseUrl,
    sessionId,
    sessionName,
    screenshotPath,
    previewVersion: view.latestPreview?.version,
    chatMessages: messages.length,
    refinedHeadline,
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
