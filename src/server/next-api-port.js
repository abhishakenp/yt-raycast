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
import { resolveStartClerkUser } from '../session-domain/start-auth.js'
import { razorpayStartHandler } from './razorpay.js'
import { stripeStartHandler } from './stripe.js'

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
    const clerkUser = await resolveStartClerkUser({ authorization: header })
    if (clerkUser?.uid) {
      return { uid: clerkUser.uid, email: clerkUser.email, provider: 'clerk' }
    }
    return null
  } catch {
    return null
  }
}

export function mountNextApiPort(app, { requireAuth }) {
  // GET /api/config — browser auth + Medusa admin flags
  app.get('/api/config', (_req, res) => {
    res.json({
      clerkPublishableKey:
        process.env.CLERK_PUBLISHABLE_KEY ||
        process.env.VITE_CLERK_PUBLISHABLE_KEY ||
        '',
      convexUrl: process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || '',
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
  app.post('/api/payments/razorpay/start', requireAuth, razorpayStartHandler)
  app.post('/api/payments/stripe/start', requireAuth, stripeStartHandler)

  // GET /api/pexels — Pexels image proxy (HTTP redirect)
  app.get('/api/pexels', async (req, res) => {
    const { pexelsImageHandler } = await import('./pexels.js')
    return pexelsImageHandler(req, res)
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
    const { buildStreamOpenUISystemPrompt } = await import('../lib/openui-stream-system-prompt.ts')
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
