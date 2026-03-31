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
  return currentUser.getIdToken()
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
  loadAnonymousSessions()
}

function showApp() {
  document.getElementById('auth-overlay').classList.add('hidden')
  const signinBtn = document.getElementById('signin-btn')
  if (signinBtn) signinBtn.style.display = 'none'
  document.getElementById('signout-btn').style.display = 'flex'
  updateGenerationCounter()
  syncSubmitButtonState()
  loadSessions()
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
const submitButton = document.getElementById('submit-btn')
const generationCounter = document.getElementById('gen-counter')
const promptHelp = document.getElementById('prompt-help')
const promptPlaceholder = document.getElementById('prompt-placeholder')
const promptPlaceholderText = document.getElementById('prompt-placeholder-text')
const privateGenRow = document.getElementById('private-gen-row')
const privateGenCheckbox = document.getElementById('private-gen-checkbox')
const privateGenModal = document.getElementById('private-gen-modal')
const GENERATION_LIMIT = 2
const MIN_PROMPT_LENGTH = 70
const SAMPLE_PROMPTS = [
  'A cinematic travel landing page for curated weekend escapes with reviews and fast booking.',
  'A polished SaaS homepage for an AI sales copilot with pipeline analytics and clear pricing.',
  'A premium architecture studio site with immersive case studies, awards, and inquiry scheduling.',
  'A bold ecommerce homepage for handcrafted coffee gear with bundles and subscriptions.',
  'A sleek fintech landing page for founders tracking runway, burn, and investor updates.',
  'A modern fitness club website with class schedules, trainer profiles, and membership plans.',
]

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

function setPromptHelp(message, isError = false) {
  promptHelp.textContent = message
  promptHelp.classList.toggle('is-error', isError)
  if (isError) input.setAttribute('aria-invalid', 'true')
  else input.removeAttribute('aria-invalid')
}

function validatePrompt(showError = false) {
  const promptLength = input.value.trim().length

  if (promptLength === 0) {
    setPromptHelp(`Minimum ${MIN_PROMPT_LENGTH} characters.`, false)
    return false
  }

  if (promptLength < MIN_PROMPT_LENGTH) {
    setPromptHelp(
      `Prompt must be at least ${MIN_PROMPT_LENGTH} characters (${promptLength}/${MIN_PROMPT_LENGTH}).`,
      showError,
    )
    return false
  }

  setPromptHelp(`${promptLength} characters.`, false)
  return true
}

function isGenerationLimitReached() {
  if (authResolved && currentUser) return false // server enforces limit for signed-in users
  if (!authResolved) return false // don't gate before auth resolves
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
  // Authenticated users — server enforces the limit, hide the client-side counter
  if (authResolved && currentUser) {
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
    generationCounter.innerHTML =
      `${GENERATION_LIMIT}/${GENERATION_LIMIT} free previews used — <a href="#" id="gen-signin-link" style="color:inherit;text-decoration:underline;">sign in for 10/month free</a>`
    generationCounter.classList.add('limit-reached')
    document.getElementById('gen-signin-link')?.addEventListener('click', (e) => {
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
document.getElementById('private-gen-modal-backdrop').addEventListener('click', closePrivateGenModal)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && privateGenModal.classList.contains('is-open')) closePrivateGenModal()
})

updateGenerationCounter()
setPromptHelp(`Minimum ${MIN_PROMPT_LENGTH} characters.`)
renderSamplePrompt()
syncSamplePromptVisibility()
syncSubmitButtonState()

input.addEventListener('input', () => {
  validatePrompt(false)
  syncSamplePromptVisibility()
  syncSubmitButtonState()
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
      body: JSON.stringify({ prompt }),
    })
    const data = await response.json()

    if (data.id) {
      if (!currentUser) saveAnonSession(data.id, prompt)
      localStorage.setItem('sf_generation_count', String(getGenerationCount() + 1))
      sessionStorage.setItem('sf_return_home', '1')
      window.location.href = `/session/${data.id}`
      return
    }

    if (data.error?.includes(`${MIN_PROMPT_LENGTH} characters`)) {
      setPromptHelp(data.error, true)
      input.focus()
    } else if (!currentUser && response.status === 429) {
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
  section.style.display = 'block'

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

  const scaleIframes = () => {
    list.querySelectorAll('.session-thumbnail iframe').forEach((iframe) => {
      const containerWidth = iframe.parentElement.offsetWidth
      const scale = containerWidth / 1280
      iframe.style.transform = `scale(${scale})`
    })
  }

  scaleIframes()
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
            observer.unobserve(iframe)
          }
        })
      },
      { rootMargin: '200px' },
    )
    iframes.forEach((iframe) => observer.observe(iframe))
  } else {
    iframes.forEach((iframe) => {
      iframe.src = iframe.dataset.src
    })
  }

  if (localStorage.getItem('sf_show_cost') === '1') {
    list.querySelectorAll('.session-cost').forEach((element) => {
      element.style.display = 'flex'
    })
  }
}

async function loadSessions() {
  try {
    const response = await authFetch('/api/sessions')
    const sessions = await response.json()
    renderSessions(sessions)
  } catch {
    // Ignore fetch failures on the public page and keep the marketing content available.
  }
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
          return { id: data.id, prompt: data.prompt || prompt, homepageReady: data.homepageReady, elapsed: data.elapsed, cost: data.cost }
        } catch {
          return { id, prompt, homepageReady: false, elapsed: null, cost: null }
        }
      })
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
  if (!event.persisted) return
  if (currentUser) loadSessions()
  else loadAnonymousSessions()
})

initFirebase()
