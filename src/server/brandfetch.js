const DEFAULT_TIMEOUT_MS = 6000

const withTimeout = async (promise, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await promise(controller.signal)
  } finally {
    clearTimeout(timer)
  }
}

const safeJson = async (res) => {
  try {
    return await res.json()
  } catch {
    return null
  }
}

const getBrandfetchHeaders = () => {
  const key = String(process.env.BRANDFETCH_API_KEY || '').trim()
  const headers = { Accept: 'application/json' }
  if (!key) return headers
  return {
    ...headers,
    Authorization: `Bearer ${key}`,
    'X-API-Key': key,
  }
}

const toStringValue = (value) => (value == null ? '' : String(value).trim())

const pickLargestLogo = (logos = []) => {
  const flat = []
  for (const entry of logos || []) {
    const formats = Array.isArray(entry?.formats) ? entry.formats : []
    for (const fmt of formats) {
      const src = toStringValue(fmt?.src || fmt?.url || '')
      if (!src) continue
      const type = toStringValue(fmt?.format || fmt?.type || fmt?.mimeType || fmt?.mime || '')
      const width = Number(fmt?.width || 0) || 0
      const height = Number(fmt?.height || 0) || 0
      flat.push({ src, type, width, height })
    }
  }
  const score = (item) => {
    const isSvg = /svg/i.test(item.type) || /\.svg(\?|#|$)/i.test(item.src)
    const area = Math.max(1, item.width || 0) * Math.max(1, item.height || 0)
    return (isSvg ? 10_000_000_000 : 0) + area
  }
  flat.sort((a, b) => score(b) - score(a))
  return flat[0] || null
}

export const brandfetchSearch = async ({ query, limit = 1, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) => {
  const q = toStringValue(query)
  if (!q) return { ok: false, status: 400, error: 'Missing query.' }

  const url = new URL(`https://api.brandfetch.io/v2/search/${encodeURIComponent(q)}`)
  url.searchParams.set('limit', String(Math.max(1, Math.min(5, Number(limit) || 1))))

  return withTimeout(
    async (signal) => {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: getBrandfetchHeaders(),
        signal,
      })
      const data = await safeJson(res)
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          error: toStringValue(data?.error || data?.message || res.statusText || 'Brandfetch request failed'),
          data,
        }
      }
      return { ok: true, status: res.status, data }
    },
    timeoutMs,
  )
}

export const brandfetchBrandByDomain = async ({
  domain,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) => {
  const d = toStringValue(domain).replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
  if (!d) return { ok: false, status: 400, error: 'Missing domain.' }

  const url = `https://api.brandfetch.io/v2/brands/domain/${encodeURIComponent(d)}`
  return withTimeout(
    async (signal) => {
      const res = await fetch(url, {
        method: 'GET',
        headers: getBrandfetchHeaders(),
        signal,
      })
      const data = await safeJson(res)
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          error: toStringValue(data?.error || data?.message || res.statusText || 'Brandfetch request failed'),
          data,
        }
      }
      return { ok: true, status: res.status, data }
    },
    timeoutMs,
  )
}

const normalizePalette = (data) => {
  const colors = Array.isArray(data?.colors) ? data.colors : []
  const primary =
    colors.find((c) => String(c?.type || '').toLowerCase() === 'primary') ||
    colors.find((c) => String(c?.role || '').toLowerCase() === 'primary') ||
    colors[0] ||
    null
  const secondary =
    colors.find((c) => String(c?.type || '').toLowerCase() === 'secondary') ||
    colors.find((c) => String(c?.role || '').toLowerCase() === 'secondary') ||
    colors[1] ||
    null
  const accent =
    colors.find((c) => String(c?.type || '').toLowerCase() === 'accent') ||
    colors.find((c) => String(c?.role || '').toLowerCase() === 'accent') ||
    colors[2] ||
    null

  const toHex = (c) => {
    const h = toStringValue(c?.hex || c?.value || c?.color || '')
    return /^#[0-9a-f]{6}$/i.test(h) ? h : ''
  }
  const out = {
    primary: toHex(primary),
    secondary: toHex(secondary),
    accent: toHex(accent),
  }
  const ok = Boolean(out.primary)
  return { ok, palette: out }
}

export const resolveBrandfetchBrandProfile = async ({
  query,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) => {
  const search = await brandfetchSearch({ query, limit: 1, timeoutMs })
  if (!search.ok) return { ok: false, error: search.error || 'Brandfetch search failed', status: search.status }

  const raw = search.data
  const results = Array.isArray(raw) ? raw : Array.isArray(raw?.results) ? raw.results : []
  const best = results[0] || null
  if (!best) return { ok: false, error: 'No Brandfetch match found', status: 404 }

  const name = toStringValue(best?.name || best?.brand?.name || best?.company?.name || '')
  const domain = toStringValue(best?.domain || best?.brand?.domain || best?.company?.domain || '')
  if (!domain) return { ok: false, error: 'Brandfetch search returned no domain', status: 404, match: { name } }

  const brand = await brandfetchBrandByDomain({ domain, timeoutMs })
  if (!brand.ok) return { ok: false, error: brand.error || 'Brandfetch brand API failed', status: brand.status }

  const logo = pickLargestLogo(brand.data?.logos || [])
  const paletteNorm = normalizePalette(brand.data)

  const officialUrl = (() => {
    try {
      return new URL(`https://${domain}`).toString().replace(/\/$/, '')
    } catch {
      return ''
    }
  })()

  const logoPayload = logo?.src
    ? {
        kind: 'remote',
        src: logo.src,
        type: logo.type || '',
        width: logo.width || 0,
        height: logo.height || 0,
        provider: 'brandfetch',
        confidence: 0.95,
        alt: name ? `${name} logo` : 'Company logo',
      }
    : null

  const palettePayload = paletteNorm.ok ? { ...paletteNorm.palette, provider: 'brandfetch', confidence: 0.9 } : null

  const confidence =
    (logoPayload ? 0.55 : 0) +
    (palettePayload ? 0.3 : 0) +
    (officialUrl ? 0.15 : 0)

  return {
    ok: Boolean(logoPayload),
    match: { name, domain, officialUrl },
    logo: logoPayload,
    palette: palettePayload,
    confidence: Number(Math.min(1, confidence).toFixed(2)),
  }
}

