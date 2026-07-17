import type { GeneratedCommerceProduct } from '../services/generated-commerce-products'

type FetchLike = typeof fetch

type SyncGeneratedProductsToMedusaInput = {
  adminApiToken?: string
  adminEmail?: string
  adminPassword?: string
  backendUrl: string
  currencyCode?: string
  fetch?: FetchLike
  products: Array<GeneratedCommerceProduct>
  sessionId: string
}

type SyncGeneratedProductsToMedusaResult = {
  synced: number
  tenant?: MedusaTenant
  warning?: string
}

type AdminAuth = {
  token: string
}

type MedusaTenant = {
  apiKeyId: string
  publishableKey: string
  salesChannelId: string
}

type MedusaProductDefaults = {
  shippingProfileId: string
  tenant: MedusaTenant
}

function normalizeBackendUrl(backendUrl: string): string {
  return backendUrl.replace(/\/+$/, '')
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createSessionScopedProductHandle(
  sessionId: string,
  product: Pick<GeneratedCommerceProduct, 'handle' | 'title'>,
): string {
  const tenant = slugify(sessionId) || 'session'
  const productHandle = slugify(product.handle || product.title) || 'product'
  return `ship-fast-${tenant}-${productHandle}`.slice(0, 120)
}

export function parsePriceToMedusaAmount(price: number | string): number {
  const numericPrice =
    typeof price === 'number'
      ? price
      : Number(price.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)?.[0] ?? 0)

  return Math.max(0, numericPrice)
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

function createAdminHeaders(token: string): Record<string, string> {
  return {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  }
}

function firstStringId(
  items: Array<{ id?: unknown }> | undefined,
): string | undefined {
  const match = items?.find((item): item is { id: string } => {
    return typeof item.id === 'string'
  })
  return match?.id
}

function createTenantName(sessionId: string): string {
  return `Ship Fast ${sessionId}`
}

function hasSalesChannel(
  key: { sales_channels?: Array<{ id?: unknown }> },
  salesChannelId: string,
): boolean {
  return (
    key.sales_channels?.some((channel) => channel.id === salesChannelId) ??
    false
  )
}

async function authenticateAdmin({
  adminApiToken,
  adminEmail,
  adminPassword,
  backendUrl,
  fetchImpl,
}: {
  adminApiToken?: string
  adminEmail?: string
  adminPassword?: string
  backendUrl: string
  fetchImpl: FetchLike
}): Promise<AdminAuth | undefined> {
  if (!adminEmail?.trim() || !adminPassword?.trim()) {
    return adminApiToken?.trim() ? { token: adminApiToken.trim() } : undefined
  }

  const response = await fetchImpl(`${backendUrl}/auth/user/emailpass`, {
    body: JSON.stringify({
      email: adminEmail.trim(),
      password: adminPassword,
    }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Medusa Admin authentication failed (${response.status}).`)
  }

  const payload = await readJson<{ token?: unknown }>(response)
  return typeof payload.token === 'string' && payload.token.trim()
    ? { token: payload.token.trim() }
    : undefined
}

async function loadProductDefaults({
  backendUrl,
  fetchImpl,
  sessionId,
  token,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  sessionId: string
  token: string
}): Promise<MedusaProductDefaults> {
  const headers = createAdminHeaders(token)
  const tenantName = createTenantName(sessionId)
  const [profilesResponse, channelsResponse, apiKeysResponse] =
    await Promise.all([
      fetchImpl(`${backendUrl}/admin/shipping-profiles`, { headers }),
      fetchImpl(`${backendUrl}/admin/sales-channels?limit=100`, { headers }),
      fetchImpl(`${backendUrl}/admin/api-keys?limit=100`, { headers }),
    ])

  if (!profilesResponse.ok) {
    throw new Error(
      `Medusa shipping profiles unavailable (${profilesResponse.status}).`,
    )
  }
  if (!channelsResponse.ok) {
    throw new Error(
      `Medusa sales channels unavailable (${channelsResponse.status}).`,
    )
  }
  if (!apiKeysResponse.ok) {
    throw new Error(`Medusa API keys unavailable (${apiKeysResponse.status}).`)
  }

  const profiles = await readJson<{
    shipping_profiles?: Array<{ id?: unknown }>
  }>(profilesResponse)
  const channels = await readJson<{
    sales_channels?: Array<{ id?: unknown; name?: unknown }>
  }>(channelsResponse)
  const apiKeys = await readJson<{
    api_keys?: Array<{
      id?: unknown
      sales_channels?: Array<{ id?: unknown }>
      title?: unknown
      token?: unknown
      type?: unknown
    }>
  }>(apiKeysResponse)
  const shippingProfileId = firstStringId(profiles.shipping_profiles)

  if (shippingProfileId === undefined) {
    throw new Error('Medusa shipping profile not found.')
  }

  const existingSalesChannel = channels.sales_channels?.find(
    (channel): channel is { id: string; name: string } =>
      typeof channel.id === 'string' && channel.name === tenantName,
  )
  const salesChannelId =
    existingSalesChannel?.id ??
    (await createTenantSalesChannel({
      backendUrl,
      fetchImpl,
      headers,
      tenantName,
      sessionId,
    }))
  const existingApiKey = apiKeys.api_keys?.find(
    (
      key,
    ): key is {
      id: string
      sales_channels?: Array<{ id?: unknown }>
      title: string
      token: string
      type: string
    } =>
      typeof key.id === 'string' &&
      key.title === tenantName &&
      key.type === 'publishable' &&
      typeof key.token === 'string' &&
      key.token.trim().length > 0,
  )
  const apiKey =
    existingApiKey ??
    (await createTenantPublishableKey({
      backendUrl,
      fetchImpl,
      headers,
      tenantName,
    }))

  if (!hasSalesChannel(apiKey, salesChannelId)) {
    const linkResponse = await fetchImpl(
      `${backendUrl}/admin/api-keys/${apiKey.id}/sales-channels`,
      {
        body: JSON.stringify({ add: [salesChannelId] }),
        headers,
        method: 'POST',
      },
    )

    if (!linkResponse.ok) {
      throw new Error(
        `Medusa tenant publishable key link failed (${linkResponse.status}).`,
      )
    }
  }

  return {
    shippingProfileId,
    tenant: {
      apiKeyId: apiKey.id,
      publishableKey: apiKey.token,
      salesChannelId,
    },
  }
}

async function createTenantSalesChannel({
  backendUrl,
  fetchImpl,
  headers,
  sessionId,
  tenantName,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  headers: Record<string, string>
  sessionId: string
  tenantName: string
}): Promise<string> {
  const response = await fetchImpl(`${backendUrl}/admin/sales-channels`, {
    body: JSON.stringify({
      description: `Ship Fast generated storefront tenant ${sessionId}`,
      name: tenantName,
    }),
    headers,
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Medusa tenant sales channel failed (${response.status}).`)
  }

  const payload = await readJson<{ sales_channel?: { id?: unknown } }>(response)
  const salesChannelId = payload.sales_channel?.id
  if (typeof salesChannelId !== 'string') {
    throw new Error('Medusa tenant sales channel id not found.')
  }
  return salesChannelId
}

async function createTenantPublishableKey({
  backendUrl,
  fetchImpl,
  headers,
  tenantName,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  headers: Record<string, string>
  tenantName: string
}): Promise<{
  id: string
  sales_channels?: Array<{ id?: unknown }>
  token: string
}> {
  const response = await fetchImpl(`${backendUrl}/admin/api-keys`, {
    body: JSON.stringify({
      title: tenantName,
      type: 'publishable',
    }),
    headers,
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(
      `Medusa tenant publishable key failed (${response.status}).`,
    )
  }

  const payload = await readJson<{
    api_key?: {
      id?: unknown
      sales_channels?: Array<{ id?: unknown }>
      token?: unknown
    }
  }>(response)
  const apiKeyId = payload.api_key?.id
  const token = payload.api_key?.token
  if (typeof apiKeyId !== 'string' || typeof token !== 'string') {
    throw new Error('Medusa tenant publishable key token not found.')
  }
  return {
    id: apiKeyId,
    sales_channels: payload.api_key?.sales_channels,
    token,
  }
}

async function findExistingProductId({
  backendUrl,
  fetchImpl,
  handle,
  token,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  handle: string
  token: string
}): Promise<string | undefined> {
  const response = await fetchImpl(
    `${backendUrl}/admin/products?handle=${encodeURIComponent(handle)}&limit=1`,
    { headers: createAdminHeaders(token) },
  )

  if (!response.ok) {
    throw new Error(`Medusa product lookup failed (${response.status}).`)
  }

  const payload = await readJson<{ products?: Array<{ id?: unknown }> }>(
    response,
  )
  const productId = payload.products?.[0]?.id
  return typeof productId === 'string' ? productId : undefined
}

function createProductBody({
  currencyCode,
  defaults,
  handle,
  product,
  sessionId,
}: {
  currencyCode: string
  defaults: MedusaProductDefaults
  handle: string
  product: GeneratedCommerceProduct
  sessionId: string
}) {
  return {
    title: product.title,
    handle,
    ...(product.description === undefined
      ? {}
      : { description: product.description }),
    metadata: {
      ship_fast_generated_handle: product.handle,
      ship_fast_generated_product: true,
      ship_fast_session_id: sessionId,
    },
    options: [{ title: 'Default', values: ['Default'] }],
    shipping_profile_id: defaults.shippingProfileId,
    sales_channels: [{ id: defaults.tenant.salesChannelId }],
    status: 'published',
    variants: [
      {
        title: 'Default',
        options: { Default: 'Default' },
        prices: [
          {
            amount: parsePriceToMedusaAmount(product.price),
            currency_code: currencyCode,
          },
        ],
      },
    ],
  }
}

export async function syncGeneratedProductsToMedusa({
  adminApiToken,
  adminEmail,
  adminPassword,
  backendUrl,
  currencyCode = 'usd',
  fetch: fetchOverride,
  products,
  sessionId,
}: SyncGeneratedProductsToMedusaInput): Promise<SyncGeneratedProductsToMedusaResult> {
  const syncProducts = products.slice(0, 25)
  if (syncProducts.length === 0) return { synced: 0 }

  const normalizedBackendUrl = normalizeBackendUrl(backendUrl)
  const fetchImpl = fetchOverride ?? fetch

  try {
    const auth = await authenticateAdmin({
      adminApiToken,
      adminEmail,
      adminPassword,
      backendUrl: normalizedBackendUrl,
      fetchImpl,
    })

    if (auth === undefined) {
      return {
        synced: 0,
        warning: 'Medusa Admin API credentials are not configured.',
      }
    }

    const defaults = await loadProductDefaults({
      backendUrl: normalizedBackendUrl,
      fetchImpl,
      sessionId,
      token: auth.token,
    })
    let synced = 0

    for (const product of syncProducts) {
      const handle = createSessionScopedProductHandle(sessionId, product)
      const existingProductId = await findExistingProductId({
        backendUrl: normalizedBackendUrl,
        fetchImpl,
        handle,
        token: auth.token,
      })
      const headers = createAdminHeaders(auth.token)

      // Medusa admin is the source of truth once a product exists. Skip
      // existing products so admin edits (title, price, description, images,
      // variants) are preserved across re-provisions. Only create products
      // that don't exist yet.
      if (existingProductId !== undefined) {
        synced += 1
        continue
      }

      const response = await fetchImpl(
        `${normalizedBackendUrl}/admin/products`,
        {
          body: JSON.stringify(
            createProductBody({
              currencyCode,
              defaults,
              handle,
              product,
              sessionId,
            }),
          ),
          headers,
          method: 'POST',
        },
      )

      if (!response.ok) {
        throw new Error(`Medusa product sync failed (${response.status}).`)
      }
      synced += 1
    }

    return { synced, tenant: defaults.tenant }
  } catch {
    return {
      synced: 0,
      warning: 'Medusa product sync failed.',
    }
  }
}
