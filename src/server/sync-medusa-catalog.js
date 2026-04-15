import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

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

async function resolveMedusaAdmin(options = {}) {
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
  return { base, token }
}

export function isMedusaSyncConfigured() {
  return Boolean(
    process.env.MEDUSA_ADMIN_API_TOKEN ||
    (process.env.MEDUSA_ADMIN_EMAIL && process.env.MEDUSA_ADMIN_PASSWORD),
  )
}

function mapMedusaAdminProductToSiteSpecProduct(p) {
  if (!p) return null
  const handle = String(p.handle || '').trim() || slugify(p.title || 'product')
  const title = String(p.title || handle).trim()
  const variant = Array.isArray(p.variants) ? p.variants[0] : null
  const prices = variant?.prices
  const priceEntry = Array.isArray(prices) ? prices[0] : null
  let price = null
  if (priceEntry && typeof priceEntry.amount === 'number') {
    price = priceEntry.amount / 100
  }
  const currency = priceEntry?.currency_code
    ? String(priceEntry.currency_code).toUpperCase()
    : 'USD'
  let image = p.thumbnail ? String(p.thumbnail) : null
  if (!image && Array.isArray(p.images) && p.images.length > 0) {
    const first = p.images[0]
    image = typeof first === 'string' ? first : first?.url ? String(first.url) : null
  }
  return {
    id: handle,
    title,
    handle,
    description: p.description ? String(p.description) : '',
    price,
    currency,
    image,
    category: '',
  }
}

export async function fetchMedusaProductsForSiteSpec(options = {}) {
  const { base, token } = await resolveMedusaAdmin(options)
  const all = []
  let offset = 0
  const limit = 100
  for (;;) {
    const q = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      expand: 'variants',
    })
    const data = await adminFetch(base, token, `/admin/products?${q.toString()}`)
    const batch = data?.products ?? []
    if (!Array.isArray(batch) || batch.length === 0) break
    for (const p of batch) {
      const row = mapMedusaAdminProductToSiteSpecProduct(p)
      if (row) all.push(row)
    }
    if (batch.length < limit) break
    offset += limit
  }
  return all
}

/**
 * Sync products from a site-spec to Medusa admin.
 * Returns { synced: number, errors: string[] }
 */
export async function syncProductsToMedusa(products, options = {}) {
  const { base, token } = await resolveMedusaAdmin(options)

  if (!Array.isArray(products) || products.length === 0) return { synced: 0, errors: [] }

  const deleteAllProductsAdmin = async () => {
    const limit = 80
    for (;;) {
      const data = await adminFetch(base, token, `/admin/products?limit=${limit}&offset=0&fields=id`)
      const batch = data?.products ?? []
      if (!Array.isArray(batch) || batch.length === 0) break
      for (const pr of batch) {
        const id = pr?.id
        if (!id) continue
        try {
          await adminFetch(base, token, `/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' })
        } catch {
          /* continue */
        }
      }
    }
  }

  try {
    await deleteAllProductsAdmin()
  } catch {
    /* non-fatal — proceed with create */
  }

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
  const byHandle = {}
  const byTitle = {}

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
      const created = await adminFetch(base, token, '/admin/products', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const pr = created?.product
      const vid = pr?.variants?.[0]?.id
      if (vid) {
        byHandle[handle] = vid
        byTitle[title] = vid
      }
      synced++
    } catch (e) {
      errors.push(`${handle}: ${e.message}`)
    }
  }

  if (options.workspace) {
    try {
      writeFileSync(
        join(options.workspace, 'medusa-variants.json'),
        JSON.stringify({ byHandle, byTitle }, null, 2),
        'utf8',
      )
    } catch {
      /* ignore */
    }
  }

  return { synced, errors, byHandle, byTitle }
}
