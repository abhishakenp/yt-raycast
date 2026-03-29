import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadSiteSpec, saveSiteSpec } from '../spec/index.js'

const THEME_OVERRIDE_FILE = '.theme.json'
const ALLOWED_THEME_KEYS = new Set([
  'primary',
  'secondary',
  'accent',
  'background',
  'surface',
  'text',
  'mutedText',
  'border',
])

function getWorkspace(sessionOrWorkspace) {
  if (typeof sessionOrWorkspace === 'string') return sessionOrWorkspace
  return sessionOrWorkspace?.workspace || ''
}

function sanitizeThemeColor(value) {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) return null
  return normalized
}

export function normalizeThemeOverride(rawTheme) {
  if (!rawTheme || typeof rawTheme !== 'object') return null

  const theme = {}
  for (const [key, value] of Object.entries(rawTheme)) {
    if (!ALLOWED_THEME_KEYS.has(key)) continue
    const color = sanitizeThemeColor(value)
    if (color) theme[key] = color
  }

  return Object.keys(theme).length > 0 ? theme : null
}

export function readSessionThemeOverride(sessionOrWorkspace) {
  const workspace = getWorkspace(sessionOrWorkspace)
  if (!workspace) return null

  const filePath = join(workspace, THEME_OVERRIDE_FILE)
  if (!existsSync(filePath)) return null

  try {
    return normalizeThemeOverride(JSON.parse(readFileSync(filePath, 'utf-8')))
  } catch {
    return null
  }
}

export function applyThemeOverrideToSiteSpec(siteSpec, themeOverride) {
  const normalizedTheme = normalizeThemeOverride(themeOverride)
  if (!siteSpec || !normalizedTheme) return siteSpec

  return {
    ...siteSpec,
    theme: {
      ...(siteSpec.theme || {}),
      colors: {
        ...(siteSpec.theme?.colors || {}),
        ...normalizedTheme,
      },
      tailwind: {
        ...(siteSpec.theme?.tailwind || {}),
        ...(normalizedTheme.primary ? { primary: normalizedTheme.primary } : {}),
        ...(normalizedTheme.secondary ? { secondary: normalizedTheme.secondary } : {}),
        ...(normalizedTheme.accent ? { accent: normalizedTheme.accent } : {}),
      },
    },
  }
}

export function persistSessionThemeOverride(session, rawTheme) {
  const workspace = getWorkspace(session)
  if (!workspace) return null

  const normalizedTheme = normalizeThemeOverride(rawTheme)
  const filePath = join(workspace, THEME_OVERRIDE_FILE)

  if (normalizedTheme) {
    writeFileSync(filePath, JSON.stringify(normalizedTheme, null, 2))
  } else if (existsSync(filePath)) {
    rmSync(filePath, { force: true })
  }

  if (session && typeof session === 'object') {
    session.themeOverride = normalizedTheme
  }

  const siteSpec = loadSiteSpec(workspace)
  if (siteSpec) {
    saveSiteSpec(workspace, applyThemeOverrideToSiteSpec(siteSpec, normalizedTheme))
    if (session && typeof session === 'object') session.siteSpecReady = true
  }

  return normalizedTheme
}
