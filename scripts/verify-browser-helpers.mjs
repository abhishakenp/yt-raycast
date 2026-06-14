import { execFileSync } from 'node:child_process'

export const DEFAULT_BRAVE =
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'

export const parseArgs = () =>
  new Map(
    process.argv.slice(2).map((arg) => {
      const [key, ...rest] = arg.split('=')
      return [key, rest.join('=') || '1']
    }),
  )

export const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

export const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

export const sleep = (ms) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

export const parseJson = (value, label) => {
  try {
    return JSON.parse(value)
  } catch (error) {
    throw new Error(
      `${label} did not return valid JSON: ${error instanceof Error ? error.message : String(error)}\n${String(value).slice(0, 500)}`,
    )
  }
}

export const convexRun = (functionName, payload, timeoutMs) => {
  const envFileArgs =
    process.env.SHIP_FAST_CONVEX_ENV_FILE === undefined
      ? []
      : ['--env-file', process.env.SHIP_FAST_CONVEX_ENV_FILE]
  const output = execFileSync(
    'bunx',
    ['convex', 'run', ...envFileArgs, functionName, JSON.stringify(payload)],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: timeoutMs,
    },
  ).trim()
  return parseJson(output || 'null', `Convex ${functionName}`)
}

export const createReadySession = ({
  prompt,
  ownerSecret,
  timeoutMs,
  html,
  openUiSource,
  siteSpecJson,
}) => {
  const stamp = Date.now()
  const created = convexRun(
    'sessions:create',
    {
      prompt,
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: `workspace_verify_browser_${stamp}`,
      anonymousOwnerSecret: ownerSecret,
      anonymousClientId: `anon-verify-browser-${stamp}`,
    },
    timeoutMs,
  )
  assert(typeof created.sessionId === 'string', 'sessions:create did not return sessionId')

  convexRun(
    'internal.sessions.completeGeneration',
    {
      sessionId: created.sessionId,
      html,
      openUiSource,
      siteSpecJson,
      tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
      elapsed: 1000,
    },
    timeoutMs,
  )

  return created.sessionId
}

export const createAgentBrowser = ({
  sessionName,
  timeoutMs,
  browserExecutable = DEFAULT_BRAVE,
}) => {
  const agentBrowser = (command, options = {}) => {
    const fullCommand = ['--session', sessionName]
    if (options.headed !== false) {
      fullCommand.push('--headed', '--executable-path', browserExecutable)
    }
    fullCommand.push(...command)
    return execFileSync('agent-browser', fullCommand, {
      encoding: 'utf8',
      stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
      timeout: options.timeoutMs ?? Math.min(timeoutMs, 30000),
    }).trim()
  }

  agentBrowser.closeAll = () => {
    try {
      agentBrowser(['close', '--all'], {
        headed: false,
        stdio: ['ignore', 'ignore', 'ignore'],
        timeoutMs: 10000,
      })
    } catch {
      // Stale sessions are fine.
    }
  }

  agentBrowser.evalJson = (source, timeoutOverride) =>
    parseJson(
      agentBrowser(['eval', source], {
        timeoutMs: timeoutOverride ?? Math.min(timeoutMs, 30000),
      }),
      'agent-browser eval',
    )

  return agentBrowser
}

export const openDashboard = ({
  agentBrowser,
  baseUrl,
  sessionId,
  ownerSecret,
}) => {
  agentBrowser(['open', `${baseUrl}/generate/${sessionId}`], {
    timeoutMs: 30000,
  })
  agentBrowser(['wait', '#dashboard-wrap'], { timeoutMs: 30000 })
  agentBrowser([
    'eval',
    `localStorage.setItem(${JSON.stringify(`ship-fast:v2:owner-secret:${sessionId}`)}, ${JSON.stringify(ownerSecret)})`,
  ])
}

export const waitForBrowserState = ({
  agentBrowser,
  timeoutMs,
  predicate,
  label,
  intervalMs = 500,
}) => {
  const startedAt = Date.now()
  let lastState = null
  while (Date.now() - startedAt < timeoutMs) {
    lastState = agentBrowser.evalJson(`(${predicate})()`)
    if (lastState?.ok === true) return lastState
    sleep(intervalMs)
  }
  throw new Error(
    `Timed out waiting for ${label}; last state: ${JSON.stringify(lastState)}`,
  )
}

export const getDashboardStatePredicate = (expectedText) => `() => {
  const stage = document.querySelector('#preview-stage');
  const text = stage?.innerText || '';
  const urlText = document.querySelector('#url-text')?.textContent?.trim() || '';
  const loading = document.querySelector('#preview-loading');
  const loadingHidden =
    !loading ||
    loading.hidden ||
    loading.className.includes('hidden') ||
    getComputedStyle(loading).display === 'none';
  return {
    ok: loadingHidden && text.includes(${JSON.stringify(expectedText)}),
    text: text.slice(0, 800),
    urlText,
    loadingHidden,
    location: location.href,
  };
}`
