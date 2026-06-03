// @ts-nocheck
import { THEME_PRESETS } from './theme-presets'
import { deriveCustomPalette } from './palette-derive'
import './preview-editor/index'
// ─── Config ────────────────────────────────────────────────
const SESSION_ID = location.pathname.split('/session/')[1]?.split('/')[0] ?? ''
const SF_EMBED_HOME = (() => {
  try {
    return new URLSearchParams(location.search).get('embed') === '1'
  } catch {
    return false
  }
})()
const PREVIEW_BASE = `${location.origin}/preview/${SESSION_ID}`
const WS_HOST = (() => {
  // When served from Next.js (port 3000), Express WS is on port 7420
  const h = location.hostname
  const p = location.port
  if (p === '3000' || p === '') return `${h}:7420`
  return location.host
})()
const WS_URL = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${WS_HOST}?session=${SESSION_ID}`
const TYPING_SPEED_MS = 40
const PAYMENT_COUNTRY_HINT = detectCountryHint()
let deploymentState = null
let deployBusy = false
let sessionPreferredLanguage = 'en'

function getAnonOwnerHeaderValue() {
  try {
    const raw = localStorage.getItem('sf_anon_sessions')
    if (!raw) return ''
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return ''
    const hit = list.find((s) => s && s.id === SESSION_ID)
    return hit && hit.secret ? String(hit.secret) : ''
  } catch {
    return ''
  }
}

function detectCountryHint() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  if (timezone === 'Asia/Kolkata') return 'IN'

  const languages =
    Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language]
  if (languages.some((entry) => /-IN\b/i.test(String(entry || '')))) return 'IN'

  return ''
}

async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (PAYMENT_COUNTRY_HINT === 'IN') {
    headers['X-Ship-Fast-Country-Hint'] = PAYMENT_COUNTRY_HINT
  }
  const anonSecret = getAnonOwnerHeaderValue()
  if (anonSecret) headers['X-Ship-Fast-Anon-Owner'] = anonSecret
  try {
    const getTok = window.shipFastDashboardAuth?.getCurrentIdToken
    if (typeof getTok === 'function') {
      const token = await Promise.race([
        getTok.call(window.shipFastDashboardAuth),
        new Promise((resolve) => setTimeout(() => resolve(null), 2500)),
      ])
      if (token) headers.Authorization = `Bearer ${token}`
    }
  } catch {}
  return fetch(url, { ...options, headers })
}

function formatDeploymentUrl(url) {
  return url ? String(url) : ''
}

function isRailUnlocked() {
  return Boolean(paymentState?.access?.targetUnlocked)
}

function requirePremium() {
  if (isRailUnlocked()) return true
  if (isAnonymousSession) {
    openAuthWall()
    return false
  }
  if (!paymentState) return true
  openPaymentModal(railPaywallEntry())
  return false
}

function showRailToast(message, durationMs) {
  let el = document.getElementById('rail-toast')
  if (!el) {
    el = document.createElement('div')
    el.id = 'rail-toast'
    el.className = 'rail-toast'
    el.setAttribute('role', 'status')
    el.setAttribute('aria-live', 'polite')
    document.body.appendChild(el)
  }
  el.textContent = String(message || '')
  // Force reflow so the transition kicks in reliably on rapid re-triggers.
  void el.offsetHeight
  el.classList.add('is-visible')
  if (el._sfToastTimer) clearTimeout(el._sfToastTimer)
  el._sfToastTimer = setTimeout(
    () => el.classList.remove('is-visible'),
    Math.max(600, Number(durationMs) || 2600),
  )
}

function setRailRowBusy(action, isBusy, busyLabel) {
  const row = document.querySelector(`[data-rail-action="${action}"]`)
  if (!row) return
  row.classList.toggle('preview-site-rail-row--busy', Boolean(isBusy))
  const label = row.querySelector('.preview-site-rail-row-label')
  if (label) {
    if (isBusy) {
      if (!row._sfOriginalLabel) row._sfOriginalLabel = label.textContent
      if (busyLabel) label.textContent = busyLabel
    } else if (row._sfOriginalLabel) {
      label.textContent = row._sfOriginalLabel
      row._sfOriginalLabel = null
    }
  }
}

function syncToastGenerateAnotherVisibility() {
  const unlocked = isRailUnlocked()
  const cta = document.getElementById('toast-cta')
  if (cta) cta.hidden = unlocked
  const ctaStudio = document.getElementById('toast-cta-studio')
  if (ctaStudio) ctaStudio.hidden = unlocked
}

function syncRailPremiumBadges() {
  const unlocked = isRailUnlocked()
  document.querySelectorAll('[data-rail-badge="premium"]').forEach((el) => {
    el.hidden = unlocked
  })
}

function syncProvisionRailIndicators() {
  document.querySelectorAll('[data-rail-provision-indicator]').forEach((el) => {
    const type = el.getAttribute('data-rail-provision-indicator')
    const provisioned =
      type === 'sanity' ? sanityProvisioned : type === 'medusa' ? medusaProvisioned : false
    el.hidden = provisioned
    const row = el.closest('[data-rail-action]')
    if (row) row.classList.toggle('preview-site-rail-row--provisioned', provisioned)
  })
}

function updateRailButton(action, state) {
  const isActive = state === 'active' || state === true
  if (action === 'cms-studio') sanityProvisioned = isActive
  if (action === 'ecommerce') medusaProvisioned = isActive
  syncProvisionRailIndicators()
}

function syncProvisionStateFromSession(session) {
  if (!session || typeof session !== 'object') return
  if (session.sanityConfig) {
    sanityProvisioned = true
    sanityConfig = session.sanityConfig
  }
  if (session.medusaConfig) {
    medusaProvisioned = true
    medusaConfig = session.medusaConfig
  }
  syncProvisionRailIndicators()
}

function syncPreviewSiteRail() {
  const rail = document.getElementById('preview-site-rail')
  const bc = document.querySelector('.browser-content')
  if (!rail || !bc) return
  const show = Boolean(homepageReady && SESSION_ID)
  rail.hidden = !show
  bc.classList.toggle('browser-content--has-site-rail', show)
  if (show) syncRailPremiumBadges()
  syncProvisionRailIndicators()
  syncToastGenerateAnotherVisibility()
}

function setProvisionBusyState(isBusy) {
  provisionBusy = Boolean(isBusy)
  const btn = document.getElementById('provision-confirm-btn')
  const cancel = document.getElementById('provision-cancel-btn')
  const close = document.getElementById('provision-modal-close')
  if (btn) {
    btn.disabled = provisionBusy
    btn.textContent = provisionBusy ? 'Setting up…' : 'Set Up Now'
  }
  if (cancel) cancel.disabled = provisionBusy
  if (close) close.disabled = provisionBusy
}

function showProvisionError(message) {
  const el = document.getElementById('provision-modal-error')
  if (el) el.textContent = message ? String(message) : ''
}

function hideProvisionDialog() {
  provisionDialogType = null
  setProvisionBusyState(false)
  showProvisionError('')
  const modal = document.getElementById('provision-modal')
  if (modal) {
    modal.classList.remove('is-open')
    modal.setAttribute('aria-hidden', 'true')
  }
}

function showProvisionDialog(type) {
  provisionDialogType = type === 'medusa' ? 'medusa' : 'sanity'
  const modal = document.getElementById('provision-modal')
  const title = document.getElementById('provision-modal-title')
  const copy = document.getElementById('provision-modal-copy')
  const note = document.getElementById('provision-modal-note')
  const eyebrow = document.getElementById('provision-modal-eyebrow')
  if (!modal || !title || !copy || !note || !eyebrow) return
  const isSanity = provisionDialogType === 'sanity'
  title.textContent = isSanity ? 'Set up CMS' : 'Set up Online Store'
  eyebrow.textContent = isSanity ? 'Sanity CMS' : 'Medusa ecommerce'
  copy.textContent = isSanity
    ? 'Create the session-specific Sanity Studio connection before opening the content editor.'
    : 'Create the session-specific Medusa connection before opening the store admin.'
  note.textContent = isSanity
    ? 'We’ll provision the CMS for this session and then open the studio in a new tab.'
    : 'We’ll provision the commerce backend for this session and make the admin available right away.'
  showProvisionError('')
  setProvisionBusyState(false)
  modal.classList.add('is-open')
  modal.setAttribute('aria-hidden', 'false')
}

// Tracks the active CmsifyAnimation instance (Sanity provisioning only)
let _cmsifyAnim = null
function _startCmsifyAnimation() {
  try {
    const stage = document.getElementById('preview-stage')
    const iframe = document.getElementById('preview-iframe')
    if (!stage || !iframe || typeof CmsifyAnimation === 'undefined') return
    _cmsifyAnim = new CmsifyAnimation(stage, iframe)
    _cmsifyAnim.start()
  } catch (_) {
    /* animation is non-critical */
  }
}
function _stopCmsifyAnimation() {
  try {
    if (_cmsifyAnim) {
      _cmsifyAnim.stop()
      _cmsifyAnim = null
    }
  } catch (_) {}
}

// Tracks the active EcommercifyAnimation instance (Medusa provisioning only)
let _ecommercifyAnim = null
function _startEcommercifyAnimation() {
  try {
    // Mount on the device shell (sibling of #preview-iframe) so the overlay stacks above the
    // iframe compositing layer; fall back to the outer stage for older markup.
    const shell = document.getElementById('preview-device-shell')
    const stage = document.getElementById('preview-stage')
    const mount = shell || stage
    if (!mount || typeof EcommercifyAnimation === 'undefined') return
    _ecommercifyAnim = new EcommercifyAnimation(mount as HTMLElement)
    _ecommercifyAnim.start()
  } catch (_) {
    /* animation is non-critical */
  }
}
function _stopEcommercifyAnimation() {
  try {
    if (_ecommercifyAnim) {
      _ecommercifyAnim.stop()
      _ecommercifyAnim = null
    }
  } catch (_) {}
}

async function provisionService(type) {
  if (!SESSION_ID || provisionBusy) return
  const normalizedType = type === 'medusa' ? 'medusa' : 'sanity'
  const popup = window.open('', '_blank')
  setProvisionBusyState(true)
  showProvisionError('')
  if (normalizedType === 'sanity') _startCmsifyAnimation()
  if (normalizedType === 'medusa') _startEcommercifyAnimation()
  try {
    const res = await apiFetch(`/api/provision/${normalizedType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success) throw new Error(data.error || 'Provisioning failed')
    if (normalizedType === 'sanity') {
      sanityProvisioned = true
      sanityConfig = data.config || sanityConfig
      updateRailButton('cms-studio', 'active')
      _stopCmsifyAnimation()
      hideProvisionDialog()
      const studioUrl = `/studio/?session=${SESSION_ID}`
      if (popup) popup.location.href = studioUrl
      else window.open(studioUrl, '_blank')
    } else {
      _stopEcommercifyAnimation()
      medusaProvisioned = true
      medusaConfig = data.config || medusaConfig
      updateRailButton('ecommerce', 'active')
      hideProvisionDialog()
      // Open the invite URL on first visit so the user lands on a sign-up
      // form (set their own email + password). Falls back to /app login
      // once the invite has been consumed or when no invite is present
      // (operator-set global creds).
      const baseAdminUrl = medusaConfig?.backendUrl
        ? `${String(medusaConfig.backendUrl).replace(/\/$/, '')}/app`
        : ''
      const adminUrl = medusaConfig?.adminInviteUrl || baseAdminUrl
      if (adminUrl) {
        if (popup) popup.location.href = adminUrl
        else window.open(adminUrl, '_blank')
      } else if (popup) {
        popup.close()
      }
    }
  } catch (error) {
    _stopCmsifyAnimation()
    _stopEcommercifyAnimation()
    if (popup) popup.close()
    showProvisionError(error?.message || 'Provisioning failed')
    setProvisionBusyState(false)
  }
}

function renderDeploymentState(deployment) {
  deploymentState = deployment || null
  syncPreviewChrome()
  syncToastGenerateAnotherVisibility()
}

async function retryDeployOnce() {
  if (deployBusy || deploymentState?.url || !SESSION_ID) return
  deployBusy = true
  try {
    const res = await apiFetch(`/api/sessions/${SESSION_ID}/deploy`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.url) {
      renderDeploymentState({ slug: data.slug, url: data.url, deployedAt: data.deployedAt })
    }
  } catch {
  } finally {
    deployBusy = false
  }
}

// ─── Audio unlock: ensure launch SFX can play ──────────────
const launchSfx = document.getElementById('launch-sfx')
let audioUnlocked = false
function unlockAudio() {
  if (audioUnlocked) return
  audioUnlocked = true
  if (launchSfx) {
    launchSfx
      .play()
      .then(() => {
        launchSfx.pause()
        launchSfx.currentTime = 0
      })
      .catch(() => {})
  }
}
// Try unlock on any user gesture (click from previous page won't carry)
document.addEventListener('click', unlockAudio, { once: true })
document.addEventListener('touchstart', unlockAudio, { once: true })
document.addEventListener('keydown', unlockAudio, { once: true })
// Also try immediately — works if browser allows autoplay
if (launchSfx) {
  launchSfx
    .play()
    .then(() => {
      audioUnlocked = true
      launchSfx.pause()
      launchSfx.currentTime = 0
    })
    .catch(() => {})
}

function setNewPromptFromExample(text) {
  const overlay = document.getElementById('new-prompt-overlay')
  const input = document.getElementById('new-prompt-input')
  if (!overlay || !input) return
  overlay.classList.add('visible')
  input.value = text || ''
  input.focus()
}

function isTextInputTarget(target) {
  if (!target) return false
  const tag = target.tagName?.toLowerCase()
  return tag === 'input' || tag === 'textarea' || target.isContentEditable
}

// ─── Debug mode (?debug=1) ─────────────────────────────────
const DEBUG_MODE = new URLSearchParams(location.search).has('debug')
let debugEventCount = 0

if (DEBUG_MODE) {
  document.body.classList.add('debug-mode')
  document.getElementById('debug-burger').addEventListener('click', () => {
    document.getElementById('debug-burger').classList.toggle('open')
    document.getElementById('debug-panel').classList.toggle('open')
  })
}

function debugLog(type, data) {
  if (!DEBUG_MODE) return
  debugEventCount++
  const feed = document.getElementById('debug-feed')
  const countEl = document.getElementById('debug-event-count')
  countEl.textContent = debugEventCount + ' event' + (debugEventCount !== 1 ? 's' : '')

  const el = document.createElement('div')
  let cls = 'debug-event'
  if (/fail|error|exception/i.test(type)) cls += ' ev-error'
  else if (/done|complete|ok/i.test(type)) cls += ' ev-success'
  el.className = cls

  const now = new Date()
  const ts =
    now.toLocaleTimeString('en-GB', { hour12: false }) +
    '.' +
    String(now.getMilliseconds()).padStart(3, '0')

  let body = ''
  if (typeof data === 'string') body = data
  else if (data) body = JSON.stringify(data, null, 2)

  el.innerHTML =
    '<span class="ev-type">' +
    type +
    '</span><span class="ev-time">' +
    ts +
    '</span>' +
    (body ? '<div class="ev-body">' + body.replace(/</g, '&lt;') + '</div>' : '')

  feed.appendChild(el)
  feed.scrollTop = feed.scrollHeight
}

// ─── State ─────────────────────────────────────────────────
let tasks = []
let genStartTime = Date.now()
let persistedElapsed = null
let taskMap = {}
let allDone = false
let hydratedComplete = false
let drawerOpen = false
let previewLoaded = false
let nextPreviewActive = false
let nextPreviewBase = ''
let nextPreviewBootPromise = null
let homepageReady = false
let wsConnected = false
let introActive = true
let introPromptText = ''
let typingDone = false
let pendingStatus = ''
let introMediaFlipConsumed = false
let hasSeenLiveUpdate = false // only auto-collapse if we watched tasks complete live
let isReconnect = false // true when refreshing a session that already has homepage
let alternativeDesign = null // background-loaded alternative theme
let exportTargets = []
const exportBuildRequested: Set<string> = new Set()
let exportTargetsPollTimer = null
let siteSpecReady = false
let preferredExportTarget = 'html'
let isAnonymousSession = false
let selectedExportTarget = 'html'
let exportMenuOpen = false
let activeThemeOverride = null
let paymentState = null
let paymentModalTarget = null
let selectedPaymentMode = 'subscription'
let paymentBusy = false
let provisionDialogType = null
let provisionBusy = false
let githubPushBusy = false
let githubMenuOpen = false
let paletteMenuOpen = false
let currentPaletteId = null
let paletteSearchQuery = ''
let customPaletteSeed = '#3b82f6'
let customColorInputEl = null
let lastGithubPush = null

const PALETTE_PRESETS = THEME_PRESETS.map((p) => ({
  id: p.id,
  name: p.label,
  dark: p.dark,
  light: p.light,
  bg: p.dark.background,
  surface: p.dark.card || p.dark.background,
  accent: p.dark.primary,
  text: p.dark.foreground,
  border: p.dark.border,
}))
let previewSelectMode = false
let previewAnnotatorActive = false
let chatEditable = false
let chatSending = false
let chatAwaitingEdit = false
let chatAttachmentPaths = []
let previewChatRequestAddSection = null
let chatPanelMode = 'llm'
let hasAutoOpenedCmsPanel = false
let sanityProvisioned = false
let medusaProvisioned = false
let sanityConfig = null
let medusaConfig = null
let medusaAdminEmbedState = { show: false, url: null }

function applyMedusaAdminControls() {
  const tabMedusa = document.getElementById('preview-chat-cms-tab-medusa')
  const openLink = document.getElementById('preview-chat-medusa-open-link')
  const frame = document.getElementById('preview-chat-medusa-frame')
  const show = Boolean(medusaAdminEmbedState?.show && medusaAdminEmbedState?.url)
  if (tabMedusa) tabMedusa.hidden = !show
  if (!show) {
    if (frame) frame.src = 'about:blank'
    return
  }
  if (openLink) openLink.href = medusaAdminEmbedState.url
  if (frame && medusaAdminEmbedState.url) {
    const next = medusaAdminEmbedState.url
    if (frame.src !== next) frame.src = next
    // The Ecommercify widget sends SF_WIDGET_READY when it mounts.
    // We reply with SF_SESSION_ID. This request-response pattern is reliable
    // regardless of React Router SPA navigation timing.
    const medusaOrigin = new URL(medusaAdminEmbedState.url).origin
    if (!frame._sfReadyListenerAttached) {
      frame._sfReadyListenerAttached = true
      window.addEventListener('message', (e) => {
        if (e.data?.type !== 'SF_WIDGET_READY') return
        if (SESSION_ID && frame.contentWindow) {
          frame.contentWindow.postMessage(
            { type: 'SF_SESSION_ID', sessionId: SESSION_ID },
            medusaOrigin,
          )
        }
      })
    }
    // Also send on iframe load in case the widget is already mounted (tab switch)
    const sendSession = () => {
      if (SESSION_ID && frame.contentWindow) {
        frame.contentWindow.postMessage(
          { type: 'SF_SESSION_ID', sessionId: SESSION_ID },
          medusaOrigin,
        )
      }
    }
    frame.addEventListener('load', sendSession)
    requestAnimationFrame(sendSession)
  }
}

function syncCmsSidebarLayout() {
  const browserContent = document.querySelector('.browser-content')
  const chatDock = document.getElementById('preview-chat-dock')
  const chatPanelEl = document.getElementById('preview-chat-panel')
  const useSidebar = chatPanelMode === 'cms' && chatPanelEl && !chatPanelEl.hidden
  if (browserContent) browserContent.classList.toggle('browser-content--cms-sidebar', useSidebar)
  if (chatDock) chatDock.classList.toggle('preview-chat-dock--cms-sidebar', useSidebar)
}

function applyChatPanelMode(mode) {
  chatPanelMode = mode === 'cms' ? 'cms' : 'llm'
  const cms = document.getElementById('preview-chat-cms-block')
  const llm = document.getElementById('preview-chat-llm-wrap')
  const title = document.getElementById('preview-chat-head-title')
  const fab = document.getElementById('preview-chat-fab')
  const chatPanelEl = document.getElementById('preview-chat-panel')
  const showCms = chatPanelMode === 'cms'
  if (cms) cms.hidden = !showCms
  if (llm) llm.hidden = showCms
  if (title) title.textContent = showCms ? 'Site content' : 'Chat'
  if (fab) fab.textContent = showCms ? 'Site content' : 'Chat'
  if (chatPanelEl) chatPanelEl.classList.toggle('preview-chat-panel--cms', showCms)
  syncCmsSidebarLayout()
}

function populateCmsForm(siteSettings) {
  const s = siteSettings || {}
  const set = (id, val) => {
    const el = document.getElementById(id)
    if (el) el.value = val ?? ''
  }
  set('cms-homeTitle', s.homeTitle)
  set('cms-homeDescription', s.homeDescription)
  set('cms-pricingPageTitle', s.pricingPageTitle)
  set('cms-pricingPageDescription', s.pricingPageDescription)
  set('cms-pricingHeroHeadline', s.pricingHeroHeadline)
  set('cms-shipChatHeadline', s.shipChatHeadline)
  set('cms-shipChatSubheadline', s.shipChatSubheadline)
  set('cms-ogImageUrl', s.ogImageUrl)
  set('cms-homeHeroImageUrl', s.homeHeroImageUrl)
  set('cms-ogImageAssetId', s.ogImageAssetId)
  set('cms-homeHeroImageAssetId', s.homeHeroImageAssetId)
  set('cms-ogImageAlt', s.ogImageAlt)
  set('cms-homeHeroImageAlt', s.homeHeroImageAlt)
  const ogPrev = s.ogImageUrl ? String(s.ogImageUrl).trim() : ''
  const heroPrev = s.homeHeroImageUrl ? String(s.homeHeroImageUrl).trim() : ''
  const ogImg = document.getElementById('cms-ogImage-preview')
  if (ogImg) {
    if (ogPrev) {
      ogImg.src = ogPrev
      ogImg.hidden = false
    } else {
      ogImg.removeAttribute('src')
      ogImg.hidden = true
    }
  }
  const heroImg = document.getElementById('cms-homeHeroImage-preview')
  if (heroImg) {
    if (heroPrev) {
      heroImg.src = heroPrev
      heroImg.hidden = false
    } else {
      heroImg.removeAttribute('src')
      heroImg.hidden = true
    }
  }
  const sync = document.getElementById('cms-shipChatSyncedAt')
  if (sync) sync.textContent = s.shipChatSyncedAt ? String(s.shipChatSyncedAt) : '—'
}
let ws = null
let reconnectTimer = null
let leavingDashboard = false
const DEV_PROMPT_EXAMPLES = [
  'Build a bold landing page for a premium pet wellness app with a booking section and customer testimonials.',
  'Create a clean SaaS marketing dashboard for a remote team productivity platform with charts and responsive cards.',
  'Generate an event landing page for a music festival with ticket tiers, schedule timeline, and hero CTA.',
]

function cleanupRealtime() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (ws) {
    ws.onclose = null
    ws.onerror = null
    try {
      ws.close(1000, 'navigate_home')
    } catch {}
    ws = null
  }
}

function referrerIsOurHomepage() {
  const ref = document.referrer
  if (!ref) return false
  try {
    const u = new URL(ref)
    if (u.origin !== location.origin) return false
    const p = u.pathname
    return p === '/' || p === ''
  } catch {
    return false
  }
}

const SESSION_EXIT_MS = 540

function notifyEmbeddedParentClose() {
  if (!SF_EMBED_HOME || window.parent === window) return false
  try {
    window.parent.postMessage({ type: 'sf-close-embedded-session' }, location.origin)
    return true
  } catch {
    return false
  }
}

function performHomeNavigation() {
  document.body.classList.remove('sf-session-exit', 'sf-session-exit--run')
  if (notifyEmbeddedParentClose()) return
  // Always navigate to homepage from session details to prevent back-to-session-details loops
  location.replace('/')
}

function navigateHome(event) {
  if (leavingDashboard) {
    event?.preventDefault()
    if (notifyEmbeddedParentClose()) return
    location.replace('/')
    return
  }
  event?.preventDefault()
  leavingDashboard = true
  cleanupRealtime()
  const reduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    performHomeNavigation()
    return
  }
  document.body.classList.add('sf-session-exit')
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add('sf-session-exit--run')
    })
  })
  const wrap = document.getElementById('dashboard-wrap')
  let finished = false
  const done = () => {
    if (finished) return
    finished = true
    wrap?.removeEventListener('transitionend', onTransitionEnd)
    performHomeNavigation()
  }
  const onTransitionEnd = (e) => {
    if (e.target !== wrap || e.propertyName !== 'transform') return
    done()
  }
  wrap?.addEventListener('transitionend', onTransitionEnd)
  window.setTimeout(done, SESSION_EXIT_MS)
}

document.querySelector('.intro-back-btn')?.addEventListener('click', (event) => {
  navigateHome(event)
})

window.addEventListener('pageshow', (event) => {
  if (event.persisted) leavingDashboard = false
})

window.addEventListener('pagehide', () => {
  leavingDashboard = true
  cleanupRealtime()
})

function normalizePaymentState(rawPayment) {
  return {
    gateway: rawPayment?.gateway || 'razorpay',
    countryCode: rawPayment?.countryCode || 'GLOBAL',
    isIndianUser: Boolean(rawPayment?.isIndianUser),
    configured: Boolean(rawPayment?.configured),
    currency: rawPayment?.currency || 'inr',
    plan: rawPayment?.plan || null,
    earlyAdopter: rawPayment?.earlyAdopter || null,
    pricing: rawPayment?.pricing || {
      inr: { amount: 399, display: '\u20B9399/month' },
      usd: { amount: 9, display: '$9/month' },
    },
    subscription: {
      active: Boolean(rawPayment?.subscription?.active),
      status: rawPayment?.subscription?.status || null,
    },
    access: {
      targetUnlocked: Boolean(rawPayment?.access?.targetUnlocked),
      subscriptionUnlocked: Boolean(rawPayment?.access?.subscriptionUnlocked),
    },
  }
}

function getDisplayPrice() {
  if (!paymentState?.pricing) return '\u20B9399/month'
  const curr = paymentState.currency || 'inr'
  return curr === 'inr'
    ? paymentState.pricing.inr?.display || '\u20B9399/month'
    : paymentState.pricing.usd?.display || '$9/month'
}

function syncPreviewTheme() {
  if (!activeThemeOverride) return
  const iframe = document.getElementById('preview-iframe')
  if (!iframe?.contentWindow) return
  iframe.contentWindow.postMessage({ type: 'UPDATE_THEME', colors: activeThemeOverride }, '*')
}

function postPreviewToolsState() {
  const iframe = document.getElementById('preview-iframe')
  if (!iframe?.contentWindow) return
  iframe.contentWindow.postMessage(
    {
      type: 'SF_PREVIEW_TOOLS',
      selectMode: previewSelectMode,
      annotateMode: previewAnnotatorActive,
    },
    '*',
  )
}

function postAnnotatorClearToPreview() {
  const iframe = document.getElementById('preview-iframe')
  if (!iframe?.contentWindow) return
  iframe.contentWindow.postMessage({ type: 'SF_PREVIEW_TOOLS_CLEAR_ANNOTATOR' }, '*')
}

function syncPreviewInspectTools() {
  document.querySelectorAll('[data-preview-tool]').forEach((btn) => {
    const m = btn.getAttribute('data-preview-tool')
    if (m === 'select') {
      btn.classList.toggle('is-active', previewSelectMode)
      btn.setAttribute('aria-pressed', previewSelectMode ? 'true' : 'false')
    }
    if (m === 'annotate') {
      btn.classList.toggle('is-active', previewAnnotatorActive)
      btn.setAttribute('aria-pressed', previewAnnotatorActive ? 'true' : 'false')
    }
  })
  postPreviewToolsState()
}

function syncPreviewChrome() {
  const chrome = document.querySelector('.browser-chrome')
  if (!chrome) return
  chrome.classList.toggle('is-preview-ready', homepageReady || previewLoaded)
  const urlText = document.getElementById('url-text')
  const statusText = document.getElementById('status-text')
  if (urlText) {
    if (deploymentState?.url) {
      const raw = formatDeploymentUrl(deploymentState.url)
      const href = raw.startsWith('http') ? raw : `https://${raw}`
      urlText.href = href
      urlText.textContent = href.replace(/^https?:\/\//, '')
    } else if (nextPreviewActive && nextPreviewBase) {
      urlText.href = nextPreviewBase
      try {
        urlText.textContent = `${new URL(nextPreviewBase).host}/`
      } catch {
        urlText.textContent = nextPreviewBase
      }
    } else if (previewLoaded || homepageReady) {
      urlText.href = PREVIEW_BASE
      urlText.textContent = new URL(PREVIEW_BASE).pathname
    } else {
      urlText.href = window.location.href
      urlText.textContent = window.location.host
    }
  }
  if (statusText) {
    if (deploymentState?.url) statusText.textContent = 'Deployed'
    else if (nextPreviewActive) statusText.textContent = 'Next.js'
    else if (previewLoaded) statusText.textContent = 'Live'
    else statusText.textContent = 'Preview'
  }
}

function setActiveThemeOverride(theme) {
  activeThemeOverride =
    theme && typeof theme === 'object' && Object.keys(theme).length > 0 ? theme : null
  syncPreviewTheme()
}

function getExportEntry(target) {
  return exportTargets.find((entry) => entry.target === target) || null
}

function getSelectedExportEntry() {
  return getExportEntry(selectedExportTarget) || exportTargets[0] || null
}

function railPaywallEntry() {
  return (
    getSelectedExportEntry() ||
    getExportEntry('html') || {
      target: 'html',
      paymentRequired: true,
      downloadUnlocked: false,
    }
  )
}

function canShowGitHubMenu() {
  if (isAnonymousSession) return false
  return homepageReady && (exportTargets.length > 0 || siteSpecReady)
}

function renderGitHubPushButton() {
  if (!canShowGitHubMenu()) setGitHubMenuOpen(false)
}

function getGitHubTargetEntries() {
  // Inherit payment flags from the export targets so the GitHub panel
  // shows the same paywall state as the download panel.
  const anyRequiresPayment = exportTargets.some((e) => e.paymentRequired && !e.downloadUnlocked)
  return ['html', 'react', 'nextjs'].map(
    (target) =>
      getExportEntry(target) || {
        target,
        ready: false,
        buildReady: true,
        buildReason: null,
        paymentRequired: anyRequiresPayment,
        downloadUnlocked: false,
      },
  )
}

function ensureGitHubMenu() {
  let panel = document.getElementById('github-export-panel')
  if (!panel) {
    panel = document.createElement('div')
    panel.id = 'github-export-panel'
    panel.className = 'export-panel github-export-panel'
    panel.innerHTML = `
      <div class="export-panel-top github-export-panel-top">
        <div class="export-copy">
          <span class="export-eyebrow">GitHub Push</span>
          <strong>Choose the repo stack</strong>
          <p id="github-export-subtext">
            Pick HTML, React, or Next.js and Ship Fast will push that export to GitHub.
          </p>
        </div>
        <span class="export-status-badge" id="github-export-status">Choose target</span>
      </div>
      <div class="export-target-list" id="github-export-target-list"></div>
    `
    document.body.appendChild(panel)
    panel.querySelector('#github-export-target-list').addEventListener('click', (event) => {
      const button = event.target.closest('[data-github-target]')
      if (!button || githubPushBusy || button.disabled) return
      selectedExportTarget = button.dataset.githubTarget || selectedExportTarget
      const entry =
        getExportEntry(selectedExportTarget) ||
        getGitHubTargetEntries().find((e) => e.target === selectedExportTarget)
      if (entry && entry.paymentRequired && !entry.downloadUnlocked) {
        openPaymentModal(entry)
        return
      }
      renderExportPanel()
      renderGitHubExportPanel()
      pushSelectedExportToGitHub(selectedExportTarget)
    })
  }
  return panel
}

function positionGitHubMenu(anchor) {
  const panel = document.getElementById('github-export-panel')
  if (!panel || !anchor || !anchor.isConnected) return
  const rect = anchor.getBoundingClientRect()
  const gap = 8
  const margin = 12
  const top = rect.bottom + gap
  const availableHeight = Math.max(140, window.innerHeight - top - margin)
  panel.style.setProperty('max-height', `${Math.round(availableHeight)}px`, 'important')
  void panel.offsetWidth
  const panelWidth = panel.offsetWidth || 340
  let left = rect.right - panelWidth
  if (left < margin) left = Math.max(margin, rect.left)
  if (left + panelWidth > window.innerWidth - margin) {
    left = Math.max(margin, window.innerWidth - panelWidth - margin)
  }
  panel.style.setProperty('left', `${Math.round(left)}px`, 'important')
  panel.style.setProperty('top', `${Math.round(top)}px`, 'important')
}

function setGitHubMenuOpen(nextOpen, anchor) {
  const panel = ensureGitHubMenu()
  const canShow = canShowGitHubMenu()
  githubMenuOpen = Boolean(nextOpen) && canShow
  if (githubMenuOpen) {
    panel.style.display = 'grid'
    if (anchor) positionGitHubMenu(anchor)
    requestAnimationFrame(() => panel.classList.add('is-open'))
  } else {
    panel.classList.remove('is-open')
    panel.style.display = 'none'
  }
  const railRow = document.querySelector('#preview-site-rail [data-rail-action="github"]')
  if (railRow) {
    railRow.classList.toggle('is-open', githubMenuOpen)
    railRow.setAttribute('aria-expanded', githubMenuOpen ? 'true' : 'false')
  }
}

function closeGitHubMenu() {
  setGitHubMenuOpen(false)
}

function toggleGitHubMenu(anchor) {
  closeExportMenu()
  ensureGitHubMenu()
  renderGitHubExportPanel()
  setGitHubMenuOpen(!githubMenuOpen, anchor)
}

function renderGitHubExportPanel() {
  const panel = document.getElementById('github-export-panel')
  if (!panel) return
  const statusEl = document.getElementById('github-export-status')
  const subtextEl = document.getElementById('github-export-subtext')
  const eyebrowEl = panel.querySelector('.export-eyebrow')
  const headingEl = panel.querySelector('.export-copy strong')
  const targetList = document.getElementById('github-export-target-list')
  const targets = getGitHubTargetEntries()

  if (!targets.length) {
    closeGitHubMenu()
    return
  }

  const githubRequiresPayment = targets.some((e) => e.paymentRequired && !e.downloadUnlocked)

  targetList.innerHTML = targets
    .map((entry) => {
      const label = formatExportTargetLabel(entry.target)
      const activeClass = entry.target === selectedExportTarget ? ' is-active' : ''
      const entryRequiresPayment = Boolean(entry.paymentRequired && !entry.downloadUnlocked)
      const stateLabel = entryRequiresPayment
        ? 'Pro only'
        : githubPushBusy
          ? 'Working'
          : entry.buildReady === false
            ? 'Waiting'
            : lastGithubPush?.target === entry.target
              ? 'Last push'
              : 'Push'
      const disabledAttr = githubPushBusy || entry.buildReady === false ? ' disabled' : ''

      return `<button type="button" class="export-target${activeClass}" data-github-target="${escapeHtml(
        entry.target,
      )}"${disabledAttr}>
              <span class="export-target-glyph" aria-hidden="true">${escapeHtml(
                formatExportTargetGlyph(entry.target),
              )}</span>
              <span class="export-target-copy">
                <span class="export-target-name">${escapeHtml(label)}</span>
                <span class="export-target-meta">${escapeHtml(formatExportTargetSummary(entry.target))}</span>
              </span>
              <span class="export-target-state">${escapeHtml(stateLabel)}</span>
            </button>`
    })
    .join('')

  // Mirror the static export panel's paywall copy
  if (eyebrowEl) eyebrowEl.textContent = githubRequiresPayment ? 'GitHub Push' : 'GitHub Push'
  if (headingEl)
    headingEl.textContent = githubRequiresPayment
      ? 'Ship this exact UI to GitHub'
      : 'Choose the repo stack'
  statusEl.textContent = githubPushBusy
    ? 'GitHub Push'
    : githubRequiresPayment
      ? 'Pro Required'
      : 'Choose target'
  subtextEl.textContent = githubPushBusy
    ? 'Staging payload for GitHub.'
    : githubRequiresPayment
      ? 'Subscribe to Pro or purchase download credits to push to GitHub.'
      : 'Pick HTML, React, or Next.js and Ship Fast will push that export to GitHub.'
}

function buildStripGradient(c) {
  return `linear-gradient(115deg, ${c.bg} 0 25%, ${c.surface} 25% 50%, ${c.accent} 50% 75%, ${c.text} 75% 100%)`
}

function renderPaletteRailStrip() {
  const strip = document.getElementById('rail-palette-strip')
  if (!strip) return
  strip.innerHTML = ''
  let colors = null
  if (currentPaletteId === 'custom') {
    const d = deriveCustomPalette(customPaletteSeed)
    colors = { bg: d.bg, surface: d.surface, accent: d.accent, text: d.text }
  } else if (currentPaletteId) {
    const p = PALETTE_PRESETS.find((p) => p.id === currentPaletteId)
    if (p) colors = { bg: p.bg, surface: p.surface, accent: p.accent, text: p.text }
  }
  if (!colors) {
    strip.removeAttribute('style')
    strip.classList.remove('is-active')
    return
  }
  strip.classList.add('is-active')
  strip.style.background = buildStripGradient(colors)
}

function ensurePaletteMenu() {
  let menu = document.getElementById('palette-menu')
  if (!menu) {
    menu = document.createElement('div')
    menu.id = 'palette-menu'
    document.body.appendChild(menu)
  }
  return menu
}

function positionPaletteMenu(anchor) {
  const menu = document.getElementById('palette-menu')
  if (!menu || !anchor) return
  const rect = anchor.getBoundingClientRect()
  const menuWidth = menu.offsetWidth || 340
  const menuHeight = menu.offsetHeight || 420
  let left = rect.left - menuWidth - 12
  if (left < 12) left = Math.max(12, rect.right - menuWidth)
  let top = rect.top
  if (top + menuHeight > window.innerHeight - 12) {
    top = Math.max(12, window.innerHeight - menuHeight - 12)
  }
  menu.style.left = `${Math.round(left)}px`
  menu.style.top = `${Math.round(top)}px`
}

function setPaletteMenuOpen(open) {
  const menu = document.getElementById('palette-menu')
  if (!menu) return
  paletteMenuOpen = Boolean(open)
  if (paletteMenuOpen) {
    menu.style.display = 'grid'
    requestAnimationFrame(() => menu.classList.add('is-open'))
  } else {
    menu.classList.remove('is-open')
    menu.style.display = 'none'
  }
}

function closePaletteMenu() {
  setPaletteMenuOpen(false)
}

function openCustomColorPicker() {
  if (!customColorInputEl) {
    customColorInputEl = document.createElement('input')
    customColorInputEl.type = 'color'
    customColorInputEl.style.position = 'fixed'
    customColorInputEl.style.left = '-9999px'
    customColorInputEl.style.top = '-9999px'
    customColorInputEl.style.opacity = '0'
    customColorInputEl.style.pointerEvents = 'none'
    document.body.appendChild(customColorInputEl)
    customColorInputEl.addEventListener('input', (ev) => {
      const hex = ev.target.value
      customPaletteSeed = hex
      const derived = deriveCustomPalette(hex)
      applyPaletteToPreview(derived)
      const stripEl = document.getElementById('palette-custom-strip')
      if (stripEl) stripEl.style.background = buildStripGradient(derived)
      const cardEl = document.querySelector('.palette-preset-card--custom')
      if (cardEl) cardEl.style.setProperty('--sf-accent', hex)
    })
  }
  customColorInputEl.value = customPaletteSeed
  customColorInputEl.click()
}

function renderPalettePanel(anchor) {
  const menu = ensurePaletteMenu()
  const customCardHtml = `<button type="button" class="palette-preset-card palette-preset-card--custom${currentPaletteId === 'custom' ? ' is-active' : ''}" data-palette-preset="custom" data-palette-name="custom" style="--sf-accent:${escapeHtml(customPaletteSeed)}">
      <span class="palette-preset-swatches palette-preset-swatches--strip" id="palette-custom-strip" style="background:${escapeHtml(buildStripGradient(deriveCustomPalette(customPaletteSeed)))}"></span>
      <span class="palette-preset-name">Custom</span>
    </button>`
  const presetCards =
    customCardHtml +
    PALETTE_PRESETS.map((p) => {
      const swatches = [p.bg, p.surface, p.accent, p.text]
        .map(
          (c) => `<span class="palette-preset-swatch" style="background:${escapeHtml(c)}"></span>`,
        )
        .join('')
      return `<button type="button" class="palette-preset-card${p.id === currentPaletteId ? ' is-active' : ''}" data-palette-preset="${escapeHtml(p.id)}" data-palette-name="${escapeHtml(p.name.toLowerCase())}" style="--sf-accent:${escapeHtml(p.accent)}">
      <span class="palette-preset-swatches">${swatches}</span>
      <span class="palette-preset-name">${escapeHtml(p.name)}</span>
    </button>`
    }).join('')
  menu.innerHTML = `
    <div class="export-panel-top">
      <div class="export-copy">
        <span class="export-eyebrow">Color palette</span>
        <strong>Pick a theme, or set a custom accent.</strong>
      </div>
    </div>
    <div class="palette-search-row">
      <input type="search" class="palette-search" id="palette-search" placeholder="Search themes…" autocomplete="off" spellcheck="false" />
    </div>
    <div class="palette-preset-grid">
      ${presetCards}
      <p class="palette-empty" id="palette-empty" hidden></p>
    </div>
  `
  menu.querySelectorAll('[data-palette-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-palette-preset')
      if (id === 'custom') {
        openCustomColorPicker()
        return
      }
      const preset = PALETTE_PRESETS.find((p) => p.id === id)
      if (preset) applyPaletteToPreview(preset)
    })
  })
  const searchInput = menu.querySelector('#palette-search')
  const emptyEl = menu.querySelector('#palette-empty')
  const cards = menu.querySelectorAll('.palette-preset-card')
  const applyFilter = () => {
    const q = paletteSearchQuery
    let visible = 0
    cards.forEach((card) => {
      const name = card.getAttribute('data-palette-name') || ''
      const match = !q || name.includes(q)
      card.hidden = !match
      if (match) visible++
    })
    if (emptyEl) {
      emptyEl.hidden = visible > 0
      emptyEl.textContent = q ? `No themes match "${q}".` : 'No themes available.'
    }
  }
  if (searchInput) {
    searchInput.value = paletteSearchQuery
    searchInput.addEventListener('input', (ev) => {
      paletteSearchQuery = String(ev.target.value || '')
        .trim()
        .toLowerCase()
      applyFilter()
    })
    // Keep focus on open
    requestAnimationFrame(() => searchInput.focus())
  }
  applyFilter()
  positionPaletteMenu(anchor)
}

function buildPaletteCss(palette) {
  const vars = {}
  if (palette && palette.dark && typeof palette.dark === 'object') {
    Object.assign(vars, palette.dark)
  } else {
    if (palette.bg) vars.background = palette.bg
    if (palette.surface) {
      vars.card = palette.surface
      vars.popover = palette.surface
    }
    if (palette.accent) {
      vars.primary = palette.accent
      vars.ring = palette.accent
    }
    if (palette.text) vars.foreground = palette.text
    if (palette.border) vars.border = palette.border
  }
  const entries = Object.entries(vars).filter(([, v]) => typeof v === 'string' && v.length)
  if (!entries.length) return ''
  const decls = entries.map(([k, v]) => `  --${k}: ${v} !important;`).join('\n')
  // Emit on both :root and .dark so Tailwind's dark-mode scope picks it up too.
  return `:root, .dark, html, body {\n${decls}\n}`
}

function applyPaletteToPreview(palette) {
  // Backend endpoint /api/sessions/:id/apply-palette is not yet wired.
  // Frontend still POSTs so the server team can pick it up; we fall back to
  // injecting a <style> tag into the preview iframe for immediate feedback.
  if (SESSION_ID) {
    apiFetch(`/api/sessions/${SESSION_ID}/apply-palette`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: palette.id || null,
        dark: palette.dark || null,
        light: palette.light || null,
        bg: palette.bg || null,
        surface: palette.surface || null,
        accent: palette.accent || null,
        text: palette.text || null,
        border: palette.border || null,
      }),
    }).catch(() => {})
  }
  const css = buildPaletteCss(palette)
  if (!css) return
  try {
    const iframe = document.getElementById('preview-iframe')
    const doc = iframe && iframe.contentDocument
    if (!doc) return
    let styleEl = doc.getElementById('sf-palette-override')
    if (!styleEl) {
      styleEl = doc.createElement('style')
      styleEl.id = 'sf-palette-override'
      ;(doc.head || doc.documentElement).appendChild(styleEl)
    }
    styleEl.textContent = css
  } catch {
    /* cross-origin iframe — fall back to postMessage below */
  }
  // Always postMessage too — works even when the iframe is cross-origin.
  try {
    const iframe = document.getElementById('preview-iframe')
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: 'SF_APPLY_PALETTE',
          css,
          palette: { id: palette.id || null, dark: palette.dark || null },
        },
        '*',
      )
    }
  } catch {
    /* ignore */
  }
  currentPaletteId = palette && palette.id ? palette.id : null
  renderPaletteRailStrip()
  // Update the open panel's active card marker in place (if open) without rebuilding
  const openMenu = document.getElementById('palette-menu')
  if (openMenu && paletteMenuOpen) {
    openMenu.querySelectorAll('.palette-preset-card').forEach((card) => {
      const id = card.getAttribute('data-palette-preset')
      card.classList.toggle('is-active', id === currentPaletteId)
    })
  }
}

function setPaymentError(message = '') {
  document.getElementById('payment-error').textContent = message
}

function setPaymentBusyState(isBusy) {
  paymentBusy = isBusy
  const confirmBtn = document.getElementById('payment-confirm-btn')
  const cancelBtn = document.getElementById('payment-cancel-btn')
  confirmBtn.disabled = isBusy
  cancelBtn.disabled = isBusy
  confirmBtn.textContent = isBusy ? 'Redirecting…' : 'Continue'
}

function renderPaymentOptions() {
  const optionList = document.getElementById('payment-option-list')
  const plan = paymentState?.plan
  const ea = paymentState?.earlyAdopter
  const priceId = plan?.priceId || window._shipFastPriceId || ''
  const price = getDisplayPrice()

  // Store the price ID globally for checkout
  if (priceId) window._shipFastPriceId = priceId

  if (!priceId && !ea?.priceId) {
    optionList.innerHTML =
      '<p class="payment-modal-empty">Plans are not configured yet. Please try again later.</p>'
    return
  }

  const features = plan?.features || [
    '30 generations/month',
    'Unlimited ZIP downloads',
    'Full template library',
    'AI iteration & refinement',
    'Community access',
    'Monthly template drops',
  ]
  const featureHtml = features.map((f) => `<li>${escapeHtml(f)}</li>`).join('')

  let html = ''

  // Early adopter option (shown first if eligible)
  if (ea?.eligible && ea?.priceId) {
    const curr = paymentState?.currency || 'inr'
    const eaPrice =
      curr === 'inr'
        ? ea.pricing?.inr?.display || '\u20B9199/month'
        : ea.pricing?.usd?.display || '$5/month'
    const fullPrice =
      curr === 'inr'
        ? paymentState.pricing?.inr?.display || '\u20B9399/month'
        : paymentState.pricing?.usd?.display || '$9/month'
    const slotsText = `${ea.slotsRemaining} of ${ea.totalSlots} slots remaining`
    const isSelected = selectedPaymentMode === 'early_adopter'
    html += `<button type="button" class="payment-option payment-option--early${isSelected ? ' is-active' : ''}" data-payment-mode="early_adopter">
            <span class="payment-option-badge">Best value</span>
            <span class="payment-option-head">
              <strong>Early adopter</strong>
              <span class="payment-option-price"><s>${fullPrice}</s> ${eaPrice}</span>
            </span>
            <span class="payment-option-highlight">Half price forever · ${escapeHtml(slotsText)}</span>
            <ul class="payment-option-features">${featureHtml}</ul>
          </button>`
    // Default to early adopter if available
    if (!selectedPaymentMode || selectedPaymentMode === 'subscription') {
      selectedPaymentMode = 'early_adopter'
    }
  }

  // Regular Pro option
  const isProSelected = selectedPaymentMode === 'subscription' || !ea?.eligible
  html += `<button type="button" class="payment-option${isProSelected && !ea?.eligible ? ' is-active' : selectedPaymentMode === 'subscription' ? ' is-active' : ''}" data-payment-mode="subscription">
          <span class="payment-option-head">
            <strong>${escapeHtml(plan?.name || 'Pro')}</strong>
            <span class="payment-option-price">${price}</span>
          </span>
          <ul class="payment-option-features">${featureHtml}</ul>
        </button>`

  optionList.innerHTML = html
}

function closePaymentModal() {
  if (paymentBusy) return
  paymentModalTarget = null
  setPaymentError('')
  document.getElementById('payment-modal').classList.remove('is-open')
  document.getElementById('payment-modal').setAttribute('aria-hidden', 'true')
}

function openPaymentModal(targetEntry) {
  if (isRailUnlocked()) return
  paymentModalTarget = targetEntry
  setPaymentBusyState(false)
  setPaymentError('')
  renderPaymentOptions()

  const selectedLabel = formatExportTargetLabel(targetEntry?.target || selectedExportTarget)
  const price = getDisplayPrice()
  document.getElementById('payment-copy').textContent =
    `${selectedLabel} ZIP exports need Pro or credits. Early adopter pricing applies while slots remain.`

  document.getElementById('payment-modal').classList.add('is-open')
  document.getElementById('payment-modal').setAttribute('aria-hidden', 'false')
}

function openAuthWall() {
  if (SF_EMBED_HOME) {
    try {
      window.parent.postMessage({ type: 'sf-request-auth-overlay' }, location.origin)
    } catch {}
    return
  }
  document.getElementById('auth-overlay').classList.remove('hidden')
}

function closeAuthWall() {
  document.getElementById('auth-overlay').classList.add('hidden')
  document.getElementById('auth-error').textContent = ''
}

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }
    const existing = document.querySelector('script[data-razorpay-checkout]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Razorpay load failed')))
      return
    }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    s.setAttribute('data-razorpay-checkout', '1')
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.head.appendChild(s)
  })
}

async function startCheckout() {
  if (!paymentModalTarget || paymentBusy) return
  setPaymentBusyState(true)
  setPaymentError('')

  try {
    const tier =
      selectedPaymentMode === 'early_adopter' && paymentState?.earlyAdopter?.priceId
        ? 'early_adopter'
        : 'pro'
    if (tier === 'early_adopter' && !paymentState?.earlyAdopter?.priceId) {
      throw new Error('Early adopter plan is not configured yet.')
    }
    if (tier === 'pro' && !(paymentState?.plan?.priceId || window._shipFastPriceId)) {
      throw new Error('Subscription plan is not configured yet.')
    }

    const res = await apiFetch('/api/payments/razorpay/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'subscription', tier }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Unable to start checkout')

    await loadRazorpayScript()

    const options = {
      key: data.key_id,
      name: data.name || 'Ship Fast',
      description: data.description || '',
      prefill: data.prefill || {},
      handler: () => {
        setPaymentBusyState(false)
      },
      modal: {
        ondismiss: () => {
          setPaymentBusyState(false)
        },
      },
      theme: { color: '#6366f1' },
    }
    if (data.subscription_id) {
      options.subscription_id = data.subscription_id
    } else if (data.order_id) {
      options.order_id = data.order_id
      options.amount = data.amount
      options.currency = data.currency || 'INR'
    } else {
      throw new Error('Invalid checkout response')
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch (error) {
    setPaymentError(error.message || 'Unable to start checkout')
    setPaymentBusyState(false)
  }
}

function initPreviewSiteRail() {
  const rail = document.getElementById('preview-site-rail')
  if (!rail || rail._sfRailInit) return
  rail._sfRailInit = true
  rail.addEventListener('click', (ev) => {
    const row = ev.target.closest('[data-rail-action]')
    if (!row || row.disabled) return
    const action = row.getAttribute('data-rail-action')
    if (action === '3d') return
    if (!requirePremium()) return
    if (action === 'cms-studio') {
      if (!sanityProvisioned) {
        showProvisionDialog('sanity')
        return
      }
      window.open(`/studio/?session=${SESSION_ID}`, '_blank')
      return
    }
    if (action === 'ecommerce') {
      if (!medusaProvisioned) {
        showProvisionDialog('medusa')
        return
      }
      const baseAdminUrl = medusaConfig?.backendUrl
        ? `${String(medusaConfig.backendUrl).replace(/\/$/, '')}/app`
        : ''
      const adminUrl = medusaConfig?.adminInviteUrl || baseAdminUrl
      if (adminUrl) window.open(adminUrl, '_blank')
      return
    }
    if (action === 'palette') {
      closeExportMenu()
      closeGitHubMenu()
      if (paletteMenuOpen) {
        closePaletteMenu()
        return
      }
      renderPalettePanel(row)
      setPaletteMenuOpen(true)
      return
    }
    if (action === 'github') {
      if (!canShowGitHubMenu()) return
      closeExportMenu()
      closePaletteMenu()
      if (githubMenuOpen) {
        closeGitHubMenu()
        return
      }
      ensureGitHubMenu()
      renderGitHubExportPanel()
      setGitHubMenuOpen(true, row)
      return
    }
    if (action === 'export') {
      if (!canShowExportMenu()) return
      closeGitHubMenu()
      closePaletteMenu()
      if (exportMenuOpen) {
        closeExportMenu()
        return
      }
      ensureExportMenu()
      renderExportPanel()
      setExportMenuOpen(true, row)
      return
    }
    if (action === 'domain') {
      showRailToast(
        'Custom domains — coming soon. Email support@ship-fast.io to request early access.',
        4200,
      )
      return
    }
  })
}

async function hydrateCurrentPalette() {
  if (!SESSION_ID) {
    renderPaletteRailStrip()
    return
  }
  try {
    const res = await apiFetch(`/api/sessions/${SESSION_ID}/palette`)
    if (res.ok) {
      const data = await res.json()
      const p = data && data.palette ? data.palette : null
      if (p && p.id) {
        currentPaletteId = p.id
        if (p.id === 'custom' && p.dark && typeof p.dark.primary === 'string') {
          customPaletteSeed = p.dark.primary
        }
      }
    }
  } catch {
    /* ignore — strip will render with no active marker */
  }
  renderPaletteRailStrip()
}

// ─── Magic Theme Logic ─────────────────────────────────────
function applyMagicTheme() {
  if (!alternativeDesign) return
  setActiveThemeOverride(alternativeDesign)

  apiFetch(`/api/sessions/${SESSION_ID}/theme`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme: alternativeDesign }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) setActiveThemeOverride(data.theme)
    })
    .catch(() => {})

  const btn = document.getElementById('theme-magic-btn')
  if (btn) {
    btn.style.transform = 'scale(1.1) rotate(5deg)'
    setTimeout(() => (btn.style.transform = ''), 200)
  }
}

function generateAlternativeDesign() {
  const btn = document.getElementById('generate-design-btn')
  if (!btn) return
  btn.disabled = true
  btn.textContent = '⏳ GENERATING...'

  apiFetch(`/api/sessions/${SESSION_ID}/generate-design`, { method: 'POST' })
    .then((res) => res.json())
    .then((data) => {
      btn.textContent = '🎨 GENERATE'
      btn.disabled = false
    })
    .catch((err) => {
      console.error('Design generation error:', err)
      btn.textContent = '🎨 GENERATE'
      btn.disabled = false
    })
}

// ─── Task classification ───────────────────────────────────
function isFrontendTask(task) {
  const taskFiles = Array.isArray(task.files) && task.files.length > 0
    ? task.files
    : task.filename
      ? [task.filename]
      : []
  return taskFiles.some(
    (f) =>
      f.endsWith('.html') ||
      f.endsWith('.openui') ||
      f.endsWith('.tsx') ||
      f.endsWith('.jsx') ||
      f.endsWith('.ts') ||
      f.endsWith('.js') ||
      f.endsWith('.css'),
  )
}

function getTaskCounts() {
  const frontend = tasks.filter(isFrontendTask)
  const backend = tasks.filter((t) => !isFrontendTask(t))
  const frontendDone = frontend.filter((t) => t.status === 'DONE' || t.status === 'FAILED').length
  const backendDone = backend.filter((t) => t.status === 'DONE' || t.status === 'FAILED').length
  return {
    frontendTotal: frontend.length,
    frontendDone,
    backendTotal: backend.length,
    backendDone,
    totalDone: frontendDone + backendDone,
  }
}

function hasOpenUIArtifact(taskList = tasks) {
  return taskList.some((task) => {
    const files = Array.isArray(task.files) && task.files.length > 0
      ? task.files
      : task.filename
        ? [task.filename]
        : []
    return files.some((file) => String(file || '').endsWith('.openui'))
  })
}

function syncOpenUIActiveClass(session = {}) {
  const sessionTasks = Array.isArray(session.tasks) ? session.tasks : tasks
  const usesOpenUI =
    Boolean(session.openuiReady) ||
    String(session.preferredExportTarget || '').toLowerCase() === 'openui' ||
    hasOpenUIArtifact(sessionTasks)
  document.body.classList.toggle('sf-openui-active', usesOpenUI)
}

// ─── Dev mode ───────────────────────────────────────────────
const isDev = new URLSearchParams(window.location.search).has('dev')
if (isDev) {
  document.getElementById('split-toggle-btn').style.display = ''
}

// ─── Split toggle ────────────────────────────────────────────
let splitPinned = false

function toggleSplit() {
  if (!drawerOpen) return
  splitPinned = !splitPinned
  const btn = document.getElementById('split-toggle-btn')
  const leftPanel = document.getElementById('left-panel')
  const rightPanel = document.getElementById('right-panel')
  if (splitPinned) {
    leftPanel.classList.remove('collapsed')
    rightPanel.classList.remove('expanded')
    rightPanel.classList.add('open')
    rightPanel.style.width = '50%'
    leftPanel.style.width = '50%'
    btn.textContent = '▣ 50/50'
    btn.style.color = '#c4b5fd'
    btn.style.borderColor = '#7c3aed'
    btn.style.background = '#2e1a4e'
  } else {
    btn.textContent = '⬛ 50/50'
    btn.style.color = '#a09cc0'
    btn.style.borderColor = '#3d3a5e'
    btn.style.background = '#1e1a2e'
    if (frontendComplete) {
      leftPanel.classList.add('collapsed')
      rightPanel.classList.remove('open')
      rightPanel.classList.add('expanded')
      rightPanel.style.width = ''
      leftPanel.style.width = ''
    } else {
      updatePreviewProgress()
    }
  }
}

// ─── Open the preview drawer ────────────────────────────────
let frontendComplete = false

function openDrawer() {
  if (drawerOpen) return
  drawerOpen = true
  const leftPanel = document.getElementById('left-panel')
  const rightPanel = document.getElementById('right-panel')
  leftPanel.classList.add('drawer-open')
  rightPanel.classList.add('open')
  rightPanel.style.width = '50%'
  leftPanel.style.width = '50%'
  loadPreview()
}

function expandPreviewForLiveOpenUI() {
  if (!drawerOpen || splitPinned) return
  const leftPanel = document.getElementById('left-panel')
  const rightPanel = document.getElementById('right-panel')
  const loading = document.getElementById('preview-loading')
  if (!leftPanel || !rightPanel) return
  frontendComplete = true
  leftPanel.classList.add('collapsed')
  rightPanel.classList.remove('open')
  rightPanel.classList.add('expanded')
  rightPanel.style.width = ''
  leftPanel.style.width = ''
  loading?.classList.add('hidden')
}

// ─── Update preview loading + dynamic split width ───────────
function updatePreviewProgress() {
  if (!drawerOpen) return
  const loading = document.getElementById('preview-loading')
  const progressFill = document.getElementById('preview-progress-fill')
  const leftPanel = document.getElementById('left-panel')
  const rightPanel = document.getElementById('right-panel')

  const counts = getTaskCounts()
  if (counts.frontendTotal === 0) return

  const rawPct = (counts.frontendDone / counts.frontendTotal) * 100
  const rightWidth = Math.max(50, rawPct)
  const leftWidth = 100 - rightWidth

  if (!frontendComplete && !splitPinned) {
    rightPanel.style.width = rightWidth + '%'
    leftPanel.style.width = leftWidth + '%'
  }

  progressFill.style.width = Math.round(rawPct) + '%'

  if (counts.frontendDone > 0 && !loading.classList.contains('determinate')) {
    loading.classList.add('determinate')
  }

  if (counts.frontendDone >= counts.frontendTotal && !frontendComplete && hasSeenLiveUpdate) {
    frontendComplete = true
    loading.classList.add('hidden')
    setTimeout(() => {
      if (!splitPinned) {
        leftPanel.classList.add('collapsed')
        rightPanel.classList.remove('open')
        rightPanel.classList.add('expanded')
        rightPanel.style.width = ''
        leftPanel.style.width = ''
        loadPreview()
      }
    }, 600)
  }
}

function updateBackendProgress() {
  const counts = getTaskCounts()
  const bp = document.getElementById('backend-progress')
  const bpf = document.getElementById('backend-progress-fill')
  const backendAllDone = counts.backendTotal > 0 && counts.backendDone === counts.backendTotal
  if (counts.backendTotal > 0 && !backendAllDone) {
    bp.classList.add('visible')
    const pct = Math.round((counts.backendDone / counts.backendTotal) * 100)
    bpf.style.width = pct + '%'
  } else {
    bp.classList.remove('visible')
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatExportTargetLabel(target) {
  if (target === 'nextjs') return 'Next.js'
  if (target === 'react') return 'React'
  if (target === 'html') return 'HTML'
  return String(target || '')
}

function formatExportTargetSummary(target) {
  if (target === 'nextjs') return 'App Router project'
  if (target === 'react') return 'React app scaffold'
  if (target === 'html') return 'Static site bundle'
  return 'Project export'
}

function formatExportTargetGlyph(target) {
  if (target === 'nextjs') return 'N'
  if (target === 'react') return 'R'
  if (target === 'html') return 'H'
  return '•'
}

function canShowExportMenu() {
  if (isAnonymousSession) return false
  if (!homepageReady) return false
  return siteSpecReady || exportTargets.length > 0
}

function ensureExportMenu() {
  let panel = document.getElementById('export-panel')
  if (!panel) {
    panel = document.createElement('div')
    panel.id = 'export-panel'
    panel.className = 'export-panel'
    panel.innerHTML = `
      <div class="export-panel-top">
        <div class="export-copy">
          <span class="export-eyebrow">Project Export</span>
          <strong>Ship this exact UI in the stack you need</strong>
          <p id="export-subtext">
            Pick a target and Ship Fast will package the current generated UI for it.
          </p>
        </div>
        <span class="export-status-badge" id="export-status">Locking mission spec…</span>
      </div>
      <div class="export-target-list" id="export-target-list"></div>
      <div class="export-panel-actions">
        <span
          id="export-building-indicator"
          style="display: none; font-size: 13px; color: #8a8f98; align-items: center; gap: 6px;"
        >Building downloads…</span>
        <button
          type="button"
          id="export-download-link"
          class="export-download-link secondary"
          style="display: none"
        >Download ZIP</button>
      </div>
    `
    document.body.appendChild(panel)
    panel.querySelector('#export-target-list').addEventListener('click', (event) => {
      const button = event.target.closest('[data-target]')
      if (!button) return
      selectedExportTarget = button.dataset.target || selectedExportTarget
      const entry = getExportEntry(selectedExportTarget)
      if (entry && entry.paymentRequired && !entry.downloadUnlocked) {
        openPaymentModal(entry)
        return
      }
      renderExportPanel()
    })
    panel.querySelector('#export-download-link').addEventListener('click', async (event) => {
      const selected = getSelectedExportEntry()
      if (!selected) return
      if (event.currentTarget.dataset.requiresPayment === '1') {
        closeExportMenu()
        openPaymentModal(selected)
        return
      }
      const href = event.currentTarget.dataset.downloadUrl
      if (!href) {
        closeExportMenu()
        return
      }
      closeExportMenu()
      try {
        const res = await apiFetch(href, { method: 'GET' })
        if (!res.ok) {
          const text = await res.text()
          let msg = 'Download failed'
          try {
            const j = JSON.parse(text)
            msg = j.error || msg
          } catch {
            if (text) msg = text.slice(0, 200)
          }
          window.alert?.(msg)
          return
        }
        const blob = await res.blob()
        const cd = res.headers.get('Content-Disposition')
        let filename = `${SESSION_ID}-${selected.target}.zip`
        const m = cd && /filename[^;=\n]*=(['"]?)([^;\n'"]+)\1/i.exec(cd)
        if (m && m[2]) filename = m[2].trim()
        const objUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = objUrl
        a.download = filename
        a.rel = 'noopener'
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(objUrl)
      } catch (e) {
        window.alert?.(String(e?.message || e || 'Download failed'))
      }
    })
  }
  return panel
}

let exportMenuAnchor = null

function positionExportMenu(anchor) {
  const panel = document.getElementById('export-panel')
  if (!panel || !anchor || !anchor.isConnected) return
  const rect = anchor.getBoundingClientRect()
  const gap = 8
  const margin = 12
  const top = rect.bottom + gap
  const availableHeight = Math.max(140, window.innerHeight - top - margin)
  panel.style.setProperty('max-height', `${Math.round(availableHeight)}px`, 'important')
  void panel.offsetWidth
  const panelWidth = panel.offsetWidth || 380
  let left = rect.right - panelWidth
  if (left < margin) left = Math.max(margin, rect.left)
  if (left + panelWidth > window.innerWidth - margin) {
    left = Math.max(margin, window.innerWidth - panelWidth - margin)
  }
  panel.style.setProperty('left', `${Math.round(left)}px`, 'important')
  panel.style.setProperty('top', `${Math.round(top)}px`, 'important')
}

function onExportMenuReposition() {
  if (!exportMenuOpen || !exportMenuAnchor) return
  positionExportMenu(exportMenuAnchor)
}

function setExportMenuOpen(nextOpen, anchor) {
  const panel = ensureExportMenu()
  const canShow = canShowExportMenu()
  exportMenuOpen = Boolean(nextOpen) && canShow
  if (exportMenuOpen) {
    if (anchor) exportMenuAnchor = anchor
    panel.style.display = 'grid'
    // Force layout now so offsetWidth/offsetHeight are accurate.
    void panel.offsetWidth
    if (exportMenuAnchor) positionExportMenu(exportMenuAnchor)
    requestAnimationFrame(() => {
      if (exportMenuAnchor) positionExportMenu(exportMenuAnchor)
      panel.classList.add('is-open')
    })
    window.addEventListener('resize', onExportMenuReposition)
    window.addEventListener('scroll', onExportMenuReposition, true)
  } else {
    panel.classList.remove('is-open')
    panel.style.display = 'none'
    exportMenuAnchor = null
    window.removeEventListener('resize', onExportMenuReposition)
    window.removeEventListener('scroll', onExportMenuReposition, true)
  }
  const railRow = document.querySelector('#preview-site-rail [data-rail-action="export"]')
  if (railRow) {
    railRow.classList.toggle('is-open', exportMenuOpen)
    railRow.setAttribute('aria-expanded', exportMenuOpen ? 'true' : 'false')
  }
}

function closeExportMenu() {
  setExportMenuOpen(false)
}

function toggleExportMenu(anchor) {
  closeGitHubMenu()
  ensureExportMenu()
  renderExportPanel()
  setExportMenuOpen(!exportMenuOpen, anchor)
}

function syncExportRailRow() {
  const row = document.querySelector('#preview-site-rail [data-rail-action="export"]')
  if (!row) return
  const metaEl = row.querySelector('[data-rail-meta="export"]')
  const badgeEl = row.querySelector('[data-rail-badge="export-state"]')

  const targets = exportTargets.length
    ? exportTargets
    : ['html', 'react', 'nextjs'].map((target) => ({ target, ready: false, buildReady: false }))
  const metaText = targets.map((entry) => formatExportTargetLabel(entry.target)).join(' / ')
  if (metaEl) metaEl.textContent = metaText

  const selected = getSelectedExportEntry()
  const requiresPayment = Boolean(selected?.paymentRequired && !selected?.downloadUnlocked)
  const anyRequiresPayment = exportTargets.some(
    (entry) => entry.paymentRequired && !entry.downloadUnlocked,
  )

  let state = 'premium'
  let label = 'Pro only'
  if (!canShowExportMenu()) {
    state = 'waiting'
    label = 'Waiting'
  } else if (requiresPayment || (!selected && anyRequiresPayment)) {
    state = 'subscribe'
    label = 'Subscribe'
  } else if (selected?.ready) {
    state = 'ready'
    label = 'Ready'
  } else if (selected?.buildReady) {
    state = 'building'
    label = 'Building'
  } else if (selected) {
    state = 'waiting'
    label = 'Waiting'
  }

  if (badgeEl) {
    badgeEl.textContent = label
    badgeEl.dataset.state = state
  }
}

function renderExportPanel() {
  const panel = document.getElementById('export-panel')
  if (!panel) {
    syncExportRailRow()
    renderGitHubPushButton()
    renderGitHubExportPanel()
    ensureExportTargetsPolling()
    return
  }
  const statusEl = panel.querySelector('#export-status')
  const subtextEl = panel.querySelector('#export-subtext')
  const targetList = panel.querySelector('#export-target-list')
  const download = panel.querySelector('#export-download-link')
  const buildingIndicator = panel.querySelector('#export-building-indicator')
  const exactCloneReady = !siteSpecReady
    ? false
    : exportTargets.every((entry) => entry.buildReady !== false)

  if (!canShowExportMenu()) {
    setExportMenuOpen(false)
    syncExportRailRow()
    renderGitHubPushButton()
    renderGitHubExportPanel()
    ensureExportTargetsPolling()
    return
  }

  if (!exportTargets.some((entry) => entry.target === selectedExportTarget)) {
    selectedExportTarget = exportTargets[0]?.target || 'html'
  }

  const selected = getSelectedExportEntry()
  const selectedLabel = selected ? formatExportTargetLabel(selected.target) : 'Export'
  const requiresPayment = Boolean(selected?.paymentRequired && !selected?.downloadUnlocked)

  targetList.innerHTML = exportTargets
    .map((entry) => {
      const label = formatExportTargetLabel(entry.target)
      const entryRequiresPayment = Boolean(entry.paymentRequired && !entry.downloadUnlocked)
      const activeClass = entryRequiresPayment
        ? ''
        : entry.target === selectedExportTarget
          ? ' is-active'
          : ''
      const stateLabel = entryRequiresPayment
        ? 'Pro only'
        : entry.ready
          ? 'Ready'
          : entry.buildReady
            ? 'Building'
            : 'Waiting'

      return `<button type="button" class="export-target${activeClass}" data-target="${escapeHtml(
        entry.target,
      )}">
              <span class="export-target-glyph" aria-hidden="true">${escapeHtml(
                formatExportTargetGlyph(entry.target),
              )}</span>
              <span class="export-target-copy">
                <span class="export-target-name">${escapeHtml(label)}</span>
                <span class="export-target-meta">${escapeHtml(formatExportTargetSummary(entry.target))}</span>
              </span>
              <span class="export-target-state">${escapeHtml(stateLabel)}</span>
            </button>`
    })
    .join('')

  const isBuilding = siteSpecReady && exactCloneReady && selected && !selected.ready
  buildingIndicator.style.display = isBuilding ? 'inline-flex' : 'none'

  if (!siteSpecReady) {
    statusEl.textContent = 'Legacy Session'
    subtextEl.textContent =
      'Build once and Ship Fast will create the canonical site spec, then generate future exports from that exact UI.'
    if (requiresPayment) {
      delete download.dataset.downloadUrl
      download.dataset.requiresPayment = '1'
      download.dataset.target = selected?.target || ''
      download.textContent = 'Subscribe to Pro'
      download.className = 'export-download-link primary'
      download.style.display = 'inline-flex'
    } else if (selected?.downloadPath) {
      download.dataset.downloadUrl = selected.downloadPath
      download.dataset.target = selected.target
      download.dataset.requiresPayment = '0'
      download.textContent = `Download ${selectedLabel}`
      download.className = `export-download-link${selected?.downloadPath ? ' primary' : ' secondary'}`
      download.style.display = 'inline-flex'
    } else {
      delete download.dataset.downloadUrl
      download.dataset.requiresPayment = '0'
      download.style.display = 'none'
    }
    if (exportMenuOpen) setExportMenuOpen(true)
    syncExportRailRow()
    renderGitHubPushButton()
    renderGitHubExportPanel()
    ensureExportTargetsPolling()
    return
  }

  statusEl.textContent = requiresPayment
    ? 'Pro Required'
    : selected?.ready
      ? 'Ready To Download'
      : selected?.buildReady
        ? 'Building Downloads…'
        : 'Waiting For Exact Clone'
  subtextEl.textContent = requiresPayment
    ? 'Subscribe to Pro or purchase download credits to export your project.'
    : selected?.ready
      ? `${selectedLabel} is up to date with the current generated UI.`
      : selected?.buildReady
        ? `Packaging ${selectedLabel} — your download will appear here shortly.`
        : selected?.buildReason ||
          `Waiting for the generated UI to finish before building ${selectedLabel}.`

  if (requiresPayment) {
    delete download.dataset.downloadUrl
    download.dataset.requiresPayment = '1'
    download.dataset.target = selected?.target || ''
    download.textContent = 'Subscribe to Pro'
    download.className = 'export-download-link primary'
    download.style.display = 'inline-flex'
  } else if (selected?.downloadPath) {
    download.dataset.downloadUrl = selected.downloadPath
    download.dataset.target = selected.target
    download.dataset.requiresPayment = '0'
    download.textContent = `Download ${selectedLabel}`
    download.className = `export-download-link${selected?.downloadPath ? ' primary' : ' secondary'}`
    download.style.display = 'inline-flex'
  } else {
    delete download.dataset.downloadUrl
    download.dataset.requiresPayment = '0'
    download.style.display = 'none'
  }

  if (exportMenuOpen) setExportMenuOpen(true)
  syncExportRailRow()
  renderGitHubPushButton()
  renderGitHubExportPanel()
  ensureExportTargetsPolling()
}

function ensureExportTargetsPolling() {
  const selected = getSelectedExportEntry()
  const shouldPoll =
    !isAnonymousSession &&
    siteSpecReady &&
    selected &&
    selected.buildReady === true &&
    selected.ready === false
  if (!shouldPoll) {
    if (exportTargetsPollTimer) {
      clearInterval(exportTargetsPollTimer)
      exportTargetsPollTimer = null
    }
    return
  }
  if (exportTargetsPollTimer) return
  let ticks = 0
  exportTargetsPollTimer = setInterval(() => {
    ticks += 1
    if (ticks > 90) {
      clearInterval(exportTargetsPollTimer)
      exportTargetsPollTimer = null
      return
    }
    void refreshExportTargets()
  }, 4000)
}

function maybeRequestExportBuilds() {
  if (isAnonymousSession || !siteSpecReady) return
  for (const entry of exportTargets) {
    if (!(entry && entry.buildReady === true && entry.ready === false)) continue
    const key = `${entry.target}:${entry.specVersion || 'v0'}`
    if (exportBuildRequested.has(key)) continue
    exportBuildRequested.add(key)
    void apiFetch(`/api/sessions/${SESSION_ID}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: entry.target }),
    })
      .then((r) => {
        if (r.status === 429) {
          entry.buildReason = 'Rate limited — try again in a few minutes.'
          renderExportPanel()
          return
        }
        if (r.status === 401 || r.status === 403) return
        if (!r.ok) {
          exportBuildRequested.delete(key)
        }
      })
      .catch(() => {
        exportBuildRequested.delete(key)
      })
  }
}

function refreshExportTargets() {
  return apiFetch(`/api/sessions/${SESSION_ID}/export-targets`)
    .then((r) => r.json())
    .then((data) => {
      siteSpecReady = Boolean(data.siteSpecReady) || siteSpecReady
      exportTargets = Array.isArray(data.targets) ? data.targets : []
      paymentState = normalizePaymentState(data.payment)
      maybeRequestExportBuilds()
      renderExportPanel()
      ensureExportTargetsPolling()
      syncPreviewSiteRail()
    })
    .catch(() => {})
}

async function pushSelectedExportToGitHub(targetOverride = selectedExportTarget) {
  if (githubPushBusy) return

  const selected =
    getExportEntry(targetOverride) ||
    getGitHubTargetEntries().find((entry) => entry.target === targetOverride)
  if (!selected) return

  const statusEl = document.getElementById('export-status')
  const subtextEl = document.getElementById('export-subtext')
  const githubStatusEl = document.getElementById('github-export-status')
  const githubSubtextEl = document.getElementById('github-export-subtext')
  const targetLabel = formatExportTargetLabel(selected.target)

  if (Boolean(selected.paymentRequired && !selected.downloadUnlocked)) {
    openPaymentModal(selected)
    return
  }

  if (selected.buildReady === false) {
    const message =
      selected.buildReason || `Wait for the generated UI to finish before pushing ${targetLabel}.`
    statusEl.textContent = 'Waiting For Exact Clone'
    subtextEl.textContent = message
    githubStatusEl.textContent = 'Waiting'
    githubSubtextEl.textContent = message
    return
  }

  selectedExportTarget = selected.target
  githubPushBusy = true
  setGitHubMenuOpen(true)
  renderGitHubPushButton()
  renderGitHubExportPanel()
  statusEl.textContent = 'GitHub Push'
  subtextEl.textContent = `Connecting GitHub and pushing the ${targetLabel} export.`
  githubStatusEl.textContent = 'GitHub Push'
  githubSubtextEl.textContent = `Connecting GitHub and pushing the ${targetLabel} export.`

  try {
    if (!window.shipFastDashboardGithub?.pushExportToGitHub) {
      throw new Error('GitHub push is still loading. Retry in a moment.')
    }

    const result = await window.shipFastDashboardGithub.pushExportToGitHub(
      SESSION_ID,
      selected.target,
    )

    lastGithubPush = result
    await refreshExportTargets()
    statusEl.textContent = result.created ? 'Repo Created' : 'GitHub Updated'
    subtextEl.textContent = `${targetLabel} pushed to ${result.repoFullName} on ${result.branch}.`
    githubStatusEl.textContent = result.created ? 'Repo Created' : 'GitHub Updated'
    githubSubtextEl.textContent = `${targetLabel} pushed to ${result.repoFullName} on ${result.branch}.`
    closeGitHubMenu()
    renderGitHubPushButton()
    window.open(result.repoUrl, '_blank', 'noopener,noreferrer')
  } catch (error) {
    if (error.paymentRequired) {
      openPaymentModal(selected)
      statusEl.textContent = 'Pro Required'
      subtextEl.textContent = `Subscribe to Pro (${getDisplayPrice()}) to push exports to GitHub.`
      githubStatusEl.textContent = 'Pro Required'
      githubSubtextEl.textContent = `Subscribe to Pro to push exports to GitHub.`
    } else {
      const message = error.message || 'GitHub push failed.'
      const needsSignIn = /sign in/i.test(message) || error?.code === 'auth/popup-blocked'
      if (needsSignIn) {
        openAuthWall()
      } else {
        statusEl.textContent = 'GitHub Push Failed'
        subtextEl.textContent = message
        githubStatusEl.textContent = 'GitHub Push Failed'
        githubSubtextEl.textContent = message
        showRailToast(message, 5000)
      }
    }
  } finally {
    githubPushBusy = false
    renderGitHubPushButton()
    renderGitHubExportPanel()
  }
}

// ─── Intro Animation ───────────────────────────────────────
const introWarpCanvas = (() => {
  let c = null
  let ctx = null
  let raf = 0
  let running = false
  let D = 1
  let W = 0
  let H = 0
  const PTS = 200
  const SEG = 1.85
  const DARK = 2.0
  const CYCLE = SEG + DARK
  const lerp = (a, b, t) => a + (b - a) * t
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
  const easeOut = (t) => 1 - Math.pow(1 - t, 3)
  const col = (t) => {
    if (t < 0.34) {
      const u = t / 0.34
      return [lerp(20, 64, u) | 0, lerp(12, 36, u) | 0, lerp(48, 140, u) | 0]
    }
    if (t < 0.67) {
      const u = (t - 0.34) / 0.33
      return [lerp(64, 130, u) | 0, lerp(36, 72, u) | 0, lerp(140, 237, u) | 0]
    }
    const u = (t - 0.67) / 0.33
    return [lerp(130, 251, u) | 0, lerp(72, 191, u) | 0, lerp(237, 52, u) | 0]
  }
  const bezierArc = (p0, p1, p2, p3) => {
    const pts = []
    const ns = []
    for (let i = 0; i <= PTS; i++) {
      const t = i / PTS
      const u = 1 - t
      pts.push({
        x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
        y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
      })
    }
    for (let i = 0; i <= PTS; i++) {
      const prev = pts[Math.max(0, i - 1)]
      const next = pts[Math.min(PTS, i + 1)]
      const dx = next.x - prev.x
      const dy = next.y - prev.y
      const l = Math.sqrt(dx * dx + dy * dy) || 0.001
      ns.push({ nx: -dy / l, ny: dx / l })
    }
    return { pts, norms: ns }
  }
  const arcA = bezierArc(
    { x: -0.1, y: -0.05 },
    { x: 0.18, y: 0.68 },
    { x: 0.82, y: 0.48 },
    { x: 1.15, y: 0.48 },
  )
  const arcB = bezierArc(
    { x: 1.12, y: 1.08 },
    { x: 0.75, y: 0.45 },
    { x: 0.28, y: 0.3 },
    { x: -0.12, y: -0.05 },
  )
  const arcs = [arcA, arcB]
  const vps = [
    { x: 1.5, y: 0.48 },
    { x: -0.5, y: -0.4 },
  ]
  const zSeq = [0.25, 0.9, 0.15, 1.0, 0.4, 0.75, 0.2, 0.95, 0.3, 0.6, 0.1, 0.85]
  let zIdx = 0
  let currentZ = 0.3
  let lastSeg = -1
  const passes = [
    { s: 10, a: 0.005 },
    { s: 6, a: 0.013 },
    { s: 3.5, a: 0.032 },
    { s: 2, a: 0.075 },
    { s: 1.2, a: 0.16 },
    { s: 1, a: 0.34 },
    { s: 0.12, a: 0.82, w: true },
  ]
  const tone = 0.62
  const onResize = () => {
    if (!c) return
    D = Math.min(window.devicePixelRatio || 1, 2)
    W = c.width = window.innerWidth * D
    H = c.height = window.innerHeight * D
    c.style.width = window.innerWidth + 'px'
    c.style.height = window.innerHeight + 'px'
  }
  const draw = (ts) => {
    if (!running || !ctx) return
    const t = ts / 1000
    const segNum = Math.floor(t / CYCLE)
    const local = t - segNum * CYCLE
    const arcIdx = segNum % 2
    const arc = arcs[arcIdx]
    const vp = vps[arcIdx]
    const vpx = vp.x * W
    const vpy = vp.y * H
    if (segNum !== lastSeg) {
      lastSeg = segNum
      zIdx = (zIdx + 1) % zSeq.length
      currentZ = zSeq[zIdx]
    }
    ctx.clearRect(0, 0, W, H)
    if (local > SEG) {
      raf = requestAnimationFrame(draw)
      return
    }
    const master = local / SEG
    const p = easeOut(master)
    const drawProg = clamp(p * 2.5, 0, 1)
    const warp = easeOut(p)
    let fade = 1
    if (master > 0.6) fade = 1 - easeOut((master - 0.6) / 0.4)
    fade *= tone
    const z = currentZ
    const alphaBoost = (1 + warp * warp * 2) * fade
    const count = Math.max(3, Math.floor(drawProg * (PTS + 1)))
    if (fade < 0.01) {
      raf = requestAnimationFrame(draw)
      return
    }
    for (let pi = 0; pi < passes.length; pi++) {
      const pass = passes[pi]
      ctx.beginPath()
      for (let k = 0; k < count; k++) {
        const pt = arc.pts[k]
        const n = arc.norms[k]
        let px = pt.x * W
        let py = pt.y * H
        const age = k / (count - 1 || 1)
        if (warp > 0) {
          const sf = age * age * age
          const stretch = warp * (0.02 + sf * 0.98)
          px = lerp(px, vpx, stretch)
          py = lerp(py, vpy, stretch)
        }
        let base = (8 + age * age * 28) * D + z * z * 12 * D
        if (warp > 0) base += warp * age * age * (195 + z * 245) * D
        const w = base * pass.s * (1 + warp * age * 0.14)
        if (k === 0) ctx.moveTo(px + n.nx * w, py + n.ny * w)
        else ctx.lineTo(px + n.nx * w, py + n.ny * w)
      }
      for (let k = count - 1; k >= 0; k--) {
        const pt = arc.pts[k]
        const n = arc.norms[k]
        let px = pt.x * W
        let py = pt.y * H
        const age = k / (count - 1 || 1)
        if (warp > 0) {
          const sf = age * age * age
          const stretch = warp * (0.02 + sf * 0.98)
          px = lerp(px, vpx, stretch)
          py = lerp(py, vpy, stretch)
        }
        let base = (8 + age * age * 28) * D + z * z * 12 * D
        if (warp > 0) base += warp * age * age * (195 + z * 245) * D
        const w = base * pass.s * (1 + warp * age * 0.14)
        ctx.lineTo(px - n.nx * w, py - n.ny * w)
      }
      ctx.closePath()
      const p0 = arc.pts[0]
      const pN = arc.pts[count - 1]
      let x0 = p0.x * W
      let y0 = p0.y * H
      let xN = pN.x * W
      let yN = pN.y * H
      if (warp > 0) {
        xN = lerp(xN, vpx, warp)
        yN = lerp(yN, vpy, warp)
        x0 = lerp(x0, vpx, warp * 0.02)
        y0 = lerp(y0, vpy, warp * 0.02)
      }
      const grd = ctx.createLinearGradient(x0, y0, xN, yN)
      const c0 = col(0)
      const cM = col(0.5)
      const c1 = col(1)
      const a = pass.a * alphaBoost
      if (pass.w) {
        grd.addColorStop(0, `rgba(220,210,255,${a * 0.22})`)
        grd.addColorStop(0.5, `rgba(248,242,255,${a * 0.52})`)
        grd.addColorStop(1, `rgba(255,252,255,${a})`)
      } else {
        grd.addColorStop(0, `rgba(${c0[0]},${c0[1]},${c0[2]},${a * 0.42})`)
        grd.addColorStop(0.35, `rgba(${cM[0]},${cM[1]},${cM[2]},${a * 0.78})`)
        grd.addColorStop(1, `rgba(${c1[0]},${c1[1]},${c1[2]},${a})`)
      }
      ctx.fillStyle = grd
      ctx.fill()
    }
    if (warp < 0.9 && fade > 0.1) {
      const hp = arc.pts[count - 1]
      let hx = hp.x * W
      let hy = hp.y * H
      if (warp > 0) {
        hx = lerp(hx, vpx, warp)
        hy = lerp(hy, vpy, warp)
      }
      const hc = col(count / PTS)
      const hsz = (18 + warp * 56 + z * 16) * D
      const g1 = ctx.createRadialGradient(hx, hy, 0, hx, hy, hsz * 4)
      g1.addColorStop(0, `rgba(255,250,255,${0.82 * fade})`)
      g1.addColorStop(0.08, `rgba(${hc[0]},${hc[1]},${hc[2]},${0.22 * fade})`)
      g1.addColorStop(0.4, `rgba(${hc[0]},${hc[1]},${hc[2]},0.03)`)
      g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1
      ctx.beginPath()
      ctx.arc(hx, hy, hsz * 4, 0, Math.PI * 2)
      ctx.fill()
      const g2 = ctx.createRadialGradient(hx, hy, 0, hx, hy, hsz * 0.4)
      g2.addColorStop(0, `rgba(255,252,255,${fade})`)
      g2.addColorStop(1, 'transparent')
      ctx.fillStyle = g2
      ctx.beginPath()
      ctx.arc(hx, hy, hsz * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }
    const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.15, W / 2, H / 2, W * 0.9)
    vg.addColorStop(0, 'rgba(0,0,0,0)')
    vg.addColorStop(1, `rgba(7,7,16,${lerp(0.22, 0.05, warp)})`)
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, W, H)
    raf = requestAnimationFrame(draw)
  }
  return {
    start() {
      c = document.getElementById('intro-warp-canvas')
      if (!c) return
      ctx = c.getContext('2d')
      if (!ctx) return
      if (running) return
      running = true
      onResize()
      window.addEventListener('resize', onResize)
      raf = requestAnimationFrame(draw)
    },
    stop() {
      running = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      window.removeEventListener('resize', onResize)
      if (c && ctx) {
        ctx.clearRect(0, 0, c.width || 0, c.height || 0)
      }
    },
  }
})()

function startIntro() {
  introWarpCanvas.start()
  const logo = document.getElementById('intro-logo')
  const phase = document.getElementById('intro-phase-label')

  requestAnimationFrame(() => {
    logo.classList.add('visible')
    setTimeout(() => {
      logo.classList.add('shaking')
      emitExhaustParticles()
      const sfx = document.getElementById('launch-sfx')
      if (sfx) {
        sfx.volume = 0.7
        sfx.play().catch(() => {})
      }
    }, 600)

    setTimeout(() => {
      logo.classList.remove('shaking')
      logo.classList.add('settled')
      phase.classList.add('visible')
      emitLaunchBurst()
    }, 1600)

    setTimeout(() => {
      document.getElementById('intro-typing').classList.add('visible')
      startTyping()
    }, 2600)
  })
}

function emitExhaustParticles() {
  if (exhaustTimerId) {
    clearTimeout(exhaustTimerId)
    exhaustTimerId = null
  }
  const logo = document.getElementById('intro-logo')
  if (
    !logo ||
    !logo.classList.contains('shaking') ||
    document.body.classList.contains('sf-openui-active')
  )
    return
  const rect = logo.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.bottom
  for (let i = 0; i < 2; i++) {
    if (particles.length >= MAX_PARTICLES) break
    particles.push({
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + Math.random() * 10,
      vx: (Math.random() - 0.5) * 60,
      vy: 80 + Math.random() * 120,
      color: ['#7c3aed', '#a78bfa', '#f97316', '#fbbf24'][Math.floor(Math.random() * 4)],
      life: 0.4 + Math.random() * 0.3,
      maxLife: 0.7,
      size: 2 + Math.random() * 3,
    })
  }
  ensureAnimating()
  exhaustTimerId = setTimeout(emitExhaustParticles, 50)
}

function emitLaunchBurst() {
  const logo = document.getElementById('intro-logo')
  const rect = logo.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const colors = ['#7c3aed', '#a78bfa', '#c4b5fd', '#f97316', '#fbbf24', '#fff']
  for (let i = 0; i < 40; i++) {
    if (particles.length >= MAX_PARTICLES) break
    const angle = Math.random() * Math.PI * 2
    const speed = 100 + Math.random() * 300
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0.6 + Math.random() * 0.8,
      maxLife: 1.4,
      size: 2 + Math.random() * 5,
    })
  }
  ensureAnimating()
}

function startTyping() {
  if (!introPromptText) {
    setTimeout(startTyping, 100)
    return
  }
  const el = document.getElementById('typing-text')
  let i = 0
  const interval = setInterval(() => {
    if (i < introPromptText.length) {
      el.textContent += introPromptText[i]
      i++
    } else {
      clearInterval(interval)
      typingDone = true
      document.getElementById('typing-cursor').style.display = 'none'

      setTimeout(() => {
        document.getElementById('intro-logo').classList.add('post-typing')
        document.getElementById('intro-typing').classList.add('post-typing')
        document.getElementById('intro-phase-label').classList.add('post-typing')
      }, 800)
      if (pendingStatus) {
        setPhaseLabel(pendingStatus)
        pendingStatus = ''
      }
    }
  }, 25)
}

function setPhaseLabel(text) {
  const statusLabel = document.getElementById('intro-phase-label')
  if (statusLabel.classList.contains('visible') && statusLabel.textContent !== text) {
    statusLabel.classList.add('switching')
    setTimeout(() => {
      statusLabel.textContent = text
      statusLabel.classList.remove('switching')
    }, 100)
  } else {
    statusLabel.textContent = text
    statusLabel.classList.add('visible')
  }
}

function exitIntro() {
  if (!introActive) return
  introActive = false
  introWarpCanvas.stop()

  const overlay = document.getElementById('intro-overlay')
  const wrap = document.getElementById('dashboard-wrap')

  document.body.classList.add('dashboard-active')
  overlay.classList.add('exiting')
  wrap.classList.add('active')
  setTimeout(() => overlay.classList.add('hidden'), 800)
}

function skipIntro() {
  introActive = false
  introWarpCanvas.stop()

  const overlay = document.getElementById('intro-overlay')
  const wrap = document.getElementById('dashboard-wrap')
  const leftPanel = document.getElementById('left-panel')
  const rightPanel = document.getElementById('right-panel')

  // Instantly hide intro, show dashboard
  document.body.classList.add('dashboard-active')
  overlay.classList.add('exiting', 'hidden')
  overlay.style.display = 'none'
  wrap.classList.add('active')

  // Preview full-width immediately
  drawerOpen = true
  frontendComplete = true
  leftPanel.classList.add('drawer-open', 'collapsed')
  rightPanel.classList.add('expanded')
  document.getElementById('preview-loading').classList.add('hidden')
  loadPreview()
}

// ─── Pixel art sprites for agent avatars ───────────────────
const SPRITE_FRAMES = [
  [
    '................',
    '......HHHH......',
    '.....HHHHHH.....',
    '....HSSSSSH.....',
    '....SEEEESH.....',
    '....SEEEESH.....',
    '....SSMMSS......',
    '.....SSSS.......',
    '....CCCCCC......',
    '...CCCCCCCC.....',
    '...CCCCCCCC.....',
    '...CC.CC.CC.....',
    '....CCCCCC......',
    '....LL..LL......',
    '....LL..LL......',
    '...BBB..BBB.....',
  ],
]
const PALETTES = [
  {
    H: '#00cec9',
    S: '#ffeaa7',
    E: '#2d3436',
    M: '#e17055',
    C: '#00b894',
    L: '#2d3436',
    B: '#636e72',
  },
  {
    H: '#fdcb6e',
    S: '#ffeaa7',
    E: '#2d3436',
    M: '#e17055',
    C: '#e17055',
    L: '#2d3436',
    B: '#636e72',
  },
  {
    H: '#74b9ff',
    S: '#ffeaa7',
    E: '#2d3436',
    M: '#e17055',
    C: '#0984e3',
    L: '#2d3436',
    B: '#636e72',
  },
  {
    H: '#ff7675',
    S: '#ffeaa7',
    E: '#2d3436',
    M: '#e17055',
    C: '#d63031',
    L: '#2d3436',
    B: '#636e72',
  },
  {
    H: '#a29bfe',
    S: '#ffeaa7',
    E: '#2d3436',
    M: '#e17055',
    C: '#6c5ce7',
    L: '#2d3436',
    B: '#636e72',
  },
  {
    H: '#55efc4',
    S: '#ffeaa7',
    E: '#2d3436',
    M: '#e17055',
    C: '#00b894',
    L: '#2d3436',
    B: '#636e72',
  },
]

const spriteCache = new Map()
function renderSprite(paletteIndex) {
  const key = 'p' + paletteIndex
  if (spriteCache.has(key)) return spriteCache.get(key)
  const palette = PALETTES[paletteIndex % PALETTES.length]
  const frame = SPRITE_FRAMES[0]
  const c = document.createElement('canvas')
  c.width = 32
  c.height = 32
  const ctx = c.getContext('2d')
  const px = 2
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const ch = frame[y][x]
      if (ch === '.') continue
      ctx.fillStyle = palette[ch] || '#fff'
      ctx.fillRect(x * px, y * px, px, px)
    }
  }
  spriteCache.set(key, c)
  return c
}

// ─── Task list rendering ───────────────────────────────────
function renderTasks() {
  const container = document.getElementById('task-list')
  const loader = document.getElementById('task-planning-loader')
  if (loader) loader.style.display = tasks.length === 0 ? 'flex' : 'none'

  const existing = new Set()
  tasks.forEach((t) => existing.add(t.id))

  container.querySelectorAll('.task-item').forEach((el) => {
    if (!existing.has(el.dataset.id)) el.remove()
  })

  tasks.forEach((task, idx) => {
    let el = container.querySelector(`[data-id="${task.id}"]`)
    const status = task.status || 'PENDING'

    if (!el) {
      el = document.createElement('div')
      el.className = 'task-item'
      el.dataset.id = task.id
      el.style.animationDelay = idx * 0.08 + 's'

      const avatar = document.createElement('div')
      avatar.className = 'agent-avatar'
      const spriteCanvas = renderSprite(idx)
      const cloned = document.createElement('canvas')
      cloned.width = 32
      cloned.height = 32
      cloned.getContext('2d').drawImage(spriteCanvas, 0, 0)
      avatar.appendChild(cloned)

      const spinnerDiv = document.createElement('div')
      spinnerDiv.className = 'spinner'
      spinnerDiv.style.display = 'none'
      avatar.appendChild(spinnerDiv)

      const info = document.createElement('div')
      info.className = 'task-info'
      const title = document.createElement('div')
      title.className = 'task-title'
      title.textContent = task.title || task.id
      const files = document.createElement('div')
      files.className = 'task-files'
      files.textContent = (task.files || []).join(', ') || 'no files'
      info.appendChild(title)
      info.appendChild(files)

      const badge = document.createElement('span')
      badge.className = 'status-badge pending'
      badge.textContent = 'wait'

      el.appendChild(avatar)
      el.appendChild(info)
      el.appendChild(badge)
      container.appendChild(el)
    } else {
      // Update files display if task has been updated with files
      const filesEl = el.querySelector('.task-files')
      if (filesEl && task.files && task.files.length > 0) {
        filesEl.textContent = task.files.join(', ')
      }
    }

    const badge = el.querySelector('.status-badge')
    const spinner = el.querySelector('.spinner')
    el.classList.remove('running', 'done', 'failed')

    if (status === 'IN_PROGRESS') {
      el.classList.add('running')
      badge.className = 'status-badge running'
      badge.textContent = 'run'
      if (spinner) spinner.style.display = 'block'
    } else if (status === 'DONE') {
      el.classList.add('done')
      badge.className = 'status-badge done'
      badge.textContent = 'done'
      if (spinner) spinner.style.display = 'none'
    } else if (status === 'FAILED') {
      el.classList.add('failed')
      badge.className = 'status-badge failed'
      badge.textContent = 'fail'
      if (spinner) spinner.style.display = 'none'
    } else {
      badge.className = 'status-badge pending'
      badge.textContent = 'wait'
      if (spinner) spinner.style.display = 'none'
    }
  })

  updateStats()
  updatePreviewProgress()
  updateBackendProgress()
}

function updateStats() {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'DONE').length
  const failed = tasks.filter((t) => t.status === 'FAILED').length
  const finished = done + failed

  const timingEl = document.getElementById('gen-timing')
  if (timingEl && !allDone) {
    if (total === 0) {
      timingEl.textContent = 'Trajectory check…'
    } else {
      const elapsed =
        persistedElapsed != null && finished >= total
          ? persistedElapsed
          : Math.round((Date.now() - genStartTime) / 1000)
      const counts = getTaskCounts()
      timingEl.textContent =
        counts.frontendTotal > 0
          ? `Main engine: ${counts.frontendDone}/${counts.frontendTotal} frontend tasks · ${elapsed}s`
          : `Main engine: ${done}/${total} pages · ${elapsed}s`
    }
  }

  const pct = total > 0 ? Math.round((finished / total) * 100) : 0
  document.getElementById('progress-pct').textContent = pct + '%'
  const fill = document.getElementById('progress-fill')
  fill.style.width = pct + '%'
  if (failed > 0) fill.classList.add('has-failures')
  else fill.classList.remove('has-failures')
}

function triggerTeleport(taskId) {
  const el = document.querySelector(`[data-id="${taskId}"]`)
  if (el && !el.classList.contains('teleporting')) {
    el.classList.add('teleporting')
  }
}

function triggerCompletion() {
  if (allDone) return
  allDone = true

  // Only show completion toast for live generations (not revisits)
  if (hasSeenLiveUpdate) {
    const elapsed = Math.round((Date.now() - genStartTime) / 1000)
    document.getElementById('toast-elapsed').textContent = elapsed + 's'
    const toast = document.getElementById('completion-toast')
    toast.classList.add('visible')
    if (isRailUnlocked()) {
      const fab = document.getElementById('preview-chat-fab')
      const panel = document.getElementById('preview-chat-panel')
      if (fab) fab.setAttribute('aria-expanded', 'true')
      if (panel) panel.hidden = false
    }
  }

  document.getElementById('preview-loading').classList.add('hidden')

  const bp = document.getElementById('backend-progress')
  bp.style.transition = 'opacity 1.5s ease'
  bp.style.opacity = '0'
  setTimeout(() => bp.classList.remove('visible'), 1500)

  if (!frontendComplete) {
    document.getElementById('left-panel').classList.add('collapsed')
    document.getElementById('right-panel').classList.remove('open')
    document.getElementById('right-panel').classList.add('expanded')
  }

  // Always reload preview at completion (nav links were fixed after tasks completed)
  setTimeout(reloadPreview, 800)

  emitCelebrationParticles()
}

// ─── Particles ─────────────────────────────────────────────
const particlesCanvas = document.getElementById('particles-canvas')
const pCtx = particlesCanvas.getContext('2d')
let particles = []
const MAX_PARTICLES = 40
let animRafId = null
let exhaustTimerId = null

function ensureAnimating() {
  if (animRafId !== null) return
  lastParticleTime = performance.now()
  animRafId = requestAnimationFrame(animateParticles)
}

function resizeParticles() {
  particlesCanvas.width = window.innerWidth * devicePixelRatio
  particlesCanvas.height = window.innerHeight * devicePixelRatio
  particlesCanvas.style.width = window.innerWidth + 'px'
  particlesCanvas.style.height = window.innerHeight + 'px'
}
resizeParticles()
window.addEventListener('resize', resizeParticles)

function emitCelebrationParticles() {
  const colors = ['#7c3aed', '#a78bfa', '#69f0ae', '#ffd740', '#ff6e40', '#40c4ff', '#ea80fc']
  for (let i = 0; i < 60; i++) {
    if (particles.length >= MAX_PARTICLES) break
    particles.push({
      x: window.innerWidth * Math.random(),
      y: window.innerHeight + 10,
      vx: (Math.random() - 0.5) * 300,
      vy: -400 - Math.random() * 300,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 2 + Math.random(),
      maxLife: 2 + Math.random(),
      size: 3 + Math.random() * 4,
    })
  }
  ensureAnimating()
}

let lastParticleTime = 0
function animateParticles(now) {
  const dt = Math.min(0.033, (now - lastParticleTime) / 1000)
  lastParticleTime = now

  const dpr = devicePixelRatio
  pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height)
  pCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.life -= dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += 300 * dt
    if (p.life <= 0) {
      particles.splice(i, 1)
      continue
    }
    const alpha = Math.max(0, p.life / p.maxLife)
    pCtx.globalAlpha = alpha
    pCtx.fillStyle = p.color
    pCtx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
  }
  pCtx.globalAlpha = 1
  if (particles.length === 0) {
    pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height)
    animRafId = null
    return
  }
  animRafId = requestAnimationFrame(animateParticles)
}

function looksLikeTrustedStockImageUrl(s) {
  const raw = String(s || '').trim()
  if (!raw || raw.startsWith('data:')) return false
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:') return false
    const h = u.hostname
    return (
      h === 'images.pexels.com' ||
      h.endsWith('.pexels.com') ||
      h === 'images.unsplash.com' ||
      h.endsWith('.unsplash.com')
    )
  } catch {
    return false
  }
}

function normalizeStockImageMatchKey(src) {
  const s = String(src || '').trim()
  if (!s || s.startsWith('data:')) return ''
  try {
    const u = new URL(s)
    if (u.protocol !== 'https:') return ''
    const path = u.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
    const h = u.hostname
    if (h === 'images.pexels.com' || h.endsWith('.pexels.com')) {
      const id = path.match(/\/photos\/(\d+)\//)?.[1]
      if (id) return `pexels:${id}`
    }
    if (h === 'images.unsplash.com' || h.endsWith('.unsplash.com')) return path.toLowerCase()
    if (looksLikeTrustedStockImageUrl(s)) return path.toLowerCase()
    return ''
  } catch {
    return ''
  }
}

function findOrbitThumbByKey(orbit, key) {
  for (let i = 0; i < orbit.children.length; i++) {
    const el = orbit.children[i]
    if (el.dataset && el.dataset.sfMatchKey === key) return el
  }
  return null
}

function layoutIntroMediaOrbit() {
  const orbit = document.getElementById('intro-media-orbit')
  if (!orbit) return
  const thumbs = [...orbit.children]
  const n = thumbs.length
  if (!n) return
  const cx = 50
  const cy = 40
  const r = 36
  thumbs.forEach((thumb, i) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2
    thumb.style.left = `${cx + r * Math.cos(ang)}%`
    thumb.style.top = `${cy + r * Math.sin(ang)}%`
    const stagger = Math.min(i, 7)
    thumb.style.animationDelay = `${0.06 + stagger * 0.1}s`
    thumb.classList.remove(
      'sf-orbit-stagger-0',
      'sf-orbit-stagger-1',
      'sf-orbit-stagger-2',
      'sf-orbit-stagger-3',
      'sf-orbit-stagger-4',
      'sf-orbit-stagger-5',
      'sf-orbit-stagger-6',
      'sf-orbit-stagger-7',
    )
    thumb.classList.add(`sf-orbit-stagger-${stagger}`)
  })
}

function applyStockMediaPreviewPhotos(photos) {
  const orbit = document.getElementById('intro-media-orbit')
  if (!orbit) return
  introMediaFlipConsumed = false
  const MAX_ORBIT = 8
  for (let pi = 0; pi < (photos || []).length; pi++) {
    const p = photos[pi]
    const src = String(p.url || p.rawUrl || '').trim()
    if (!src) continue
    const key = normalizeStockImageMatchKey(src)
    if (!key) continue
    let thumb = findOrbitThumbByKey(orbit, key)
    if (!thumb) {
      if (orbit.childElementCount >= MAX_ORBIT) orbit.removeChild(orbit.firstElementChild)
      thumb = document.createElement('div')
      thumb.className = 'intro-media-thumb'
      thumb.dataset.sfMatchKey = key
      const im = document.createElement('img')
      im.alt = ''
      thumb.appendChild(im)
      orbit.appendChild(thumb)
    }
    const im = thumb.querySelector('img')
    if (im) im.src = src
  }
  layoutIntroMediaOrbit()
}

function runIntroMediaFlipPairs(pairs) {
  const duration = 620
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)'
  pairs.forEach(({ thumb, target }) => {
    const from = thumb.getBoundingClientRect()
    const to = target.getBoundingClientRect()
    if (from.width < 2 || from.height < 2 || to.width < 2 || to.height < 2) return
    const srcImg = thumb.querySelector('img')
    if (!srcImg || !srcImg.src) return
    const clone = srcImg.cloneNode()
    clone.removeAttribute('sizes')
    clone.style.position = 'fixed'
    clone.style.left = `${from.left}px`
    clone.style.top = `${from.top}px`
    clone.style.width = `${from.width}px`
    clone.style.height = `${from.height}px`
    clone.style.objectFit = 'cover'
    clone.style.borderRadius = '12px'
    clone.style.zIndex = '9998'
    clone.style.pointerEvents = 'none'
    clone.style.boxShadow = '0 14px 44px rgba(0,0,0,0.4)'
    document.body.appendChild(clone)
    thumb.style.opacity = '0'
    const anim = clone.animate(
      [
        {
          left: `${from.left}px`,
          top: `${from.top}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
          opacity: 1,
          borderRadius: '12px',
        },
        {
          left: `${to.left}px`,
          top: `${to.top}px`,
          width: `${to.width}px`,
          height: `${to.height}px`,
          opacity: 0.96,
          borderRadius: '4px',
        },
      ],
      { duration, easing, fill: 'forwards' },
    )
    anim.onfinish = () => clone.remove()
  })
}

function maybeRunIntroMediaFlip(iframe) {
  const orbit = document.getElementById('intro-media-orbit')
  if (!orbit || orbit.childElementCount === 0) return
  if (introMediaFlipConsumed) return
  let doc
  try {
    doc = iframe && iframe.contentDocument
  } catch {
    return
  }
  if (!doc) return
  const targets = new Map()
  doc.querySelectorAll('img').forEach((img) => {
    const rawAttr = img.getAttribute('data-sf-stock-src')
    const key = (rawAttr && rawAttr.trim()) || normalizeStockImageMatchKey(img.src)
    if (!key || targets.has(key)) return
    targets.set(key, img)
  })
  const pairs = []
  ;[...orbit.querySelectorAll('.intro-media-thumb')].forEach((thumb) => {
    const key = thumb.dataset.sfMatchKey
    const imgEl = key && targets.get(key)
    if (imgEl) pairs.push({ thumb, target: imgEl })
  })
  if (!pairs.length) return
  introMediaFlipConsumed = true
  requestAnimationFrame(() => {
    requestAnimationFrame(() => runIntroMediaFlipPairs(pairs))
  })
}

function onPreviewIframeLoaded() {
  previewLoaded = true
  syncPreviewChrome()
  syncPreviewTheme()
  syncPreviewInspectTools()
  maybeRunIntroMediaFlip(document.getElementById('preview-iframe'))
}

// ─── Preview iframe loading ─────────────────────────────────
let preloadStarted = false

function getPreviewFrameSrc(cacheBust) {
  if (nextPreviewActive && nextPreviewBase) {
    const b = String(nextPreviewBase).replace(/\/$/, '')
    return cacheBust ? `${b}/?t=${Date.now()}` : `${b}/`
  }
  return cacheBust ? `${PREVIEW_BASE}?t=${Date.now()}` : PREVIEW_BASE
}

function resetPreviewToSessionHtml() {
  nextPreviewActive = false
  nextPreviewBase = ''
  const iframe = document.getElementById('preview-iframe')
  if (!iframe || !SESSION_ID) return
  preloadStarted = true
  iframe.src = getPreviewFrameSrc(true)
  iframe.onload = () => onPreviewIframeLoaded()
}

function maybeWarmNextDevServerInBackground() {
  if (!SESSION_ID) return Promise.resolve()
  if (nextPreviewBootPromise) return nextPreviewBootPromise
  nextPreviewBootPromise = (async () => {
    try {
      const res = await apiFetch(`/api/sessions/${SESSION_ID}/next-preview`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.enabled) return
      if (!data.autostart) return
      if (data.running && data.url) return
      if (!data.ecommerce) return
      const st = await apiFetch(`/api/sessions/${SESSION_ID}/next-preview/start`, {
        method: 'POST',
      })
      const out = await st.json().catch(() => ({}))
      if (!st.ok) return
      if (out.starting) {
        const deadline = Date.now() + 200000
        while (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 2000))
          const r2 = await apiFetch(`/api/sessions/${SESSION_ID}/next-preview`)
          const d2 = await r2.json().catch(() => ({}))
          if (r2.ok && d2.running && d2.url) return
        }
      }
    } catch {
      void 0
    } finally {
      nextPreviewBootPromise = null
    }
  })()
  return nextPreviewBootPromise
}

function preloadPreview() {
  if (preloadStarted) return
  preloadStarted = true
  const iframe = document.getElementById('preview-iframe')
  iframe.src = getPreviewFrameSrc(false)
  iframe.onload = () => onPreviewIframeLoaded()
}

function loadPreview() {
  if (!preloadStarted) preloadPreview()
  else if (previewLoaded) {
    const iframe = document.getElementById('preview-iframe')
    iframe.onload = () => onPreviewIframeLoaded()
    iframe.src = getPreviewFrameSrc(true)
  }
}

function reloadPreview() {
  if (!preloadStarted) return
  const iframe = document.getElementById('preview-iframe')
  iframe.onload = () => onPreviewIframeLoaded()
  iframe.src = getPreviewFrameSrc(true)
}

const PREVIEW_DEVICE_KEY = 'sf_preview_device'

function applyPreviewDeviceMode(mode) {
  const stage = document.getElementById('preview-stage')
  if (!stage) return
  stage.classList.remove('sf-device-desktop', 'sf-device-tablet', 'sf-device-mobile')
  const m = mode === 'tablet' || mode === 'mobile' ? mode : 'desktop'
  stage.classList.add(`sf-device-${m}`)
  try {
    sessionStorage.setItem(PREVIEW_DEVICE_KEY, m)
  } catch {
    void 0
  }
  document.querySelectorAll('.preview-device-btn').forEach((btn) => {
    const active = btn.getAttribute('data-preview-device') === m
    btn.classList.toggle('is-active', active)
    btn.setAttribute('aria-pressed', active ? 'true' : 'false')
  })
}

function initPreviewFrameTools() {
  document.getElementById('preview-refresh-btn')?.addEventListener('click', () => {
    reloadPreview()
  })
  document.querySelectorAll('.preview-device-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyPreviewDeviceMode(btn.getAttribute('data-preview-device') || 'desktop')
    })
  })
  let initial = 'desktop'
  try {
    const saved = sessionStorage.getItem(PREVIEW_DEVICE_KEY)
    if (saved === 'tablet' || saved === 'mobile' || saved === 'desktop') initial = saved
  } catch {
    void 0
  }
  applyPreviewDeviceMode(initial)
  document.querySelector('[data-preview-tool="select"]')?.addEventListener('click', () => {
    if (previewAnnotatorActive) previewAnnotatorActive = false
    previewSelectMode = !previewSelectMode
    syncPreviewInspectTools()
  })
  document.querySelector('[data-preview-tool="annotate"]')?.addEventListener('click', () => {
    if (previewSelectMode) previewSelectMode = false
    previewAnnotatorActive = !previewAnnotatorActive
    syncPreviewInspectTools()
  })
  document.querySelector('[data-preview-tool="clear-annotate"]')?.addEventListener('click', () => {
    postAnnotatorClearToPreview()
  })
}

initPreviewFrameTools()

function showPreviewChatDock() {
  const dock = document.getElementById('preview-chat-dock')
  if (dock && SESSION_ID) dock.removeAttribute('hidden')
  syncPreviewSiteRail()
}

function openPreviewChatPanel() {
  showPreviewChatDock()
  const panel = document.getElementById('preview-chat-panel')
  const fab = document.getElementById('preview-chat-fab')
  if (panel) panel.hidden = false
  if (fab) fab.setAttribute('aria-expanded', 'true')
  syncCmsSidebarLayout()
}

function getPreviewFramePathname() {
  const iframe = document.getElementById('preview-iframe')
  try {
    const p = iframe?.contentWindow?.location?.pathname
    if (p && typeof p === 'string') return p
  } catch {
    void 0
  }
  return '/'
}

function setChatBuilding(show) {
  const typing = document.getElementById('preview-chat-typing')
  const panel = document.getElementById('preview-chat-panel')
  if (typing) typing.hidden = !show
  if (panel) panel.classList.toggle('preview-chat-panel--building', Boolean(show))
  const scroll = document.getElementById('preview-chat-scroll')
  if (scroll && show) scroll.scrollTop = scroll.scrollHeight
}

function renderChatMessages(msgs) {
  const el = document.getElementById('preview-chat-messages')
  const scroll = document.getElementById('preview-chat-scroll')
  if (!el) return
  el.innerHTML = ''
  ;(msgs || []).forEach((m) => {
    const row = document.createElement('div')
    row.className =
      'preview-chat-row preview-chat-row--' + (m.role === 'assistant' ? 'assistant' : 'user')
    const bubble = document.createElement('div')
    bubble.className =
      'preview-chat-bubble preview-chat-bubble--' + (m.role === 'assistant' ? 'assistant' : 'user')
    bubble.textContent = m.content || ''
    row.appendChild(bubble)
    el.appendChild(row)
  })
  if (scroll) scroll.scrollTop = scroll.scrollHeight
}

function setChatFormDisabled(disabled) {
  const input = document.getElementById('preview-chat-input')
  const send = document.getElementById('preview-chat-send')
  const attach = document.getElementById('preview-chat-attach')
  const addSec = document.getElementById('preview-chat-add-section')
  const d = disabled || !chatEditable
  if (input) input.disabled = d
  if (send) send.disabled = d
  if (attach) attach.disabled = d
  if (addSec) addSec.disabled = d || chatPanelMode !== 'llm'
}

async function refreshChatHistory() {
  if (!SESSION_ID) return
  try {
    const r = await apiFetch(`/api/sessions/${SESSION_ID}/chat`)
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      const stat = document.getElementById('preview-chat-status')
      const cmsStat = document.getElementById('preview-chat-cms-status')
      const err =
        data.error || (r.status === 404 ? 'Session not found.' : `Chat unavailable (${r.status}).`)
      if (stat) stat.textContent = err
      if (cmsStat) cmsStat.textContent = err
      applyMedusaAdminControls()
      return
    }
    medusaAdminEmbedState = data.medusaAdminEmbed || { show: false, url: null }
    applyMedusaAdminControls()
    const mode = data.mode === 'cms' ? 'cms' : 'llm'
    applyChatPanelMode(mode)
    if (mode === 'cms') {
      populateCmsForm(data.siteSettings)
      const cmsStat = document.getElementById('preview-chat-cms-status')
      if (cmsStat) cmsStat.textContent = ''
      void initStudioEmbedForCmsPanel()
      if (!hasAutoOpenedCmsPanel) {
        hasAutoOpenedCmsPanel = true
        openPreviewChatPanel()
      }
      return
    }
    chatEditable = Boolean(data.editable)
    renderChatMessages(data.messages)
    setChatFormDisabled(chatSending)
    const stat = document.getElementById('preview-chat-status')
    if (stat) {
      stat.textContent = chatEditable ? '' : 'Finish generating your site to edit from chat.'
    }
  } catch {
    applyMedusaAdminControls()
  }
}

function initPreviewChat() {
  const fab = document.getElementById('preview-chat-fab')
  const panel = document.getElementById('preview-chat-panel')
  const closeBtn = document.getElementById('preview-chat-close')
  const form = document.getElementById('preview-chat-form')
  const input = document.getElementById('preview-chat-input')
  const fileInput = document.getElementById('preview-chat-file')
  const attachBtn = document.getElementById('preview-chat-attach')
  const attachWrap = document.getElementById('preview-chat-attachments')

  const renderChatAttachments = () => {
    if (!attachWrap) return
    attachWrap.innerHTML = ''
    chatAttachmentPaths.forEach((path) => {
      const chip = document.createElement('span')
      chip.className = 'preview-chat-atchip'
      const label = document.createElement('span')
      label.className = 'preview-chat-atchip-name'
      label.textContent = path.replace(/^user-uploads\//, '')
      const x = document.createElement('button')
      x.type = 'button'
      x.className = 'preview-chat-atchip-remove'
      x.setAttribute('aria-label', 'Remove attachment')
      x.textContent = '×'
      x.addEventListener('click', () => {
        chatAttachmentPaths = chatAttachmentPaths.filter((p) => p !== path)
        renderChatAttachments()
      })
      chip.appendChild(label)
      chip.appendChild(x)
      attachWrap.appendChild(chip)
    })
    attachWrap.hidden = chatAttachmentPaths.length === 0
  }

  const resizeChatInput = () => {
    if (!input) return
    input.style.height = 'auto'
    input.style.height = Math.min(input.scrollHeight, 140) + 'px'
  }

  const postChatEditRequest = async (text, attachmentPaths, opts) => {
    const options = opts || {}
    const raw = String(text || '').trim()
    const paths = Array.isArray(attachmentPaths) ? attachmentPaths : []
    if ((!raw && paths.length === 0) || !SESSION_ID || chatSending) return false
    if (raw) {
      const { checkPromptContentPolicy, CONTENT_POLICY_CLIENT_MESSAGE } =
        await import('../lib/content-policy')
      if (!checkPromptContentPolicy(raw).ok) {
        const st = document.getElementById('preview-chat-status')
        if (st) st.textContent = CONTENT_POLICY_CLIENT_MESSAGE
        return false
      }
    }
    chatSending = true
    setChatFormDisabled(true)
    const stat = document.getElementById('preview-chat-status')
    if (stat) stat.textContent = ''
    try {
      const res = await apiFetch(`/api/sessions/${SESSION_ID}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: raw }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 202) {
        if (options.clearInput !== false) {
          if (input) input.value = ''
          resizeChatInput()
        }
        if (options.clearAttachments !== false) {
          chatAttachmentPaths = []
          renderChatAttachments()
        }
        chatAwaitingEdit = true
        setChatBuilding(true)
        void refreshChatHistory()
        return true
      }
      if (stat) stat.textContent = data.error || res.statusText || 'Request failed'
    } catch (err) {
      if (stat) stat.textContent = err?.message || 'Network error'
    } finally {
      chatSending = false
      setChatFormDisabled(false)
    }
    return false
  }

  previewChatRequestAddSection = async (route) => {
    openPreviewChatPanel()
    await refreshChatHistory()
    if (!chatEditable) {
      const st = document.getElementById('preview-chat-status')
      if (st) st.textContent = 'Finish generating your site to add sections.'
      return
    }
    if (chatPanelMode === 'cms') {
      applyChatPanelMode('llm')
    }
    const path = typeof route === 'string' && route.trim() ? route.trim() : '/'
    const text =
      'Add a new section (page component/block) to the generated site. The user is viewing path: ' +
      path +
      '. Update the canonical site spec so this page gains an additional section that fits the existing design; pick an appropriate section type (for example features, testimonials, faq, cta, logo strip, pricing, or stats) and insert it in a sensible position. Regenerate preview HTML.'
    await postChatEditRequest(text, [], { clearInput: false, clearAttachments: false })
  }

  attachBtn?.addEventListener('click', () => fileInput?.click())
  fileInput?.addEventListener('change', async () => {
    const files = fileInput?.files
    if (!files?.length || !SESSION_ID) return
    const fd = new FormData()
    for (let i = 0; i < files.length; i++) fd.append('files', files[i])
    fileInput.value = ''
    const stat = document.getElementById('preview-chat-status')
    if (stat) stat.textContent = 'Uploading…'
    try {
      const res = await apiFetch(`/api/sessions/${SESSION_ID}/uploads`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (stat) stat.textContent = data.error || res.statusText || 'Upload failed'
        return
      }
      const list = Array.isArray(data.files) ? data.files : []
      for (const f of list) {
        if (f?.path) chatAttachmentPaths.push(f.path)
      }
      renderChatAttachments()
      if (stat) stat.textContent = ''
    } catch (err) {
      if (stat) stat.textContent = err?.message || 'Upload failed'
    }
  })

  const setOpen = (open) => {
    if (!panel || !fab) return
    panel.hidden = !open
    fab.setAttribute('aria-expanded', open ? 'true' : 'false')
    syncCmsSidebarLayout()
  }

  const cmsForm = document.getElementById('preview-chat-cms-form')
  const cmsStudioPanel = document.getElementById('preview-chat-cms-studio-panel')
  const cmsMedusaPanel = document.getElementById('preview-chat-cms-medusa-panel')
  const cmsQuickPanel = document.getElementById('preview-chat-cms-quick-panel')
  const fetchStudioEmbedReady = async () => {
    try {
      const r = await fetch('/api/studio-embed-ready')
      const j = await r.json().catch(() => ({}))
      return Boolean(j.built)
    } catch {
      return false
    }
  }
  const applyStudioEmbedAssets = (built) => {
    const frame = document.getElementById('preview-chat-cms-studio-frame')
    const unbuilt = document.getElementById('preview-chat-cms-studio-unbuilt')
    const foot = document.getElementById('preview-chat-cms-studio-footnote')
    const toolbar = document.getElementById('preview-chat-cms-studio-toolbar')
    if (built) {
      if (unbuilt) unbuilt.hidden = true
      if (foot) foot.hidden = false
      if (toolbar) toolbar.hidden = false
      if (frame) {
        frame.hidden = false
        frame.src = SESSION_ID ? `/studio/?session=${SESSION_ID}` : '/studio/'
      }
    } else {
      if (unbuilt) unbuilt.hidden = false
      if (foot) foot.hidden = true
      if (toolbar) toolbar.hidden = true
      if (frame) {
        frame.src = 'about:blank'
        frame.hidden = true
      }
    }
  }
  const initStudioEmbedForCmsPanel = async () => {
    applyMedusaAdminControls()
    const tabMedusa = document.getElementById('preview-chat-cms-tab-medusa')
    const useMedusaDefault =
      Boolean(medusaAdminEmbedState?.show && medusaAdminEmbedState?.url) &&
      tabMedusa &&
      !tabMedusa.hidden
    const built = await fetchStudioEmbedReady()
    applyStudioEmbedAssets(built)
    if (useMedusaDefault && !built) {
      const tabStudio = document.getElementById('preview-chat-cms-tab-studio')
      const tabQuick = document.getElementById('preview-chat-cms-tab-quick')
      if (tabStudio) {
        tabStudio.classList.remove('is-active')
        tabStudio.setAttribute('aria-selected', 'false')
      }
      if (tabQuick) {
        tabQuick.classList.remove('is-active')
        tabQuick.setAttribute('aria-selected', 'false')
      }
      if (tabMedusa) {
        tabMedusa.classList.add('is-active')
        tabMedusa.setAttribute('aria-selected', 'true')
      }
      if (cmsStudioPanel) cmsStudioPanel.hidden = true
      if (cmsQuickPanel) cmsQuickPanel.hidden = true
      if (cmsMedusaPanel) cmsMedusaPanel.hidden = false
      applyMedusaAdminControls()
      return
    }
    if (built) return
    const tabStudio = document.getElementById('preview-chat-cms-tab-studio')
    const tabQuick = document.getElementById('preview-chat-cms-tab-quick')
    if (tabStudio) {
      tabStudio.classList.remove('is-active')
      tabStudio.setAttribute('aria-selected', 'false')
    }
    if (tabQuick) {
      tabQuick.classList.add('is-active')
      tabQuick.setAttribute('aria-selected', 'true')
    }
    if (tabMedusa) {
      tabMedusa.classList.remove('is-active')
      tabMedusa.setAttribute('aria-selected', 'false')
    }
    if (cmsStudioPanel) cmsStudioPanel.hidden = true
    if (cmsMedusaPanel) cmsMedusaPanel.hidden = true
    if (cmsQuickPanel) cmsQuickPanel.hidden = false
  }
  document.querySelectorAll('[data-cms-tab]').forEach((tabBtn) => {
    tabBtn.addEventListener('click', async () => {
      const t = tabBtn.getAttribute('data-cms-tab')
      document.querySelectorAll('[data-cms-tab]').forEach((b) => {
        const active = b.getAttribute('data-cms-tab') === t
        b.classList.toggle('is-active', active)
        b.setAttribute('aria-selected', active ? 'true' : 'false')
      })
      if (cmsStudioPanel) cmsStudioPanel.hidden = t !== 'studio'
      if (cmsMedusaPanel) cmsMedusaPanel.hidden = t !== 'medusa'
      if (cmsQuickPanel) cmsQuickPanel.hidden = t !== 'quick'
      if (t === 'studio') {
        const built = await fetchStudioEmbedReady()
        applyStudioEmbedAssets(built)
      }
      if (t === 'medusa') applyMedusaAdminControls()
    })
  })
  document.querySelectorAll('[data-cms-sanity-sync]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!SESSION_ID) return
      const syncBtns = document.querySelectorAll('[data-cms-sanity-sync]')
      syncBtns.forEach((b) => {
        b.disabled = true
      })
      try {
        const res = await apiFetch(`/api/sessions/${SESSION_ID}/sync-sanity-preview`, {
          method: 'POST',
        })
        const j = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(j.error || `Request failed (${res.status})`)
      } catch (err) {
        alert(err?.message || 'Could not apply Sanity to preview')
      } finally {
        syncBtns.forEach((b) => {
          b.disabled = false
        })
      }
    })
  })
  let cmsLibraryTargetSlot = null
  const cmsSlotIds = {
    og: {
      url: 'cms-ogImageUrl',
      asset: 'cms-ogImageAssetId',
      preview: 'cms-ogImage-preview',
    },
    hero: {
      url: 'cms-homeHeroImageUrl',
      asset: 'cms-homeHeroImageAssetId',
      preview: 'cms-homeHeroImage-preview',
    },
  }
  const applyCmsSlotUrl = (slot, url, assetId) => {
    const ids = cmsSlotIds[slot]
    if (!ids) return
    const urlEl = document.getElementById(ids.url)
    const assetEl = document.getElementById(ids.asset)
    const prev = document.getElementById(ids.preview)
    if (urlEl && url !== undefined) urlEl.value = url
    if (assetEl && assetId !== undefined) assetEl.value = assetId || ''
    if (prev) {
      if (url && String(url).trim()) {
        prev.src = url
        prev.hidden = false
      } else {
        prev.removeAttribute('src')
        prev.hidden = true
      }
    }
  }
  const clearCmsSlotAsset = (slot) => {
    const ids = cmsSlotIds[slot]
    if (!ids) return
    const assetEl = document.getElementById(ids.asset)
    const prev = document.getElementById(ids.preview)
    if (assetEl) assetEl.value = ''
    if (prev) {
      prev.removeAttribute('src')
      prev.hidden = true
    }
  }
  const openCmsMediaModal = (slot) => {
    cmsLibraryTargetSlot = slot
    const modal = document.getElementById('cms-media-modal')
    const grid = document.getElementById('cms-media-grid')
    if (!modal || !grid || !SESSION_ID) return
    modal.hidden = false
    modal.setAttribute('aria-hidden', 'false')
    grid.innerHTML = ''
    const loading = document.createElement('p')
    loading.className = 'preview-chat-cms-media-loading'
    loading.textContent = 'Loading…'
    grid.appendChild(loading)
    apiFetch(`/api/sessions/${SESSION_ID}/cms/media?limit=36`)
      .then((res) => res.json())
      .then((data) => {
        grid.innerHTML = ''
        const assets = Array.isArray(data.assets) ? data.assets : []
        if (!assets.length) {
          grid.innerHTML =
            '<p class="preview-chat-cms-media-empty">No assets yet. Use Upload above or add files in the content admin.</p>'
          return
        }
        assets.forEach((a) => {
          if (!a?._id || !a?.url) return
          const b = document.createElement('button')
          b.type = 'button'
          b.className = 'preview-chat-cms-media-tile'
          b.setAttribute('data-asset-id', a._id)
          b.setAttribute('data-asset-url', a.url)
          const im = document.createElement('img')
          im.src = a.url
          im.alt = ''
          im.loading = 'lazy'
          b.appendChild(im)
          grid.appendChild(b)
        })
      })
      .catch(() => {
        grid.innerHTML = '<p class="preview-chat-cms-media-empty">Could not load library.</p>'
      })
  }
  const closeCmsMediaModal = () => {
    const modal = document.getElementById('cms-media-modal')
    if (modal) {
      modal.hidden = true
      modal.setAttribute('aria-hidden', 'true')
    }
    cmsLibraryTargetSlot = null
  }
  document.getElementById('cms-media-modal-close')?.addEventListener('click', closeCmsMediaModal)
  document.getElementById('cms-media-modal-backdrop')?.addEventListener('click', closeCmsMediaModal)
  document.getElementById('cms-media-grid')?.addEventListener('click', (ev) => {
    const tile = ev.target.closest('.preview-chat-cms-media-tile')
    if (!tile || !cmsLibraryTargetSlot) return
    const aid = tile.getAttribute('data-asset-id')
    const u = tile.getAttribute('data-asset-url')
    if (aid && u) applyCmsSlotUrl(cmsLibraryTargetSlot, u, aid)
    closeCmsMediaModal()
  })
  document.getElementById('preview-chat-cms-block')?.addEventListener('click', (ev) => {
    const up = ev.target.closest('[data-cms-upload-slot]')
    if (up && SESSION_ID) {
      const slot = up.getAttribute('data-cms-upload-slot')
      if (!slot) return
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'image/jpeg,image/png,image/webp,image/gif'
      fileInput.onchange = async () => {
        const file = fileInput.files?.[0]
        if (!file) return
        const fd = new FormData()
        fd.append('file', file)
        const cmsStat = document.getElementById('preview-chat-cms-status')
        if (cmsStat) cmsStat.textContent = 'Uploading image…'
        try {
          const res = await apiFetch(`/api/sessions/${SESSION_ID}/cms/upload-image`, {
            method: 'POST',
            body: fd,
          })
          const j = await res.json().catch(() => ({}))
          if (!res.ok) {
            if (cmsStat) cmsStat.textContent = j.error || 'Upload failed'
            return
          }
          const aid = j.assetId ? String(j.assetId) : ''
          if (j.url) applyCmsSlotUrl(slot, j.url, aid)
          if (cmsStat) cmsStat.textContent = ''
        } catch (err) {
          if (cmsStat) cmsStat.textContent = err?.message || 'Upload failed'
        }
      }
      fileInput.click()
      return
    }
    const lib = ev.target.closest('[data-cms-library-slot]')
    if (lib && SESSION_ID) {
      const slot = lib.getAttribute('data-cms-library-slot')
      if (slot) openCmsMediaModal(slot)
      return
    }
    const clr = ev.target.closest('[data-cms-clear-slot]')
    if (clr) {
      const slot = clr.getAttribute('data-cms-clear-slot')
      if (slot) clearCmsSlotAsset(slot)
    }
  })

  cmsForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!SESSION_ID || chatSending) return
    const cmsStat = document.getElementById('preview-chat-cms-status')
    const payload = {
      homeTitle: document.getElementById('cms-homeTitle')?.value ?? '',
      homeDescription: document.getElementById('cms-homeDescription')?.value ?? '',
      pricingPageTitle: document.getElementById('cms-pricingPageTitle')?.value ?? '',
      pricingPageDescription: document.getElementById('cms-pricingPageDescription')?.value ?? '',
      pricingHeroHeadline: document.getElementById('cms-pricingHeroHeadline')?.value ?? '',
      shipChatHeadline: document.getElementById('cms-shipChatHeadline')?.value ?? '',
      shipChatSubheadline: document.getElementById('cms-shipChatSubheadline')?.value ?? '',
      ogImageUrl: document.getElementById('cms-ogImageUrl')?.value ?? '',
      homeHeroImageUrl: document.getElementById('cms-homeHeroImageUrl')?.value ?? '',
      ogImageAssetId: document.getElementById('cms-ogImageAssetId')?.value ?? '',
      homeHeroImageAssetId: document.getElementById('cms-homeHeroImageAssetId')?.value ?? '',
      ogImageAlt: document.getElementById('cms-ogImageAlt')?.value ?? '',
      homeHeroImageAlt: document.getElementById('cms-homeHeroImageAlt')?.value ?? '',
    }
    chatSending = true
    if (cmsStat) cmsStat.textContent = 'Saving…'
    try {
      const res = await apiFetch(`/api/sessions/${SESSION_ID}/cms/site-settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (cmsStat) cmsStat.textContent = j.error || res.statusText || 'Save failed'
        return
      }
      populateCmsForm(j.siteSettings)
      if (cmsStat) cmsStat.textContent = 'Saved.'
    } catch (err) {
      if (cmsStat) cmsStat.textContent = err?.message || 'Save failed'
    } finally {
      chatSending = false
    }
  })

  fab?.addEventListener('click', async () => {
    if (panel.hidden) {
      setOpen(true)
      await refreshChatHistory()
      if (chatPanelMode === 'cms') {
        const quick = document.getElementById('preview-chat-cms-quick-panel')
        if (quick && !quick.hidden) document.getElementById('cms-homeTitle')?.focus()
      } else {
        requestAnimationFrame(() => input?.focus())
      }
    } else {
      setOpen(false)
    }
  })
  closeBtn?.addEventListener('click', () => setOpen(false))
  input?.addEventListener('input', resizeChatInput)
  document.getElementById('preview-chat-add-section')?.addEventListener('click', () => {
    const path = getPreviewFramePathname()
    void previewChatRequestAddSection?.(path)
  })
  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const raw = input?.value?.trim() || ''
    const paths = [...chatAttachmentPaths]
    if ((!raw && paths.length === 0) || !SESSION_ID || chatSending) return
    await postChatEditRequest(raw, paths, { clearInput: true, clearAttachments: true })
  })
}

initPreviewChat()
initPreviewSiteRail()
hydrateCurrentPalette()

// ─── WebSocket: Connect to server ─────────────────────────
function connectWS() {
  ws = new WebSocket(WS_URL)

  ws.onopen = () => {
    wsConnected = true
    debugLog('ws_connected', null)
    if (!introActive && !hydratedComplete) {
      document.getElementById('phase-text').textContent = 'Comm lock on'
    }
  }

  ws.onmessage = (e) => {
    let ev
    try {
      ev = JSON.parse(e.data)
    } catch {
      return
    }
    debugLog(ev.type, ev)

    switch (ev.type) {
      case 'prompt':
        introPromptText = ev.text || ''
        break

      case 'status':
        if (hydratedComplete && !hasSeenLiveUpdate) break
        document.getElementById('phase-text').textContent = ev.message || ''
        if (introActive) {
          if (typingDone) {
            setPhaseLabel(ev.message || '')
          } else {
            pendingStatus = ev.message || ''
            if (!introPromptText && ev.message) {
              introPromptText = ev.message
            }
          }
        }
        break

      case 'spec_stream':
        break

      case 'stock_media_preview':
        applyStockMediaPreviewPhotos(ev.photos)
        break

      case 'tasks_loaded':
        tasks = ev.tasks || []
        taskMap = {}
        tasks.forEach((t) => {
          taskMap[t.id] = t
        })
        syncOpenUIActiveClass({ tasks })
        genStartTime = Date.now()
        renderTasks()
        {
          const c = getTaskCounts()
          if (c.frontendTotal > 0 && c.frontendDone >= c.frontendTotal) {
            frontendComplete = true
            document.getElementById('preview-loading').classList.add('hidden')
          }
        }
        break

      case 'task_updated': {
        const updated = ev.task
        if (!updated) break
        hasSeenLiveUpdate = true
        const idx = tasks.findIndex((t) => t.id === updated.id)
        if (idx >= 0) {
          tasks[idx] = { ...tasks[idx], ...updated }
          taskMap[tasks[idx].id] = tasks[idx]
        } else {
          tasks.push(updated)
          taskMap[updated.id] = updated
        }
        syncOpenUIActiveClass({ tasks })
        renderTasks()
        if (updated.status === 'DONE') {
          triggerTeleport(updated.id)
          if (isFrontendTask(updated)) previewLoaded ? reloadPreview() : loadPreview()
          checkAllDone()
        } else if (updated.status === 'FAILED') {
          checkAllDone()
        }
        break
      }

      case 'homepage_ready':
        homepageReady = true
        resetPreviewToSessionHtml()
        syncPreviewChrome()
        void maybeWarmNextDevServerInBackground()
        void refreshExportTargets()
        showPreviewChatDock()
        void refreshChatHistory()
        if (introActive && !hasSeenLiveUpdate) {
          // Reconnect: skip intro, show preview full-width immediately
          isReconnect = true
          skipIntro()
        } else if (introActive) {
          exitIntro()
          openDrawer()
        } else if (drawerOpen) {
          reloadPreview()
        } else {
          openDrawer()
        }
        if (document.body.classList.contains('sf-openui-active')) expandPreviewForLiveOpenUI()
        break

      case 'site_spec_ready':
        siteSpecReady = Boolean(ev.ready)
        refreshExportTargets()
        if (siteSpecReady && homepageReady) void maybeWarmNextDevServerInBackground()
        if (siteSpecReady) void refreshChatHistory()
        syncProvisionStateFromSession(ev.session || ev)
        break

      case 'alternative_design_ready':
        alternativeDesign = ev.design
        document.getElementById('theme-magic-btn')?.classList.add('ready')
        debugLog('magic_theme_ready', ev.design)
        break

      case 'theme_override_loaded':
      case 'theme_override_updated':
        setActiveThemeOverride(ev.theme || null)
        break

      case 'deployed':
        renderDeploymentState({ slug: ev.slug, url: ev.url, deployedAt: ev.deployedAt })
        break

      case 'homepage_phase_complete':
        document.getElementById('phase-text').textContent =
          `Landing ready in ${ev.elapsed}s — building pages…`
        {
          const timing = document.getElementById('gen-timing')
          if (timing) timing.textContent = `⚡ Landing page in ${ev.elapsed}s — pages generating…`
        }
        break

      case 'openui_stream_start':
        hasSeenLiveUpdate = true
        syncOpenUIActiveClass({ preferredExportTarget: 'openui', tasks })
        if (drawerOpen) {
          loadPreview()
          expandPreviewForLiveOpenUI()
        }
        break

      case 'openui_stream_chunk':
        hasSeenLiveUpdate = true
        syncOpenUIActiveClass({ preferredExportTarget: 'openui', tasks })
        if (drawerOpen && ev.route === '/') expandPreviewForLiveOpenUI()
        break

      case 'openui_stream_done':
        if (drawerOpen && ev.route === '/') expandPreviewForLiveOpenUI()
        break

      case 'run_completed':
        hydratedComplete = true
        persistedElapsed = Number.isFinite(Number(ev.elapsed)) ? Number(ev.elapsed) : persistedElapsed
        document.getElementById('phase-text').textContent = `Done in ${ev.elapsed}s`
        document.getElementById('toast-elapsed').textContent = ev.elapsed + 's'
        const timingFinal = document.getElementById('gen-timing')
        const counts = getTaskCounts()
        if (timingFinal) {
          if (counts.frontendTotal > 0) {
            timingFinal.textContent = `⚡ Generated in ${ev.elapsed}s — ${counts.frontendDone}/${counts.frontendTotal} frontend tasks`
          } else {
            timingFinal.textContent = `⚡ Generated in ${ev.elapsed}s — ${ev.completed} pages`
          }
        }
        resetPreviewToSessionHtml()
        checkAllDone()
        if (chatAwaitingEdit) {
          chatAwaitingEdit = false
          setChatBuilding(false)
        }
        void refreshChatHistory()
        if (!deploymentState?.url) void retryDeployOnce()
        break

      case 'next_preview_ready':
        break

      case 'preview_reload':
        if (nextPreviewActive && nextPreviewBase) {
          const iframe = document.getElementById('preview-iframe')
          if (iframe) iframe.src = getPreviewFrameSrc(true)
        } else {
          reloadPreview()
        }
        if (chatAwaitingEdit) {
          chatAwaitingEdit = false
          setChatBuilding(false)
        }
        void refreshChatHistory()
        break

      case 'error': {
        if (chatAwaitingEdit) {
          chatAwaitingEdit = false
          setChatBuilding(false)
        }
        const stEl = document.getElementById('preview-chat-status')
        if (stEl && ev.message) stEl.textContent = String(ev.message)
        void refreshChatHistory()
        break
      }

      case 'client_reload':
        location.reload()
        break

      case 'export_ready':
        refreshExportTargets()
        break

      case 'log':
        appendLog(ev.message || '')
        break
    }
  }

  ws.onclose = () => {
    wsConnected = false
    debugLog('ws_disconnected', null)
    ws = null
    if (!leavingDashboard) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        connectWS()
      }, 1500)
    }
  }

  ws.onerror = () => {
    ws.close()
  }
}

function checkAllDone() {
  if (tasks.length === 0) return
  const pending = tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS')
  if (pending.length === 0 && !allDone) {
    document.getElementById('phase-text').textContent = 'Orbit achieved'
    if (drawerOpen) {
      triggerCompletion()
    }
  }
}

// ─── Log panel ─────────────────────────────────────────────
function appendLog(msg) {
  const content = document.getElementById('log-content')
  const line = document.createElement('div')
  line.className = 'log-line'
  if (/FAILED|ERROR|EXCEPTION|BLOCKED/i.test(msg)) line.className += ' err'
  else if (/DONE|OK|complete|✓/i.test(msg)) line.className += ' ok'
  else if (/spec|design|generating/i.test(msg)) line.className += ' info'
  line.textContent = msg
  content.appendChild(line)
  content.scrollTop = content.scrollHeight
}

document.getElementById('log-toggle').addEventListener('click', () => {
  document.getElementById('log-section').classList.toggle('open')
})
document.getElementById('payment-modal-close').addEventListener('click', closePaymentModal)
document.getElementById('payment-cancel-btn').addEventListener('click', closePaymentModal)
document.getElementById('payment-confirm-btn').addEventListener('click', startCheckout)
document.getElementById('payment-modal').addEventListener('click', (event) => {
  if (event.target.closest('[data-close-payment="1"]')) closePaymentModal()
})
document.getElementById('auth-overlay').addEventListener('click', (event) => {
  if (event.target === document.getElementById('auth-overlay')) closeAuthWall()
})

document.getElementById('google-signin-btn').addEventListener('click', async () => {
  const errEl = document.getElementById('auth-error')
  errEl.textContent = ''
  try {
    await window.shipFastDashboardAuth?.signInWithGoogle?.()
    closeAuthWall()
  } catch (e) {
    if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
      errEl.textContent = e?.message || 'Google sign-in failed.'
    }
  }
})

document.getElementById('github-signin-btn').addEventListener('click', async () => {
  const errEl = document.getElementById('auth-error')
  errEl.textContent = ''
  try {
    await window.shipFastDashboardAuth?.signInWithGithub?.()
    closeAuthWall()
  } catch (e) {
    if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
      errEl.textContent = e?.message || 'GitHub sign-in failed.'
    }
  }
})

document.getElementById('email-signin-btn').addEventListener('click', async () => {
  const errEl = document.getElementById('auth-error')
  errEl.textContent = ''
  const email = document.getElementById('auth-email').value.trim()
  const password = document.getElementById('auth-password').value
  if (!email || !password) {
    errEl.textContent = 'Enter email and password.'
    return
  }
  try {
    await window.shipFastDashboardAuth?.signInWithEmail?.(email, password)
    closeAuthWall()
  } catch (e) {
    errEl.textContent = e?.message || 'Sign-in failed.'
  }
})

document.getElementById('email-signup-btn').addEventListener('click', async () => {
  const errEl = document.getElementById('auth-error')
  errEl.textContent = ''
  const email = document.getElementById('auth-email').value.trim()
  const password = document.getElementById('auth-password').value
  if (!email || !password) {
    errEl.textContent = 'Enter email and password.'
    return
  }
  try {
    await window.shipFastDashboardAuth?.signUpWithEmail?.(email, password)
    closeAuthWall()
  } catch (e) {
    errEl.textContent = e?.message || 'Account creation failed.'
  }
})
document.getElementById('provision-modal-close').addEventListener('click', hideProvisionDialog)
document.getElementById('provision-cancel-btn').addEventListener('click', hideProvisionDialog)
document.getElementById('provision-confirm-btn').addEventListener('click', () => {
  if (provisionDialogType) void provisionService(provisionDialogType)
})
document.getElementById('provision-modal').addEventListener('click', (event) => {
  if (event.target.closest('[data-close-provision="1"]')) hideProvisionDialog()
})
syncProvisionRailIndicators()
document.getElementById('payment-option-list').addEventListener('click', (event) => {
  const option = event.target.closest('[data-payment-mode]')
  if (!option || paymentBusy) return
  selectedPaymentMode = option.dataset.paymentMode || selectedPaymentMode
  renderPaymentOptions()
})
document.addEventListener('click', (event) => {
  if (event.target.closest('#export-panel')) return
  if (event.target.closest('#github-export-panel')) return
  if (event.target.closest('#palette-menu')) return
  // The rail's github/export rows toggle these menus programmatically. Let
  // those clicks bubble up without the outside-click close cascade canceling
  // the open we just kicked off.
  if (event.target.closest('#preview-site-rail [data-rail-action="github"]')) return
  if (event.target.closest('#preview-site-rail [data-rail-action="export"]')) return
  if (event.target.closest('#preview-site-rail [data-rail-action="palette"]')) return
  closeExportMenu()
  closeGitHubMenu()
  closePaletteMenu()
})
window.addEventListener('message', (event) => {
  const data = event.data || {}
  if (data.type === 'SF_PREVIEW_TOOLS_READY') {
    syncPreviewInspectTools()
    return
  }
  if (data.type === 'SF_SAVE_HOMEPAGE_HTML' && typeof data.html === 'string' && SESSION_ID) {
    void (async () => {
      const res = await apiFetch(`/api/sessions/${SESSION_ID}/preview-homepage-html`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: data.html }),
      })
      if (res.ok) reloadPreview()
    })()
    return
  }
  if (data.type === 'SF_ADD_COMPONENT_CLICK' && SESSION_ID) {
    const path = typeof data.route === 'string' && data.route.trim() ? data.route.trim() : '/'
    void previewChatRequestAddSection?.(path)
    return
  }
  if (data.type === 'SF_PREVIEW_TEXT_AI_REQ' && data.id && SESSION_ID) {
    void (async () => {
      const iframe = document.getElementById('preview-iframe')
      const reply = (payload) => {
        iframe?.contentWindow?.postMessage(payload, '*')
      }
      try {
        const res = await apiFetch(`/api/sessions/${SESSION_ID}/preview-inline-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: data.text,
            instruction: data.instruction,
            outputLanguage: data.outputLanguage,
          }),
        })
        const j = await res.json().catch(() => ({}))
        reply({
          type: 'SF_PREVIEW_TEXT_AI_RES',
          id: data.id,
          text: j.text,
          error: res.ok ? undefined : j.error || 'Request failed',
        })
      } catch (err) {
        reply({
          type: 'SF_PREVIEW_TEXT_AI_RES',
          id: data.id,
          error: err?.message || 'Failed',
        })
      }
    })()
    return
  }
  if (data.type === 'SF_PREVIEW_STYLE_AI_REQ' && data.id && SESSION_ID) {
    void (async () => {
      const iframe = document.getElementById('preview-iframe')
      const reply = (payload) => {
        iframe?.contentWindow?.postMessage(payload, '*')
      }
      try {
        const res = await apiFetch(`/api/sessions/${SESSION_ID}/preview-inline-style`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fragmentHtml: data.fragmentHtml,
            instruction: data.instruction,
          }),
        })
        const j = await res.json().catch(() => ({}))
        reply({
          type: 'SF_PREVIEW_STYLE_AI_RES',
          id: data.id,
          html: j.html,
          error: res.ok ? undefined : j.error || 'Request failed',
        })
      } catch (err) {
        reply({
          type: 'SF_PREVIEW_STYLE_AI_RES',
          id: data.id,
          error: err?.message || 'Failed',
        })
      }
    })()
    return
  }
  if (data.type === 'SF_HISTORY_CHECKPOINT_REQ' && data.id && SESSION_ID) {
    void (async () => {
      const iframe = document.getElementById('preview-iframe')
      const reply = (payload) => {
        iframe?.contentWindow?.postMessage(payload, '*')
      }
      try {
        const res = await apiFetch(`/api/sessions/${SESSION_ID}/preview-homepage-html`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: data.html }),
        })
        const j = await res.json().catch(() => ({}))
        reply({
          type: 'SF_HISTORY_CHECKPOINT_RES',
          id: data.id,
          checkpointId: j.checkpointId,
          error: res.ok ? undefined : j.error || 'Request failed',
        })
        if (res.ok) reloadPreview()
      } catch (err) {
        reply({
          type: 'SF_HISTORY_CHECKPOINT_RES',
          id: data.id,
          error: err?.message || 'Failed',
        })
      }
    })()
    return
  }
  if (data.type === 'SF_HISTORY_RESTORE_REQ' && data.id && SESSION_ID) {
    void (async () => {
      const iframe = document.getElementById('preview-iframe')
      const reply = (payload) => {
        iframe?.contentWindow?.postMessage(payload, '*')
      }
      const checkpointId = typeof data.checkpointId === 'string' ? data.checkpointId.trim() : ''
      if (!checkpointId) {
        reply({
          type: 'SF_HISTORY_RESTORE_RES',
          id: data.id,
          ok: false,
          error: 'Missing checkpointId',
        })
        return
      }
      try {
        const res = await apiFetch(
          `/api/sessions/${SESSION_ID}/history/${encodeURIComponent(checkpointId)}/restore`,
          { method: 'POST' },
        )
        const j = await res.json().catch(() => ({}))
        reply({
          type: 'SF_HISTORY_RESTORE_RES',
          id: data.id,
          ok: res.ok,
          error: res.ok ? undefined : j.error || 'Request failed',
        })
        if (res.ok) reloadPreview()
      } catch (err) {
        reply({
          type: 'SF_HISTORY_RESTORE_RES',
          id: data.id,
          ok: false,
          error: err?.message || 'Failed',
        })
      }
    })()
    return
  }
  if (data.type === 'SF_INLINE_EDIT_BEGIN') {
    previewSelectMode = false
    syncPreviewInspectTools()
    return
  }
  if (data.type === 'SF_INLINE_EDIT_END') {
    syncPreviewInspectTools()
    return
  }
  if (data.type === 'SF_PREVIEW_TOOLS_ESCAPE') {
    previewAnnotatorActive = false
    previewSelectMode = false
    syncPreviewInspectTools()
  }
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const chatPanel = document.getElementById('preview-chat-panel')
    if (chatPanel && !chatPanel.hidden) {
      chatPanel.hidden = true
      document.getElementById('preview-chat-fab')?.setAttribute('aria-expanded', 'false')
      syncCmsSidebarLayout()
      event.preventDefault()
      return
    }
    if (previewAnnotatorActive) {
      previewAnnotatorActive = false
      syncPreviewInspectTools()
      event.preventDefault()
      return
    }
    if (previewSelectMode) {
      previewSelectMode = false
      syncPreviewInspectTools()
      event.preventDefault()
      return
    }
    const paymentEl = document.getElementById('payment-modal')
    if (paymentEl?.classList.contains('is-open')) {
      closePaymentModal()
      event.preventDefault()
      return
    }
    const newPromptEl = document.getElementById('new-prompt-overlay')
    if (newPromptEl?.classList.contains('visible')) {
      newPromptEl.classList.remove('visible')
      document.getElementById('completion-toast')?.classList.add('visible')
      hideNewPromptPolicy()
      event.preventDefault()
      return
    }
    if (exportMenuOpen) {
      closeExportMenu()
      event.preventDefault()
      return
    }
    if (githubMenuOpen) {
      closeGitHubMenu()
      event.preventDefault()
      return
    }
    if (DEBUG_MODE) {
      const debugPanel = document.getElementById('debug-panel')
      if (debugPanel?.classList.contains('open')) {
        document.getElementById('debug-burger')?.classList.remove('open')
        debugPanel.classList.remove('open')
        event.preventDefault()
        return
      }
    }
    navigateHome(event)
    event.preventDefault()
    return
  }

  if (!isDev || isTextInputTarget(event.target)) return

  if (!event.metaKey && !event.ctrlKey) return

  if (event.key === '1' || event.code === 'Digit1') {
    setNewPromptFromExample(DEV_PROMPT_EXAMPLES[0])
    event.preventDefault()
    return
  }

  if ((event.key === '2' || event.code === 'Digit2') && DEV_PROMPT_EXAMPLES[1]) {
    setNewPromptFromExample(DEV_PROMPT_EXAMPLES[1])
    event.preventDefault()
    return
  }

  if ((event.key === '3' || event.code === 'Digit3') && DEV_PROMPT_EXAMPLES[2]) {
    setNewPromptFromExample(DEV_PROMPT_EXAMPLES[2])
    event.preventDefault()
  }
})

// ─── Init ──────────────────────────────────────────────────
function beginSessionDashboard(session) {
  if (session.prompt && !introPromptText) {
    introPromptText = session.prompt
  }
  if (Array.isArray(session.tasks)) {
    tasks = session.tasks
    taskMap = {}
    tasks.forEach((task) => {
      taskMap[task.id] = task
    })
    updateTasks()
  }
  syncOpenUIActiveClass(session)
  persistedElapsed = Number.isFinite(Number(session.elapsed)) ? Number(session.elapsed) : null
  if (session.deployment) {
    renderDeploymentState(session.deployment)
  } else {
    void apiFetch(`/api/sessions/${SESSION_ID}/deploy`)
      .then(async (r) => {
        if (!r.ok) return null
        return r.json()
      })
      .then((res) => {
        if (res?.deployed && res?.url) {
          renderDeploymentState({
            slug: res.slug,
            url: res.url,
            deployedAt: res.deployedAt,
          })
        }
      })
  }
  const isDone = session.taskCount > 0 && session.done === session.taskCount
  if (isDone) {
    hydratedComplete = true
    const sfx = document.getElementById('launch-sfx')
    if (sfx) sfx.remove()
    if (persistedElapsed != null) {
      document.getElementById('phase-text').textContent = `Done in ${persistedElapsed}s`
      document.getElementById('toast-elapsed').textContent = persistedElapsed + 's'
    }
  }
  homepageReady = Boolean(session.homepageReady) || homepageReady
  siteSpecReady = Boolean(session.siteSpecReady) || siteSpecReady
  syncProvisionStateFromSession(session)
  if (session.medusaAdminEmbed) medusaAdminEmbedState = session.medusaAdminEmbed
  applyMedusaAdminControls()
  sessionPreferredLanguage = String(session.preferredLanguage || 'en')
  isAnonymousSession = Boolean(session.isAnonymous)
  preferredExportTarget = String(session.preferredExportTarget || 'html').toLowerCase()
  selectedExportTarget = preferredExportTarget
  exportTargets = Array.isArray(session.exportTargets) ? session.exportTargets : []
  paymentState = normalizePaymentState(session.payment)
  setActiveThemeOverride(session.themeOverride || null)
  syncPreviewChrome()
  renderExportPanel()
  void refreshExportTargets()
  if (homepageReady) {
    showPreviewChatDock()
    void refreshChatHistory()
    void maybeWarmNextDevServerInBackground()
  }
  const alreadyComplete = homepageReady || isDone
  if (alreadyComplete) {
    isReconnect = true
    skipIntro()
  } else {
    startIntro()
  }
  connectWS()
}

apiFetch(`/api/sessions/${SESSION_ID}`)
  .then((r) => r.json())
  .then((session) => {
    beginSessionDashboard(session)
  })
  .catch(() => {
    startIntro()
    connectWS()
  })

// ─── New prompt overlay ─────────────────────────────────
document.getElementById('toast-cta').addEventListener('click', () => {
  document.getElementById('completion-toast').classList.remove('visible')
  const overlay = document.getElementById('new-prompt-overlay')
  overlay.classList.add('visible')
  setTimeout(() => document.getElementById('new-prompt-input').focus(), 400)
})
document.getElementById('toast-cta-studio')?.addEventListener('click', () => {
  document.getElementById('completion-toast')?.classList.remove('visible')
  if (isAnonymousSession) {
    openAuthWall()
  } else {
    const fab = document.getElementById('preview-chat-fab')
    const panel = document.getElementById('preview-chat-panel')
    if (fab) fab.setAttribute('aria-expanded', 'true')
    if (panel) panel.hidden = false
  }
})
document.getElementById('toast-back-home')?.addEventListener('click', (ev) => navigateHome(ev))
document.getElementById('new-prompt-cancel').addEventListener('click', () => {
  document.getElementById('new-prompt-overlay').classList.remove('visible')
  // Re-show toast
  document.getElementById('completion-toast').classList.add('visible')
})

const newPromptPolicyBlock = document.getElementById('new-prompt-policy-block')
const showNewPromptPolicy = (message) => {
  if (!newPromptPolicyBlock) return
  newPromptPolicyBlock.textContent = message
  newPromptPolicyBlock.hidden = false
  newPromptPolicyBlock.classList.add('is-visible')
}
const hideNewPromptPolicy = () => {
  if (!newPromptPolicyBlock) return
  newPromptPolicyBlock.textContent = ''
  newPromptPolicyBlock.hidden = true
  newPromptPolicyBlock.classList.remove('is-visible')
}
document.getElementById('new-prompt-input').addEventListener('input', hideNewPromptPolicy)

document.getElementById('new-prompt-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const input = document.getElementById('new-prompt-input')
  const prompt = input.value.trim()
  if (!prompt) return

  const { checkPromptContentPolicy, CONTENT_POLICY_CLIENT_MESSAGE } =
    await import('../lib/content-policy')
  if (!checkPromptContentPolicy(prompt).ok) {
    showNewPromptPolicy(CONTENT_POLICY_CLIENT_MESSAGE)
    return
  }

  const btn = document.getElementById('new-prompt-submit')
  btn.disabled = true
  btn.textContent = 'Throttling up…'

  const nr1 = document.getElementById('new-prompt-ref-url-1')?.value?.trim() || ''
  const nr2 = document.getElementById('new-prompt-ref-url-2')?.value?.trim() || ''
  const designReferenceUrls = [nr1, nr2].filter(Boolean)
  const designReferenceNotes =
    document.getElementById('new-prompt-design-ref-notes')?.value?.trim() || ''

  try {
    const res = await apiFetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        preferredLanguage: sessionPreferredLanguage || 'en',
        ...(designReferenceUrls.length
          ? {
              designReferenceUrls,
              ...(designReferenceNotes ? { designReferenceNotes } : {}),
            }
          : {}),
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (data.id) {
      let authed = false
      try {
        const tok = await window.shipFastDashboardAuth?.getCurrentIdToken?.()
        authed = Boolean(tok)
      } catch {
        authed = false
      }
      if (!authed && data.anonOwnerSecret) {
        try {
          const stored = JSON.parse(localStorage.getItem('sf_anon_sessions') || '[]').filter(
            (session) => session?.id !== data.id,
          )
          const entry = { id: data.id, prompt, secret: String(data.anonOwnerSecret) }
          stored.unshift(entry)
          localStorage.setItem('sf_anon_sessions', JSON.stringify(stored))
        } catch {}
      }
      location.href = `/session/${data.id}`
    } else if (data.code === 'CONTENT_POLICY' || res.status === 422) {
      showNewPromptPolicy(data.error || CONTENT_POLICY_CLIENT_MESSAGE)
      btn.disabled = false
      btn.textContent = 'Generate'
    } else {
      alert(data.error || 'Failed to create session')
      btn.disabled = false
      btn.textContent = 'Generate'
    }
  } catch (err) {
    alert('Connection error: ' + err.message)
    btn.disabled = false
    btn.textContent = 'Generate'
  }
})

if (typeof window !== 'undefined') {
  window.navigateHome = navigateHome
  window.toggleSplit = toggleSplit
  window.generateAlternativeDesign = generateAlternativeDesign
  window.applyMagicTheme = applyMagicTheme
}
