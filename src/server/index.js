import { createServer as createHttpServer } from 'node:http'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { DASHBOARD_PORT } from '../config.js'
import {
  createSession,
  getSession,
  getAllSessions,
  deleteSession,
  makeSessionState,
  initSessionDir,
  findSessionByPrompt,
  normalizePreferredExportTarget,
  setSessionPreferredExportTarget,
} from './sessions.js'
import { verifyIdToken, db } from '../auth/firebase-admin.js'
import {
  generateSessionExport,
  getSessionExportBundle,
  getSessionExportTargets,
  rerenderPreviewFromSiteSpec,
} from './exports.js'
import { setupWebSocket } from './websocket.js'
import { runAll, runEdit, generateAlternativeDesign } from '../pipeline/runner.js'
import { existsSync, readFileSync } from 'node:fs'
import {
  addUserCredits,
  consumeUserCredit,
  decorateExportTargetsForRequest,
  getDownloadAccessDecision,
  getEarlyAdopterStatus,
  getUserCredits,
  getSessionPaymentDetails,
  hasActiveSubscription,
  initPaymentStore,
  startPaymentListeners,
} from './payments.js'
import { renderHomePage, renderRobotsTxt, renderSitemapXml } from './public-pages.js'
import { pushSessionToGitHub } from './github.js'

const __dir = fileURLToPath(new URL('..', import.meta.url))
const publicDir = join(__dir, '..', 'public')

let _sessionsDir = null

// ─── Rate Limiting ────────────────────────────────────────
const RATE_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours
const MAX_PER_USER = 5 // per 10min window
const MAX_PER_IP = 10 // per 10min window
const MAX_DAILY_PER_USER = 10 // hard daily cap per user
const MIN_PROMPT_LENGTH = 70

const userHits = new Map() // uid -> [timestamp, ...]
const ipHits = new Map() // ip -> [timestamp, ...]
const userDailyHits = new Map() // uid -> [timestamp, ...]

function setNoIndexHeaders(res) {
  res.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
}

function checkRateLimit(key, hitsMap, max, windowMs = RATE_WINDOW_MS) {
  const now = Date.now()
  const hits = (hitsMap.get(key) || []).filter((t) => now - t < windowMs)
  if (hits.length >= max) {
    hitsMap.set(key, hits)
    return false
  }
  hits.push(now)
  hitsMap.set(key, hits)
  return true
}

function cleanupMap(map, windowMs) {
  const now = Date.now()
  for (const [key, hits] of map) {
    const valid = hits.filter((t) => now - t < windowMs)
    if (valid.length === 0) map.delete(key)
    else map.set(key, valid)
  }
}

// Periodic cleanup every 5 minutes
setInterval(
  () => {
    cleanupMap(userHits, RATE_WINDOW_MS)
    cleanupMap(ipHits, RATE_WINDOW_MS)
    cleanupMap(userDailyHits, DAILY_WINDOW_MS)
  },
  5 * 60 * 1000,
)

export async function startServer(sessionsDir) {
  _sessionsDir = sessionsDir
  initSessionDir(sessionsDir)
  initPaymentStore(sessionsDir)
  startPaymentListeners()
  const app = express()
  app.set('trust proxy', true)

  app.use('/api', (_req, res, next) => {
    setNoIndexHeaders(res)
    next()
  })

  app.use(express.json())

  // ─── Plausible Analytics Proxy ──────────────────────────
  const plausibleHost = 'https://plausible.liviogama.com'
  app.get('/js/script.js', async (_req, res) => {
    try {
      const r = await fetch(`${plausibleHost}/js/script.js`)
      res.set('Content-Type', 'application/javascript')
      res.set('Cache-Control', 'public, max-age=86400')
      res.send(Buffer.from(await r.arrayBuffer()))
    } catch {
      res.status(502).end()
    }
  })
  app.post('/api/event', express.text({ type: '*/*' }), async (req, res) => {
    try {
      const r = await fetch(`${plausibleHost}/api/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': req.headers['user-agent'] || '',
          'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip,
        },
        body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
      })
      res.status(r.status).end()
    } catch {
      res.status(502).end()
    }
  })

  // ─── Auth middleware ──────────────────────────────────────
  async function requireAuth(req, res, next) {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
    try {
      const decoded = await verifyIdToken(auth.slice(7))
      req.user = { uid: decoded.uid, email: decoded.email }
      next()
    } catch (err) {
      console.error('[auth] token verification failed:', err?.message ?? err)
      res.status(401).json({ error: 'Unauthorized' })
    }
  }

  // ─── Public: Firebase client config ──────────────────────
  app.get('/api/config', (_req, res) => {
    res.json({
      apiKey: process.env.FIREBASE_API_KEY ?? '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? '',
      projectId: process.env.FIREBASE_PROJECT_ID ?? '',
      appId: process.env.FIREBASE_APP_ID ?? '',
    })
  })

  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(renderRobotsTxt())
  })

  app.get('/sitemap.xml', (_req, res) => {
    res.type('application/xml').send(renderSitemapXml())
  })

  app.get('/index.html', (_req, res) => {
    res.redirect(301, '/')
  })

  // ─── Prompt page (landing) ────────────────────────────────
  app.get('/', (_req, res) => {
    res.type('html').send(renderHomePage())
  })

  // Serve public assets statically, but keep / routed through SSR.
  app.use(express.static(publicDir, { index: false }))

  // ─── Dashboard (session-scoped) ───────────────────────────
  app.get('/session/:id', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).send('Session not found')
    setNoIndexHeaders(res)
    res.sendFile(join(publicDir, 'dashboard.html'))
  })

  // ─── API: Create session + start generation ───────────────
  app.post('/api/sessions', requireAuth, async (req, res) => {
    const { prompt } = req.body
    const preferredExportTarget = normalizePreferredExportTarget(
      req.body?.preferredExportTarget || req.body?.framework,
    )
    const trimmedPrompt = prompt?.trim()
    if (!trimmedPrompt) return res.status(400).json({ error: 'prompt is required' })
    if (trimmedPrompt.length < MIN_PROMPT_LENGTH) {
      return res
        .status(400)
        .json({ error: `Prompt must be at least ${MIN_PROMPT_LENGTH} characters.` })
    }

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip
    const userDaily = (userDailyHits.get(req.user.uid) || []).filter(
      (t) => Date.now() - t < DAILY_WINDOW_MS,
    ).length
    const ts = new Date().toISOString()

    // Log every request for monitoring
    console.log(
      `[${ts}] REQ user=${req.user.uid} ip=${clientIp} email=${req.user.email ?? '?'} daily=${userDaily} prompt="${trimmedPrompt.slice(0, 80)}"`,
    )

    // Check for exact prompt match - return existing project
    const existing = findSessionByPrompt(req.user.uid, trimmedPrompt)
    if (existing) {
      setSessionPreferredExportTarget(existing, preferredExportTarget)
      console.log(`[${ts}] CACHE_HIT user=${req.user.uid} session=${existing.id}`)
      if (process.env.NODE_ENV !== 'development' && process.env.SLACK_WEBHOOK_URL) {
        fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `\u267b\ufe0f *Cache hit* (no generation, $0 cost):\n> ${trimmedPrompt.slice(0, 500)}\nUser: \`${req.user.uid}\` | Email: \`${req.user.email ?? '?'}\` | IP: \`${clientIp}\` | Daily: ${userDaily}`,
          }),
        }).catch(() => {})
      }
      return res.json({ id: existing.id, workspace: existing.workspace, cached: true })
    }

    // Daily cap check
    if (!checkRateLimit(req.user.uid, userDailyHits, MAX_DAILY_PER_USER, DAILY_WINDOW_MS)) {
      console.log(`[${ts}] DAILY_LIMIT user=${req.user.uid} ip=${clientIp} daily=${userDaily}`)
      if (process.env.NODE_ENV !== 'development' && process.env.SLACK_WEBHOOK_URL) {
        fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `\ud83d\udeab *Daily limit reached* (${MAX_DAILY_PER_USER}/day):\n> ${trimmedPrompt.slice(0, 500)}\nUser: \`${req.user.uid}\` | Email: \`${req.user.email ?? '?'}\` | IP: \`${clientIp}\``,
          }),
        }).catch(() => {})
      }
      return res.status(429).json({
        error: `Daily limit: max ${MAX_DAILY_PER_USER} generations per day. Please come back tomorrow.`,
      })
    }

    // 10-min rate limit per user
    if (!checkRateLimit(req.user.uid, userHits, MAX_PER_USER)) {
      console.log(`[${ts}] RATE_LIMIT user=${req.user.uid} ip=${clientIp} reason=user_10min`)
      if (process.env.NODE_ENV !== 'development' && process.env.SLACK_WEBHOOK_URL) {
        fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `\ud83d\udeab *Rate limited* (user cap ${MAX_PER_USER}/10min):\n> ${trimmedPrompt.slice(0, 500)}\nUser: \`${req.user.uid}\` | Email: \`${req.user.email ?? '?'}\` | IP: \`${clientIp}\` | Daily: ${userDaily}`,
          }),
        }).catch(() => {})
      }
      return res
        .status(429)
        .json({ error: 'Rate limit: max 5 generations per 10 minutes. Please wait.' })
    }

    // 10-min rate limit per IP
    if (!checkRateLimit(clientIp, ipHits, MAX_PER_IP)) {
      console.log(`[${ts}] RATE_LIMIT user=${req.user.uid} ip=${clientIp} reason=ip_10min`)
      if (process.env.NODE_ENV !== 'development' && process.env.SLACK_WEBHOOK_URL) {
        fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `\ud83d\udeab *Rate limited* (IP cap ${MAX_PER_IP}/10min):\n> ${trimmedPrompt.slice(0, 500)}\nUser: \`${req.user.uid}\` | Email: \`${req.user.email ?? '?'}\` | IP: \`${clientIp}\` | Daily: ${userDaily}`,
          }),
        }).catch(() => {})
      }
      return res
        .status(429)
        .json({ error: 'Rate limit: too many requests from this IP. Please wait.' })
    }

    // Non-subscribers get private sessions by default
    const isSubscriber = await hasActiveSubscription(req.user.uid)
    const session = createSession(_sessionsDir, trimmedPrompt, req.user.uid, {
      preferredExportTarget,
      isPrivate: !isSubscriber,
    })
    const sessionCtx = makeSessionState(session)

    console.log(
      `[${ts}] GENERATE user=${req.user.uid} ip=${clientIp} session=${session.id} daily=${userDaily + 1}`,
    )

    // Slack notification in production
    if (process.env.NODE_ENV !== 'development' && process.env.SLACK_WEBHOOK_URL) {
      fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `\ud83d\ude80 New Ship Fast prompt:\n> ${trimmedPrompt.slice(0, 500)}\nUser: \`${req.user.uid}\` | Email: \`${req.user.email ?? '?'}\` | IP: \`${clientIp}\` | Daily: ${userDaily + 1}/${MAX_DAILY_PER_USER}`,
        }),
      }).catch(() => {})
    }

    // Determine edit vs generate mode
    let editMode = false
    try {
      const tasksFile = join(session.workspace, 'tasks.json')
      const hasIndex = existsSync(join(session.workspace, 'index.html'))
      if (hasIndex && existsSync(tasksFile)) {
        const data = JSON.parse(readFileSync(tasksFile, 'utf-8'))
        const tasks = data.tasks ?? []
        editMode = tasks.length > 0 && tasks.every((t) => ['DONE', 'FAILED'].includes(t.status))
      }
    } catch {
      /* tasks.json may not exist */
    }

    // Fire and forget the generation
    const generation = editMode
      ? runEdit({ prompt: session.prompt, workspace: session.workspace, sessionCtx })
      : runAll({ prompt: session.prompt, workspace: session.workspace, sessionCtx })

    generation.catch((err) => {
      console.error(`  Session ${session.id} error:`, err?.message ?? err)
      sessionCtx.broadcast({ type: 'error', message: err?.message ?? 'Generation failed' })
    })

    res.json({ id: session.id, workspace: session.workspace })
  })

  // ─── API: List sessions ───────────────────────────────────
  app.get('/api/sessions', requireAuth, (_req, res) => {
    res.json(getAllSessions(_req.user.uid))
  })

  // ─── API: Delete session ─────────────────────────────────
  app.delete('/api/sessions/:id', requireAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' })
    deleteSession(req.params.id)
    res.json({ ok: true })
  })

  // ─── API: Delete all sessions ──────────────────────────
  app.delete('/api/sessions', requireAuth, (_req, res) => {
    const all = getAllSessions(_req.user.uid)
    for (const s of all) deleteSession(s.id)
    res.json({ ok: true, deleted: all.length })
  })

  // ─── API: Session info ───────────────────────────────────
  app.get('/api/sessions/:id', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    const targets = await decorateExportTargetsForRequest(
      session,
      getSessionExportTargets(session),
      req,
    )
    const payment = await getSessionPaymentDetails(session, req, targets[0]?.target || 'html')
    res.json({
      id: session.id,
      prompt: session.prompt,
      createdAt: session.createdAt,
      homepageReady: session.homepageReady,
      siteSpecReady: session.siteSpecReady ?? false,
      preferredExportTarget: session.preferredExportTarget || 'html',
      exportTargets: targets,
      payment,
      themeOverride: session.themeOverride ?? null,
      taskCount: session.tasks.length,
      done: session.tasks.filter((t) => t.status === 'DONE').length,
    })
  })

  app.get('/api/sessions/:id/export-targets', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    const targets = await decorateExportTargetsForRequest(
      session,
      getSessionExportTargets(session),
      req,
    )
    const payment = await getSessionPaymentDetails(session, req, targets[0]?.target || 'html')
    res.json({
      sessionId: session.id,
      siteSpecReady: session.siteSpecReady ?? false,
      payment,
      targets,
    })
  })

  app.post('/api/sessions/:id/export', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    try {
      const target = String(req.body?.target || '').toLowerCase()
      if (!target) return res.status(400).json({ error: 'target is required' })
      const result = generateSessionExport(session, target)
      res.json({ ok: true, ...result })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  app.post('/api/sessions/:id/theme', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    try {
      const sessionCtx = makeSessionState(session)
      sessionCtx.setThemeOverride(req.body?.theme || null)
      res.json({ ok: true, theme: session.themeOverride ?? null })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  // ─── API: Early adopter status (public) ────────────────────
  app.get('/api/early-adopter-status', (_req, res) => {
    res.json(getEarlyAdopterStatus())
  })

  // ─── API: Subscription status ─────────────────────────────
  app.get('/api/subscription-status', requireAuth, async (req, res) => {
    try {
      const active = await hasActiveSubscription(req.user.uid)
      res.json({ active })
    } catch (error) {
      console.error('[subscription-status] error:', error?.message ?? error)
      res.status(500).json({ error: 'Unable to check subscription status' })
    }
  })

  // ─── API: Credits status + fulfillment ─────────────────────
  app.get('/api/credits', requireAuth, async (req, res) => {
    const credits = await getUserCredits(req.user.uid)
    res.json({ credits })
  })

  app.post('/api/credits/fulfill', requireAuth, async (req, res) => {
    // Called after a successful Stripe one-time payment for credit packs.
    // The checkout_session in Firestore contains the price metadata with credit count.
    const { checkoutSessionId } = req.body
    if (!checkoutSessionId) return res.status(400).json({ error: 'checkoutSessionId required' })

    try {
      const sessionDoc = await db
        .collection('customers')
        .doc(req.user.uid)
        .collection('checkout_sessions')
        .doc(checkoutSessionId)
        .get()

      if (!sessionDoc.exists) return res.status(404).json({ error: 'Checkout session not found' })

      const data = sessionDoc.data()
      if (data.mode !== 'payment')
        return res.status(400).json({ error: 'Not a one-time payment session' })
      if (data.fulfilled)
        return res.json({ ok: true, already: true, credits: await getUserCredits(req.user.uid) })

      // Get credit count from the price metadata in Stripe (stored in Firestore products)
      const priceId = data.price
      let creditAmount = 0
      if (priceId === process.env.STRIPE_3_CREDITS_PRICE_ID) creditAmount = 3
      else if (priceId === process.env.STRIPE_10_CREDITS_PRICE_ID) creditAmount = 10

      if (creditAmount <= 0) return res.status(400).json({ error: 'Unknown credit pack' })

      addUserCredits(req.user.uid, creditAmount)

      // Mark as fulfilled to prevent double-granting
      await sessionDoc.ref.update({ fulfilled: true })

      res.json({
        ok: true,
        creditsAdded: creditAmount,
        credits: await getUserCredits(req.user.uid),
      })
    } catch (error) {
      console.error('[credits/fulfill] error:', error?.message ?? error)
      res.status(500).json({ error: 'Failed to fulfill credits' })
    }
  })

  app.get('/api/sessions/:id/download/:target', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    const target = String(req.params.target || '').toLowerCase()
    const accessDecision = await getDownloadAccessDecision(session, target, req)
    if (!accessDecision.allowed) {
      return res.status(402).json({
        error: accessDecision.error,
        payment: accessDecision.payment,
      })
    }

    // Consume a credit if using credit-based access (not subscription)
    if (accessDecision.useCredit && session.userId) {
      consumeUserCredit(session.userId)
    }

    const bundle = getSessionExportBundle(session, target)
    if (!bundle) return res.status(404).json({ error: 'Export bundle not found' })

    const filename = `${session.id}-${target}.zip`
    res.download(bundle.path, filename)
  })

  app.post('/api/sessions/:id/rerender-preview', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    try {
      const preview = rerenderPreviewFromSiteSpec(session)
      const sessionCtx = makeSessionState(session)
      sessionCtx.signalHomepageReady()
      res.json({ ok: true, files: Object.keys(preview.files) })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  app.post('/api/sessions/:id/github/push', requireAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' })

    try {
      const result = await pushSessionToGitHub(session, {
        target: req.body?.target,
        githubAccessToken: req.body?.githubAccessToken,
      })
      res.json({ ok: true, ...result })
    } catch (error) {
      const statusCode = error?.status === 401 ? 401 : 400
      res.status(statusCode).json({ error: error.message })
    }
  })

  // ─── API: Session tasks ───────────────────────────────────
  app.get('/api/sessions/:id/tasks', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json(session.tasks)
  })

  // ─── API: Session status ──────────────────────────────────
  app.post('/api/sessions/:id/status', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    const sessionCtx = makeSessionState(session)
    sessionCtx.broadcast({
      type: 'status',
      message: req.body.status ?? '',
      phase: req.body.phase ?? '',
    })
    res.json({ ok: true })
  })

  // ─── API: Generate alternative design (on-demand) ─────────
  app.post('/api/sessions/:id/generate-design', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    const sessionCtx = makeSessionState(session)
    const _log = (msg) => {
      console.log(msg)
      sessionCtx.broadcast({ type: 'log', message: msg })
    }

    // Generate in background
    generateAlternativeDesign(session.prompt, session.workspace, sessionCtx, _log).catch((err) => {
      _log(`✗ Design generation error: ${err.message}`)
    })

    res.json({ ok: true, message: 'Generating alternative design...' })
  })

  // ─── Preview: per-session workspace static files ──────────
  app.use(
    '/preview/:sessionId',
    (req, res, next) => {
      setNoIndexHeaders(res)
      next()
    },
    async (req, res, next) => {
      const session = getSession(req.params.sessionId)
      if (!session) return res.status(404).send('Session not found')
      express.static(session.workspace, { extensions: ['html'] })(req, res, next)
    },
  )

  const httpServer = createHttpServer(app)
  setupWebSocket(httpServer)

  await new Promise((resolve) => httpServer.listen(DASHBOARD_PORT, resolve))
  console.log(`  Server      → http://localhost:${DASHBOARD_PORT}`)
  console.log(`  Sessions dir: ${_sessionsDir}`)
}

/** Start a session from CLI (backward compat) */
export async function startCLISession(workspace, prompt) {
  const session = createSession(_sessionsDir || workspace, prompt)
  // Override workspace to the user-specified one
  session.workspace = workspace
  const sessionCtx = makeSessionState(session)

  let editMode = false
  try {
    const tasksFile = join(workspace, 'tasks.json')
    const hasIndex = existsSync(join(workspace, 'index.html'))
    if (hasIndex && existsSync(tasksFile)) {
      const data = JSON.parse(readFileSync(tasksFile, 'utf-8'))
      const tasks = data.tasks ?? []
      editMode = tasks.length > 0 && tasks.every((t) => ['DONE', 'FAILED'].includes(t.status))
    }
  } catch {
    /* tasks.json may not exist */
  }

  console.log(
    `  MODE: ${editMode ? 'edit (applying changes to existing site)' : 'generate (fresh build)'}`,
  )
  console.log(`  Session: ${session.id}\n`)

  const generation = editMode
    ? runEdit({ prompt, workspace, sessionCtx })
    : runAll({ prompt, workspace, sessionCtx })

  return { session, generation }
}
