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
let hasSessionResizeListener = false

async function initFirebase() {
  const cfg = await fetch('/api/config').then((response) => response.json())
  const app = initializeApp(cfg)
  auth = getAuth(app)

  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user
      if (user) showApp()
      else showOverlay()
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

function showOverlay() {
  document.getElementById('auth-overlay').classList.remove('hidden')
  document.getElementById('signout-btn').style.display = 'none'
  document.getElementById('sessions-section').style.display = 'none'
  sessionStorage.removeItem('sf_return_home')
}

function showApp() {
  document.getElementById('auth-overlay').classList.add('hidden')
  document.getElementById('signout-btn').style.display = 'flex'
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
    await signInWithPopup(auth, new GithubAuthProvider())
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

document.getElementById('signout-btn').addEventListener('click', () => signOut(auth))

const form = document.getElementById('prompt-form')
const input = document.getElementById('prompt-input')
const submitButton = document.getElementById('submit-btn')
const generationCounter = document.getElementById('gen-counter')
const GENERATION_LIMIT = 5

function getGenerationCount() {
  return parseInt(localStorage.getItem('sf_generation_count') || '0', 10)
}

function updateGenerationCounter() {
  const count = getGenerationCount()
  if (count === 0) {
    generationCounter.style.display = 'none'
    return
  }

  generationCounter.style.display = 'block'
  if (count >= GENERATION_LIMIT) {
    generationCounter.textContent =
      `Generation limit reached (${GENERATION_LIMIT}/${GENERATION_LIMIT}). Clear your browser storage to reset.`
    generationCounter.classList.add('limit-reached')
    submitButton.disabled = true
  } else {
    generationCounter.textContent = `${count} / ${GENERATION_LIMIT} generations used`
    generationCounter.classList.remove('limit-reached')
  }
}

updateGenerationCounter()

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    form.requestSubmit()
  }
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const prompt = input.value.trim()
  if (!prompt) return

  if (getGenerationCount() >= GENERATION_LIMIT) {
    updateGenerationCounter()
    return
  }

  submitButton.disabled = true
  submitButton.classList.add('loading')

  try {
    const response = await authFetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    const data = await response.json()

    if (data.id) {
      localStorage.setItem('sf_generation_count', String(getGenerationCount() + 1))
      sessionStorage.setItem('sf_return_home', '1')
      window.location.href = `/session/${data.id}`
      return
    }

    alert(data.error || 'Failed to create session')
  } catch (error) {
    alert(`Connection error: ${error.message}`)
  }

  submitButton.disabled = false
  submitButton.classList.remove('loading')
})

async function loadSessions() {
  try {
    const response = await authFetch('/api/sessions')
    const sessions = await response.json()
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
  } catch {
    // Ignore fetch failures on the public page and keep the marketing content available.
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

  await authFetch(`/api/sessions/${id}`, { method: 'DELETE' })
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

  await authFetch('/api/sessions', { method: 'DELETE' })
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
  if (event.persisted && currentUser) loadSessions()
})

initFirebase()
