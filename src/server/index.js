import { createServer as createHttpServer } from 'node:http'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { BASE_DOMAIN, DASHBOARD_PORT } from '../config.js'
import {
  createSession,
  getSession,
  getAllSessions,
  deleteSession,
  makeSessionState,
  initSessionDir,
  findSessionByPrompt,
  setSessionPreferredExportTarget,
  claimSessionsByIds,
  setSessionStatus,
  getInterruptedSessions,
  broadcastToAllSessions,
  setSessionPreferredLanguage,
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
import { existsSync, readFileSync, writeFileSync, watch } from 'node:fs'
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
  setQuotaInfoGetter,
} from './payments.js'
import { renderHomePage, renderRobotsTxt, renderSitemapXml } from './public-pages.js'
import { pushSessionToGitHub } from './github.js'
import {
  getDeploymentBySlug,
  getDeploymentBySessionId,
  initDeployments,
  registerDeployment,
} from './deployments.js'
import { generateSlug } from './slug-generator.js'

const __dir = fileURLToPath(new URL('..', import.meta.url))
const publicDir = join(__dir, '..', 'public')

let _sessionsDir = null
let rateLimitFile = null

// ─── Rate Limiting ────────────────────────────────────────
const RATE_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours
const MONTHLY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const MAX_PER_USER = 5 // per 10min window
const MAX_PER_IP = 10 // per 10min window
const MAX_FREE_PER_MONTH = 10 // hard monthly cap for free (no subscription) users
const MAX_PAID_PER_MONTH = 30 // hard monthly cap for paid (subscribed) users
const MAX_PROMPT_LENGTH = 5000
const httpContractsPromise = import('../contracts/http-contracts.js')
const MAX_PER_IP_AUTHED = 30
const MAX_FREE_PER_IP_MONTHLY = 15

const MAX_ANON_PER_DAY = 2 // per day for anonymous (unauthenticated) users — then auth wall

// Owner IP whitelist — bypasses all rate limits (comma-separated in env, or hardcoded fallback)
const WHITELISTED_IPS = new Set(
  (process.env.WHITELIST_IPS || '31.165.224.115,49.37.65.246')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean),
)

const userHits = new Map() // uid -> [timestamp, ...]
const ipHits = new Map() // ip -> [timestamp, ...]
const userMonthlyHits = new Map() // uid -> [timestamp, ...]
const anonIpDailyHits = new Map() // ip -> [timestamp, ...] for anonymous users
const exportHits = new Map() // uid -> [timestamp, ...] for export rate limiting
const ipMonthlyHits = new Map() // ip -> [timestamp, ...] monthly cap for free users
const activeGenerations = new Map() // uid/ip -> count of in-progress generations
const MAX_CONCURRENT_PER_USER = 2

function isLocalDevelopmentRequest(req, clientIp) {
  if (process.env.NODE_ENV === 'production') return false

  const host = req.headers.host || ''
  if (host.includes('localhost') || host.includes('127.0.0.1')) return true

  return (
    clientIp === '127.0.0.1' ||
    clientIp === '::1' ||
    clientIp.startsWith('127.') ||
    clientIp.startsWith('192.168.') ||
    clientIp.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(clientIp)
  )
}

function setNoIndexHeaders(res) {
  res.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  res.set('Referrer-Policy', 'no-referrer')
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

function refundRateLimit(key, hitsMap) {
  const hits = hitsMap.get(key)
  if (hits?.length) hits.pop()
}

// Function to get user generation quota info
async function getQuotaInfo(userId, clientIp) {
  if (userId) {
    // Authenticated user
    const currentMonthly = (userMonthlyHits.get(userId) || []).filter(
      (t) => Date.now() - t < MONTHLY_WINDOW_MS,
    ).length
    const isSubscribed = await hasActiveSubscription(userId)
    const monthlyLimit = isSubscribed ? MAX_PAID_PER_MONTH : MAX_FREE_PER_MONTH

    return {
      isSubscribed,
      monthlyLimit,
      monthlyUsed: currentMonthly,
      monthlyRemaining: Math.max(0, monthlyLimit - currentMonthly),
      isAnonymous: false,
    }
  } else if (clientIp) {
    // Anonymous user
    const currentDaily = (anonIpDailyHits.get(clientIp) || []).filter(
      (t) => Date.now() - t < DAILY_WINDOW_MS,
    ).length

    return {
      isSubscribed: false,
      dailyLimit: MAX_ANON_PER_DAY,
      dailyUsed: currentDaily,
      dailyRemaining: Math.max(0, MAX_ANON_PER_DAY - currentDaily),
      isAnonymous: true,
    }
  } else {
    // No user or IP info
    return {
      isSubscribed: false,
      monthlyLimit: MAX_FREE_PER_MONTH,
      monthlyUsed: 0,
      monthlyRemaining: MAX_FREE_PER_MONTH,
      isAnonymous: true,
    }
  }
}

function cleanupMap(map, windowMs) {
  const now = Date.now()
  for (const [key, hits] of map) {
    const valid = hits.filter((t) => now - t < windowMs)
    if (valid.length === 0) map.delete(key)
    else map.set(key, valid)
  }
}

function isGibberishPrompt(text) {
  const uniqueChars = new Set(text.replace(/\s/g, '')).size
  if (text.length >= 70 && uniqueChars < 10) return true

  const words = text.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length > 0) {
    const freq = {}
    for (const w of words) freq[w] = (freq[w] || 0) + 1
    const maxFreq = Math.max(...Object.values(freq))
    if (maxFreq / words.length > 0.6) return true
  }

  if (words.length >= 4) {
    const first = words[0]
    if (first.length <= 8 && words.filter((w) => w === first).length / words.length > 0.5)
      return true
  }

  // Vowel ratio check: real language has ~30-50% vowels; keyboard mashing has very few
  const alphaOnly = text.replace(/[^a-zA-Z]/g, '').toLowerCase()
  if (alphaOnly.length >= 40) {
    const vowels = alphaOnly.replace(/[^aeiou]/g, '').length
    const vowelRatio = vowels / alphaOnly.length
    if (vowelRatio < 0.15) return true
  }

  // Consonant cluster check: gibberish has long runs without vowels (e.g., "jfsdkljfsdjfds")
  const letterWords = text.toLowerCase().match(/[a-z]+/g) || []
  const wordsWithConsonantRun = letterWords.filter((w) => /[^aeiou]{5,}/.test(w)).length
  if (wordsWithConsonantRun >= 3) return true

  // Check if most 4+ letter words have no vowels at all
  const longWords = words.filter((w) => w.replace(/[^a-z]/g, '').length >= 4)
  if (longWords.length >= 3) {
    const noVowel = longWords.filter((w) => !/[aeiou]/.test(w.replace(/[^a-z]/g, '')))
    if (noVowel.length / longWords.length > 0.5) return true
  }

  return false
}

// Periodic cleanup every 5 minutes
setInterval(
  () => {
    cleanupMap(userHits, RATE_WINDOW_MS)
    cleanupMap(ipHits, RATE_WINDOW_MS)
    cleanupMap(userMonthlyHits, MONTHLY_WINDOW_MS)
    cleanupMap(anonIpDailyHits, DAILY_WINDOW_MS)
    cleanupMap(exportHits, RATE_WINDOW_MS)
    cleanupMap(ipMonthlyHits, MONTHLY_WINDOW_MS)
    if (rateLimitFile) {
      try {
        const data = {
          userMonthly: Object.fromEntries(userMonthlyHits),
          anonDaily: Object.fromEntries(anonIpDailyHits),
          ipMonthly: Object.fromEntries(ipMonthlyHits),
        }
        writeFileSync(rateLimitFile, JSON.stringify(data))
      } catch {
        /* ignore write errors */
      }
    }
  },
  5 * 60 * 1000,
)

export async function startServer(sessionsDir) {
  _sessionsDir = sessionsDir
  initSessionDir(sessionsDir)
  initDeployments(sessionsDir)
  initPaymentStore(sessionsDir)
  startPaymentListeners()

  // Set up quota info getter for payments module
  setQuotaInfoGetter(getQuotaInfo)

  rateLimitFile = join(sessionsDir, '.rate_limits.json')
  try {
    if (existsSync(rateLimitFile)) {
      const saved = JSON.parse(readFileSync(rateLimitFile, 'utf-8'))
      if (saved.userMonthly)
        for (const [k, v] of Object.entries(saved.userMonthly)) userMonthlyHits.set(k, v)
      if (saved.anonDaily)
        for (const [k, v] of Object.entries(saved.anonDaily)) anonIpDailyHits.set(k, v)
      if (saved.ipMonthly)
        for (const [k, v] of Object.entries(saved.ipMonthly)) ipMonthlyHits.set(k, v)
    }
  } catch {
    /* ignore corrupt file */
  }

  const interrupted = getInterruptedSessions()
  for (const s of interrupted) {
    console.log(`[startup] Session ${s.id} was interrupted during generation. Resetting to failed.`)
    setSessionStatus(s.id, 'failed')
  }

  const startPublicWatch = () => {
    if (process.env.NODE_ENV === 'production') return

    let reloadTimer
    const supportedReloadExts = new Set(['.html', '.css', '.js'])
    const scheduleReload = () => {
      if (reloadTimer) return
      reloadTimer = setTimeout(() => {
        reloadTimer = null
        broadcastToAllSessions({ type: 'client_reload' })
      }, 120)
    }

    const shouldReload = (filename) => {
      const lower = String(filename).toLowerCase()
      if (lower === 'dashboard.html' || lower === 'index.html') return true
      const fileExt = extname(lower)
      return supportedReloadExts.has(fileExt)
    }

    const watchTarget = (target) => {
      try {
        watch(target, { persistent: true }, (_eventType, filename) => {
          if (filename && shouldReload(filename)) scheduleReload()
        })
      } catch {}
    }

    watchTarget(join(publicDir, 'dashboard.html'))
    watchTarget(join(publicDir, 'styles'))
    watchTarget(join(publicDir, 'scripts'))
    watchTarget(join(publicDir, 'js'))
  }

  startPublicWatch()

  const app = express()
  app.set('trust proxy', true)

  const getSessionSubdomain = (req) => {
    const host = String(req.hostname || req.headers.host?.split(':')[0] || '').toLowerCase()
    const bases = [BASE_DOMAIN, 'localhost', 'lvh.me']
    for (const base of bases) {
      if (!base) continue
      if (host === base || host === `www.${base}`) continue
      const suffix = `.${base}`
      if (!host.endsWith(suffix)) continue
      const subdomain = host.slice(0, -suffix.length)
      if (!subdomain) continue
      return subdomain
    }
    return ''
  }

  app.use((req, res, next) => {
    const subdomain = getSessionSubdomain(req)
    if (!subdomain) return next()

    const deployment = getDeploymentBySlug(subdomain)
    if (!deployment) return res.status(404).send('Site not found')

    const session = getSession(deployment.sessionId)
    if (!session) return res.status(404).send('Site not found')

    express.static(session.workspace, { extensions: ['html'] })(req, res, () => {
      res.status(404).send('Site not found')
    })
  })

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

  async function optionalAuth(req, res, next) {
    const auth = req.headers.authorization
    if (auth?.startsWith('Bearer ')) {
      try {
        const decoded = await verifyIdToken(auth.slice(7))
        req.user = { uid: decoded.uid, email: decoded.email }
      } catch (err) {
        console.error('[auth] optional token verification failed:', err?.message ?? err)
      }
    }
    next()
  }

  function ensureDeploymentAccess(req, res, session) {
    if (!session?.userId) return true
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return false
    }
    if (session.userId !== req.user.uid) {
      res.status(403).json({ error: 'Forbidden' })
      return false
    }
    return true
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

  // Pricing page
  app.get('/pricing', (_req, res) => {
    res.sendFile(join(publicDir, 'pricing.html'))
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
  app.post('/api/sessions', optionalAuth, async (req, res) => {
    const { parseCreateSessionRequest, sanitizeSessionCreateResponse, sanitizeErrorResponse } =
      await httpContractsPromise
    const parsed = parseCreateSessionRequest(req.body ?? {})
    if (!parsed.ok) return res.status(400).json(sanitizeErrorResponse(parsed.errors.join(' | ')))
    const { prompt, preferredLanguage, preferredExportTarget } = parsed.data
    const trimmedPrompt = prompt?.trim()
    if (isGibberishPrompt(trimmedPrompt)) {
      return res.status(400).json({
        error: 'Please provide a meaningful description of the website you want to build.',
      })
    }

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip
    const ts = new Date().toISOString()
    const skipRateLimits = isLocalDevelopmentRequest(req, clientIp) || WHITELISTED_IPS.has(clientIp)

    let session

    if (req.user) {
      // ─── Authenticated flow ─────────────────────────────────
      const userMonthly = (userMonthlyHits.get(req.user.uid) || []).filter(
        (t) => Date.now() - t < MONTHLY_WINDOW_MS,
      ).length

      console.log(
        `[${ts}] REQ user=${req.user.uid} ip=${clientIp} email=${req.user.email ?? '?'} monthly=${userMonthly} prompt="${trimmedPrompt.slice(0, 80)}"`,
      )

      // Check for exact prompt match - return existing project
      const existing = findSessionByPrompt(req.user.uid, trimmedPrompt, preferredLanguage)
      if (existing) {
        setSessionPreferredExportTarget(existing, preferredExportTarget)
        setSessionPreferredLanguage(existing, preferredLanguage)
        console.log(`[${ts}] CACHE_HIT user=${req.user.uid} session=${existing.id}`)
        if (process.env.NODE_ENV !== 'development' && process.env.SLACK_WEBHOOK_URL) {
          fetch(process.env.SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `\u267b\ufe0f *Cache hit* (no generation, $0 cost):\n> ${trimmedPrompt.slice(0, 500)}\nUser: \`${req.user.uid}\` | Email: \`${req.user.email ?? '?'}\` | IP: \`${clientIp}\` | Monthly: ${userMonthly}`,
            }),
          }).catch(() => {})
        }
        return res.json(sanitizeSessionCreateResponse(existing))
      }

      // Determine subscription status and monthly limit
      const isSubscriber = await hasActiveSubscription(req.user.uid)
      const monthlyLimit = isSubscriber ? MAX_PAID_PER_MONTH : MAX_FREE_PER_MONTH

      if (!skipRateLimits) {
        // Monthly cap check
        if (!checkRateLimit(req.user.uid, userMonthlyHits, monthlyLimit, MONTHLY_WINDOW_MS)) {
          console.log(
            `[${ts}] MONTHLY_LIMIT user=${req.user.uid} ip=${clientIp} monthly=${userMonthly} limit=${monthlyLimit}`,
          )
          if (process.env.NODE_ENV !== 'development' && process.env.SLACK_WEBHOOK_URL) {
            fetch(process.env.SLACK_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: `\ud83d\udeab *Monthly limit reached* (${monthlyLimit}/month):\n> ${trimmedPrompt.slice(0, 500)}\nUser: \`${req.user.uid}\` | Email: \`${req.user.email ?? '?'}\` | IP: \`${clientIp}\``,
              }),
            }).catch(() => {})
          }
          return res.status(429).json({
            error: `Limit reached: max ${monthlyLimit} generations per rolling 30 days. Need more? Contact us at https://x.com/LivioGama`,
            remaining: 0,
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
                text: `\ud83d\udeab *Rate limited* (user cap ${MAX_PER_USER}/10min):\n> ${trimmedPrompt.slice(0, 500)}\nUser: \`${req.user.uid}\` | Email: \`${req.user.email ?? '?'}\` | IP: \`${clientIp}\` | Monthly: ${userMonthly}`,
              }),
            }).catch(() => {})
          }
          return res.status(429).json({
            error: 'Rate limit: max 5 generations per 10 minutes. Please wait.',
            remaining: 0,
          })
        }

        // 10-min rate limit per IP
        if (!checkRateLimit(clientIp, ipHits, MAX_PER_IP_AUTHED)) {
          console.log(`[${ts}] RATE_LIMIT user=${req.user.uid} ip=${clientIp} reason=ip_10min`)
          if (process.env.NODE_ENV !== 'development' && process.env.SLACK_WEBHOOK_URL) {
            fetch(process.env.SLACK_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: `\ud83d\udeab *Rate limited* (IP cap ${MAX_PER_IP_AUTHED}/10min):\n> ${trimmedPrompt.slice(0, 500)}\nUser: \`${req.user.uid}\` | Email: \`${req.user.email ?? '?'}\` | IP: \`${clientIp}\` | Monthly: ${userMonthly}`,
              }),
            }).catch(() => {})
          }
          return res.status(429).json({
            error: 'Rate limit: too many requests from this IP. Please wait.',
            remaining: 0,
          })
        }

        // IP-level monthly cap for free users (multi-account abuse prevention)
        if (
          !isSubscriber &&
          !checkRateLimit(clientIp, ipMonthlyHits, MAX_FREE_PER_IP_MONTHLY, MONTHLY_WINDOW_MS)
        ) {
          return res.status(429).json({
            error: 'Too many generations from this network. Subscribe for higher limits.',
            remaining: 0,
          })
        }

        // Concurrent generation limit
        if ((activeGenerations.get(req.user.uid) || 0) >= MAX_CONCURRENT_PER_USER) {
          return res.status(429).json({
            error: `You already have ${MAX_CONCURRENT_PER_USER} generations in progress. Please wait for them to complete.`,
            remaining: 0,
          })
        }
      }

      // Non-subscribers get private sessions by default
      session = createSession(_sessionsDir, trimmedPrompt, req.user.uid, {
        preferredExportTarget,
        preferredLanguage,
        isPrivate: !isSubscriber,
      })

      console.log(
        `[${ts}] GENERATE user=${req.user.uid} ip=${clientIp} session=${session.id} monthly=${userMonthly + 1}`,
      )

      if (process.env.NODE_ENV !== 'development' && process.env.SLACK_WEBHOOK_URL) {
        fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `\ud83d\ude80 New Ship Fast prompt:\n> ${trimmedPrompt.slice(0, 500)}\nUser: \`${req.user.uid}\` | Email: \`${req.user.email ?? '?'}\` | IP: \`${clientIp}\` | Monthly: ${userMonthly + 1}/${monthlyLimit}`,
          }),
        }).catch(() => {})
      }
    } else {
      // ─── Anonymous flow ─────────────────────────────────────
      console.log(`[${ts}] REQ anon ip=${clientIp} prompt="${trimmedPrompt.slice(0, 80)}"`)

      if (!skipRateLimits) {
        // Daily limit per IP for anonymous users — sign-in wall after 2
        if (!checkRateLimit(clientIp, anonIpDailyHits, MAX_ANON_PER_DAY, DAILY_WINDOW_MS)) {
          console.log(`[${ts}] ANON_DAILY_LIMIT ip=${clientIp}`)
          return res.status(429).json({
            error: `Sign in to keep generating. Free anonymous users get ${MAX_ANON_PER_DAY} generations per day.`,
            remaining: 0,
            code: 'ANON_DAILY_LIMIT',
          })
        }

        // 10-min rate limit per IP
        if (!checkRateLimit(clientIp, ipHits, MAX_PER_IP)) {
          console.log(`[${ts}] RATE_LIMIT anon ip=${clientIp} reason=ip_10min`)
          return res.status(429).json({
            error: 'Rate limit: too many requests from this IP. Please wait.',
            remaining: 0,
            code: 'ANON_IP_RATE_LIMIT',
          })
        }

        // Concurrent generation limit
        if ((activeGenerations.get(clientIp) || 0) >= MAX_CONCURRENT_PER_USER) {
          return res.status(429).json({
            error: `You already have ${MAX_CONCURRENT_PER_USER} generations in progress. Please wait for them to complete.`,
            remaining: 0,
            code: 'ANON_CONCURRENT_LIMIT',
          })
        }
      }

      session = createSession(_sessionsDir, trimmedPrompt, null, {
        preferredExportTarget,
        preferredLanguage,
        isPrivate: true,
      })

      console.log(`[${ts}] GENERATE anon ip=${clientIp} session=${session.id}`)

      if (process.env.NODE_ENV !== 'development' && process.env.SLACK_WEBHOOK_URL) {
        fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `\ud83d\ude80 Anonymous Ship Fast prompt:\n> ${trimmedPrompt.slice(0, 500)}\nIP: \`${clientIp}\``,
          }),
        }).catch(() => {})
      }
    }

    const sessionCtx = makeSessionState(session)

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

    setSessionStatus(session.id, 'generating')

    // Fire and forget the generation
    const generation = editMode
      ? runEdit({ prompt: session.prompt, workspace: session.workspace, sessionCtx })
      : runAll({
          prompt: session.prompt,
          workspace: session.workspace,
          sessionCtx,
          preferredLanguage: session.preferredLanguage,
        })

    const generationKey = req.user?.uid || clientIp
    activeGenerations.set(generationKey, (activeGenerations.get(generationKey) || 0) + 1)

    generation
      .then(() => {
        setSessionStatus(session.id, 'done')
        activeGenerations.set(
          generationKey,
          Math.max(0, (activeGenerations.get(generationKey) || 0) - 1),
        )
      })
      .catch((err) => {
        setSessionStatus(session.id, 'failed')
        console.error(`  Session ${session.id} error:`, err?.message ?? err)
        sessionCtx.broadcast({ type: 'error', message: err?.message ?? 'Generation failed' })
        activeGenerations.set(
          generationKey,
          Math.max(0, (activeGenerations.get(generationKey) || 0) - 1),
        )
        if (req.user) {
          refundRateLimit(req.user.uid, userMonthlyHits)
          console.log(
            `  [REFUND] Monthly quota refunded for user ${req.user.uid} (session ${session.id} failed)`,
          )
        } else {
          refundRateLimit(clientIp, anonIpDailyHits)
          console.log(
            `  [REFUND] Anonymous daily quota refunded for ip ${clientIp} (session ${session.id} failed)`,
          )
        }
      })

    // Auto-build React + Next.js exports for authenticated users after generation completes
    if (req.user) {
      generation
        .then(() => {
          for (const target of ['react', 'nextjs']) {
            try {
              generateSessionExport(session, target)
              sessionCtx.broadcast({ type: 'export_ready', target })
            } catch (err) {
              console.error(`[auto-build] ${target} failed: ${err.message}`)
            }
          }
        })
        .catch(() => {})
    }

    if (req.user) {
      const currentMonthly = (userMonthlyHits.get(req.user.uid) || []).filter(
        (t) => Date.now() - t < MONTHLY_WINDOW_MS,
      ).length
      const isSubscriber = await hasActiveSubscription(req.user.uid)
      const remaining = (isSubscriber ? MAX_PAID_PER_MONTH : MAX_FREE_PER_MONTH) - currentMonthly
      res.json(sanitizeSessionCreateResponse(session, { cached: false, remaining }))
    } else {
      const currentAnon = (anonIpDailyHits.get(clientIp) || []).filter(
        (t) => Date.now() - t < DAILY_WINDOW_MS,
      ).length
      const remaining = MAX_ANON_PER_DAY - currentAnon
      res.json(sanitizeSessionCreateResponse(session, { cached: false, remaining }))
    }
  })

  // ─── API: List sessions (authenticated — own sessions) ───────
  app.get('/api/sessions', requireAuth, (_req, res) => {
    res.json(getAllSessions(_req.user.uid))
  })

  // ─── API: Recent public sessions gallery (no auth required) ──
  app.get('/api/sessions/recent', (_req, res) => {
    const all = getAllSessions()
    const public_ = all.filter((s) => s.homepageReady && !s.isPrivate).slice(0, 30)
    res.json(public_)
  })

  // ─── API: Claim anonymous sessions ─────────────────────────
  app.post('/api/sessions/claim', requireAuth, (req, res) => {
    const { sessionIds } = req.body
    if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json({ error: 'sessionIds array is required' })
    }
    if (sessionIds.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 sessions can be claimed at once' })
    }
    const result = claimSessionsByIds(sessionIds, req.user.uid)
    res.json(result)
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
  app.get('/api/sessions/:id', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    // Private sessions: only the owner sees full metadata
    if (session.isPrivate === true) {
      if (req.user?.uid !== session.userId) {
        return res.json({
          id: session.id,
          createdAt: session.createdAt,
          done: session.tasks.filter((t) => t.status === 'DONE').length,
          isPrivate: true,
        })
      }
    }

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
      deployment: session.deployment || null,
      homepageReady: session.homepageReady,
      siteSpecReady: session.siteSpecReady ?? false,
      preferredExportTarget: session.preferredExportTarget || 'html',
      exportTargets: targets,
      payment,
      themeOverride: session.themeOverride ?? null,
      taskCount: session.tasks.length,
      done: session.tasks.filter((t) => t.status === 'DONE').length,
      isAnonymous: !session.userId,
    })
  })

  app.post('/api/sessions/:id/deploy', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureDeploymentAccess(req, res, session)) return

    let deployment = session.deployment || getDeploymentBySessionId(session.id)
    if (!deployment) {
      let projectContext = {}
      try {
        const contextPath = join(session.workspace, 'project-context.json')
        if (existsSync(contextPath)) projectContext = JSON.parse(readFileSync(contextPath, 'utf-8'))
      } catch {}
      let slug
      try {
        slug = await generateSlug(projectContext)
      } catch {
        return res.status(500).json({ error: 'Failed to generate deployment slug' })
      }
      const created = registerDeployment(slug, session.id)
      const url = `https://${created.slug}.${BASE_DOMAIN}`
      deployment = {
        slug: created.slug,
        url,
        deployedAt: created.deployedAt,
      }
      session.deployment = deployment
      try {
        writeFileSync(join(session.workspace, 'deploy.json'), JSON.stringify(deployment, null, 2))
      } catch {}
      const state = makeSessionState(session)
      state.broadcast({ type: 'deployed', slug: deployment.slug, url: deployment.url })
    } else if (!deployment.url) {
      deployment = { ...deployment, url: `https://${deployment.slug}.${BASE_DOMAIN}` }
      session.deployment = deployment
    }

    res.json({
      ok: true,
      slug: deployment.slug,
      url: deployment.url,
      deployedAt: deployment.deployedAt,
    })
  })

  app.get('/api/sessions/:id/deploy', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureDeploymentAccess(req, res, session)) return

    const deployment = session.deployment || getDeploymentBySessionId(session.id)
    if (!deployment) return res.json({ deployed: false })
    const response = deployment.url
      ? deployment
      : { ...deployment, url: `https://${deployment.slug}.${BASE_DOMAIN}` }
    if (!deployment.url && response.url) {
      session.deployment = response
      try {
        writeFileSync(join(session.workspace, 'deploy.json'), JSON.stringify(response, null, 2))
      } catch {}
    }

    res.json({
      deployed: true,
      slug: response.slug,
      url: response.url,
      deployedAt: response.deployedAt,
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

  app.post('/api/sessions/:id/export', requireAuth, async (req, res) => {
    const { parseTargetPayload, sanitizeErrorResponse } = await httpContractsPromise
    const targetParse = parseTargetPayload(req.body ?? {})
    if (!targetParse.ok)
      return res.status(400).json(sanitizeErrorResponse(targetParse.errors.join(' | ')))
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' })
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip
    const skipRateLimits = isLocalDevelopmentRequest(req, clientIp) || WHITELISTED_IPS.has(clientIp)

    if (!skipRateLimits && !checkRateLimit(req.user.uid, exportHits, 5))
      return res.status(429).json({ error: 'Export rate limit: max 5 per 10 minutes' })

    try {
      const result = generateSessionExport(session, targetParse.data.target)
      res.json({ ok: true, ...result })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  app.post('/api/sessions/:id/theme', async (req, res) => {
    const { parseThemePayload, sanitizeErrorResponse } = await httpContractsPromise
    const payload = parseThemePayload(req.body ?? {})
    if (!payload.ok) return res.status(400).json(sanitizeErrorResponse(payload.errors.join(' | ')))
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    try {
      const sessionCtx = makeSessionState(session)
      sessionCtx.setThemeOverride(payload.data.theme)
      res.json({ ok: true, theme: session.themeOverride ?? null })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  // ─── API: Early adopter status (public) ────────────────────
  app.get('/api/early-adopter-status', async (_req, res) => {
    res.json(await getEarlyAdopterStatus())
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

  app.get('/api/sessions/:id/download/:target', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    if (!req.user) {
      return res.status(401).json({ error: 'Sign in to download your projects' })
    }
    if (session.userId && session.userId !== req.user.uid) {
      return res.status(403).json({ error: 'You do not own this session' })
    }

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
    if (!bundle)
      return res.status(404).json({
        error:
          'Export is still building or has not been generated yet. Please wait a moment and try again.',
        retryable: true,
      })

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
      sessionCtx.broadcast({ type: 'preview_reload', at: Date.now() })
      res.json({ ok: true, files: Object.keys(preview.files) })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  app.post('/api/sessions/:id/github/push', requireAuth, async (req, res) => {
    const { parseGitHubPushPayload, sanitizeErrorResponse } = await httpContractsPromise
    const payload = parseGitHubPushPayload(req.body ?? {})
    if (!payload.ok) {
      return res.status(400).json(sanitizeErrorResponse(payload.errors.join(' | ')))
    }
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' })

    const target = payload.data.target
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

    try {
      const result = await pushSessionToGitHub(session, {
        target,
        githubAccessToken: payload.data.githubAccessToken,
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
    const { parseStatusPayload, sanitizeSessionStatusPayload } = await httpContractsPromise
    const payload = parseStatusPayload(req.body ?? {})
    if (!payload.ok) return res.status(400).json({ error: 'Invalid status payload.' })
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    const sessionCtx = makeSessionState(session)
    const statusPayload = sanitizeSessionStatusPayload(payload.data.message, payload.data.phase)
    sessionCtx.broadcast(statusPayload)
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
