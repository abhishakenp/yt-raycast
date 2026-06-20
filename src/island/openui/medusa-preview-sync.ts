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

const formatPrice = (
  price: number | undefined,
  currencyCode: string | undefined,
): string | undefined => {
  if (price === undefined) return undefined
  const normalizedCurrency = currencyCode?.trim().toUpperCase()
  if (!normalizedCurrency) return `$${price.toFixed(2)}`

  try {
    return new Intl.NumberFormat('en-US', {
      currency: normalizedCurrency,
      style: 'currency',
    }).format(price)
  } catch {
    return `$${price.toFixed(2)}`
  }
}

const collectTextNodes = (root: HTMLElement): Array<Text> => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Array<Text> = []
  let node = walker.nextNode()
  while (node !== null) {
    nodes.push(node as Text)
    node = walker.nextNode()
  }
  return nodes
}

const replaceText = (root: HTMLElement, from: string, to: string): void => {
  if (!from.trim() || from === to) return
  for (const node of collectTextNodes(root)) {
    if (!node.nodeValue?.includes(from)) continue
    node.nodeValue = node.nodeValue.split(from).join(to)
  }
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const replacePriceText = (
  root: HTMLElement,
  from: string,
  to: string,
): void => {
  if (!from.trim() || from === to) return
  const pattern = new RegExp(`${escapeRegExp(from)}(?![\\d.,])`, 'g')
  for (const node of collectTextNodes(root)) {
    if (!node.nodeValue || !pattern.test(node.nodeValue)) continue
    node.nodeValue = node.nodeValue.replace(pattern, to)
    pattern.lastIndex = 0
  }
}

const priceCandidates = (price: number): Array<string> => {
  const rounded = Number.isInteger(price) ? String(price) : String(price)
  return [
    `$${rounded}`,
    `$${price.toFixed(2)}`,
    `€${rounded}`,
    `€${price.toFixed(2)}`,
  ]
}

const findProductScope = (
  root: HTMLElement,
  title: string,
): HTMLElement | undefined => {
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

export const applyMedusaProductsToPreviewDom = (
  root: HTMLElement,
  { generatedProducts, medusaProducts }: ApplyMedusaProductsInput,
): void => {
  const generatedByHandle = new Map(
    generatedProducts.map((product) => [product.handle, product]),
  )

  for (const medusaProduct of medusaProducts) {
    const generatedProduct = generatedByHandle.get(medusaProduct.sourceHandle)
    if (generatedProduct === undefined) continue

    const scope = findProductScope(root, generatedProduct.title) ?? root
    const nextPrice = formatPrice(
      medusaProduct.price,
      medusaProduct.currencyCode,
    )

    replaceText(scope, generatedProduct.title, medusaProduct.title)
    if (nextPrice === undefined) continue
    for (const oldPrice of priceCandidates(generatedProduct.price)) {
      replacePriceText(scope, oldPrice, nextPrice)
    }
  }
}
