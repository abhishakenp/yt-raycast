/**
 * Express handlers ported from src/app/api/* (Next.js App Router) routes.
 * The vanilla build serves them directly from Express on the same port.
 */
import {
  getEarlyAdopterStatus,
  hasActiveSubscription,
  getUserCredits,
  getDownloadAccessDecision,
  decorateExportTargetsForRequest,
  getSessionPaymentDetails,
} from '../billing/payments.js'
import { verifyIdToken } from '../auth/firebase-admin.js'

const BRANDFETCH_TIMEOUT_MS = 6500

const brandfetchHeaders = () => {
  const key = String(process.env.BRANDFETCH_API_KEY || '').trim()
  const headers = { Accept: 'application/json' }
  if (!key) return headers
  return { ...headers, Authorization: `Bearer ${key}`, 'X-API-Key': key }
}

const safeJson = async (res) => {
  try {
    return await res.json()
  } catch {
    return null
  }
}

async function brandfetchProxy(targetUrl, res) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), BRANDFETCH_TIMEOUT_MS)
  try {
    const upstream = await fetch(targetUrl, {
      method: 'GET',
      headers: brandfetchHeaders(),
      signal: controller.signal,
    })
    const data = await safeJson(upstream)
    if (!upstream.ok) {
      return res.status(502).json({
        ok: false,
        error: String(
          data?.error || data?.message || upstream.statusText || 'Brandfetch request failed',
        ),
      })
    }
    return res.json({ ok: true, data })
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: err?.message || 'Brandfetch request failed',
    })
  } finally {
    clearTimeout(timer)
  }
}

async function authUser(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return null
  try {
    return await verifyIdToken(header.slice(7))
  } catch {
    return null
  }
}

export function mountNextApiPort(app, { requireAuth }) {
  // GET /api/config — Firebase + Medusa admin flags
  app.get('/api/config', (_req, res) => {
    res.json({
      apiKey: process.env.FIREBASE_API_KEY ?? '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? '',
      projectId: process.env.FIREBASE_PROJECT_ID ?? '',
      appId: process.env.FIREBASE_APP_ID ?? '',
      medusaAdminConfigured: Boolean(
        process.env.MEDUSA_ADMIN_APP_URL || process.env.NEXT_PUBLIC_MEDUSA_ADMIN_URL,
      ),
    })
  })

  // GET /api/early-adopter-status — public
  app.get('/api/early-adopter-status', async (_req, res) => {
    try {
      const status = await getEarlyAdopterStatus()
      res.json(status)
    } catch (err) {
      console.error('[early-adopter-status]', err)
      res.status(500).json({ error: 'Unable to get early adopter status' })
    }
  })

  // GET /api/subscription-status — auth required
  app.get('/api/subscription-status', requireAuth, async (req, res) => {
    try {
      const active = await hasActiveSubscription(req.user.uid)
      res.json({ active })
    } catch (err) {
      console.error('[subscription-status]', err)
      res.status(500).json({ error: 'Unable to check subscription status' })
    }
  })

  // Brandfetch proxies (public — keys live server-side)
  app.get('/api/brandfetch/search', async (req, res) => {
    const q = String(req.query.q || '').trim()
    if (!q) return res.status(400).json({ ok: false, error: 'Missing q.' })
    const limit = Math.max(1, Number.parseInt(String(req.query.limit || '1'), 10) || 1)
    return brandfetchProxy(
      `https://api.brandfetch.io/v2/search/${encodeURIComponent(q)}?limit=${limit}`,
      res,
    )
  })

  app.get('/api/brandfetch/brand', async (req, res) => {
    const rawDomain = String(req.query.domain || '').trim()
    if (!rawDomain) return res.status(400).json({ ok: false, error: 'Missing domain.' })
    const domain = rawDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
    return brandfetchProxy(
      `https://api.brandfetch.io/v2/brands/domain/${encodeURIComponent(domain)}`,
      res,
    )
  })

  // POST /api/payments/razorpay/start — auth required
  app.post('/api/payments/razorpay/start', requireAuth, async (req, res) => {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return res.status(503).json({ error: 'Razorpay is not configured' })
    }
    let RazorpayCtor
    try {
      ;({ default: RazorpayCtor } = await import('razorpay'))
    } catch (err) {
      console.error('[razorpay/start] sdk load failed', err)
      return res.status(503).json({ error: 'Razorpay SDK unavailable' })
    }
    const rzp = new RazorpayCtor({ key_id: keyId, key_secret: keySecret })
    const body = req.body || {}
    const mode = String(body.mode || '')
    const uid = req.user.uid
    const email = req.user.email || ''
    try {
      if (mode === 'subscription') {
        const tier = String(body.tier || 'pro')
        const planId =
          tier === 'early_adopter'
            ? process.env.RAZORPAY_EARLY_ADOPTER_PLAN_ID
            : process.env.RAZORPAY_PRO_PLAN_ID
        if (!planId) {
          return res.status(503).json({ error: 'Subscription plan is not configured' })
        }
        const sub = await rzp.subscriptions.create({
          plan_id: planId,
          customer_notify: 1,
          total_count: 120,
          quantity: 1,
          notes: { uid },
          ...(email ? { notify_info: { notify_email: email } } : {}),
        })
        return res.json({
          key_id: keyId,
          subscription_id: sub.id,
          name: 'Ship Fast Pro',
          description: tier === 'early_adopter' ? 'Early adopter Pro' : 'Pro subscription',
          prefill: email ? { email } : {},
        })
      }
      if (mode === 'credit_pack') {
        const packId = String(body.packId || '')
        const amount =
          packId === '10_credits'
            ? Number(process.env.RAZORPAY_CREDITS_10_PAISE || 0)
            : packId === '3_credits'
              ? Number(process.env.RAZORPAY_CREDITS_3_PAISE || 0)
              : 0
        if (!amount) {
          return res.status(400).json({ error: 'Invalid or unconfigured credit pack' })
        }
        const receipt = `sf_${uid}_${Date.now()}`.slice(0, 40)
        const order = await rzp.orders.create({
          amount,
          currency: 'INR',
          receipt,
          notes: { uid, pack: packId === '10_credits' ? '10' : '3' },
        })
        return res.json({
          key_id: keyId,
          order_id: order.id,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Ship Fast',
          description: packId === '10_credits' ? '10 download credits' : '3 download credits',
          prefill: email ? { email } : {},
        })
      }
      return res.status(400).json({ error: 'Invalid mode' })
    } catch (err) {
      console.error('[razorpay/start]', err?.message ?? err)
      return res.status(500).json({ error: err?.message || 'Razorpay error' })
    }
  })

  // POST /api/stream-openui — Server-Sent Events bridge to Groq
  app.post('/api/stream-openui', async (req, res) => {
    const { GROQ_API_KEY, OPENUI_HOME_MODEL } = await import('../config.js')
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured' })
    }
    const body = req.body || {}
    const prompt = String(body.prompt ?? '').trim()
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

    const streamContext = {}
    if (typeof body.siteType === 'string' && body.siteType.trim()) {
      streamContext.siteType = body.siteType.trim()
    }
    if (typeof body.title === 'string' && body.title.trim()) {
      streamContext.title = body.title.trim()
    }
    const hasHint = Boolean(streamContext.siteType || streamContext.title)
    const { buildStreamOpenUISystemPrompt } = await import(
      '../lib/openui-stream-system-prompt.ts'
    )
    const system = buildStreamOpenUISystemPrompt(hasHint ? streamContext : null)

    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENUI_HOME_MODEL,
        stream: true,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!upstream.ok) {
      const errorText = await upstream.text().catch(() => '')
      return res
        .status(upstream.status)
        .type('text/plain; charset=utf-8')
        .send(errorText || 'Upstream error')
    }

    res.set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    })
    res.flushHeaders?.()

    const reader = upstream.body?.getReader()
    if (!reader) {
      res.write('data: [DONE]\n\n')
      return res.end()
    }
    const decoder = new TextDecoder()
    let buffer = ''
    let finished = false

    const flushLine = (line) => {
      if (finished) return
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) return
      const data = trimmed.slice(6)
      if (data === '[DONE]') {
        finished = true
        res.write('data: [DONE]\n\n')
        res.end()
        return
      }
      try {
        const parsed = JSON.parse(data)
        const chunk = parsed?.choices?.[0]?.delta?.content
        if (typeof chunk === 'string' && chunk.length > 0) {
          res.write(`data: ${JSON.stringify({ t: chunk })}\n\n`)
        }
      } catch {
        /* ignore non-JSON keepalive lines */
      }
    }

    req.on('close', () => {
      finished = true
      reader.cancel().catch(() => {})
    })

    try {
      while (!finished) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let index = buffer.indexOf('\n')
        while (index !== -1 && !finished) {
          const line = buffer.slice(0, index)
          buffer = buffer.slice(index + 1)
          flushLine(line)
          index = buffer.indexOf('\n')
        }
      }
      if (!finished) {
        if (buffer.trim()) flushLine(buffer)
        if (!finished) {
          res.write('data: [DONE]\n\n')
          res.end()
        }
      }
    } catch (err) {
      console.error('[stream-openui] reader error', err)
      try {
        res.end()
      } catch {
        /* connection already closed */
      }
    }
  })

  // The original Next /api/billing/* handlers were internal (secret-gated) and
  // had no callers in this codebase. Re-export the underlying billing helpers
  // here only if a future Express route needs them — not exposed by default.
  return {
    helpers: {
      authUser,
      getUserCredits,
      getDownloadAccessDecision,
      decorateExportTargetsForRequest,
      getSessionPaymentDetails,
    },
  }
}
