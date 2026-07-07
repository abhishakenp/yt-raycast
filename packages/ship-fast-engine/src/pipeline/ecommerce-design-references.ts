import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  formatDesignReferenceUrlsForPrompt,
  isEcommerceVisionReferencePipelineEnabled,
} from '../config/ecommerce-inspiration'

const DESIGN_REFS_FILE = 'design-references.json'

const MAX_NOTES = 800

export function designReferenceFingerprintFromUrls(
  urls: string[] = [],
  notes: string = '',
): string {
  const list = (Array.isArray(urls) ? urls : [])
    .map((u: string) => String(u || '').trim())
    .filter(Boolean)
    .sort()
  const n = String(notes || '')
    .trim()
    .slice(0, MAX_NOTES)
  return JSON.stringify({ u: list, n })
}

export function readDesignReferencesFromWorkspace(workspace: string): {
  urls: string[]
  notes: string
} {
  if (!workspace) return { urls: [], notes: '' }
  const p = join(workspace, DESIGN_REFS_FILE)
  if (!existsSync(p)) return { urls: [], notes: '' }
  try {
    const raw = JSON.parse(readFileSync(p, 'utf8')) as {
      urls?: unknown[]
      notes?: string
    }
    const urls = Array.isArray(raw?.urls)
      ? raw.urls.map((u: unknown) => String(u || '').trim()).filter(Boolean)
      : []
    const notes = String(raw?.notes || '')
      .trim()
      .slice(0, MAX_NOTES)
    return { urls, notes }
  } catch {
    return { urls: [], notes: '' }
  }
}

export function readDesignReferenceFingerprintFromWorkspace(
  workspace: string,
): string {
  const { urls, notes } = readDesignReferencesFromWorkspace(workspace)
  return designReferenceFingerprintFromUrls(urls, notes)
}

export function writeDesignReferencesFile(
  workspace: string,
  urls: string[] = [],
  notes: string = '',
): void {
  if (!workspace || !Array.isArray(urls) || !urls.length) return
  const list = urls
    .map((u: string) => String(u || '').trim())
    .filter(Boolean)
    .slice(0, 4)
  if (!list.length) return
  const n = String(notes || '')
    .trim()
    .slice(0, MAX_NOTES)
  const payload: { urls: string[]; notes?: string } = { urls: list }
  if (n) payload.notes = n
  writeFileSync(
    join(workspace, DESIGN_REFS_FILE),
    JSON.stringify(payload, null, 2),
    'utf8',
  )
}

export function readDesignReferenceUrlsFromWorkspace(
  workspace: string,
): string[] {
  return readDesignReferencesFromWorkspace(workspace).urls
}

export function mergePromptWithDesignReferences(
  prompt: string,
  workspace: string,
): string {
  const base = String(prompt || '').trim()
  const { urls, notes } = readDesignReferencesFromWorkspace(workspace)
  if (!urls.length) return base
  const block = formatDesignReferenceUrlsForPrompt(urls, notes)
  if (isEcommerceVisionReferencePipelineEnabled()) {
    return `${base}${block}\n(When SHIP_FAST_ECOMMERCE_VISION_REFERENCES is enabled server-side, treat the primary stylistic direction block as authoritative for rhythm and visual weight on storefront prompts.)`
  }
  return `${base}${block}`
}
