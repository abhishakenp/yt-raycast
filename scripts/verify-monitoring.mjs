#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split('=')
    return [key, rest.join('=') || '1']
  }),
)

const timeoutMs = Number(args.get('--timeout-ms') ?? 90000)
const prompt = `Monitoring verifier ${Date.now()}`

if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
  throw new Error('--timeout-ms must be at least 1000')
}

const session = convexRun('sessions:create', {
  prompt,
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
  isPrivate: false,
  workspace: `workspace_verify_monitoring_${Date.now()}`,
  anonymousClientId: `anon-verify-monitoring-${Date.now()}`,
})
const sessionId = session.sessionId
assert(typeof sessionId === 'string', 'sessions:create did not return sessionId')

convexRun('internal.sessions.completeGeneration', {
  sessionId,
  html: `<html><body><main><h1>${escapeHtml(prompt)}</h1></main></body></html>`,
  openUiSource: `$page = "Home"\nroot = Text(${JSON.stringify(prompt)})`,
  siteSpecJson: JSON.stringify({
    projectName: prompt,
    hero: { headline: prompt },
    pages: [{ id: 'home', title: prompt, description: 'Monitoring verifier page' }],
  }),
  tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
  elapsed: 4321,
})

const metrics = convexRun('sessions:getUsageMetrics', { sessionId })
assert(metrics.count >= 1, 'usage metrics did not record completion')
assert(metrics.totalElapsedMs >= 4321, 'usage metrics did not record elapsed time')
assert(metrics.byProvider['ship-fast-engine'] >= 1, 'usage metrics missing ship-fast-engine provider')
assert(metrics.byEventType.run_completed >= 1, 'usage metrics missing run_completed event')

const stream = convexRun('sessions:getEventStream', { lookup: sessionId })
const events = Array.isArray(stream.events) ? stream.events : []
assert(events.some((event) => event.eventType === 'preview_ready'), 'event stream missing preview_ready')
const completed = events.find((event) => event.eventType === 'run_completed')
assert(completed, 'event stream missing run_completed')
assert(completed.elapsedMs === 4321, 'run_completed did not preserve elapsedMs')
assert(completed.cost === 0, 'run_completed did not preserve zero cost')
assert(completed.provider === 'ship-fast-engine', 'run_completed provider mismatch')

const sessionApi = convexRun('sessions:getSessionApiResponse', { lookup: sessionId })
assert(sessionApi.status === 'preview_ready', 'session API did not report preview_ready')
assert(sessionApi.elapsed === 4321, 'session API did not preserve elapsed')
assert(sessionApi.cost === 0, 'session API did not preserve zero cost')

console.log(
  JSON.stringify(
    {
      ok: true,
      sessionId,
      metrics: {
        count: metrics.count,
        totalElapsedMs: metrics.totalElapsedMs,
        totalCost: metrics.totalCost,
        byProvider: metrics.byProvider,
        byEventType: metrics.byEventType,
      },
      events: {
        count: events.length,
        hasPreviewReady: true,
        runCompleted: {
          elapsedMs: completed.elapsedMs,
          cost: completed.cost,
          provider: completed.provider,
        },
      },
    },
    null,
    2,
  ),
)

function convexRun(functionName, payload) {
  const output = execFileSync('bunx', ['convex', 'run', functionName, JSON.stringify(payload)], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: timeoutMs,
  }).trim()
  return parseJson(output || 'null', `Convex ${functionName}`)
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

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
