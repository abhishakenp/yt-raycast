import type {
  CommerceProduct,
  CommerceProductCollection,
  CommerceProductImage,
  CommerceProductOption,
  CommerceProductTag,
  CommerceProductVariant,
} from '../contracts'

type CountGeneratedCommerceProductsInput = {
  source?: string
  siteSpecJson?: string
}

export type GeneratedCommerceProduct = {
  collections?: Array<CommerceProductCollection>
  description?: string
  handle: string
  images?: Array<CommerceProductImage>
  options?: Array<CommerceProductOption>
  price: number
  sourceId?: string
  tags?: Array<CommerceProductTag>
  thumbnail?: string
  title: string
  variants?: Array<CommerceProductVariant>
}

export type NormalizedGeneratedCommerceProduct = CommerceProduct & {
  price: number
}

const productNamePropertyPattern =
  /(?:^|[,\s])["']?(?:name|title|handle)["']?\s*:/
const productPricePropertyPattern = /(?:^|[,\s])["']?price["']?\s*:/
const maxGeneratedProducts = 25

function isEscaped(value: string, index: number): boolean {
  let backslashes = 0
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === '\\'; cursor--)
    backslashes += 1
  return backslashes % 2 === 1
}

function readDirectObjectText(
  source: string,
  start: number,
  end: number,
): string {
  let quote: '"' | "'" | '`' | null = null
  let nestedDepth = 0
  let direct = ''

  for (let index = start + 1; index < end; index += 1) {
    const char = source[index]

    if (quote !== null) {
      if (nestedDepth === 0) direct += char
      if (char === quote && !isEscaped(source, index)) quote = null
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      if (nestedDepth === 0) direct += char
      quote = char
      continue
    }

    if (char === '{' || char === '[' || char === '(') {
      nestedDepth += 1
      continue
    }

    if (char === '}' || char === ']' || char === ')') {
      nestedDepth = Math.max(0, nestedDepth - 1)
      continue
    }

    if (nestedDepth === 0) direct += char
  }

  return direct
}

function isProductObjectText(directObjectText: string): boolean {
  return (
    productNamePropertyPattern.test(directObjectText) &&
    productPricePropertyPattern.test(directObjectText)
  )
}

function hasCommerceObjectContext(source: string, start: number): boolean {
  const prefix = source.slice(Math.max(0, start - 320), start)
  return (
    /(?:products?|catalog|collections?|inventory|merchandise)\s*[:=]\s*(?:\{|\[|\()/i.test(
      prefix,
    ) ||
    /\b(?:Store|Shop|Product|Commerce|Catalog|Cart)[A-Za-z0-9_]*\s*\([^)]*$/i.test(
      prefix,
    )
  )
}

function slugifyProductHandle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function stringValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized || undefined
}

function propertyString(
  value: Record<string, unknown>,
  ...keys: Array<string>
): string | undefined {
  for (const key of keys) {
    const candidate = stringValue(value[key])
    if (candidate !== undefined) return candidate
  }
  return undefined
}

function explicitSourceId(value: Record<string, unknown>): string | undefined {
  return propertyString(value, 'sourceId', 'source_id', 'id')
}

function parsePrice(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : undefined
  }
  if (typeof value !== 'string') return undefined

  const normalized = value.replace(/,/g, '').trim()
  if (
    /-/.test(normalized) ||
    /^\(.*\)$/.test(normalized) ||
    /^Infinity$|^NaN$/i.test(normalized)
  ) {
    return undefined
  }
  const match = normalized.match(/-?\d+(?:\.\d+)?/)
  if (!match) return undefined

  const parsed = Number(match[0])
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function normalizeCurrencyCode(value: unknown): string | undefined {
  const normalized = stringValue(value)?.toLowerCase()
  return normalized && /^[a-z]{3}$/.test(normalized) ? normalized : undefined
}

function readStringProperty(
  directObjectText: string,
  key: string,
): string | undefined {
  const pattern = new RegExp(
    `(?:^|[,\\s])["']?${key}["']?\\s*:\\s*(['"\`])([^'"\`]*?)\\1`,
  )
  return stringValue(directObjectText.match(pattern)?.[2])
}

function readPriceProperty(directObjectText: string): number | undefined {
  const stringPrice = readStringProperty(directObjectText, 'price')
  if (stringPrice !== undefined) return parsePrice(stringPrice)

  const numericPrice = directObjectText.match(
    /(?:^|[,\s])["']?price["']?\s*:\s*(-?\d+(?:\.\d+)?)/,
  )?.[1]
  return parsePrice(numericPrice)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeImages(value: unknown): Array<CommerceProductImage> {
  if (!Array.isArray(value)) return []
  return value.flatMap((image) => {
    if (typeof image === 'string') {
      const url = stringValue(image)
      return url === undefined ? [] : [{ url }]
    }
    if (!isRecord(image)) return []
    const url = propertyString(image, 'url', 'src')
    if (url === undefined) return []
    const sourceId = explicitSourceId(image)
    const alt = propertyString(image, 'alt', 'altText', 'alt_text')
    return [
      {
        ...(alt === undefined ? {} : { alt }),
        ...(sourceId === undefined ? {} : { sourceId }),
        url,
      },
    ]
  })
}

function normalizeCollections(
  value: unknown,
): Array<CommerceProductCollection> {
  if (!Array.isArray(value)) return []
  return value.flatMap((collection) => {
    if (!isRecord(collection)) return []
    const title = propertyString(collection, 'title', 'name')
    if (title === undefined) return []
    const handle =
      slugifyProductHandle(propertyString(collection, 'handle') ?? title) ||
      'collection'
    const sourceId = explicitSourceId(collection)
    return [
      {
        handle,
        ...(sourceId === undefined ? {} : { sourceId }),
        title,
      },
    ]
  })
}

function normalizeTags(value: unknown): Array<CommerceProductTag> {
  if (!Array.isArray(value)) return []
  return value.flatMap((tag) => {
    if (typeof tag === 'string') {
      const normalized = stringValue(tag)
      return normalized === undefined ? [] : [{ value: normalized }]
    }
    if (!isRecord(tag)) return []
    const normalized = propertyString(tag, 'value', 'title', 'name')
    if (normalized === undefined) return []
    const sourceId = explicitSourceId(tag)
    return [
      {
        ...(sourceId === undefined ? {} : { sourceId }),
        value: normalized,
      },
    ]
  })
}

function normalizeOptionValues(value: unknown): Array<string> {
  if (!Array.isArray(value)) return []
  return value.flatMap((optionValue) => {
    const normalized =
      typeof optionValue === 'string'
        ? stringValue(optionValue)
        : isRecord(optionValue)
          ? propertyString(optionValue, 'value', 'title', 'name')
          : undefined
    return normalized === undefined ? [] : [normalized]
  })
}

function normalizeOptions(value: unknown): Array<CommerceProductOption> {
  if (!Array.isArray(value)) return []
  return value.flatMap((option) => {
    if (!isRecord(option)) return []
    const title = propertyString(option, 'title', 'name')
    if (title === undefined) return []
    const sourceId = explicitSourceId(option)
    return [
      {
        ...(sourceId === undefined ? {} : { sourceId }),
        title,
        values: normalizeOptionValues(option.values),
      },
    ]
  })
}

function normalizeVariantOptionValues(value: unknown): Record<string, string> {
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, optionValue]) => {
        const normalizedKey = stringValue(key)
        const normalizedValue = stringValue(optionValue)
        return normalizedKey === undefined || normalizedValue === undefined
          ? []
          : [[normalizedKey, normalizedValue]]
      }),
    )
  }
  if (!Array.isArray(value)) return {}
  return Object.fromEntries(
    value.flatMap((optionValue) => {
      if (!isRecord(optionValue)) return []
      const title = propertyString(
        optionValue,
        'title',
        'optionTitle',
        'option_title',
        'name',
      )
      const normalizedValue = propertyString(optionValue, 'value')
      return title === undefined || normalizedValue === undefined
        ? []
        : [[title, normalizedValue]]
    }),
  )
}

function normalizedMoney(
  value: unknown,
  amountKeys: Array<string> = ['amount'],
): { amount: number; currencyCode: string } | undefined {
  if (!isRecord(value)) return undefined
  let amount: number | undefined
  for (const key of amountKeys) {
    amount = parsePrice(value[key])
    if (amount !== undefined) break
  }
  const currencyCode = normalizeCurrencyCode(
    value.currencyCode ?? value.currency_code,
  )
  return amount === undefined || currencyCode === undefined
    ? undefined
    : { amount, currencyCode }
}

function normalizeRichPrices(
  value: unknown,
): Array<{ amount: number; currencyCode: string }> | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  const prices = value.map((price) => normalizedMoney(price))
  if (prices.some((price) => price === undefined)) return undefined
  return prices.filter((price) => price !== undefined)
}

function normalizeInventoryQuantity(value: unknown): number | undefined {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value >= 0
    ? value
    : undefined
}

function derivedVariantSourceId(
  productHandle: string,
  title: string,
  optionValues: Record<string, string>,
): string {
  const variantHandle = slugifyProductHandle(title) || 'default'
  const optionHandle = Object.entries(optionValues)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([key, value]) =>
        `${slugifyProductHandle(key)}-${slugifyProductHandle(value)}`,
    )
    .filter(Boolean)
    .join(':')
  return `variant:${productHandle}:${variantHandle}${optionHandle ? `:${optionHandle}` : ''}`
}

function normalizeRichVariant(
  value: unknown,
  productHandle: string,
): CommerceProductVariant | undefined {
  if (!isRecord(value)) return undefined
  const prices = normalizeRichPrices(value.prices)
  if (prices === undefined) return undefined

  const rawInventoryQuantity =
    value.inventoryQuantity ?? value.inventory_quantity
  const inventoryQuantity = normalizeInventoryQuantity(rawInventoryQuantity)
  if (rawInventoryQuantity !== undefined && inventoryQuantity === undefined) {
    return undefined
  }
  const rawManageInventory = value.manageInventory ?? value.manage_inventory
  if (
    rawManageInventory !== undefined &&
    typeof rawManageInventory !== 'boolean'
  ) {
    return undefined
  }
  const available = value.available ?? value.isAvailable ?? value.is_available
  if (available !== undefined && typeof available !== 'boolean') {
    return undefined
  }

  const title = propertyString(value, 'title', 'name', 'handle') ?? 'Default'
  const optionValues = normalizeVariantOptionValues(
    value.optionValues ?? value.option_values ?? value.options,
  )
  const sourceId =
    explicitSourceId(value) ??
    derivedVariantSourceId(productHandle, title, optionValues)
  const sku = propertyString(value, 'sku')
  const calculatedPrice = normalizedMoney(
    value.calculatedPrice ?? value.calculated_price,
    ['amount', 'calculatedAmount', 'calculated_amount'],
  )
  const originalPrice = normalizedMoney(
    value.originalPrice ?? value.original_price,
    ['amount', 'originalAmount', 'original_amount'],
  )

  return {
    ...(available === undefined ? {} : { available }),
    ...(calculatedPrice === undefined ? {} : { calculatedPrice }),
    ...(inventoryQuantity === undefined ? {} : { inventoryQuantity }),
    manageInventory: rawManageInventory ?? false,
    optionValues,
    ...(originalPrice === undefined ? {} : { originalPrice }),
    prices,
    ...(sku === undefined ? {} : { sku }),
    sourceId,
    title,
  }
}

function dedupeVariants(
  variants: Array<CommerceProductVariant>,
): Array<CommerceProductVariant> {
  const seen = new Set<string>()
  return variants.filter((variant) => {
    if (seen.has(variant.sourceId)) return false
    seen.add(variant.sourceId)
    return true
  })
}

function normalizedLegacyProduct(
  value: Record<string, unknown>,
  title: string,
  handle: string,
): NormalizedGeneratedCommerceProduct | undefined {
  const price = parsePrice(value.price)
  if (price === undefined) return undefined
  const rawCurrencyCode = value.currencyCode ?? value.currency_code
  const currencyCode =
    rawCurrencyCode === undefined
      ? 'usd'
      : normalizeCurrencyCode(rawCurrencyCode)
  if (currencyCode === undefined) return undefined

  const sourceId = explicitSourceId(value) ?? `product:${handle}`
  const description = propertyString(value, 'description')
  const thumbnail = propertyString(value, 'thumbnail')
  return {
    collections: normalizeCollections(value.collections),
    ...(description === undefined ? {} : { description }),
    handle,
    images: normalizeImages(value.images),
    options: normalizeOptions(value.options),
    price,
    sourceId,
    tags: normalizeTags(value.tags),
    ...(thumbnail === undefined ? {} : { thumbnail }),
    title,
    variants: [
      {
        manageInventory: false,
        optionValues: {},
        prices: [{ amount: price, currencyCode }],
        sourceId: `variant:${handle}:default`,
        title: 'Default',
      },
    ],
  }
}

function productFromSiteSpec(
  value: Record<string, unknown>,
): NormalizedGeneratedCommerceProduct | undefined {
  const title = propertyString(value, 'title', 'name', 'handle')
  if (title === undefined) return undefined
  const handle =
    slugifyProductHandle(propertyString(value, 'handle') ?? title) ||
    'generated-product'

  if (!Array.isArray(value.variants)) {
    return normalizedLegacyProduct(value, title, handle)
  }

  const variants = dedupeVariants(
    value.variants
      .map((variant) => normalizeRichVariant(variant, handle))
      .filter((variant) => variant !== undefined),
  )
  const firstPrice =
    variants[0]?.calculatedPrice?.amount ?? variants[0]?.prices[0]?.amount
  if (firstPrice === undefined) return undefined

  const sourceId = explicitSourceId(value) ?? `product:${handle}`
  const description = propertyString(value, 'description')
  const thumbnail = propertyString(value, 'thumbnail')
  return {
    collections: normalizeCollections(value.collections),
    ...(description === undefined ? {} : { description }),
    handle,
    images: normalizeImages(value.images),
    options: normalizeOptions(value.options),
    price: firstPrice,
    sourceId,
    tags: normalizeTags(value.tags),
    ...(thumbnail === undefined ? {} : { thumbnail }),
    title,
    variants,
  }
}

function productFromObjectText(
  directObjectText: string,
): NormalizedGeneratedCommerceProduct | undefined {
  const title =
    readStringProperty(directObjectText, 'title') ??
    readStringProperty(directObjectText, 'name') ??
    readStringProperty(directObjectText, 'handle')
  const price = readPriceProperty(directObjectText)
  if (title === undefined || price === undefined) return undefined

  const rawHandle = readStringProperty(directObjectText, 'handle') ?? title
  const handle = slugifyProductHandle(rawHandle) || 'generated-product'
  const description = readStringProperty(directObjectText, 'description')
  return normalizedLegacyProduct(
    {
      ...(description === undefined ? {} : { description }),
      handle,
      price,
      title,
    },
    title,
    handle,
  )
}

function dedupeProducts(
  products: Array<NormalizedGeneratedCommerceProduct>,
): Array<NormalizedGeneratedCommerceProduct> {
  const seenHandles = new Set<string>()
  const seenSourceIds = new Set<string>()
  const deduped: Array<NormalizedGeneratedCommerceProduct> = []

  for (const product of products) {
    if (
      seenHandles.has(product.handle) ||
      seenSourceIds.has(product.sourceId)
    ) {
      continue
    }
    seenHandles.add(product.handle)
    seenSourceIds.add(product.sourceId)
    deduped.push(product)
    if (deduped.length >= maxGeneratedProducts) break
  }

  return deduped
}

function extractOpenUiSourceProducts(
  source: string | undefined,
): Array<NormalizedGeneratedCommerceProduct> {
  if (!source?.trim()) return []

  const objectStarts: Array<number> = []
  let quote: '"' | "'" | '`' | null = null
  const products: Array<NormalizedGeneratedCommerceProduct> = []

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]

    if (quote !== null) {
      if (char === quote && !isEscaped(source, index)) quote = null
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char
      continue
    }

    if (char === '{') {
      objectStarts.push(index)
      continue
    }

    if (char !== '}') continue

    const start = objectStarts.pop()
    if (start === undefined) continue

    const objectText = readDirectObjectText(source, start, index)
    if (!isProductObjectText(objectText)) continue
    if (!hasCommerceObjectContext(source, start)) continue

    const product = productFromObjectText(objectText)
    if (product !== undefined) products.push(product)
  }

  return dedupeProducts(products)
}

function isSiteSpecProduct(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    (value.price !== undefined || Array.isArray(value.variants)) &&
    (typeof value.name === 'string' ||
      typeof value.title === 'string' ||
      typeof value.handle === 'string')
  )
}

function extractSiteSpecProductsFromValue(
  value: unknown,
): Array<NormalizedGeneratedCommerceProduct> {
  if (Array.isArray(value)) {
    const directProducts = value
      .filter(isSiteSpecProduct)
      .map(productFromSiteSpec)
      .filter((product) => product !== undefined)
    if (directProducts.length > 0) return directProducts
    return value.flatMap(extractSiteSpecProductsFromValue)
  }

  if (!isRecord(value)) return []

  return Object.entries(value).flatMap(([key, child]) => {
    if (/products?|catalog|collections?|items/i.test(key)) {
      const childProducts = extractSiteSpecProductsFromValue(child)
      if (childProducts.length > 0) return childProducts
    }
    return extractSiteSpecProductsFromValue(child)
  })
}

function extractSiteSpecJsonProducts(
  siteSpecJson: string | undefined,
): Array<NormalizedGeneratedCommerceProduct> {
  if (!siteSpecJson?.trim()) return []
  try {
    const parsed: unknown = JSON.parse(siteSpecJson)
    return dedupeProducts(extractSiteSpecProductsFromValue(parsed))
  } catch {
    return []
  }
}

export function extractGeneratedCommerceProducts({
  source,
  siteSpecJson,
}: CountGeneratedCommerceProductsInput): Array<NormalizedGeneratedCommerceProduct> {
  const siteSpecProducts = extractSiteSpecJsonProducts(siteSpecJson)
  return siteSpecProducts.length > 0
    ? siteSpecProducts
    : extractOpenUiSourceProducts(source)
}

export function countGeneratedCommerceProducts({
  source,
  siteSpecJson,
}: CountGeneratedCommerceProductsInput): number {
  return extractGeneratedCommerceProducts({ source, siteSpecJson }).length
}
