import type { GeneratedCommerceProduct } from '@/features/commerce/services/generated-commerce-products'

export type MedusaPreviewProduct = {
  currencyCode?: string
  handle: string
  price?: number
  sourceHandle: string
  title: string
}

type ApplyMedusaProductsInput = {
  generatedProducts: Array<GeneratedCommerceProduct>
  medusaProducts: Array<MedusaPreviewProduct>
}

// Map currency codes to a native locale so prices are formatted the way the
// currency is conventionally written (e.g. EUR → "15,00 €" rather than the
// en-US "€15.00"). Falls back to en-US for unknown/unsupported currencies.
const CURRENCY_LOCALE: Record<string, string> = {
  EUR: 'de-DE',
  USD: 'en-US',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CHF: 'de-CH',
  CAD: 'en-CA',
  AUD: 'en-AU',
  CNY: 'zh-CN',
  INR: 'en-IN',
  BRL: 'pt-BR',
}

function localeForCurrency(currency: string): string {
  return CURRENCY_LOCALE[currency] ?? 'en-US'
}

function formatPrice(
  price: number | undefined,
  currencyCode: string | undefined,
): string | undefined {
  if (price === undefined) return undefined
  const normalizedCurrency = currencyCode?.trim().toUpperCase()
  if (!normalizedCurrency) return `$${price.toFixed(2)}`

  try {
    return (
      new Intl.NumberFormat(localeForCurrency(normalizedCurrency), {
        currency: normalizedCurrency,
        style: 'currency',
      })
        .format(price)
        // Intl currency formatting uses non-breaking spaces (U+00A0 / U+202F)
        // between the amount and the symbol for many locales. Normalize them to
        // a regular space so the rendered text matches conventional output
        // (e.g. "15,00 €" rather than "15,00\u00a0€").
        .replace(/[\u00A0\u202F]/g, ' ')
    )
  } catch {
    return `$${price.toFixed(2)}`
  }
}

function collectTextNodes(root: HTMLElement): Array<Text> {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Array<Text> = []
  let node = walker.nextNode()
  while (node !== null) {
    nodes.push(node as Text)
    node = walker.nextNode()
  }
  return nodes
}

function replaceText(root: HTMLElement, from: string, to: string): void {
  if (!from.trim() || from === to) return
  for (const node of collectTextNodes(root)) {
    if (!node.nodeValue?.includes(from)) continue
    node.nodeValue = node.nodeValue.split(from).join(to)
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replacePriceText(root: HTMLElement, from: string, to: string): void {
  if (!from.trim() || from === to) return
  const pattern = new RegExp(`${escapeRegExp(from)}(?![\\d.,])`, 'g')
  for (const node of collectTextNodes(root)) {
    if (!node.nodeValue || !pattern.test(node.nodeValue)) continue
    node.nodeValue = node.nodeValue.replace(pattern, to)
    pattern.lastIndex = 0
  }
}

function priceCandidates(price: number): Array<string> {
  const rounded = Number.isInteger(price) ? String(price) : String(price)
  return [
    `$${rounded}`,
    `$${price.toFixed(2)}`,
    `€${rounded}`,
    `€${price.toFixed(2)}`,
    `${rounded} USD`,
    `${price.toFixed(2)} USD`,
    `${rounded} EUR`,
    `${price.toFixed(2)} EUR`,
  ]
}

function findProductScope(
  root: HTMLElement,
  title: string,
): HTMLElement | undefined {
  const textNodes = collectTextNodes(root)
  const titleNode = textNodes.find((node) => node.nodeValue?.includes(title))
  let element = titleNode?.parentElement ?? undefined
  while (element && element !== root) {
    const text = element.textContent ?? ''
    if (text.length > title.length && text.length < 600) return element
    element = element.parentElement ?? undefined
  }
  return titleNode?.parentElement ?? undefined
}

const SYNCED_ATTR = 'data-medusa-synced'

// Returns true when the scope (or any of its ancestors up to, but excluding,
// the shared root) was already synced in a previous pass. This keeps sync
// idempotent: once a product card has been rewritten, a later run that
// rediscovers a narrower scope inside the same card is skipped instead of
// re-replacing a generated title that is now a substring of the Medusa title.
function isAlreadySynced(scope: HTMLElement, root: HTMLElement): boolean {
  let el: HTMLElement | null = scope
  while (el !== null && el !== root) {
    if (el.hasAttribute(SYNCED_ATTR)) return true
    el = el.parentElement
  }
  return false
}

export function applyMedusaProductsToPreviewDom(
  root: HTMLElement,
  { generatedProducts, medusaProducts }: ApplyMedusaProductsInput,
): void {
  const generatedByHandle = new Map(
    generatedProducts.map((product) => [product.handle, product]),
  )

  for (const medusaProduct of medusaProducts) {
    const generatedProduct = generatedByHandle.get(medusaProduct.sourceHandle)
    if (generatedProduct === undefined) continue

    const scope = findProductScope(root, generatedProduct.title) ?? root
    // Idempotency: skip scopes that were already synced in a prior pass so a
    // generated title that is a substring of the Medusa title (e.g. "Tee" →
    // "Medusa Tee") is not re-replaced into "Medusa Medusa Tee". The shared
    // root is never marked, so root-scoped products are still processed.
    if (scope !== root && isAlreadySynced(scope, root)) continue

    replaceText(scope, generatedProduct.title, medusaProduct.title)
    if (scope !== root) scope.setAttribute(SYNCED_ATTR, 'true')

    const nextPrice = formatPrice(
      medusaProduct.price,
      medusaProduct.currencyCode,
    )
    if (nextPrice === undefined) continue
    for (const oldPrice of priceCandidates(generatedProduct.price)) {
      replacePriceText(scope, oldPrice, nextPrice)
    }
  }
}
