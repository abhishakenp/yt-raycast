// @ts-check
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const SESSION_META_FILE = '.session.json'
const DEFAULT_PREFERRED_LANGUAGE = 'en'

/**
 * @param {unknown} value
 * @returns {string}
 */
function normalizePreferredLanguage(value) {
  const requested = String(value || '')
    .trim()
    .toLowerCase()
  if (!requested || requested === 'en') return DEFAULT_PREFERRED_LANGUAGE
  if (requested === 'hinglish') return 'hinglish'
  // Preserve browser-native language tags: bare codes (hi), script subtags
  // (hi-latn), region subtags (es-mx), and code-mixed variants (ta-en).
  if (/^[a-z]{2,8}(-[a-z]{2,8}){0,2}$/.test(requested)) return requested
  return DEFAULT_PREFERRED_LANGUAGE
}

/**
 * @param {string} workspace
 * @returns {{ preferredLanguage: string }}
 */
function readSessionMeta(workspace) {
  const metaPath = join(workspace, SESSION_META_FILE)
  if (!existsSync(metaPath)) {
    return { preferredLanguage: DEFAULT_PREFERRED_LANGUAGE }
  }
  try {
    const data = JSON.parse(readFileSync(metaPath, 'utf-8'))
    return {
      preferredLanguage: normalizePreferredLanguage(data?.preferredLanguage),
    }
  } catch {
    return { preferredLanguage: DEFAULT_PREFERRED_LANGUAGE }
  }
}

/**
 * Preferred language for pipeline prompts, from workspace `.session.json` if present.
 * @param {string | null | undefined} workspace
 * @returns {string}
 */
export function getWorkspacePreferredLanguage(workspace) {
  if (!workspace) return DEFAULT_PREFERRED_LANGUAGE
  return readSessionMeta(workspace).preferredLanguage
}
