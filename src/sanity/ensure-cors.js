import { DASHBOARD_PORT, SANITY_MANAGEMENT_TOKEN, SANITY_PROJECT_ID, SITE_URL } from '../config.js'

const MANAGEMENT_API = 'https://api.sanity.io/v2021-06-07'

const collectOrigins = () => {
  const out = new Set()
  out.add(`http://localhost:${DASHBOARD_PORT}`)
  out.add(`http://127.0.0.1:${DASHBOARD_PORT}`)
  try {
    out.add(new URL(SITE_URL).origin)
  } catch {
    void 0
  }
  const extra = (process.env.SANITY_CORS_EXTRA_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  extra.forEach((o) => out.add(o))
  return [...out]
}

const ensureCorsForProject = async (projectId, origins, token) => {
  if (!token || !projectId) return
  const list = origins.filter(Boolean)
  if (!list.length) return

  const listUrl = `${MANAGEMENT_API}/projects/${encodeURIComponent(projectId)}/cors`
  const headers = { Authorization: `Bearer ${token}` }

  let entries
  try {
    const r = await fetch(listUrl, { headers })
    if (!r.ok) {
      if (r.status === 401 || r.status === 403) {
        console.warn(
          `[ship-fast] Sanity CORS: HTTP ${r.status} for project ${projectId} — token not accepted by Management API. ` +
            'Use a Personal Access Token or Project robot token with Developer/Admin scope.',
        )
      } else {
        console.warn(`[ship-fast] Sanity CORS list HTTP ${r.status} for ${projectId}`)
      }
      return
    }
    entries = await r.json()
  } catch (e) {
    console.warn(`[ship-fast] Sanity CORS list failed for ${projectId}:`, e?.message ?? e)
    return
  }

  const existing = new Set((Array.isArray(entries) ? entries : []).map((e) => e.origin))

  for (const origin of list) {
    if (existing.has(origin)) continue
    try {
      const pr = await fetch(listUrl, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, allowCredentials: true }),
      })
      if (pr.ok) {
        console.log(`[ship-fast] Sanity CORS origin added to ${projectId}: ${origin}`)
        existing.add(origin)
      } else {
        const txt = await pr.text().catch(() => '')
        console.warn(
          `[ship-fast] Sanity CORS add ${origin} → ${projectId} HTTP ${pr.status}`,
          txt.slice(0, 200),
        )
      }
    } catch (e) {
      console.warn(`[ship-fast] Sanity CORS add ${origin} → ${projectId}:`, e?.message ?? e)
    }
  }
}

export const ensureSanityCorsOrigins = async () => {
  await ensureCorsForProject(SANITY_PROJECT_ID, collectOrigins(), SANITY_MANAGEMENT_TOKEN)
}

export const ensureSanityCorsForTenant = async (sanityConfig, extraOrigins = []) => {
  const projectId = String(sanityConfig?.projectId || '').trim()
  if (!projectId) return
  const origins = new Set(collectOrigins())
  for (const o of extraOrigins) {
    const s = String(o || '').trim()
    if (!s) continue
    try {
      origins.add(new URL(s).origin)
    } catch {
      origins.add(s)
    }
  }
  await ensureCorsForProject(projectId, [...origins], SANITY_MANAGEMENT_TOKEN)
}
