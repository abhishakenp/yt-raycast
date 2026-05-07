/**
 * Lucide icon name validator.
 *
 * Source of truth: the lucide@latest CDN (what the generated HTML actually
 * loads). We mirror it once into vanilla/.forge/_ref/lucide-names.json — if
 * absent at startup, refresh from lucide-static@latest's icons listing.
 */
import { readdirSync, existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const REGISTRY_PATH = '/Users/livio/Documents/ship-fast/.forge/_ref/lucide-names.json'

let CACHED_NAMES = null

async function refreshFromCDN() {
  try {
    const html = await fetch('https://unpkg.com/lucide-static@latest/icons/').then((r) => r.text())
    const names = [...new Set([...html.matchAll(/([a-z][a-z0-9-]+)\.svg/g)].map((m) => m[1]))]
    if (names.length > 100) {
      mkdirSync(dirname(REGISTRY_PATH), { recursive: true })
      writeFileSync(REGISTRY_PATH, JSON.stringify(names, null, 0), 'utf8')
      return new Set(names)
    }
  } catch {}
  return null
}

function loadFromBundled() {
  const candidates = [
    '/Users/livio/Documents/ship-fast/node_modules/.bun/lucide-react@1.11.0+3f10a4be4e334a9b/node_modules/lucide-react/dist/esm/icons',
    '/Users/livio/Documents/ship-fast/node_modules/.bun/lucide-react@0.562.0+3f10a4be4e334a9b/node_modules/lucide-react/dist/esm/icons',
  ]
  for (const dir of candidates) {
    if (existsSync(dir)) {
      const names = readdirSync(dir)
        .filter((f) => f.endsWith('.mjs') && !f.endsWith('.map'))
        .map((f) => f.replace(/\.mjs$/, ''))
        .filter((n) => /^[a-z][a-z0-9-]+$/.test(n))
      if (names.length > 100) return new Set(names)
    }
  }
  return new Set()
}

export async function ensureLucideRegistry() {
  if (CACHED_NAMES) return CACHED_NAMES
  if (existsSync(REGISTRY_PATH)) {
    try {
      CACHED_NAMES = new Set(JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')))
      if (CACHED_NAMES.size > 100) return CACHED_NAMES
    } catch {}
  }
  const fromCdn = await refreshFromCDN()
  if (fromCdn) {
    CACHED_NAMES = fromCdn
    return CACHED_NAMES
  }
  CACHED_NAMES = loadFromBundled()
  return CACHED_NAMES
}

export function validateLucideIcons(html, registry) {
  const names = registry || CACHED_NAMES
  if (!names || names.size === 0) {
    return { ok: true, unknown: [], totalUsed: 0, registrySize: 0 }
  }
  const re = /data-lucide=["']([a-z0-9-]+)["']/gi
  const used = new Set()
  let m
  while ((m = re.exec(String(html || ''))) !== null) {
    used.add(m[1].toLowerCase())
  }
  const unknown = [...used].filter((n) => !names.has(n))
  return {
    ok: unknown.length === 0,
    unknown,
    totalUsed: used.size,
    registrySize: names.size,
  }
}
