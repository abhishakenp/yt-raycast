import type { AuthContext } from 'lakebed/server'

export const DEFAULT_SHOO_BASE_URL = 'https://shoo.dev'
export const AUTH_STORAGE_KEY = 'lakebed_identity'
export const LEGACY_SHOO_STORAGE_KEY = 'shoo_identity'

export type LakebedAuthUser = {
  id: string
  userId: string
  displayName: string
  provider: AuthContext['provider']
  isGuest: boolean
  email?: string
  emailVerified?: boolean
  picture?: string
}

export type LakebedAuthContext = AuthContext & {
  user: LakebedAuthUser
}

export type LakebedAuthValue = LakebedAuthContext & {
  isLoading?: boolean
}

export type IdentityClaims = {
  aud?: string
  email?: string
  email_verified?: boolean
  exp?: number
  iat?: number
  iss?: string
  jti?: string
  name?: string
  pairwise_sub?: string
  picture?: string
  sub?: string
}

export type StoredIdentityResult = {
  expired?: boolean
  token?: string
  userId: string | null
}

export const normalizeShooBaseUrl = (value: unknown): string =>
  String(value ?? DEFAULT_SHOO_BASE_URL).replace(/\/+$/g, '')

export const toGuestName = (name: unknown): string =>
  String(name ?? 'local')
    .replace(/^guest:/, '')
    .trim()
    .replace(/[^a-zA-Z0-9_.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'local'

export const toDisplayName = (name: unknown): string =>
  toGuestName(name)
    .split(/[-_\s.]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ')

export function withAuthUser(auth: AuthContext): LakebedAuthContext {
  const user = {
    displayName: auth.displayName,
    email: auth.email,
    emailVerified: auth.emailVerified,
    id: auth.userId,
    isGuest: auth.isGuest,
    picture: auth.picture,
    provider: auth.provider,
    userId: auth.userId,
  }

  return { ...auth, user }
}

export function createGuestAuthContext(name: unknown): LakebedAuthContext {
  const guestName = toGuestName(name)

  return withAuthUser({
    displayName: toDisplayName(guestName),
    isAuthenticated: false,
    isGuest: true,
    provider: 'guest',
    userId: `guest:${guestName}`,
  })
}

export function withAuthLoading<TAuth extends LakebedAuthContext>(
  auth: TAuth,
  isLoading: boolean,
): TAuth & { isLoading: boolean } {
  return { ...auth, isLoading }
}

const parseJson = (value: string): unknown => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

  if (typeof atob === 'function') return atob(padded)

  const buffer = (
    globalThis as {
      Buffer?: {
        from(value: string, encoding: 'base64'): { toString(): string }
      }
    }
  ).Buffer
  if (buffer) return buffer.from(padded, 'base64').toString()

  throw new Error('No base64 decoder is available.')
}

export function decodeIdentityClaims(
  idToken: string | null | undefined,
): IdentityClaims | null {
  if (!idToken) return null

  const parts = idToken.split('.')
  if (parts.length < 2 || !parts[1]) return null

  const claims = parseJson(decodeBase64Url(parts[1]))
  return claims && typeof claims === 'object'
    ? (claims as IdentityClaims)
    : null
}

export const isExpiredClaims = (claims: IdentityClaims | null): boolean =>
  typeof claims?.exp === 'number' && claims.exp * 1000 <= Date.now()

export function createGoogleAuthFromToken(
  token: string | null | undefined,
): LakebedAuthContext | null {
  const claims = decodeIdentityClaims(token)
  const pairwiseSub = claims?.pairwise_sub ?? claims?.sub
  if (!claims || !pairwiseSub) return null

  const displayName =
    typeof claims.name === 'string' && claims.name.trim()
      ? claims.name.trim()
      : 'Google User'

  return withAuthUser({
    displayName,
    email: typeof claims.email === 'string' ? claims.email : undefined,
    emailVerified:
      typeof claims.email_verified === 'boolean'
        ? claims.email_verified
        : undefined,
    isAuthenticated: true,
    isGuest: false,
    picture: typeof claims.picture === 'string' ? claims.picture : undefined,
    provider: 'google',
    userId: `google:${pairwiseSub}`,
  })
}
