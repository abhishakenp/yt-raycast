import express from 'express'
import { getSession } from '../server/sessions.js'

export function isMedusaStoreApiConfigured() {
  const key =
    process.env.MEDUSA_PUBLISHABLE_API_KEY || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
  return Boolean(key.trim())
}

const DEFAULT_BASE_URL = () => process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
const DEFAULT_PAYMENT_PROVIDER_ID = () =>
  process.env.MEDUSA_PAYMENT_PROVIDER_ID ||
  process.env.NEXT_PUBLIC_MEDUSA_PAYMENT_PROVIDER_ID ||
  'pp_system_default'

async function resolveSessionMedusaConfig(sessionId) {
  if (!sessionId) return null
  try {
    const session = await getSession(sessionId)
    return session?.medusaConfig || null
  } catch {
    return null
  }
}

async function getPublishableKey(req) {
  const sessionId = String(req?.query?.sessionId || '').trim()
  const sessionCfg = await resolveSessionMedusaConfig(sessionId)
  // Prefer the session's tenant URL when a session is provisioned — otherwise
  // multi-tenant storefronts would all be funneled into MEDUSA_BACKEND_URL.
  const sessionBaseUrl = String(sessionCfg?.backendUrl || '').trim().replace(/\/$/, '')
  const baseUrl = sessionBaseUrl || DEFAULT_BASE_URL()

  const headerKey = String(req?.headers?.['x-medusa-publishable-key'] || '').trim()
  if (headerKey) return { baseUrl, publishableKey: headerKey }

  const sessionKey = String(sessionCfg?.publishableKey || '').trim()
  if (sessionKey) return { baseUrl, publishableKey: sessionKey }

  const publishableKey =
    process.env.MEDUSA_PUBLISHABLE_API_KEY || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
  if (!publishableKey.trim()) return null
  return { baseUrl, publishableKey: publishableKey.trim() }
}

async function getMedusaStoreConfig(req) {
  const config = await getPublishableKey(req)
  if (!config) return null
  return {
    baseUrl: String(config.baseUrl || '').replace(/\/$/, ''),
    publishableKey: String(config.publishableKey || '').trim(),
  }
}

function queryString(query) {
  if (!query || typeof query !== 'object') return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === '') continue
    params.set(key, String(value))
  }
  const out = params.toString()
  return out ? `?${out}` : ''
}

async function medusaStoreRequest(config, path, { method = 'GET', body, query } = {}) {
  const response = await fetch(`${config.baseUrl}/store${path}${queryString(query)}`, {
    method,
    headers: {
      'x-publishable-api-key': config.publishableKey,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const raw = await response.text()
  let data = null
  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch {
      data = { message: raw }
    }
  }
  if (!response.ok) {
    const error = new Error(data?.message || data?.error || `Medusa Store API ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }
  return data || {}
}

async function createPaymentSession(config, cartId, { providerId, data } = {}) {
  const { cart } = await medusaStoreRequest(config, `/carts/${encodeURIComponent(cartId)}`)
  if (!cart?.id) {
    const error = new Error('Cart not found')
    error.status = 404
    throw error
  }

  let paymentCollectionId = cart.payment_collection?.id
  if (!paymentCollectionId) {
    const created = await medusaStoreRequest(config, '/payment-collections', {
      method: 'POST',
      body: { cart_id: cart.id },
    })
    paymentCollectionId = created.payment_collection?.id
  }

  if (!paymentCollectionId) {
    throw new Error('Could not create Medusa payment collection')
  }

  const chosenProviderId = String(providerId || DEFAULT_PAYMENT_PROVIDER_ID()).trim()
  const session = await medusaStoreRequest(
    config,
    `/payment-collections/${encodeURIComponent(paymentCollectionId)}/payment-sessions`,
    {
      method: 'POST',
      body: {
        provider_id: chosenProviderId,
        ...(data && typeof data === 'object' ? { data } : {}),
      },
    },
  )
  return { ...session, provider_id: chosenProviderId }
}

export function createMedusaStoreRouter() {
  const r = express.Router()
  r.use(express.json({ limit: '64kb' }))

  r.get('/config', async (req, res) => {
    const c = await getMedusaStoreConfig(req)
    const sessionCfg = await resolveSessionMedusaConfig(String(req?.query?.sessionId || '').trim())
    const sessionBaseUrl = String(sessionCfg?.backendUrl || '').trim().replace(/\/$/, '')
    res.json({
      enabled: Boolean(c),
      backendUrl: sessionBaseUrl || DEFAULT_BASE_URL(),
    })
  })

  r.post('/cart', async (req, res) => {
    const config = await getMedusaStoreConfig(req)
    if (!config) {
      return res.status(503).json({
        error:
          'Medusa Store API not configured (set MEDUSA_PUBLISHABLE_API_KEY or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)',
      })
    }
    try {
      const { regions } = await medusaStoreRequest(config, '/regions')
      const regionId = regions?.[0]?.id
      if (!regionId) return res.status(500).json({ error: 'No sales region in Medusa' })
      const { cart } = await medusaStoreRequest(config, '/carts', {
        method: 'POST',
        body: { region_id: regionId },
      })
      return res.json({ cart })
    } catch (e) {
      return res.status(500).json({ error: e?.message || 'cart create failed' })
    }
  })

  r.get('/cart/:id', async (req, res) => {
    const config = await getMedusaStoreConfig(req)
    if (!config) return res.status(503).json({ error: 'Medusa Store API not configured' })
    try {
      const { cart } = await medusaStoreRequest(config, `/carts/${encodeURIComponent(req.params.id)}`)
      return res.json({ cart })
    } catch (e) {
      return res.status(500).json({ error: e?.message || 'cart retrieve failed' })
    }
  })

  r.post('/cart/line-items', async (req, res) => {
    const config = await getMedusaStoreConfig(req)
    if (!config) return res.status(503).json({ error: 'Medusa Store API not configured' })
    const cartId = String(req.body?.cart_id || '').trim()
    const variantId = String(req.body?.variant_id || '').trim()
    const quantity = Math.max(1, Number.parseInt(String(req.body?.quantity || '1'), 10) || 1)
    if (!cartId || !variantId)
      return res.status(400).json({ error: 'cart_id and variant_id required' })
    try {
      const { cart } = await medusaStoreRequest(
        config,
        `/carts/${encodeURIComponent(cartId)}/line-items`,
        {
          method: 'POST',
          body: {
            variant_id: variantId,
            quantity,
          },
        },
      )
      return res.json({ cart })
    } catch (e) {
      return res.status(500).json({ error: e?.message || 'line item failed' })
    }
  })

  r.get('/payment-providers', async (req, res) => {
    const config = await getMedusaStoreConfig(req)
    if (!config) return res.status(503).json({ error: 'Medusa Store API not configured' })
    const regionId = String(req.query?.regionId || req.query?.region_id || '').trim()
    try {
      const data = await medusaStoreRequest(config, '/payment-providers', {
        query: regionId ? { region_id: regionId } : undefined,
      })
      return res.json(data)
    } catch (e) {
      return res.status(500).json({ error: e?.message || 'payment providers failed' })
    }
  })

  r.post('/cart/payment-sessions', async (req, res) => {
    const config = await getMedusaStoreConfig(req)
    if (!config) return res.status(503).json({ error: 'Medusa Store API not configured' })
    const cartId = String(req.body?.cart_id || req.body?.cartId || '').trim()
    if (!cartId) return res.status(400).json({ error: 'cart_id required' })
    try {
      const data = await createPaymentSession(config, cartId, {
        providerId: req.body?.provider_id || req.body?.providerId,
        data: req.body?.data,
      })
      return res.json(data)
    } catch (e) {
      return res.status(e?.status || 500).json({ error: e?.message || 'payment session failed' })
    }
  })

  r.post('/cart/complete', async (req, res) => {
    const config = await getMedusaStoreConfig(req)
    if (!config) return res.status(503).json({ error: 'Medusa Store API not configured' })
    const cartId = String(req.body?.cart_id || req.body?.cartId || '').trim()
    if (!cartId) return res.status(400).json({ error: 'cart_id required' })
    try {
      const data = await medusaStoreRequest(config, `/carts/${encodeURIComponent(cartId)}/complete`, {
        method: 'POST',
      })
      return res.json(data)
    } catch (e) {
      return res.status(e?.status || 500).json({ error: e?.message || 'cart complete failed' })
    }
  })

  r.post('/cart/:id/complete', async (req, res) => {
    const config = await getMedusaStoreConfig(req)
    if (!config) return res.status(503).json({ error: 'Medusa Store API not configured' })
    try {
      const data = await medusaStoreRequest(
        config,
        `/carts/${encodeURIComponent(req.params.id)}/complete`,
        {
          method: 'POST',
        },
      )
      return res.json(data)
    } catch (e) {
      return res.status(e?.status || 500).json({ error: e?.message || 'cart complete failed' })
    }
  })

  return r
}
