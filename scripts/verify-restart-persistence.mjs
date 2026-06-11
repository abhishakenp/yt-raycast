#!/usr/bin/env node
import { execFileSync, spawn } from 'node:child_process'

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split('=')
    return [key, rest.join('=') || '1']
  }),
)

const port = Number(args.get('--port') ?? 3017)
const host = args.get('--host') ?? '127.0.0.1'
const timeoutMs = Number(args.get('--timeout-ms') ?? 120000)
const baseUrl = `http://${host}:${port}`
const ownerSecret = `owner-restart-${Date.now()}`
const prompt = `Restart persistence verifier ${Date.now()}`

if (!Number.isFinite(port) || port < 1 || port > 65535) {
  throw new Error('--port must be a valid TCP port')
}

if (!Number.isFinite(timeoutMs) || timeoutMs < 10000) {
  throw new Error('--timeout-ms must be at least 10000')
}

let server = null

try {
  server = await startServer('first')

  const session = convexRun('sessions:create', {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: `workspace_verify_restart_${Date.now()}`,
    anonymousOwnerSecret: ownerSecret,
    anonymousClientId: `anon-verify-restart-${Date.now()}`,
  })
  const sessionId = session.sessionId
  assert(typeof sessionId === 'string', 'sessions:create did not return sessionId')

  convexRun('internal.sessions.completeGeneration', {
    sessionId,
    html: htmlFor(prompt),
    openUiSource: `$page = "Home"\nroot = Text(${JSON.stringify(prompt)})`,
    siteSpecJson: JSON.stringify({
      projectName: prompt,
      hero: { headline: prompt },
      pages: [{ id: 'home', title: prompt, description: 'Restart persistence verifier page' }],
    }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 2468,
  })

  await assertSessionReady(sessionId, 'before restart')
  assertPreviewContains(sessionId, prompt, 'before restart')
  await assertStreamReplay(sessionId, 'before restart')

  const editedPrompt = `${prompt} after edit`
  const edit = await requestJson(`/api/sessions/${sessionId}/preview-inline-text`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ship-fast-owner-secret': ownerSecret,
    },
    body: JSON.stringify({ beforeText: prompt, afterText: editedPrompt }),
  })
  assert(edit.status === 200, `pre-restart inline edit returned ${edit.status}`)
  assert(edit.json.previewVersion === 2, 'pre-restart edit did not create preview version 2')
  await assertHistoryVersions(sessionId, [1, 2], 'before restart')

  await stopServer(server)
  server = await startServer('second')

  await assertSessionReady(sessionId, 'after restart')
  assertPreviewContains(sessionId, editedPrompt, 'after restart')
  await assertStreamReplay(sessionId, 'after restart')
  await assertHistoryVersions(sessionId, [1, 2], 'after restart')

  const targets = await requestJson(`/api/sessions/${sessionId}/export-targets`)
  assert(targets.status === 200, `post-restart export-targets returned ${targets.status}`)
  assert(targets.json.previewReady === true, 'post-restart export targets did not see ready preview')
  assert(Array.isArray(targets.json.targets), 'post-restart export targets did not return targets')

  const restore = await requestJson(`/api/sessions/${sessionId}/history/1/restore`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ship-fast-owner-secret': ownerSecret,
    },
    body: JSON.stringify({ anonymousOwnerSecret: ownerSecret }),
  })
  assert(restore.status === 200, `post-restart restore returned ${restore.status}`)
  assert(restore.json.previewVersion === 3, 'post-restart restore did not create preview version 3')
  await assertHistoryVersions(sessionId, [1, 2, 3], 'after post-restart restore')

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        sessionId,
        restarted: true,
        previewVersions: [1, 2, 3],
      },
      null,
      2,
    ),
  )
} finally {
  if (server) await stopServer(server)
}

async function startServer(label) {
  const child = spawn(
    'bunx',
    ['vite', 'dev', '--host', host, '--port', String(port), '--strictPort'],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  const output = []
  child.stdout.on('data', (chunk) => output.push(chunk.toString()))
  child.stderr.on('data', (chunk) => output.push(chunk.toString()))

  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(
        `Vite ${label} server exited before readiness with code ${child.exitCode}:\n${output.join('').slice(-4000)}`,
      )
    }
    try {
      const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1000) })
      if (response.status < 500) return { child, output }
    } catch {
      // Keep waiting until Vite binds the port.
    }
    await sleep(250)
  }
  throw new Error(`Timed out waiting for Vite ${label} server:\n${output.join('').slice(-4000)}`)
}

async function stopServer(serverHandle) {
  const { child } = serverHandle
  if (child.exitCode !== null) return
  child.kill('SIGTERM')
  const startedAt = Date.now()
  while (child.exitCode === null && Date.now() - startedAt < 10000) {
    await sleep(100)
  }
  if (child.exitCode === null) child.kill('SIGKILL')
}

async function assertSessionReady(sessionId, label) {
  const response = await requestJson(`/api/sessions/${sessionId}`)
  assert(response.status === 200, `${label} session route returned ${response.status}`)
  assert(response.json.sessionId === sessionId, `${label} session route returned wrong sessionId`)
  assert(response.json.status === 'preview_ready', `${label} session did not report preview_ready`)
}

function assertPreviewContains(sessionId, expectedText, label) {
  const preview = convexRun('sessions:getPublicPreview', { lookup: sessionId })
  assert(typeof preview.html === 'string', `${label} public preview did not include HTML`)
  assert(preview.html.includes(expectedText), `${label} public preview did not include expected text`)
}

async function assertStreamReplay(sessionId, label) {
  const stream = await requestText(`/api/sessions/${sessionId}/stream`)
  assert(stream.status === 200, `${label} stream route returned ${stream.status}`)
  assert(stream.contentType.includes('text/event-stream'), `${label} stream was not SSE`)
  assert(stream.body.includes('event: preview_ready'), `${label} stream did not replay preview_ready`)
  assert(stream.body.includes('event: replay_complete'), `${label} stream did not replay replay_complete`)
}

async function assertHistoryVersions(sessionId, versions, label) {
  const history = await requestJson(`/api/sessions/${sessionId}/history`)
  assert(history.status === 200, `${label} history route returned ${history.status}`)
  const actual = Array.isArray(history.json.history)
    ? history.json.history.map((item) => item.version)
    : []
  for (const version of versions) {
    assert(actual.includes(version), `${label} history missing version ${version}`)
  }
}

function convexRun(functionName, payload) {
  const output = execFileSync('bunx', ['convex', 'run', functionName, JSON.stringify(payload)], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: timeoutMs,
  }).trim()
  return parseJson(output || 'null', `Convex ${functionName}`)
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
  const body = await response.text()
  return { status: response.status, contentType, headers: response.headers, body }
}

function htmlFor(headline) {
  return `<html><head><title>${escapeHtml(headline)}</title></head><body><main><h1 data-cms="field:hero.headline type:text">${escapeHtml(headline)}</h1><p>Restart persistence verifier page.</p></main></body></html>`
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
