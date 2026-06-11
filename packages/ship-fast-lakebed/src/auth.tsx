import { createElement, useEffect, useState } from 'react'
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react'
import {
  AUTH_STORAGE_KEY,
  DEFAULT_SHOO_BASE_URL,
  LEGACY_SHOO_STORAGE_KEY,
  createGoogleAuthFromToken,
  createGuestAuthContext,
  decodeIdentityClaims,
  isExpiredClaims,
  normalizeShooBaseUrl,
  withAuthLoading,
} from './auth-shared.ts'
import type {
  IdentityClaims,
  LakebedAuthValue,
  StoredIdentityResult,
} from './auth-shared.ts'

export type {
  IdentityClaims,
  LakebedAuthContext,
  LakebedAuthUser,
  LakebedAuthValue,
  StoredIdentityResult,
} from './auth-shared.ts'

const PKCE_STORAGE_KEY = 'lakebed_google_pkce'
const RETURN_TO_STORAGE_KEY = 'lakebed_google_return_to'
const PKCE_MAX_AGE_MS = 10 * 60 * 1000
const encoder = new TextEncoder()

type LakebedWindow = Window & {
  __LAKEBED_AUTH__?: Record<string, unknown>
  __LAKEBED_BASE_PATH__?: unknown
}

export interface GoogleAuthOptions {
  callbackPath?: string
  clientId?: string
  redirectUri?: string
  returnTo?: string
  shooBaseUrl?: string
}

export interface PkceBundle {
  challenge: string
  state: string
  verifier: string
}

export interface SignInWithGoogleProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'children' | 'onClick'
> {
  callbackPath?: string
  children?: ReactNode
  clientId?: string
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  redirectUri?: string
  requestPii?: boolean
  requestProfile?: boolean
  returnTo?: string
  shooBaseUrl?: string
}

let auth: LakebedAuthValue
let authInitPromise: Promise<void> | null = null
let authInitialized = false
const authListeners = new Set<(value: LakebedAuthValue) => void>()

const browserWindow = (): LakebedWindow | null =>
  typeof window === 'undefined' ? null : (window as LakebedWindow)

const browserStorage = (): Storage | null => {
  try {
    return browserWindow()?.localStorage ?? null
  } catch {
    return null
  }
}

const browserSessionStorage = (): Storage | null => {
  try {
    return browserWindow()?.sessionStorage ?? null
  } catch {
    return null
  }
}

const parseJson = (value: string | null): unknown => {
  try {
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

const currentGuestName = () => {
  const win = browserWindow()
  if (!win) return 'local'
  return (
    new URLSearchParams(win.location.search).get('lakebed_guest') ?? 'local'
  )
}

const normalizeBasePathValue = (value: unknown): string => {
  const clean = String(value ?? '').replace(/\/+$/g, '')
  return clean === '/' ? '' : clean
}

const basePath = () =>
  normalizeBasePathValue(browserWindow()?.__LAKEBED_BASE_PATH__ ?? '')

const authConfig = () => browserWindow()?.__LAKEBED_AUTH__ ?? {}

const currentRoute = () => {
  const win = browserWindow()
  if (!win) return '/'
  return `${win.location.pathname}${win.location.search}${win.location.hash}`
}

const currentPath = () => browserWindow()?.location.pathname ?? '/'

const normalizeReturnTo = (value: string | undefined | null): string | null => {
  const win = browserWindow()
  if (!win || !value) return null

  try {
    const parsed = new URL(value, win.location.origin)
    if (parsed.origin !== win.location.origin) return null

    const route = `${parsed.pathname}${parsed.search}${parsed.hash}`
    if (!route.startsWith('/') || route.startsWith('//')) return null
    return route
  } catch {
    return null
  }
}

const fallbackRoute = () => basePath() || '/'

const deriveRedirectUri = (path: string) =>
  new URL(
    path,
    browserWindow()?.location.origin ?? 'http://localhost',
  ).toString()

const deriveClientIdFromRedirectUri = (redirectUri: string) =>
  `origin:${new URL(redirectUri).origin}`

function resolveGoogleAuthOptions(
  options: GoogleAuthOptions = {},
): Required<GoogleAuthOptions> {
  const configuredShooBaseUrl =
    typeof authConfig().shooBaseUrl === 'string'
      ? authConfig().shooBaseUrl
      : DEFAULT_SHOO_BASE_URL
  const callbackPath =
    normalizeReturnTo(options.callbackPath) ??
    normalizeReturnTo(currentPath()) ??
    fallbackRoute()
  const redirectUri = options.redirectUri ?? deriveRedirectUri(callbackPath)

  return {
    callbackPath,
    clientId: options.clientId ?? deriveClientIdFromRedirectUri(redirectUri),
    redirectUri,
    returnTo: normalizeReturnTo(options.returnTo) ?? currentRoute(),
    shooBaseUrl: normalizeShooBaseUrl(
      options.shooBaseUrl ?? configuredShooBaseUrl,
    ),
  }
}

const randomString = (length = 64) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const random = crypto.getRandomValues(new Uint8Array(length))
  let value = ''

  for (const item of random) {
    value += chars[item % chars.length]
  }

  return value
}

const bytesToBase64Url = (bytes: Uint8Array) => {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

async function createPkceBundle(): Promise<PkceBundle> {
  const verifier = randomString(64)
  const state = randomString(32)
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(verifier))

  return {
    challenge: bytesToBase64Url(new Uint8Array(digest)),
    state,
    verifier,
  }
}

function createSignInUrl(
  options: Required<GoogleAuthOptions>,
  bundle: PkceBundle,
) {
  const url = new URL('/authorize', options.shooBaseUrl)
  url.searchParams.set('client_id', options.clientId)
  url.searchParams.set('redirect_uri', options.redirectUri)
  url.searchParams.set('state', bundle.state)
  url.searchParams.set('code_challenge', bundle.challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('pii', 'true')
  return url.toString()
}

function persistIdentity(userId: string, token: string, expiresIn?: number) {
  try {
    browserStorage()?.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        expiresIn,
        receivedAt: Date.now(),
        token,
        userId,
      }),
    )
  } catch {
    // Storage persistence is best effort.
  }
}

function clearStoredIdentity() {
  try {
    const storage = browserStorage()
    storage?.removeItem(AUTH_STORAGE_KEY)
    storage?.removeItem(LEGACY_SHOO_STORAGE_KEY)
  } catch {
    // Ignore storage failures; guest mode still works.
  }
}

function parseCallback(url = browserWindow()?.location.href) {
  if (!url) return null

  const parsed = new URL(url)
  const code = parsed.searchParams.get('code')
  const state = parsed.searchParams.get('state')

  return code && state ? { code, state } : null
}

function clearCallbackParams(url = browserWindow()?.location.href) {
  const win = browserWindow()
  if (!win || !url) return

  const next = new URL(url)
  next.searchParams.delete('code')
  next.searchParams.delete('state')
  next.searchParams.delete('error')
  win.history.replaceState({}, '', next.toString())
}

function popReturnTo() {
  const storage = browserSessionStorage()
  const value = normalizeReturnTo(storage?.getItem(RETURN_TO_STORAGE_KEY))
  storage?.removeItem(RETURN_TO_STORAGE_KEY)
  return value
}

async function exchangeCode({
  code,
  codeVerifier,
  options,
}: {
  code: string
  codeVerifier: string
  options: Required<GoogleAuthOptions>
}) {
  const body = new URLSearchParams({
    client_id: options.clientId,
    code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: options.redirectUri,
  })
  const response = await fetch(new URL('/token', options.shooBaseUrl), {
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(
      `Google sign-in token exchange failed (${response.status}): ${
        details || 'no details'
      }`,
    )
  }

  return response.json()
}

async function handleGoogleCallback() {
  const callback = parseCallback()
  if (!callback) return null

  const storage = browserSessionStorage()
  const parsedPkce = parseJson(storage?.getItem(PKCE_STORAGE_KEY) ?? null) as {
    createdAt?: number
    state?: string
    verifier?: string
  } | null

  if (!parsedPkce?.state || !parsedPkce.verifier) {
    throw new Error('Missing Google sign-in verifier. Start sign-in again.')
  }

  if (
    typeof parsedPkce.createdAt === 'number' &&
    Date.now() - parsedPkce.createdAt > PKCE_MAX_AGE_MS
  ) {
    storage?.removeItem(PKCE_STORAGE_KEY)
    throw new Error('Google sign-in verifier expired. Start sign-in again.')
  }

  if (parsedPkce.state !== callback.state) {
    throw new Error('Google sign-in state mismatch.')
  }

  const options = resolveGoogleAuthOptions()
  const token = await exchangeCode({
    code: callback.code,
    codeVerifier: parsedPkce.verifier,
    options,
  })

  if (!token?.id_token || !token?.pairwise_sub) {
    throw new Error(
      'Google sign-in token response was missing identity claims.',
    )
  }

  persistIdentity(token.pairwise_sub, token.id_token, token.expires_in)
  storage?.removeItem(PKCE_STORAGE_KEY)

  const localAuth = createGoogleAuthFromToken(token.id_token)
  if (localAuth) {
    setAuth(withAuthLoading(localAuth, false))
  }

  const returnTo = popReturnTo() ?? fallbackRoute()
  clearCallbackParams()
  browserWindow()?.location.replace(returnTo)
  return token
}

function readStoredIdentity({
  allowExpired = false,
}: { allowExpired?: boolean } = {}): StoredIdentityResult {
  let raw: string | null = null

  try {
    const storage = browserStorage()
    raw =
      storage?.getItem(AUTH_STORAGE_KEY) ??
      storage?.getItem(LEGACY_SHOO_STORAGE_KEY) ??
      null
  } catch {
    return { userId: null }
  }

  const parsed = parseJson(raw) as {
    pairwiseSub?: unknown
    token?: unknown
    userId?: unknown
  } | null
  if (!parsed || typeof parsed !== 'object') return { userId: null }

  const token = typeof parsed.token === 'string' ? parsed.token : undefined
  const claims = decodeIdentityClaims(token)
  const expired = isExpiredClaims(claims)
  if (expired && !allowExpired) return { expired, userId: null }

  return {
    expired,
    token,
    userId:
      typeof parsed.userId === 'string'
        ? parsed.userId
        : typeof parsed.pairwiseSub === 'string'
          ? parsed.pairwiseSub
          : null,
  }
}

function storedAuthToken() {
  return readStoredIdentity().token ?? ''
}

function createInitialAuth(): LakebedAuthValue {
  const googleAuth = createGoogleAuthFromToken(storedAuthToken())
  if (googleAuth) return withAuthLoading(googleAuth, true)

  return withAuthLoading(
    createGuestAuthContext(currentGuestName()),
    typeof window !== 'undefined',
  )
}

auth = createInitialAuth()

function setAuth(value: LakebedAuthValue) {
  auth = value
  for (const listener of authListeners) {
    listener(auth)
  }
}

export function getAuth(): LakebedAuthValue {
  return auth
}

export function getIdentity(): StoredIdentityResult {
  return readStoredIdentity()
}

export function getAuthToken(): string {
  return storedAuthToken()
}

export function getIdentityClaims(): IdentityClaims | null {
  return decodeIdentityClaims(storedAuthToken())
}

export function ensureAuthInitialized(): Promise<void> {
  if (authInitialized) return Promise.resolve()

  authInitPromise ??= handleGoogleCallback()
    .catch((error) => {
      console.error('[lakebed] Google sign-in failed', error)
    })
    .finally(() => {
      authInitialized = true
      const googleAuth = createGoogleAuthFromToken(storedAuthToken())
      setAuth(
        withAuthLoading(
          googleAuth ?? createGuestAuthContext(currentGuestName()),
          false,
        ),
      )
    })

  return authInitPromise
}

export function useAuth(): LakebedAuthValue {
  const [value, setValue] = useState(auth)

  useEffect(() => {
    authListeners.add(setValue)
    void ensureAuthInitialized()
    return () => {
      authListeners.delete(setValue)
    }
  }, [])

  return value
}

export async function signInWithGoogle(options: GoogleAuthOptions = {}) {
  const win = browserWindow()
  if (!win) {
    throw new Error('Google sign-in requires a browser environment.')
  }

  const resolved = resolveGoogleAuthOptions(options)
  const bundle = await createPkceBundle()
  const storage = browserSessionStorage()
  storage?.setItem(
    PKCE_STORAGE_KEY,
    JSON.stringify({
      createdAt: Date.now(),
      state: bundle.state,
      verifier: bundle.verifier,
    }),
  )
  storage?.setItem(
    RETURN_TO_STORAGE_KEY,
    normalizeReturnTo(resolved.returnTo) ?? fallbackRoute(),
  )

  const url = createSignInUrl(resolved, bundle)
  win.location.assign(url)
  return { bundle, url }
}

export function signOut() {
  clearStoredIdentity()
  setAuth(withAuthLoading(createGuestAuthContext(currentGuestName()), false))
}

export function SignInWithGoogle({
  callbackPath,
  children = 'Sign in with Google',
  clientId,
  disabled,
  onClick,
  redirectUri,
  requestPii: _requestPii,
  requestProfile: _requestProfile,
  returnTo,
  shooBaseUrl,
  type = 'button',
  ...props
}: SignInWithGoogleProps) {
  return createElement(
    'button',
    {
      ...props,
      disabled,
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented || disabled) return

        void signInWithGoogle({
          callbackPath,
          clientId,
          redirectUri,
          returnTo,
          shooBaseUrl,
        })
      },
      type,
    },
    children,
  )
}
