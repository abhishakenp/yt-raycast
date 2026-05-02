import {
  DASHBOARD_PORT,
  SANITY_MANAGEMENT_TOKEN,
  SANITY_PROJECT_ID,
  SITE_URL,
} from '../config.js'

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

export const ensureSanityCorsOrigins = async () => {
  const token = SANITY_MANAGEMENT_TOKEN
  const projectId = SANITY_PROJECT_ID
  if (!token || !projectId) return

  const origins = collectOrigins()
  const listUrl = `${MANAGEMENT_API}/projects/${encodeURIComponent(projectId)}/cors`
  const headers = { Authorization: `Bearer ${token}` }

  let entries
  try {
    const r = await fetch(listUrl, { headers })
    if (!r.ok) {
      if (r.status === 401 || r.status === 403) {
        console.warn(
          `[ship-fast] Sanity CORS: HTTP ${r.status} — SANITY_MANAGEMENT_TOKEN is not accepted for the Management API. ` +
            'Use a Personal Access Token (sanity.io/manage → Account → Tokens) or a Project robot token with Developer/Admin on this project. ' +
            'Dataset API tokens (SANITY_READ_TOKEN / SANITY_WRITE_TOKEN) will not work here.',
        )
      } else {
        console.warn(`[ship-fast] Sanity CORS list HTTP ${r.status}`)
      }
      return
    }
    entries = await r.json()
  } catch (e) {
    console.warn('[ship-fast] Sanity CORS list failed:', e?.message ?? e)
    return
  }

  const existing = new Set((Array.isArray(entries) ? entries : []).map((e) => e.origin))

  for (const origin of origins) {
    if (existing.has(origin)) continue
    try {
      const pr = await fetch(listUrl, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, allowCredentials: true }),
      })
      if (pr.ok) {
        console.log(`[ship-fast] Sanity CORS origin added: ${origin}`)
        existing.add(origin)
      } else {
        const txt = await pr.text().catch(() => '')
        console.warn(`[ship-fast] Sanity CORS add ${origin} HTTP ${pr.status}`, txt.slice(0, 200))
      }
    } catch (e) {
      console.warn(`[ship-fast] Sanity CORS add ${origin}:`, e?.message ?? e)
    }
  }
}
