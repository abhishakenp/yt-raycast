#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split('=')
    return [key, rest.join('=') || '1']
  }),
)

const baseUrl = (
  args.get('--base-url') ??
  process.env.SHIP_FAST_BASE_URL ??
  'http://localhost:3000'
).replace(/\/$/, '')
const timeoutMs = Number(args.get('--timeout-ms') ?? 90000)
const ownerSecret = `owner-${Date.now()}`
const prompt = `Restored route verifier ${Date.now()}`

if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
  throw new Error('--timeout-ms must be at least 1000')
}

const session = convexRun('sessions:create', {
  prompt,
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
  isPrivate: false,
  workspace: `workspace_verify_routes_${Date.now()}`,
  anonymousOwnerSecret: ownerSecret,
  anonymousClientId: `anon-verify-routes-${Date.now()}`,
})
const sessionId = session.sessionId
assert(
  typeof sessionId === 'string',
  'sessions:create did not return sessionId',
)

convexRun('internal.sessions.completeGeneration', {
  sessionId,
  html: htmlFor(prompt),
  openUiSource: `$page = "Home"\nroot = Text(${JSON.stringify(prompt)})`,
  siteSpecJson: JSON.stringify({
    projectName: prompt,
    hero: { headline: prompt },
    pages: [{ id: 'home', title: prompt, description: 'Route verifier page' }],
  }),
  tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
  elapsed: 1234,
})

const sessionResponse = await requestJson(`/api/sessions/${sessionId}`)
assert(
  sessionResponse.status === 200,
  `session route returned ${sessionResponse.status}`,
)
assert(
  sessionResponse.json.sessionId === sessionId,
  'session route returned wrong sessionId',
)
assert(
  sessionResponse.json.status === 'preview_ready',
  'session route did not report preview_ready',
)
assertNoBackendLeak(sessionResponse.body)

const stream = await requestText(`/api/sessions/${sessionId}/stream`)
assert(stream.status === 200, `stream route returned ${stream.status}`)
assert(
  stream.contentType.includes('text/event-stream'),
  'stream route was not SSE',
)
assert(
  stream.body.includes('event: preview_ready'),
  'stream did not replay preview_ready',
)
assert(
  stream.body.includes('event: replay_complete'),
  'stream did not replay replay_complete',
)
assertNoBackendLeak(stream.body)

const targetsBefore = convexRun('sessions:getExportTargets', {
  lookup: sessionId,
})
assert(
  targetsBefore.previewReady === true,
  'export targets did not see ready preview',
)
assert(
  Array.isArray(targetsBefore.targets),
  'export targets did not return targets',
)

const editedPrompt = `${prompt} edited`
const edit = await requestJson(
  `/api/sessions/${sessionId}/preview-inline-text`,
  {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ship-fast-owner-secret': ownerSecret,
    },
    body: JSON.stringify({ beforeText: prompt, afterText: editedPrompt }),
  },
)
assert(edit.status === 200, `inline text edit returned ${edit.status}`)
assert(edit.json.saved === true, 'inline text edit did not save')
assert(
  edit.json.previewVersion === 2,
  'inline text edit did not create preview version 2',
)

const historyAfterEdit = await waitForJson(
  `/api/sessions/${sessionId}/history`,
  (payload) =>
    Array.isArray(payload.history) &&
    payload.history.some((item) => item.version === 1) &&
    payload.history.some((item) => item.version === 2),
)
assert(
  historyAfterEdit.history.map((item) => item.version).includes(2),
  'history did not include edited version',
)

const restore = await requestJson(
  `/api/sessions/${sessionId}/history/1/restore`,
  {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ship-fast-owner-secret': ownerSecret,
    },
    body: JSON.stringify({ anonymousOwnerSecret: ownerSecret }),
  },
)
assert(restore.status === 200, `history restore returned ${restore.status}`)
assert(
  restore.json.previewVersion === 3,
  'restore did not create preview version 3',
)

const exportResponse = await requestJson(`/api/sessions/${sessionId}/export`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-ship-fast-owner-secret': ownerSecret,
  },
  body: JSON.stringify({ target: 'html', anonymousOwnerSecret: ownerSecret }),
})
assert(
  exportResponse.status === 200,
  `export route returned ${exportResponse.status}`,
)
assert(exportResponse.json.status === 'ready', 'export did not become ready')
assert(
  exportResponse.json.previewVersion === 3,
  'export did not use current preview version',
)
assert(
  typeof exportResponse.json.downloadUrl === 'string',
  'export did not return downloadUrl',
)

const download = await requestText(exportResponse.json.downloadUrl)
assert(download.status === 200, `download route returned ${download.status}`)
assert(
  download.contentType.includes('application/zip'),
  'download route did not return ZIP',
)
assert(download.body.length > 100, 'download ZIP was unexpectedly small')

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl,
      sessionId,
      previewVersions: [1, 2, 3],
      exportedTarget: exportResponse.json.target,
      downloadUrl: exportResponse.json.downloadUrl,
      streamBytes: stream.body.length,
    },
    null,
    2,
  ),
)

function htmlFor(headline) {
  return `<html><head><title>${escapeHtml(headline)}</title></head><body><main><h1 data-cms="field:hero.headline type:text">${escapeHtml(headline)}</h1><p>Route verifier page.</p></main></body></html>`
}

function convexRun(functionName, payload) {
  const output = execFileSync(
    'bunx',
    ['convex', 'run', functionName, JSON.stringify(payload)],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: timeoutMs,
    },
  ).trim()
  return parseJson(output || 'null', `Convex ${functionName}`)
}

async function waitForJson(path, predicate) {
  const startedAt = Date.now()
  let lastPayload = null
  while (Date.now() - startedAt < timeoutMs) {
    const response = await requestJson(path)
    assert(response.status === 200, `${path} returned ${response.status}`)
    lastPayload = response.json
    if (predicate(response.json)) return response.json
    await sleep(250)
  }
  throw new Error(
    `Timed out waiting for ${path}; last payload: ${JSON.stringify(lastPayload)}`,
  )
}

async function requestJson(path, init) {
  const text = await requestText(path, init)
  return { ...text, json: parseJson(text.body, path) }
}

async function requestText(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { accept: '*/*', ...init?.headers },
    signal: AbortSignal.timeout(timeoutMs),
    ...init,
  }).catch((error) => {
    throw new Error(
      `Unable to reach ${baseUrl}${path}: ${error instanceof Error ? error.message : String(error)}`,
    )
  })
  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/zip')
    ? Buffer.from(await response.arrayBuffer()).toString('binary')
    : await response.text()
  return {
    status: response.status,
    contentType,
    headers: response.headers,
    body,
  }
}

function parseJson(value, label) {
  try {
    return JSON.parse(value)
  } catch (error) {
    throw new Error(
      `${label} did not return valid JSON: ${error instanceof Error ? error.message : String(error)}\n${String(value).slice(0, 500)}`,
    )
  }
}

function assertNoBackendLeak(body) {
  assert(!body.includes('Cannot GET'), 'route is not registered')
  assert(!body.includes('FunctionPathNotFound'), 'Convex function missing')
  assert(!body.includes('fetch failed'), 'Convex backend unreachable')
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
