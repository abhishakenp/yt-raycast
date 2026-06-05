import { describe, expect, test } from 'vitest'
import http from 'node:http'
import express from 'express'
import { createMedusaStoreRouter } from './medusa-store-routes.js'

function listen(app) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolve({ server, url: `http://127.0.0.1:${address.port}` })
    })
    server.on('error', reject)
  })
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()))
  })
}

async function readJson(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

describe('createMedusaStoreRouter checkout proxy', () => {
  test('lists providers, initializes Stripe/Razorpay payment sessions, and completes cart', async () => {
    const calls = []
    const fakeMedusa = http.createServer(async (req, res) => {
      calls.push({ method: req.method, url: req.url, body: req.method === 'GET' ? null : await readJson(req) })
      res.setHeader('Content-Type', 'application/json')

      if (req.method === 'GET' && req.url === '/store/payment-providers?region_id=reg_us') {
        res.end(JSON.stringify({ payment_providers: [{ id: 'pp_stripe_stripe' }, { id: 'pp_razorpay_razorpay' }] }))
        return
      }

      if (req.method === 'GET' && req.url === '/store/carts/cart_1') {
        res.end(JSON.stringify({ cart: { id: 'cart_1' } }))
        return
      }

      if (req.method === 'POST' && req.url === '/store/payment-collections') {
        res.end(JSON.stringify({ payment_collection: { id: 'paycol_1' } }))
        return
      }

      if (req.method === 'POST' && req.url === '/store/payment-collections/paycol_1/payment-sessions') {
        res.end(JSON.stringify({ payment_collection: { id: 'paycol_1', payment_sessions: [{ id: 'payses_1' }] } }))
        return
      }

      if (req.method === 'POST' && req.url === '/store/carts/cart_1/complete') {
        res.end(JSON.stringify({ type: 'order', order: { id: 'order_1' } }))
        return
      }

      res.statusCode = 404
      res.end(JSON.stringify({ message: `unexpected ${req.method} ${req.url}` }))
    })

    const fakeMedusaUrl = await new Promise((resolve, reject) => {
      fakeMedusa.listen(0, '127.0.0.1', () => {
        const address = fakeMedusa.address()
        resolve(`http://127.0.0.1:${address.port}`)
      })
      fakeMedusa.on('error', reject)
    })

    const app = express()
    app.use('/api/storefront/medusa', createMedusaStoreRouter())
    const { server, url } = await listen(app)

    const oldEnv = {
      MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL,
      MEDUSA_PUBLISHABLE_API_KEY: process.env.MEDUSA_PUBLISHABLE_API_KEY,
      MEDUSA_PAYMENT_PROVIDER_ID: process.env.MEDUSA_PAYMENT_PROVIDER_ID,
    }

    try {
      process.env.MEDUSA_BACKEND_URL = fakeMedusaUrl
      process.env.MEDUSA_PUBLISHABLE_API_KEY = 'pk_test'
      process.env.MEDUSA_PAYMENT_PROVIDER_ID = 'pp_stripe_stripe'

      const providers = await fetch(`${url}/api/storefront/medusa/payment-providers?regionId=reg_us`).then((r) => r.json())
      expect(providers.payment_providers.map((p) => p.id)).toEqual(['pp_stripe_stripe', 'pp_razorpay_razorpay'])

      const stripeSession = await fetch(`${url}/api/storefront/medusa/cart/payment-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: 'cart_1' }),
      }).then((r) => r.json())
      expect(stripeSession.provider_id).toBe('pp_stripe_stripe')

      const razorpaySession = await fetch(`${url}/api/storefront/medusa/cart/payment-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: 'cart_1', provider_id: 'pp_razorpay_razorpay' }),
      }).then((r) => r.json())
      expect(razorpaySession.provider_id).toBe('pp_razorpay_razorpay')

      const completed = await fetch(`${url}/api/storefront/medusa/cart/cart_1/complete`, {
        method: 'POST',
      }).then((r) => r.json())
      expect(completed.order.id).toBe('order_1')

      const sessionBodies = calls
        .filter((call) => call.url === '/store/payment-collections/paycol_1/payment-sessions')
        .map((call) => call.body)
      expect(sessionBodies).toEqual([
        { provider_id: 'pp_stripe_stripe' },
        { provider_id: 'pp_razorpay_razorpay' },
      ])
    } finally {
      for (const [key, value] of Object.entries(oldEnv)) {
        if (value == null) delete process.env[key]
        else process.env[key] = value
      }
      await close(server)
      await close(fakeMedusa)
    }
  })
})
