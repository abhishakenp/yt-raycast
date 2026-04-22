'use client'

import { claimAnonSessionsWithUser } from '@/lib/home/anon-sessions'
import { GITHUB_TOKEN_STORAGE_KEY } from '@/lib/home/constants'
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
  type User,
} from 'firebase/auth'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type ShipFastHomeAuthContextValue = {
  user: User | null
  authReady: boolean
  authError: string
  setAuthError: (message: string) => void
  overlayOpen: boolean
  setOverlayOpen: (open: boolean) => void
  signInGoogle: () => Promise<void>
  signInGithub: () => Promise<void>
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (email: string, password: string) => Promise<void>
  signOutUser: () => Promise<void>
  authFetch: (url: string, options?: RequestInit) => Promise<Response>
}

const ShipFastHomeAuthContext = createContext<ShipFastHomeAuthContextValue | null>(null)

export const useShipFastHomeAuth = () => {
  const ctx = useContext(ShipFastHomeAuthContext)
  if (!ctx) throw new Error('useShipFastHomeAuth requires ShipFastHomeAuthProvider')
  return ctx
}

declare global {
  interface Window {
    __sfAuthFetch?: (url: string, options?: RequestInit) => Promise<Response>
  }
}

export const ShipFastHomeAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null)
  const [authError, setAuthError] = useState('')
  const [overlayOpen, setOverlayOpen] = useState(false)

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = user ? await user.getIdToken(true) : null
      const headers = new Headers(options.headers)
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return fetch(url, { ...options, headers })
    },
    [user],
  )

  useEffect(() => {
    window.__sfAuthFetch = authFetch
    return () => {
      delete window.__sfAuthFetch
    }
  }, [authFetch])

  useEffect(() => {
    const onReq = () => setOverlayOpen(true)
    window.addEventListener('sf-request-auth-overlay', onReq)
    return () => window.removeEventListener('sf-request-auth-overlay', onReq)
  }, [])

  useEffect(() => {
    if (!authReady) return
    window.dispatchEvent(new CustomEvent('sf-home-auth-state', { detail: { user } }))
  }, [user, authReady])

  useEffect(() => {
    let cancelled = false
    let unsub: (() => void) | undefined
    let watchdog: ReturnType<typeof setTimeout> | undefined
    ;(async () => {
      try {
        const r = await fetch('/api/config')
        const cfg = (await r.json()) as { apiKey?: string }
        if (!cfg?.apiKey) {
          if (!cancelled) setAuthReady(true)
          return
        }
        const app = initializeApp(cfg)
        if (cancelled) return
        const auth = getAuth(app)
        setFirebaseAuth(auth)
        watchdog = setTimeout(() => {
          if (!cancelled) setAuthReady(true)
        }, 5000)
        unsub = onAuthStateChanged(auth, async (nextUser) => {
          if (watchdog) clearTimeout(watchdog)
          watchdog = undefined
          if (cancelled) return
          setUser(nextUser)
          setAuthReady(true)
          if (nextUser) {
            await claimAnonSessionsWithUser(nextUser)
            setOverlayOpen(false)
          } else {
            sessionStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY)
            setOverlayOpen(false)
          }
        })
      } catch {
        if (!cancelled) setAuthReady(true)
      }
    })()
    return () => {
      cancelled = true
      if (watchdog) clearTimeout(watchdog)
      unsub?.()
    }
  }, [])

  const signInGoogle = useCallback(async () => {
    if (!firebaseAuth) return
    await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
  }, [firebaseAuth])

  const signInGithub = useCallback(async () => {
    if (!firebaseAuth) return
    const provider = new GithubAuthProvider()
    provider.addScope('repo')
    const result = await signInWithPopup(firebaseAuth, provider)
    const accessToken = GithubAuthProvider.credentialFromResult(result)?.accessToken
    if (accessToken) sessionStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, accessToken)
  }, [firebaseAuth])

  const signInEmail = useCallback(
    async (email: string, password: string) => {
      if (!firebaseAuth) return
      await signInWithEmailAndPassword(firebaseAuth, email, password)
    },
    [firebaseAuth],
  )

  const signUpEmail = useCallback(
    async (email: string, password: string) => {
      if (!firebaseAuth) return
      await createUserWithEmailAndPassword(firebaseAuth, email, password)
    },
    [firebaseAuth],
  )

  const signOutUser = useCallback(async () => {
    if (!firebaseAuth) return
    sessionStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY)
    await signOut(firebaseAuth)
  }, [firebaseAuth])

  const value = useMemo(
    () => ({
      user,
      authReady,
      authError,
      setAuthError,
      overlayOpen,
      setOverlayOpen,
      signInGoogle,
      signInGithub,
      signInEmail,
      signUpEmail,
      signOutUser,
      authFetch,
    }),
    [
      user,
      authReady,
      authError,
      overlayOpen,
      signInGoogle,
      signInGithub,
      signInEmail,
      signUpEmail,
      signOutUser,
      authFetch,
    ],
  )

  return (
    <ShipFastHomeAuthContext.Provider value={value}>{children}</ShipFastHomeAuthContext.Provider>
  )
}
