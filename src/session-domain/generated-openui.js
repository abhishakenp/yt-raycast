import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DEFAULT_SESSIONS_DIR = join(process.cwd(), 'sessions')
const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]+$/

export function readGeneratedOpenUI(sessionId, { sessionsDir = DEFAULT_SESSIONS_DIR } = {}) {
  const id = String(sessionId || '').trim()
  if (!SESSION_ID_PATTERN.test(id)) return null

  const openuiPath = join(sessionsDir, id, 'home.openui')
  if (!existsSync(openuiPath)) return null

  try {
    const openui = readFileSync(openuiPath, 'utf8')
    return openui.trim() ? openui : null
  } catch {
    return null
  }
}
