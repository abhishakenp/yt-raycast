export class MockProvider {
  name = 'mock'
  displayName = 'Mock (Preview)'

  getDependencies() {
    return {}
  }

  getEnvTemplate() {
    return '# Mock e-commerce provider — no configuration needed\n'
  }

  getClientCode() {
    return `import siteSpec from './site-spec'

const seedProducts = siteSpec?.ecommerce?.products || []
const seedCategories = siteSpec?.ecommerce?.categories || []
let mockCart = { items: [], total: 0 }

export async function fetchProducts() { return seedProducts }
export async function fetchProduct(handle) { return seedProducts.find((p) => p.handle === handle) || null }
export async function fetchCategories() { return seedCategories }
export async function createCart() { mockCart = { items: [], total: 0 }; return mockCart }
export async function addItem(cartId, variantId, quantity = 1) {
  const product = seedProducts.find((p) => p.id === variantId)
  if (product) { mockCart.items.push({ ...product, quantity }); mockCart.total = mockCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) }
  return mockCart
}
export async function getCart() { return mockCart }
export async function checkout() { const order = { ...mockCart, status: 'completed' }; mockCart = { items: [], total: 0 }; return order }
export async function listPaymentProviders() { return [{ id: 'pp_system_default', is_enabled: true }] }
export async function initiatePayment() { return { payment_session: { id: 'mock-session', status: 'pending' } } }
`
  }

  getInterface() {
    return [
      'fetchProducts',
      'fetchProduct',
      'fetchCategories',
      'createCart',
      'addItem',
      'getCart',
      'checkout',
      'listPaymentProviders',
      'initiatePayment',
    ]
  }
}
