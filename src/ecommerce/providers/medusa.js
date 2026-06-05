export class MedusaProvider {
  name = 'medusa'
  displayName = 'Medusa.js'

  getDependencies() {
    return { '@medusajs/js-sdk': '^2.13.5' }
  }

  getEnvTemplate(framework = 'nextjs') {
    if (framework === 'react') {
      return `# Medusa.js E-Commerce\nVITE_MEDUSA_BACKEND_URL=http://localhost:9000\nVITE_MEDUSA_PUBLISHABLE_KEY=\n`
    }
    return `# Medusa.js E-Commerce — optional, works without these\nMEDUSA_BACKEND_URL=http://localhost:9000\nNEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000\nNEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=\n`
  }

  getClientCode(framework = 'nextjs') {
    const envPrefix = framework === 'react' ? 'import.meta.env.' : 'process.env.'
    const backendUrlVar = framework === 'react' ? 'VITE_MEDUSA_BACKEND_URL' : 'MEDUSA_BACKEND_URL'
    const keyVar = framework === 'react' ? 'VITE_MEDUSA_PUBLISHABLE_KEY' : 'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY'

    return `import Medusa from '@medusajs/js-sdk'

const backendUrl = ${envPrefix}${backendUrlVar} || 'http://localhost:9000'
const publishableKey = ${envPrefix}${keyVar} || ''

let sdk = null

export function getMedusaSdk() {
  if (!publishableKey) return null
  if (!sdk) {
    sdk = new Medusa({ baseUrl: backendUrl, publishableKey })
  }
  return sdk
}

export async function fetchProducts(params = {}) {
  const client = getMedusaSdk()
  if (!client) return []
  try { const { products } = await client.store.product.list(params); return products || [] }
  catch { return [] }
}

export async function fetchProduct(handle) {
  const client = getMedusaSdk()
  if (!client || !handle) return null
  try { const { products } = await client.store.product.list({ handle }); return products?.[0] || null }
  catch { return null }
}

export async function fetchCategories() {
  const client = getMedusaSdk()
  if (!client) return []
  try { const { product_categories } = await client.store.category.list(); return product_categories || [] }
  catch { return [] }
}

export async function createCart(regionId) {
  const client = getMedusaSdk()
  if (!client) return null
  try { const { cart } = await client.store.cart.create({ region_id: regionId }); return cart || null }
  catch { return null }
}

export async function addItem(cartId, variantId, quantity = 1) {
  const client = getMedusaSdk()
  if (!client || !cartId || !variantId) return null
  try { const { cart } = await client.store.cart.createLineItem(cartId, { variant_id: variantId, quantity }); return cart || null }
  catch { return null }
}

export async function getCart(cartId) {
  const client = getMedusaSdk()
  if (!client || !cartId) return null
  try { const { cart } = await client.store.cart.retrieve(cartId); return cart || null }
  catch { return null }
}

export async function checkout(cartId) {
  const client = getMedusaSdk()
  if (!client || !cartId) return null
  try { const result = await client.store.cart.complete(cartId); return result || null }
  catch { return null }
}

export async function listPaymentProviders(regionId) {
  const client = getMedusaSdk()
  if (!client || !regionId) return []
  try { const { payment_providers } = await client.store.payment.listPaymentProviders({ region_id: regionId }); return payment_providers || [] }
  catch { return [] }
}

export async function initiatePayment(cartId, providerId = 'pp_system_default') {
  const client = getMedusaSdk()
  if (!client || !cartId) return null
  try {
    const { cart } = await client.store.cart.retrieve(cartId)
    if (!cart?.id) return null
    const { payment_collection } = await client.store.payment.initiatePaymentSession(cart, { provider_id: providerId })
    return payment_collection || null
  }
  catch { return null }
}
`
  }

  getInterface() {
    return ['fetchProducts', 'fetchProduct', 'fetchCategories', 'createCart', 'addItem', 'getCart', 'checkout', 'listPaymentProviders', 'initiatePayment']
  }
}
