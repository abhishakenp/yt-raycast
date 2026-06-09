import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DEFAULT_SESSIONS_DIR = join(process.cwd(), 'sessions')
const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]+$/

export function readGeneratedPreviewHtml(sessionId, { sessionsDir = DEFAULT_SESSIONS_DIR } = {}) {
  const id = String(sessionId || '').trim()
  if (!SESSION_ID_PATTERN.test(id)) return null

  const indexPath = join(sessionsDir, id, 'index.html')
  if (!existsSync(indexPath)) return null

  try {
    const html = readFileSync(indexPath, 'utf8')
    return html.trim() ? html : null
  } catch {
    return null
  }
}
