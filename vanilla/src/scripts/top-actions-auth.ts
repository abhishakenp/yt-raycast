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

const setSignedOutUi = (): void => {
  if (signoutBtn) signoutBtn.style.display = 'none'
  if (signinBtn) signinBtn.style.display = 'inline-flex'
}

const setSignedInUi = (): void => {
  if (signinBtn) signinBtn.style.display = 'none'
  if (signoutBtn) signoutBtn.style.display = 'inline-flex'
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
    if (user) setSignedInUi()
    else setSignedOutUi()
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
}

void main()
