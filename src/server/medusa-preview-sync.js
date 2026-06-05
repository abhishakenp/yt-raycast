import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const PRODUCT_SECTION_TYPES = new Set([
  'featured-products',
  'product-grid',
  'product-detail',
  'product-list',
])

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'product'

const escapeRegExp = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const normalizeCurrency = (value) =>
  String(value || 'USD')
    .trim()
    .toUpperCase() || 'USD'

const currencySymbol = (currency) => {
  switch (normalizeCurrency(currency)) {
    case 'EUR':
      return '€'
    case 'GBP':
      return '£'
    case 'INR':
      return '₹'
    default:
      return '$'
  }
}

const formatProductPrice = (product) => {
  if (typeof product?.price === 'number' && Number.isFinite(product.price)) {
    return `${currencySymbol(product.currency)}${product.price.toFixed(2)}`
  }
  if (product?.price == null) return ''
  return String(product.price)
}

const normalizeProduct = (product, fallback = {}) => {
  const title = String(product?.title || fallback.title || 'Product').trim()
  const handle = String(product?.handle || fallback.handle || slugify(title)).trim()
  const metadata =
    product?.metadata && typeof product.metadata === 'object' && !Array.isArray(product.metadata)
      ? product.metadata
      : fallback.metadata &&
          typeof fallback.metadata === 'object' &&
          !Array.isArray(fallback.metadata)
        ? fallback.metadata
        : {}
  const rawSpecs = product?.specs || product?.features || metadata.specs || metadata.features || []
  const specs = Array.isArray(rawSpecs)
    ? rawSpecs.map((item) => String(item).trim()).filter(Boolean)
    : String(rawSpecs || '')
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
  const description = String(
    product?.description ?? product?.body ?? fallback.description ?? fallback.body ?? '',
  )
  const image = product?.image || product?.thumbnail || fallback.image || fallback.thumbnail || ''
  const category = product?.category || fallback.category || fallback.label || ''
  const currency = normalizeCurrency(product?.currency || fallback.currency || 'USD')
  const rawPrice = product?.price ?? fallback.price ?? null
  const price =
    typeof rawPrice === 'number'
      ? rawPrice
      : rawPrice == null || rawPrice === ''
        ? null
        : Number.parseFloat(String(rawPrice).replace(/[^0-9.]/g, ''))

  return {
    id: String(product?.id || fallback.id || handle),
    title,
    handle,
    description,
    price: Number.isFinite(price) ? price : rawPrice,
    currency,
    image: image ? String(image) : '',
    category: category ? String(category) : '',
    ...(Object.keys(metadata).length ? { metadata } : {}),
    ...(specs.length ? { specs, features: specs } : {}),
  }
}

const toSectionItem = (product) => ({
  id: product.id || product.handle,
  title: product.title,
  body: product.description,
  description: product.description,
  price: formatProductPrice(product),
  image: product.image || '',
  category: product.category || '',
  handle: product.handle,
  ...(product.specs?.length ? { specs: product.specs, features: product.specs } : {}),
})

const replaceAllTextForms = (html, from, to) => {
  if (!html || !from || from === to) return html
  let next = html
  const pairs = [
    [String(from), String(to || '')],
    [escapeHtml(from), escapeHtml(to || '')],
  ]
  for (const [needle, replacement] of pairs) {
    if (!needle) continue
    next = next.replace(new RegExp(escapeRegExp(needle), 'g'), replacement)
  }
  return next
}

const patchHtmlProducts = (html, previousProducts, nextProducts) => {
  if (!html || !previousProducts.length || !nextProducts.length) return html
  let nextHtml = html
  const previousByHandle = new Map(previousProducts.map((p) => [p.handle, p]))

  nextProducts.forEach((nextProduct, index) => {
    const previous = previousByHandle.get(nextProduct.handle) || previousProducts[index]
    if (!previous) return
    nextHtml = replaceAllTextForms(nextHtml, previous.title, nextProduct.title)
    nextHtml = replaceAllTextForms(nextHtml, previous.description, nextProduct.description)
    nextHtml = replaceAllTextForms(
      nextHtml,
      formatProductPrice(previous),
      formatProductPrice(nextProduct),
    )
    nextHtml = replaceAllTextForms(nextHtml, previous.image, nextProduct.image)
  })

  return nextHtml
}

// The DSL / "Kimi" spec format stores the catalogue as {name:"X", price:"$Y"}
// object-literals inside the modules.* strings (the storefront renders from
// those, not from ecommerce.products). Patching the structured fields alone
// leaves the rendered UI unchanged, so we rewrite the DSL literals too — the
// inverse of extractFromModulesDsl in extract-session-products.js.
// Matches product object-literals in either DSL syntax (name: "X") or the
// JSON-ish syntax the Shop page uses ("name":"X"). The home grid uses the
// former, deeper pages the latter, so both must be patchable.
const DSL_PRODUCT_RE =
  /\{[^{}]*"?name"?\s*:\s*"([^"]+)"[^{}]*"?price"?\s*:\s*"([^"]*\d[^"]*)"[^{}]*\}/g
const DSL_NAME_FIELD_RE = /("?name"?\s*:\s*")[^"]*(")/
const DSL_PRICE_FIELD_RE = /("?price"?\s*:\s*")[^"]*(")/
const DSL_HANDLE_FIELD_RE = /"?(?:handle|sku)"?\s*:\s*"([^"]+)"/
const DSL_IMAGE_FIELD_RE = /("?(?:image|src)"?\s*:\s*")[^"]*(")/

const escapeDslString = (value) =>
  String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')

// DSL prices are written without trailing zeros ("$199", "$24.99"), so mirror
// that rather than emitting formatProductPrice's always-2dp form.
const formatDslPrice = (product) => {
  const symbol = currencySymbol(product.currency)
  const price = product.price
  if (typeof price === 'number' && Number.isFinite(price)) {
    return Number.isInteger(price) ? `${symbol}${price}` : `${symbol}${price.toFixed(2)}`
  }
  return formatProductPrice(product)
}

// Index of the ']' that closes the '[' at openIndex, skipping brackets that
// live inside double-quoted DSL strings so a product name containing "]" can't
// throw off the scan.
const findClosingBracket = (text, openIndex) => {
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') inString = true
    else if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

const appendProductsToDsl = (dsl, additions, brand) => {
  if (!additions.length) return { dsl, changed: false }
  const arrayMatch = dsl.match(/\bproducts:\s*\[/)
  if (!arrayMatch) return { dsl, changed: false }
  const openIndex = dsl.indexOf('[', arrayMatch.index)
  const closeIndex = findClosingBracket(dsl, openIndex)
  if (closeIndex === -1) return { dsl, changed: false }
  const inner = dsl.slice(openIndex + 1, closeIndex).trim()
  const brandPart = brand ? `brand: "${escapeDslString(brand)}", ` : ''
  const literals = additions
    .map(
      (p) =>
        `{${brandPart}name: "${escapeDslString(p.title)}", handle: "${p.handle}", alt: "${escapeDslString(
          p.title,
        )}", price: "${formatDslPrice(p)}"}`,
    )
    .join(', ')
  const separator = inner.length ? ', ' : ''
  const nextDsl = dsl.slice(0, closeIndex) + separator + literals + dsl.slice(closeIndex)
  return { dsl: nextDsl, changed: true }
}

// Rewrite product literals in every modules.* DSL string to match the current
// Medusa catalogue: edits patch the matching literal in place (keyed on
// slugify(name) === Medusa handle, which stays stable across title edits), and
// products Medusa has that the DSL doesn't get appended to the first products
// array we find. Returns the patched modules and whether anything changed.
// Patch every product literal in a single DSL string. Records the handles it
// matched in `matched` so the caller can decide which Medusa products still
// need appending. Shared by the modules patcher and the .openui artifact
// patcher so both stay in lock-step.
const patchDslString = (dsl, nextByHandle, matched) =>
  dsl.replace(DSL_PRODUCT_RE, (block, name) => {
    // Match on an embedded handle/sku when the literal has one — it survives
    // title edits, whereas slugify(name) drifts the moment a product is
    // renamed in Medusa and would then never re-match on the next sync.
    const embedded = block.match(DSL_HANDLE_FIELD_RE)
    const lookupKey = embedded ? slugify(embedded[1]) : slugify(name)
    const next = nextByHandle.get(lookupKey)
    if (!next) return block
    matched.add(next.handle)
    // Function replacers, not string replacements: a price like "$175" contains
    // "$1", which String.prototype.replace would treat as a backreference and
    // corrupt the output.
    const title = escapeDslString(next.title)
    const price = formatDslPrice(next)
    let updated = block.replace(DSL_NAME_FIELD_RE, (_m, open, close) =>
      // Stamp the stable handle alongside the name the first time we touch a
      // literal so subsequent renames stay matchable.
      embedded ? `${open}${title}${close}` : `${open}${title}${close}, handle: "${next.handle}"`,
    )
    updated = updated.replace(DSL_PRICE_FIELD_RE, (_m, open, close) => `${open}${price}${close}`)
    // Stamp the resolved photo URL so the storefront renders the exact image
    // synced to Medusa instead of resolving its own from alt text at runtime.
    if (next.image) {
      const imageUrl = escapeDslString(next.image)
      updated = DSL_IMAGE_FIELD_RE.test(updated)
        ? updated.replace(DSL_IMAGE_FIELD_RE, (_m, open, close) => `${open}${imageUrl}${close}`)
        : updated.replace(DSL_PRICE_FIELD_RE, (m) => `${m}, image: "${imageUrl}"`)
    }
    return updated
  })

const patchModulesDslProducts = (modules, nextProducts, brand) => {
  if (!modules || typeof modules !== 'object' || !nextProducts.length) {
    return { modules, changed: false }
  }
  const nextByHandle = new Map(nextProducts.map((p) => [p.handle, p]))
  const matched = new Set()
  const out = {}
  let changed = false

  for (const [key, dsl] of Object.entries(modules)) {
    if (typeof dsl !== 'string') {
      out[key] = dsl
      continue
    }
    const patched = patchDslString(dsl, nextByHandle, matched)
    if (patched !== dsl) changed = true
    out[key] = patched
  }

  const additions = nextProducts.filter((p) => !matched.has(p.handle))
  if (additions.length) {
    for (const key of Object.keys(out)) {
      if (typeof out[key] !== 'string') continue
      const appended = appendProductsToDsl(out[key], additions, brand)
      if (appended.changed) {
        out[key] = appended.dsl
        changed = true
        break
      }
    }
  }

  return { modules: out, changed }
}

// The browser preview renders the OpenUI artifact files (home.openui and the
// per-route page files named in openui-manifest.json), NOT site-spec.json — so
// patching the spec alone updates the data but never the visible storefront.
// Apply the same product edits/additions to those artifacts so a Medusa edit
// actually shows up in the preview.
export function patchOpenUIArtifactsWithMedusaProducts(workspace, medusaProducts, brand = '') {
  const products = Array.isArray(medusaProducts)
    ? medusaProducts.map((product) => normalizeProduct(product)).filter((product) => product.title)
    : []
  if (!workspace || !products.length) return { changed: false, files: [] }

  const files = new Set(['home.openui'])
  const manifestPath = join(workspace, 'openui-manifest.json')
  if (existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
      if (manifest.home) files.add(String(manifest.home))
      for (const page of Array.isArray(manifest.pages) ? manifest.pages : []) {
        if (page?.file) files.add(String(page.file))
      }
    } catch {
      /* fall back to home.openui */
    }
  }

  const nextByHandle = new Map(products.map((p) => [p.handle, p]))
  const changedFiles = []
  for (const file of files) {
    const filePath = join(workspace, file)
    if (!existsSync(filePath)) continue
    const original = readFileSync(filePath, 'utf8')
    const matched = new Set()
    let patched = patchDslString(original, nextByHandle, matched)
    const additions = products.filter((p) => !matched.has(p.handle))
    if (additions.length) {
      const appended = appendProductsToDsl(patched, additions, brand)
      if (appended.changed) patched = appended.dsl
    }
    if (patched !== original) {
      writeFileSync(filePath, patched)
      changedFiles.push(file)
    }
  }
  return { changed: changedFiles.length > 0, files: changedFiles }
}

export function mergeMedusaProductsIntoSiteSpec(siteSpec, medusaProducts, options = {}) {
  const products = Array.isArray(medusaProducts)
    ? medusaProducts.map((product) => normalizeProduct(product)).filter((product) => product.title)
    : []
  if (!siteSpec || typeof siteSpec !== 'object' || products.length === 0) {
    return { siteSpec, changed: false, productCount: 0 }
  }

  const previousProducts = (
    Array.isArray(options.visibleProducts) && options.visibleProducts.length
      ? options.visibleProducts
      : siteSpec.ecommerce?.products || []
  ).map((product) => normalizeProduct(product))
  const nextSpec = structuredClone(siteSpec)

  nextSpec.siteType = nextSpec.siteType || 'ecommerce'
  nextSpec.ecommerce = {
    ...(nextSpec.ecommerce || {}),
    settings: {
      ...(nextSpec.ecommerce?.settings || {}),
      currency: products[0]?.currency || nextSpec.ecommerce?.settings?.currency || 'USD',
      provider: nextSpec.ecommerce?.settings?.provider || 'medusa',
    },
    products,
  }

  for (const page of nextSpec.pages || []) {
    for (const section of page.sections || []) {
      if (!PRODUCT_SECTION_TYPES.has(section.type)) continue
      const limit =
        section.type === 'featured-products'
          ? Math.max(
              1,
              Array.isArray(section.items) && section.items.length ? section.items.length : 4,
            )
          : products.length
      section.items = products.slice(0, limit).map(toSectionItem)
    }

    const blueprint = page.renderBlueprint
    if (!blueprint) continue
    if (typeof blueprint.bodyHtml === 'string') {
      blueprint.bodyHtml = patchHtmlProducts(blueprint.bodyHtml, previousProducts, products)
    }
    if (typeof blueprint.originalHtmlDocument === 'string') {
      blueprint.originalHtmlDocument = patchHtmlProducts(
        blueprint.originalHtmlDocument,
        previousProducts,
        products,
      )
    }
  }

  // DSL-format stores render from modules.* rather than pages/ecommerce, so
  // patch those literals too — otherwise the structured fields update but the
  // visible storefront never changes.
  if (nextSpec.modules && typeof nextSpec.modules === 'object') {
    const dslResult = patchModulesDslProducts(nextSpec.modules, products, nextSpec.brand)
    if (dslResult.changed) nextSpec.modules = dslResult.modules
  }

  return { siteSpec: nextSpec, changed: true, productCount: products.length }
}
