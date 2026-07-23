import { describe, expect, it } from 'vitest'

import {
  requiresRazorpayDeploymentCredentials,
  validateRazorpayDeploymentCredentials,
} from './razorpay-deployment-credentials'

describe('Razorpay deployment credentials', () => {
  it('requires credentials only for a ready Medusa commerce connection', () => {
    expect(
      requiresRazorpayDeploymentCredentials({
        status: 'ready',
        configJson: '{"provider":"medusa"}',
      }),
    ).toBe(true)
    expect(
      requiresRazorpayDeploymentCredentials({
        status: 'pending',
        configJson: '{"provider":"medusa"}',
      }),
    ).toBe(false)
    expect(
      requiresRazorpayDeploymentCredentials({
        status: 'ready',
        configJson: '{"provider":"other"}',
      }),
    ).toBe(false)
  })

  it('blocks missing credentials', () => {
    expect(
      validateRazorpayDeploymentCredentials({
        environment: 'test',
        keyId: '',
        keySecret: '',
      }),
    ).toBe('Razorpay key ID and key secret are required to deploy this store.')
  })

  it('defaults safely to matching Razorpay test credentials', () => {
    expect(
      validateRazorpayDeploymentCredentials({
        environment: 'test',
        keyId: 'rzp_test_store_key',
        keySecret: 'test-secret',
      }),
    ).toBeUndefined()
    expect(
      validateRazorpayDeploymentCredentials({
        environment: 'test',
        keyId: 'rzp_live_store_key',
        keySecret: 'live-secret',
      }),
    ).toBe('Use a rzp_test_ key ID for test mode.')
  })
})
