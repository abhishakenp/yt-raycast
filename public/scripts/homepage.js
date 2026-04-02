if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js'
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js'

let auth = null
let currentUser = null
let authResolved = false
let hasSessionResizeListener = false
const GITHUB_TOKEN_STORAGE_KEY = 'sf_github_access_token'

function persistGithubAccessToken(result) {
  const accessToken = GithubAuthProvider.credentialFromResult(result)?.accessToken
  if (accessToken) sessionStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, accessToken)
}

function clearGithubAccessToken() {
  sessionStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY)
}

async function initFirebase() {
  const cfg = await fetch('/api/config').then((response) => response.json())
  const app = initializeApp(cfg)
  auth = getAuth(app)

  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user
      authResolved = true
      if (user) showApp()
      else showAnonymousApp()
      resolve()
    })
  })
}

async function getToken() {
  if (!currentUser) return null
  return currentUser.getIdToken(true)
}

async function authFetch(url, options = {}) {
  const token = await getToken()
  const headers = { ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(url, { ...options, headers })
}

function showAnonymousApp() {
  document.getElementById('auth-overlay').classList.add('hidden')
  document.getElementById('signout-btn').style.display = 'none'
  const signinBtn = document.getElementById('signin-btn')
  if (signinBtn) signinBtn.style.display = 'flex'
  sessionStorage.removeItem('sf_return_home')
  clearGithubAccessToken()
  updateGenerationCounter()
  syncSubmitButtonState()
  loadRecentPublicSessions()
}

async function showApp() {
  document.getElementById('auth-overlay').classList.add('hidden')
  const signinBtn = document.getElementById('signin-btn')
  if (signinBtn) signinBtn.style.display = 'none'
  document.getElementById('signout-btn').style.display = 'flex'
  updateGenerationCounter()
  syncSubmitButtonState()
  await claimAnonymousSessions()
  loadSessions()
}

async function claimAnonymousSessions() {
  try {
    const stored = JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || '[]')
    if (stored.length === 0) return
    let claimed = 0
    const sessionIds = stored.map((s) => s.id)
    const response = await authFetch('/api/sessions/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionIds }),
    })
    if (response.ok) {
      const result = await response.json()
      claimed = result?.claimed?.length ?? 0
      if (result.claimed?.length > 0) {
        console.log(
          `[claim] Migrated ${result.claimed.length} anonymous session(s) to your account`,
        )
      }
    }
    if (claimed > 0) clearAnonSessions()
  } catch {
    // Claim failure is non-critical — sessions remain anonymous but user can still generate new ones.
  }
}

function setAuthError(message) {
  document.getElementById('auth-error').textContent = message
}

document.getElementById('google-signin-btn').addEventListener('click', async () => {
  setAuthError('')
  try {
    await signInWithPopup(auth, new GoogleAuthProvider())
  } catch (error) {
    setAuthError(error.message)
  }
})

document.getElementById('github-signin-btn').addEventListener('click', async () => {
  setAuthError('')
  try {
    const provider = new GithubAuthProvider()
    provider.addScope('repo')
    const result = await signInWithPopup(auth, provider)
    persistGithubAccessToken(result)
  } catch (error) {
    setAuthError(error.message)
  }
})

document.getElementById('email-signin-btn').addEventListener('click', async () => {
  setAuthError('')
  const email = document.getElementById('auth-email').value.trim()
  const password = document.getElementById('auth-password').value
  if (!email || !password) return setAuthError('Email and password required')
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    setAuthError(error.message)
  }
})

document.getElementById('email-signup-btn').addEventListener('click', async () => {
  setAuthError('')
  const email = document.getElementById('auth-email').value.trim()
  const password = document.getElementById('auth-password').value
  if (!email || !password) return setAuthError('Email and password required')
  try {
    await createUserWithEmailAndPassword(auth, email, password)
  } catch (error) {
    setAuthError(error.message)
  }
})

document.getElementById('signout-btn').addEventListener('click', () => {
  clearGithubAccessToken()
  signOut(auth)
})

document.getElementById('signin-btn')?.addEventListener('click', () => {
  document.getElementById('auth-overlay').classList.remove('hidden')
})

document.getElementById('auth-overlay').addEventListener('click', (event) => {
  if (event.target === event.currentTarget && !currentUser) {
    event.currentTarget.classList.add('hidden')
    const signinBtn = document.getElementById('signin-btn')
    if (signinBtn) signinBtn.style.display = 'flex'
  }
})

const form = document.getElementById('prompt-form')
const input = document.getElementById('prompt-input')
const languageSelect = document.getElementById('prompt-language')
const submitButton = document.getElementById('submit-btn')
const generationCounter = document.getElementById('gen-counter')
const promptPlaceholder = document.getElementById('prompt-placeholder')
const promptPlaceholderText = document.getElementById('prompt-placeholder-text')
const privateGenRow = document.getElementById('private-gen-row')
const privateGenCheckbox = document.getElementById('private-gen-checkbox')
const privateGenModal = document.getElementById('private-gen-modal')
const GENERATION_LIMIT = 2
const MIN_PROMPT_LENGTH = 70
const PREFERRED_LANGUAGE_KEY = 'sf_preferred_language'
const isLocalDevHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1')
const SAMPLE_PROMPTS = [
  'A cinematic travel landing page for curated weekend escapes with reviews and fast booking.',
  'A polished SaaS homepage for an AI sales copilot with pipeline analytics and clear pricing.',
  'A premium architecture studio site with immersive case studies, awards, and inquiry scheduling.',
  'A bold ecommerce homepage for handcrafted coffee gear with bundles and subscriptions.',
  'A sleek fintech landing page for founders tracking runway, burn, and investor updates.',
  'A modern fitness club website with class schedules, trainer profiles, and membership plans.',
]

function normalizeLanguageCode(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .split(/[-_]/)[0]
}

function getBrowserLanguageCandidates() {
  const navigatorLanguages = Array.isArray(navigator.languages) ? navigator.languages : []
  const candidates =
    navigatorLanguages.length > 0 ? navigatorLanguages : [navigator.language].filter(Boolean)
  const normalized = candidates
    .map((entry) => normalizeLanguageCode(entry))
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)

  return normalized
}

function getLanguageDisplayName(code) {
  const normalized = normalizeLanguageCode(code)
  if (!normalized) return 'Language'
  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames === 'undefined') {
    return normalized
  }
  try {
    const display = new Intl.DisplayNames(undefined, { type: 'language' })
    return display.of(normalized) || normalized
  } catch {
    return normalized
  }
}

function getSavedPreferredLanguage() {
  if (!languageSelect) return null
  const preferred = localStorage.getItem(PREFERRED_LANGUAGE_KEY)
  const normalized = normalizeLanguageCode(preferred)
  if (!normalized) return null
  return Array.from(languageSelect.options).some((option) => option.value === normalized)
    ? normalized
    : null
}

function savePreferredLanguage(language) {
  const normalized = normalizeLanguageCode(language)
  if (!normalized) return
  if (!languageSelect) return
  if (!Array.from(languageSelect.options).some((option) => option.value === normalized)) return
  localStorage.setItem(PREFERRED_LANGUAGE_KEY, normalized)
}

function detectBrowserLanguage() {
  if (!languageSelect) return 'en'
  const available = new Set(Array.from(languageSelect.options).map((option) => option.value))
  const storedLanguage = getSavedPreferredLanguage()
  if (storedLanguage && storedLanguage !== 'en') return storedLanguage
  const normalizedCandidates = getBrowserLanguageCandidates()

  const supportedNonEnglishMatch = normalizedCandidates.find(
    (language) => language !== 'en' && available.has(language),
  )
  if (supportedNonEnglishMatch) return supportedNonEnglishMatch

  const browserNonEnglish = normalizedCandidates.find((language) => language !== 'en')
  if (browserNonEnglish) return browserNonEnglish

  if (available.has('en')) return 'en'
  if (Array.from(available).length > 0) return Array.from(available)[0]
  return available.values().next().value || 'en'
}

function focusLanguageOptions(preferredLanguage) {
  if (!languageSelect) return
  const options = Array.from(languageSelect.options)
  const englishOption = options.find((option) => option.value === 'en')
  const preferredOption = options.find((option) => option.value === preferredLanguage)
  if (!englishOption) return

  const normalizedPreferred = normalizeLanguageCode(preferredLanguage)
  const preferredToShow =
    normalizedPreferred && preferredOption && normalizedPreferred !== 'en' ? preferredOption : null
  const customPreferredToShow =
    normalizedPreferred && normalizedPreferred !== 'en' && !preferredOption
      ? new Option(
          `${getLanguageDisplayName(normalizedPreferred)} (${normalizedPreferred})`,
          normalizedPreferred,
        )
      : null

  languageSelect.innerHTML = ''
  languageSelect.appendChild(englishOption.cloneNode(true))
  if (preferredToShow) languageSelect.appendChild(preferredToShow.cloneNode(true))
  if (customPreferredToShow) languageSelect.appendChild(customPreferredToShow)

  languageSelect.value = normalizedPreferred || 'en'
}

function applyBrowserPreferredLanguage() {
  const nextLanguage = detectBrowserLanguage()
  focusLanguageOptions(nextLanguage)
  languageSelect.value = nextLanguage
}

let samplePromptIndex = 0
let samplePromptLength = 0
let samplePromptMode = 'typing'
let samplePromptTimer = null

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function renderSamplePrompt() {
  promptPlaceholderText.textContent = SAMPLE_PROMPTS[samplePromptIndex].slice(0, samplePromptLength)
}

function stopSamplePromptAnimation() {
  if (samplePromptTimer !== null) {
    window.clearTimeout(samplePromptTimer)
    samplePromptTimer = null
  }
}

function scheduleSamplePromptStep(delay) {
  stopSamplePromptAnimation()
  samplePromptTimer = window.setTimeout(stepSamplePromptAnimation, delay)
}

function syncSamplePromptVisibility() {
  const hasValue = input.value.length > 0
  promptPlaceholder.classList.toggle('is-hidden', hasValue)

  if (hasValue) {
    stopSamplePromptAnimation()
    return
  }

  if (samplePromptTimer === null) {
    scheduleSamplePromptStep(samplePromptLength === 0 ? 320 : 80)
  }
}

function stepSamplePromptAnimation() {
  samplePromptTimer = null

  if (input.value.length > 0) {
    syncSamplePromptVisibility()
    return
  }

  const currentPrompt = SAMPLE_PROMPTS[samplePromptIndex]

  if (samplePromptMode === 'typing') {
    samplePromptLength += 1
    renderSamplePrompt()

    if (samplePromptLength < currentPrompt.length) {
      scheduleSamplePromptStep(randomDelay(16, 30))
      return
    }

    samplePromptMode = 'holding'
    scheduleSamplePromptStep(1800)
    return
  }

  if (samplePromptMode === 'holding') {
    samplePromptMode = 'deleting'
    scheduleSamplePromptStep(640)
    return
  }

  samplePromptLength = Math.max(0, samplePromptLength - 1)
  renderSamplePrompt()

  if (samplePromptLength > 0) {
    scheduleSamplePromptStep(randomDelay(10, 18))
    return
  }

  samplePromptIndex = (samplePromptIndex + 1) % SAMPLE_PROMPTS.length
  samplePromptMode = 'typing'
  scheduleSamplePromptStep(260)
}

function validatePrompt(showError = false) {
  const promptLength = input.value.trim().length

  if (showError && promptLength < MIN_PROMPT_LENGTH) {
    input.setAttribute('aria-invalid', 'true')
    return false
  }

  input.removeAttribute('aria-invalid')
  return promptLength >= MIN_PROMPT_LENGTH
}

function isGenerationLimitReached() {
  if (isLocalDevHost) return false
  if (authResolved && currentUser) return false
  if (!authResolved) return false
  return getGenerationCount() >= GENERATION_LIMIT
}

function syncSubmitButtonState() {
  submitButton.disabled =
    submitButton.classList.contains('loading') ||
    isGenerationLimitReached() ||
    input.value.trim().length < MIN_PROMPT_LENGTH
}

function getGenerationCount() {
  return parseInt(localStorage.getItem('sf_generation_count') || '0', 10)
}

function updateGenerationCounter() {
  if (isLocalDevHost) {
    generationCounter.style.display = 'none'
    privateGenRow.style.display = 'none'
    syncSubmitButtonState()
    return
  }
  if (!authResolved) {
    generationCounter.style.display = 'none'
    privateGenRow.style.display = 'none'
    syncSubmitButtonState()
    return
  }
  if (currentUser) {
    generationCounter.style.display = 'none'
    privateGenRow.style.display = 'none'
    syncSubmitButtonState()
    return
  }

  const count = getGenerationCount()
  if (count === 0) {
    generationCounter.style.display = 'none'
    privateGenRow.style.display = 'none'
    syncSubmitButtonState()
    return
  }

  generationCounter.style.display = 'block'
  privateGenRow.style.display = 'none'

  if (isGenerationLimitReached()) {
    generationCounter.innerHTML = `${GENERATION_LIMIT}/${GENERATION_LIMIT} free previews used — <a href="#" id="gen-signup-link" style="color:inherit;text-decoration:underline;">sign up instead</a>`
    generationCounter.classList.add('limit-reached')
    document.getElementById('gen-signup-link')?.addEventListener('click', (e) => {
      e.preventDefault()
      document.getElementById('auth-overlay').classList.remove('hidden')
    })
  } else {
    generationCounter.textContent = `${count} / ${GENERATION_LIMIT} free previews used`
    generationCounter.classList.remove('limit-reached')
  }

  syncSubmitButtonState()
}

function openPrivateGenModal() {
  privateGenCheckbox.checked = false
  privateGenModal.classList.add('is-open')
  privateGenModal.setAttribute('aria-hidden', 'false')
}

function closePrivateGenModal() {
  privateGenModal.classList.remove('is-open')
  privateGenModal.setAttribute('aria-hidden', 'true')
}

privateGenCheckbox.addEventListener('change', () => {
  if (privateGenCheckbox.checked) openPrivateGenModal()
})

document.getElementById('private-gen-modal-close').addEventListener('click', closePrivateGenModal)
document
  .getElementById('private-gen-modal-backdrop')
  .addEventListener('click', closePrivateGenModal)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && privateGenModal.classList.contains('is-open')) closePrivateGenModal()
})

applyBrowserPreferredLanguage()
updateGenerationCounter()
renderSamplePrompt()
syncSamplePromptVisibility()
syncSubmitButtonState()

input.addEventListener('input', () => {
  validatePrompt(false)
  syncSamplePromptVisibility()
  syncSubmitButtonState()
})

languageSelect?.addEventListener('change', () => {
  if (languageSelect) savePreferredLanguage(languageSelect.value)
})

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    form.requestSubmit()
  }
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!validatePrompt(true)) {
    syncSubmitButtonState()
    return
  }
  const prompt = input.value.trim()
  const preferredLanguage = languageSelect?.value || 'en'
  savePreferredLanguage(preferredLanguage)

  if (isGenerationLimitReached()) {
    document.getElementById('auth-overlay').classList.remove('hidden')
    return
  }

  submitButton.classList.add('loading')
  syncSubmitButtonState()

  try {
    const response = await authFetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, preferredLanguage }),
    })
    const data = await response.json()

    if (data.id) {
      if (!currentUser) saveAnonSession(data.id, prompt)
      localStorage.setItem('sf_generation_count', String(getGenerationCount() + 1))
      sessionStorage.setItem('sf_return_home', '1')
      window.location.href = `/session/${data.id}`
      return
    }

    if (!currentUser && response.status === 429) {
      // Server-side anon limit hit — prompt sign-in
      updateGenerationCounter()
      document.getElementById('auth-overlay').classList.remove('hidden')
    } else {
      alert(data.error || 'Failed to create session')
    }
  } catch (error) {
    alert(`Connection error: ${error.message}`)
  }

  submitButton.classList.remove('loading')
  syncSubmitButtonState()
})

const ANON_SESSIONS_KEY = 'sf_anon_sessions'

function saveAnonSession(id, prompt) {
  const stored = JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || '[]')
  stored.unshift({ id, prompt })
  localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(stored.slice(0, 20)))
}

function removeAnonSession(id) {
  const stored = JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || '[]')
  localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(stored.filter((s) => s.id !== id)))
}

function clearAnonSessions() {
  localStorage.removeItem(ANON_SESSIONS_KEY)
}

function renderSessions(sessions) {
  const section = document.getElementById('sessions-section')
  const list = document.getElementById('session-list')

  if (sessions.length === 0) {
    list.innerHTML = ''
    section.style.display = 'none'
    document.body.classList.remove('has-sessions')
    list.classList.remove('single-col', 'two-col')
    return
  }

  document.body.classList.add('has-sessions')

  list.classList.remove('single-col', 'two-col')
  if (sessions.length === 1) list.classList.add('single-col')
  else if (sessions.length === 2) list.classList.add('two-col')

  const placeholderSvg =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>'

  const eagerThumbnailCount = 6

  list.innerHTML = sessions
    .map(
      (session, index) => `
        <li class="session-item" data-id="${session.id}" onclick="sessionStorage.setItem('sf_return_home', '1'); location.href='/session/${session.id}'">
          <div class="session-thumbnail">
            ${
              session.homepageReady
                ? index < eagerThumbnailCount
                  ? `<iframe src="/preview/${session.id}/" loading="eager" sandbox="allow-same-origin allow-scripts" tabindex="-1"></iframe>`
                  : `<iframe data-src="/preview/${session.id}/" loading="lazy" sandbox="allow-same-origin allow-scripts" tabindex="-1"></iframe>`
                : `<div class="session-placeholder">${placeholderSvg}</div>`
            }
            <div class="session-badges">
              ${
                session.elapsed
                  ? `<span class="session-badge badge-time"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>${session.elapsed}s</span>`
                  : ''
              }
              ${
                session.cost != null
                  ? `<span class="session-badge badge-cost session-cost" style="display:none">$${session.cost.toFixed(4)}</span>`
                  : ''
              }
            </div>
          </div>
          <div class="session-info">
            <span class="session-prompt">${session.prompt.replace(/</g, '&lt;')}</span>
          </div>
        </li>
      `,
    )
    .join('')

  section.style.display = 'block'

  const scaleIframes = () => {
    list.querySelectorAll('.session-thumbnail iframe').forEach((iframe) => {
      const containerWidth = iframe.parentElement.offsetWidth
      if (!containerWidth) return
      const scale = containerWidth / 1280
      iframe.style.transform = `scale(${scale})`
    })
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scaleIframes()
    })
  })
  if (!hasSessionResizeListener) {
    window.addEventListener('resize', scaleIframes)
    hasSessionResizeListener = true
  }

  const iframes = list.querySelectorAll('iframe[data-src]')
  if (iframes.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const iframe = entry.target
            iframe.src = iframe.dataset.src
            iframe.addEventListener('load', scaleIframes, { once: true })
            observer.unobserve(iframe)
            requestAnimationFrame(scaleIframes)
          }
        })
      },
      { rootMargin: '200px' },
    )
    iframes.forEach((iframe) => observer.observe(iframe))
  } else {
    iframes.forEach((iframe) => {
      iframe.src = iframe.dataset.src
      iframe.addEventListener('load', scaleIframes, { once: true })
    })
    requestAnimationFrame(scaleIframes)
  }

  list.querySelectorAll('.session-thumbnail iframe[src]:not([data-src])').forEach((iframe) => {
    iframe.addEventListener('load', scaleIframes, { once: true })
  })

  if (localStorage.getItem('sf_show_cost') === '1') {
    list.querySelectorAll('.session-cost').forEach((element) => {
      element.style.display = 'flex'
    })
  }
}

async function loadRecentPublicSessions() {
  try {
    const r = await fetch('/api/sessions/recent')
    if (!r.ok) {
      renderSessions([])
      return
    }
    const sessions = await r.json()
    if (!Array.isArray(sessions) || sessions.length === 0) {
      renderSessions([])
      return
    }
    renderSessions(sessions)
  } catch {
    renderSessions([])
  }
}

async function loadSessions() {
  try {
    const response = await authFetch('/api/sessions')
    if (!response.ok) throw new Error('Failed to load sessions')
    const raw = await response.json()
    const sessions = Array.isArray(raw) ? raw : []
    if (sessions.length > 0) {
      renderSessions(sessions)
      return
    }
  } catch {
    // Ignore fetch failures on the public page and keep the marketing content available.
  }
  await loadRecentPublicSessions()
}

async function loadAnonymousSessions() {
  try {
    const stored = JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || '[]')
    if (stored.length === 0) return

    const results = await Promise.all(
      stored.map(async ({ id, prompt }) => {
        try {
          const r = await fetch(`/api/sessions/${id}`)
          if (!r.ok) return null
          const data = await r.json()
          return {
            id: data.id,
            prompt: data.prompt || prompt,
            homepageReady: data.homepageReady,
            elapsed: data.elapsed,
            cost: data.cost,
          }
        } catch {
          return { id, prompt, homepageReady: false, elapsed: null, cost: null }
        }
      }),
    )

    const valid = results.filter(Boolean)
    const validIds = new Set(valid.map((s) => s.id))
    const pruned = stored.filter((s) => validIds.has(s.id))
    if (pruned.length !== stored.length) {
      localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(pruned))
    }

    renderSessions(valid)
  } catch {
    // Ignore failures silently.
  }
}

let hoveredSessionId = null
document.addEventListener('mouseover', (event) => {
  const card = event.target.closest('.session-item')
  hoveredSessionId = card ? card.dataset.id : null
})

function activeElementIsTextEntry() {
  const tagName = document.activeElement?.tagName
  return tagName === 'TEXTAREA' || tagName === 'INPUT'
}

document.addEventListener('keydown', async (event) => {
  if (event.key !== 'd' || !hoveredSessionId || activeElementIsTextEntry()) return

  const id = hoveredSessionId
  const card = document.querySelector(`.session-item[data-id="${id}"]`)
  if (card) card.style.opacity = '0.3'

  if (currentUser) {
    await authFetch(`/api/sessions/${id}`, { method: 'DELETE' })
  } else {
    removeAnonSession(id)
  }
  if (card) card.remove()

  const remaining = document.querySelectorAll('.session-item')
  if (remaining.length === 0) {
    document.getElementById('sessions-section').style.display = 'none'
    document.body.classList.remove('has-sessions')
    return
  }

  const list = document.getElementById('session-list')
  list.classList.remove('single-col', 'two-col')
  if (remaining.length === 1) list.classList.add('single-col')
  else if (remaining.length === 2) list.classList.add('two-col')
})

document.addEventListener('keydown', (event) => {
  if (event.key !== 'p' || activeElementIsTextEntry()) return
  const visible = localStorage.getItem('sf_show_cost') === '1'
  localStorage.setItem('sf_show_cost', visible ? '0' : '1')
  document.querySelectorAll('.session-cost').forEach((element) => {
    element.style.display = visible ? 'none' : 'flex'
  })
})

let deletePresses = []
document.addEventListener('keydown', async (event) => {
  if (event.key !== 'd' || activeElementIsTextEntry()) return
  const now = Date.now()
  deletePresses.push(now)
  deletePresses = deletePresses.filter((timestamp) => now - timestamp < 1500)

  if (deletePresses.length < 5) return

  deletePresses = []
  document.querySelectorAll('.session-item').forEach((card) => {
    card.style.opacity = '0.3'
  })

  if (currentUser) {
    await authFetch('/api/sessions', { method: 'DELETE' })
  } else {
    clearAnonSessions()
  }
  document.getElementById('session-list').innerHTML = ''
  document.getElementById('sessions-section').style.display = 'none'
  document.body.classList.remove('has-sessions')
})

try {
  fetch('chrome-extension://gppongmhjkpfnbhagpmjfkannfbllamg/js/js.js')
    .then(() => {
      document.getElementById('wappalyzer-banner').style.display = 'block'
    })
    .catch(() => {})
} catch {
  // Ignore extension probing failures outside Chromium.
}

window.addEventListener('pageshow', (event) => {
  const nav = performance.getEntriesByType('navigation')[0]
  const back = event.persisted || (nav && nav.type === 'back_forward')
  if (back) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    })
  }
  if (event.persisted) {
    if (currentUser) loadSessions()
    else loadAnonymousSessions()
  }
})

initFirebase()
