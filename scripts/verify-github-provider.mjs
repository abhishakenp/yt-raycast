#!/usr/bin/env node
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
const timeoutMs = Number(args.get('--timeout-ms') ?? 180000)
const sessionId =
  args.get('--session-id') ?? process.env.GITHUB_VERIFY_SESSION_ID
const target =
  args.get('--target') ?? process.env.GITHUB_VERIFY_TARGET ?? 'html'
const branch =
  args.get('--branch') ?? process.env.GITHUB_VERIFY_BRANCH ?? 'main'

if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
  throw new Error('--timeout-ms must be at least 1000')
}

assert(sessionId, 'GITHUB_VERIFY_SESSION_ID or --session-id is required')
assert(
  process.env.SHIP_FAST_VERIFY_AUTH_TOKEN,
  'SHIP_FAST_VERIFY_AUTH_TOKEN is required',
)
assert(process.env.GITHUB_VERIFY_TOKEN, 'GITHUB_VERIFY_TOKEN is required')
assert(process.env.GITHUB_VERIFY_REPO, 'GITHUB_VERIFY_REPO is required')

const push = await requestJson(
  `/api/sessions/${encodeURIComponent(sessionId)}/github/push`,
  {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.SHIP_FAST_VERIFY_AUTH_TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      target,
      githubAccessToken: process.env.GITHUB_VERIFY_TOKEN,
      repoFullName: process.env.GITHUB_VERIFY_REPO,
      branch,
    }),
  },
)

assert(
  push.status === 200,
  `GitHub push returned ${push.status}: ${push.body.slice(0, 500)}`,
)
assert(push.json.ok === true, 'GitHub push response did not include ok=true')
assert(
  typeof push.json.commitSha === 'string' && push.json.commitSha.length > 0,
  'GitHub push missing commitSha',
)
assert(
  Array.isArray(push.json.files) && push.json.files.length > 0,
  'GitHub push missing file list',
)

let forbiddenStatus = 'not-run'
if (process.env.GITHUB_VERIFY_NON_OWNER_TOKEN) {
  const forbidden = await requestJson(
    `/api/sessions/${encodeURIComponent(sessionId)}/github/push`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.GITHUB_VERIFY_NON_OWNER_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        target,
        githubAccessToken: process.env.GITHUB_VERIFY_TOKEN,
        repoFullName: process.env.GITHUB_VERIFY_REPO,
        branch,
      }),
    },
  )
  assert(
    forbidden.status === 403,
    `non-owner GitHub push returned ${forbidden.status}, expected 403`,
  )
  forbiddenStatus = 'passed'
}

let paymentRequiredStatus = 'not-run'
if (process.env.GITHUB_VERIFY_UNPAID_SESSION_ID) {
  const unpaid = await requestJson(
    `/api/sessions/${encodeURIComponent(process.env.GITHUB_VERIFY_UNPAID_SESSION_ID)}/github/push`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.SHIP_FAST_VERIFY_AUTH_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        target,
        githubAccessToken: process.env.GITHUB_VERIFY_TOKEN,
        repoFullName: process.env.GITHUB_VERIFY_REPO,
        branch,
      }),
    },
  )
  assert(
    unpaid.status === 402,
    `unpaid GitHub push returned ${unpaid.status}, expected 402`,
  )
  paymentRequiredStatus = 'passed'
}

console.log(
  JSON.stringify(
    {
      ok: true,
      sessionId,
      target,
      repoUrl: push.json.repoUrl,
      repoFullName: push.json.repoFullName,
      branch: push.json.branch,
      commitSha: push.json.commitSha,
      files: push.json.files,
      nonOwnerForbidden: forbiddenStatus,
      paymentRequired: paymentRequiredStatus,
    },
    null,
    2,
  ),
)

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { accept: 'application/json', ...init?.headers },
    signal: AbortSignal.timeout(timeoutMs),
    ...init,
  }).catch((error) => {
    throw new Error(
      `Unable to reach ${baseUrl}${path}: ${error instanceof Error ? error.message : String(error)}`,
    )
  })
  const body = await response.text()
  return {
    status: response.status,
    body,
    json: JSON.parse(body || 'null'),
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
