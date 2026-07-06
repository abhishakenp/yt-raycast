type CountGeneratedCommerceProductsInput = {
  source?: string
  siteSpecJson?: string
}

export type GeneratedCommerceProduct = {
  description?: string
  handle: string
  price: number
  title: string
}

const productNamePropertyPattern =
  /(?:^|[,\s])["']?(?:name|title|handle)["']?\s*:/
const productPricePropertyPattern = /(?:^|[,\s])["']?price["']?\s*:/
const maxGeneratedProducts = 25

const isEscaped = (value: string, index: number): boolean => {
  let backslashes = 0
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === '\\'; cursor--)
    backslashes += 1
  return backslashes % 2 === 1
}

const readDirectObjectText = (
  source: string,
  start: number,
  end: number,
): string => {
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

const isProductObjectText = (directObjectText: string): boolean =>
  productNamePropertyPattern.test(directObjectText) &&
  productPricePropertyPattern.test(directObjectText)

const hasCommerceObjectContext = (source: string, start: number): boolean => {
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

const slugifyProductHandle = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const parsePrice = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return undefined

  const match = value.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)
  if (!match) return undefined

  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? parsed : undefined
}

const readStringProperty = (
  directObjectText: string,
  key: string,
): string | undefined => {
  const pattern = new RegExp(
    `(?:^|[,\\s])["']?${key}["']?\\s*:\\s*(['"\`])([^'"\`]*?)\\1`,
  )
  const value = directObjectText.match(pattern)?.[2]?.trim()
  return value ? value : undefined
}

const readPriceProperty = (directObjectText: string): number | undefined => {
  const stringPrice = readStringProperty(directObjectText, 'price')
  if (stringPrice !== undefined) return parsePrice(stringPrice)

  const numericPrice = directObjectText.match(
    /(?:^|[,\s])["']?price["']?\s*:\s*(-?\d+(?:\.\d+)?)/,
  )?.[1]
  return parsePrice(numericPrice)
}

const productFromObjectText = (
  directObjectText: string,
): GeneratedCommerceProduct | undefined => {
  const title =
    readStringProperty(directObjectText, 'title') ??
    readStringProperty(directObjectText, 'name') ??
    readStringProperty(directObjectText, 'handle')
  const price = readPriceProperty(directObjectText)

  if (title === undefined || price === undefined) return undefined

  const handle =
    slugifyProductHandle(
      readStringProperty(directObjectText, 'handle') ?? title,
    ) || 'generated-product'
  const description = readStringProperty(directObjectText, 'description')

  return {
    ...(description === undefined ? {} : { description }),
    handle,
    price,
    title,
  }
}

const dedupeProducts = (
  products: Array<GeneratedCommerceProduct>,
): Array<GeneratedCommerceProduct> => {
  const seen = new Set<string>()
  const deduped: Array<GeneratedCommerceProduct> = []

  for (const product of products) {
    if (seen.has(product.handle)) continue
    seen.add(product.handle)
    deduped.push(product)
    if (deduped.length >= maxGeneratedProducts) break
  }

  return deduped
}

const extractOpenUiSourceProducts = (
  source: string | undefined,
): Array<GeneratedCommerceProduct> => {
  if (!source?.trim()) return []

  const objectStarts: number[] = []
  let quote: '"' | "'" | '`' | null = null
  const products: Array<GeneratedCommerceProduct> = []

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const isSiteSpecProduct = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) &&
  typeof value.price !== 'undefined' &&
  (typeof value.name === 'string' ||
    typeof value.title === 'string' ||
    typeof value.handle === 'string')

const productFromSiteSpec = (
  value: Record<string, unknown>,
): GeneratedCommerceProduct | undefined => {
  const rawTitle = value.title ?? value.name ?? value.handle
  const title = typeof rawTitle === 'string' ? rawTitle.trim() : undefined
  const price = parsePrice(value.price)

  if (!title || price === undefined) return undefined

  const rawHandle = typeof value.handle === 'string' ? value.handle : title
  const handle = slugifyProductHandle(rawHandle) || 'generated-product'
  const description =
    typeof value.description === 'string' && value.description.trim()
      ? value.description.trim()
      : undefined

  return {
    ...(description === undefined ? {} : { description }),
    handle,
    price,
    title,
  }
}

const extractSiteSpecProductsFromValue = (
  value: unknown,
): Array<GeneratedCommerceProduct> => {
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

const extractSiteSpecJsonProducts = (
  siteSpecJson: string | undefined,
): Array<GeneratedCommerceProduct> => {
  if (!siteSpecJson?.trim()) return []
  try {
    return dedupeProducts(
      extractSiteSpecProductsFromValue(JSON.parse(siteSpecJson) as unknown),
    )
  } catch {
    return []
  }
}

export const extractGeneratedCommerceProducts = ({
  source,
  siteSpecJson,
}: CountGeneratedCommerceProductsInput): Array<GeneratedCommerceProduct> => {
  const siteSpecProducts = extractSiteSpecJsonProducts(siteSpecJson)
  return siteSpecProducts.length > 0
    ? siteSpecProducts
    : extractOpenUiSourceProducts(source)
}

export const countGeneratedCommerceProducts = ({
  source,
  siteSpecJson,
}: CountGeneratedCommerceProductsInput): number => {
  return extractGeneratedCommerceProducts({ source, siteSpecJson }).length
}
