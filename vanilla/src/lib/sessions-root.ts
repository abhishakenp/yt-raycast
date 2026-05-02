import { join, resolve } from 'node:path'

/**
 * Same session directory Express uses (`SESSIONS_DIR` from env, set in `src/index.js`).
 * Next.js runs in a separate process — it must read this env (e.g. from `.env.local`) so
 * `/preview/:id` resolves workspaces the API can still serve.
 */
export function getSessionsRootDir(): string {
  const raw = process.env.SESSIONS_DIR?.trim()
  if (raw) return resolve(process.cwd(), raw)
  return join(process.cwd(), 'sessions')
}
