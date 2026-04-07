import {
  buildGlobalCss,
  renderCloneRuntimeModule,
  renderNextExactClonePageComponent,
  routeToNextSegments,
  serializeModule,
  slimSiteSpecForBundle,
} from '../shared.js'
import {
  buildNextMetadata,
  buildSitemapEntries,
  buildStructuredData,
  normalizeSiteUrl,
  resolvePageSeo,
  serializeStructuredData,
} from '../seo.js'
import { collectShipFastStudioFiles } from '../studio-export.js'
import { SHIP_FAST_SITE_URL } from '../../marketing.js'

function collectThemeGoogleFontFamilies(theme = {}) {
  const typo = theme.typography || {}
  const raw = [typo.heading, typo.body, typo.mono]
  const seen = new Set()
  const out = []
  for (const f of raw) {
    if (typeof f !== 'string') continue
    const first = f.split(',')[0].trim().replace(/^["']|["']$/g, '').trim()
    if (!first) continue
    if (/^(system-ui|sans-serif|serif|monospace|ui-sans-serif|ui-monospace|apple-system)/i.test(first)) continue
    const k = first.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(first)
  }
  return out
}

function buildNextLayoutFontLinkLines(siteSpec) {
  const families = collectThemeGoogleFontFamilies(siteSpec.theme)
  if (!families.length) return ''
  const lines = [
    '        <link rel="preconnect" href="https://fonts.googleapis.com" />',
    '        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />',
  ]
  for (const name of families) {
    const q = name.replace(/ /g, '+')
    lines.push(
      `        <link href="https://fonts.googleapis.com/css2?family=${q}:wght@400;500;600;700&display=swap" rel="stylesheet" />`,
    )
  }
  return `\n${lines.join('\n')}\n`
}

function renderNextPackageJson(projectName, extraDependencies = {}, extraScripts = {}) {
  return JSON.stringify(
    {
      name: projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      private: true,
      version: '0.0.0',
      packageManager: 'bun@1.2.5',
      scripts: {
        dev: 'next dev',
        build: 'NODE_ENV=production next build',
        start: 'next start',
        ...extraScripts,
      },
      dependencies: {
        next: '^14.2.15',
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        ...extraDependencies,
      },
    },
    null,
    2,
  )
}

function renderMedusaExportFiles() {
  return {
    '.env.example.medusa': `# Medusa.js E-Commerce — optional, works without these
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
# Payment (Stripe — optional, configure in Medusa admin)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
`,
    'lib/medusa.js': `import Medusa from '@medusajs/js-sdk'

const backendUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

let sdk = null

export function getMedusaSdk() {
  if (!publishableKey) return null
  if (!sdk) {
    sdk = new Medusa({ baseUrl: backendUrl, publishableKey })
  }
  return sdk
}

export async function getProducts(params = {}) {
  const client = getMedusaSdk()
  if (!client) return []
  try {
    const { products } = await client.store.product.list(params)
    return products || []
  } catch {
    return []
  }
}

export async function getProductByHandle(handle) {
  const client = getMedusaSdk()
  if (!client || !handle) return null
  try {
    const { products } = await client.store.product.list({ handle })
    return products?.[0] || null
  } catch {
    return null
  }
}

export async function getCategories() {
  const client = getMedusaSdk()
  if (!client) return []
  try {
    const { product_categories } = await client.store.category.list()
    return product_categories || []
  } catch {
    return []
  }
}

export async function createCart(regionId) {
  const client = getMedusaSdk()
  if (!client) return null
  try {
    const { cart } = await client.store.cart.create({ region_id: regionId })
    return cart || null
  } catch {
    return null
  }
}

export async function getCart(cartId) {
  const client = getMedusaSdk()
  if (!client || !cartId) return null
  try {
    const { cart } = await client.store.cart.retrieve(cartId)
    return cart || null
  } catch {
    return null
  }
}

export async function addLineItem(cartId, variantId, quantity = 1) {
  const client = getMedusaSdk()
  if (!client || !cartId || !variantId) return null
  try {
    const { cart } = await client.store.cart.createLineItem(cartId, { variant_id: variantId, quantity })
    return cart || null
  } catch {
    return null
  }
}

export async function updateLineItem(cartId, lineItemId, quantity) {
  const client = getMedusaSdk()
  if (!client || !cartId || !lineItemId) return null
  try {
    const { cart } = await client.store.cart.updateLineItem(cartId, lineItemId, { quantity })
    return cart || null
  } catch {
    return null
  }
}

export async function removeLineItem(cartId, lineItemId) {
  const client = getMedusaSdk()
  if (!client || !cartId || !lineItemId) return null
  try {
    const { cart } = await client.store.cart.deleteLineItem(cartId, lineItemId)
    return cart || null
  } catch {
    return null
  }
}

export async function createPaymentSessions(cartId) {
  const client = getMedusaSdk()
  if (!client || !cartId) return null
  try {
    const { cart } = await client.store.payment.initiatePaymentSession(cartId, { provider_id: 'pp_system_default' })
    return cart || null
  } catch {
    return null
  }
}

export async function completeCart(cartId) {
  const client = getMedusaSdk()
  if (!client || !cartId) return null
  try {
    const result = await client.store.cart.complete(cartId)
    return result || null
  } catch {
    return null
  }
}

export async function getRegions() {
  const client = getMedusaSdk()
  if (!client) return []
  try {
    const { regions } = await client.store.region.list()
    return regions || []
  } catch {
    return []
  }
}

export async function listPaymentProviders(regionId) {
  const client = getMedusaSdk()
  if (!client || !regionId) return []
  try {
    const { payment_providers } = await client.store.payment.listPaymentProviders({ region_id: regionId })
    return payment_providers || []
  } catch {
    return []
  }
}

export async function setShippingMethod(cartId, optionId) {
  const client = getMedusaSdk()
  if (!client || !cartId || !optionId) return null
  try {
    const { cart } = await client.store.cart.addShippingMethod(cartId, { option_id: optionId })
    return cart || null
  } catch {
    return null
  }
}

export async function listShippingOptions(cartId) {
  const client = getMedusaSdk()
  if (!client || !cartId) return []
  try {
    const { shipping_options } = await client.store.fulfillment.listCartOptions({ cart_id: cartId })
    return shipping_options || []
  } catch {
    return []
  }
}

export async function setCartAddress(cartId, address) {
  const client = getMedusaSdk()
  if (!client || !cartId) return null
  try {
    const { cart } = await client.store.cart.update(cartId, address)
    return cart || null
  } catch {
    return null
  }
}
`,
  }
}
function renderSanityNextExportFiles(siteSpec) {
  const siteUrl = normalizeSiteUrl(siteSpec?.seo?.siteUrl || '')
  const staticSitemapEntries = buildSitemapEntries(siteSpec)
  const embeddedSiteUrl = JSON.stringify(siteUrl)
  const embeddedStaticSitemap = JSON.stringify(staticSitemapEntries)

function renderEcommerceComponents() {
  return {
    'components/ecommerce/CartProvider.jsx': `'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createCart, getCart, addLineItem, updateLineItem, removeLineItem, getRegions } from '../../lib/medusa'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initCart() {
      try {
        const savedCartId = typeof window !== 'undefined' ? localStorage.getItem('medusa_cart_id') : null
        if (savedCartId) {
          const existing = await getCart(savedCartId)
          if (existing && existing.completed_at === null) {
            setCart(existing)
            setLoading(false)
            return
          }
        }
        const regions = await getRegions()
        const regionId = regions?.[0]?.id
        if (regionId) {
          const newCart = await createCart(regionId)
          if (newCart?.id) {
            localStorage.setItem('medusa_cart_id', newCart.id)
            setCart(newCart)
          }
        }
      } catch {}
      setLoading(false)
    }
    initCart()
  }, [])

  const refreshCart = useCallback(async () => {
    if (!cart?.id) return
    const updated = await getCart(cart.id)
    if (updated) setCart(updated)
  }, [cart?.id])

  const addItem = useCallback(async (variantId, quantity = 1) => {
    if (!cart?.id) return
    setLoading(true)
    await addLineItem(cart.id, variantId, quantity)
    await refreshCart()
    setLoading(false)
  }, [cart?.id, refreshCart])

  const updateItem = useCallback(async (lineItemId, quantity) => {
    if (!cart?.id) return
    setLoading(true)
    await updateLineItem(cart.id, lineItemId, quantity)
    await refreshCart()
    setLoading(false)
  }, [cart?.id, refreshCart])

  const removeItem = useCallback(async (lineItemId) => {
    if (!cart?.id) return
    setLoading(true)
    await removeLineItem(cart.id, lineItemId)
    await refreshCart()
    setLoading(false)
  }, [cart?.id, refreshCart])

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
`,
    'components/ecommerce/ProductCard.jsx': `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from './CartProvider'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const variant = product.variants?.[0]
  const price = variant?.calculated_price?.calculated_amount
  const currency = variant?.calculated_price?.currency_code || 'USD'
  const formatted = price != null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price / 100)
    : ''

  async function handleAdd() {
    if (!variant?.id) return
    setAdding(true)
    await addItem(variant.id)
    setAdding(false)
  }

  return (
    <article className="product-card">
      <Link href={'/product/' + (product.handle || product.id)}>
        <div className="product-image">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.title} />
          ) : (
            <div className="product-placeholder" />
          )}
        </div>
        <h3>{product.title}</h3>
      </Link>
      {formatted ? <span className="product-price">{formatted}</span> : null}
      <button className="button button--primary" onClick={handleAdd} disabled={adding || !variant}>
        {adding ? 'Adding...' : 'Add to Cart'}
      </button>
    </article>
  )
}
`,
    'components/ecommerce/CartDrawer.jsx': `'use client'

import { useState } from 'react'
import { useCart } from './CartProvider'

export default function CartDrawer() {
  const { cart, loading, updateItem, removeItem, itemCount } = useCart()
  const [open, setOpen] = useState(false)

  const subtotal = cart?.total != null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: cart.region?.currency_code || 'USD' }).format(cart.total / 100)
    : '$0.00'

  return (
    <>
      <button className="cart-toggle" onClick={() => setOpen(true)} type="button">
        Cart {itemCount > 0 ? '(' + itemCount + ')' : ''}
      </button>
      {open ? (
        <div className="cart-overlay" onClick={() => setOpen(false)}>
          <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Your Cart</h2>
              <button onClick={() => setOpen(false)} type="button">&times;</button>
            </div>
            {loading ? <p>Loading...</p> : null}
            {!loading && (!cart?.items?.length) ? <p>Your cart is empty.</p> : null}
            <ul className="cart-items">
              {(cart?.items || []).map((item) => (
                <li key={item.id} className="cart-item">
                  <div>
                    <strong>{item.title}</strong>
                    <div className="cart-item-controls">
                      <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))} type="button">-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)} type="button">+</button>
                      <button onClick={() => removeItem(item.id)} type="button">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-footer">
              <strong>Subtotal: {subtotal}</strong>
              <a href="/checkout" className="button button--primary">Checkout</a>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  )
}
`,
    'components/ecommerce/AddToCart.jsx': `'use client'

import { useState } from 'react'
import { useCart } from './CartProvider'

export default function AddToCart({ variantId, disabled }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)

  async function handleClick() {
    if (!variantId) return
    setAdding(true)
    await addItem(variantId)
    setAdding(false)
  }

  return (
    <button
      className="button button--primary add-to-cart"
      onClick={handleClick}
      disabled={disabled || adding || !variantId}
      type="button"
    >
      {adding ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}
`,
  }
}

  return {
    '.env.example': `NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_READ_TOKEN=
SANITY_STUDIO_PROJECT_ID=
SANITY_STUDIO_DATASET=production
`,
    'lib/sanity.client.js': `import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  ...(process.env.SANITY_READ_TOKEN ? { token: process.env.SANITY_READ_TOKEN } : {}),
})
`,
    'lib/sanity.image.js': `import createImageUrlBuilder from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source) => {
  if (!source) return null
  return builder.image(source)
}
`,
    'components/BlogPortableText.jsx': `import { PortableText } from '@portabletext/react'
import { urlFor } from '../lib/sanity.image'

const components = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null
      const img = urlFor(value)
      if (!img) return null
      const src = img.width(1200).fit('max').auto('format').url()
      return (
        <figure style={{ margin: '1.5rem 0' }}>
          <img src={src} alt={value.alt || ''} style={{ maxWidth: '100%', height: 'auto' }} loading="lazy" />
        </figure>
      )
    },
  },
}

export default function BlogPortableText({ value }) {
  if (!value?.length) return null
  return <PortableText value={value} components={components} />
}
`,
    'app/blog/page.jsx': `import Link from 'next/link'
import { client } from '../../lib/sanity.client'
import siteSpec from '../../lib/site-spec'

const POSTS_QUERY = \`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  "slug": slug.current,
  title,
  publishedAt,
  excerpt,
  "seoTitle": seo.metaTitle
}\`

export async function generateMetadata() {
  const base = siteSpec.seo?.siteUrl ? String(siteSpec.seo.siteUrl).replace(/\\/+$/, '') : ''
  const name = siteSpec.seo?.siteName || siteSpec.seo?.title || siteSpec.projectName || 'Blog'
  const title = \`\${name} — Blog\`
  const description = siteSpec.seo?.description || ''
  const canonical = base ? \`\${base}/blog\` : undefined
  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
  }
}

export default async function BlogIndexPage() {
  const posts = await client.fetch(POSTS_QUERY)
  return (
    <main className="container" style={{ padding: 'var(--spacing-section) 0' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h1)' }}>Blog</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(posts || []).map((post) => (
          <li key={post.slug} style={{ marginBottom: '1rem' }}>
            <Link href={'/blog/' + post.slug} style={{ color: 'var(--color-primary)' }}>
              {post.title}
            </Link>
            {post.excerpt ? (
              <p style={{ color: 'var(--color-muted)', margin: '0.5rem 0 0' }}>{post.excerpt}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  )
}
`,
    'app/blog/[slug]/page.jsx': `import Link from 'next/link'
import { notFound } from 'next/navigation'
import { client } from '../../../lib/sanity.client'
import { urlFor } from '../../../lib/sanity.image'
import siteSpec from '../../../lib/site-spec'
import BlogPortableText from '../../../components/BlogPortableText'

const POST_QUERY = \`*[_type == "post" && slug.current == $slug][0]{
  title,
  publishedAt,
  excerpt,
  body,
  "authorName": author->name,
  "categories": categories[]->title,
  seo {
    metaTitle,
    metaDescription,
    nofollowAttributes,
    seoKeywords,
    metaImage,
    openGraph {
      title,
      description,
      siteName,
      url,
      image {
        asset->{ _id, url, metadata { dimensions { width, height } } },
        crop,
        hotspot
      }
    },
    twitter {
      cardType,
      site,
      creator
    }
  }
}\`

function pickOgImage(post) {
  const og = post?.seo?.openGraph?.image
  if (og?.asset) {
    const u = urlFor(og)
    return u ? u.width(1200).height(630).fit('crop').auto('format').url() : ''
  }
  const m = post?.seo?.metaImage
  if (m?.asset) {
    const u = urlFor(m)
    return u ? u.width(1200).height(630).fit('crop').auto('format').url() : ''
  }
  return ''
}

function blogJsonLd(post, canonical) {
  const base = siteSpec.seo?.siteName || siteSpec.projectName || ''
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.publishedAt || undefined,
    author: post.authorName
      ? { '@type': 'Person', name: post.authorName }
      : undefined,
    mainEntityOfPage: canonical ? { '@type': 'WebPage', '@id': canonical } : undefined,
    publisher: base ? { '@type': 'Organization', name: base } : undefined,
  }
  const keys = Object.keys(data).filter((k) => data[k] != null)
  const cleaned = {}
  for (const k of keys) cleaned[k] = data[k]
  return JSON.stringify(cleaned).replace(/</g, '\\\\u003c')
}

export async function generateMetadata({ params }) {
  const post = await client.fetch(POST_QUERY, { slug: params.slug })
  if (!post) return { title: 'Not found' }
  const base = siteSpec.seo?.siteUrl ? String(siteSpec.seo.siteUrl).replace(/\\/+$/, '') : ''
  const path = '/blog/' + params.slug
  const canonical = base ? base + path : undefined
  const seo = post.seo || {}
  const title = seo.metaTitle || post.title
  const description = seo.metaDescription || post.excerpt || ''
  const keywords = Array.isArray(seo.seoKeywords) ? seo.seoKeywords.filter(Boolean) : []
  const ogImage = pickOgImage(post)
  const robots = seo.nofollowAttributes
    ? { index: false, follow: false }
    : { index: true, follow: true }
  return {
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    robots,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: seo.openGraph?.title || title,
      description: seo.openGraph?.description || description,
      url: seo.openGraph?.url || canonical,
      type: 'article',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }) {
  const post = await client.fetch(POST_QUERY, { slug: params.slug })
  if (!post) notFound()
  const base = siteSpec.seo?.siteUrl ? String(siteSpec.seo.siteUrl).replace(/\\/+$/, '') : ''
  const canonical = base ? base + '/blog/' + params.slug : ''
  const jsonLd = blogJsonLd(post, canonical || undefined)
  return (
    <article className="container" style={{ padding: 'var(--spacing-section) 0', maxWidth: '48rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <p>
        <Link href="/blog" style={{ color: 'var(--color-primary)' }}>
          ← Blog
        </Link>
      </p>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h1)' }}>{post.title}</h1>
      {post.authorName ? <p style={{ color: 'var(--color-muted)' }}>{post.authorName}</p> : null}
      <BlogPortableText value={post.body} />
    </article>
  )
}
`,
    'app/sitemap.js': `import { client } from '../lib/sanity.client'
import siteSpec from '../lib/site-spec'

const BLOG_SLUGS = \`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  "slug": slug.current,
  publishedAt
}\`

function joinUrl(base, path) {
  const b = String(base || '').replace(/\\/+$/, '')
  const p = path.startsWith('/') ? path : '/' + path
  try {
    return new URL(p, b + '/').toString()
  } catch {
    return ''
  }
}

export default async function sitemap() {
  const siteUrl = ${embeddedSiteUrl}
  if (!siteUrl) return []
  const staticEntries = ${embeddedStaticSitemap}
  const blogIndexUrl = joinUrl(siteUrl, '/blog')
  const hasBlogIndex = staticEntries.some((e) => e.url === blogIndexUrl)
  const baseList = hasBlogIndex ? staticEntries : [
    ...staticEntries,
    {
      url: blogIndexUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
  ]
  let rows = []
  try {
    rows = await client.fetch(BLOG_SLUGS)
  } catch {
    rows = []
  }
  const blogEntries = (rows || []).map((row) => ({
    url: joinUrl(siteUrl, '/blog/' + row.slug),
    lastModified: row.publishedAt ? new Date(row.publishedAt).toISOString() : new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.65,
  }))
  return [...baseList, ...blogEntries]
}
`,
  }
}

function renderCmsNextExportFiles(cmsType) {
  const envFiles = {
    contentful: `CONTENTFUL_SPACE_ID=
CONTENTFUL_ACCESS_TOKEN=
CONTENTFUL_ENVIRONMENT=master
`,
    strapi: `STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=
`,
  }

  const clientFiles = {
    contentful: `const SPACE = process.env.CONTENTFUL_SPACE_ID || ''
const TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN || ''
const ENV = process.env.CONTENTFUL_ENVIRONMENT || 'master'
const BASE = \`https://cdn.contentful.com/spaces/\${SPACE}/environments/\${ENV}\`

async function cfFetch(path, params = {}) {
  const qs = new URLSearchParams({ access_token: TOKEN, ...params })
  const res = await fetch(\`\${BASE}\${path}?\${qs}\`, { next: { revalidate: 60 } })
  if (!res.ok) return null
  return res.json()
}

export async function fetchPosts() {
  const data = await cfFetch('/entries', { content_type: 'blogPost', order: '-fields.publishedAt' })
  return (data?.items || []).map((i) => ({
    slug: i.fields.slug, title: i.fields.title,
    publishedAt: i.fields.publishedAt, excerpt: i.fields.excerpt || '',
  }))
}

export async function fetchPostBySlug(slug) {
  const data = await cfFetch('/entries', { content_type: 'blogPost', 'fields.slug': slug, limit: '1' })
  if (!data?.items?.length) return null
  const f = data.items[0].fields
  return { title: f.title, publishedAt: f.publishedAt, excerpt: f.excerpt || '', body: f.body || null, authorName: f.authorName || null, categories: f.categories || [] }
}
`,
    strapi: `const BASE = process.env.STRAPI_URL || 'http://localhost:1337'
const TOKEN = process.env.STRAPI_API_TOKEN || ''

async function strapiFetch(path) {
  const res = await fetch(\`\${BASE}\${path}\`, {
    headers: { Authorization: \`Bearer \${TOKEN}\` },
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  return res.json()
}

export async function fetchPosts() {
  const data = await strapiFetch('/api/posts?populate=*&sort=publishedAt:desc')
  return (data?.data || []).map((i) => {
    const a = i.attributes || i
    return { slug: a.slug, title: a.title, publishedAt: a.publishedAt, excerpt: a.excerpt || '' }
  })
}

export async function fetchPostBySlug(slug) {
  const data = await strapiFetch(\`/api/posts?filters[slug][$eq]=\${encodeURIComponent(slug)}&populate=*\`)
  if (!data?.data?.length) return null
  const a = data.data[0].attributes || data.data[0]
  return { title: a.title, publishedAt: a.publishedAt, excerpt: a.excerpt || '', body: a.body || null, authorName: a.authorName || null, categories: [] }
}
`,
  }

  const usesPortableText = false

  return {
    '.env.example': envFiles[cmsType],
    'lib/cms-client.js': clientFiles[cmsType],
    'app/blog/page.jsx': `import Link from 'next/link'
import { client } from '../../lib/sanity.client'

const POSTS_QUERY = \`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  "slug": slug.current,
  title,
  publishedAt,
  excerpt
}\`

export default async function BlogIndexPage() {
  const posts = await client.fetch(POSTS_QUERY)
  return (
    <main className="container" style={{ padding: 'var(--spacing-section) 0' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h1)' }}>Blog</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(posts || []).map((post) => (
          <li key={post.slug} style={{ marginBottom: '1rem' }}>
            <Link href={'/blog/' + post.slug} style={{ color: 'var(--color-primary)' }}>
              {post.title}
            </Link>
            {post.excerpt ? (
              <p style={{ color: 'var(--color-muted)', margin: '0.5rem 0 0' }}>{post.excerpt}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  )
}
`,
    'app/blog/[slug]/page.jsx': `import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import { client } from '../../../lib/sanity.client'

const POST_QUERY = \`*[_type == "post" && slug.current == $slug][0]{
  title,
  publishedAt,
  excerpt,
  body,
  "authorName": author->name,
  "categories": categories[]->title
}\`

export default async function BlogPostPage({ params }) {
  const post = await client.fetch(POST_QUERY, { slug: params.slug })
  if (!post) notFound()
  return (
    <article className="container" style={{ padding: 'var(--spacing-section) 0', maxWidth: '48rem' }}>
      <p>
        <Link href="/blog" style={{ color: 'var(--color-primary)' }}>
          ← Blog
        </Link>
      </p>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h1)' }}>{post.title}</h1>
      {post.authorName ? <p style={{ color: 'var(--color-muted)' }}>{post.authorName}</p> : null}
      {post.body ? <PortableText value={post.body} /> : null}
    </article>
  )
}
`,
  }
}

function renderNextSectionRenderer() {
  return `'use client'

import { useMemo, useState } from 'react'
import SmartLink from './SmartLink'

function SectionIntro({ section }) {
  return (
    <>
      {section.subheadline ? <p className="eyebrow">{section.subheadline}</p> : null}
      {section.headline ? <h2>{section.headline}</h2> : null}
      {section.body ? <p className="section-body">{section.body}</p> : null}
    </>
  )
}

function ActionRow({ actions = [] }) {
  if (!actions.length) return null
  return (
    <div className="action-row">
      {actions.map((action) => (
        <SmartLink
          key={action.id || action.label}
          className={action.style === 'primary' ? 'button button--primary' : 'button'}
          href={action.href || '#'}
        >
          {action.label || 'Learn More'}
        </SmartLink>
      ))}
    </div>
  )
}

function CardGrid({ items = [] }) {
  return (
    <div className="card-grid">
      {items.map((item) => (
        <article key={item.id || item.title} className="card">
          <h3>{item.title || item.label || item.value}</h3>
          <p>{item.body || item.quote || ''}</p>
        </article>
      ))}
    </div>
  )
}

function NavbarSection({ section }) {
  const [open, setOpen] = useState(false)
  return (
    <header className={open ? 'site-header is-open' : 'site-header'}>
      <div className="container nav-shell">
        <SmartLink className="brand" href="/">
          {section.headline || 'Site'}
        </SmartLink>
        <button className="nav-toggle" type="button" onClick={() => setOpen((value) => !value)}>
          Menu
        </button>
        <nav className="nav-links">
          {(section.links || []).map((link) => (
            <SmartLink key={link.id || link.label} href={link.href || '#'}>
              {link.label || 'Link'}
            </SmartLink>
          ))}
          <div className="nav-actions">
            <ActionRow actions={section.actions} />
          </div>
        </nav>
      </div>
    </header>
  )
}

function HeroSection({ section }) {
  return (
    <section className={\`section hero hero--\${section.variant || 'default'}\`} id={section.id}>
      <div className="container hero-grid">
        <div>
          {section.subheadline ? <p className="eyebrow">{section.subheadline}</p> : null}
          <h1>{section.headline}</h1>
          {section.body ? <p className="section-body">{section.body}</p> : null}
          <ActionRow actions={section.actions} />
        </div>
        <div className="hero-panel">
          {(section.items || []).map((item) => (
            <div key={item.id || item.title} className="hero-chip">
              {item.title || item.label || item.value}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection({ section }) {
  return (
    <section className="section stats" id={section.id}>
      <div className="container">
        <SectionIntro section={section} />
        <div className="stat-grid">
          {(section.items || []).map((item) => (
            <div key={item.id || item.label} className="stat-card">
              <strong>{item.value || item.title}</strong>
              <span>{item.label || item.body}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection({ section }) {
  return (
    <section className="section pricing" id={section.id}>
      <div className="container">
        <SectionIntro section={section} />
        <div className="pricing-grid">
          {(section.items || []).map((item) => (
            <article key={item.id || item.title} className="pricing-card">
              <h3>{item.title}</h3>
              <div className="price">{item.price}</div>
              <p>{item.body}</p>
              <ul>
                {(item.features || []).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection({ section }) {
  const behavior = section.interactions?.[0]?.behavior || 'single'
  const [openIds, setOpenIds] = useState(() =>
    behavior === 'multi' ? [section.items?.[0]?.id].filter(Boolean) : section.items?.[0]?.id || null,
  )

  const isOpen = (id) => (Array.isArray(openIds) ? openIds.includes(id) : openIds === id)

  const toggle = (id) => {
    if (behavior === 'multi') {
      setOpenIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]))
      return
    }
    setOpenIds((current) => (current === id ? null : id))
  }

  return (
    <section className="section faq" id={section.id}>
      <div className="container">
        <SectionIntro section={section} />
        <div className="faq-list">
          {(section.items || []).map((item, idx) => {
            const id = item.id || String(idx)
            return (
              <article key={id} className={isOpen(id) ? 'faq-item is-open' : 'faq-item'}>
                <button type="button" className="faq-trigger" onClick={() => toggle(id)}>
                  <span>{item.title}</span>
                  <span>+</span>
                </button>
                {isOpen(id) ? (
                  <div className="faq-content">
                    <p>{item.body}</p>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ContactFormSection({ section }) {
  const successMessage = useMemo(() => section.form?.successMessage || 'Submitted successfully.', [section.form])
  const [message, setMessage] = useState('')

  return (
    <section className="section contact" id={section.id}>
      <div className="container contact-shell">
        <div>
          <SectionIntro section={section} />
        </div>
        <form
          className="contact-form"
          onSubmit={(event) => {
            event.preventDefault()
            setMessage(successMessage)
          }}
        >
          {(section.fields || []).map((field) => (
            <label key={field.name}>
              <span>{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea name={field.name} placeholder={field.placeholder} required={field.required} />
              ) : (
                <input type={field.type || 'text'} name={field.name} placeholder={field.placeholder} required={field.required} />
              )}
            </label>
          ))}
          <button className="button button--primary" type="submit">
            Submit
          </button>
          <p className="form-message">{message}</p>
        </form>
      </div>
    </section>
  )
}

function ShipFastFooterLogo() {
  return (
    <span className="footer-branding__logo" aria-hidden="true">
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M26 4L8 20L14 22L26 10L38 22L44 20L26 4Z" fill="url(#sfn-g1)" opacity="0.9" />
        <path d="M14 22L14 40L22 36V24L14 22Z" fill="url(#sfn-g2)" opacity="0.8" />
        <path d="M38 22L38 40L30 36V24L38 22Z" fill="url(#sfn-g2)" opacity="0.8" />
        <path d="M22 24V36L26 38L30 36V24L26 20L22 24Z" fill="url(#sfn-g1)" />
        <path d="M22 38L26 48L30 38L26 40L22 38Z" fill="#a78bfa" opacity="0.7" />
        <circle cx="26" cy="16" r="2" fill="#c4b5fd" />
        <defs>
          <linearGradient id="sfn-g1" x1="8" y1="4" x2="44" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="sfn-g2" x1="14" y1="22" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6d28d9" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  )
}

function FooterSection({ section }) {
  return (
    <footer className="site-footer" id={section.id}>
      <div className="container footer-shell">
        <div className="footer-meta">
          <div>
            <strong>{section.headline}</strong>
            {section.body ? <p>{section.body}</p> : null}
          </div>
          <div className="footer-branding" aria-label="Built with Ship Fast">
            <a
              className="footer-branding__link"
              href="${SHIP_FAST_SITE_URL}"
              target="_blank"
              rel="noreferrer"
            >
              <ShipFastFooterLogo />
              <span className="footer-branding__text">
                <span className="footer-branding__label">Built with</span>
                <span className="footer-branding__name">Ship Fast</span>
              </span>
            </a>
          </div>
        </div>
        <nav className="footer-links">
          {(section.links || []).map((link) => (
            <SmartLink key={link.id || link.label} href={link.href || '#'}>
              {link.label || 'Link'}
            </SmartLink>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default function SectionRenderer({ section }) {
  switch (section.type) {
    case 'navbar':
      return <NavbarSection section={section} />
    case 'hero':
      return <HeroSection section={section} />
    case 'stats':
      return <StatsSection section={section} />
    case 'pricing':
      return <PricingSection section={section} />
    case 'faq':
      return <FaqSection section={section} />
    case 'contact-form':
      return <ContactFormSection section={section} />
    case 'footer':
      return <FooterSection section={section} />
    case 'cta':
      return (
        <section className="section cta" id={section.id}>
          <div className="container cta-shell">
            <div>
              <SectionIntro section={section} />
            </div>
            <ActionRow actions={section.actions} />
          </div>
        </section>
      )
    case 'product-grid':
    case 'featured-products':
      return (
        <section className={\`section \${section.type}\`} id={section.id}>
          <div className="container">
            <SectionIntro section={section} />
            <div className="product-grid">
              {(section.items || []).map((item) => (
                <article key={item.id || item.title} className="product-card">
                  <div className="product-image">{item.image ? <img src={item.image} alt={item.title} /> : <div className="product-placeholder" />}</div>
                  <h3>{item.title}</h3>
                  {item.price ? <span className="product-price">{item.price}</span> : null}
                  <p>{item.body || ''}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )
    case 'cart-summary':
      return (
        <section className="section cart-summary" id={section.id}>
          <div className="container">
            <SectionIntro section={section} />
            <p className="cart-empty-state">Your cart is empty. Start shopping to add items.</p>
          </div>
        </section>
      )
    default:
      return (
        <section className="section" id={section.id}>
          <div className="container">
            <SectionIntro section={section} />
            <CardGrid items={section.items} />
          </div>
        </section>
      )
  }
}
`
}

function renderNextPageModule(siteSpec, page, depth = 0) {
  const prefix = '../'.repeat(depth + 1)
  const metadata = buildNextMetadata(siteSpec, page)
  const structuredData = buildStructuredData(siteSpec, page)

  return `import PageTemplate from '${prefix}components/PageTemplate'
import siteSpec from '${prefix}lib/site-spec'

const page = siteSpec.pages.find((entry) => entry.id === ${JSON.stringify(page.id)})
const structuredData = ${structuredData.length ? JSON.stringify(serializeStructuredData(structuredData)) : 'null'}

export const metadata = ${serializeModule(metadata)}

export default function GeneratedPage() {
  return (
    <>
      {structuredData ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      ) : null}
      <PageTemplate siteSpec={siteSpec} page={page} />
    </>
  )
}
`
}

export function renderNextProject(siteSpec) {
  const cmsType = (siteSpec.exportOptions?.cms || '').toLowerCase()
  const cmsSanity = cmsType === 'sanity'
  const embedSanityStudio = cmsSanity && siteSpec.exportOptions?.embedSanityStudio !== false
  const isEcommerce = siteSpec.siteType === 'ecommerce'
  const cmsDependencies = {
    ...(cmsSanity
      ? {
          'next-sanity': '^9.8.27',
          '@sanity/client': '^7.20.0',
          '@portabletext/react': '^3.2.0',
          '@sanity/image-url': '^1.1.0',
          ...(embedSanityStudio
            ? {
                sanity: '^5.20.0',
                '@sanity/vision': '^5.20.0',
                'sanity-plugin-media': '^4.1.1',
                'sanity-plugin-seo': '^1.3.7',
                'styled-components': '^6.1.13',
                'react-is': '^18.3.1',
              }
            : {}),
        }
      : {}),
    ...(isEcommerce ? { '@medusajs/js-sdk': '^2.13.5' } : {}),
  }
  const sanityScripts = embedSanityStudio ? { studio: 'bun run --cwd studio dev' } : {}
  const nextConfigMjs = cmsSanity
    ? embedSanityStudio
      ? `/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    'sanity',
    'next-sanity',
    '@sanity/vision',
    'sanity-plugin-media',
    'sanity-plugin-seo',
  ],
}

export default nextConfig
`
      : `/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['next-sanity', '@portabletext/react'],
}

export default nextConfig
`
    : `/** @type {import('next').NextConfig} */
const nextConfig = {}

export default nextConfig
`
  const homePage = (siteSpec.pages || []).find((page) => page.route === '/') || siteSpec.pages?.[0]
  const siteSeo = resolvePageSeo(siteSpec, homePage)
  const sitemapEntries = buildSitemapEntries(siteSpec)
  const robotsConfig = siteSeo.siteUrl
    ? { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${siteSeo.siteUrl}/sitemap.xml` }
    : { rules: [{ userAgent: '*', allow: '/' }] }
  const fontLines = buildNextLayoutFontLinkLines(siteSpec)
  const layoutHeadBlock = fontLines.trim()
    ? `      <head>${fontLines}      </head>\n`
    : ''
  const files = {
    'package.json': renderNextPackageJson(siteSpec.projectName, cmsDependencies, sanityScripts),
    'next.config.mjs': nextConfigMjs,
    'app/layout.jsx': `import './globals.css'

export const metadata = {
  title: ${JSON.stringify(siteSpec.seo?.title || siteSpec.projectName)},
  description: ${JSON.stringify(siteSpec.seo?.description || '')},
  applicationName: ${JSON.stringify(siteSpec.seo?.siteName || siteSpec.projectName)},
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: ${JSON.stringify(siteSeo.themeColor)},
}

export default function RootLayout({ children }) {
  return (
    <html lang=${JSON.stringify(siteSeo.htmlLang)} suppressHydrationWarning>
${layoutHeadBlock}      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
`,
    'app/globals.css': buildGlobalCss(siteSpec.theme),
    'app/robots.js': `export default function robots() {
  return ${serializeModule(robotsConfig)}
}
`,
    'app/sitemap.js': `export default function sitemap() {
  return ${serializeModule(sitemapEntries)}
}
`,
    'lib/clone-runtime.js': renderCloneRuntimeModule(),
    'lib/site-spec.js': `const siteSpec = ${serializeModule(slimSiteSpecForBundle(siteSpec))}

export default siteSpec
`,
    'components/ExactClonePage.jsx': renderNextExactClonePageComponent(),
    'components/PageTemplate.jsx': `import ExactClonePage from './ExactClonePage'
import SectionRenderer from './SectionRenderer'

export default function PageTemplate({ siteSpec, page }) {
  if (!page) {
    return (
      <main className="empty-state">
        <div>
          <h1>Page not found</h1>
          <p>The site spec does not include this route.</p>
        </div>
      </main>
    )
  }

  if (page.renderBlueprint?.exactClone && page.renderBlueprint?.bodyHtml) {
    return <ExactClonePage page={page} />
  }

  return (
    <div className="site-shell">
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} siteSpec={siteSpec} />
      ))}
    </div>
  )
}
`,
    'components/SectionRenderer.jsx': renderNextSectionRenderer(),
    'components/SmartLink.jsx': `import Link from 'next/link'

export default function SmartLink({ href = '#', children, ...props }) {
  const internal = href.startsWith('/')
  if (!internal) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}
`,
  }

  for (const page of siteSpec.pages || []) {
    const segments = routeToNextSegments(page.route)
    const dir = page.route === '/' ? 'app' : ['app', ...segments].join('/')
    files[`${dir}/page.jsx`] = renderNextPageModule(siteSpec, page, segments.length)
  }

  if (cmsSanity) {
    Object.assign(files, renderSanityNextExportFiles(siteSpec))
    if (embedSanityStudio) {
      Object.assign(files, collectShipFastStudioFiles())
      files['app/studio/[[...tool]]/page.jsx'] = `import { NextStudio } from 'next-sanity/studio'
import config from '../../../studio/sanity.config'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}
`
    }
  } else if (cmsType && ['contentful', 'strapi'].includes(cmsType)) {
    Object.assign(files, renderCmsNextExportFiles(cmsType))
  }

  if (isEcommerce) {
    Object.assign(files, renderMedusaExportFiles())
    Object.assign(files, renderEcommerceComponents())
  }

  return { files }
}
