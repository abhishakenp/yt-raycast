import type { CommerceScope } from './commerce-contracts'

const root = (scope: CommerceScope, tenant: string) =>
  ['commerce', scope, tenant] as const

export const commerceQueryKeys = {
  cart: (scope: CommerceScope, tenant: string, cartId: string) =>
    [...root(scope, tenant), 'cart', cartId] as const,
  catalog: (scope: CommerceScope, tenant: string, regionId?: string) =>
    [...root(scope, tenant), 'catalog', regionId ?? 'default'] as const,
  checkout: (scope: CommerceScope, tenant: string, cartId: string) =>
    [...root(scope, tenant), 'checkout', cartId] as const,
}
