import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js'
import {
  getAuth,
  onAuthStateChanged,
  GithubAuthProvider,
  linkWithPopup,
  reauthenticateWithPopup,
} from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js'

const GITHUB_TOKEN_STORAGE_KEY = 'sf_github_access_token'

let auth = null
let currentUser = null

const ready = initDashboardAuth()

function readGithubAccessToken() {
  return sessionStorage.getItem(GITHUB_TOKEN_STORAGE_KEY) || ''
}

function storeGithubAccessToken(token) {
  if (token) sessionStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, token)
}

async function initDashboardAuth() {
  const response = await fetch('/api/config')
  const config = await response.json()

  if (!config?.apiKey) {
    throw new Error('Dashboard auth is not configured.')
  }

  const app = initializeApp(config)
  auth = getAuth(app)

  await new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user
      resolve()
    })
  })

  return auth
}

async function requireCurrentUser() {
  await ready
  if (!currentUser) {
    throw new Error('Sign in on the homepage with the same Ship Fast account before pushing to GitHub.')
  }
  return currentUser
}

async function ensureGithubRepoAccessToken() {
  const existingToken = readGithubAccessToken()
  if (existingToken) return existingToken

  const user = await requireCurrentUser()
  const provider = new GithubAuthProvider()
  provider.addScope('repo')

  let result
  const hasGithubProvider = user.providerData.some((entry) => entry?.providerId === 'github.com')

  try {
    result = hasGithubProvider
      ? await reauthenticateWithPopup(user, provider)
      : await linkWithPopup(user, provider)
  } catch (error) {
    if (!hasGithubProvider && error?.code === 'auth/provider-already-linked') {
      result = await reauthenticateWithPopup(user, provider)
    } else {
      throw error
    }
  }

  currentUser = result?.user || currentUser
  const accessToken = GithubAuthProvider.credentialFromResult(result)?.accessToken
  if (!accessToken) {
    throw new Error('GitHub authorization did not return a repo token.')
  }

  storeGithubAccessToken(accessToken)
  return accessToken
}

async function authFetch(url, options = {}) {
  const user = await requireCurrentUser()
  const idToken = await user.getIdToken()
  const headers = { ...(options.headers || {}) }
  if (idToken) headers.Authorization = `Bearer ${idToken}`
  return fetch(url, { ...options, headers })
}

async function pushExportToGitHub(sessionId, target) {
  const githubAccessToken = await ensureGithubRepoAccessToken()
  const response = await authFetch(`/api/sessions/${sessionId}/github/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, githubAccessToken }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || 'GitHub push failed.')
  }

  return data
}

window.shipFastDashboardGithub = {
  ready,
  pushExportToGitHub,
}
