#!/usr/bin/env bun
/**
 * Forge Mobbin Pro reference fetcher.
 *
 * Calls Mobbin's reverse-engineered REST API at /api/content/search-screens
 * using the Supabase session cookie minted by `mobbin-mcp auth`
 * (~/.mobbin-mcp/auth.json). The cookie is the chunked `sb-<project>-auth-
 * token.0/.1/…` base64 form Mobbin's server expects; the access token is
 * refreshed automatically when within 60s of expiry.
 *
 * Returns concrete metadata (app name, screen patterns, screen elements,
 * screen URL) per (category, pattern) so each forge run can inject REAL
 * Mobbin Pro references — not a static cache.
 *
 * Falls back silently to '' on any failure so forge never breaks because
 * Mobbin is down / cookie expired.
 *
 * Originally ported from packages/ship-fast-engine/src/lib/mobbin-runtime.js
 * (commit 858ea92) — that copy was dropped during vanilla→root promotion;
 * this script re-installs it for the FORGE_SESSION pipeline.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir, tmpdir } from 'node:os'
import { createHash } from 'node:crypto'

const MOBBIN_BASE_URL = 'https://mobbin.com'
const SUPABASE_URL = 'https://ujasntkfphywizsdaapi.supabase.co'
const AUTH_FILE = join(homedir(), '.mobbin-mcp', 'auth.json')
const ANON_KEY_FILE = join(homedir(), '.mobbin-mcp', 'anon-key.json')
const CACHE_DIR = join(tmpdir(), 'ship-fast-forge-mobbin-cache')
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

const SUPABASE_COOKIE_PREFIX = 'sb-ujasntkfphywizsdaapi-auth-token'
const COOKIE_CHUNK_SIZE = 3180

// Mobbin currently uses Supabase publishable keys (sb_publishable_…), not the
// older eyJ… JWT-style anon keys. This constant is the build-time fallback we
// seed from when no cached key is found; mobbin-mcp@latest carries the same
// value. Refresh path self-heals if Mobbin rotates: scrape main-app-*.js for
// the literal sb_publishable_… token.
const FALLBACK_PUBLISHABLE_KEY = 'sb_publishable_YptnKskI90SD2g25sAvVxQ_tZltjYFE'

let _authCache = null
let _refreshPromise = null
let _anonKey = ''

function readAuthFromDisk() {
  if (!existsSync(AUTH_FILE)) return null
  try {
    return JSON.parse(readFileSync(AUTH_FILE, 'utf8'))
  } catch {
    return null
  }
}

function writeAuthToDisk(auth) {
  try {
    mkdirSync(dirname(AUTH_FILE), { recursive: true })
    writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2))
  } catch {}
}

async function fetchAnonKey() {
  if (_anonKey) return _anonKey

  // 1. Prefer the key mobbin-mcp persisted after its last discovery — fastest
  //    and avoids hitting Mobbin's site at all.
  if (existsSync(ANON_KEY_FILE)) {
    try {
      const data = JSON.parse(readFileSync(ANON_KEY_FILE, 'utf8'))
      if (typeof data.key === 'string' && data.key.startsWith('sb_publishable_')) {
        _anonKey = data.key
        return _anonKey
      }
    } catch {}
  }

  // 2. Scrape Mobbin's main-app chunk for the current sb_publishable_… key.
  //    Cache to disk so future processes (and mobbin-mcp itself) share it.
  try {
    const html = await fetch(`${MOBBIN_BASE_URL}/`).then((r) => r.text())
    const chunks = [...new Set([...html.matchAll(/\/_next\/static\/chunks\/main-app-[A-Za-z0-9_-]+\.js/g)].map((m) => m[0]))]
    for (const chunk of chunks) {
      const js = await fetch(`${MOBBIN_BASE_URL}${chunk}`).then((r) => r.text()).catch(() => '')
      if (!js) continue
      const match = js.match(/sb_publishable_[A-Za-z0-9_-]+/)
      if (match) {
        _anonKey = match[0]
        try {
          mkdirSync(dirname(ANON_KEY_FILE), { recursive: true })
          writeFileSync(ANON_KEY_FILE, JSON.stringify({ key: _anonKey, discoveredAt: Date.now() }, null, 2), { mode: 0o600 })
        } catch {}
        return _anonKey
      }
    }
  } catch {}

  // 3. Last-resort fallback to the build-time constant. mobbin-mcp ships the
  //    same value; if Supabase has rotated it since this file was written, the
  //    refresh call will 401 and the next process boot will rediscover.
  _anonKey = FALLBACK_PUBLISHABLE_KEY
  return _anonKey
}

async function refreshTokenIfNeeded() {
  if (_refreshPromise) return _refreshPromise
  if (!_authCache) _authCache = readAuthFromDisk()
  if (!_authCache?.refresh_token) return null

  const exp = Number(_authCache.expires_at || 0)
  const now = Math.floor(Date.now() / 1000)
  if (exp && exp - now > 60) return _authCache

  _refreshPromise = (async () => {
    try {
      const anonKey = await fetchAnonKey()
      if (!anonKey) return _authCache
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ refresh_token: _authCache.refresh_token }),
      })
      if (!res.ok) return _authCache
      const next = await res.json()
      _authCache = {
        ..._authCache,
        access_token: next.access_token,
        refresh_token: next.refresh_token || _authCache.refresh_token,
        expires_at: next.expires_at,
      }
      writeAuthToDisk(_authCache)
      return _authCache
    } finally {
      _refreshPromise = null
    }
  })()
  return _refreshPromise
}

async function buildCookieHeader() {
  const auth = await refreshTokenIfNeeded()
  if (!auth?.access_token) return ''
  const session = {
    access_token: auth.access_token,
    token_type: auth.token_type || 'bearer',
    expires_in: auth.expires_in || 3600,
    expires_at: auth.expires_at,
    refresh_token: auth.refresh_token,
    user: auth.user || null,
  }
  const value = 'base64-' + Buffer.from(JSON.stringify(session), 'utf8').toString('base64')
  const chunks = []
  for (let i = 0; i < value.length; i += COOKIE_CHUNK_SIZE) {
    chunks.push(value.slice(i, i + COOKIE_CHUNK_SIZE))
  }
  return chunks.map((c, i) => `${SUPABASE_COOKIE_PREFIX}.${i}=${c}`).join('; ')
}

function cacheKeyFor(payload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 24)
}

function cacheGet(key) {
  const f = join(CACHE_DIR, `${key}.json`)
  if (!existsSync(f)) return null
  try {
    const wrapped = JSON.parse(readFileSync(f, 'utf8'))
    if (Date.now() - wrapped.t > CACHE_TTL_MS) return null
    return wrapped.v
  } catch {
    return null
  }
}

function cacheSet(key, value) {
  try {
    mkdirSync(CACHE_DIR, { recursive: true })
    writeFileSync(join(CACHE_DIR, `${key}.json`), JSON.stringify({ t: Date.now(), v: value }))
  } catch {}
}

// Forge ships a B2B SaaS marketing homepage prompt. Mobbin's web taxonomy
// tags every product's main marketing/dashboard screen as `Home` (their
// "Landing Page" / "Hero Section" tags exist in the filter UI but return
// zero data on /search-screens — they're a different content surface).
// Defaults are tuned for the FORGE_DEFAULT_PROMPT (AI / Developer Tools /
// Productivity), overridable per run via env.
const DEFAULT_CATEGORIES = ['Developer Tools', 'AI', 'Productivity']
const DEFAULT_PATTERNS = ['Home']

function envList(name) {
  const raw = process.env[name]
  if (!raw) return null
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

/**
 * Fetch live Mobbin Pro references for a search query. Cached for 7 days.
 * Returns up to `limit` screens with { app, patterns, elements, screenUrl }.
 * Returns [] on auth/network/schema failure.
 */
export async function fetchMobbinReferences({
  platform = 'web',
  categories = DEFAULT_CATEGORIES,
  patterns = DEFAULT_PATTERNS,
  elements = null,
  keywords = null,
  limit = 6,
  sortBy = 'trending',
} = {}) {
  const payload = { platform, categories, patterns, elements, keywords, limit, sortBy }
  const key = cacheKeyFor(payload)
  const cached = cacheGet(key)
  if (cached) return cached

  const cookie = await buildCookieHeader()
  if (!cookie) return []

  try {
    const res = await fetch(`${MOBBIN_BASE_URL}/api/content/search-screens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        searchRequestId: '',
        filterOptions: {
          platform,
          screenPatterns: patterns,
          screenElements: elements,
          screenKeywords: keywords,
          appCategories: categories,
          hasAnimation: null,
        },
        paginationOptions: { pageSize: limit, pageIndex: 0, sortBy },
      }),
    })
    if (!res.ok) return []
    const json = await res.json()
    const items = Array.isArray(json?.value?.data)
      ? json.value.data
      : Array.isArray(json?.data)
        ? json.data
        : []
    const results = items.slice(0, limit).map((entry) => ({
      app: entry.appName || entry.app?.name || '',
      patterns: entry.screenPatterns || entry.patterns || [],
      elements: entry.screenElements || entry.elements || [],
      screenUrl: entry.screenUrl || entry.url || '',
    }))
    cacheSet(key, results)
    return results
  } catch {
    return []
  }
}

/**
 * Prefetch a composite reference set for the forge prompt: one trending
 * Home-pattern lookup per category so the model gets a wider, named anchor
 * set (e.g. AI: ElevenLabs / Clay / Hume; Developer Tools: Linear /
 * Cloudflare / Databricks). All requests share the 7-day on-disk cache.
 */
export async function prefetchForgeMobbin({
  platform = 'web',
  categories = null,
  limitPerCategory = 5,
} = {}) {
  const cats = envList('FORGE_MOBBIN_CATEGORIES') || categories || DEFAULT_CATEGORIES
  const patterns = envList('FORGE_MOBBIN_PATTERN') || DEFAULT_PATTERNS
  const perCategoryResults = await Promise.all(
    cats.map((cat) =>
      fetchMobbinReferences({
        platform,
        categories: [cat],
        patterns,
        limit: limitPerCategory,
      }),
    ),
  )
  const byCategory = {}
  cats.forEach((cat, i) => {
    byCategory[cat] = perCategoryResults[i] || []
  })
  return { categories: cats, patterns, byCategory }
}

/**
 * Render a markdown reference block from prefetched Mobbin data — drops into
 * the forge prompt directly. Kept compact: app names + pattern/element
 * vocabulary, no URLs (the model doesn't fetch them, and they bloat tokens).
 */
export function forgeMobbinBlock(data) {
  if (!data) return ''
  const { byCategory = {}, categories = [] } = data
  const hasAny = Object.values(byCategory).some((arr) => arr?.length)
  if (!hasAny) return ''

  const lines = []
  lines.push('')
  lines.push('── MOBBIN PRO REFERENCE TIER ──')
  lines.push(
    `Real apps trending on Mobbin Pro right now across {${categories.join(', ')}}. Use these specific product names as composition + tone anchors; the model already knows their public marketing pages. Do NOT copy any single one literally.`,
  )
  for (const [cat, refs] of Object.entries(byCategory)) {
    if (!refs?.length) continue
    const apps = [...new Set(refs.map((r) => r.app).filter(Boolean))].slice(0, 5)
    const elems = [...new Set(refs.flatMap((r) => r.elements || []))].slice(0, 8)
    const tail = elems.length ? ` — elements: ${elems.join(', ')}` : ''
    lines.push(`${cat}: ${apps.join(', ')}${tail}`)
  }
  lines.push(
    'Match the structural rigor and copy specificity of those products. Hit reference-tier density without literal copy.',
  )
  return lines.join('\n')
}

/**
 * Per-iter Mobbin block. Rotates the FEATURED category across iters so the
 * 50-iter loop sees real anchor diversity instead of one shared block — iter
 * 0 leads with the first category's top app, iter 1 the second, etc. The
 * full byCategory set is still summarised below for context, but the lead
 * app gets a stronger callout so the model's attention lands on a different
 * concrete product each iteration.
 */
export function mobbinIterBlock(data, iter) {
  if (!data) return ''
  const { byCategory = {}, categories = [] } = data
  const nonEmpty = categories.filter((c) => byCategory[c]?.length)
  if (!nonEmpty.length) return ''

  const featured = nonEmpty[iter % nonEmpty.length]
  const refs = byCategory[featured]
  const featuredApp = refs[iter % refs.length]
  const elems = [...new Set(refs.flatMap((r) => r.elements || []))].slice(0, 8)

  const lines = []
  lines.push('')
  lines.push('── MOBBIN PRO REFERENCE TIER ──')
  lines.push(
    `FEATURED ANCHOR (iter ${iter + 1}): ${featuredApp.app} (${featured}). Channel that product's marketing-page tone, hierarchy, and copy specificity — do NOT copy literally.`,
  )
  if (elems.length) {
    lines.push(`${featured} element vocabulary to weave in: ${elems.join(', ')}`)
  }
  // Compact summary of the rest so the model has wider context but the
  // featured app gets primary attention.
  const otherLines = []
  for (const cat of nonEmpty) {
    if (cat === featured) continue
    const apps = [...new Set(byCategory[cat].map((r) => r.app).filter(Boolean))].slice(0, 4)
    if (apps.length) otherLines.push(`${cat}: ${apps.join(', ')}`)
  }
  if (otherLines.length) {
    lines.push(`Other trending Mobbin Pro anchors: ${otherLines.join(' | ')}`)
  }
  lines.push(
    'Match this density and copy specificity — write your own art direction at their structural rigor.',
  )
  return lines.join('\n')
}

/**
 * Score an HTML output for how many of the element-vocabulary names that
 * Mobbin's trending Pro screens surface actually appear in the generated
 * markup (case-insensitive, whole-word match). Returns
 * { hits, total, ratio, hitNames }. Info-only — not a blocking gate.
 */
export function scoreMobbinCoverage(html, data) {
  if (!html || !data) return { hits: 0, total: 0, ratio: 0, hitNames: [] }
  const { byCategory = {} } = data
  const allElems = [
    ...new Set(
      Object.values(byCategory)
        .flat()
        .flatMap((r) => r?.elements || [])
        .filter(Boolean),
    ),
  ]
  const hitNames = []
  const text = html.toLowerCase()
  for (const elem of allElems) {
    const needle = elem.toLowerCase()
    // Match the bare phrase OR the kebab-case form (e.g. "Top Navigation Bar" → "top-navigation-bar")
    const kebab = needle.replace(/\s+/g, '-')
    if (text.includes(needle) || text.includes(kebab)) hitNames.push(elem)
  }
  return {
    hits: hitNames.length,
    total: allElems.length,
    ratio: allElems.length ? hitNames.length / allElems.length : 0,
    hitNames,
  }
}

// CLI: bun scripts/forge-mobbin.mjs  →  prints the block (useful for debug)
if (import.meta.url === `file://${process.argv[1]}`) {
  const t0 = Date.now()
  const data = await prefetchForgeMobbin()
  const ms = Date.now() - t0
  const block = forgeMobbinBlock(data)
  if (!block) {
    console.error(`[forge-mobbin] no data (auth missing or fetch failed) — ${ms}ms`)
    process.exit(1)
  }
  console.error(`[forge-mobbin] fetched in ${ms}ms`)
  console.log(block)
}
