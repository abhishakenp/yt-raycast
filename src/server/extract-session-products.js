import { join } from 'node:path'
import { loadSiteSpec } from '../spec/index.js'

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
      if (PLACEHOLDER_TITLES.has(lc) || seen.has(lc)) continue
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
      if (PLACEHOLDER_TITLES.has(lc) || seen.has(lc)) continue
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

// Pull catalog entries from a session by reading its rendered HTML first
// (more reliable — section.items often contains generic placeholders, the
// rendered HTML has the actual product catalogue) and falling back to the
// site-spec sections when the HTML yields nothing. Returns [] if the session
// isn't an ecommerce spec or the spec isn't ready yet.
export function extractSessionProducts(session, sessionsDir) {
  if (!session || !sessionsDir) return []
  if (!session.siteSpecReady) return []

  const workspace = join(sessionsDir, session.id)
  const spec = loadSiteSpec(workspace)
  if (!spec || spec.siteType !== 'ecommerce') return []

  const pages = Array.isArray(spec.pages) ? spec.pages : []
  const seen = new Set()
  const products = []
  let extractedFromHtml = false

  for (const page of pages) {
    const html = page.renderBlueprint?.bodyHtml
    if (!html) continue
    const pageProducts = extractFromHtml(html, session.id, session.prompt || '')
    for (const p of pageProducts) {
      if (seen.has(p.handle)) continue
      seen.add(p.handle)
      products.push(p)
    }
    if (pageProducts.length > 0) extractedFromHtml = true
  }

  if (!extractedFromHtml) {
    for (const page of pages) {
      const sections = Array.isArray(page.sections) ? page.sections : []
      for (const section of sections) {
        if (!PRODUCT_SECTION_TYPES.has(section.type)) continue
        const items = Array.isArray(section.items) ? section.items : []
        for (const item of items) {
          if (!item.title) continue
          const lc = item.title.toLowerCase().trim()
          if (PLACEHOLDER_TITLES.has(lc) || seen.has(slugify(item.title))) continue
          seen.add(slugify(item.title))
          products.push({
            id: item.id || slugify(item.title),
            title: item.title,
            handle: slugify(item.title),
            description: item.body || item.description || '',
            price: item.price || null,
            image: item.image || item.thumbnail || null,
            category: item.label || item.category || '',
            sessionId: session.id,
            sessionPrompt: session.prompt,
          })
        }
      }
    }
  }

  return products
}
