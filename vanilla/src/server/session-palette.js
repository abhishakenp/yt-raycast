import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const PALETTE_FILE = 'palette.json'
const STORE_VERSION = 1

const isPlainString = (v) => typeof v === 'string' && v.length > 0 && v.length < 120

const normalizeVars = (raw) => {
  if (!raw || typeof raw !== 'object') return null
  const out = {}
  for (const [k, v] of Object.entries(raw)) {
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,60}$/.test(k)) continue
    if (!isPlainString(v)) continue
    out[k] = v
  }
  return Object.keys(out).length ? out : null
}

const normalizePalette = (raw) => {
  if (!raw || typeof raw !== 'object') return null
  const id = isPlainString(raw.id) ? String(raw.id) : null
  const dark = normalizeVars(raw.dark)
  const light = normalizeVars(raw.light)
  const hasLegacy =
    isPlainString(raw.bg) ||
    isPlainString(raw.surface) ||
    isPlainString(raw.accent) ||
    isPlainString(raw.text) ||
    isPlainString(raw.border)
  if (!dark && !light && !hasLegacy && !id) return null
  const payload = {
    version: STORE_VERSION,
    updatedAt: new Date().toISOString(),
    id,
    dark: dark || null,
    light: light || null,
  }
  if (!dark && hasLegacy) {
    const legacy = {}
    if (isPlainString(raw.bg)) legacy.background = raw.bg
    if (isPlainString(raw.surface)) {
      legacy.card = raw.surface
      legacy.popover = raw.surface
    }
    if (isPlainString(raw.accent)) {
      legacy.primary = raw.accent
      legacy.ring = raw.accent
    }
    if (isPlainString(raw.text)) legacy.foreground = raw.text
    if (isPlainString(raw.border)) legacy.border = raw.border
    if (Object.keys(legacy).length) payload.dark = legacy
  }
  return payload
}

export const readPalette = (workspace) => {
  if (!workspace) return null
  const filePath = join(workspace, PALETTE_FILE)
  if (!existsSync(filePath)) return null
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'))
    return normalizePalette(parsed)
  } catch {
    return null
  }
}

export const writePalette = (workspace, raw) => {
  if (!workspace) return null
  const normalized = normalizePalette(raw)
  if (!normalized) return null
  writeFileSync(join(workspace, PALETTE_FILE), JSON.stringify(normalized, null, 2), 'utf-8')
  return normalized
}
