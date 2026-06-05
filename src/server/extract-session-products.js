import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'product'

// Generic placeholder titles that ship-fast uses when real product names
// aren't specified — we never want these to land in a tenant's catalog.
const PLACEHOLDER_TITLES = new Set([
  'premium pick',
  'customer favorite',
  'new arrival',
  'limited run',
  'best seller',
  'premium product',
  'featured product',
  'top pick',
  'popular item',
  'trending now',
  'staff pick',
  "editor's choice",
  'editor choice',
  'most loved',
  'new release',
  'hot deal',
  'special offer',
  'shop now',
  'view product',
  'buy now',
  'add to cart',
  'explore now',
])

// Titles that appear in cart/checkout/order markup and must never be mistaken
// for catalogue products when scraping rendered HTML (e.g. an "Order Summary"
// card sitting next to a "$94.97" total).
const NON_PRODUCT_TITLES = new Set([
  'order summary',
  'cart summary',
  'order total',
  'order details',
  'your order',
  'your cart',
  'shopping cart',
  'cart total',
  'subtotal',
  'grand total',
  'total',
  'checkout',
  'payment',
  'shipping',
  'tax',
])

// Walk rendered HTML for product cards. Two strategies because some templates
// wrap cards in <article> (clean DOM signal) and others use generic div/li
// grids where we have to fall back to "h3 + nearby price + nearby img".
function extractFromHtml(html, sessionId, sessionPrompt) {
  const products = []
  const seen = new Set()

  // Strategy 1: split by <article> — most generated sites wrap cards in <article>
  const parts = html.split(/<article\b/)
  if (parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      const chunk = parts[i]
      const h3Match = chunk.match(/<h3[^>]*>([^<]{3,80})<\/h3>/)
      if (!h3Match) continue
      const title = h3Match[1].trim()
      const lc = title.toLowerCase()
      if (PLACEHOLDER_TITLES.has(lc) || NON_PRODUCT_TITLES.has(lc) || seen.has(lc)) continue
      const priceMatch = chunk.match(/[₹$€£]([\d,]+(?:\.\d{2})?)/)
      if (!priceMatch) continue
      const imgMatch = chunk.match(/<img[^>]+src="([^"]+)"/)
      const descMatch = chunk.match(/<p[^>]*>([^<]{10,200})<\/p>/)
      const priceNum = parseFloat(priceMatch[1].replace(/,/g, ''))
      const priceStr = priceMatch[0]
      seen.add(lc)
      products.push({
        id: slugify(title),
        title,
        handle: slugify(title),
        description: descMatch?.[1]?.trim() || '',
        price: priceNum,
        currency: priceStr.startsWith('₹')
          ? 'INR'
          : priceStr.startsWith('€')
            ? 'EUR'
            : priceStr.startsWith('£')
              ? 'GBP'
              : 'USD',
        image: imgMatch?.[1] || null,
        category: '',
        sessionId,
        sessionPrompt,
      })
    }
  }

  // Strategy 2: fallback for sites that use div/li cards — h3 + nearby price in 600-char window
  if (products.length === 0) {
    const h3Regex = /<h3[^>]*>([^<]{3,80})<\/h3>/g
    let m
    while ((m = h3Regex.exec(html)) !== null) {
      const title = m[1].trim()
      const lc = title.toLowerCase()
      if (PLACEHOLDER_TITLES.has(lc) || NON_PRODUCT_TITLES.has(lc) || seen.has(lc)) continue
      const pos = m.index
      const fwd = html.slice(pos, pos + 600)
      const priceMatch = fwd.match(/[₹$€£]([\d,]+(?:\.\d{2})?)/)
      if (!priceMatch) continue
      const window2 = html.slice(Math.max(0, pos - 2000), pos + 600)
      const imgMatches = [...window2.matchAll(/<img[^>]+src="([^"]+)"/g)]
      const imgMatch = imgMatches[imgMatches.length - 1]
      const descMatch = fwd.match(/<p[^>]*>([^<]{10,200})<\/p>/)
      const priceNum = parseFloat(priceMatch[1].replace(/,/g, ''))
      const priceStr = priceMatch[0]
      seen.add(lc)
      products.push({
        id: slugify(title),
        title,
        handle: slugify(title),
        description: descMatch?.[1]?.trim() || '',
        price: priceNum,
        currency: priceStr.startsWith('₹')
          ? 'INR'
          : priceStr.startsWith('€')
            ? 'EUR'
            : priceStr.startsWith('£')
              ? 'GBP'
              : 'USD',
        image: imgMatch?.[1] || null,
        category: '',
        sessionId,
        sessionPrompt,
      })
    }
  }
  return products
}

const PRODUCT_SECTION_TYPES = new Set([
  'featured-products',
  'product-grid',
  'product-detail',
  'product-list',
])

// loadSiteSpec() from the engine only returns specs that carry a top-level
// `brand` string — which the generator's real specs never have (they use
// projectName plus a structured `ecommerce` block). Reading the raw JSON lets
// us see the spec the generator actually produced instead of bailing on every
// session, which is why catalog sync silently no-op'd for everyone: the loader
// returned null before we ever reached the rendered-HTML catalogue.
function readRawSiteSpec(workspace) {
  const filePath = join(workspace, 'site-spec.json')
  if (!existsSync(filePath)) return null
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

// Pull catalog entries from a session by reading its rendered HTML first
// (more reliable — section.items often contains generic placeholders, the
// rendered HTML has the actual product catalogue) and falling back to the
// site-spec sections when the HTML yields nothing. Returns [] if the session
// isn't an ecommerce spec or the spec isn't ready yet.
export function extractSessionProducts(session, sessionsDir) {
  if (!session || !sessionsDir) return []
  if (!session.siteSpecReady) return []

  const workspace = join(sessionsDir, session.id)
  const spec = readRawSiteSpec(workspace)
  if (!spec) return []

  // An ecommerce session is one the generator tagged as such OR one that
  // carries a non-empty structured catalogue. siteType is sometimes
  // misclassified (e.g. "software") even when a full medusa product block
  // exists, so keying off the catalogue keeps this generic rather than
  // trusting a single label.
  const hasCatalogue =
    Array.isArray(spec.ecommerce?.products) && spec.ecommerce.products.length > 0
  if (spec.siteType !== 'ecommerce' && !hasCatalogue) return []

  const sessionId = session.id
  const sessionPrompt = session.prompt || ''
  const seen = new Set()
  const products = []
  const push = (list) => {
    for (const p of list) {
      if (!p.handle || seen.has(p.handle)) continue
      seen.add(p.handle)
      products.push(p)
    }
  }

  // Primary source: the rendered HTML in each page's blueprint. The engine's
  // structured `ecommerce.products` block is generic boilerplate (identical
  // across every store it generates), whereas the rendered storefront holds
  // the real, theme-specific catalogue the user sees in the UI.
  const pages = Array.isArray(spec.pages) ? spec.pages : []
  for (const page of pages) {
    const html = page.renderBlueprint?.bodyHtml
    if (!html) continue
    push(extractFromHtml(html, sessionId, sessionPrompt))
  }

  // Fallback: section items, for older specs whose pages carry no rendered
  // blueprint markup.
  if (products.length === 0) {
    for (const page of pages) {
      const sections = Array.isArray(page.sections) ? page.sections : []
      for (const section of sections) {
        if (!PRODUCT_SECTION_TYPES.has(section.type)) continue
        const items = Array.isArray(section.items) ? section.items : []
        for (const item of items) {
          if (!item.title) continue
          const lc = item.title.toLowerCase().trim()
          const handle = slugify(item.title)
          if (PLACEHOLDER_TITLES.has(lc) || seen.has(handle)) continue
          seen.add(handle)
          products.push({
            id: item.id || handle,
            title: item.title,
            handle,
            description: item.body || item.description || '',
            price: item.price || null,
            image: item.image || item.thumbnail || null,
            category: item.label || item.category || '',
            sessionId,
            sessionPrompt,
          })
        }
      }
    }
  }

  return products
}
