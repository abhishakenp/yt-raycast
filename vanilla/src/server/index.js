import { createServer as createHttpServer } from 'node:http'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import {
  BASE_DOMAIN,
  DASHBOARD_PORT,
  HOMEPAGE_MODEL,
  SITE_URL,
  isSanityConfigured,
  isSanityChatWriteConfigured,
  LLM_CONFIG,
  RUNPOD_API_KEY,
  RUNPOD_API_URL,
} from '../config.js'
import { applyThemeOverrideToSiteSpec } from './theme.js'
import { renderPreviewToWorkspace } from '../renderers/index.js'
import { provisionSanityForSession, isSanityProvisionable } from './sanity-provision.js'
import { provisionMedusaForSession, isMedusaProvisionable } from './medusa-provision.js'
import {
  loadSiteSpec,
  saveSiteSpec,
  enrichSiteSpecWithWorkspaceBlueprints,
  ensureCompatibleSiteSpec,
} from '../spec/index.js'
import { ensureSanityCorsOrigins } from '../sanity/ensure-cors.js'
import { groq } from '../llm/groq.js'
import { hex1 } from '../llm/hex1.js'
import { resolveLanguageModeFromPreference } from '../pipeline/detect-language.js'
import { htmlLooksDegenerate } from '../pipeline/homepage-degeneracy.js'
import {
  writeDesignReferencesFile,
  designReferenceFingerprintFromUrls,
} from '../pipeline/ecommerce-design-references.js'
import {
  compactStyleFragmentHtml,
  trimInlineAiHtmlFragment,
  trimInlineAiText,
} from '../llm/utils.js'
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
  readAnonOwnerSecret,
  setSanityConfig,
  setMedusaConfig,
} from './sessions.js'
import {
  generateSessionExport,
  getSessionExportBundle,
  getSessionExportTargets,
  rerenderPreviewFromSiteSpec,
  syncSessionPreviewFromSanity,
} from './exports.js'
import { broadcastDevReload, setupWebSocket } from './websocket.js'
import { runAll, runEdit, generateAlternativeDesign } from '../pipeline/runner.js'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  watch,
  writeFileSync,
} from 'node:fs'
import { writeFile } from 'node:fs/promises'
import multer from 'multer'
import {
  filePathForPreviewRequest,
  injectPreviewToolsHtml,
  stripPreviewArtifactsFromHtml,
} from './preview-tools-serve.js'
import {
  hasActiveSubscription,
  getUserCredits,
  consumeUserCredit,
  getDownloadAccessDecision,
  decorateExportTargetsForRequest as decorateExportTargets,
  getSessionPaymentDetails,
} from '../billing/payments.js'
import { razorpayWebhookHandler } from './razorpay.js'
import { applySiteSettingsPatch } from '../sanity/sync.js'
import {
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  MAX_ANON_PER_DAY,
  MAX_PER_USER,
  MAX_PER_IP,
  MAX_PER_IP_AUTHED,
  MAX_FREE_PER_IP_MONTHLY,
  MAX_CONCURRENT_PER_USER,
  RATE_WINDOW_MS,
  MONTHLY_WINDOW_MS,
  DAILY_WINDOW_MS,
} from '../billing/constants'
import {
  userHits,
  ipHits,
  userMonthlyHits,
  anonIpDailyHits,
  exportHits,
  ipMonthlyHits,
  activeGenerations,
  shareBonusIps,
  promptSuggestIpHits,
  checkRateLimit,
  refundRateLimit,
  hasIpShareBonus,
  getAnonDailyLimit,
  cleanupMap,
} from '../lib/rate-limit.ts'
import {
  createSanityWriteClient,
  fetchSanityImageAssets,
  fetchSiteSettings,
} from '../sanity/client.js'
import { applyPricingPageOverrides } from './blog-pages.js'
import { renderShipFastLlmsTxt } from '../renderers/llms-txt.js'
import { renderHomePage, renderRobotsTxt, renderSitemapXml } from './public-pages.js'
import { ensureEmbeddedStudioBuilt } from './ensure-studio-build.js'
import { mountEmbeddedSanityStudio } from './sanity-studio-static.js'
import { renderPrivacyPage } from './privacy-page.js'
import { renderPricingPage } from './pricing-page.js'
import { parseGalleryPagination, paginateGalleryList } from './gallery-pagination.js'
import { getPublicGalleryList } from './public-gallery-cache.js'
import { pushSessionToGitHub } from './github.js'
import {
  getDeploymentBySlug,
  getDeploymentBySessionId,
  initDeployments,
  registerDeployment,
} from './deployments.js'
import { generateSlug } from './slug-generator.js'
import { getPartialPromptSuggestions } from './prompt-suggestions.js'
import { normalizePromptText, requirePromptText } from '../prompt.js'
import {
  appendAssistantMessage,
  appendUserMessage,
  buildComposedEditPrompt,
  canSessionRunEdit,
  clearChatStore,
  readChatStore,
  readChatStoreAsync,
} from './session-chat.js'
import { MAX_UPLOAD_BYTES, saveSessionImageBuffers } from './session-uploads.js'
import { readPalette, writePalette } from './session-palette.js'
import { promptLooksBrandDriven } from '../pipeline/brand-profile.js'
import { checkPromptContentPolicy, CONTENT_POLICY_CLIENT_MESSAGE } from '../lib/content-policy'
import {
  getNextPreviewSnapshot,
  isNextPreviewFeatureEnabled,
  shutdownNextPreview,
  startNextPreview,
  stopNextPreview,
} from './next-dev-preview.js'

const __dir = fileURLToPath(new URL('..', import.meta.url))
const publicDir = join(__dir, '..', 'public')

const chatImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 16 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype)) cb(null, true)
    else cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed.'))
  },
})

const sanitizeChatAttachmentPaths = (workspace, paths) => {
  if (!Array.isArray(paths)) return []
  const safe = /^user-uploads\/[a-f0-9]{32}\.(jpg|png|webp|gif)$/i
  const out = []
  for (const p of paths) {
    if (typeof p !== 'string') continue
    const normalized = p.replace(/^\.\//, '').replace(/\\/g, '/').trim()
    if (!safe.test(normalized)) continue
    if (existsSync(join(workspace, normalized))) out.push(normalized)
  }
  return [...new Set(out)]
}

let _sessionsDir = null
let rateLimitFile = null

const httpContractsPromise = import('../contracts/http-contracts.js')

// Owner IP whitelist — bypasses all rate limits (comma-separated in env, or hardcoded fallback)
const WHITELISTED_IPS = new Set(
  (process.env.WHITELIST_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean),
)
const PROMPT_SUGGEST_WINDOW_MS = 60 * 1000
const PROMPT_SUGGEST_MAX_PER_IP = 40
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
  // Keep preview URLs out of search while still allowing third-party image CDNs
  // to receive an origin referrer and serve assets inside the preview iframe.
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin')
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
    cleanupMap(promptSuggestIpHits, PROMPT_SUGGEST_WINDOW_MS)
    // Prune expired share bonuses (not today)
    const today = new Date().toISOString().slice(0, 10)
    for (const [ip, date] of shareBonusIps) {
      if (date !== today) shareBonusIps.delete(ip)
    }
    if (rateLimitFile) {
      try {
        const data = {
          userMonthly: Object.fromEntries(userMonthlyHits),
          anonDaily: Object.fromEntries(anonIpDailyHits),
          ipMonthly: Object.fromEntries(ipMonthlyHits),
          shareBonus: Object.fromEntries(shareBonusIps),
        }
        writeFile(rateLimitFile, JSON.stringify(data)).catch(() => {})
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

  const stalePublicIndex = join(publicDir, 'index.html')
  try {
    if (existsSync(stalePublicIndex)) {
      unlinkSync(stalePublicIndex)
      console.warn('[startup] deleted public/index.html (homepage is SSR only)')
    }
  } catch {
    /* best-effort cleanup */
  }

  // Set up quota info getter for payments module
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
      if (saved.shareBonus) {
        const today = new Date().toISOString().slice(0, 10)
        for (const [k, v] of Object.entries(saved.shareBonus))
          if (v === today) shareBonusIps.set(k, v)
      }
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
        broadcastDevReload({ type: 'client_reload' })
      }, 400)
    }

    const shouldReload = (filename) => {
      const lower = String(filename).toLowerCase()
      if (lower === 'dashboard.html') return true
      const fileExt = extname(lower)
      return supportedReloadExts.has(fileExt)
    }

    const watchTarget = (target) => {
      try {
        watch(target, { persistent: true }, (_eventType, filename) => {
          if (filename && shouldReload(filename)) scheduleReload()
        })
      } catch {
        /* ignore watch errors in development */
      }
    }

    watchTarget(join(__dir, '..', 'public', 'styles'))
    watchTarget(join(publicDir, 'dashboard.html'))
    watchTarget(join(publicDir, 'styles'))
    watchTarget(join(publicDir, 'scripts'))
    watchTarget(join(publicDir, 'js'))
  }

  startPublicWatch()

  const studioRoot = join(__dir, '..', 'studio')
  ensureEmbeddedStudioBuilt(studioRoot)

  const app = express()
  app.disable('x-powered-by')
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

  app.post(
    '/api/payments/razorpay/webhook',
    express.raw({ type: 'application/json' }),
    razorpayWebhookHandler,
  )

  app.use(express.json({ limit: '15mb' }))
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON in request body' })
    }
    next(err)
  })

  // ─── Plausible Analytics Proxy ──────────────────────────
  const plausibleHost = String(
    process.env.PLAUSIBLE_HOST || 'https://plausible.liviogama.com',
  ).replace(/\/$/, '')
  const plausibleVendorHost = 'https://plausible.io'
  const plausibleScriptNoop =
    'window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)};'
  const isPlausibleScriptPayload = (r, buf) => {
    const ct = String(r.headers.get('content-type') || '')
    const probe = buf.subarray(0, Math.min(64, buf.length)).toString('utf8').trimStart()
    return r.ok && /javascript|ecmascript/i.test(ct) && !probe.startsWith('<')
  }
  app.get('/js/script.js', async (_req, res) => {
    try {
      for (const base of [plausibleHost, plausibleVendorHost]) {
        const r = await fetch(`${base}/js/script.js`)
        const buf = Buffer.from(await r.arrayBuffer())
        if (!isPlausibleScriptPayload(r, buf)) continue
        res.set('Content-Type', 'application/javascript; charset=utf-8')
        res.set('Cache-Control', `public, max-age=${base === plausibleHost ? 86400 : 3600}`)
        res.send(buf)
        return
      }
    } catch (err) {
      if (res.headersSent) {
        console.error('[plausible proxy] GET /js/script.js after headers sent', err)
        return
      }
    }
    res.type('application/javascript; charset=utf-8')
    res.set('Cache-Control', 'public, max-age=300')
    res.send(plausibleScriptNoop)
  })
  app.post('/api/event', express.text({ type: '*/*' }), async (req, res) => {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    const headers = {
      'Content-Type': 'text/plain',
      'User-Agent': req.headers['user-agent'] || '',
      'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip,
    }
    try {
      for (const base of [plausibleHost, plausibleVendorHost]) {
        const r = await fetch(`${base}/api/event`, { method: 'POST', headers, body })
        if (r.ok) {
          res.status(r.status).end()
          return
        }
      }
    } catch (err) {
      if (res.headersSent) {
        console.error('[plausible proxy] POST /api/event after headers sent', err)
        return
      }
    }
    res.status(204).end()
  })

  // ─── Auth middleware ──────────────────────────────────────
  // Extracted to src/server/middleware/auth.middleware.js
  const { requireAuth, optionalAuth, requireProvisionAuth } =
    await import('./middleware/auth.middleware.js')

  function ensureSessionArtifactAccess(req, res, session) {
    if (session?.userId) {
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
    const secret = readAnonOwnerSecret(session.workspace)
    if (!secret) return true
    const header = String(req.headers['x-ship-fast-anon-owner'] || '').trim()
    if (header === secret) return true
    res.status(403).json({
      error:
        'This project was created in another browser or session. Open it from the device where you generated it, or sign in on the home page and claim your Ship Fast history.',
    })
    return false
  }

  async function provisionDeploymentIfNeeded(session) {
    let deployment = session.deployment || getDeploymentBySessionId(session.id)
    if (deployment) {
      if (!deployment.url && deployment.slug) {
        deployment = { ...deployment, url: `https://${deployment.slug}.${BASE_DOMAIN}` }
        session.deployment = deployment
        try {
          writeFileSync(join(session.workspace, 'deploy.json'), JSON.stringify(deployment, null, 2))
        } catch {
          void 0
        }
      }
      return deployment
    }
    let projectContext = {}
    try {
      const contextPath = join(session.workspace, 'project-context.json')
      if (existsSync(contextPath)) projectContext = JSON.parse(readFileSync(contextPath, 'utf-8'))
    } catch {
      void 0
    }
    const slug = await generateSlug(projectContext)
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
    } catch {
      void 0
    }
    const state = makeSessionState(session)
    state.broadcast({ type: 'deployed', slug: deployment.slug, url: deployment.url })
    return deployment
  }

  app.post('/api/prompt-suggestions', async (req, res) => {
    const partial = typeof req.body?.partial === 'string' ? req.body.partial : ''
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || ''
    const skipRl =
      (clientIp && WHITELISTED_IPS.has(clientIp)) || isLocalDevelopmentRequest(req, clientIp)
    if (!skipRl && clientIp) {
      if (
        !checkRateLimit(
          `prompt-suggest:${clientIp}`,
          promptSuggestIpHits,
          PROMPT_SUGGEST_MAX_PER_IP,
          PROMPT_SUGGEST_WINDOW_MS,
        )
      ) {
        return res.status(429).json({ suggestions: [] })
      }
    }
    try {
      const suggestions = await getPartialPromptSuggestions(partial)
      return res.json({ suggestions })
    } catch {
      return res.status(500).json({ suggestions: [] })
    }
  })

  // ─── Share-for-credit: grant +1 anonymous generation ────
  app.get('/api/share-bonus', (req, res) => {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip
    res.json({ claimed: clientIp ? hasIpShareBonus(clientIp) : false })
  })

  app.post('/api/share-bonus', (req, res) => {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip
    if (!clientIp) return res.status(400).json({ error: 'Unable to identify client' })
    const today = new Date().toISOString().slice(0, 10)
    if (shareBonusIps.get(clientIp) === today) {
      return res.json({ ok: true, alreadyClaimed: true })
    }
    shareBonusIps.set(clientIp, today)
    console.log(`[${new Date().toISOString()}] SHARE_BONUS ip=${clientIp}`)
    res.json({ ok: true, alreadyClaimed: false })
  })

  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(renderRobotsTxt())
  })

  app.get('/sitemap.xml', (_req, res) => {
    res.type('application/xml').send(renderSitemapXml())
  })

  app.get('/llms.txt', (_req, res) => {
    res.type('text/plain; charset=utf-8').send(renderShipFastLlmsTxt({ siteUrl: SITE_URL }))
  })

  app.get('/index.html', (_req, res) => {
    res.redirect(301, '/')
  })

  // ─── Prompt page (landing) ────────────────────────────────
  app.get('/', async (_req, res) => {
    let siteSettings = null
    if (isSanityConfigured()) {
      try {
        siteSettings = await fetchSiteSettings()
      } catch {
        siteSettings = null
      }
    }
    res
      .type('html')
      .set('X-SF-Home-Source', 'ssr')
      .set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
      .set('Pragma', 'no-cache')
      .send(renderHomePage(siteSettings))
  })

  app.get('/pricing', async (_req, res) => {
    let html = renderPricingPage()
    if (isSanityConfigured()) {
      try {
        const siteSettings = await fetchSiteSettings()
        html = applyPricingPageOverrides(html, siteSettings)
      } catch {
        /* fall through */
      }
    }
    res.type('html').set('X-SF-Pricing-Source', 'ssr').send(html)
  })

  app.get('/privacy', (_req, res) => {
    res.type('html').send(renderPrivacyPage())
  })

  mountEmbeddedSanityStudio(app, join(studioRoot, 'dist'))

  app.get('/api/studio-embed-ready', (_req, res) => {
    res.json({ built: existsSync(join(studioRoot, 'dist', 'index.html')) })
  })

  // Serve public assets statically, but keep / routed through SSR.
  app.use(
    express.static(publicDir, {
      index: false,
      maxAge: '1h',
      etag: true,
    }),
  )

  // ─── Dashboard (session-scoped) ───────────────────────────
  // ─── Session route now handled by Next.js at /src/app/session/[id]/page.tsx ───
  // app.get('/session/:id', async (req, res) => {
  //   const session = getSession(req.params.id)
  //   if (!session) return res.status(404).send('Session not found')
  //   setNoIndexHeaders(res)
  //   const tpl = readFileSync(join(publicDir, 'dashboard.html'), 'utf8')
  //   let wsHost = req.get('host') || `127.0.0.1:${DASHBOARD_PORT}`
  //   if (/:3000$/.test(wsHost)) wsHost = `${req.hostname || '127.0.0.1'}:${DASHBOARD_PORT}`
  //   res.type('html').send(tpl.replaceAll('__SF_WS_HOST__', wsHost))
  // })

  // ─── API: Create session + start generation ───────────────
  app.post('/api/sessions', optionalAuth, async (req, res) => {
    const { parseCreateSessionRequest, sanitizeSessionCreateResponse, sanitizeErrorResponse } =
      await httpContractsPromise
    const parsed = parseCreateSessionRequest(req.body ?? {})
    if (!parsed.ok) return res.status(400).json(sanitizeErrorResponse(parsed.errors.join(' | ')))
    const {
      prompt,
      preferredLanguage,
      preferredExportTarget,
      designReferenceUrls = [],
      designReferenceNotes = '',
    } = parsed.data
    const designRefFingerprint = designReferenceFingerprintFromUrls(
      designReferenceUrls,
      designReferenceNotes,
    )
    const trimmedPrompt = prompt?.trim()
    if (isGibberishPrompt(trimmedPrompt)) {
      return res.status(400).json({
        error: 'Please provide a meaningful description of the website you want to build.',
      })
    }

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip
    const ts = new Date().toISOString()

    const policyResult = checkPromptContentPolicy(trimmedPrompt)
    if (!policyResult.ok) {
      console.warn(`[${ts}] CONTENT_POLICY_BLOCKED ip=${clientIp} user=${req.user?.uid ?? 'anon'}`)
      return res
        .status(422)
        .json(sanitizeErrorResponse(CONTENT_POLICY_CLIENT_MESSAGE, { code: 'CONTENT_POLICY' }))
    }
    const skipRateLimits = isLocalDevelopmentRequest(req, clientIp) || WHITELISTED_IPS.has(clientIp)

    let session

    if (req.user) {
      // ─── Authenticated flow ─────────────────────────────────
      const isSubscriber = await hasActiveSubscription(req.user.uid)
      const userMonthly = (userMonthlyHits.get(req.user.uid) || []).filter(
        (t) => Date.now() - t < MONTHLY_WINDOW_MS,
      ).length

      console.log(
        `[${ts}] REQ user=${req.user.uid} ip=${clientIp} email=${req.user.email ?? '?'} monthly=${userMonthly} prompt="${trimmedPrompt.slice(0, 80)}"`,
      )

      // Check for exact prompt match - return existing project
      const existing = findSessionByPrompt(
        req.user.uid,
        trimmedPrompt,
        preferredLanguage,
        designRefFingerprint,
      )
      const shouldBypassBrandCache =
        existing &&
        promptLooksBrandDriven(trimmedPrompt) &&
        !existsSync(join(existing.workspace, 'brand-profile.json'))
      if (existing && !shouldBypassBrandCache) {
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
        const monthlyLimitCached = isSubscriber ? MAX_PAID_PER_MONTH : MAX_FREE_PER_MONTH
        return res.json(
          sanitizeSessionCreateResponse(existing, {
            cached: true,
            remaining: monthlyLimitCached - userMonthly,
          }),
        )
      }
      if (shouldBypassBrandCache) {
        console.log(
          `[${ts}] CACHE_BYPASS user=${req.user.uid} session=${existing.id} reason=brand_profile_missing`,
        )
      }

      // Determine subscription status and monthly limit
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

      session = createSession(_sessionsDir, trimmedPrompt, req.user.uid, {
        preferredExportTarget,
        preferredLanguage,
        isPrivate: false,
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
        // Daily limit per IP for anonymous users — sign-in wall after limit (2, or 3 with share bonus)
        const anonLimit = getAnonDailyLimit(clientIp)
        if (!checkRateLimit(clientIp, anonIpDailyHits, anonLimit, DAILY_WINDOW_MS)) {
          console.log(`[${ts}] ANON_DAILY_LIMIT ip=${clientIp} bonus=${hasIpShareBonus(clientIp)}`)
          return res.status(429).json({
            error: `Sign in to keep generating. Free anonymous users get ${MAX_ANON_PER_DAY} generations per day.`,
            remaining: 0,
            code: 'ANON_DAILY_LIMIT',
            shareBonusClaimed: hasIpShareBonus(clientIp),
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
        isPrivate: false,
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

    if (designReferenceUrls.length) {
      writeDesignReferencesFile(session.workspace, designReferenceUrls, designReferenceNotes)
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
      .then(async () => {
        setSessionStatus(session.id, 'done')
        activeGenerations.set(
          generationKey,
          Math.max(0, (activeGenerations.get(generationKey) || 0) - 1),
        )
        try {
          await provisionDeploymentIfNeeded(session)
        } catch (err) {
          console.error(`[auto-deploy] session ${session.id}:`, err?.message ?? err)
        }
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

    if (req.user) {
      generation
        .then(() => {
          for (const target of ['html', 'react', 'nextjs']) {
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
      const remaining = getAnonDailyLimit(clientIp) - currentAnon
      const anonOwnerSecret = readAnonOwnerSecret(session.workspace)
      res.json(
        sanitizeSessionCreateResponse(session, {
          cached: false,
          remaining,
          anonOwnerSecret: anonOwnerSecret || undefined,
        }),
      )
    }
  })

  // ─── API: List sessions (authenticated — own sessions) ───────
  app.get('/api/sessions', requireAuth, (req, res) => {
    const all = getAllSessions(req.user.uid)
    const wantsPage =
      req.query &&
      (Object.prototype.hasOwnProperty.call(req.query, 'page') ||
        Object.prototype.hasOwnProperty.call(req.query, 'limit'))
    if (!wantsPage) {
      res.json(all)
      return
    }
    const { limit, page } = parseGalleryPagination(req.query)
    res.json(paginateGalleryList(all, page, limit))
  })

  // ─── API: Recent public sessions gallery (no auth required) ──
  app.get('/api/sessions/recent', (req, res) => {
    const all = getPublicGalleryList()
    const { limit, page } = parseGalleryPagination(req.query)
    const paginated = paginateGalleryList(all, page, limit)
    res.set('Cache-Control', 'public, max-age=20, stale-while-revalidate=120')
    res.json(paginated)
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
  app.delete('/api/sessions/:id', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    const isDev = process.env.NODE_ENV === 'development'
    if (session.userId) {
      if (!isDev) {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
        if (session.userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' })
      }
    } else if (!isDev) {
      const secret = readAnonOwnerSecret(session.workspace)
      if (!secret) return res.status(403).json({ error: 'Forbidden' })
      const header = String(req.headers['x-ship-fast-anon-owner'] || '').trim()
      if (header !== secret) return res.status(403).json({ error: 'Forbidden' })
    }
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

    const targets = await decorateExportTargets(session, getSessionExportTargets(session))
    const payment = await getSessionPaymentDetails(session, {
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null,
      headers: req.headers,
    })
    res.json({
      id: session.id,
      prompt: session.prompt,
      createdAt: session.createdAt,
      deployment: session.deployment || null,
      homepageReady: session.homepageReady,
      siteSpecReady: session.siteSpecReady ?? false,
      preferredExportTarget: session.preferredExportTarget || 'html',
      preferredLanguage: session.preferredLanguage || 'en',
      exportTargets: targets,
      payment,
      themeOverride: session.themeOverride ?? null,
      taskCount: session.tasks.length,
      done: session.tasks.filter((t) => t.status === 'DONE').length,
      isAnonymous: !session.userId,
      ecommerce: false,
      medusaAdminEmbed: { show: false, url: null },
    })
  })

  app.post('/api/sessions/:id/apply-palette', optionalAuth, (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    const saved = writePalette(session.workspace, req.body || {})
    if (!saved) return res.status(400).json({ error: 'Invalid palette payload' })
    res.json({ ok: true, palette: saved })
  })

  app.get('/api/sessions/:id/palette', optionalAuth, (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    const palette = readPalette(session.workspace)
    res.json({ palette: palette || null })
  })

  app.get('/api/sessions/:id/chat', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    const store = await readChatStoreAsync(session.workspace, session.id)
    const editable = canSessionRunEdit(session.workspace)
    res.json({
      version: store.version,
      updatedAt: store.updatedAt,
      summary: store.summary,
      messages: store.messages,
      editable,
      mode: 'llm',
      medusaAdminEmbed: { show: false, url: null },
    })
  })

  app.patch('/api/sessions/:id/cms/site-settings', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    const sanityConfig = session.sanityConfig || undefined
    if (!sanityConfig && !isSanityChatWriteConfigured()) {
      return res.status(503).json({ error: 'Sanity CMS write is not configured on the server.' })
    }
    const result = await applySiteSettingsPatch(req.body, sanityConfig)
    if (!result.ok) {
      return res.status(400).json({ error: result.error || 'Update failed' })
    }
    res.json({ ok: true, siteSettings: result.siteSettings })
  })

  app.post(
    '/api/sessions/:id/cms/upload-image',
    optionalAuth,
    (req, res, next) => {
      chatImageUpload.single('file')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message || 'Upload failed' })
        next()
      })
    },
    async (req, res) => {
      const session = getSession(req.params.id)
      if (!session) return res.status(404).json({ error: 'Session not found' })
      if (!ensureSessionArtifactAccess(req, res, session)) return
      const sanityConfig = session.sanityConfig || undefined
      if (!sanityConfig && !isSanityChatWriteConfigured()) {
        return res.status(503).json({ error: 'Sanity CMS write is not configured on the server.' })
      }
      const file = req.file
      if (!file?.buffer) return res.status(400).json({ error: 'No image file' })
      const client = createSanityWriteClient(sanityConfig)
      if (!client) return res.status(503).json({ error: 'Sanity write client unavailable.' })
      try {
        const asset = await client.assets.upload('image', file.buffer, {
          filename: file.originalname || 'image.jpg',
        })
        const doc = asset?.document || asset
        const url = doc?.url || asset?.url
        if (!url) return res.status(500).json({ error: 'Upload did not return a URL' })
        const assetId = doc?._id || asset?._id || ''
        res.json({ ok: true, url, ...(assetId ? { assetId } : {}) })
      } catch (e) {
        res.status(500).json({ error: e?.message ? String(e.message) : 'Upload failed' })
      }
    },
  )

  app.get('/api/sessions/:id/cms/media', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    const sanityConfig = session.sanityConfig || undefined
    if (!sanityConfig && !isSanityConfigured()) {
      return res.status(503).json({ error: 'Sanity is not configured on the server.' })
    }
    const limit = Math.min(60, Math.max(1, parseInt(String(req.query.limit || '24'), 10) || 24))
    const assets = await fetchSanityImageAssets(limit, sanityConfig)
    res.json({ assets })
  })

  app.post(
    '/api/sessions/:id/uploads',
    optionalAuth,
    (req, res, next) => {
      chatImageUpload.array('files', 12)(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message || 'Upload failed' })
        next()
      })
    },
    async (req, res) => {
      const session = getSession(req.params.id)
      if (!session) return res.status(404).json({ error: 'Session not found' })
      if (!ensureSessionArtifactAccess(req, res, session)) return
      if (!canSessionRunEdit(session.workspace)) {
        return res.status(409).json({
          error:
            'Uploads are available after the initial site is generated. Finish generation first.',
        })
      }
      const files = req.files
      if (!files?.length) return res.status(400).json({ error: 'No image files' })
      const saved = saveSessionImageBuffers(
        session.workspace,
        files.map((f) => ({
          buffer: f.buffer,
          mimetype: f.mimetype,
          originalname: f.originalname,
        })),
      )
      if (!saved.length) return res.status(400).json({ error: 'No valid images saved' })
      res.json({ ok: true, files: saved })
    },
  )

  app.post('/api/sessions/:id/chat', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return

    let raw = req.body?.text ?? req.body?.message ?? ''
    if (typeof raw !== 'string') raw = ''
    const attachmentPaths = sanitizeChatAttachmentPaths(
      session.workspace,
      req.body?.attachmentPaths,
    )
    if (!normalizePromptText(raw) && attachmentPaths.length) {
      raw =
        'Apply the attached images across the site: use them for the hero, gallery, cards, logos, and other images as appropriate.'
    }
    let text
    try {
      text = requirePromptText(raw)
    } catch (e) {
      return res.status(400).json({ error: e.message || 'Invalid text' })
    }

    const policyResult = checkPromptContentPolicy(text)
    if (!policyResult.ok) return res.status(400).json({ error: CONTENT_POLICY_CLIENT_MESSAGE })

    if (!canSessionRunEdit(session.workspace)) {
      return res.status(409).json({
        error:
          'Chat editing is available after the initial site is generated. Finish generation first.',
      })
    }

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip
    const skipRateLimits = isLocalDevelopmentRequest(req, clientIp) || WHITELISTED_IPS.has(clientIp)

    if (!skipRateLimits) {
      if (req.user) {
        if (!checkRateLimit(req.user.uid, userHits, MAX_PER_USER)) {
          return res.status(429).json({ error: 'Rate limit: too many edit requests. Please wait.' })
        }
      } else if (!checkRateLimit(clientIp, ipHits, MAX_PER_IP)) {
        return res.status(429).json({ error: 'Rate limit: too many edit requests. Please wait.' })
      }
      const generationKey = req.user?.uid || clientIp
      if ((activeGenerations.get(generationKey) || 0) >= MAX_CONCURRENT_PER_USER) {
        return res.status(429).json({
          error: `You already have ${MAX_CONCURRENT_PER_USER} operations in progress. Please wait.`,
        })
      }
    }

    const store = await readChatStoreAsync(session.workspace, session.id)
    const composed = buildComposedEditPrompt(store.summary, store.messages, text, {
      attachments: attachmentPaths,
    })
    const userLine =
      attachmentPaths.length > 0
        ? `${text}\n\nAttached: ${attachmentPaths.map((p) => p.replace(/^user-uploads\//, '')).join(', ')}`
        : text
    appendUserMessage(session.workspace, store, userLine, session.id)

    const sessionCtx = makeSessionState(session)
    setSessionStatus(session.id, 'generating')
    const generationKey = req.user?.uid || clientIp
    if (!skipRateLimits) {
      activeGenerations.set(generationKey, (activeGenerations.get(generationKey) || 0) + 1)
    }

    const run = async () => {
      try {
        await runEdit({ prompt: composed, workspace: session.workspace, sessionCtx })
        const st = readChatStore(session.workspace)
        appendAssistantMessage(session.workspace, st, 'Edit applied. Preview updated.', session.id)
        setSessionStatus(session.id, 'done')
      } catch (err) {
        if (!skipRateLimits) {
          if (req.user) refundRateLimit(req.user.uid, userHits)
          else refundRateLimit(clientIp, ipHits)
        }
        const msg = err?.message ? String(err.message).slice(0, 500) : 'Edit failed'
        const st = readChatStore(session.workspace)
        appendAssistantMessage(session.workspace, st, `Edit failed: ${msg}`, session.id)
        setSessionStatus(session.id, 'failed')
        sessionCtx.broadcast({ type: 'error', message: msg })
      } finally {
        if (!skipRateLimits) {
          activeGenerations.set(
            generationKey,
            Math.max(0, (activeGenerations.get(generationKey) || 0) - 1),
          )
        }
      }
    }

    void run()
    res.status(202).json({ ok: true, accepted: true })
  })

  app.delete('/api/sessions/:id/chat', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    clearChatStore(session.workspace, session.id)
    res.json({ ok: true })
  })

  app.post('/api/sessions/:id/deploy', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    try {
      const deployment = await provisionDeploymentIfNeeded(session)
      res.json({
        ok: true,
        slug: deployment.slug,
        url: deployment.url,
        deployedAt: deployment.deployedAt,
      })
    } catch {
      res.status(500).json({ error: 'Deployment failed' })
    }
  })

  app.get('/api/sessions/:id/deploy', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    const existing = session.deployment || getDeploymentBySessionId(session.id)
    if (existing) {
      const response = existing.url
        ? existing
        : { ...existing, url: `https://${existing.slug}.${BASE_DOMAIN}` }
      if (!existing.url && response.url) {
        session.deployment = response
        try {
          writeFileSync(join(session.workspace, 'deploy.json'), JSON.stringify(response, null, 2))
        } catch {
          void 0
        }
      }
      return res.json({
        deployed: true,
        slug: response.slug,
        url: response.url,
        deployedAt: response.deployedAt,
      })
    }

    if (!ensureSessionArtifactAccess(req, res, session)) return
    res.json({ deployed: false })
  })

  app.get('/api/sessions/:id/export-targets', async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    const targets = await decorateExportTargets(session, getSessionExportTargets(session))
    const payment = await getSessionPaymentDetails(session, {
      ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null,
      headers: req.headers,
    })
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

  // ─── Preview history (per-session checkpoints) ──────────────
  const HISTORY_MAX_ENTRIES = 50
  const CHECKPOINT_ID_RE = /^[0-9a-zA-Z:_.-]+$/

  function historyDir(session) {
    return join(session.workspace, 'history')
  }
  function historyIndexPath(session) {
    return join(historyDir(session), 'index.json')
  }
  function readHistoryIndex(session) {
    const p = historyIndexPath(session)
    if (!existsSync(p)) return []
    try {
      const parsed = JSON.parse(readFileSync(p, 'utf8'))
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  function writeHistoryIndex(session, entries) {
    const dir = historyDir(session)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(historyIndexPath(session), JSON.stringify(entries, null, 2))
  }
  function writeHistoryCheckpoint(session, html) {
    const dir = historyDir(session)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    const now = new Date()
    const id = now.toISOString().replace(/[^0-9a-zA-Z:_.-]/g, '-')
    writeFileSync(join(dir, `${id}.html`), html, 'utf8')
    const entries = readHistoryIndex(session)
    entries.push({ id, at: now.getTime(), label: null })
    while (entries.length > HISTORY_MAX_ENTRIES) {
      const evicted = entries.shift()
      if (evicted && CHECKPOINT_ID_RE.test(String(evicted.id))) {
        try {
          unlinkSync(join(dir, `${evicted.id}.html`))
        } catch {
          void 0
        }
      }
    }
    writeHistoryIndex(session, entries)
    return id
  }

  app.post('/api/sessions/:id/preview-homepage-html', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    const raw = req.body?.html
    if (typeof raw !== 'string' || raw.length < 12)
      return res.status(400).json({ error: 'Invalid html' })
    if (raw.length > 14 * 1024 * 1024) return res.status(413).json({ error: 'Too large' })
    try {
      const cleaned = stripPreviewArtifactsFromHtml(raw)
      if (htmlLooksDegenerate(cleaned))
        return res
          .status(422)
          .json({ error: 'Homepage HTML failed quality check (repetition or invalid structure)' })
      writeFileSync(join(session.workspace, 'index.html'), cleaned, 'utf8')
      session.homepageReady = true
      let checkpointId = null
      try {
        checkpointId = writeHistoryCheckpoint(session, cleaned)
      } catch {
        // history is best-effort; primary save already succeeded.
        checkpointId = null
      }
      makeSessionState(session).broadcast({ type: 'preview_reload', at: Date.now() })
      res.json({ ok: true, checkpointId })
    } catch {
      res.status(500).json({ error: 'Save failed' })
    }
  })

  app.get('/api/sessions/:id/history', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    try {
      const entries = readHistoryIndex(session)
      res.json({ entries })
    } catch {
      res.json({ entries: [] })
    }
  })

  app.post(
    '/api/sessions/:id/history/:checkpointId/restore',
    optionalAuth,
    async (req, res) => {
      const session = getSession(req.params.id)
      if (!session) return res.status(404).json({ error: 'Session not found' })
      if (!ensureSessionArtifactAccess(req, res, session)) return
      const checkpointId = String(req.params.checkpointId || '')
      if (!checkpointId || !CHECKPOINT_ID_RE.test(checkpointId)) {
        return res.status(400).json({ error: 'Invalid checkpointId' })
      }
      if (checkpointId.includes('..') || checkpointId.includes('/')) {
        return res.status(400).json({ error: 'Invalid checkpointId' })
      }
      const checkpointPath = join(historyDir(session), `${checkpointId}.html`)
      if (!existsSync(checkpointPath)) {
        return res.status(404).json({ error: 'Checkpoint not found' })
      }
      try {
        const html = readFileSync(checkpointPath, 'utf8')
        writeFileSync(join(session.workspace, 'index.html'), html, 'utf8')
        session.homepageReady = true
        makeSessionState(session).broadcast({ type: 'preview_reload', at: Date.now() })
        res.json({ ok: true })
      } catch {
        res.status(500).json({ error: 'Restore failed' })
      }
    },
  )

  app.post('/api/sessions/:id/preview-inline-text', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    const text = req.body?.text
    const instruction = req.body?.instruction
    const outputLanguage = req.body?.outputLanguage
    if (typeof text !== 'string' || typeof instruction !== 'string') {
      return res.status(400).json({ error: 'text and instruction required' })
    }
    if (text.length > 12000 || instruction.length > 4000)
      return res.status(400).json({ error: 'Too long' })
    if (outputLanguage !== 'en' && outputLanguage !== 'indian') {
      return res.status(400).json({ error: 'Invalid outputLanguage' })
    }
    const mode = resolveLanguageModeFromPreference(session.preferredLanguage)
    if (outputLanguage === 'indian' && !mode.isIndian) {
      return res
        .status(400)
        .json({ error: 'Indian-language output is only available for Indian-language projects' })
    }
    const userBlock = `Current UI text:\n${text}\n\nUser instruction:\n${instruction}`
    const sysEn =
      'You improve short website UI copy. Output ONLY the improved plain text. No quotation marks wrapping the whole answer, no markdown fences, no preamble or explanation.'
    const maxTok = Math.min(2000, LLM_CONFIG.parallel.maxTokens)
    try {
      if (outputLanguage === 'en') {
        const r = await groq(userBlock, {
          model: HOMEPAGE_MODEL,
          system: sysEn,
          temperature: 0.35,
          maxTokens: maxTok,
        })
        if (r.error) return res.status(502).json({ error: String(r.error) })
        return res.json({ text: trimInlineAiText(r.content) })
      }
      const langName = mode.language?.name || mode.name
      const native = mode.language?.nativeName || langName
      const sysIn = `You improve short website UI copy. Output ONLY the improved plain text in ${langName} (${native}). Use the correct script. Do not use English unless the user explicitly asks for English. No quotation marks wrapping the whole answer, no markdown fences, no preamble.`
      if (mode.isIndian && RUNPOD_API_URL && RUNPOD_API_KEY) {
        try {
          const r = await hex1(userBlock, {
            system: sysIn,
            temperature: 0.35,
            maxTokens: maxTok,
          })
          if (r.content && !r.error) {
            return res.json({ text: trimInlineAiText(r.content) })
          }
        } catch {
          void 0
        }
      }
      const r = await groq(userBlock, {
        model: HOMEPAGE_MODEL,
        system: sysIn,
        temperature: 0.35,
        maxTokens: maxTok,
      })
      if (r.error) return res.status(502).json({ error: String(r.error) })
      return res.json({ text: trimInlineAiText(r.content) })
    } catch (error) {
      res.status(500).json({ error: error?.message || 'Failed' })
    }
  })

  app.post('/api/sessions/:id/preview-inline-style', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    const rawFragment = req.body?.fragmentHtml
    const instruction = req.body?.instruction
    const computedStylesIn = req.body?.computedStyles
    const tokensIn = req.body?.tokens
    const friendlyLabelIn = req.body?.friendlyLabel
    const scopeIn = req.body?.scope
    if (typeof rawFragment !== 'string' || typeof instruction !== 'string') {
      return res.status(400).json({ error: 'fragmentHtml and instruction required' })
    }
    const fragmentHtml = compactStyleFragmentHtml(rawFragment)
    if (fragmentHtml.length > 300000 || instruction.length > 8000)
      return res.status(400).json({ error: 'Too long' })
    if (!fragmentHtml.includes('<')) return res.status(400).json({ error: 'Invalid fragment' })
    const hadLargeEmbeddedImage = /data:image\/[a-z0-9+.@-]+;base64,[A-Za-z0-9+/=\s]{800,}/i.test(
      rawFragment,
    )

    // Normalize the extended, optional inputs so they are safe to inline into
    // the prompt context (defensive caps; silently dropped if the shapes are off).
    let computedStylesStr = ''
    if (typeof computedStylesIn === 'string') {
      computedStylesStr = computedStylesIn.slice(0, 8000)
    } else if (computedStylesIn && typeof computedStylesIn === 'object') {
      try {
        computedStylesStr = JSON.stringify(computedStylesIn).slice(0, 8000)
      } catch {
        computedStylesStr = ''
      }
    }
    let tokensStr = ''
    if (Array.isArray(tokensIn)) {
      try {
        tokensStr = JSON.stringify(tokensIn).slice(0, 8000)
      } catch {
        tokensStr = ''
      }
    }
    const friendlyLabel =
      typeof friendlyLabelIn === 'string' ? friendlyLabelIn.slice(0, 120) : ''
    const scope =
      scopeIn === 'element' || scopeIn === 'section' || scopeIn === 'page' ? scopeIn : 'element'

    const extraContext = [
      friendlyLabel ? `Friendly label: ${friendlyLabel}` : '',
      `Scope: ${scope}`,
      computedStylesStr ? `Computed styles (whitelist):\n${computedStylesStr}` : '',
      tokensStr ? `Available palette tokens (prefer var(--name) values):\n${tokensStr}` : '',
    ]
      .filter(Boolean)
      .join('\n\n')

    const userBlock = `Current element HTML:\n${fragmentHtml}\n\nRequested visual changes:\n${instruction}${
      extraContext ? `\n\n${extraContext}` : ''
    }${
      hadLargeEmbeddedImage
        ? '\n\nNote: A large data-URL image in src was omitted from the snippet. Keep the img tag; adjust classes, sizes, and alt text. To replace with a new generated photo, the UI has a separate image generation action.'
        : ''
    }`
    const sys =
      'You adjust a single HTML element for layout and styling. You may return EITHER (a) a replacement HTML fragment for the element (from its opening tag through its closing tag) OR (b) a JSON object of the form {"styleDiff":[{"selector":"...","property":"...","value":"...","before":"..."}],"tokensUsed":["--primary",...]} when the change is purely stylistic. Prefer JSON styleDiff for pure styling edits; prefer HTML when structure changes. When palette tokens are provided, prefer CSS values like var(--primary) over raw hex so palette swaps propagate. Preserve inner text and child elements unless the user explicitly asks to change copy. Tailwind-style utility classes on the element and wrappers are allowed when returning HTML. Do not wrap the answer in markdown code fences. No commentary before or after the output.'
    const maxTok = Math.min(8000, LLM_CONFIG.parallel.maxTokens)
    try {
      const r = await groq(userBlock, {
        model: HOMEPAGE_MODEL,
        system: sys,
        temperature: 0.25,
        maxTokens: maxTok,
      })
      if (r.error) return res.status(502).json({ error: String(r.error) })
      const raw = typeof r.content === 'string' ? r.content.trim() : ''

      // Try JSON first: the model may return {styleDiff, tokensUsed}.
      if (raw.startsWith('{')) {
        try {
          const parsed = JSON.parse(raw)
          if (parsed && Array.isArray(parsed.styleDiff)) {
            return res.json({
              styleDiff: parsed.styleDiff,
              tokensUsed: Array.isArray(parsed.tokensUsed) ? parsed.tokensUsed : undefined,
            })
          }
        } catch {
          void 0
        }
      }

      const html = trimInlineAiHtmlFragment(r.content)
      if (!html.includes('<') || html.length < 3) {
        return res.status(502).json({ error: 'Model did not return valid HTML' })
      }
      return res.json({ html })
    } catch (error) {
      res.status(500).json({ error: error?.message || 'Failed' })
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

  app.get('/api/credits', requireAuth, async (req, res) => {
    const credits = await getUserCredits(req.user.uid)
    res.json({ credits })
  })

  app.get('/api/sessions/:id/download/:target', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    if (!req.user) {
      return res.status(401).json({ error: 'Sign in to download your projects' })
    }
    if (!session.userId) {
      return res.status(403).json({
        error:
          'Claim this project from the Ship Fast home page after signing in to download exports.',
      })
    }
    if (session.userId !== req.user.uid) {
      return res.status(403).json({ error: 'You do not own this session' })
    }

    const target = String(req.params.target || '').toLowerCase()
    const accessDecision = await getDownloadAccessDecision(session, target)
    if (!accessDecision.allowed) {
      return res.status(402).json({
        error: accessDecision.error,
        payment: accessDecision.payment,
      })
    }

    // Consume a credit if using credit-based access (not subscription)
    if (accessDecision.useCredit && session.userId) {
      await consumeUserCredit(session.userId)
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

  app.post('/api/sessions/:id/sync-sanity-preview', requireAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    try {
      const preview = await syncSessionPreviewFromSanity(session)
      const sessionCtx = makeSessionState(session)
      sessionCtx.signalHomepageReady()
      sessionCtx.broadcast({ type: 'preview_reload', at: Date.now() })
      res.json({ ok: true, files: Object.keys(preview.files) })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  // Dashboard calls /api/provision/{type} with sessionId in body
  app.post('/api/provision/sanity', async (req, res) => {
    const id = req.body?.sessionId
    if (!id) return res.status(400).json({ error: 'sessionId required' })
    req.params = { id }
    const session = getSession(id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.sanityConfig) {
      const safeConfig = {
        projectId: session.sanityConfig.projectId,
        dataset: session.sanityConfig.dataset,
        apiVersion: session.sanityConfig.apiVersion,
        provisionedAt: session.sanityConfig.provisionedAt,
      }
      return res.json({ success: true, config: safeConfig, alreadyProvisioned: true })
    }
    if (!isSanityProvisionable()) {
      return res.status(503).json({
        error:
          'Sanity provisioning not configured (missing SANITY_PROJECT_ID or SANITY_MANAGEMENT_TOKEN)',
      })
    }
    const config = await provisionSanityForSession(id)
    await setSanityConfig(id, config)
    const safeConfig = {
      projectId: config.projectId,
      dataset: config.dataset,
      apiVersion: config.apiVersion,
      provisionedAt: config.provisionedAt,
    }
    res.json({ success: true, config: safeConfig })
  })

  app.post('/api/provision/medusa', async (req, res) => {
    const id = req.body?.sessionId
    if (!id) return res.status(400).json({ error: 'sessionId required' })
    const session = getSession(id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.medusaConfig) {
      return res.json({ success: true, config: session.medusaConfig, alreadyProvisioned: true })
    }
    if (!isMedusaProvisionable()) {
      return res.status(503).json({ error: 'Medusa provisioning not configured' })
    }
    const config = await provisionMedusaForSession(id, session.prompt?.slice(0, 50))
    await setMedusaConfig(id, config)
    res.json({ success: true, config })
  })

  app.post('/api/sessions/:id/provision/sanity', requireProvisionAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    if (session.sanityConfig) {
      const safeConfig = {
        projectId: session.sanityConfig.projectId,
        dataset: session.sanityConfig.dataset,
        apiVersion: session.sanityConfig.apiVersion,
        provisionedAt: session.sanityConfig.provisionedAt,
      }
      return res.json({ success: true, config: safeConfig, alreadyProvisioned: true })
    }

    if (!isSanityProvisionable()) {
      return res.status(503).json({
        error:
          'Sanity provisioning not configured (missing SANITY_PROJECT_ID or SANITY_MANAGEMENT_TOKEN)',
      })
    }

    const config = await provisionSanityForSession(req.params.id)
    await setSanityConfig(req.params.id, config)

    const safeConfig = {
      projectId: config.projectId,
      dataset: config.dataset,
      apiVersion: config.apiVersion,
      provisionedAt: config.provisionedAt,
    }
    res.json({ success: true, config: safeConfig })
  })

  app.post('/api/sessions/:id/provision/medusa', requireProvisionAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })

    if (session.medusaConfig) {
      return res.json({ success: true, config: session.medusaConfig, alreadyProvisioned: true })
    }

    if (!isMedusaProvisionable()) {
      return res.status(503).json({ error: 'Medusa provisioning not configured' })
    }

    const config = await provisionMedusaForSession(req.params.id, session.prompt?.slice(0, 50))
    await setMedusaConfig(req.params.id, config)

    res.json({ success: true, config })
  })

  app.get('/api/sessions/:id/medusa-config', requireAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json(session.medusaConfig || null)
  })

  app.get('/api/sessions/:id/next-preview', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    res.json(getNextPreviewSnapshot(session))
  })

  app.post('/api/sessions/:id/next-preview/start', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    if (!isNextPreviewFeatureEnabled()) {
      return res.status(403).json({ error: 'Next preview is disabled in this environment' })
    }
    try {
      const sessionCtx = makeSessionState(session)
      const out = await startNextPreview(session, (msg) => sessionCtx.broadcast(msg))
      res.json(out)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Failed to start Next preview' })
    }
  })

  app.post('/api/sessions/:id/next-preview/stop', optionalAuth, async (req, res) => {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!ensureSessionArtifactAccess(req, res, session)) return
    res.json(stopNextPreview(session.id))
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
    const accessDecision = await getDownloadAccessDecision(session, target)
    if (!accessDecision.allowed) {
      return res.status(402).json({
        error: accessDecision.error,
        payment: accessDecision.payment,
      })
    }

    // Consume a credit if using credit-based access (not subscription)
    if (accessDecision.useCredit && session.userId) {
      await consumeUserCredit(session.userId)
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

  // ─── API: Ecommercify — return all Ship Fast ecommerce products ──
  // Used by the Medusa admin widget to pull products into Medusa.
  app.options('/api/ecommercify/products', (_req, res) => {
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
    )
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.sendStatus(204)
  })

  app.get('/api/ecommercify/products', (req, res) => {
    res.setHeader(
      'Access-Control-Allow-Origin',
      process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
    )

    if (!_sessionsDir) return res.json({ products: [], total: 0 })

    const filterSessionId = String(req.query.sessionId || '').trim()
    if (!filterSessionId) {
      return res.json({
        products: [],
        total: 0,
        message: 'sessionId query parameter is required',
      })
    }

    const scopedSession = getSession(filterSessionId)
    if (!scopedSession) {
      return res.json({
        products: [],
        total: 0,
        message: 'Unknown session',
      })
    }

    const slugify = (s) =>
      String(s || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'product'

    // Generic placeholder titles that ship-fast uses when real product names aren't specified
    const PLACEHOLDER_TITLES = new Set([
      'premium pick',
      'customer favorite',
      'new arrival',
      'limited run',
      'best seller',
      'premium product',
      'featured product',
      'top pick',
      'popular item',
      'trending now',
      'staff pick',
      "editor's choice",
      'editor choice',
      'most loved',
      'new release',
      'hot deal',
      'special offer',
      'shop now',
      'view product',
      'buy now',
      'add to cart',
      'explore now',
    ])

    // Extract real products from rendered HTML (most reliable source — section.items often
    // contains generic placeholders; the rendered HTML has the actual product catalogue)
    const extractFromHtml = (html, sessionId, sessionPrompt) => {
      const products = []
      const seen = new Set()

      // Strategy 1: split by <article> — most generated sites wrap cards in <article>
      const parts = html.split(/<article\b/)
      if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) {
          const chunk = parts[i]
          const h3Match = chunk.match(/<h3[^>]*>([^<]{3,80})<\/h3>/)
          if (!h3Match) continue
          const title = h3Match[1].trim()
          const lc = title.toLowerCase()
          if (PLACEHOLDER_TITLES.has(lc) || seen.has(lc)) continue
          const priceMatch = chunk.match(/[₹$€£]([\d,]+(?:\.\d{2})?)/)
          if (!priceMatch) continue
          const imgMatch = chunk.match(/<img[^>]+src="([^"]+)"/)
          const descMatch = chunk.match(/<p[^>]*>([^<]{10,200})<\/p>/)
          const priceNum = parseFloat(priceMatch[1].replace(/,/g, ''))
          const priceStr = priceMatch[0]
          seen.add(lc)
          products.push({
            id: slugify(title),
            title,
            handle: slugify(title),
            description: descMatch?.[1]?.trim() || '',
            price: priceNum,
            currency: priceStr.startsWith('₹')
              ? 'INR'
              : priceStr.startsWith('€')
                ? 'EUR'
                : priceStr.startsWith('£')
                  ? 'GBP'
                  : 'USD',
            image: imgMatch?.[1] || null,
            category: '',
            sessionId,
            sessionPrompt,
          })
        }
      }

      // Strategy 2: fallback for sites that use div/li cards — h3 + nearby price in 600-char window
      if (products.length === 0) {
        const h3Regex = /<h3[^>]*>([^<]{3,80})<\/h3>/g
        let m
        while ((m = h3Regex.exec(html)) !== null) {
          const title = m[1].trim()
          const lc = title.toLowerCase()
          if (PLACEHOLDER_TITLES.has(lc) || seen.has(lc)) continue
          const pos = m.index
          const fwd = html.slice(pos, pos + 600)
          const priceMatch = fwd.match(/[₹$€£]([\d,]+(?:\.\d{2})?)/)
          if (!priceMatch) continue
          // Look in a 2500-char window for the nearest img
          const window2 = html.slice(Math.max(0, pos - 2000), pos + 600)
          const imgMatches = [...window2.matchAll(/<img[^>]+src="([^"]+)"/g)]
          const imgMatch = imgMatches[imgMatches.length - 1]
          const descMatch = fwd.match(/<p[^>]*>([^<]{10,200})<\/p>/)
          const priceNum = parseFloat(priceMatch[1].replace(/,/g, ''))
          const priceStr = priceMatch[0]
          seen.add(lc)
          products.push({
            id: slugify(title),
            title,
            handle: slugify(title),
            description: descMatch?.[1]?.trim() || '',
            price: priceNum,
            currency: priceStr.startsWith('₹')
              ? 'INR'
              : priceStr.startsWith('€')
                ? 'EUR'
                : priceStr.startsWith('£')
                  ? 'GBP'
                  : 'USD',
            image: imgMatch?.[1] || null,
            category: '',
            sessionId,
            sessionPrompt,
          })
        }
      }
      return products
    }

    const seen = new Set()
    const products = []
    const s = scopedSession

    if (!s.siteSpecReady) {
      return res.json({ products: [], total: 0, message: 'Site spec not ready' })
    }

    const workspace = join(_sessionsDir, s.id)
    const spec = loadSiteSpec(workspace)
    if (!spec || spec.siteType !== 'ecommerce') {
      return res.json({ products: [], total: 0, message: 'Not an ecommerce site spec' })
    }

    const pages = Array.isArray(spec.pages) ? spec.pages : []
    let extracted = false
    for (const page of pages) {
      const html = page.renderBlueprint?.bodyHtml
      if (!html) continue
      const pageProducts = extractFromHtml(html, s.id, s.prompt || '')
      for (const p of pageProducts) {
        if (seen.has(p.handle)) continue
        seen.add(p.handle)
        products.push(p)
      }
      if (pageProducts.length > 0) extracted = true
    }

    if (!extracted) {
      const PRODUCT_SECTION_TYPES = new Set([
        'featured-products',
        'product-grid',
        'product-detail',
        'product-list',
      ])
      for (const page of pages) {
        const sections = Array.isArray(page.sections) ? page.sections : []
        for (const section of sections) {
          if (!PRODUCT_SECTION_TYPES.has(section.type)) continue
          const items = Array.isArray(section.items) ? section.items : []
          for (const item of items) {
            if (!item.title) continue
            const lc = item.title.toLowerCase().trim()
            if (PLACEHOLDER_TITLES.has(lc) || seen.has(slugify(item.title))) continue
            seen.add(slugify(item.title))
            products.push({
              id: item.id || slugify(item.title),
              title: item.title,
              handle: slugify(item.title),
              description: item.body || item.description || '',
              price: item.price || null,
              image: item.image || item.thumbnail || null,
              category: item.label || item.category || '',
              sessionId: s.id,
              sessionPrompt: s.prompt,
            })
          }
        }
      }
    }

    res.json({ products, total: products.length })
  })

  // ─── Catch-all 404 handler ──────────────────────────────
  app.use((req, res, next) => {
    if (req.path.startsWith('/preview/')) return next()
    res.status(404)
    if (req.path.startsWith('/api/')) {
      return res.json({ error: 'Not found' })
    }
    res.redirect('/')
  })

  // ─── Preview: per-session workspace static files ──────────
  // No trailing-slash redirect here: the Next.js `/preview/:path*` rewrite
  // strips the slash when forwarding to this backend, so any 302 we issue
  // to `/preview/:id/` re-enters the rewrite and loops forever. All in-app
  // /preview/ URLs are constructed with the trailing slash already; for
  // direct no-slash hits the static handler below serves index.html and
  // the browser URL bar just lacks the slash (relative assets may 404).
  app.use(
    '/preview/:sessionId',
    (req, res, next) => {
      setNoIndexHeaders(res)
      // Cache preview files aggressively - they don't change once generated
      res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
      next()
    },
    (req, res, next) => {
      const session = getSession(req.params.sessionId)
      if (!session) return res.status(404).send('Session not found')
      const fp = filePathForPreviewRequest(session.workspace, req)
      if (fp && extname(fp) === '.html') {
        try {
          const html = readFileSync(fp, 'utf8')
          res
            .type('html')
            .send(
              injectPreviewToolsHtml(
                html,
                req.params.sessionId,
                session.preferredLanguage,
                session.workspace,
                readPalette(session.workspace),
              ),
            )
        } catch {
          express.static(session.workspace, { extensions: ['html'] })(req, res, next)
        }
        return
      }
      express.static(session.workspace, { extensions: ['html'] })(req, res, next)
    },
  )

  app.use((err, req, res, next) => {
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Invalid JSON' })
    }
    return next(err)
  })

  const httpServer = createHttpServer(app)
  setupWebSocket(httpServer)

  await new Promise((resolve) => httpServer.listen(DASHBOARD_PORT, resolve))
  console.log(`  Server      → http://localhost:${DASHBOARD_PORT}`)
  console.log(`  Sessions dir: ${_sessionsDir}`)
  void ensureSanityCorsOrigins().catch(() => {})
  const stopNextPreviewOnExit = () => {
    shutdownNextPreview()
  }
  process.once('SIGINT', stopNextPreviewOnExit)
  process.once('SIGTERM', stopNextPreviewOnExit)
}

/** Start a session from CLI (backward compat) */
export async function startCLISession(workspace, prompt) {
  const normalizedPrompt = requirePromptText(prompt)
  const policyResult = checkPromptContentPolicy(normalizedPrompt)
  if (!policyResult.ok) throw new Error(CONTENT_POLICY_CLIENT_MESSAGE)
  const session = createSession(_sessionsDir || workspace, normalizedPrompt)
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
    ? runEdit({ prompt: normalizedPrompt, workspace, sessionCtx })
    : runAll({
        prompt: normalizedPrompt,
        workspace,
        sessionCtx,
        preferredLanguage: session.preferredLanguage,
      })

  return { session, generation }
}
