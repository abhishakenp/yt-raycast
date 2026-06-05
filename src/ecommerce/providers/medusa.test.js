import { describe, expect, test } from 'vitest'
import { MedusaProvider } from './medusa.js'

describe('MedusaProvider payment template', () => {
  test('initializes payment sessions from the retrieved cart object', () => {
    const code = new MedusaProvider().getClientCode('nextjs')
    expect(code).toContain('const { cart } = await client.store.cart.retrieve(cartId)')
    expect(code).toContain('client.store.payment.initiatePaymentSession(cart, { provider_id: providerId })')
    expect(code).not.toContain('initiatePaymentSession(cartId')
  })
})
