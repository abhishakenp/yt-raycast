/**
 * Mobbin Pro Supabase session — read ~/.mobbin-mcp/auth.json or import browser cookies.
 * Live fetch uses working Mobbin routes (popular-apps, search-bar, searchable-apps).
 * The legacy /api/content/search-screens route returns 404 as of 2026-05.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

export const MOBBIN_SUPABASE_URL = 'https://ujasntkfphywizsdaapi.supabase.co'
export const MOBBIN_BASE_URL = 'https://mobbin.com'
export const SUPABASE_COOKIE_PREFIX = 'sb-ujasntkfphywizsdaapi-auth-token'
export const DEFAULT_AUTH_FILE = join(homedir(), '.mobbin-mcp', 'auth.json')
export const COOKIE_CHUNK_SIZE = 3180

const FALLBACK_PUBLISHABLE_KEY =
  'sb_publishable_YptnKskI90SD2g25sAvVxQ_tZltjYFE'
const SEARCHABLE_APPS_TTL_MS = 60 * 60 * 1000

interface MobbinAuth {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  expires_at?: number
  user?: any
  importedAt?: number
  source?: string
}

interface MobbinSession {
  access_token?: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  expires_at?: number
  user?: any
}

let _authCache: MobbinAuth | null = null
let _refreshPromise: Promise<MobbinAuth | null> | null = null
let _anonKey = ''
const _searchableAppsCache = new Map<string, { at: number; apps: any[] }>()

export function authFilePath() {
  return process.env.MOBBIN_AUTH_FILE || DEFAULT_AUTH_FILE
}

export function readAuthFromDisk(file = authFilePath()) {
  if (!existsSync(file)) return null
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

export function writeAuthToDisk(auth: MobbinAuth, file = authFilePath()) {
  try {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, JSON.stringify(auth, null, 2), { mode: 0o600 })
    _authCache = auth
  } catch {
    /* best-effort */
  }
}

/**
 * Parse a browser Cookie header (document.cookie export) into Supabase auth JSON.
 * Expects chunked cookies: sb-ujasntkfphywizsdaapi-auth-token.0=base64-...
 */
export function importSessionFromBrowserCookie(cookieHeader: string) {
  const raw = String(cookieHeader || '').trim()
  if (!raw) return null

  const pairs = raw
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
  const chunks: { index: number; value: string }[] = []
  for (const pair of pairs) {
    const eq = pair.indexOf('=')
    if (eq <= 0) continue
    const name = pair.slice(0, eq).trim()
    const value = pair.slice(eq + 1).trim()
    const match = name.match(new RegExp(`^${SUPABASE_COOKIE_PREFIX}\\.(\\d+)$`))
    if (match) chunks.push({ index: Number(match[1]), value })
  }
  if (!chunks.length) return null

  chunks.sort((a, b) => a.index - b.index)
  const joined = chunks.map((c) => c.value).join('')
  const encoded = joined.startsWith('base64-')
    ? joined.slice('base64-'.length)
    : joined
  let session: MobbinSession
  try {
    session = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))
  } catch {
    return null
  }
  if (!session?.access_token) return null

  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token || '',
    token_type: session.token_type || 'bearer',
    expires_in: session.expires_in || 3600,
    expires_at: session.expires_at || Math.floor(Date.now() / 1000) + 3600,
    user: session.user || null,
    importedAt: Date.now(),
    source: 'browser-cookie',
  }
}

async function fetchAnonKey() {
  if (_anonKey) return _anonKey
  _anonKey = process.env.MOBBIN_SUPABASE_ANON_KEY || FALLBACK_PUBLISHABLE_KEY
  return _anonKey
}

async function refreshTokenIfNeeded() {
  if (_refreshPromise) return _refreshPromise
  if (!_authCache) _authCache = readAuthFromDisk()
  if (!_authCache?.refresh_token) return _authCache

  const exp = Number(_authCache.expires_at || 0)
  const now = Math.floor(Date.now() / 1000)
  if (exp && exp - now > 60) return _authCache

  _refreshPromise = (async () => {
    try {
      const anonKey = await fetchAnonKey()
      const res = await fetch(
        `${MOBBIN_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ refresh_token: _authCache.refresh_token }),
        },
      )
      if (!res.ok) return _authCache
      const next = await res.json()
      _authCache = {
        ..._authCache,
        access_token: next.access_token,
        refresh_token: next.refresh_token || _authCache.refresh_token,
        expires_at: next.expires_at,
        expires_in: next.expires_in || _authCache.expires_in,
      }
      writeAuthToDisk(_authCache)
      return _authCache
    } finally {
      _refreshPromise = null
    }
  })()
  return _refreshPromise
}

function sessionToCookieHeader(auth: MobbinAuth | null): string {
  if (!auth?.access_token) return ''
  const session = {
    access_token: auth.access_token,
    token_type: auth.token_type || 'bearer',
    expires_in: auth.expires_in || 3600,
    expires_at: auth.expires_at,
    refresh_token: auth.refresh_token,
    user: auth.user || null,
  }
  const value = `base64-${Buffer.from(JSON.stringify(session), 'utf8').toString('base64')}`
  const chunks = []
  for (let i = 0; i < value.length; i += COOKIE_CHUNK_SIZE) {
    chunks.push(value.slice(i, i + COOKIE_CHUNK_SIZE))
  }
  return chunks.map((c, i) => `${SUPABASE_COOKIE_PREFIX}.${i}=${c}`).join('; ')
}

/** Build Cookie header for mobbin.com API — auth file, env cookie, or MOBBIN_BROWSER_COOKIE. */
export async function buildMobbinCookieHeader() {
  const envCookie = process.env.MOBBIN_BROWSER_COOKIE
  if (envCookie) {
    const imported = importSessionFromBrowserCookie(envCookie)
    if (imported?.access_token) {
      _authCache = imported
      return sessionToCookieHeader(imported)
    }
  }

  const auth = await refreshTokenIfNeeded()
  return sessionToCookieHeader(auth)
}

function mobbinApiHeaders(cookie: string): Record<string, string> {
  return {
    Cookie: cookie,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Origin: MOBBIN_BASE_URL,
    Referer: `${MOBBIN_BASE_URL}/`,
    'User-Agent':
      process.env.MOBBIN_USER_AGENT ||
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  }
}

async function mobbinApiFetch(
  path: string,
  { method = 'GET', body }: { method?: string; body?: any } = {},
) {
  const cookie = await buildMobbinCookieHeader()
  if (!cookie) return null

  const headers = mobbinApiHeaders(cookie)
  if (body === undefined) delete headers['Content-Type']

  try {
    const res = await fetch(`${MOBBIN_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function normAppName(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function mapPreviewScreen(appName: string, screen: any) {
  return {
    app: appName,
    patterns: [],
    elements: [],
    screenUrl: screen?.screenUrl || screen?.url || '',
    screenId: screen?.id || '',
  }
}

/** Fetch popular apps grouped by category with preview screenshots. */
export async function fetchPopularMobbinApps({
  platform = 'web',
  limitPerCategory = 4,
} = {}) {
  const json = await mobbinApiFetch(
    '/api/popular-apps/fetch-popular-apps-with-preview-screens',
    {
      method: 'POST',
      body: { platform, limitPerCategory },
    },
  )
  const value = json?.value
  if (!value || typeof value !== 'object') return []
  return Object.values(value).flat().filter(Boolean)
}

function flattenPopularScreens(apps: any[], limit: number) {
  const out: any[] = []
  const seen = new Set()
  for (const entry of apps) {
    const appName = entry?.app_name || entry?.appName || ''
    const previews = Array.isArray(entry?.preview_screens)
      ? entry.preview_screens
      : Array.isArray(entry?.previewScreens)
        ? entry.previewScreens
        : []
    for (const screen of previews) {
      const key = `${appName}:${screen?.id || screen?.screenUrl || ''}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(mapPreviewScreen(appName, screen))
      if (out.length >= limit) return out
    }
  }
  return out
}

/** Cached searchable app index for a platform (~1000 apps). */
export async function fetchSearchableApps(platform = 'web') {
  const cached = _searchableAppsCache.get(platform)
  if (cached && Date.now() - cached.at < SEARCHABLE_APPS_TTL_MS)
    return cached.apps

  const json = await mobbinApiFetch(`/api/searchable-apps/${platform}`)
  const apps = Array.isArray(json) ? json : []
  _searchableAppsCache.set(platform, { at: Date.now(), apps })
  return apps
}

/** Autocomplete app lookup — returns first matching app id. */
export async function autocompleteMobbinApp(
  query: string,
  { platform = 'web' }: { platform?: string } = {},
) {
  const json = await mobbinApiFetch('/api/search-bar/search', {
    method: 'POST',
    body: {
      query: String(query || '').trim(),
      experience: 'apps',
      platform,
    },
  })
  const primary = json?.value?.primary
  if (!Array.isArray(primary) || !primary.length) return null
  const match = primary.find((entry) => entry?.type === 'app' && entry?.id)
  return match?.id || null
}

/** Resolve a named app via searchable index + autocomplete fallback. */
export async function resolveMobbinAppByName(
  appName: string,
  { platform = 'web' }: { platform?: string } = {},
) {
  const name = String(appName || '').trim()
  if (!name) return null

  const norm = normAppName(name)
  const apps = await fetchSearchableApps(platform)
  const direct = apps.find((app) => normAppName(app?.appName) === norm)
  if (direct) return direct

  const fuzzy = apps.find((app) => {
    const candidate = normAppName(app?.appName)
    return candidate.includes(norm) || norm.includes(candidate)
  })
  if (fuzzy) return fuzzy

  const appId = await autocompleteMobbinApp(name, { platform })
  if (!appId) return null
  return apps.find((app) => app?.id === appId) || null
}

/**
 * Trending/preview screens from popular apps (replaces broken search-screens).
 * Returns one row per preview screen, not per app.
 */
export async function fetchMobbinScreens({
  platform = 'web',
  limit = 6,
  limitPerCategory = 4,
} = {}) {
  const apps = await fetchPopularMobbinApps({ platform, limitPerCategory })
  if (!apps.length) return []
  return flattenPopularScreens(apps, limit)
}

/** Validate Pro session by hitting popular-apps and returning sample app names. */
export async function validateMobbinSession({
  platform = 'web',
  limitPerCategory = 2,
} = {}) {
  const apps = await fetchPopularMobbinApps({ platform, limitPerCategory })
  if (!apps.length) return { ok: false, apps: [], screens: [] }

  const sampleApps = [
    ...new Set(
      apps
        .map((entry: unknown) => {
          const e = entry as Record<string, unknown>
          return e?.app_name ?? e?.appName
        })
        .filter((v): v is string => typeof v === 'string'),
    ),
  ].slice(0, 6)
  const screens = flattenPopularScreens(apps, 3)
  return { ok: true, apps: sampleApps, screens }
}

/** Pick live Mobbin preview screens for a named anchor app (best-effort). */
export async function fetchLiveScreensForApp(
  appName: string,
  { limit = 3, platform = 'web' }: { limit?: number; platform?: string } = {},
) {
  const name = String(appName || '').trim()
  if (!name) return []

  const app = await resolveMobbinAppByName(name, { platform })
  if (!app) return []

  const previews = Array.isArray(app?.previewScreens) ? app.previewScreens : []
  return previews
    .slice(0, limit)
    .map((screen: unknown) => mapPreviewScreen(app?.appName || name, screen))
}

export async function mobbinSessionStatus() {
  const cookie = await buildMobbinCookieHeader()
  return {
    ok: Boolean(cookie),
    authFile: authFilePath(),
    authFileExists: existsSync(authFilePath()),
    envCookie: Boolean(process.env.MOBBIN_BROWSER_COOKIE),
  }
}

export function isMobbinLiveEnabled() {
  return (
    process.env.SHIPFAST_MOBBIN_LIVE === '1' ||
    process.env.SHIPFAST_MOBBIN_LIVE === 'true'
  )
}
