import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  formatDesignReferenceUrlsForPrompt,
  isEcommerceVisionReferencePipelineEnabled,
} from '../config/ecommerce-inspiration.js'

const DESIGN_REFS_FILE = 'design-references.json'

export function writeDesignReferencesFile(workspace, urls = []) {
  if (!workspace || !Array.isArray(urls) || !urls.length) return
  const list = urls.map((u) => String(u || '').trim()).filter(Boolean).slice(0, 4)
  if (!list.length) return
  writeFileSync(join(workspace, DESIGN_REFS_FILE), JSON.stringify({ urls: list }, null, 2), 'utf8')
}

export function readDesignReferenceUrlsFromWorkspace(workspace) {
  if (!workspace) return []
  const p = join(workspace, DESIGN_REFS_FILE)
  if (!existsSync(p)) return []
  try {
    const raw = JSON.parse(readFileSync(p, 'utf8'))
    const urls = raw?.urls
    return Array.isArray(urls) ? urls.map((u) => String(u || '').trim()).filter(Boolean) : []
  } catch {
    return []
  }
}

export function mergePromptWithDesignReferences(prompt, workspace) {
  const base = String(prompt || '').trim()
  const urls = readDesignReferenceUrlsFromWorkspace(workspace)
  if (!urls.length) return base
  const block = formatDesignReferenceUrlsForPrompt(urls)
  if (isEcommerceVisionReferencePipelineEnabled()) {
    return `${base}${block}\n(When SHIP_FAST_ECOMMERCE_VISION_REFERENCES is enabled server-side, treat the primary stylistic direction block as authoritative for rhythm and visual weight on storefront prompts.)`
  }
  return `${base}${block}`
}
