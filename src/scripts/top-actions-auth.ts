import { initializeApp } from 'firebase/app'
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  type Auth,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'

const GITHUB_TOKEN_STORAGE_KEY = 'sf:github-access-token'

declare global {
  interface Window {
    __sfFirebaseAuth?: Auth
    __sfAuthApi?: {
      signInGoogle: () => Promise<void>
      signInGithub: () => Promise<void>
      signInEmail: (email: string, password: string) => Promise<void>
      signUpEmail: (email: string, password: string) => Promise<void>
      signOut: () => Promise<void>
    }
    __sfAuthUnavailable?: boolean
  }
}

const signinBtn: HTMLElement | null = document.getElementById('signin-btn')
const signoutBtn: HTMLElement | null = document.getElementById('signout-btn')
const authOverlay: HTMLElement | null = document.getElementById('auth-overlay')
const authErrorEl: HTMLElement | null = document.getElementById('auth-error')

const setSignedOutUi = (): void => {
  if (signoutBtn) signoutBtn.style.display = 'none'
  if (signinBtn) signinBtn.style.display = 'inline-flex'
}

const setSignedInUi = (): void => {
  if (signinBtn) signinBtn.style.display = 'none'
  if (signoutBtn) signoutBtn.style.display = 'inline-flex'
}

const openOverlay = (): void => {
  if (!authOverlay) return
  if (authErrorEl) authErrorEl.textContent = ''
  authOverlay.classList.remove('hidden')
  authOverlay.setAttribute('aria-hidden', 'false')
  document.getElementById('google-signin-btn')?.focus()
}

const closeOverlay = (): void => {
  if (!authOverlay) return
  authOverlay.classList.add('hidden')
  authOverlay.setAttribute('aria-hidden', 'true')
  if (authErrorEl) authErrorEl.textContent = ''
}

const showAuthError = (err: unknown): void => {
  if (!authErrorEl) return
  authErrorEl.textContent = err instanceof Error ? err.message : 'Sign-in failed'
}

const main = async (): Promise<void> => {
  if (!signinBtn && !signoutBtn) return

  let auth: Auth | null = null

  try {
    const response = await fetch('/api/config')
    const cfg: { apiKey?: string } = await response.json()
    if (!cfg?.apiKey) throw new Error('missing')
    auth = getAuth(initializeApp(cfg))
  } catch {
    setSignedOutUi()
    window.__sfAuthUnavailable = true
    window.dispatchEvent(new CustomEvent('sf-home-auth-state', { detail: { user: null } }))
    window.dispatchEvent(new CustomEvent('sf-firebase-ready', { detail: { auth: null } }))
    return
  }

  // Expose globals so the React provider (and others) can consume the same auth instance
  // without re-initializing Firebase.
  window.__sfFirebaseAuth = auth
  window.__sfAuthApi = {
    signInGoogle: async () => {
      if (!auth) return
      await signInWithPopup(auth, new GoogleAuthProvider())
    },
    signInGithub: async () => {
      if (!auth) return
      const provider = new GithubAuthProvider()
      provider.addScope('repo')
      const result = await signInWithPopup(auth, provider)
      const accessToken = GithubAuthProvider.credentialFromResult(result)?.accessToken
      if (accessToken) sessionStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, accessToken)
    },
    signInEmail: async (email: string, password: string) => {
      if (!auth) return
      await signInWithEmailAndPassword(auth, email, password)
    },
    signUpEmail: async (email: string, password: string) => {
      if (!auth) return
      await createUserWithEmailAndPassword(auth, email, password)
    },
    signOut: async () => {
      if (!auth) return
      sessionStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY)
      await signOut(auth)
    },
  }
  window.dispatchEvent(new CustomEvent('sf-firebase-ready', { detail: { auth } }))

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setSignedInUi()
      closeOverlay()
    } else {
      setSignedOutUi()
    }
    window.dispatchEvent(new CustomEvent('sf-home-auth-state', { detail: { user: user ?? null } }))
  })

  signoutBtn?.addEventListener('click', () => {
    void window.__sfAuthApi?.signOut()
  })

  signinBtn?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('sf-request-auth-overlay'))
    if (window.parent && window.parent !== window) {
      window.parent.dispatchEvent(new CustomEvent('sf-request-auth-overlay'))
    }
  })

  // ─── Auth overlay wiring (replaces the old React AuthOverlay) ───
  window.addEventListener('sf-request-auth-overlay', () => openOverlay())

  // Click-outside (on the backdrop) closes the auth overlay
  authOverlay?.addEventListener('click', (event) => {
    if (event.target === authOverlay && !auth?.currentUser) closeOverlay()
  })

  const wrap =
    (fn: () => Promise<unknown>): ((event: Event) => void) =>
    (event) => {
      event.preventDefault()
      if (authErrorEl) authErrorEl.textContent = ''
      fn().catch(showAuthError)
    }

  document.getElementById('google-signin-btn')?.addEventListener(
    'click',
    wrap(() => window.__sfAuthApi!.signInGoogle()),
  )

  document.getElementById('github-signin-btn')?.addEventListener(
    'click',
    wrap(() => window.__sfAuthApi!.signInGithub()),
  )

  const emailInput = document.getElementById('auth-email') as HTMLInputElement | null
  const passwordInput = document.getElementById('auth-password') as HTMLInputElement | null
  const emailForm = document.getElementById('auth-email-form') as HTMLFormElement | null

  const readEmailCreds = (): { email: string; password: string } | null => {
    const email = emailInput?.value.trim() ?? ''
    const password = passwordInput?.value ?? ''
    emailInput?.setAttribute('aria-invalid', email ? 'false' : 'true')
    passwordInput?.setAttribute('aria-invalid', password ? 'false' : 'true')
    if (!email || !password) {
      if (authErrorEl) authErrorEl.textContent = 'Email and password required'
      return null
    }
    return { email, password }
  }

  const signInWithEmail = async (): Promise<void> => {
    const creds = readEmailCreds()
    if (!creds) return
    await window.__sfAuthApi!.signInEmail(creds.email, creds.password)
  }

  emailForm?.addEventListener('submit', wrap(signInWithEmail))
  document.getElementById('email-signin-btn')?.addEventListener('click', wrap(signInWithEmail))

  document.getElementById('email-signup-btn')?.addEventListener(
    'click',
    wrap(async () => {
      const creds = readEmailCreds()
      if (!creds) return
      await window.__sfAuthApi!.signUpEmail(creds.email, creds.password)
    }),
  )
}

void main()
