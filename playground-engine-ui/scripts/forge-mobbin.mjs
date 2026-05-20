#!/usr/bin/env bun
/**
 * Forge Mobbin Pro DNA layer (v4).
 *
 * v3 (the version this replaces) only carried app names + flat element-name lists
 * into the prompt. gpt-oss-120b saw "Linear" as a string and fell back to its
 * generic interpretation of B2B SaaS, which is why the user reported the loop
 * output didn't actually inherit Mobbin's visual signature.
 *
 * v4 fixes that by carrying three concrete layers per featured anchor:
 *
 *   1. Live palette (5 hex samples) extracted from each Mobbin Pro screenshot
 *      via a Playwright-driven canvas color counter. Sampled at bytescale
 *      thumbnail size (64×64) so 6 screens × N categories is < 800ms.
 *
 *   2. Curated per-app DNA from @ship-fast/engine/data/mobbin-dna.json — typography register,
 *      composition signature, copy register, doctrine moves, anti-patterns.
 *      For apps not in the bank we synthesize a palette-only descriptor.
 *
 *   3. A baked Mobbin Pro doctrine block (mobbinDoctrineBlock) that drops
 *      into the *system prompt* — universal moves observed across the
 *      trending B2B SaaS Pro corpus. Stays constant across iters so the
 *      model never re-learns the rules per call.
 *
 * Plus a smarter scoreMobbinCoverage that measures palette + DNA-keyword
 * inheritance, not just verbatim element substrings.
 *
 * Falls back silently to '' on any failure so forge never breaks because
 * Mobbin is down / cookie expired / palette extraction failed.
 *
 * Originally ported from packages/ship-fast-engine/src/lib/mobbin-runtime.js
 * (commit 858ea92) — that copy was dropped during vanilla→root promotion;
 * this script re-installs it for the FORGE_SESSION pipeline.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir, tmpdir } from 'node:os'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import {
  COPY_EXAMPLES,
  anchorAvoidsAurora as engineAnchorAvoidsAurora,
  detectVerbatimAnchorCopy as engineDetectVerbatimAnchorCopy,
  mobbinDoctrineBlock as engineMobbinDoctrineBlock,
  resolveCopyExamples as engineResolveCopyExamples,
  resolveDna as engineResolveDna,
  synthesizeDna as engineSynthesizeDna,
} from '@ship-fast/engine/lib/mobbin/index.js'

// v1 production port: the canonical DNA bank + pure helpers now live in
// @ship-fast/engine/lib/mobbin. This script keeps only the forge-specific
// live-fetch layer (Supabase auth, Playwright palette extraction, multi-anchor
// iter rotation, audit relaxation). Lifted helpers are re-exported below so
// existing forge-loop / forge-once import sites keep working unchanged.
export {
  COPY_EXAMPLES,
}
export const resolveDna = engineResolveDna
export const resolveCopyExamples = engineResolveCopyExamples
export const mobbinDoctrineBlock = engineMobbinDoctrineBlock
export const anchorAvoidsAurora = engineAnchorAvoidsAurora
export const detectVerbatimAnchorCopy = engineDetectVerbatimAnchorCopy

const MOBBIN_BASE_URL = 'https://mobbin.com'
const SUPABASE_URL = 'https://ujasntkfphywizsdaapi.supabase.co'
const AUTH_FILE = join(homedir(), '.mobbin-mcp', 'auth.json')
const ANON_KEY_FILE = join(homedir(), '.mobbin-mcp', 'anon-key.json')
const CACHE_DIR = join(tmpdir(), 'ship-fast-forge-mobbin-cache')
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

const SUPABASE_COOKIE_PREFIX = 'sb-ujasntkfphywizsdaapi-auth-token'
const COOKIE_CHUNK_SIZE = 3180

// Bytescale CDN base — mirrors mobbin-mcp/dist/constants.js. Supabase storage URLs
// from search-screens are not directly fetchable; the CDN equivalent supports
// arbitrary `?w=` resizing which gives us a cheap 64px thumbnail for palette sampling.
const BYTESCALE_CDN_BASE = 'https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod'
const SUPABASE_STORAGE_PREFIX = '/storage/v1/object/public/'

// Mobbin currently uses Supabase publishable keys (sb_publishable_…), not the
// older eyJ… JWT-style anon keys. This constant is the build-time fallback we
// seed from when no cached key is found; mobbin-mcp@latest carries the same
// value. Refresh path self-heals if Mobbin rotates: scrape main-app-*.js for
// the literal sb_publishable_… token.
const FALLBACK_PUBLISHABLE_KEY = 'sb_publishable_YptnKskI90SD2g25sAvVxQ_tZltjYFE'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

  if (existsSync(ANON_KEY_FILE)) {
    try {
      const data = JSON.parse(readFileSync(ANON_KEY_FILE, 'utf8'))
      if (typeof data.key === 'string' && data.key.startsWith('sb_publishable_')) {
        _anonKey = data.key
        return _anonKey
      }
    } catch {}
  }

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

/**
 * Convert a Mobbin Supabase storage URL into a bytescale CDN URL at the
 * requested width. Mirrors mobbin-mcp's toCdnUrl(). Used for cheap thumbnail
 * fetches when sampling palettes.
 */
export function toBytescaleThumb(screenUrl, width = 64) {
  if (!screenUrl) return ''
  try {
    const parsed = new URL(screenUrl)
    if (parsed.hostname === 'bytescale.mobbin.com') {
      return screenUrl.replace(/\?.*$/, '') + `?f=webp&w=${width}&q=70&fit=shrink-cover`
    }
    const idx = parsed.pathname.indexOf(SUPABASE_STORAGE_PREFIX)
    if (idx === -1) {
      // v8: pass through any http(s) URL unchanged so fixture-supplied
      // reference image URLs (e.g. previously-captured screenshots, public
      // marketing-page CDN URLs) work without bytescale routing.
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return screenUrl
      return ''
    }
    const storagePath = parsed.pathname.slice(idx + SUPABASE_STORAGE_PREFIX.length)
    return `${BYTESCALE_CDN_BASE}/${storagePath}?f=webp&w=${width}&q=70&fit=shrink-cover`
  } catch {
    return ''
  }
}

// v7: expanded default category coverage. The forge now rotates the featured
// anchor across 8 B2B-SaaS-relevant Mobbin categories so a 50-iter loop
// surfaces design DNA from finance / communication / design / marketing /
// data in addition to the original DevTools/AI/Productivity slice. Each
// category fetches `limitPerCategory` (default 5) trending Home-pattern
// screens, all share the 7-day disk cache, so adding categories costs ~1
// extra API call per category per cold run and ~0 on warm runs.
const DEFAULT_CATEGORIES = [
  'Developer Tools',
  'AI',
  'Productivity',
  'Finance',
  'Communication',
  'Design',
  'Marketing',
  'Data & Analytics',
]
const DEFAULT_PATTERNS = ['Home']

function envList(name) {
  const raw = process.env[name]
  if (!raw) return null
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

/**
 * Fetch live Mobbin Pro references for a search query. Cached for 7 days.
 * Returns up to `limit` screens with { app, patterns, elements, screenUrl, dimensions }.
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
  const payload = { platform, categories, patterns, elements, keywords, limit, sortBy, v: 4 }
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
      dimensions:
        entry.dimensions ||
        (entry.width && entry.height ? { width: entry.width, height: entry.height } : null),
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
 *
 * If `palettesByUrl` is provided (from extractMobbinPalettes), each ref
 * also carries .palette[] — the dominant hex colors sampled from that
 * screen's bytescale thumbnail. Otherwise .palette stays empty and the
 * iter block falls back to DNA-only descriptors.
 */
export async function prefetchForgeMobbin({
  platform = 'web',
  categories = null,
  limitPerCategory = 5,
} = {}) {
  // v8: fixture-file override. When FORGE_MOBBIN_DATA_FILE points at a JSON
  // file shaped like the prefetch return value, skip the live API entirely
  // and load the fixture. Lets the v7 inheritance path be exercised when
  // Mobbin's Supabase refresh token has been exhausted (common when a
  // separate process consumed the single-use refresh), or for deterministic
  // testing. The fixture's screenUrls can still point at the public bytescale
  // CDN, so the vision-judge reference image fetch continues to work.
  const fixtureFile = process.env.FORGE_MOBBIN_DATA_FILE
  if (fixtureFile && existsSync(fixtureFile)) {
    try {
      const fixture = JSON.parse(readFileSync(fixtureFile, 'utf8'))
      if (fixture?.byCategory && fixture?.categories) {
        return {
          categories: fixture.categories,
          patterns: fixture.patterns || DEFAULT_PATTERNS,
          byCategory: fixture.byCategory,
          platform: fixture.platform || platform,
          fromFixture: true,
        }
      }
    } catch {}
  }
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
  return { categories: cats, patterns, byCategory, platform }
}

/**
 * Sample dominant hex colors from each ref's screen thumbnail using a
 * Playwright canvas. Mutates each ref in place adding .palette[]. Returns
 * the (mutated) data for chaining.
 *
 * Cached by screen URL into the same on-disk cache as references; once a
 * palette is sampled it's reusable across all forge runs for 7 days.
 *
 * Pass a shared Playwright Browser instance (forge-loop already launches one
 * for the render audit); we spin up a single dedicated page and reuse it
 * across all screens in the batch. Per-screen cost ≈ 60-120ms; 15 screens
 * ≈ 1-2s — once per run, then cached.
 *
 * Falls back silently per-screen — a failed extraction leaves .palette empty
 * and the iter block degrades to DNA-only.
 */
export async function extractMobbinPalettes(data, browser, { maxColors = 5, thumbWidth = 64 } = {}) {
  if (!data || !browser) return data
  const allRefs = Object.values(data.byCategory || {}).flat()
  if (!allRefs.length) return data

  const seen = new Set()
  const todo = []
  for (const ref of allRefs) {
    if (!ref?.screenUrl) continue
    if (seen.has(ref.screenUrl)) continue
    seen.add(ref.screenUrl)
    // Check disk cache first
    const ckey = cacheKeyFor({ palette: ref.screenUrl, v: 4 })
    const cached = cacheGet(ckey)
    if (cached?.palette) {
      ref.palette = cached.palette
      continue
    }
    todo.push({ ref, ckey })
  }

  if (!todo.length) {
    // Hydrate palette onto siblings sharing the same URL
    for (const ref of allRefs) {
      if (ref.palette) continue
      const sib = allRefs.find((r) => r.screenUrl === ref.screenUrl && r.palette)
      if (sib?.palette) ref.palette = sib.palette
    }
    return data
  }

  const ctx = await browser.newContext({ viewport: { width: 100, height: 100 } })
  const page = await ctx.newPage()
  try {
    await page.setContent(
      `<!DOCTYPE html><html><body><canvas id="c" width="${thumbWidth}" height="${thumbWidth}"></canvas></body></html>`,
    )
    for (const { ref, ckey } of todo) {
      const thumbUrl = toBytescaleThumb(ref.screenUrl, thumbWidth)
      if (!thumbUrl) continue
      try {
        const palette = await page.evaluate(
          async ({ url, width, maxColors }) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            await new Promise((res, rej) => {
              img.onload = res
              img.onerror = rej
              img.src = url
            })
            const canvas = document.getElementById('c')
            canvas.width = width
            canvas.height = width
            const cctx = canvas.getContext('2d', { willReadFrequently: true })
            cctx.clearRect(0, 0, width, width)
            cctx.drawImage(img, 0, 0, width, width)
            const { data } = cctx.getImageData(0, 0, width, width)
            const q = 16
            const max = 240
            const counts = new Map()
            for (let i = 0; i < data.length; i += 4) {
              const a = data[i + 3]
              if (a < 200) continue
              const r = Math.min(Math.round(data[i] / q) * q, max)
              const g = Math.min(Math.round(data[i + 1] / q) * q, max)
              const b = Math.min(Math.round(data[i + 2] / q) * q, max)
              const hex =
                '#' +
                r.toString(16).padStart(2, '0') +
                g.toString(16).padStart(2, '0') +
                b.toString(16).padStart(2, '0')
              counts.set(hex, (counts.get(hex) || 0) + 1)
            }
            // v5: bias sampling so we always keep a saturated brand accent.
            // Plain frequency sort buries the brand color under page chrome
            // (whites/grays/near-blacks). We pick: top-2 by frequency for the
            // background+text roles, then force-include the most-frequent
            // SATURATED color (sat = max-min > 50 AND not near-extreme luminance)
            // as the brand-accent slot, then fill remaining slots by frequency
            // skipping already-chosen colors. Result: hex[0..1] are chrome,
            // hex[2] is the actual brand accent.
            const entries = [...counts.entries()].sort((a, b) => b[1] - a[1])
            if (!entries.length) return []
            const parse = (hex) => ({
              r: parseInt(hex.slice(1, 3), 16),
              g: parseInt(hex.slice(3, 5), 16),
              b: parseInt(hex.slice(5, 7), 16),
            })
            const sat = (hex) => {
              const { r, g, b } = parse(hex)
              return Math.max(r, g, b) - Math.min(r, g, b)
            }
            const lum = (hex) => {
              const { r, g, b } = parse(hex)
              return (r + g + b) / 3
            }
            const out = []
            // Slot 1: most-frequent overall (almost always page bg)
            out.push(entries[0][0])
            // Slot 2: next-most-frequent in a clearly different luminance bucket
            const bgLum = lum(out[0])
            const slot2 = entries.find(
              ([h]) => !out.includes(h) && Math.abs(lum(h) - bgLum) > 60,
            ) || entries.find(([h]) => !out.includes(h))
            if (slot2) out.push(slot2[0])
            // Slot 3: most-frequent SATURATED color — the brand accent slot.
            // We deliberately scan ALL entries (not just top-N) so a small but
            // visually-loud accent (e.g. Linear's violet on a mostly-black
            // dashboard) doesn't get missed.
            const slot3 = entries.find(
              ([h]) => !out.includes(h) && sat(h) > 50 && lum(h) > 40 && lum(h) < 220,
            )
            if (slot3) out.push(slot3[0])
            // Remaining slots: next-most-frequent, skipping duplicates and
            // colors that are too close to already-picked ones (Δlum < 12).
            for (const [h] of entries) {
              if (out.length >= maxColors) break
              if (out.includes(h)) continue
              if (out.some((p) => Math.abs(lum(p) - lum(h)) < 12 && Math.abs(sat(p) - sat(h)) < 20)) {
                continue
              }
              out.push(h)
            }
            return out.slice(0, maxColors)
          },
          { url: thumbUrl, width: thumbWidth, maxColors },
        )
        if (Array.isArray(palette) && palette.length) {
          ref.palette = palette
          cacheSet(ckey, { palette, sampledAt: Date.now() })
        }
      } catch {
        // leave .palette empty; downstream falls back to DNA-only
      }
    }
  } finally {
    await page.close().catch(() => {})
    await ctx.close().catch(() => {})
  }

  // Hydrate palette onto refs that share the same screenUrl
  for (const ref of allRefs) {
    if (ref.palette) continue
    const sib = allRefs.find((r) => r.screenUrl === ref.screenUrl && r.palette)
    if (sib?.palette) ref.palette = sib.palette
  }
  return data
}

/**
 * Fetch the Mobbin Pro anchor screenshot at the requested width and return
 * `{ b64, mimeType }` for embedding in a multi-image vision-judge call. The
 * bytescale CDN is public (no auth required), so this works regardless of
 * Mobbin Supabase auth state — as long as a screenUrl was captured during
 * prefetch, the image is reachable. Caches the base64 payload on disk
 * keyed by (screenUrl, width) so 50-iter loops only fetch once per anchor.
 *
 * Returns null on failure so the vision judge degrades to single-image mode.
 */
export async function fetchMobbinScreenImageB64(screenUrl, width = 512) {
  if (!screenUrl) return null
  const ckey = cacheKeyFor({ screenImg: screenUrl, width, v: 5 })
  const cached = cacheGet(ckey)
  if (cached?.b64) return cached
  // v8: file:// URLs short-circuit straight to disk read so fixture-supplied
  // reference paths (e.g. a previous forge run's shot.png) work without
  // requiring a live HTTP server.
  if (screenUrl.startsWith('file://')) {
    try {
      const p = screenUrl.slice('file://'.length)
      if (!existsSync(p)) return null
      const buf = readFileSync(p)
      const ext = p.split('.').pop()?.toLowerCase()
      const mimeType =
        ext === 'png'
          ? 'image/png'
          : ext === 'jpg' || ext === 'jpeg'
            ? 'image/jpeg'
            : ext === 'webp'
              ? 'image/webp'
              : 'image/png'
      const payload = { b64: buf.toString('base64'), mimeType }
      cacheSet(ckey, payload)
      return payload
    } catch {
      return null
    }
  }
  const thumbUrl = toBytescaleThumb(screenUrl, width)
  if (!thumbUrl) return null
  try {
    const res = await fetch(thumbUrl)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (!buf.length) return null
    // bytescale ?f=webp returns webp; Llama-4 Scout accepts image/webp.
    const mimeType = res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/webp'
    const payload = { b64: buf.toString('base64'), mimeType }
    cacheSet(ckey, payload)
    return payload
  } catch {
    return null
  }
}

// COPY_EXAMPLES, resolveCopyExamples, resolveDna, synthesizeDna — sourced
// from @ship-fast/engine/lib/mobbin (re-exported at top of file).
const synthesizeDna = engineSynthesizeDna

function formatPaletteLine(palette = []) {
  if (!palette.length) return ''
  return palette.slice(0, 5).join(', ')
}

function paletteRoleHint(palette = []) {
  const norm = palette.map((h) => h.toLowerCase()).filter((h) => /^#[0-9a-f]{6}$/.test(h))
  if (norm.length < 3) return '' // degenerate — let the raw palette line stand on its own
  const sorted = [...norm].sort((a, b) => {
    const la =
      parseInt(a.slice(1, 3), 16) + parseInt(a.slice(3, 5), 16) + parseInt(a.slice(5, 7), 16)
    const lb =
      parseInt(b.slice(1, 3), 16) + parseInt(b.slice(3, 5), 16) + parseInt(b.slice(5, 7), 16)
    return la - lb
  })
  const background = sorted[0]
  const body = sorted[sorted.length - 1]
  const surface = sorted[1]
  // Most-saturated remaining hex becomes primary; falls back to a mid-luminance
  // entry if nothing is saturated enough.
  const primary =
    norm
      .filter((h) => h !== background && h !== surface && h !== body)
      .find((h) => {
        const r = parseInt(h.slice(1, 3), 16)
        const g = parseInt(h.slice(3, 5), 16)
        const b = parseInt(h.slice(5, 7), 16)
        return Math.max(r, g, b) - Math.min(r, g, b) > 40
      }) ||
    sorted[Math.floor(sorted.length / 2)]
  if (primary === background || primary === surface || primary === body) {
    return `background=${background}, surface=${surface}, body=${body} (no distinct accent in palette — derive a complementary primary)`
  }
  return `background=${background}, surface=${surface}, primary=${primary}, body=${body}`
}

function dnaImperatives(dna, app) {
  if (!dna) return []
  const out = []
  if (dna.display) out.push(`Display typography: ${dna.display}`)
  if (dna.body) out.push(`Body typography: ${dna.body}`)
  if (dna.mono) out.push(`Mono typography: ${dna.mono}`)
  if (dna.layout) out.push(`Layout signature: ${dna.layout}`)
  if (dna.copy) out.push(`Copy register: ${dna.copy}`)
  if (Array.isArray(dna.doctrine)) {
    for (const line of dna.doctrine) out.push(`Required move: ${line}`)
  }
  if (Array.isArray(dna.avoid)) {
    out.push(`Anti-patterns to reject (${app} would never ship these): ${dna.avoid.join('; ')}`)
  }
  return out
}

/**
 * Compact composite reference block (used by forge-once / non-iter contexts).
 * Still useful for debugging — prints the merged data with palettes inline.
 */
export function forgeMobbinBlock(data) {
  if (!data) return ''
  const { byCategory = {}, categories = [] } = data
  const hasAny = Object.values(byCategory).some((arr) => arr?.length)
  if (!hasAny) return ''

  const lines = []
  lines.push('')
  lines.push('── MOBBIN PRO DESIGN DNA ──')
  lines.push(
    `Trending B2B SaaS apps on Mobbin Pro right now across {${categories.join(', ')}}. Each anchor below carries the LIVE palette sampled from its trending Mobbin Pro screen plus a curated design-DNA descriptor. Treat hex values as direct theme.extend.colors assignments.`,
  )
  for (const cat of categories) {
    const refs = byCategory[cat] || []
    if (!refs.length) continue
    const first = refs[0]
    if (!first) continue
    const dna = resolveDna(first.app) || synthesizeDna(first.palette)
    lines.push('')
    lines.push(`${cat} — anchor: ${first.app}`)
    if (first.palette?.length) {
      lines.push(`  Palette (sampled): ${formatPaletteLine(first.palette)}`)
      const hint = paletteRoleHint(first.palette)
      if (hint) lines.push(`  Role hint: ${hint}`)
    }
    const imps = dnaImperatives(dna, first.app)
    for (const imp of imps.slice(0, 4)) lines.push(`  ${imp}`)
  }
  lines.push('')
  lines.push(
    'Inheritance rule: the output must echo each anchor\'s palette+register+layout signature, not just name-drop the app.',
  )
  return lines.join('\n')
}

/**
 * Per-iter Mobbin block. Rotates the FEATURED category across iters so the
 * 50-iter loop sees real anchor diversity instead of one shared block. The
 * featured anchor carries the FULL DNA spec (palette, typography, layout,
 * doctrine, anti-patterns); other categories appear as compact one-line
 * supporting context so the model has wider awareness without bloating tokens.
 *
 * This is the primary place the v3 → v4 quality jump lives. v3 emitted
 * ~80 tokens of weak prose ("channel that product's tone"). v4 emits
 * 250-350 tokens of imperative concrete spec — palette as hex, typography
 * as named families, layout as a signature sentence, 3-4 required moves,
 * 3-4 anti-patterns explicitly to reject.
 */
export function mobbinIterBlock(data, iter) {
  if (!data) return ''
  const { byCategory = {}, categories = [] } = data
  const nonEmpty = categories.filter((c) => byCategory[c]?.length)
  if (!nonEmpty.length) return ''

  const featured = nonEmpty[iter % nonEmpty.length]
  const refs = byCategory[featured]
  const featuredRef = refs[iter % refs.length]
  if (!featuredRef?.app) return ''

  const dna = resolveDna(featuredRef.app) || synthesizeDna(featuredRef.palette || [])
  const featuredElems = [...new Set(refs.flatMap((r) => r.elements || []))].slice(0, 8)

  const lines = []
  lines.push('')
  lines.push(`── MOBBIN PRO DESIGN DNA (iter ${iter + 1}) ──`)
  lines.push(`FEATURED ANCHOR: ${featuredRef.app} (${featured})`)

  if (featuredRef.palette?.length) {
    lines.push(`  Palette (sampled from ${featuredRef.app}'s trending Mobbin Pro screen): ${formatPaletteLine(featuredRef.palette)}`)
    const hint = paletteRoleHint(featuredRef.palette)
    if (hint) {
      lines.push(
        `  Role assignment: ${hint}. Plug these directly into tailwind.config.theme.extend.colors — DO NOT invent your own brand palette.`,
      )
    }
  } else if (Array.isArray(dna?.accents) && dna.accents.length) {
    lines.push(`  Known brand accents for ${featuredRef.app}: ${dna.accents.join(', ')} — use these as the primary accent constraints.`)
  }

  if (featuredElems.length) {
    lines.push(
      `  Mobbin element vocabulary present on this anchor's surfaces: ${featuredElems.join(', ')}. Every listed element MUST appear in the generated page in a ${featuredRef.app}-compatible idiom (not as a generic SaaS variant).`,
    )
  }

  const imps = dnaImperatives(dna, featuredRef.app)
  for (const imp of imps) lines.push(`  ${imp}`)

  // v7: concrete copy-shape examples — model patterns headline+sub register
  // against real marketing-page voice, not generic SaaS slogans. STYLE only;
  // verbatim copy is banned.
  const cx = resolveCopyExamples(featuredRef.app)
  if (cx) {
    if (cx.headlines?.length) {
      lines.push(`  Real ${featuredRef.app} headline shapes (match this register; DO NOT copy verbatim): ${cx.headlines.slice(0, 3).map((h) => `"${h}"`).join(' | ')}`)
    }
    if (cx.subs?.length) {
      lines.push(`  Real ${featuredRef.app} sub-headline shapes: ${cx.subs.slice(0, 2).map((s) => `"${s}"`).join(' | ')}`)
    }
    if (cx.products?.length) {
      lines.push(`  Concrete proprietary product nouns ${featuredRef.app} uses in its IA (use as inspiration for your invented product's primitive names): ${cx.products.slice(0, 6).join(', ')}. Invent equivalent proprietary nouns for the generated product — NEVER use generic "Dashboard"/"Analytics"/"Reports"/"Settings".`)
    }
  }

  if (dna?._synthesized) {
    lines.push(`  Note: ${featuredRef.app} is not in the curated DNA bank — descriptor above was synthesized from the sampled palette alone. Lean on the palette + element vocabulary.`)
  }

  // v9: explicit SECONDARY anchor for blending. v8 listed the other
  // anchors as flat context; v9 elevates one of them with copy-register
  // detail so the model has TWO concrete voices to triangulate between,
  // pushing the gen away from verbatim primary-anchor copy. Secondary
  // anchor rotates with a different stride so the (primary, secondary)
  // pair varies across iters.
  const secondaryCat = nonEmpty[(iter + Math.max(1, Math.floor(nonEmpty.length / 2))) % nonEmpty.length]
  if (secondaryCat && secondaryCat !== featured) {
    const secRefs = byCategory[secondaryCat]
    const secRef = secRefs[(iter + 1) % secRefs.length]
    if (secRef?.app) {
      const secDna = resolveDna(secRef.app)
      const secCx = resolveCopyExamples(secRef.app)
      lines.push('')
      lines.push(`SECONDARY ANCHOR (blend register only — do NOT take palette from this one): ${secRef.app} (${secondaryCat})`)
      if (secDna?.copy) {
        lines.push(`  ${secRef.app}'s copy register: ${secDna.copy}`)
      }
      if (secCx?.headlines?.length) {
        lines.push(`  ${secRef.app} headline shapes (blend tone with ${featuredRef.app}'s register; NEVER reproduce verbatim): ${secCx.headlines.slice(0, 2).map((h) => `"${h}"`).join(' | ')}`)
      }
      if (secCx?.products?.length) {
        lines.push(`  ${secRef.app} product nouns (use as tone inspiration only): ${secCx.products.slice(0, 4).join(', ')}`)
      }
      lines.push(`  Blend rule: PRIMARY (${featuredRef.app}) supplies palette + layout + typography. SECONDARY (${secRef.app}) supplies copy-register tone — blend the verb-noun shape and energy of ${secRef.app}'s headlines INTO ${featuredRef.app}'s structural mold. The resulting headline is invented, not borrowed from either.`)
    }
  }

  // Compact summary of the remaining anchors as supporting context.
  const otherLines = []
  for (const cat of nonEmpty) {
    if (cat === featured || cat === secondaryCat) continue
    const top = byCategory[cat][0]
    if (!top?.app) continue
    const tPalette = top.palette?.length ? ` (palette: ${formatPaletteLine(top.palette.slice(0, 3))})` : ''
    otherLines.push(`${cat}: ${top.app}${tPalette}`)
  }
  if (otherLines.length) {
    lines.push('')
    lines.push(`Other trending Mobbin Pro anchors this iter (context only, do not blend palettes): ${otherLines.join(' | ')}`)
  }

  lines.push('')
  lines.push(
    `Inheritance contract — the vision judge will score this against a real ${featuredRef.app} reference screenshot on a 0-25 mobbinFidelity axis. To score 22+ (target):`,
  )
  lines.push(
    `  • All 5 of the sampled hex values must appear LITERALLY in the generated HTML (in tailwind.config theme.extend.colors AND in inline style attributes on hero/card surfaces). Map them to the named role assignment given above — do not swap.`,
  )
  lines.push(
    `  • The hero h1 typeface, weight, and size MUST visually match the anchor's display-type register (the named font family AND the named weight). The body paragraphs MUST use the named body family.`,
  )
  lines.push(
    `  • The 7-section composition silhouette (hero → numeric/logo proof → feature grid → pricing toggle → testimonial → penultimate CTA → 4-column footer) must be visible. Sections share the anchor's section-spacing rhythm (dense not airy for ${featuredRef.app === 'Linear' || featuredRef.app === 'Cursor' || featuredRef.app === 'Sentry' ? 'dense-grid anchors' : 'most B2B anchors'}, airy editorial for serif anchors).`,
  )
  lines.push(
    `  • At least 3 of ${featuredRef.app}'s "Required move" lines from the doctrine above must be visible in the rendered output.`,
  )
  lines.push(
    `  • None of ${featuredRef.app}'s anti-patterns may appear anywhere on the page.`,
  )
  lines.push(
    `  • The generated page must be indistinguishable from a real ${featuredRef.app}-family marketing site at thumbnail-glance (the judge sees the page at 512px wide). If the judge can tell the page was AI-generated as opposed to "this could ship from the ${featuredRef.app} brand team", the mobbinFidelity score is capped at 15.`,
  )
  return lines.join('\n')
}

// mobbinDoctrineBlock, anchorAvoidsAurora — sourced from
// @ship-fast/engine/lib/mobbin (re-exported at top of file).

/**
 * Filter an aurora-audit failure to OK status when the iter's design intent
 * (Mobbin anchor OR aesthetic nudge) calls for non-aurora visuals. The
 * `nonAurora` boolean is computed by the caller from
 *   anchorAvoidsAurora(dna) || !isAuroraAesthetic(iter)
 * so the relaxation kicks in for both anchor-driven and aesthetic-driven
 * non-aurora iters.
 *
 * Legacy two-arg signature `relaxAuroraAuditForAnchor(verify, dna)` is
 * preserved for back-compat — it ONLY relaxes for explicit anchor avoid lists,
 * not for aesthetic-only opt-outs.
 */
export function relaxAuroraAuditForAnchor(verify, dnaOrFlag, opts = {}) {
  if (!verify || verify.ok) return verify
  // Resolve nonAurora — explicit flag wins, else fall back to DNA check.
  let nonAurora = false
  if (typeof dnaOrFlag === 'boolean') {
    nonAurora = dnaOrFlag
  } else if (opts.nonAurora === true) {
    nonAurora = true
  } else {
    nonAurora = anchorAvoidsAurora(dnaOrFlag)
  }
  if (!nonAurora) return verify
  const feedback = String(verify.feedback || '')
  if (!feedback) return verify

  // Pull out individual reasons from "Quality audit: A; B; C" or "Revise the
  // next homepage: A; B; C." formats.
  const reasonsStr = feedback.replace(/^Quality audit:\s*/i, '').replace(/^Revise [^:]*:\s*/i, '')

  // The engine's `homepage-quality-audit` glues a suggestion onto some
  // aurora-tier rules with a literal semicolon ("...stacks in aurora/mesh hero
  // (have 1); combine violet/teal/amber blobs"). Naive split on ';' would
  // promote the suggestion half to its own reason. Pre-glue those known
  // aurora-suggestion suffixes back onto their parent reason before splitting.
  const knownAuroraSuffixes = [
    /;\s*combine [^;]*blobs?/i,
    /;\s*combine [^;]*\b(violet|teal|amber|magenta|cyan|aurora)\b[^;]*/i,
  ]
  let normalised = reasonsStr
  for (const re of knownAuroraSuffixes) {
    normalised = normalised.replace(re, (m) => m.replace(';', ','))
  }
  const reasons = normalised.split(/\s*;\s*/).map((r) => r.trim()).filter(Boolean)
  if (!reasons.length) return verify

  // Positive-list: rules we KEEP enforcing even for anti-aurora anchors. Every
  // other rule is treated as aurora-tier scaffolding and dropped. This is the
  // sharper alternative to a negative aurora-only regex — we know exactly which
  // gates remain meaningful for Mobbin Pro inheritance.
  const keepRules = [
    /\bdata-reveal\b/i, // scroll-reveal motion infra; theme-agnostic
    /\bdata-magnet\b/i, // pointer parallax; theme-agnostic
    /\bcontrast\b/i, // body-text contrast; theme-agnostic
    /\btext-slate-500\b/i, // engine's specific contrast call-out
  ]
  const remaining = reasons.filter((r) => keepRules.some((re) => re.test(r)))
  if (!remaining.length) {
    return { ok: true, feedback: '', auroraRelaxed: true, originalFeedback: feedback }
  }
  return {
    ok: false,
    feedback: feedback.startsWith('Quality audit:')
      ? `Quality audit: ${remaining.join('; ')}`
      : remaining.join('; '),
    auroraRelaxed: false,
    originalFeedback: feedback,
  }
}

// detectVerbatimAnchorCopy — sourced from @ship-fast/engine/lib/mobbin
// (re-exported at top of file).

/**
 * Score how well an HTML output inherited the Mobbin DNA layer.
 *
 * v3 measured only verbatim element-substring hits — tested parroting, not
 * inheritance. v4 splits coverage into three axes:
 *   - paletteHits  : sampled hex strings appearing literally in the HTML
 *   - elementHits  : Mobbin element-vocab names appearing case-insensitive
 *   - doctrineHits : keyword markers extracted from each anchor's doctrine
 *
 * Returns shape stays compatible with v3 callers (hits/total/ratio/hitNames)
 * by surfacing the elementHits track as the legacy field, while adding the
 * new paletteRatio + doctrineRatio fields for the v4 leaderboard.
 */
export function scoreMobbinCoverage(html, data) {
  if (!html || !data) {
    return {
      hits: 0,
      total: 0,
      ratio: 0,
      hitNames: [],
      palette: { hits: 0, total: 0, ratio: 0, hexHits: [] },
      doctrine: { hits: 0, total: 0, ratio: 0 },
    }
  }
  const { byCategory = {} } = data
  const allRefs = Object.values(byCategory).flat()

  // Element-vocab track (v3-compatible)
  const allElems = [...new Set(allRefs.flatMap((r) => r?.elements || []).filter(Boolean))]
  const text = html.toLowerCase()
  const hitNames = []
  for (const elem of allElems) {
    const needle = elem.toLowerCase()
    const kebab = needle.replace(/\s+/g, '-')
    if (text.includes(needle) || text.includes(kebab)) hitNames.push(elem)
  }

  // Palette track
  const allHex = [
    ...new Set(allRefs.flatMap((r) => r?.palette || []).filter((h) => /^#[0-9a-f]{6}$/i.test(h))),
  ]
  const hexHits = allHex.filter((hex) => text.includes(hex.toLowerCase()))

  // Doctrine-keyword track — pull a small marker set from each app's DNA bank
  // entry (display family name, layout keywords, copy keywords). Hits indicate
  // the model picked up the doctrine, not just the app name.
  const markers = []
  for (const ref of allRefs) {
    const dna = resolveDna(ref?.app)
    if (!dna) continue
    if (dna.display) markers.push(...dna.display.toLowerCase().match(/[a-z][a-z0-9]+/g) || [])
    if (dna.layout) {
      const m = dna.layout.toLowerCase().match(/[a-z][a-z0-9-]{4,}/g) || []
      markers.push(...m.slice(0, 6))
    }
  }
  const uniqMarkers = [...new Set(markers)].filter((m) => m.length > 4)
  const markerHits = uniqMarkers.filter((m) => text.includes(m))

  return {
    hits: hitNames.length,
    total: allElems.length,
    ratio: allElems.length ? hitNames.length / allElems.length : 0,
    hitNames,
    palette: {
      hits: hexHits.length,
      total: allHex.length,
      ratio: allHex.length ? hexHits.length / allHex.length : 0,
      hexHits,
    },
    doctrine: {
      hits: markerHits.length,
      total: uniqMarkers.length,
      ratio: uniqMarkers.length ? markerHits.length / uniqMarkers.length : 0,
    },
  }
}

// CLI: bun scripts/forge-mobbin.mjs  →  prints the v4 block (palette-free without Playwright)
if (import.meta.url === `file://${process.argv[1]}`) {
  const t0 = Date.now()
  const data = await prefetchForgeMobbin()
  if (process.env.FORGE_MOBBIN_PALETTE === '1') {
    try {
      const { chromium } = await import('playwright')
      const browser = await chromium.launch()
      await extractMobbinPalettes(data, browser)
      await browser.close()
    } catch (e) {
      console.error(`[forge-mobbin] palette extraction failed: ${e?.message || e}`)
    }
  }
  const ms = Date.now() - t0
  const block = forgeMobbinBlock(data)
  if (!block) {
    console.error(`[forge-mobbin] no data (auth missing or fetch failed) — ${ms}ms`)
    process.exit(1)
  }
  console.error(`[forge-mobbin] fetched in ${ms}ms`)
  console.log(block)
  console.log('')
  console.log('── DOCTRINE (always-on system-prompt block) ──')
  console.log(mobbinDoctrineBlock())
}
