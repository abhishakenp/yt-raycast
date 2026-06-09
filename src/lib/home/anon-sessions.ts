import { ANON_SESSIONS_KEY } from '@/lib/home/constants'

export type AnonSessionEntry = { id: string; prompt: string; secret?: string }
export type SessionTokenUser = {
  getIdToken: (forceRefresh?: boolean) => Promise<string>
}

export const readAnonSessions = (): AnonSessionEntry[] => {
  try {
    const raw = localStorage.getItem(ANON_SESSIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is AnonSessionEntry =>
        Boolean(x) && typeof x === 'object' && typeof (x as AnonSessionEntry).id === 'string',
    )
  } catch {
    return []
  }
}

export const saveAnonSession = (id: string, prompt: string, ownerSecret?: string) => {
  const stored = readAnonSessions().filter((session) => session.id !== id)
  const entry: AnonSessionEntry = { id, prompt }
  if (ownerSecret) entry.secret = String(ownerSecret)
  stored.unshift(entry)
  localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(stored))
}

export const removeAnonSession = (id: string) => {
  const stored = readAnonSessions()
  localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(stored.filter((s) => s.id !== id)))
}

export const clearAnonSessions = () => {
  localStorage.removeItem(ANON_SESSIONS_KEY)
}

export const claimAnonSessionsWithUser = async (user: SessionTokenUser) => {
  const stored = readAnonSessions()
  if (stored.length === 0) return
  const claims = stored.map((s) => ({ id: s.id, secret: s.secret || '' }))
  const token = await user.getIdToken(true)
  const response = await fetch('/api/sessions/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ claims }),
  })
  if (!response.ok) return
  const result = (await response.json()) as { claimed?: string[] }
  const n = result?.claimed?.length ?? 0
  if (n > 0) clearAnonSessions()
}
