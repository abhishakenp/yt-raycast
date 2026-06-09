import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import {
  getClerkSessionToken,
  initClerkBrowserAuth,
} from './clerk-browser-auth'

declare global {
  interface Window {
    shipFastDashboardGithub: {
      ready: Promise<any>
      pushExportToGitHub: (sessionId: string, target: unknown) => Promise<unknown>
    }
    shipFastDashboardAuth: {
      ready: Promise<any>
      getCurrentIdToken: () => Promise<string>
      signInWithGoogle: () => Promise<any>
      signInWithGithub: () => Promise<any>
      signInWithEmail: (email: string, password: string) => Promise<any>
      signUpWithEmail: (email: string, password: string) => Promise<any>
    }
  }
}

const GITHUB_TOKEN_STORAGE_KEY = 'sf_github_access_token'

let auth: ReturnType<typeof getAuth> | null = null
let currentUser: import('firebase/auth').User | null = null
let clerkAuth:
  | {
      ready: Promise<unknown>
      getCurrentIdToken: () => Promise<string>
      signInWithGoogle: () => Promise<unknown>
      signInWithGithub: () => Promise<unknown>
      signInWithEmail: (email: string, password: string) => Promise<unknown>
      signUpWithEmail: (email: string, password: string) => Promise<unknown>
    }
  | null = null

const ready: Promise<ReturnType<typeof getAuth> | unknown> = initDashboardAuth()

function readGithubAccessToken(): string {
  return sessionStorage.getItem(GITHUB_TOKEN_STORAGE_KEY) || ''
}

function storeGithubAccessToken(token: string): void {
  if (token) sessionStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, token)
}

async function initDashboardAuth(): Promise<ReturnType<typeof getAuth> | unknown> {
  const response = await fetch('/api/config')
  const config: Record<string, unknown> & {
    apiKey?: string
    clerkPublishableKey?: string
  } = await response.json()

  if (config?.clerkPublishableKey) {
    const clerk = await initClerkBrowserAuth(config.clerkPublishableKey)
    if (!clerk) throw new Error('Dashboard auth is not configured.')
    const openClerkSignIn = async () => {
      clerk.openSignIn()
      return clerk.user
    }
    clerkAuth = {
      ready: Promise.resolve(clerk),
      getCurrentIdToken: () => getClerkSessionToken(clerk),
      signInWithGoogle: openClerkSignIn,
      signInWithGithub: openClerkSignIn,
      signInWithEmail: openClerkSignIn,
      signUpWithEmail: openClerkSignIn,
    }
    return clerk
  }

  if (!config?.apiKey) {
    throw new Error('Dashboard auth is not configured.')
  }

  const app = initializeApp(config)
  auth = getAuth(app)

  await new Promise<void>((resolve) => {
    onAuthStateChanged(auth as ReturnType<typeof getAuth>, (user) => {
      currentUser = user
      resolve()
    })
  })

  return auth
}

async function requireCurrentUser(): Promise<import('firebase/auth').User> {
  await ready
  if (clerkAuth) {
    const token = await clerkAuth.getCurrentIdToken()
    if (!token) {
      throw new Error(
        'Sign in on the homepage with the same Ship Fast account before pushing to GitHub.',
      )
    }
    return { getIdToken: async () => token } as import('firebase/auth').User
  }
  if (!currentUser) {
    throw new Error(
      'Sign in on the homepage with the same Ship Fast account before pushing to GitHub.',
    )
  }
  return currentUser
}

function isFirebaseAuthError(error: unknown): error is { code?: string } {
  return typeof error === 'object' && error !== null && 'code' in error
}

async function ensureGithubRepoAccessToken(): Promise<string> {
  const existingToken = readGithubAccessToken()
  if (existingToken) return existingToken

  if (clerkAuth) {
    throw new Error('Paste a GitHub access token after signing in with Clerk.')
  }

  const user = await requireCurrentUser()
  const provider = new GithubAuthProvider()
  provider.addScope('repo')

  let result:
    | Awaited<ReturnType<typeof linkWithPopup>>
    | Awaited<ReturnType<typeof reauthenticateWithPopup>>
    | undefined
  const hasGithubProvider = user.providerData.some((entry) => entry?.providerId === 'github.com')

  try {
    result = hasGithubProvider
      ? await reauthenticateWithPopup(user, provider)
      : await linkWithPopup(user, provider)
  } catch (error: unknown) {
    if (
      !hasGithubProvider &&
      isFirebaseAuthError(error) &&
      error.code === 'auth/provider-already-linked'
    ) {
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

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const user = await requireCurrentUser()
  const idToken = await user.getIdToken()
  const headers = new Headers(options.headers || {})
  if (idToken) headers.set('Authorization', `Bearer ${idToken}`)
  return fetch(url, { ...options, headers })
}

async function getCurrentIdToken(): Promise<string> {
  await ready
  if (clerkAuth) return clerkAuth.getCurrentIdToken()
  if (!currentUser) return ''
  return currentUser.getIdToken()
}

async function pushExportToGitHub(sessionId: string, target: unknown): Promise<unknown> {
  const githubAccessToken = await ensureGithubRepoAccessToken()
  const response = await authFetch(`/api/sessions/${sessionId}/github/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, githubAccessToken }),
  })

  const data: any = await response.json().catch(() => ({}))
  if (response.status === 402) {
    const err = new Error(data?.error || 'Subscribe to Pro to push exports to GitHub.') as Error & {
      paymentRequired?: boolean
      payment?: unknown
    }
    err.paymentRequired = true
    err.payment = data?.payment
    throw err
  }
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || 'GitHub push failed.')
  }

  return data
}

window.shipFastDashboardGithub = {
  ready,
  pushExportToGitHub,
}

async function signInWithGoogle(): Promise<import('firebase/auth').User> {
  await ready
  if (clerkAuth) return (await clerkAuth.signInWithGoogle()) as import('firebase/auth').User
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth as ReturnType<typeof getAuth>, provider)
  currentUser = result.user
  return result.user
}

async function signInWithGithub(): Promise<import('firebase/auth').User> {
  await ready
  if (clerkAuth) return (await clerkAuth.signInWithGithub()) as import('firebase/auth').User
  const provider = new GithubAuthProvider()
  const result = await signInWithPopup(auth as ReturnType<typeof getAuth>, provider)
  currentUser = result.user
  return result.user
}

async function signInWithEmail(
  email: string,
  password: string,
): Promise<import('firebase/auth').User> {
  await ready
  if (clerkAuth) {
    return (await clerkAuth.signInWithEmail(email, password)) as import('firebase/auth').User
  }
  const result = await signInWithEmailAndPassword(
    auth as ReturnType<typeof getAuth>,
    email,
    password,
  )
  currentUser = result.user
  return result.user
}

async function signUpWithEmail(
  email: string,
  password: string,
): Promise<import('firebase/auth').User> {
  await ready
  if (clerkAuth) {
    return (await clerkAuth.signUpWithEmail(email, password)) as import('firebase/auth').User
  }
  const result = await createUserWithEmailAndPassword(
    auth as ReturnType<typeof getAuth>,
    email,
    password,
  )
  currentUser = result.user
  return result.user
}

window.shipFastDashboardAuth = {
  ready,
  getCurrentIdToken,
  signInWithGoogle,
  signInWithGithub,
  signInWithEmail,
  signUpWithEmail,
}
