import { MedusaProvider } from './providers/medusa.js'
import { MockProvider } from './providers/mock.js'

const providers = {
  medusa: MedusaProvider,
  mock: MockProvider,
}

export function getEcommerceProvider(providerName = 'mock') {
  const Provider = providers[providerName]
  if (!Provider) {
    console.warn(`Unknown e-commerce provider: ${providerName}, falling back to mock`)
    return new MockProvider()
  }
  return new Provider()
}

export function getSupportedProviders() {
  return Object.keys(providers)
}
