const purchaseIntent =
  /\b(?:buy|checkout|order|pre[-\s]?order|purchase|reserve)\b/i
const nonCartAddIntent = /\b(?:favorite|favourite|save|wishlist)\b/i
const cartContainerIntent = /\badd\s+(?:to\s+)?(?:bag|basket|cart)\b/i

export function isProductPurchaseIntent(label: string): boolean {
  const trimmed = label.trim()
  if (!trimmed) return false
  if (cartContainerIntent.test(trimmed)) return true
  if (purchaseIntent.test(trimmed)) return true
  return /^add\b/i.test(trimmed) && !nonCartAddIntent.test(trimmed)
}
