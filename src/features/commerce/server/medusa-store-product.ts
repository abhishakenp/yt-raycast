import type {
  CommerceMoney,
  CommerceProduct,
  CommerceProductCollection,
  CommerceProductImage,
  CommerceProductOption,
  CommerceProductTag,
  CommerceProductVariant,
} from '../contracts'

export const medusaStoreProductFields = [
  '*variants.calculated_price',
  '+metadata',
  '*images',
  '*collection',
  '*tags',
  '*options',
  '*options.values',
  '*variants',
  '*variants.options',
  '*variants.options.option',
  '+variants.inventory_quantity',
  '+variants.manage_inventory',
  '+variants.sku',
  '+variants.metadata',
  '*variants.prices',
].join(',')

export type MedusaCommerceProduct = CommerceProduct & {
  currencyCode?: string
  price?: number
  sourceHandle: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function nonNegativeNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : undefined
}

function sourceId(value: Record<string, unknown>): string | undefined {
  return (
    stringValue(value.id) ??
    (isRecord(value.metadata)
      ? stringValue(value.metadata.ship_fast_generated_source_id)
      : undefined)
  )
}

function normalizeMoney(
  value: unknown,
  amountKey: string,
): CommerceMoney | undefined {
  if (!isRecord(value)) return undefined
  const amount = nonNegativeNumber(value[amountKey])
  const currencyCode = stringValue(value.currency_code)?.toLowerCase()
  return amount === undefined || currencyCode === undefined
    ? undefined
    : { amount, currencyCode }
}

function normalizeImages(value: unknown): Array<CommerceProductImage> {
  return !Array.isArray(value)
    ? []
    : value.flatMap((image) => {
        if (!isRecord(image)) return []
        const url = stringValue(image.url)
        if (url === undefined) return []
        const alt = stringValue(image.alt) ?? stringValue(image.alt_text)
        const imageSourceId = sourceId(image)
        return [
          {
            ...(alt === undefined ? {} : { alt }),
            ...(imageSourceId === undefined ? {} : { sourceId: imageSourceId }),
            url,
          },
        ]
      })
}

function normalizeCollections(
  value: Record<string, unknown>,
): Array<CommerceProductCollection> {
  const candidates = [
    ...(Array.isArray(value.collections) ? value.collections : []),
    ...(isRecord(value.collection) ? [value.collection] : []),
  ]
  return candidates.flatMap((collection) => {
    if (!isRecord(collection)) return []
    const title = stringValue(collection.title)
    const handle = stringValue(collection.handle)
    if (title === undefined || handle === undefined) return []
    const collectionSourceId = sourceId(collection)
    return [
      {
        handle,
        ...(collectionSourceId === undefined
          ? {}
          : { sourceId: collectionSourceId }),
        title,
      },
    ]
  })
}

function normalizeTags(value: unknown): Array<CommerceProductTag> {
  return !Array.isArray(value)
    ? []
    : value.flatMap((tag) => {
        if (!isRecord(tag)) return []
        const normalizedValue = stringValue(tag.value)
        if (normalizedValue === undefined) return []
        const tagSourceId = sourceId(tag)
        return [
          {
            ...(tagSourceId === undefined ? {} : { sourceId: tagSourceId }),
            value: normalizedValue,
          },
        ]
      })
}

function optionValues(value: unknown): Array<string> {
  return !Array.isArray(value)
    ? []
    : value.flatMap((optionValue) => {
        const normalizedValue =
          typeof optionValue === 'string'
            ? stringValue(optionValue)
            : isRecord(optionValue)
              ? stringValue(optionValue.value)
              : undefined
        return normalizedValue === undefined ? [] : [normalizedValue]
      })
}

function normalizeOptions(value: unknown): Array<CommerceProductOption> {
  return !Array.isArray(value)
    ? []
    : value.flatMap((option) => {
        if (!isRecord(option)) return []
        const title = stringValue(option.title)
        if (title === undefined) return []
        const optionSourceId = sourceId(option)
        return [
          {
            ...(optionSourceId === undefined
              ? {}
              : { sourceId: optionSourceId }),
            title,
            values: optionValues(option.values),
          },
        ]
      })
}

function normalizeVariantOptionValues(
  value: unknown,
  optionTitles: Map<string, string>,
): Record<string, string> {
  if (!Array.isArray(value)) return {}
  return Object.fromEntries(
    value.flatMap((optionValue) => {
      if (!isRecord(optionValue)) return []
      const normalizedValue = stringValue(optionValue.value)
      const nestedOption = isRecord(optionValue.option)
        ? optionValue.option
        : undefined
      const title =
        stringValue(nestedOption?.title) ??
        stringValue(optionValue.title) ??
        optionTitles.get(stringValue(optionValue.option_id) ?? '')
      return title === undefined || normalizedValue === undefined
        ? []
        : [[title, normalizedValue]]
    }),
  )
}

function normalizeVariant(
  value: unknown,
  productSourceId: string,
  optionTitles: Map<string, string>,
): CommerceProductVariant | undefined {
  if (!isRecord(value)) return undefined
  const title = stringValue(value.title) ?? 'Default'

  const metadata = isRecord(value.metadata) ? value.metadata : {}
  const generatedSku =
    stringValue(metadata.ship_fast_generated_sku) ?? stringValue(value.sku)
  const providerId = stringValue(value.id)
  const variantSourceId =
    stringValue(metadata.ship_fast_generated_source_id) ??
    providerId ??
    `${productSourceId}:${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const calculatedPrice = normalizeMoney(
    value.calculated_price,
    'calculated_amount',
  )
  const originalPrice = normalizeMoney(
    value.calculated_price,
    'original_amount',
  )
  const prices = Array.isArray(value.prices)
    ? value.prices
        .map((price) => normalizeMoney(price, 'amount'))
        .filter((price) => price !== undefined)
    : []
  const inventoryQuantity = nonNegativeNumber(value.inventory_quantity)
  const manageInventory =
    typeof value.manage_inventory === 'boolean' ? value.manage_inventory : false
  const explicitAvailability =
    typeof value.available === 'boolean'
      ? value.available
      : typeof value.is_available === 'boolean'
        ? value.is_available
        : undefined
  const available =
    explicitAvailability ??
    (manageInventory
      ? inventoryQuantity === undefined
        ? undefined
        : inventoryQuantity > 0
      : true)

  return {
    ...(available === undefined ? {} : { available }),
    ...(calculatedPrice === undefined ? {} : { calculatedPrice }),
    ...(providerId === undefined ? {} : { id: providerId }),
    ...(inventoryQuantity === undefined ? {} : { inventoryQuantity }),
    manageInventory,
    optionValues: normalizeVariantOptionValues(value.options, optionTitles),
    ...(originalPrice === undefined ? {} : { originalPrice }),
    prices:
      prices.length > 0
        ? prices
        : calculatedPrice === undefined
          ? []
          : [calculatedPrice],
    ...(generatedSku === undefined ? {} : { sku: generatedSku }),
    sourceId: variantSourceId,
    title,
  }
}

export function normalizeMedusaStoreProduct(
  tenantId: string,
  value: unknown,
): MedusaCommerceProduct | undefined {
  if (!isRecord(value)) return undefined
  const metadata = isRecord(value.metadata) ? value.metadata : {}
  const taggedTenantIds = [
    stringValue(metadata.ship_fast_session_id),
    stringValue(metadata.ship_fast_tenant_id),
  ].filter((taggedTenantId) => taggedTenantId !== undefined)
  if (taggedTenantIds.some((taggedTenantId) => taggedTenantId !== tenantId)) {
    return undefined
  }

  const title = stringValue(value.title)
  const handle = stringValue(value.handle)
  if (title === undefined || handle === undefined) return undefined

  const providerId = stringValue(value.id)
  const productSourceId =
    stringValue(metadata.ship_fast_generated_source_id) ?? providerId ?? handle
  const sourceHandle =
    metadata.ship_fast_generated_product === true
      ? (stringValue(metadata.ship_fast_generated_handle) ?? handle)
      : handle
  const options = normalizeOptions(value.options)
  const optionTitles = new Map(
    options.flatMap((option) =>
      option.sourceId === undefined ? [] : [[option.sourceId, option.title]],
    ),
  )
  const variants = Array.isArray(value.variants)
    ? value.variants
        .map((variant) =>
          normalizeVariant(variant, productSourceId, optionTitles),
        )
        .filter((variant) => variant !== undefined)
    : []
  const firstCalculatedPrice = variants.find(
    (variant) => variant.calculatedPrice !== undefined,
  )?.calculatedPrice

  return {
    collections: normalizeCollections(value),
    ...(firstCalculatedPrice === undefined
      ? {}
      : {
          currencyCode: firstCalculatedPrice.currencyCode,
          price: firstCalculatedPrice.amount,
        }),
    ...(stringValue(value.description) === undefined
      ? {}
      : { description: stringValue(value.description) }),
    handle,
    ...(providerId === undefined ? {} : { id: providerId }),
    images: normalizeImages(value.images),
    options,
    sourceHandle,
    sourceId: productSourceId,
    tags: normalizeTags(value.tags),
    ...(stringValue(value.thumbnail) === undefined
      ? {}
      : { thumbnail: stringValue(value.thumbnail) }),
    title,
    variants,
  }
}
