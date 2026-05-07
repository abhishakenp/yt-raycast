// @ts-check
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const SESSION_META_FILE = '.session.json'
const DEFAULT_PREFERRED_LANGUAGE = 'en'

function normalizePreferredLanguage(value) {
  const requested = String(value || '')
    .trim()
    .toLowerCase()
  if (!requested || requested === 'en') return DEFAULT_PREFERRED_LANGUAGE
  if (requested === 'hinglish') return 'hinglish'
  if (/^[a-z]{2,8}-en$/.test(requested)) return requested
  return /^[a-z]{2,8}$/.test(requested) ? requested : DEFAULT_PREFERRED_LANGUAGE
}

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

/** Preferred language for pipeline prompts, from workspace `.session.json` if present. */
export function getWorkspacePreferredLanguage(workspace) {
  if (!workspace) return DEFAULT_PREFERRED_LANGUAGE
  return readSessionMeta(workspace).preferredLanguage
}
