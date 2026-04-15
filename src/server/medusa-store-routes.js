import express from 'express'
import Medusa from '@medusajs/js-sdk'

export function isMedusaStoreApiConfigured() {
  const key =
    process.env.MEDUSA_PUBLISHABLE_API_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    ''
  return Boolean(key.trim())
}

function getMedusaStoreClient() {
  const baseUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
  const publishableKey =
    process.env.MEDUSA_PUBLISHABLE_API_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    ''
  if (!publishableKey.trim()) return null
  return new Medusa({ baseUrl, publishableKey: publishableKey.trim() })
}

export function createMedusaStoreRouter() {
  const r = express.Router()
  r.use(express.json({ limit: '64kb' }))

  r.get('/config', (_req, res) => {
    const c = getMedusaStoreClient()
    res.json({
      enabled: Boolean(c),
      backendUrl: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
    })
  })

  r.post('/cart', async (_req, res) => {
    const client = getMedusaStoreClient()
    if (!client) {
      return res
        .status(503)
        .json({ error: 'Medusa Store API not configured (set MEDUSA_PUBLISHABLE_API_KEY or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)' })
    }
    try {
      const { regions } = await client.store.region.list()
      const regionId = regions?.[0]?.id
      if (!regionId) return res.status(500).json({ error: 'No sales region in Medusa' })
      const { cart } = await client.store.cart.create({ region_id: regionId })
      return res.json({ cart })
    } catch (e) {
      return res.status(500).json({ error: e?.message || 'cart create failed' })
    }
  })

  r.get('/cart/:id', async (req, res) => {
    const client = getMedusaStoreClient()
    if (!client) return res.status(503).json({ error: 'Medusa Store API not configured' })
    try {
      const { cart } = await client.store.cart.retrieve(req.params.id)
      return res.json({ cart })
    } catch (e) {
      return res.status(500).json({ error: e?.message || 'cart retrieve failed' })
    }
  })

  r.post('/cart/line-items', async (req, res) => {
    const client = getMedusaStoreClient()
    if (!client) return res.status(503).json({ error: 'Medusa Store API not configured' })
    const cartId = String(req.body?.cart_id || '').trim()
    const variantId = String(req.body?.variant_id || '').trim()
    const quantity = Math.max(1, Number.parseInt(String(req.body?.quantity || '1'), 10) || 1)
    if (!cartId || !variantId) return res.status(400).json({ error: 'cart_id and variant_id required' })
    try {
      const { cart } = await client.store.cart.createLineItem(cartId, { variant_id: variantId, quantity })
      return res.json({ cart })
    } catch (e) {
      return res.status(500).json({ error: e?.message || 'line item failed' })
    }
  })

  return r
}
