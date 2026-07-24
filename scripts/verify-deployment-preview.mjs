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
const slug = args.get('--slug') ?? `verify-preview-${Date.now()}`
const prompt = `Deployment preview verifier ${Date.now()}`

if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
  throw new Error('--timeout-ms must be at least 1000')
}

const session = convexRun('sessions:create', {
  prompt,
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
  isPrivate: false,
  workspace: `workspace_verify_deployment_${Date.now()}`,
  anonymousOwnerSecret: ownerSecret,
  anonymousClientId: `anon-verify-deployment-${Date.now()}`,
})
const sessionId = session.sessionId
assert(
  typeof sessionId === 'string',
  'sessions:create did not return sessionId',
)

convexRun('internal.sessions.completeGeneration', {
  sessionId,
  html: `<html><head><title>${escapeHtml(prompt)}</title></head><body><main><h1>${escapeHtml(prompt)}</h1><p>Deployment verifier page.</p></main></body></html>`,
  openUiSource: `$page = "Home"\nroot = Text(${JSON.stringify(prompt)})`,
  siteSpecJson: JSON.stringify({
    projectName: prompt,
    hero: { headline: prompt },
    pages: [
      { id: 'home', title: prompt, description: 'Deployment verifier page' },
    ],
  }),
  tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
  elapsed: 1500,
})

const publish = convexRun('sessions:publishPreview', {
  sessionId,
  anonymousOwnerSecret: ownerSecret,
  requestedSlug: slug,
})
assert(publish.slug === slug, 'publishPreview returned a different slug')
assert(publish.status === 'ready', 'publishPreview did not return ready status')
assert(
  publish.url === `https://${slug}.ship-fast.ai`,
  'publishPreview returned wrong public URL',
)

const status = convexRun('sessions:getDeploymentStatus', { sessionId })
assert(status.slug === slug, 'getDeploymentStatus returned wrong slug')
assert(status.status === 'ready', 'getDeploymentStatus did not return ready')
assert(
  status.previewVersion === 1,
  'deployment status did not pin preview version 1',
)

const preview = await requestText(`/preview/${encodeURIComponent(slug)}`)
assert(preview.status === 200, `/preview/${slug} returned ${preview.status}`)
assert(
  preview.contentType.includes('text/html'),
  'preview route did not return HTML',
)
assert(
  preview.headers.get('x-ship-fast-deployment') === slug,
  'deployment header mismatch',
)
assert(
  preview.headers.get('x-ship-fast-preview-version') === '1',
  'preview version header mismatch',
)
assert(
  preview.body.includes(prompt),
  'preview HTML did not contain generated prompt',
)
assert(
  preview.body.includes(`https://${slug}.ship-fast.ai/`),
  'preview HTML did not include canonical public URL',
)
assertNoBackendLeak(preview.body)

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl,
      sessionId,
      slug,
      url: publish.url,
      previewVersion: status.previewVersion,
      htmlBytes: preview.body.length,
    },
    null,
    2,
  ),
)

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

async function requestText(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { accept: '*/*' },
    signal: AbortSignal.timeout(timeoutMs),
  }).catch((error) => {
    throw new Error(
      `Unable to reach ${baseUrl}${path}: ${error instanceof Error ? error.message : String(error)}`,
    )
  })
  return {
    status: response.status,
    contentType: response.headers.get('content-type') ?? '',
    headers: response.headers,
    body: await response.text(),
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

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
