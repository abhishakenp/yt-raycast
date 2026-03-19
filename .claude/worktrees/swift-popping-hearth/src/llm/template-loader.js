import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..', '..')

const TEMPLATE_DIRS = {
  v1: join(PROJECT_ROOT, 'templates-v1'),
  v2: join(PROJECT_ROOT, 'templates-v2'),
}

/**
 * Load a raw template with placeholder tokens from disk.
 * @param {string} siteType - e.g. 'saas', 'landing', 'blog'
 * @param {'v1'|'v2'} version - template version (v1=dark, v2=light)
 * @returns {{ html: string, version: string } | null}
 */
export const loadTemplate = (siteType, version) => {
  const dir = TEMPLATE_DIRS[version]
  if (!dir) return null

  const filePath = join(dir, `${siteType}.html`)
  if (!existsSync(filePath)) return null

  return { html: readFileSync(filePath, 'utf-8'), version }
}

/**
 * Load a random template version (v1 or v2) for a site type.
 * Falls back to whichever version exists if only one is available.
 */
export const loadRandomTemplate = (siteType) => {
  const preferred = Math.random() < 0.5 ? 'v1' : 'v2'
  const fallback = preferred === 'v1' ? 'v2' : 'v1'

  return loadTemplate(siteType, preferred) ?? loadTemplate(siteType, fallback)
}

/**
 * Extract all UPPER_SNAKE_CASE placeholder tokens from a template.
 * @param {string} html
 * @returns {string[]} Unique token names sorted alphabetically
 */
export const extractTokens = (html) => {
  const matches = html.match(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g) ?? []
  // Filter out common non-token strings (CSS classes, HTML attrs, etc.)
  const excluded = new Set(['UTF', 'CDN', 'CTA'])
  const tokens = matches.filter(
    (t) => !excluded.has(t) && !t.startsWith('MD_') && !t.startsWith('SM_'),
  )
  return [...new Set(tokens)].sort()
}

/**
 * Replace placeholder tokens in a template with actual values.
 * @param {string} html - Template HTML with UPPER_SNAKE_CASE tokens
 * @param {Record<string, string>} values - Token name → replacement value
 * @returns {string} Customized HTML
 */
export const applyTokens = (html, values) => {
  let result = html
  for (const [token, value] of Object.entries(values)) {
    result = result.replaceAll(token, value)
  }
  return result
}

/**
 * Check which tokens in a template are still unreplaced (useful for debugging).
 * @param {string} html - HTML after token application
 * @returns {string[]} Remaining unreplaced tokens
 */
export const findUnreplacedTokens = (html) => extractTokens(html)
