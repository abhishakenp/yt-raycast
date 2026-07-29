// @vitest-environment jsdom
//
// Behavioral edge-case coverage for the commerce/Medusa integration.
//
// Covers three layers in one file:
//   1. CommercePanel UI (jsdom + @testing-library/react, real component)
//   2. convex/lib/session_commerce_helpers (real functions, mocked ctx)
//   3. commerce product binding (real functions, pure data binding)
//
// PHILOSOPHY: Assert EXPECTED/CORRECT behavior. If the implementation is
// buggy, the test MUST fail — current behavior is never pinned.

import { createElement as h } from 'react'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CommercePanel } from './components/CommercePanel'
import {
  bindCommerceCatalog,
  bindCommerceProductSlot,
} from './services/commerce-product-binding'
import type {
  CommerceCatalogProduct,
  CommerceProductSlot,
  CommerceProductVariant,
} from './contracts'
import {
  loadSessionCommerceConfig,
  provisionSessionMedusaTenant,
  serializeCommerceConfig,
  syncSessionMedusaProducts,
  upsertSessionCommerceConfig,
} from '../../../convex/lib/session_commerce_helpers'
import type { Doc, Id } from '../../../convex/_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../../../convex/_generated/server'

/* -------------------------------------------------------------------------- */
/* Shared UI mocks                                                            */
/* -------------------------------------------------------------------------- */

type CommerceAccessValue =
  | undefined
  | { authState: 'signed-out' }
  | { authState: 'unpaid' }
  | {
      authState: 'paid'
      enabled: boolean
      instanceStatus: string | null
      storeStatus: string | null
      backendUrl?: string
      adminUrl?: string
      storefrontUrl?: string
      publishableKey?: string
      productCount?: number
    }

const accessState = vi.hoisted(() => ({
  current: undefined as CommerceAccessValue,
}))

const mutationState = vi.hoisted(() => ({
  enableCommerce: (async () => ({
    commerceInstanceId: 'instance_1',
    commerceStoreId: 'store_1',
    instanceCreated: true,
    storeCreated: true,
  })) as (args: unknown) => Promise<unknown>,
  requestAdminSso: (async () => ({
    url: 'https://admin.medusa.test/?ssoToken=token',
  })) as (args: unknown) => Promise<unknown>,
}))

vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => accessState.current),
  useMutation: vi.fn((ref: string) => {
    if (String(ref).includes('enableCommerce')) {
      return (args: unknown) => mutationState.enableCommerce(args)
    }
    return (args: unknown) => mutationState.requestAdminSso(args)
  }),
}))

vi.mock('../../../convex/_generated/api', () => ({
  api: {
    commerceInstances: {
      enableCommerce: 'commerceInstances.enableCommerce',
      getCommerceAccess: 'commerceInstances.getCommerceAccess',
      requestAdminSso: 'commerceInstances.requestAdminSso',
    },
    sessions: { getCommerceConfig: 'sessions.getCommerceConfig' },
  },
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => undefined,
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  requestClerkSignIn: vi.fn(),
}))

/* -------------------------------------------------------------------------- */
/* Shared convex helper mocks                                                 */
/* -------------------------------------------------------------------------- */

// assertCanMutateSession is an auth dependency, not the unit under test; stub it
// so commerce helper logic can be exercised without hashing owner secrets.
vi.mock('../../../convex/lib/session_access_helpers', () => ({
  assertCanMutateSession: vi.fn(async () => undefined),
  hashOwnerSecret: vi.fn(async (secret) => `hash:${secret}`),
}))

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

type CommerceConfigDoc = Doc<'commerceConfigs'>

const sessionId = 'session_edge' as Id<'sessions'>
const configId = 'commerce_config_edge' as Id<'commerceConfigs'>

function commerceDoc(
  overrides: Partial<CommerceConfigDoc> = {},
): CommerceConfigDoc {
  return {
    _id: configId,
    _creationTime: 1,
    sessionId,
    status: 'ready',
    backendUrl: 'https://backend.old.test',
    adminUrl: 'https://admin.old.test',
    storefrontUrl: 'https://store.old.test',
    productCount: 0,
    createdAt: 100,
    updatedAt: 100,
    ...overrides,
  } as CommerceConfigDoc
}

type CtxOptions = {
  session?: Doc<'sessions'> | null
  configs?: CommerceConfigDoc[]
}

function ctxFor(options: CtxOptions = {}) {
  const session =
    options.session === undefined
      ? ({ _id: sessionId, _creationTime: 1 } as Doc<'sessions'>)
      : options.session
  const configs = [...(options.configs ?? [])]
  const inserts: Array<Record<string, unknown>> = []
  const patches: Array<{
    id: Id<'commerceConfigs'>
    patch: Record<string, unknown>
  }> = []

  const ctx = {
    db: {
      get: async (id: Id<'sessions'> | Id<'commerceConfigs'>) => {
        if (id === sessionId) return session
        return configs.find((c) => c._id === id) ?? null
      },
      query: (table: string) => {
        expect(table).toBe('commerceConfigs')
        return {
          withIndex: (
            indexName: string,
            applyIndex: (q: {
              eq: (
                fieldName: string,
                fieldValue: string,
              ) => {
                field: string
                value: string
              }
            }) => { field: string; value: string },
          ) => {
            expect(indexName).toBe('by_sessionId')
            const { field, value } = applyIndex({
              eq: (fieldName, fieldValue) => ({
                field: fieldName,
                value: fieldValue,
              }),
            })
            expect(field).toBe('sessionId')
            return {
              first: async () =>
                configs.find((c) => c.sessionId === value) ?? null,
            }
          },
        }
      },
      insert: async (table: string, value: Record<string, unknown>) => {
        expect(table).toBe('commerceConfigs')
        const doc = {
          _id: `commerce_config_${configs.length + 1}` as Id<'commerceConfigs'>,
          _creationTime: 1,
          ...value,
        } as CommerceConfigDoc
        configs.push(doc)
        inserts.push(value)
        return doc._id
      },
      patch: async (
        id: Id<'commerceConfigs'>,
        patch: Record<string, unknown>,
      ) => {
        const index = configs.findIndex((c) => c._id === id)
        expect(index).toBeGreaterThanOrEqual(0)
        configs[index] = { ...configs[index], ...patch } as CommerceConfigDoc
        patches.push({ id, patch })
      },
    },
  } as unknown as MutationCtx & QueryCtx

  return { ctx, configs, inserts, patches }
}

/* -------------------------------------------------------------------------- */
/* 1-5. CommercePanel UI                                                      */
/* -------------------------------------------------------------------------- */

describe('CommercePanel edge cases (UI)', () => {
  beforeEach(() => {
    accessState.current = {
      authState: 'paid',
      enabled: false,
      instanceStatus: null,
      storeStatus: null,
    }
    mutationState.enableCommerce = async () => ({
      commerceInstanceId: 'instance_1',
      commerceStoreId: 'store_1',
      instanceCreated: true,
      storeCreated: true,
    })
    mutationState.requestAdminSso = async () => ({
      url: 'https://admin.medusa.test/?ssoToken=token',
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('1. when already provisioned and ready, "Enable Commerce" is gone and live status/handoff are shown', () => {
    accessState.current = {
      authState: 'paid',
      enabled: true,
      instanceStatus: 'ready',
      storeStatus: 'ready',
      adminUrl: 'https://admin.medusa.test',
      backendUrl: 'https://backend.medusa.test',
      productCount: 4,
      storefrontUrl: 'https://store.medusa.test',
    }

    render(h(CommercePanel, { sessionId: 'session_123' }))

    // Once ready, the panel must NOT show the initial "Enable Commerce"
    // button — state is reactive (Convex useQuery), so no manual
    // refresh/manage action is needed either.
    expect(screen.queryByRole('button', { name: /Enable Commerce/ })).toBeNull()
    expect(screen.getByText('Live ready')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Open admin' })).toBeTruthy()
  })

  it('2. enable failure shows the error message and leaves the button retryable', async () => {
    mutationState.enableCommerce = async () => {
      throw new Error('Medusa provisioning blew up')
    }

    render(h(CommercePanel, { sessionId: 'session_123' }))

    fireEvent.click(screen.getByRole('button', { name: /Enable Commerce/ }))

    // The error message must be surfaced to the user.
    expect(await screen.findByText('Medusa provisioning blew up')).toBeTruthy()

    // After failure, isEnabling flips back to false so the user can retry.
    await waitFor(() => {
      const retry = screen.getByRole('button', { name: /Enable Commerce/ })
      expect(retry).toBeTruthy()
      expect(retry).toHaveProperty('disabled', false)
    })
  })

  it('3. product count 0 renders a zero count (empty state)', () => {
    accessState.current = {
      authState: 'paid',
      enabled: true,
      instanceStatus: 'ready',
      storeStatus: 'ready',
      adminUrl: 'https://admin.medusa.test',
      backendUrl: 'https://backend.medusa.test',
      productCount: 0,
      storefrontUrl: 'https://store.medusa.test',
    }

    render(h(CommercePanel, { sessionId: 'session_123' }))

    expect(screen.getByText('Products')).toBeTruthy()
    // The count cell renders the literal 0 — an explicit empty state.
    const countCell = screen.getByText('0')
    expect(countCell).toBeTruthy()
  })

  it('4. storefront link and admin action are present, well-formed, and never expose a static admin URL', async () => {
    accessState.current = {
      authState: 'paid',
      enabled: true,
      instanceStatus: 'ready',
      storeStatus: 'ready',
      adminUrl: 'https://admin.medusa.test',
      backendUrl: 'https://backend.medusa.test',
      storefrontUrl: 'https://store.medusa.test',
    }
    const requestSpy = vi.fn(async () => ({
      url: 'https://admin.medusa.test/?ssoToken=one-time-token',
    }))
    mutationState.requestAdminSso = requestSpy
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(h(CommercePanel, { sessionId: 'session_123' }))

    const storefront = screen.getByRole('link', { name: 'Open storefront' })
    expect(storefront.getAttribute('href')).toBe('https://store.medusa.test')
    expect(storefront.getAttribute('href')).toMatch(/^https:\/\//)
    expect(storefront.getAttribute('target')).toBe('_blank')

    // Admin is a button that mints a fresh single-use SSO token per click —
    // never a static href pointing straight at the Medusa admin URL.
    const adminButton = screen.getByRole('button', { name: 'Open admin' })
    expect(adminButton.getAttribute('href')).toBeNull()
    fireEvent.click(adminButton)

    await waitFor(() => {
      expect(requestSpy).toHaveBeenCalledWith({ sessionId: 'session_123' })
    })
    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith(
        'https://admin.medusa.test/?ssoToken=one-time-token',
        '_blank',
        'noopener,noreferrer',
      )
    })
  })

  it('5. transform overlay appears during transformation and is removed after', async () => {
    let resolveEnable!: () => void
    mutationState.enableCommerce = () =>
      new Promise((resolve) => {
        resolveEnable = () =>
          resolve({
            commerceInstanceId: 'instance_1',
            commerceStoreId: 'store_1',
            instanceCreated: true,
            storeCreated: true,
          })
      })

    render(h(CommercePanel, { sessionId: 'session_123' }))

    fireEvent.click(screen.getByRole('button', { name: /Enable Commerce/ }))

    // Overlay is portaled to document.body while transforming.
    expect(
      await screen.findByTestId('ecommercify-transform', {}, { timeout: 3000 }),
    ).toBeTruthy()

    resolveEnable()

    // Once the enable promise resolves, isTransforming flips false and the
    // overlay is unmounted.
    await waitFor(
      () => {
        expect(screen.queryByTestId('ecommercify-transform')).toBeNull()
      },
      { timeout: 3000 },
    )
  })
})

/* -------------------------------------------------------------------------- */
/* 6-10. convex/lib/session_commerce_helpers                                  */
/* -------------------------------------------------------------------------- */

describe('session commerce helpers edge cases (real functions)', () => {
  it('6. upsertSessionCommerceConfig stores a new config with the correct fields', async () => {
    const { ctx, configs, inserts } = ctxFor()

    await expect(
      upsertSessionCommerceConfig(ctx, {
        sessionId,
        backendUrl: 'https://backend.medusa.test',
        adminUrl: 'https://admin.medusa.test',
        storefrontUrl: 'https://store.medusa.test',
        configJson: '{"provider":"medusa"}',
        productCount: 3,
      }),
    ).resolves.toEqual({ sessionId })

    expect(configs).toHaveLength(1)
    expect(inserts).toHaveLength(1)
    expect(inserts[0]).toMatchObject({
      sessionId,
      status: 'ready',
      backendUrl: 'https://backend.medusa.test',
      adminUrl: 'https://admin.medusa.test',
      storefrontUrl: 'https://store.medusa.test',
      configJson: '{"provider":"medusa"}',
      productCount: 3,
    })
    expect(inserts[0]).toHaveProperty('createdAt')
    expect(inserts[0]).toHaveProperty('updatedAt')
  })

  it('7. loadSessionCommerceConfig returns the serialized config, or null when not provisioned', async () => {
    const { ctx: emptyCtx } = ctxFor()
    await expect(
      loadSessionCommerceConfig(emptyCtx, sessionId),
    ).resolves.toBeNull()

    const { ctx } = ctxFor({
      configs: [
        commerceDoc({
          productCount: 5,
          configJson: '{"ready":true}',
        }),
      ],
    })

    await expect(loadSessionCommerceConfig(ctx, sessionId)).resolves.toEqual({
      configId,
      status: 'ready',
      backendUrl: 'https://backend.old.test',
      adminUrl: 'https://admin.old.test',
      storefrontUrl: 'https://store.old.test',
      productCount: 5,
      configJson: '{"ready":true}',
      errorMessage: undefined,
      createdAt: 100,
      updatedAt: 100,
    })
  })

  it('8. provisionSessionMedusaTenant creates a tenant config bound to the session id', async () => {
    const { ctx, configs, inserts } = ctxFor()

    await expect(
      provisionSessionMedusaTenant(ctx, {
        sessionId,
        backendUrl: 'https://backend.medusa.test',
        adminUrl: 'https://admin.medusa.test',
        storefrontUrl: 'https://store.medusa.test',
      }),
    ).resolves.toEqual({ success: true })

    expect(configs).toHaveLength(1)
    expect(inserts[0]).toMatchObject({
      sessionId,
      status: 'ready',
      productCount: 0,
      backendUrl: 'https://backend.medusa.test',
      adminUrl: 'https://admin.medusa.test',
      storefrontUrl: 'https://store.medusa.test',
    })
  })

  it('9. syncSessionMedusaProducts stores the fetched product count on the session config', async () => {
    const { ctx, configs, patches } = ctxFor({ configs: [commerceDoc()] })

    const products = [
      { id: 'prod_1', title: 'First', handle: 'first', price: 12 },
      {
        id: 'prod_2',
        title: 'Second',
        handle: 'second',
        price: 24,
        description: 'Second',
      },
      { id: 'prod_3', title: 'Third', handle: 'third', price: 8 },
    ]

    await expect(
      syncSessionMedusaProducts(ctx, { sessionId, products }),
    ).resolves.toEqual({ synced: 3 })

    expect(configs[0]?.productCount).toBe(3)
    expect(patches).toHaveLength(1)
    expect(patches[0]?.patch).toMatchObject({ productCount: 3 })
  })

  it('10. serializeCommerceConfig produces a JSON-shaped payload with every field', () => {
    const doc = commerceDoc({
      productCount: 9,
      configJson: '{"provider":"medusa","ready":true}',
      errorMessage: 'partial outage',
    })

    const serialized = serializeCommerceConfig(doc)

    expect(serialized).toEqual({
      configId,
      status: 'ready',
      backendUrl: 'https://backend.old.test',
      adminUrl: 'https://admin.old.test',
      storefrontUrl: 'https://store.old.test',
      productCount: 9,
      configJson: '{"provider":"medusa","ready":true}',
      errorMessage: 'partial outage',
      createdAt: 100,
      updatedAt: 100,
    })

    // Round-trips through JSON.stringify with the same shape.
    const json = JSON.parse(JSON.stringify(serialized)) as typeof serialized
    expect(json).toEqual(serialized)
  })
})

/* -------------------------------------------------------------------------- */
/* 11-18. commerce product binding                                            */
/* -------------------------------------------------------------------------- */

function makeVariant(
  sourceId: string,
  price: number,
  currencyCode = 'usd',
  overrides: Partial<CommerceProductVariant> = {},
): CommerceProductVariant {
  return {
    available: true,
    id: `variant_${sourceId}`,
    manageInventory: false,
    optionValues: {},
    prices: [{ amount: price, currencyCode }],
    sourceId: `variant:${sourceId}`,
    title: 'Default',
    ...overrides,
  }
}

function makeProduct(
  sourceId: string,
  handle: string,
  title: string,
  price = 0,
  currencyCode = 'usd',
  overrides: Partial<CommerceCatalogProduct> = {},
): CommerceCatalogProduct {
  return {
    collections: [],
    handle,
    images: [],
    options: [],
    sourceId,
    tags: [],
    title,
    variants: [makeVariant(sourceId, price, currencyCode)],
    ...overrides,
  }
}

function makeSlot(
  sourceId: string,
  handle: string,
  title: string,
  price = 0,
  currencyCode = 'usd',
): CommerceProductSlot {
  return {
    fallback: makeProduct(sourceId, handle, title, price, currencyCode),
    handle,
    sourceId,
  }
}

describe('commerce product binding edge cases (real functions)', () => {
  it('11. product handle matches → slot binds to the live product title', () => {
    const slot = makeSlot('product:tee', 'tee', 'Generated Tee', 12)
    const liveProduct = makeProduct(
      'medusa_tee',
      'tee',
      'Medusa Awesome Tee',
      12,
      'usd',
      { sourceHandle: 'tee' },
    )

    const bound = bindCommerceProductSlot(slot, [liveProduct], 'ready')

    expect(bound.product.title).toBe('Medusa Awesome Tee')
    expect(bound.availability).toBe('live')
    // The generated fallback title is no longer surfaced once a live match is bound.
    expect(bound.product.title).not.toBe('Generated Tee')
  })

  it('12. product not found (no matching handle) → slot is unavailable with fallback', () => {
    const slot = makeSlot('product:tee', 'tee', 'Generated Tee', 12)
    const liveProduct = makeProduct('medusa_other', 'other', 'Other', 5, 'usd')

    const bound = bindCommerceProductSlot(slot, [liveProduct], 'ready')

    expect(bound.availability).toBe('unavailable')
    expect(bound.product.title).toBe('Generated Tee')
    expect(bound.purchasable).toBe(false)
  })

  it('13. currency handling: EUR product prices preserve their currency code through binding', () => {
    // The bound product must carry the live product's EUR currency code
    // through binding so downstream rendering can format it locale-appropriately
    // (e.g. de-DE "15,00 €"). If the currency code is lost or overwritten with
    // USD, that is a BUG and this test MUST fail.
    const slot = makeSlot('product:mug', 'mug', 'Mug', 15, 'eur')
    const liveProduct = makeProduct('medusa_mug', 'mug', 'Mug', 15, 'eur', {
      sourceHandle: 'mug',
    })

    const bound = bindCommerceProductSlot(slot, [liveProduct], 'ready')

    expect(bound.product.variants[0]?.prices[0]?.currencyCode).toBe('eur')
    expect(bound.product.variants[0]?.prices[0]?.amount).toBe(15)
  })

  it('14. price data: bound product carries the live price amount and currency', () => {
    // Regardless of the fallback/slot price, the bound product must reflect the
    // live product's actual price. If the fallback price leaks through, that is
    // a BUG and this test MUST fail.
    const slot = makeSlot('product:tee', 'tee', 'Tee', 12, 'usd')
    const liveProduct = makeProduct('medusa_tee', 'tee', 'Tee', 12.99, 'usd', {
      sourceHandle: 'tee',
    })

    const bound = bindCommerceProductSlot(slot, [liveProduct], 'ready')

    expect(bound.product.variants[0]?.prices[0]?.amount).toBe(12.99)
    expect(bound.product.variants[0]?.prices[0]?.currencyCode).toBe('usd')
  })

  it('15. multiple products: all matching slots are bound in a single call', () => {
    const slots = [
      makeSlot('product:alpha', 'alpha', 'Alpha', 10),
      makeSlot('product:beta', 'beta', 'Beta', 20),
      makeSlot('product:gamma', 'gamma', 'Gamma', 30),
    ]
    const liveProducts = [
      makeProduct('medusa_alpha', 'alpha', 'Medusa Alpha', 10.5, 'usd', {
        sourceHandle: 'alpha',
      }),
      makeProduct('medusa_gamma', 'gamma', 'Medusa Gamma', 30.5, 'usd', {
        sourceHandle: 'gamma',
      }),
    ]

    const bound = bindCommerceCatalog(slots, liveProducts, 'ready')

    // Alpha and Gamma bound to live products; Beta has no match so it's dropped.
    expect(bound.map((b) => b.product.title)).toEqual([
      'Medusa Alpha',
      'Medusa Gamma',
    ])
    expect(bound.map((b) => b.availability)).toEqual(['live', 'live'])
    expect(bound.map((b) => b.product.variants[0]?.prices[0]?.amount)).toEqual([
      10.5, 30.5,
    ])
  })

  it('16. idempotency: calling bindCommerceCatalog twice yields the same result', () => {
    // Binding is a pure function — calling it twice with the same inputs must
    // produce identical output. If state leaks between calls (e.g. consumed
    // products set mutated in place), that is a BUG and this test MUST fail.
    const slots = [makeSlot('product:tee', 'tee', 'Tee', 12)]
    const liveProducts = [
      makeProduct('medusa_tee', 'tee', 'Medusa Tee', 12.99, 'usd', {
        sourceHandle: 'tee',
      }),
    ]

    const first = bindCommerceCatalog(slots, liveProducts, 'ready')
    const second = bindCommerceCatalog(slots, liveProducts, 'ready')

    expect(second).toEqual(first)
    expect(first[0]?.product.title).toBe('Medusa Tee')
  })

  it('17. empty live product list → no slots are bound', () => {
    const slots = [makeSlot('product:tee', 'tee', 'Tee', 12)]

    const bound = bindCommerceCatalog(slots, [], 'ready')

    expect(bound).toEqual([])
  })

  it('18. slot independence: binding one slot does not affect another slot', () => {
    // Two slots share the same catalog; binding Alpha must not consume or
    // alter Beta's product. Beta has no live match and is dropped, while
    // Alpha binds correctly to its live product.
    const slots = [
      makeSlot('product:alpha', 'alpha', 'Alpha', 10),
      makeSlot('product:beta', 'beta', 'Beta', 20),
    ]
    const liveProducts = [
      makeProduct('medusa_alpha', 'alpha', 'Medusa Alpha', 10.5, 'usd', {
        sourceHandle: 'alpha',
      }),
    ]

    const bound = bindCommerceCatalog(slots, liveProducts, 'ready')

    // Only Alpha is bound; Beta is untouched (no live match → dropped).
    expect(bound).toHaveLength(1)
    expect(bound[0]?.product.title).toBe('Medusa Alpha')
    expect(bound[0]?.product.variants[0]?.prices[0]?.amount).toBe(10.5)
  })
})
