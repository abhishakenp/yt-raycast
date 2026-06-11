#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split('=')
    return [key, rest.join('=')]
  }),
)

const baseUrl = (
  args.get('--base-url') ??
  process.env.SHIP_FAST_BASE_URL ??
  'http://localhost:3000'
).replace(/\/$/, '')
const timeoutMs = Number(args.get('--timeout-ms') ?? 10000)
const testUserId = args.get('--user-id') ?? `verify_billing_${Date.now()}`

if (!Number.isFinite(timeoutMs) || timeoutMs < 1) {
  throw new Error('--timeout-ms must be a positive number')
}

const routeChecks = []

for (const path of [
  '/api/subscription-status',
  '/api/credits',
  '/api/billing-overview',
]) {
  const response = await requestJson(path)
  assert(response.status === 401, `${path} returned ${response.status}, expected 401`)
  assert(
    response.json.error === 'Sign in to view billing details.',
    `${path} did not return the expected auth error`,
  )
  assertNoBackendLeak(response.body)
  routeChecks.push({ path, status: response.status })
}

const checkoutNoAuth = await requestJson('/api/checkout/start', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ mode: 'subscription', gateway: 'stripe' }),
})
assert(
  checkoutNoAuth.status === 401,
  `/api/checkout/start no-auth returned ${checkoutNoAuth.status}, expected 401`,
)
assert(checkoutNoAuth.json.error === 'Sign in before checkout.', 'checkout auth error mismatch')
assertNoBackendLeak(checkoutNoAuth.body)
routeChecks.push({ path: '/api/checkout/start', scenario: 'no-auth', status: checkoutNoAuth.status })

const checkoutInvalidJson = await requestJson('/api/checkout/start', {
  method: 'POST',
  headers: {
    authorization: 'Bearer verifier-token',
    'content-type': 'application/json',
  },
  body: '{',
})
assert(
  checkoutInvalidJson.status === 400,
  `/api/checkout/start invalid JSON returned ${checkoutInvalidJson.status}, expected 400`,
)
assert(checkoutInvalidJson.json.error === 'Invalid JSON.', 'checkout invalid JSON error mismatch')
assertNoBackendLeak(checkoutInvalidJson.body)
routeChecks.push({
  path: '/api/checkout/start',
  scenario: 'invalid-json',
  status: checkoutInvalidJson.status,
})

const checkoutInvalidMode = await requestJson('/api/checkout/start', {
  method: 'POST',
  headers: {
    authorization: 'Bearer verifier-token',
    'content-type': 'application/json',
  },
  body: JSON.stringify({ mode: 'bogus' }),
})
assert(
  checkoutInvalidMode.status === 400,
  `/api/checkout/start invalid mode returned ${checkoutInvalidMode.status}, expected 400`,
)
assert(checkoutInvalidMode.json.error === 'Invalid checkout mode.', 'checkout invalid mode error mismatch')
assertNoBackendLeak(checkoutInvalidMode.body)
routeChecks.push({
  path: '/api/checkout/start',
  scenario: 'invalid-mode',
  status: checkoutInvalidMode.status,
})

for (const webhook of [
  {
    path: '/api/stripe/webhook',
    headers: { 'stripe-signature': 't=1,v1=bad' },
  },
  {
    path: '/api/razorpay/webhook',
    headers: { 'x-razorpay-signature': 'bad' },
  },
]) {
  const response = await requestJson(webhook.path, {
    method: 'POST',
    headers: {
      ...webhook.headers,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ id: `evt_${Date.now()}` }),
  })
  assert(
    response.status === 400 || response.status === 503,
    `${webhook.path} returned ${response.status}, expected 400 or 503`,
  )
  assert(
    typeof response.json.error === 'string' && response.json.error.length > 0,
    `${webhook.path} did not return a JSON error`,
  )
  assertNoBackendLeak(response.body)
  routeChecks.push({
    path: webhook.path,
    scenario: response.status === 503 ? 'unconfigured' : 'invalid-signature',
    status: response.status,
  })
}

const hasSubscription = convexRun('billing:hasActiveSubscription', {
  userId: testUserId,
})
assert(hasSubscription === false, 'new verifier user unexpectedly has an active subscription')

const credits = convexRun('billing:getUserCredits', { userId: testUserId })
assert(credits === 0, 'new verifier user unexpectedly has credits')

const ledger = convexRun('billing:getCreditLedger', {
  userId: testUserId,
  limit: 5,
})
assert(ledger.current === 0, 'credit ledger current balance mismatch')
assert(Array.isArray(ledger.history), 'credit ledger history is not an array')
assert(ledger.history.length === 0, 'new verifier user unexpectedly has ledger rows')

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl,
      testUserId,
      routeChecks,
      convexChecks: {
        hasActiveSubscription: hasSubscription,
        credits,
        ledgerCurrent: ledger.current,
        ledgerRows: ledger.history.length,
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
  try {
    return JSON.parse(output || 'null')
  } catch (error) {
    throw new Error(
      `Unable to parse Convex output for ${functionName}: ${error instanceof Error ? error.message : String(error)}\n${output}`,
    )
  }
}

async function requestJson(path, init) {
  const text = await requestText(path, init)
  try {
    return { ...text, json: JSON.parse(text.body) }
  } catch (error) {
    throw new Error(
      `Unable to parse JSON from ${path}: ${error instanceof Error ? error.message : String(error)}\n${text.body.slice(0, 500)}`,
    )
  }
}

async function requestText(path, init) {
  const response = await request(path, init)
  return {
    response,
    status: response.status,
    contentType: response.headers.get('content-type') ?? '',
    headers: response.headers,
    body: await response.text(),
  }
}

async function request(path, init) {
  const url = `${baseUrl}${path}`
  return await fetch(url, {
    headers: { accept: 'application/json', ...init?.headers },
    signal: AbortSignal.timeout(timeoutMs),
    ...init,
  }).catch((error) => {
    throw new Error(
      `Unable to reach ${url}. Start the app and Convex backend first, or pass --base-url. ${error instanceof Error ? error.message : String(error)}`,
    )
  })
}

function assertNoBackendLeak(body) {
  assert(!body.includes('Cannot GET'), 'route is not registered')
  assert(!body.includes('FunctionPathNotFound'), 'Convex function missing')
  assert(!body.includes('fetch failed'), 'Convex backend unreachable')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
