import { describe, expect, it } from 'vitest'

import { commerceQueryKeys } from './commerce-query-keys'

describe('commerce query keys', () => {
  it('namespaces catalogs by tenant and selected region', () => {
    expect(
      commerceQueryKeys.catalog('sessions', 'session-a', 'region-us'),
    ).toEqual(['commerce', 'sessions', 'session-a', 'catalog', 'region-us'])
    expect(
      commerceQueryKeys.catalog('sessions', 'session-b', 'region-us'),
    ).not.toEqual(
      commerceQueryKeys.catalog('sessions', 'session-a', 'region-us'),
    )
  })

  it('namespaces carts by tenant and cart ID', () => {
    expect(commerceQueryKeys.cart('deployments', 'shop', 'cart_123')).toEqual([
      'commerce',
      'deployments',
      'shop',
      'cart',
      'cart_123',
    ])
  })
})
