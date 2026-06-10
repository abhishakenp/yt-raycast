import { createHash } from 'node:crypto'
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
import { renderGeneratedSiteLlmsTxt } from '../llms-txt.js'
import { shouldUseSwiper } from '../../lib/swiper-policy.js'
import { SHIP_FAST_SITE_URL } from '../../marketing.js'

function collectThemeGoogleFontFamilies(theme = {}) {
  const typo = theme.typography || {}
  const raw = [typo.heading, typo.body, typo.mono]
  const seen = new Set()
  const out = []
  for (const f of raw) {
    if (typeof f !== 'string') continue
    const first = f
      .split(',')[0]
      .trim()
      .replace(/^["']|["']$/g, '')
      .trim()
    if (!first) continue
    if (
      /^(system-ui|sans-serif|serif|monospace|ui-sans-serif|ui-monospace|apple-system)/i.test(first)
    )
      continue
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
        'framer-motion': '^12.38.0',
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

function renderMedusaExportFiles(session) {
  const backendUrl =
    String(session?.medusaConfig?.backendUrl || '').trim() || 'http://localhost:9000'
  const publishableKey = String(session?.medusaConfig?.publishableKey || '').trim()
  const prefilled = Boolean(
    String(session?.medusaConfig?.backendUrl || '').trim() || publishableKey,
  )

  return {
    '.env.example.medusa': `${prefilled ? '# Pre-filled for this session when available.\n' : ''}# Medusa Store API (server + browser)
MEDUSA_BACKEND_URL=${backendUrl}
NEXT_PUBLIC_MEDUSA_BACKEND_URL=${backendUrl}
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey}
# Optional: override default system payment provider id from Medusa Admin
# NEXT_PUBLIC_MEDUSA_PAYMENT_PROVIDER_ID=pp_system_default
# Razorpay (when configured in Medusa for the storefront)
# NEXT_PUBLIC_RAZORPAY_KEY_ID=
# On the Medusa server, set STORE_CORS to include this app origin (e.g. http://localhost:3000,http://localhost:7420). See infra/medusa/README.md in Ship Fast.
`,
    '.env.local': `MEDUSA_BACKEND_URL=${backendUrl}
NEXT_PUBLIC_MEDUSA_BACKEND_URL=${backendUrl}
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey}
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

export async function createPaymentSessions(cartId, providerId) {
  const client = getMedusaSdk()
  if (!client || !cartId) return null
  const pid =
    providerId ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_MEDUSA_PAYMENT_PROVIDER_ID) ||
    'pp_system_default'
  try {
    const { cart } = await client.store.cart.retrieve(cartId)
    if (!cart?.id) return null
    const { payment_collection } = await client.store.payment.initiatePaymentSession(cart, { provider_id: pid })
    return payment_collection || null
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

export async function setCartAddress(cartId, shippingAddress) {
  const client = getMedusaSdk()
  if (!client || !cartId) return null
  try {
    const { cart } = await client.store.cart.update(cartId, { shipping_address: shippingAddress })
    return cart || null
  } catch {
    return null
  }
}

export async function updateStoreCart(cartId, payload) {
  const client = getMedusaSdk()
  if (!client || !cartId) return null
  try {
    const { cart } = await client.store.cart.update(cartId, payload)
    return cart || null
  } catch {
    return null
  }
}
`,
  }
}

function renderEcommerceComponents(useSwiperProducts) {
  const productMarqueeFile =
    useSwiperProducts === true
      ? `'use client'

import { Children, cloneElement, isValidElement } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

export default function ProductMarquee({ children, ariaLabel = 'Products' }) {
  const nodes = Children.toArray(children).filter(isValidElement)
  const reduceMotion = useReducedMotion()
  if (nodes.length === 0) return null
  if (reduceMotion) {
    return (
      <div className="product-carousel" role="region" aria-label={ariaLabel}>
        <div className="product-carousel__mask product-carousel__mask--scroll">
          <div className="product-carousel__track product-carousel__track--static">
            {nodes}
            {nodes.map((child, i) =>
              cloneElement(child, {
                key: \`marquee-dup-\${i}\`,
                'aria-hidden': true,
              }),
            )}
          </div>
        </div>
      </div>
    )
  }
  return (
    <Swiper
      modules={[Pagination]}
      slidesPerView="auto"
      spaceBetween={16}
      loop={nodes.length > 2}
      grabCursor
      watchOverflow
      pagination={{ clickable: true, dynamicBullets: nodes.length > 4 }}
      className="product-carousel swiper"
      role="region"
      aria-label={ariaLabel}
    >
      {nodes.map((child, i) => (
        <SwiperSlide
          key={\`slide-\${i}\`}
          style={{ width: 'min(280px, 85vw)', maxWidth: 'min(280px, 85vw)', flexShrink: 0 }}
        >
          {child}
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
`
      : `'use client'

import { Children, cloneElement, isValidElement } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function ProductMarquee({ children, ariaLabel = 'Products' }) {
  const nodes = Children.toArray(children).filter(isValidElement)
  const reduceMotion = useReducedMotion()
  if (nodes.length === 0) return null
  const loop = (
    <>
      {nodes}
      {nodes.map((child, i) =>
        cloneElement(child, {
          key: \`marquee-dup-\${i}\`,
          'aria-hidden': true,
        }),
      )}
    </>
  )
  return (
    <div className="product-carousel" role="region" aria-label={ariaLabel}>
      {reduceMotion ? (
        <div className="product-carousel__mask product-carousel__mask--scroll">
          <div className="product-carousel__track product-carousel__track--static">{loop}</div>
        </div>
      ) : (
        <div className="product-carousel__mask">
          <motion.div
            className="product-carousel__track product-carousel__track--motion"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
            style={{ willChange: 'transform' }}
          >
            {loop}
          </motion.div>
        </div>
      )}
    </div>
  )
}
`
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
    <CartContext.Provider
      value={{ cart, loading, addItem, updateItem, removeItem, itemCount, refreshCart }}
    >
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

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useCart } from './CartProvider'

const formatMoney = (amount, currency) =>
  amount == null
    ? ''
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount / 100)

const getProductBadge = (product) => {
  const tag = product?.tags?.[0]?.value || ''
  const subtitle = product?.subtitle || ''
  const candidate = String(tag || subtitle).trim()
  if (!candidate) return ''
  if (candidate.length > 18) return candidate.slice(0, 18).trim()
  return candidate
}

export default function ProductCard({ product, variantId: forcedVariantId = null, cta = 'Add to cart' }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const reduceMotion = useReducedMotion()

  const selectedVariant = useMemo(() => {
    const variants = product?.variants || []
    if (!variants.length) return null
    if (!forcedVariantId) return variants[0] || null
    return variants.find((v) => v?.id === forcedVariantId) || variants[0] || null
  }, [product, forcedVariantId])

  const price = selectedVariant?.calculated_price?.calculated_amount
  const compareAt = selectedVariant?.calculated_price?.original_amount
  const currency = selectedVariant?.calculated_price?.currency_code || 'USD'
  const formatted = formatMoney(price, currency)
  const formattedCompare =
    compareAt != null && price != null && compareAt > price ? formatMoney(compareAt, currency) : ''

  const rating = product?.metadata?.rating
  const reviewsCount = product?.metadata?.reviewsCount
  const badge = useMemo(() => getProductBadge(product), [product])
  const href = '/product/' + (product?.handle || product?.id || '')
  const hasVariant = Boolean(selectedVariant?.id)

  const onAdd = async () => {
    if (!selectedVariant?.id) return
    setAdding(true)
    await addItem(selectedVariant.id)
    setAdding(false)
  }

  return (
    <motion.article
      className="card product-card product-card--retail"
      whileHover={reduceMotion ? undefined : { y: -6 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
    >
      <Link href={href} aria-label={product?.title || 'View product'}>
        <div className="card-media">
          {product?.thumbnail ? (
            <img src={product.thumbnail} alt={product.title || ''} />
          ) : (
            <div className="product-placeholder" />
          )}
        </div>
        <div className="product-card__content">
          {badge ? <span className="product-card__category">{badge}</span> : null}
          <h3>{product?.title || 'Product'}</h3>
          {rating != null || reviewsCount != null ? (
            <p className="product-card__rating">
              <span aria-hidden>★★★★★</span>
              <span className="product-card__rating-num">
                {rating != null ? String(rating) : '—'}
                {reviewsCount != null ? ' · ' + String(reviewsCount) + ' reviews' : ''}
              </span>
            </p>
          ) : null}
          {formatted ? (
            <p className="product-card__price-row">
              <span className="product-price">{formatted}</span>
              {formattedCompare ? <span className="product-price--compare">{formattedCompare}</span> : null}
            </p>
          ) : null}
          <p className="product-card__excerpt">Free shipping over $75 · 30-day returns</p>
        </div>
      </Link>
      <button
        className="button button--primary product-card__atc"
        onClick={onAdd}
        disabled={adding || !hasVariant}
        type="button"
      >
        {adding ? 'Adding…' : cta}
      </button>
    </motion.article>
  )
}
`,
    'components/ecommerce/CartDrawer.jsx': `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from './CartProvider'

const formatMoney = (amount, currency) =>
  amount == null
    ? ''
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount / 100)

export default function CartDrawer() {
  const { cart, loading, updateItem, removeItem, itemCount } = useCart()
  const [open, setOpen] = useState(false)

  const currency = cart?.region?.currency_code || 'USD'
  const subtotal = cart?.total != null ? formatMoney(cart.total, currency) : '$0.00'

  return (
    <>
      <button
        className="cart-toggle"
        onClick={() => setOpen(true)}
        type="button"
        aria-label={'Shopping cart' + (itemCount > 0 ? ', ' + itemCount + ' items' : '')}
      >
        <svg
          className="cart-toggle__icon"
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 1 1-8 0" />
        </svg>
        <span className="cart-toggle__label">
          Cart{itemCount > 0 ? ' (' + itemCount + ')' : ''}
        </span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.aside
              className="cart-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="cart-header">
              <h2>Your Cart</h2>
              <button onClick={() => setOpen(false)} type="button">&times;</button>
            </div>
            {loading ? <p>Loading...</p> : null}
            {!loading && (!cart?.items?.length) ? <p>Your cart is empty.</p> : null}
            <ul className="cart-items">
              {(cart?.items || []).map((item) => (
                <li key={item?.id || Math.random()} className="cart-item">
                  <div className="cart-item__row">
                    <div className="cart-item__meta">
                      <strong className="cart-item__title">{item.title}</strong>
                      <div className="cart-item__controls">
                        <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))} type="button">-</button>
                        <span className="cart-item__qty" aria-label="Quantity">{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)} type="button">+</button>
                        <button onClick={() => removeItem(item.id)} type="button">Remove</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-footer">
              <div className="cart-summary">
                <div className="cart-summary__row">
                  <span>Subtotal</span>
                  <strong>{subtotal}</strong>
                </div>
                <p className="cart-summary__hint">Shipping and taxes are calculated at checkout.</p>
              </div>
              <Link href="/checkout" className="button button--primary">Secure checkout</Link>
              <Link href="/shop" className="button">Continue shopping</Link>
              <p className="cart-trust">Free returns · Secure payment · Fast dispatch</p>
            </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
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
    'components/ecommerce/ProductMarquee.jsx': productMarqueeFile,
  }
}

function renderEcommerceAppShellFiles() {
  return {
    'components/ecommerce/EcommerceClientRoot.jsx': `'use client'

import { CartProvider } from './CartProvider'

export default function EcommerceClientRoot({ children }) {
  return <CartProvider>{children}</CartProvider>
}
`,
    'hooks/useCheckout.js': `'use client'

import { useCallback, useMemo, useState } from 'react'
import { useCart } from '../components/ecommerce/CartProvider'
import {
  completeCart,
  createPaymentSessions,
  listShippingOptions,
  setShippingMethod,
  updateStoreCart,
} from '../lib/medusa'

export const useCheckout = () => {
  const { cart, loading: cartLoading, refreshCart } = useCart()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address1, setAddress1] = useState('')
  const [city, setCity] = useState('')
  const [countryCode, setCountryCode] = useState('us')
  const [postalCode, setPostalCode] = useState('')

  const canSubmit = useMemo(
    () =>
      Boolean(
        email.trim() &&
          firstName.trim() &&
          lastName.trim() &&
          address1.trim() &&
          city.trim() &&
          countryCode.trim() &&
          postalCode.trim(),
      ),
    [email, firstName, lastName, address1, city, countryCode, postalCode],
  )

  const submit = useCallback(async () => {
    setError('')
    if (!cart?.id) {
      setError('Cart unavailable. Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY and connect to Medusa.')
      return
    }
    if (!cart.items?.length) {
      setError('Your cart is empty.')
      return
    }
    if (!canSubmit) {
      setError('Fill in all fields.')
      return
    }
    setBusy(true)
    try {
      const next = await updateStoreCart(cart.id, {
        email: email.trim(),
        shipping_address: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          address_1: address1.trim(),
          city: city.trim(),
          country_code: countryCode.trim().toLowerCase(),
          postal_code: postalCode.trim(),
        },
      })
      if (!next?.id) {
        setError('Could not update cart.')
        return
      }
      await refreshCart()
      const shipOpts = await listShippingOptions(next.id)
      const opt = shipOpts?.[0]
      if (!opt?.id) {
        setError('No shipping options. Configure shipping in Medusa Admin for this region.')
        return
      }
      await setShippingMethod(next.id, opt.id)
      await createPaymentSessions(next.id)
      await refreshCart()
      const result = await completeCart(next.id)
      const order = result?.order
      if (order?.id) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('medusa_cart_id')
          window.location.reload()
        }
        return
      }
      setError('Complete payment setup in Medusa or choose a different payment provider.')
    } catch {
      setError('Checkout failed.')
    } finally {
      setBusy(false)
    }
  }, [
    cart,
    canSubmit,
    email,
    firstName,
    lastName,
    address1,
    city,
    countryCode,
    postalCode,
    refreshCart,
  ])

  return {
    cart,
    cartLoading,
    busy,
    error,
    email,
    setEmail,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    address1,
    setAddress1,
    city,
    setCity,
    countryCode,
    setCountryCode,
    postalCode,
    setPostalCode,
    submit,
  }
}
`,
    'components/ecommerce/CheckoutView.jsx': `'use client'

import Link from 'next/link'
import { useCheckout } from '../../hooks/useCheckout'

const formatMoney = (amount, currency) =>
  amount == null
    ? ''
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount / 100)

export default function CheckoutView() {
  const {
    cart,
    cartLoading,
    busy,
    error,
    email,
    setEmail,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    address1,
    setAddress1,
    city,
    setCity,
    countryCode,
    setCountryCode,
    postalCode,
    setPostalCode,
    submit,
  } = useCheckout()

  const currency = cart?.region?.currency_code || 'USD'
  const subtotal = cart?.subtotal != null ? formatMoney(cart.subtotal, currency) : ''
  const shipping = cart?.shipping_total != null ? formatMoney(cart.shipping_total, currency) : ''
  const tax = cart?.tax_total != null ? formatMoney(cart.tax_total, currency) : ''
  const total = cart?.total != null ? formatMoney(cart.total, currency) : ''

  return (
    <div className="checkout-shell">
      <div className="checkout-progress" aria-label="Checkout progress">
        <div className="checkout-progress__step is-active">Details</div>
        <div className="checkout-progress__step">Shipping</div>
        <div className="checkout-progress__step">Payment</div>
      </div>
      {cartLoading ? <p>Loading cart…</p> : null}
      {!cartLoading && !cart?.items?.length ? (
        <p className="cart-empty-state">Your cart is empty. <Link href="/shop">Browse the shop</Link>.</p>
      ) : null}
      {cart?.items?.length ? (
        <div className="checkout-grid">
          <form
            className="checkout-form"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <div className="checkout-form__header">
              <h2>Guest checkout</h2>
              <p className="checkout-form__hint">Secure payment. Easy returns. Fast dispatch.</p>
            </div>
            <label>
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            <div className="checkout-form__row">
              <label>
                <span>First name</span>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
              </label>
              <label>
                <span>Last name</span>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
              </label>
            </div>
            <label>
              <span>Address</span>
              <input value={address1} onChange={(e) => setAddress1(e.target.value)} required autoComplete="street-address" />
            </label>
            <div className="checkout-form__row">
              <label>
                <span>City</span>
                <input value={city} onChange={(e) => setCity(e.target.value)} required autoComplete="address-level2" />
              </label>
              <label>
                <span>Postal code</span>
                <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required autoComplete="postal-code" />
              </label>
            </div>
            <label>
              <span>Country (ISO)</span>
              <input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} required autoComplete="country" maxLength={2} />
            </label>
            {error ? <p className="form-message" role="alert">{error}</p> : null}
            <button type="submit" className="button button--primary" disabled={busy}>
              {busy ? 'Processing…' : 'Continue to payment'}
            </button>
            <p className="checkout-trust">By placing your order, you agree to our Shipping and Returns policies.</p>
          </form>
          <aside className="checkout-summary" aria-label="Order summary">
            <h3>Order summary</h3>
            <ul className="checkout-summary__items">
              {(cart?.items || []).slice(0, 6).map((item) => (
                <li key={item?.id || Math.random()} className="checkout-summary__item">
                  <span className="checkout-summary__itemTitle">{item.title}</span>
                  <span className="checkout-summary__itemQty">×{item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="checkout-summary__totals">
              {subtotal ? <div className="checkout-summary__row"><span>Subtotal</span><span>{subtotal}</span></div> : null}
              {shipping ? <div className="checkout-summary__row"><span>Shipping</span><span>{shipping}</span></div> : <div className="checkout-summary__row"><span>Shipping</span><span>Calculated</span></div>}
              {tax ? <div className="checkout-summary__row"><span>Tax</span><span>{tax}</span></div> : <div className="checkout-summary__row"><span>Tax</span><span>Calculated</span></div>}
              {total ? <div className="checkout-summary__row checkout-summary__row--total"><strong>Total</strong><strong>{total}</strong></div> : null}
            </div>
            <div className="checkout-summary__badges">
              <span className="checkout-badge">Secure payment</span>
              <span className="checkout-badge">Free returns</span>
              <span className="checkout-badge">Fast dispatch</span>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
`,
    'app/shop/page.jsx': `import ProductCard from '../../components/ecommerce/ProductCard'
import { getProducts } from '../../lib/medusa'

export const metadata = {
  title: 'Shop',
}

export default async function ShopPage() {
  const products = await getProducts({ limit: 100 })
  return (
    <main className="container shop-page" style={{ padding: 'var(--spacing-section) 0' }}>
      <header className="shop-hero">
        <p className="eyebrow">Collections</p>
        <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Shop</h1>
        <p style={{ color: 'var(--color-muted)', maxWidth: '56ch' }}>
          Crafted essentials, designed to age beautifully. Explore the full assortment and discover your next staple.
        </p>
      </header>
      {products.length === 0 ? (
        <p style={{ color: 'var(--color-muted)' }}>
          No products loaded. Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY and publish products in Medusa Admin.
        </p>
      ) : (
        <div
          className="product-grid"
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}
`,
    'app/product/[handle]/page.jsx': `import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductByHandle } from '../../../lib/medusa'
import AddToCart from '../../../components/ecommerce/AddToCart'

export async function generateMetadata({ params }) {
  const product = await getProductByHandle(params.handle)
  return { title: product?.title || 'Product' }
}

export default async function ProductDetailPage({ params }) {
  const product = await getProductByHandle(params.handle)
  if (!product) notFound()
  const variant = product?.variants?.[0]
  const price = variant?.calculated_price?.calculated_amount
  const compareAt = variant?.calculated_price?.original_amount
  const currency = variant?.calculated_price?.currency_code || 'USD'
  const formatted =
    price != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price / 100) : ''
  const formattedCompare =
    compareAt != null && price != null && compareAt > price
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(compareAt / 100)
      : ''
  return (
    <main className="container product-page" style={{ padding: 'var(--spacing-section) 0' }}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/" style={{ color: 'var(--color-muted)' }}>Home</Link>
        <span aria-hidden> / </span>
        <Link href="/shop" style={{ color: 'var(--color-muted)' }}>Shop</Link>
        <span aria-hidden> / </span>
        <span>{product.title}</span>
      </nav>
      <div className="product-detail">
        <section className="product-detail__media" aria-label="Product gallery">
          {product.thumbnail ? (
            <img className="product-detail__img" src={product.thumbnail} alt={product.title || ''} />
          ) : (
            <div className="product-detail__placeholder" />
          )}
          <div className="product-detail__thumbRow" aria-hidden>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="product-detail__thumb" />
            ))}
          </div>
        </section>
        <section className="product-detail__buy" aria-label="Purchase">
          <p className="eyebrow">In stock · Fast dispatch</p>
          <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>{product.title}</h1>
          {formatted ? (
            <p className="product-detail__priceRow">
              <span className="product-detail__price">{formatted}</span>
              {formattedCompare ? <span className="product-detail__compare">{formattedCompare}</span> : null}
            </p>
          ) : null}
          <p className="product-detail__subcopy" style={{ color: 'var(--color-muted)' }}>
            A refined essential built for daily wear. Thoughtful details, premium feel, and an easy silhouette.
          </p>
          <div className="product-detail__ctaRow">
            <AddToCart variantId={variant?.id || ''} disabled={!variant?.id} />
            <Link href="/checkout" className="button">Checkout</Link>
          </div>
          <div className="product-detail__policies">
            <details className="product-detail__accordion">
              <summary>Shipping</summary>
              <p>Free shipping over $75. Most orders ship within 24 hours.</p>
            </details>
            <details className="product-detail__accordion">
              <summary>Returns</summary>
              <p>30-day returns. Simple, no-hassle exchanges.</p>
            </details>
            <details className="product-detail__accordion">
              <summary>Warranty</summary>
              <p>Built to last. We stand behind every piece.</p>
            </details>
          </div>
          <div className="product-detail__trustRow" aria-label="Trust badges">
            <span className="product-detail__trust">Secure payment</span>
            <span className="product-detail__trust">Free returns</span>
            <span className="product-detail__trust">Premium materials</span>
          </div>
        </section>
      </div>
      <section className="product-related" aria-label="Complete the look">
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>Complete the look</h2>
        <p style={{ color: 'var(--color-muted)' }}>A few pairings our customers love.</p>
      </section>
    </main>
  )
}
`,
    'app/checkout/page.jsx': `import CheckoutView from '../../components/ecommerce/CheckoutView'

export const metadata = {
  title: 'Checkout',
}

export default function CheckoutPage() {
  return (
    <main className="container" style={{ padding: 'var(--spacing-section) 0' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)' }}>Checkout</h1>
      <CheckoutView />
    </main>
  )
}
`,
  }
}

function renderSanityNextExportFiles(siteSpec, session) {
  const siteUrl = normalizeSiteUrl(siteSpec?.seo?.siteUrl || '')
  const staticSitemapEntries = buildSitemapEntries(siteSpec)
  const embeddedSiteUrl = JSON.stringify(siteUrl)
  const embeddedStaticSitemap = JSON.stringify(staticSitemapEntries)
  const sanityProjectId =
    String(session?.sanityConfig?.projectId || '').trim() ||
    String(siteSpec?.exportOptions?.sanityProjectId || '').trim()
  const sanityDataset =
    String(session?.sanityConfig?.dataset || '').trim() ||
    String(siteSpec?.exportOptions?.sanityDataset || '').trim() ||
    'production'
  const prefilled = Boolean(
    String(session?.sanityConfig?.projectId || '').trim() ||
    String(session?.sanityConfig?.dataset || '').trim(),
  )

  return {
    '.env.example': `${prefilled ? '# Pre-filled for this session when available.\n' : ''}NEXT_PUBLIC_SANITY_PROJECT_ID=${sanityProjectId}
NEXT_PUBLIC_SANITY_DATASET=${sanityDataset || 'production'}
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_READ_TOKEN=
SANITY_STUDIO_PROJECT_ID=${sanityProjectId}
SANITY_STUDIO_DATASET=${sanityDataset || 'production'}
`,
    '.env.local': `NEXT_PUBLIC_SANITY_PROJECT_ID=${sanityProjectId}
NEXT_PUBLIC_SANITY_DATASET=${sanityDataset || 'production'}
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_READ_TOKEN=
SANITY_STUDIO_PROJECT_ID=${sanityProjectId}
SANITY_STUDIO_DATASET=${sanityDataset || 'production'}
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

function renderNextSectionRenderer(siteSpec) {
  const useSwiperExport = shouldUseSwiper(siteSpec)
  const useMarqueeExport = !useSwiperExport && siteSpec.siteType === 'ecommerce'
  const swiperImportBlock = useSwiperExport
    ? `import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

`
    : ''
  const productMarqueeTrackBlock = useMarqueeExport
    ? `function ProductMarqueeTrack({ children }) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) {
    return (
      <div className="product-carousel__mask product-carousel__mask--scroll">
        <div className="product-carousel__track product-carousel__track--static">{children}</div>
      </div>
    )
  }
  return (
    <div className="product-carousel__mask">
      <motion.div
        className="product-carousel__track product-carousel__track--motion"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        style={{ willChange: 'transform' }}
      >
        {children}
      </motion.div>
    </div>
  )
}

`
    : ''
  const ecommerceImportBlock =
    siteSpec.siteType === 'ecommerce'
      ? `import CartDrawer from './ecommerce/CartDrawer'

`
      : ''
  const ecommerceNavBlock =
    siteSpec.siteType === 'ecommerce'
      ? `          <div className="nav-actions">
            <SmartLink className="button" href="/shop">Shop</SmartLink>
            <CartDrawer />
            <ActionRow actions={section.actions} />
          </div>`
      : `          <div className="nav-actions">
            <ActionRow actions={section.actions} />
          </div>`
  return `'use client'

${swiperImportBlock}${ecommerceImportBlock}import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import SmartLink from './SmartLink'

const USE_PRODUCT_SWIPER = ${useSwiperExport ? 'true' : 'false'}
const USE_PRODUCT_MARQUEE = ${useMarqueeExport ? 'true' : 'false'}

${productMarqueeTrackBlock}

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
      {items.filter(Boolean).map((item) => (
        <article key={item?.id || item?.title || Math.random()} className="card" data-reveal>
          <h3>{item?.title || item?.label || item?.value || 'Item'}</h3>
          <p>{item?.body || item?.quote || ''}</p>
        </article>
      ))}
    </div>
  )
}

function NavbarSection({ section, siteSpec }) {
  const [open, setOpen] = useState(false)
  const isStore = siteSpec?.siteType === 'ecommerce'
  const brandLogo = section?.styling?.brandLogo
  const shopLink = useMemo(
    () => (section.links || []).find((l) => String(l?.label || '').toLowerCase() === 'shop' && Array.isArray(l?.children) && l.children.length),
    [section.links],
  )
  return (
    <>
      {isStore ? (
        <div className="store-promo-bar">
          <div className="container store-promo-bar__inner">
            <span className="store-promo-bar__msg">Free shipping on orders over $75 · Easy returns</span>
          </div>
        </div>
      ) : null}
      <header
        className={\`\${open ? 'site-header is-open' : 'site-header'}\${isStore ? ' site-header--store' : ''}\`}
      >
        <div className="container nav-shell">
          <SmartLink className="brand" href="/">
            {brandLogo?.kind === 'remote' && brandLogo.src ? (
              <span className="brand-logo" aria-hidden={false}>
                <img src={brandLogo.src} alt={brandLogo.alt || 'Company logo'} decoding="async" loading="eager" />
              </span>
            ) : brandLogo?.kind === 'svg' && brandLogo.svg ? (
              <span className="brand-logo" aria-hidden={false} dangerouslySetInnerHTML={{ __html: brandLogo.svg }} />
            ) : null}
            <span className="brand-name">{section.headline || 'Site'}</span>
          </SmartLink>
          <button className="nav-toggle" type="button" onClick={() => setOpen((value) => !value)}>
            Menu
          </button>
          <nav className="nav-links">
            {(section.links || []).filter(Boolean).map((link) => {
              const hasChildren = Array.isArray(link?.children) && link?.children?.length
              if (isStore && hasChildren) {
                return (
                  <div key={link?.id || link?.label || Math.random()} className="nav-dropdown">
                    <button type="button" className="nav-dropdown__trigger">
                      {link?.label || 'Shop'}
                    </button>
                    <div className="nav-dropdown__panel" role="menu" aria-label={link?.label || 'Shop'}>
                      {(link?.children || []).filter(Boolean).map((child) => (
                        <SmartLink key={child?.id || child?.label || Math.random()} href={child?.href || '#'} role="menuitem">
                          {child?.label || 'Link'}
                        </SmartLink>
                      ))}
                    </div>
                  </div>
                )
              }
              return (
                <SmartLink key={link?.id || link?.label || Math.random()} href={link?.href || '#'}>
                  {link?.label || 'Link'}
                </SmartLink>
              )
            })}
            {isStore ? (
              <div className="store-nav-tools">
                <label className="store-search">
                  <span className="visually-hidden">Search products</span>
                  <input type="search" className="store-search__input" placeholder="Search products…" autoComplete="off" />
                </label>
                <SmartLink className="store-account" href="/account">
                  Account
                </SmartLink>
                <SmartLink className="store-account" href="/wishlist">
                  Wishlist
                </SmartLink>
              </div>
            ) : null}
${ecommerceNavBlock}
          </nav>
        </div>
      </header>
    </>
  )
}

function HeroSection({ section, siteSpec }) {
  const isStore = siteSpec?.siteType === 'ecommerce'
  const heroImg = section.heroImage || section.imageUrl || section.image
  return (
    <section
      className={\`section hero hero--\${section.variant || 'default'}\${isStore ? ' hero--store' : ''}\`}
      id={section.id}
    >
      <div className="container hero-grid">
        <div>
          {section.subheadline ? <p className="eyebrow">{section.subheadline}</p> : null}
          <h1>{section.headline}</h1>
          {section.body ? <p className="section-body">{section.body}</p> : null}
          <ActionRow actions={section.actions} />
        </div>
        <div className="hero-panel">
          {heroImg ? (
            <figure className="hero-figure">
              <img
                className="hero-image"
                src={heroImg}
                alt={section.imageAlt || ''}
                loading="eager"
                decoding="async"
              />
            </figure>
          ) : null}
          {(section.items || []).filter(Boolean).map((item) => (
            <div key={item?.id || item?.title || Math.random()} className="hero-chip">
              {item?.title || item?.label || item?.value}
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
          {(section.items || []).filter(Boolean).map((item) => (
            <div key={item?.id || item?.label || Math.random()} className="stat-card" data-reveal>
              <span className="stat-card__label">{item.label || item.body}</span>
              <strong className="stat-card__value">{item.value || item.title}</strong>
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
          {(section.items || []).filter(Boolean).map((item) => (
            <article key={item?.id || item?.title || Math.random()} className="pricing-card" data-reveal>
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
  const brandLogo = section?.styling?.brandLogo
  return (
    <footer className="site-footer" id={section.id}>
      <div className="container footer-shell">
        <div className="footer-meta">
          <div>
            <div className="footer-brand">
              {brandLogo?.kind === 'remote' && brandLogo.src ? (
                <span className="brand-logo" aria-hidden={false}>
                  <img src={brandLogo.src} alt={brandLogo.alt || 'Company logo'} decoding="async" loading="eager" />
                </span>
              ) : brandLogo?.kind === 'svg' && brandLogo.svg ? (
                <span
                  className="brand-logo"
                  aria-hidden={false}
                  dangerouslySetInnerHTML={{ __html: brandLogo.svg }}
                />
              ) : null}
              <strong>{section.headline}</strong>
            </div>
            {section.body ? <p>{section.body}</p> : null}
          </div>
        </div>
        <nav className="footer-links">
          {(section.links || []).map((link) => (
            <SmartLink key={link.id || link.label} href={link.href || '#'}>
              {link.label || 'Link'}
            </SmartLink>
          ))}
        </nav>
        <div className="footer-ship-fast-attribution">
          <div className="footer-branding" aria-label="Built with Ship Fast">
            <a className="footer-branding__link" href="${SHIP_FAST_SITE_URL}" target="_blank" rel="noreferrer">
              <ShipFastFooterLogo />
              <span className="footer-branding__text">
                <span className="footer-branding__label">Built with</span>
                <span className="footer-branding__name">Ship Fast</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function SectionRenderer({ section, siteSpec }) {
  const reduceMotion = useReducedMotion()
  switch (section.type) {
    case 'navbar':
      return <NavbarSection section={section} siteSpec={siteSpec} />
    case 'hero':
      return <HeroSection section={section} siteSpec={siteSpec} />
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
    case 'featured-products': {
      const items = section.items || []
      const showSwiper = USE_PRODUCT_SWIPER && items.length > 0
      const showMarquee = USE_PRODUCT_MARQUEE && items.length > 0
      const card = (item, idx, hidden) => {
        const cat = item.category || item.collection
        const compare =
          item.compareAt != null && item.compareAt !== ''
            ? String(item.compareAt)
            : item.compare_at != null && item.compare_at !== ''
              ? String(item.compare_at)
              : null
        return (
          <article
            key={\`\${item.id || item.title}-\${idx}\`}
            className="card product-card product-card--retail product-card--carousel"
            {...(hidden ? { 'aria-hidden': true } : {})}
          >
            <div className="product-image">
              {item.image ? <img src={item.image} alt={hidden ? '' : item.title} /> : <div className="product-placeholder" />}
            </div>
            <div className="product-card__content">
              {cat ? <span className="product-card__category">{cat}</span> : null}
              <h3>{item.title}</h3>
              {item.rating != null && item.rating !== '' ? (
                <div className="product-card__rating">
                  <span className="product-stars" aria-hidden="true">
                    ★★★★★
                  </span>
                  <span className="product-card__rating-num">{Number(item.rating).toFixed(1)}</span>
                </div>
              ) : null}
              <div className="product-card__price-row">
                {item.price ? <span className="product-price">{item.price}</span> : null}
                {compare ? <span className="product-price product-price--compare">{compare}</span> : null}
              </div>
              {item.body ? <p className="product-card__excerpt">{item.body}</p> : null}
              <button type="button" className="product-card__atc button button--primary">
                Add to cart
              </button>
            </div>
          </article>
        )
      }
      if (showSwiper) {
        if (reduceMotion) {
          return (
            <section className={\`section \${section.type} section--product-marquee\`} id={section.id}>
              <div className="container">
                <SectionIntro section={section} />
              </div>
              <div className="product-carousel" role="region" aria-label="Products">
                <div className="product-carousel__mask product-carousel__mask--scroll">
                  <div className="product-carousel__track product-carousel__track--static">
                    {items.map((item, idx) => card(item, idx, false))}
                  </div>
                </div>
              </div>
            </section>
          )
        }
        return (
          <section className={\`section \${section.type} section--product-marquee\`} id={section.id}>
            <div className="container">
              <SectionIntro section={section} />
            </div>
            <Swiper
              modules={[Pagination, Navigation]}
              slidesPerView="auto"
              spaceBetween={16}
              loop={items.length > 2}
              grabCursor
              watchOverflow
              navigation
              pagination={{ clickable: true, dynamicBullets: items.length > 4 }}
              className="product-carousel swiper"
              role="region"
              aria-label="Products"
            >
              {items.map((item, idx) => (
                <SwiperSlide
                  key={\`\${item.id || item.title}-\${idx}\`}
                  style={{ width: 'min(280px, 85vw)', maxWidth: 'min(280px, 85vw)', flexShrink: 0 }}
                >
                  {card(item, idx, false)}
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )
      }
      if (showMarquee) {
        return (
          <section className={\`section \${section.type} section--product-marquee\`} id={section.id}>
            <div className="container">
              <SectionIntro section={section} />
            </div>
            <div className="product-carousel" role="region" aria-label="Products">
              <ProductMarqueeTrack>
                {items.map((item, idx) => card(item, idx, false))}
                {items.map((item, idx) => card(item, idx, true))}
              </ProductMarqueeTrack>
            </div>
          </section>
        )
      }
      return (
        <section className={\`section \${section.type} section--store-products\`} id={section.id}>
          <div className="container">
            <SectionIntro section={section} />
            <div className="product-grid">
              {items.map((item) => {
                const cat = item.category || item.collection
                const compare =
                  item.compareAt != null && item.compareAt !== ''
                    ? String(item.compareAt)
                    : item.compare_at != null && item.compare_at !== ''
                      ? String(item.compare_at)
                      : null
                return (
                  <article key={item?.id || item?.title || Math.random()} className="card product-card product-card--retail" data-reveal>
                    <div className="product-image">
                      {item.image ? <img src={item.image} alt={item.title} /> : <div className="product-placeholder" />}
                    </div>
                    <div className="product-card__content">
                      {cat ? <span className="product-card__category">{cat}</span> : null}
                      <h3>{item.title}</h3>
                      {item.rating != null && item.rating !== '' ? (
                        <div className="product-card__rating">
                          <span className="product-stars" aria-hidden="true">
                            ★★★★★
                          </span>
                          <span className="product-card__rating-num">{Number(item.rating).toFixed(1)}</span>
                        </div>
                      ) : null}
                      <div className="product-card__price-row">
                        {item.price ? <span className="product-price">{item.price}</span> : null}
                        {compare ? <span className="product-price product-price--compare">{compare}</span> : null}
                      </div>
                      {item.body ? <p className="product-card__excerpt">{item.body}</p> : null}
                      <button type="button" className="product-card__atc button button--primary">
                        Add to cart
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )
    }
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

export function renderNextProject(siteSpec, session) {
  const cmsType = (siteSpec.exportOptions?.cms || '').toLowerCase()
  const cmsSanity = cmsType === 'sanity'
  const embedSanityStudio = cmsSanity && siteSpec.exportOptions?.embedSanityStudio !== false
  const isEcommerce = siteSpec.siteType === 'ecommerce'
  const useSwiper = shouldUseSwiper(siteSpec)
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
    ...(useSwiper ? { swiper: '^12.0.0' } : {}),
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
  const llmsTxtBody = renderGeneratedSiteLlmsTxt(siteSpec)
  const robotsConfig = siteSeo.siteUrl
    ? { rules: [{ userAgent: '*', allow: '/' }], sitemap: `${siteSeo.siteUrl}/sitemap.xml` }
    : { rules: [{ userAgent: '*', allow: '/' }] }
  const fontLines = buildNextLayoutFontLinkLines(siteSpec)
  const llmsTxtLinkLine =
    '        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable site summary" />'
  const layoutHeadBlock = `      <head>
${llmsTxtLinkLine}
${fontLines.trim() ? fontLines.replace(/^\n/, '') : ''}      </head>\n`
  const layoutEcommerceImport = isEcommerce
    ? `import EcommerceClientRoot from '../components/ecommerce/EcommerceClientRoot'
`
    : ''
  const layoutEcommerceBody = isEcommerce
    ? '<EcommerceClientRoot>{children}</EcommerceClientRoot>'
    : '{children}'
  const files = {
    'package.json': renderNextPackageJson(siteSpec.projectName, cmsDependencies, sanityScripts),
    'next.config.mjs': nextConfigMjs,
    'app/layout.jsx': `import './globals.css'
${layoutEcommerceImport}${
      useSwiper
        ? `import 'swiper/css'
import 'swiper/css/pagination'
`
        : ''
    }
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
${layoutHeadBlock}      <body suppressHydrationWarning>${layoutEcommerceBody}</body>
    </html>
  )
}
`,
    'app/globals.css': (function () {
      const css = buildGlobalCss(siteSpec.theme, {
        ecommerce: siteSpec.siteType === 'ecommerce',
        siteType: siteSpec.siteType,
      })
      const hash = createHash('sha256').update(css).digest('hex').slice(0, 12)
      return `/* hash: ${hash} */\n${css}`
    })(),
    'app/robots.js': `export default function robots() {
  return ${serializeModule(robotsConfig)}
}
`,
    'app/llms.txt/route.js': `export function GET() {
  return new Response(${JSON.stringify(llmsTxtBody)}, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
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
    'components/MotionPageShell.jsx': `'use client'

import { motion, useReducedMotion } from 'framer-motion'

export default function MotionPageShell({ children }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.main
      className="motion-page-shell"
      initial={reduceMotion ? false : { opacity: 1, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  )
}
`,
    'components/RevealObserver.jsx': `'use client'

import { useEffect } from 'react'

export default function RevealObserver() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'))
      return
    }
    const els = document.querySelectorAll('[data-reveal]')
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        })
      },
      { threshold: 0.08 },
    )
    els.forEach((el) => io.observe(el))
    const t = window.setTimeout(() => {
      document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => el.classList.add('is-visible'))
    }, 2800)
    return () => {
      window.clearTimeout(t)
      io.disconnect()
    }
  }, [])
  return null
}
`,
    'components/PageTemplate.jsx': `import ExactClonePage from './ExactClonePage'
import MotionPageShell from './MotionPageShell'
import RevealObserver from './RevealObserver'
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
    <MotionPageShell>
      <RevealObserver />
      <div className={siteSpec?.siteType === 'ecommerce' ? 'site-shell site-shell--store' : 'site-shell'}>
        {page.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} siteSpec={siteSpec} />
        ))}
      </div>
    </MotionPageShell>
  )
}
`,
    'components/SectionRenderer.jsx': renderNextSectionRenderer(siteSpec),
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
    Object.assign(files, renderSanityNextExportFiles(siteSpec, session))
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
    Object.assign(files, renderMedusaExportFiles(session))
    Object.assign(files, renderEcommerceComponents(useSwiper))
    Object.assign(files, renderEcommerceAppShellFiles())
  }

  return { files }
}
