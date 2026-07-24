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

type EnsureMedusaSessionTenantInput = Omit<
  SyncGeneratedProductsToMedusaInput,
  'currencyCode' | 'products'
>

type EnsureMedusaSessionTenantResult = {
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

type ExistingMedusaPrice = {
  currencyCode?: string
  id?: string
}

type ExistingMedusaVariant = {
  id?: string
  metadata: Record<string, unknown>
  prices: Array<ExistingMedusaPrice>
  sku?: string
  title?: string
}

type ExistingMedusaProduct = {
  id: string
  metadata: Record<string, unknown>
  variants: Array<ExistingMedusaVariant>
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
  return await response.json()
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
  const match = items?.find((item) => typeof item.id === 'string')
  return typeof match?.id === 'string' ? match.id : undefined
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (isRecord(value)) {
    return `{${Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function stableHash(value: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

function generatedProductVariants(
  product: GeneratedCommerceProduct,
  currencyCode: string,
): Array<CommerceProductVariant> {
  return product.variants && product.variants.length > 0
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
}

export function createGeneratedProductSyncSignature(
  product: GeneratedCommerceProduct,
  currencyCode = 'usd',
): string {
  const payload = {
    collections:
      product.collections?.map(({ handle, sourceId, title }) => ({
        handle,
        sourceId,
        title,
      })) ?? [],
    description: product.description ?? null,
    handle: product.handle,
    images: product.images?.map(({ url }) => ({ url })) ?? [],
    options:
      product.options?.map(({ title, values }) => ({
        title,
        values: [...values].sort(),
      })) ?? [],
    price: product.price,
    sourceId: product.sourceId ?? `product:${product.handle}`,
    tags:
      product.tags
        ?.map(({ value }) => ({ value }))
        .sort((left, right) => left.value.localeCompare(right.value)) ?? [],
    thumbnail: product.thumbnail ?? null,
    title: product.title,
    variants: generatedProductVariants(product, currencyCode).map(
      ({
        inventoryQuantity,
        manageInventory,
        optionValues,
        prices,
        sku,
        sourceId,
        title,
      }) => ({
        inventoryQuantity: inventoryQuantity ?? null,
        manageInventory,
        optionValues,
        prices: prices.map(({ amount, currencyCode: priceCurrencyCode }) => ({
          amount: parsePriceToMedusaAmount(amount),
          currencyCode: priceCurrencyCode.toLowerCase(),
        })),
        sku: sku ?? null,
        sourceId,
        title,
      }),
    ),
  }
  return `v1:${stableHash(stableJson(payload))}`
}

function medusaProductSyncWarning(error: unknown): string {
  if (error instanceof Error) {
    const adminAuthStatus = error.message.match(
      /^Medusa Admin authentication failed \((\d{3})\)\.$/,
    )?.[1]

    if (adminAuthStatus !== undefined) {
      return `Medusa Admin authentication failed (${adminAuthStatus}). Check the configured Medusa admin email and password.`
    }
  }

  return 'Medusa product sync failed.'
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
    (channel) => typeof channel.id === 'string' && channel.name === tenantName,
  )
  const existingSalesChannelId =
    typeof existingSalesChannel?.id === 'string'
      ? existingSalesChannel.id
      : undefined
  const salesChannelId =
    existingSalesChannelId ??
    (await createTenantSalesChannel({
      backendUrl,
      fetchImpl,
      headers,
      tenantName,
      sessionId,
    }))
  const existingApiKeyCandidate = apiKeys.api_keys?.find(
    (key) =>
      typeof key.id === 'string' &&
      key.title === tenantName &&
      key.type === 'publishable' &&
      typeof key.token === 'string' &&
      key.token.trim().length > 0,
  )
  const existingApiKeyId =
    typeof existingApiKeyCandidate?.id === 'string'
      ? existingApiKeyCandidate.id
      : undefined
  const existingApiKeyToken =
    typeof existingApiKeyCandidate?.token === 'string'
      ? existingApiKeyCandidate.token
      : undefined
  const existingApiKey =
    existingApiKeyId === undefined || existingApiKeyToken === undefined
      ? undefined
      : {
          id: existingApiKeyId,
          sales_channels: existingApiKeyCandidate?.sales_channels,
          token: existingApiKeyToken,
        }
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

export async function ensureMedusaSessionTenant({
  adminApiToken,
  adminEmail,
  adminPassword,
  backendUrl,
  fetch: fetchOverride,
  sessionId,
}: EnsureMedusaSessionTenantInput): Promise<EnsureMedusaSessionTenantResult> {
  const fetchImpl = fetchOverride ?? fetch

  try {
    const normalizedBackendUrl = normalizeBackendUrl(backendUrl)
    const auth = await authenticateAdmin({
      adminApiToken,
      adminEmail,
      adminPassword,
      backendUrl: normalizedBackendUrl,
      fetchImpl,
    })

    if (auth === undefined) {
      return {
        warning: 'Medusa Admin API credentials are not configured.',
      }
    }

    const defaults = await loadProductDefaults({
      backendUrl: normalizedBackendUrl,
      fetchImpl,
      sessionId,
      token: auth.token,
    })

    return { tenant: defaults.tenant }
  } catch {
    return {
      warning: 'Medusa tenant setup failed.',
    }
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
}): Promise<ExistingMedusaProduct | undefined> {
  const response = await fetchImpl(
    `${backendUrl}/admin/products?handle=${encodeURIComponent(
      handle,
    )}&limit=1&fields=${encodeURIComponent(
      '+metadata,*variants,+variants.metadata,*variants.prices,+variants.sku',
    )}`,
    { headers: createAdminHeaders(token) },
  )

  if (!response.ok) {
    throw new Error(`Medusa product lookup failed (${response.status}).`)
  }

  const payload = await readJson<{ products?: Array<unknown> }>(response)
  const product = payload.products?.[0]
  if (!isRecord(product)) return undefined
  const productId = stringValue(product.id)
  if (productId === undefined) return undefined
  return {
    id: productId,
    metadata: isRecord(product.metadata) ? product.metadata : {},
    variants: Array.isArray(product.variants)
      ? product.variants.flatMap(normalizeExistingMedusaVariant)
      : [],
  }
}

function normalizeExistingMedusaPrice(
  price: unknown,
): Array<ExistingMedusaPrice> {
  if (!isRecord(price)) return []
  const currencyCode = stringValue(price.currency_code)
  const id = stringValue(price.id)
  return [
    {
      ...(currencyCode === undefined
        ? {}
        : { currencyCode: currencyCode.toLowerCase() }),
      ...(id === undefined ? {} : { id }),
    },
  ]
}

function normalizeExistingMedusaVariant(
  variant: unknown,
): Array<ExistingMedusaVariant> {
  if (!isRecord(variant)) return []
  const id = stringValue(variant.id)
  const sku = stringValue(variant.sku)
  const title = stringValue(variant.title)
  return [
    {
      ...(id === undefined ? {} : { id }),
      metadata: isRecord(variant.metadata) ? variant.metadata : {},
      prices: Array.isArray(variant.prices)
        ? variant.prices.flatMap(normalizeExistingMedusaPrice)
        : [],
      ...(sku === undefined ? {} : { sku }),
      ...(title === undefined ? {} : { title }),
    },
  ]
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
  existingProduct,
  handle,
  preparedInventory,
  product,
  sessionId,
  syncSignature,
}: {
  collectionId?: string
  currencyCode: string
  defaults: MedusaProductDefaults
  existingProduct?: ExistingMedusaProduct
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
  syncSignature: string
}) {
  const variants = generatedProductVariants(product, currencyCode)
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
      ship_fast_generated_sync_signature: syncSignature,
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
      const existingVariant = existingProduct?.variants.find((candidate) => {
        const sourceId = stringValue(
          candidate.metadata.ship_fast_generated_source_id,
        )
        return (
          sourceId === variant.sourceId ||
          candidate.sku === variant.sku ||
          candidate.title === variant.title
        )
      })
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
        ...(existingVariant?.id === undefined
          ? {}
          : { id: existingVariant.id }),
        options:
          Object.keys(variant.optionValues).length > 0
            ? variant.optionValues
            : { Default: 'Default' },
        prices: variant.prices.map((price) => ({
          amount: parsePriceToMedusaAmount(price.amount),
          currency_code: price.currencyCode.toLowerCase(),
          ...(existingVariant?.prices.find(
            (existingPrice) =>
              existingPrice.currencyCode === price.currencyCode.toLowerCase(),
          )?.id === undefined
            ? {}
            : {
                id: existingVariant.prices.find(
                  (existingPrice) =>
                    existingPrice.currencyCode ===
                    price.currencyCode.toLowerCase(),
                )?.id,
              }),
        })),
        sku: providerSku,
        title: variant.title,
      }
    }),
  }
}

async function updateExistingProduct({
  backendUrl,
  body,
  existingProductId,
  fetchImpl,
  headers,
}: {
  backendUrl: string
  body: unknown
  existingProductId: string
  fetchImpl: FetchLike
  headers: Record<string, string>
}): Promise<void> {
  const response = await fetchImpl(
    `${backendUrl}/admin/products/${encodeURIComponent(existingProductId)}`,
    {
      body: JSON.stringify(body),
      headers,
      method: 'POST',
    },
  )

  if (!response.ok) {
    throw new Error(`Medusa product update failed (${response.status}).`)
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
      const syncSignature = createGeneratedProductSyncSignature(
        product,
        currencyCode,
      )
      const existingProduct = await findExistingProductId({
        backendUrl: normalizedBackendUrl,
        fetchImpl,
        handle,
        token: auth.token,
      })
      const headers = createAdminHeaders(auth.token)

      if (existingProduct !== undefined) {
        const existingSignature = stringValue(
          existingProduct.metadata.ship_fast_generated_sync_signature,
        )
        if (existingSignature === undefined) {
          await updateExistingProduct({
            backendUrl: normalizedBackendUrl,
            body: {
              metadata: {
                ship_fast_generated_handle: product.handle,
                ship_fast_generated_product: true,
                ship_fast_generated_source_id:
                  product.sourceId ?? `product:${product.handle}`,
                ship_fast_generated_sync_signature: syncSignature,
                ship_fast_session_id: sessionId,
              },
            },
            existingProductId: existingProduct.id,
            fetchImpl,
            headers,
          })
        } else if (existingSignature !== syncSignature) {
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
          await updateExistingProduct({
            backendUrl: normalizedBackendUrl,
            body: createProductBody({
              collectionId,
              currencyCode,
              defaults,
              existingProduct,
              handle,
              preparedInventory,
              product,
              sessionId,
              syncSignature,
            }),
            existingProductId: existingProduct.id,
            fetchImpl,
            headers,
          })
        }
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
              syncSignature,
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
  } catch (error) {
    return {
      synced: 0,
      warning: medusaProductSyncWarning(error),
    }
  }
}
