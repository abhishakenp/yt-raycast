import type { GeneratedCommerceProduct } from '../services/generated-commerce-products'
import type { CommerceProductVariant } from '../contracts'

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

export function createSessionScopedCollectionHandle(
  sessionId: string,
  collectionHandle: string,
): string {
  const tenant = slugify(sessionId) || 'session'
  const collection = slugify(collectionHandle) || 'collection'
  return `ship-fast-${tenant}-${collection}`.slice(0, 120)
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

function deterministicVariantSku(
  handle: string,
  variant: Pick<CommerceProductVariant, 'sku' | 'sourceId' | 'title'>,
): string {
  return (
    variant.sku ??
    `${slugify(handle)}-${slugify(variant.sourceId || variant.title)}`.toUpperCase()
  )
}

export function createTenantScopedVariantSku(
  sessionId: string,
  handle: string,
  variant: Pick<CommerceProductVariant, 'sku' | 'sourceId' | 'title'>,
): string {
  const generatedSku = deterministicVariantSku(handle, variant)
  return `ship-fast-${slugify(sessionId)}-${slugify(handle)}-${slugify(
    generatedSku,
  )}`.toUpperCase()
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

async function resolveProductCollectionId({
  backendUrl,
  fetchImpl,
  product,
  sessionId,
  token,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  product: GeneratedCommerceProduct
  sessionId: string
  token: string
}): Promise<string | undefined> {
  const collection = product.collections?.[0]
  if (collection === undefined) return undefined

  const headers = createAdminHeaders(token)
  const providerHandle = createSessionScopedCollectionHandle(
    sessionId,
    collection.handle,
  )
  const lookupResponse = await fetchImpl(
    `${backendUrl}/admin/collections?handle=${encodeURIComponent(
      providerHandle,
    )}&limit=1`,
    { headers },
  )
  if (!lookupResponse.ok) {
    throw new Error(
      `Medusa product collection lookup failed (${lookupResponse.status}).`,
    )
  }
  const lookupPayload = await readJson<{
    collections?: Array<{ id?: unknown }>
  }>(lookupResponse)
  const existingCollectionId = firstStringId(lookupPayload.collections)
  if (existingCollectionId !== undefined) return existingCollectionId

  const createResponse = await fetchImpl(`${backendUrl}/admin/collections`, {
    body: JSON.stringify({
      external_id: collection.sourceId,
      handle: providerHandle,
      metadata: {
        ship_fast_generated_handle: collection.handle,
        ship_fast_generated_source_id: collection.sourceId,
        ship_fast_session_id: sessionId,
      },
      title: collection.title,
    }),
    headers,
    method: 'POST',
  })
  if (!createResponse.ok) {
    throw new Error(
      `Medusa product collection creation failed (${createResponse.status}).`,
    )
  }
  const createPayload = await readJson<{
    collection?: { id?: unknown }
  }>(createResponse)
  const collectionId = createPayload.collection?.id
  if (typeof collectionId !== 'string') {
    throw new Error('Medusa product collection id not found.')
  }
  return collectionId
}

async function loadStockLocationId({
  backendUrl,
  fetchImpl,
  headers,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  headers: Record<string, string>
}): Promise<string> {
  const response = await fetchImpl(
    `${backendUrl}/admin/stock-locations?limit=1`,
    { headers },
  )
  if (!response.ok) {
    throw new Error(`Medusa stock locations unavailable (${response.status}).`)
  }
  const payload = await readJson<{
    stock_locations?: Array<{ id?: unknown }>
  }>(response)
  const stockLocationId = firstStringId(payload.stock_locations)
  if (stockLocationId === undefined) {
    throw new Error('Medusa stock location not found.')
  }
  return stockLocationId
}

async function ensureSalesChannelStockLocation({
  backendUrl,
  fetchImpl,
  headers,
  locationId,
  salesChannelId,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  headers: Record<string, string>
  locationId: string
  salesChannelId: string
}): Promise<void> {
  const response = await fetchImpl(
    `${backendUrl}/admin/stock-locations/${encodeURIComponent(
      locationId,
    )}/sales-channels`,
    {
      body: JSON.stringify({ add: [salesChannelId] }),
      headers,
      method: 'POST',
    },
  )
  if (!response.ok) {
    throw new Error(
      `Medusa sales channel stock location link failed (${response.status}).`,
    )
  }
}

async function getOrCreateInventoryItem({
  backendUrl,
  fetchImpl,
  generatedSku,
  headers,
  product,
  sessionId,
  sku,
  variant,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  generatedSku: string
  headers: Record<string, string>
  product: GeneratedCommerceProduct
  sessionId: string
  sku: string
  variant: CommerceProductVariant
}): Promise<string> {
  const lookupResponse = await fetchImpl(
    `${backendUrl}/admin/inventory-items?sku=${encodeURIComponent(sku)}&limit=1`,
    { headers },
  )
  if (!lookupResponse.ok) {
    throw new Error(
      `Medusa inventory item lookup failed (${lookupResponse.status}).`,
    )
  }
  const lookupPayload = await readJson<{
    inventory_items?: Array<{ id?: unknown }>
  }>(lookupResponse)
  const existingInventoryItemId = firstStringId(lookupPayload.inventory_items)
  if (existingInventoryItemId !== undefined) return existingInventoryItemId

  const createResponse = await fetchImpl(
    `${backendUrl}/admin/inventory-items`,
    {
      body: JSON.stringify({
        metadata: {
          ship_fast_generated_sku: generatedSku,
          ship_fast_generated_source_id: variant.sourceId,
          ship_fast_session_id: sessionId,
        },
        sku,
        title: `${product.title} — ${variant.title}`,
      }),
      headers,
      method: 'POST',
    },
  )
  if (!createResponse.ok) {
    throw new Error(
      `Medusa inventory item creation failed (${createResponse.status}).`,
    )
  }
  const createPayload = await readJson<{
    inventory_item?: { id?: unknown }
  }>(createResponse)
  const inventoryItemId = createPayload.inventory_item?.id
  if (typeof inventoryItemId !== 'string') {
    throw new Error('Medusa inventory item id not found.')
  }
  return inventoryItemId
}

async function ensureInventoryLevel({
  backendUrl,
  fetchImpl,
  headers,
  inventoryItemId,
  locationId,
  stockedQuantity,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  headers: Record<string, string>
  inventoryItemId: string
  locationId: string
  stockedQuantity: number
}): Promise<void> {
  const locationLevelsPath = `${backendUrl}/admin/inventory-items/${encodeURIComponent(
    inventoryItemId,
  )}/location-levels`
  const lookupResponse = await fetchImpl(locationLevelsPath, { headers })
  if (!lookupResponse.ok) {
    throw new Error(
      `Medusa inventory level lookup failed (${lookupResponse.status}).`,
    )
  }
  const lookupPayload = await readJson<{
    inventory_levels?: Array<{
      location_id?: unknown
      stocked_quantity?: unknown
    }>
  }>(lookupResponse)
  const existingLevel = lookupPayload.inventory_levels?.find(
    (level) => level.location_id === locationId,
  )
  if (existingLevel !== undefined) {
    if (existingLevel.stocked_quantity === stockedQuantity) return

    const updateResponse = await fetchImpl(
      `${locationLevelsPath}/${encodeURIComponent(locationId)}`,
      {
        body: JSON.stringify({ stocked_quantity: stockedQuantity }),
        headers,
        method: 'POST',
      },
    )
    if (!updateResponse.ok) {
      throw new Error(
        `Medusa inventory level update failed (${updateResponse.status}).`,
      )
    }
    return
  }

  const createResponse = await fetchImpl(locationLevelsPath, {
    body: JSON.stringify({
      location_id: locationId,
      stocked_quantity: stockedQuantity,
    }),
    headers,
    method: 'POST',
  })
  if (!createResponse.ok) {
    throw new Error(
      `Medusa inventory level creation failed (${createResponse.status}).`,
    )
  }
}

async function prepareMedusaVariantInventory({
  backendUrl,
  fetchImpl,
  product,
  salesChannelId,
  sessionId,
  token,
}: {
  backendUrl: string
  fetchImpl: FetchLike
  product: GeneratedCommerceProduct
  salesChannelId: string
  sessionId: string
  token: string
}): Promise<
  Map<
    string,
    {
      generatedSku: string
      inventoryItemId: string
      providerSku: string
    }
  >
> {
  const managedVariants =
    product.variants?.filter((variant) => variant.manageInventory) ?? []
  if (managedVariants.length === 0) return new Map()

  const headers = createAdminHeaders(token)
  const locationId = await loadStockLocationId({
    backendUrl,
    fetchImpl,
    headers,
  })
  await ensureSalesChannelStockLocation({
    backendUrl,
    fetchImpl,
    headers,
    locationId,
    salesChannelId,
  })
  const preparedInventory = new Map<
    string,
    {
      generatedSku: string
      inventoryItemId: string
      providerSku: string
    }
  >()

  for (const variant of managedVariants) {
    const generatedSku = deterministicVariantSku(product.handle, variant)
    const providerSku = createTenantScopedVariantSku(
      sessionId,
      product.handle,
      variant,
    )
    const inventoryItemId = await getOrCreateInventoryItem({
      backendUrl,
      fetchImpl,
      generatedSku,
      headers,
      product,
      sessionId,
      sku: providerSku,
      variant,
    })
    await ensureInventoryLevel({
      backendUrl,
      fetchImpl,
      headers,
      inventoryItemId,
      locationId,
      stockedQuantity: variant.inventoryQuantity ?? 0,
    })
    preparedInventory.set(variant.sourceId, {
      generatedSku,
      inventoryItemId,
      providerSku,
    })
  }

  return preparedInventory
}

function createProductBody({
  collectionId,
  currencyCode,
  defaults,
  handle,
  preparedInventory,
  product,
  sessionId,
}: {
  collectionId?: string
  currencyCode: string
  defaults: MedusaProductDefaults
  handle: string
  preparedInventory: Map<
    string,
    {
      generatedSku: string
      inventoryItemId: string
      providerSku: string
    }
  >
  product: GeneratedCommerceProduct
  sessionId: string
}) {
  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : [
          {
            manageInventory: false,
            optionValues: { Default: 'Default' },
            prices: [{ amount: product.price, currencyCode }],
            sourceId: `variant:${product.handle}:default`,
            title: 'Default',
          },
        ]
  const derivedOptions = new Map<string, Array<string>>()
  for (const variant of variants) {
    for (const [title, value] of Object.entries(variant.optionValues)) {
      const values = derivedOptions.get(title) ?? []
      if (!values.includes(value)) values.push(value)
      derivedOptions.set(title, values)
    }
  }
  const options =
    product.options && product.options.length > 0
      ? product.options.map(({ title, values }) => ({ title, values }))
      : derivedOptions.size > 0
        ? Array.from(derivedOptions, ([title, values]) => ({ title, values }))
        : [{ title: 'Default', values: ['Default'] }]

  return {
    ...(collectionId === undefined ? {} : { collection_id: collectionId }),
    ...(product.description === undefined
      ? {}
      : { description: product.description }),
    handle,
    ...(product.images === undefined
      ? {}
      : { images: product.images.map(({ url }) => ({ url })) }),
    metadata: {
      ship_fast_generated_handle: product.handle,
      ship_fast_generated_product: true,
      ship_fast_generated_source_id:
        product.sourceId ?? `product:${product.handle}`,
      ship_fast_session_id: sessionId,
    },
    options,
    sales_channels: [{ id: defaults.tenant.salesChannelId }],
    shipping_profile_id: defaults.shippingProfileId,
    status: 'published',
    ...(product.tags === undefined
      ? {}
      : {
          tags: product.tags.map((tag) => ({ value: tag.value })),
        }),
    ...(product.thumbnail === undefined
      ? {}
      : { thumbnail: product.thumbnail }),
    title: product.title,
    variants: variants.map((variant) => {
      const inventory = preparedInventory.get(variant.sourceId)
      const generatedSku =
        inventory?.generatedSku ??
        deterministicVariantSku(product.handle, variant)
      const providerSku =
        inventory?.providerSku ??
        createTenantScopedVariantSku(sessionId, product.handle, variant)
      return {
        ...(inventory === undefined
          ? {}
          : {
              inventory_items: [
                {
                  inventory_item_id: inventory.inventoryItemId,
                  required_quantity: 1,
                },
              ],
            }),
        manage_inventory: variant.manageInventory,
        metadata: {
          ship_fast_generated_sku: generatedSku,
          ship_fast_generated_source_id: variant.sourceId,
        },
        options:
          Object.keys(variant.optionValues).length > 0
            ? variant.optionValues
            : { Default: 'Default' },
        prices: variant.prices.map((price) => ({
          amount: parsePriceToMedusaAmount(price.amount),
          currency_code: price.currencyCode.toLowerCase(),
        })),
        sku: providerSku,
        title: variant.title,
      }
    }),
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

      const collectionId = await resolveProductCollectionId({
        backendUrl: normalizedBackendUrl,
        fetchImpl,
        product,
        sessionId,
        token: auth.token,
      })
      const preparedInventory = await prepareMedusaVariantInventory({
        backendUrl: normalizedBackendUrl,
        fetchImpl,
        product,
        salesChannelId: defaults.tenant.salesChannelId,
        sessionId,
        token: auth.token,
      })
      const response = await fetchImpl(
        `${normalizedBackendUrl}/admin/products`,
        {
          body: JSON.stringify(
            createProductBody({
              collectionId,
              currencyCode,
              defaults,
              handle,
              preparedInventory,
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
