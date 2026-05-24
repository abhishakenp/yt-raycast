import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const LLM_HOME_BACKUP = 'index.llm.html'

export function looksLikeLlmTailwindHomepage(html) {
  const text = String(html ?? '')
  if (!text || text.length < 400) return false
  if (/cdn\.tailwindcss\.com/i.test(text)) return true
  if (/tailwind\.config/i.test(text) && /<section\b/i.test(text)) return true
  return false
}

export function looksLikeRendererShell(html) {
  const text = String(html ?? '')
  return (
    /href="\.\/site\.css/i.test(text) ||
    (/class="site-shell"/i.test(text) && !/cdn\.tailwindcss\.com/i.test(text))
  )
}

export function writeLlmHomepageBackup(workspace, html) {
  if (!workspace || !html) return
  try {
    writeFileSync(join(workspace, LLM_HOME_BACKUP), html, 'utf8')
  } catch {
    /* best-effort */
  }
}

export function readLlmHomepageBackup(workspace) {
  if (!workspace) return null
  try {
    const path = join(workspace, LLM_HOME_BACKUP)
    if (!existsSync(path)) return null
    const html = readFileSync(path, 'utf8')
    return html?.length > 400 ? html : null
  } catch {
    return null
  }
}

export function shouldPreserveLlmHomepage(workspace) {
  if (!workspace) return false
  const backup = readLlmHomepageBackup(workspace)
  if (backup && looksLikeLlmTailwindHomepage(backup)) return true
  try {
    const indexPath = join(workspace, 'index.html')
    if (existsSync(indexPath)) {
      const current = readFileSync(indexPath, 'utf8')
      if (looksLikeLlmTailwindHomepage(current) && current.length > 400) return true
    }
  } catch {
    /* fall through */
  }
  return false
}

/** Restore ship-engine LLM homepage if a renderer pass replaced index.html. */
export function restoreLlmHomepageIfNeeded(workspace, log = () => {}) {
  if (!workspace) return null
  const indexPath = join(workspace, 'index.html')
  if (!existsSync(indexPath)) return null

  const backup = readLlmHomepageBackup(workspace)
  if (!backup || !looksLikeLlmTailwindHomepage(backup)) return null

  let current = ''
  try {
    current = readFileSync(indexPath, 'utf8')
  } catch {
    return null
  }

  if (!looksLikeRendererShell(current) && looksLikeLlmTailwindHomepage(current)) return current
  if (looksLikeRendererShell(current) || !looksLikeLlmTailwindHomepage(current)) {
    try {
      writeFileSync(indexPath, backup, 'utf8')
      log('  homepage: restored LLM/Mobbin homepage from index.llm.html (renderer had replaced it)')
      return backup
    } catch {
      return null
    }
  }
  return current
}
