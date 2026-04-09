const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'product'

const parsePriceToCents = (price) => {
  if (price == null) return 1999
  if (typeof price === 'number' && Number.isFinite(price)) {
    if (price > 0 && price < 1000) return Math.round(price * 100)
    return Math.round(price)
  }
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ''))
  if (!Number.isFinite(n)) return 1999
  return Math.round(n * 100)
}

async function adminFetch(base, token, path, init = {}) {
  const url = `${base.replace(/\/$/, '')}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const err = new Error(`Medusa ${init.method || 'GET'} ${path} ${res.status}`)
    err.detail = data
    throw err
  }
  return data
}

async function getAdminToken(base, email, password) {
  const res = await fetch(`${base.replace(/\/$/, '')}/auth/user/emailpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.token) {
    const err = new Error('Admin login failed (check MEDUSA_ADMIN_EMAIL / MEDUSA_ADMIN_PASSWORD)')
    err.detail = data
    throw err
  }
  return data.token
}

export function isMedusaSyncConfigured() {
  return Boolean(
    process.env.MEDUSA_ADMIN_API_TOKEN ||
    (process.env.MEDUSA_ADMIN_EMAIL && process.env.MEDUSA_ADMIN_PASSWORD),
  )
}

/**
 * Sync products from a site-spec to Medusa admin.
 * Returns { synced: number, errors: string[] }
 */
export async function syncProductsToMedusa(products, options = {}) {
  const base = options.backendUrl || process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
  let token = options.token || process.env.MEDUSA_ADMIN_API_TOKEN || ''
  const email = options.email || process.env.MEDUSA_ADMIN_EMAIL || ''
  const password = options.password || process.env.MEDUSA_ADMIN_PASSWORD || ''

  if (!token && email && password) {
    token = await getAdminToken(base, email, password)
  }
  if (!token) {
    throw new Error(
      'No Medusa admin credentials: set MEDUSA_ADMIN_API_TOKEN or MEDUSA_ADMIN_EMAIL + MEDUSA_ADMIN_PASSWORD',
    )
  }

  if (!Array.isArray(products) || products.length === 0) return { synced: 0, errors: [] }

  let defaultCurrency = (process.env.MEDUSA_REGION_CURRENCY || 'usd').toLowerCase()
  try {
    const regions = await adminFetch(base, token, '/admin/regions?limit=1')
    const r = regions?.regions?.[0]
    if (r?.currency_code) defaultCurrency = String(r.currency_code).toLowerCase()
  } catch {
    /* keep env default */
  }

  let synced = 0
  const errors = []

  for (const p of products) {
    const title = String(p.title || 'Product').trim()
    const handle = p.handle ? String(p.handle).trim() : slugify(title)
    const amount = parsePriceToCents(p.price)
    const body = {
      title,
      handle,
      status: 'published',
      description: p.description ? String(p.description) : undefined,
      thumbnail: p.image ? String(p.image) : undefined,
      options: [{ title: 'Default', values: ['Default'] }],
      variants: [
        {
          title: 'Default',
          sku: p.id ? String(p.id) : undefined,
          options: { Default: 'Default' },
          prices: [{ currency_code: defaultCurrency, amount }],
        },
      ],
    }
    if (!body.description) delete body.description
    if (!body.thumbnail) delete body.thumbnail
    if (!body.variants[0].sku) delete body.variants[0].sku

    try {
      await adminFetch(base, token, '/admin/products', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      synced++
    } catch (e) {
      errors.push(`${handle}: ${e.message}`)
    }
  }

  return { synced, errors }
}
