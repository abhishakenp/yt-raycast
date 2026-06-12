#!/usr/bin/env node
import {
  assert,
  convexRun,
  createReadySession,
  escapeHtml,
  parseJson,
} from './verify-browser-helpers.mjs'

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
const stamp = Date.now()
const ownerSecret = `owner-medusa-${stamp}`
const backendUrl = process.env.MEDUSA_BACKEND_URL
const adminUrl = process.env.MEDUSA_ADMIN_URL ?? process.env.MEDUSA_BACKEND_URL
const storefrontUrl =
  process.env.MEDUSA_STOREFRONT_URL ?? process.env.MEDUSA_BACKEND_URL

if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
  throw new Error('--timeout-ms must be at least 1000')
}

const prompt = `Create a premium ecommerce storefront for verifier products ${stamp}`
const sessionId = createReadySession({
  prompt,
  ownerSecret,
  timeoutMs,
  html: `<html><body><main><h1>${escapeHtml(prompt)}</h1><article data-product-id="prod_verify_1">Verifier Hoodie</article></main></body></html>`,
  openUiSource: `$page = "Home"\nroot = Text(${JSON.stringify(prompt)})`,
  siteSpecJson: JSON.stringify({
    projectName: prompt,
    ecommerce: true,
    products: [
      {
        id: 'prod_verify_1',
        title: 'Verifier Hoodie',
        handle: 'verifier-hoodie',
        price: 4900,
      },
    ],
  }),
})

const provision = await requestJson(
  `/api/sessions/${encodeURIComponent(sessionId)}/provision/medusa`,
  {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ship-fast-owner-secret': ownerSecret,
    },
    body: JSON.stringify({
      backendUrl,
      adminUrl,
      storefrontUrl,
    }),
  },
)
assert(
  provision.status === 200,
  `Medusa provision returned ${provision.status}`,
)
assert(
  provision.json.status === 'ready',
  'Medusa provision did not return ready status',
)

const config = await requestJson(
  `/api/sessions/${encodeURIComponent(sessionId)}/medusa-config`,
)
assert(config.status === 200, `Medusa config returned ${config.status}`)
assert(config.json.enabled === true, 'Medusa session config is not enabled')

const firstSync = convexRun(
  'internal.sessions.syncMedusaProducts',
  {
    sessionId,
    products: [
      {
        id: 'prod_verify_1',
        title: 'Verifier Hoodie',
        handle: 'verifier-hoodie',
        price: 4900,
      },
    ],
  },
  timeoutMs,
)
const secondSync = convexRun(
  'internal.sessions.syncMedusaProducts',
  {
    sessionId,
    products: [
      {
        id: 'prod_verify_1',
        title: 'Verifier Hoodie',
        handle: 'verifier-hoodie',
        price: 4900,
      },
    ],
  },
  timeoutMs,
)
assert(
  firstSync.synced === 1,
  'first Medusa product sync did not report one product',
)
assert(
  secondSync.synced === 1,
  'second Medusa product sync did not remain idempotent',
)

const storeConfig = await requestJson('/api/medusa-store/config')
assert(
  storeConfig.status === 200,
  `Medusa store config returned ${storeConfig.status}`,
)
assert(storeConfig.json.enabled === true, 'Medusa store config is not enabled')

const cart = await requestJson('/api/medusa-store/cart', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: '{}',
})
assert(cart.status === 200, `Medusa cart create returned ${cart.status}`)
const cartId = cart.json.cart?.id
assert(
  typeof cartId === 'string' && cartId.length > 0,
  'Medusa cart response missing cart id',
)

const cartRead = await requestJson(
  `/api/medusa-store/cart/${encodeURIComponent(cartId)}`,
)
assert(cartRead.status === 200, `Medusa cart read returned ${cartRead.status}`)
assert(
  cartRead.json.cart?.id === cartId,
  'Medusa cart read returned a different cart',
)

console.log(
  JSON.stringify(
    {
      ok: true,
      sessionId,
      backendUrl,
      configEnabled: config.json.enabled,
      productSync: {
        first: firstSync.synced,
        second: secondSync.synced,
      },
      cartId,
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
    headers: response.headers,
    body,
    json: parseJson(body || 'null', path),
  }
}
