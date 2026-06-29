// @vitest-environment jsdom
//
// Behavioral edge-case coverage for the commerce/Medusa integration.
//
// Covers three layers in one file:
//   1. CommercePanel UI (jsdom + @testing-library/react, real component)
//   2. convex/lib/session_commerce_helpers (real functions, mocked ctx)
//   3. src/island/openui/medusa-preview-sync (real functions, real DOM)
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
import { applyMedusaProductsToPreviewDom } from '@/island/openui/medusa-preview-sync'
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

const commerceConfig = vi.hoisted(() => ({
  current: undefined as
    | {
        adminUrl?: string
        backendUrl?: string
        configJson?: string
        errorMessage?: string
        productCount?: number
        status?: string
        storefrontUrl?: string
      }
    | undefined,
}))

const fetchState = vi.hoisted(() => ({
  impl: null as null | (() => Promise<Response>),
}))

vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => commerceConfig.current),
  useMutation: vi.fn(() => vi.fn()),
}))

vi.mock('../../../convex/_generated/api', () => ({
  api: {
    sessions: { getCommerceConfig: 'sessions.getCommerceConfig' },
  },
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => undefined,
}))

/* -------------------------------------------------------------------------- */
/* Shared convex helper mocks                                                 */
/* -------------------------------------------------------------------------- */

// assertCanMutateSession is an auth dependency, not the unit under test; stub it
// so commerce helper logic can be exercised without hashing owner secrets.
vi.mock('../../../convex/lib/session_access_helpers', () => ({
  assertCanMutateSession: vi.fn(async () => undefined),
  hashOwnerSecret: vi.fn(async (secret: string) => `hash:${secret}`),
}))

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const okResponse = (body: unknown): Response =>
  ({
    ok: true,
    json: async () => body,
  }) as Response

const errorResponse = (body: unknown): Response =>
  ({
    ok: false,
    json: async () => body,
  }) as Response

type CommerceConfigDoc = Doc<'commerceConfigs'>

const sessionId = 'session_edge' as Id<'sessions'>
const configId = 'commerce_config_edge' as Id<'commerceConfigs'>

const commerceDoc = (
  overrides: Partial<CommerceConfigDoc> = {},
): CommerceConfigDoc =>
  ({
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
  }) as CommerceConfigDoc

type CtxOptions = {
  session?: Doc<'sessions'> | null
  configs?: CommerceConfigDoc[]
}

const ctxFor = (options: CtxOptions = {}) => {
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
      get: async (id: string) => {
        if (id === sessionId) return session
        return configs.find((c) => c._id === id) ?? null
      },
      query: (table: string) => {
        expect(table).toBe('commerceConfigs')
        return {
          withIndex: (
            indexName: string,
            applyIndex: (index: {
              eq: (
                field: string,
                value: unknown,
              ) => { field: string; value: unknown }
            }) => { field: string; value: unknown },
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
    commerceConfig.current = undefined
    fetchState.impl = () =>
      Promise.resolve(
        okResponse({
          handoff: {
            adminEmail: 'admin@store.test',
            adminPassword: 'secret-password',
            adminUrl: 'https://admin.medusa.test',
            backendUrl: 'https://backend.medusa.test',
            storefrontUrl: 'https://store.medusa.test',
            tenantId: 'session_123',
          },
        }),
      )
    vi.stubGlobal(
      'fetch',
      vi.fn((...args: unknown[]) => {
        void args
        return fetchState.impl?.()
      }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('1. when already provisioned, shows a manage/refresh action (not "Provision")', () => {
    commerceConfig.current = {
      adminUrl: 'https://admin.medusa.test',
      backendUrl: 'https://backend.medusa.test',
      productCount: 4,
      status: 'ready',
      storefrontUrl: 'https://store.medusa.test',
    }

    render(h(CommercePanel, { sessionId: 'session_123' }))

    // Once provisioned, the panel must NOT show the initial "Enable Commerce"
    // provision button. It should show a manage/refresh equivalent instead.
    expect(screen.queryByRole('button', { name: /Enable Commerce/ })).toBeNull()
    // A manage/refresh action must be present so the user can re-sync.
    const manageButton = screen.getByRole('button', {
      name: /Refresh Commerce|Manage/,
    })
    expect(manageButton).toBeTruthy()
    expect(screen.getByText('Live ready')).toBeTruthy()
  })

  it('2. provision failure shows the error message and leaves the button retryable', async () => {
    commerceConfig.current = { status: 'pending', productCount: 0 }
    fetchState.impl = () =>
      Promise.resolve(errorResponse({ error: 'Medusa provisioning blew up' }))

    render(h(CommercePanel, { sessionId: 'session_123' }))

    fireEvent.click(screen.getByRole('button', { name: /Enable Commerce/ }))

    // The error message must be surfaced to the user.
    expect(await screen.findByText('Medusa provisioning blew up')).toBeTruthy()

    // After failure, isSaving flips back to false so the user can retry.
    await waitFor(() => {
      const retry = screen.getByRole('button', { name: /Enable Commerce/ })
      expect(retry).toBeTruthy()
      expect(retry).toHaveProperty('disabled', false)
    })
  })

  it('3. product count 0 renders a zero count (empty state)', () => {
    commerceConfig.current = {
      adminUrl: 'https://admin.medusa.test',
      backendUrl: 'https://backend.medusa.test',
      productCount: 0,
      status: 'ready',
      storefrontUrl: 'https://store.medusa.test',
    }

    render(h(CommercePanel, { sessionId: 'session_123' }))

    expect(screen.getByText('Products')).toBeTruthy()
    // The count cell renders the literal 0 — an explicit empty state.
    const countCell = screen.getByText('0')
    expect(countCell).toBeTruthy()
  })

  it('4. handoff admin and storefront URLs are present, well-formed, and open in a new tab', async () => {
    commerceConfig.current = { status: 'pending', productCount: 0 }

    render(h(CommercePanel, { sessionId: 'session_123' }))

    fireEvent.click(screen.getByRole('button', { name: /Enable Commerce/ }))

    expect(await screen.findByText('Medusa handoff')).toBeTruthy()

    const storefront = screen.getByRole('link', { name: 'Open storefront' })
    const admin = screen.getByRole('link', { name: 'Open admin' })

    // URLs are present and are absolute https URLs (correct format).
    expect(storefront.getAttribute('href')).toBe('https://store.medusa.test')
    expect(admin.getAttribute('href')).toBe('https://admin.medusa.test')
    expect(storefront.getAttribute('href')).toMatch(/^https:\/\//)
    expect(admin.getAttribute('href')).toMatch(/^https:\/\//)
    // Both open in a new tab for security.
    expect(storefront.getAttribute('target')).toBe('_blank')
    expect(admin.getAttribute('target')).toBe('_blank')
  })

  it('5. transform overlay appears during transformation and is removed after', async () => {
    commerceConfig.current = { status: 'pending', productCount: 0 }
    let resolveFetch!: () => void
    fetchState.impl = () =>
      new Promise<Response>((resolve) => {
        resolveFetch = () => resolve(okResponse({ handoff: undefined })) as void
      })

    render(h(CommercePanel, { sessionId: 'session_123' }))

    fireEvent.click(screen.getByRole('button', { name: /Enable Commerce/ }))

    // Overlay is portaled to document.body while transforming.
    expect(
      await screen.findByTestId('ecommercify-transform', {}, { timeout: 3000 }),
    ).toBeTruthy()

    resolveFetch()

    // Once the provision promise resolves, isTransforming flips false and the
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
/* 11-18. medusa-preview-sync                                                 */
/* -------------------------------------------------------------------------- */

const makeProductDom = (html: string): HTMLElement => {
  const container = document.createElement('div')
  container.innerHTML = html
  return container
}

describe('medusa-preview-sync edge cases (real DOM)', () => {
  it('11. product handle matches → generated title is replaced in the DOM', () => {
    const root = makeProductDom(
      '<article><h2>Generated Tee</h2><span>$12.00</span></article>',
    )

    applyMedusaProductsToPreviewDom(root, {
      generatedProducts: [{ handle: 'tee', title: 'Generated Tee', price: 12 }],
      medusaProducts: [
        {
          sourceHandle: 'tee',
          handle: 'tee',
          title: 'Medusa Awesome Tee',
          price: 12,
          currencyCode: 'USD',
        },
      ],
    })

    expect(root.querySelector('h2')?.textContent).toBe('Medusa Awesome Tee')
    expect(root.textContent).not.toContain('Generated Tee')
  })

  it('12. product not found (no matching sourceHandle) → DOM is untouched', () => {
    const root = makeProductDom(
      '<article><h2>Generated Tee</h2><span>$12.00</span></article>',
    )
    const before = root.innerHTML

    applyMedusaProductsToPreviewDom(root, {
      generatedProducts: [{ handle: 'tee', title: 'Generated Tee', price: 12 }],
      medusaProducts: [
        {
          sourceHandle: 'nonexistent',
          handle: 'other',
          title: 'Other',
          price: 5,
          currencyCode: 'USD',
        },
      ],
    })

    expect(root.innerHTML).toBe(before)
  })

  it('13. price formatting: EUR prices SHOULD be locale-aware "15,00 €" (not en-US "€15.00")', () => {
    // EUR prices should be formatted using a locale-appropriate format where
    // the currency symbol follows the amount with a comma decimal separator
    // (e.g. de-DE "15,00 €"). If the code hardcodes en-US and produces
    // "€15.00", that is a BUG and this test MUST fail.
    const eurRoot = makeProductDom(
      '<article><h2>Mug</h2><span>€15.00</span></article>',
    )
    applyMedusaProductsToPreviewDom(eurRoot, {
      generatedProducts: [{ handle: 'mug', title: 'Mug', price: 15 }],
      medusaProducts: [
        {
          sourceHandle: 'mug',
          handle: 'mug',
          title: 'Mug',
          price: 15,
          currencyCode: 'EUR',
        },
      ],
    })

    expect(eurRoot.querySelector('span')?.textContent).toBe('15,00 €')
  })

  it('14. price candidates "$12", "$12.00", and "12 USD" → ALL should be matched', () => {
    // All three price string formats for price 12 should be recognized as
    // candidates and rewritten to the Medusa-formatted price. If "12 USD" is
    // not matched (because priceCandidates only emits $/€-prefixed forms),
    // that is a BUG and this test MUST fail.
    const root = makeProductDom(
      '<article>' +
        '<h2>Tee</h2>' +
        '<span class="a">$12</span>' +
        '<span class="b">$12.00</span>' +
        '<span class="c">12 USD</span>' +
        '</article>',
    )

    applyMedusaProductsToPreviewDom(root, {
      generatedProducts: [{ handle: 'tee', title: 'Tee', price: 12 }],
      medusaProducts: [
        {
          sourceHandle: 'tee',
          handle: 'tee',
          title: 'Tee',
          price: 12.99,
          currencyCode: 'USD',
        },
      ],
    })

    expect(root.querySelector('.a')?.textContent).toBe('$12.99')
    expect(root.querySelector('.b')?.textContent).toBe('$12.99')
    expect(root.querySelector('.c')?.textContent).toBe('$12.99')
  })

  it('15. multiple products: all matching products are synced in a single pass', () => {
    const root = makeProductDom(
      '<article><h2>Alpha</h2><span>$10.00</span></article>' +
        '<article><h2>Beta</h2><span>$20.00</span></article>' +
        '<article><h2>Gamma</h2><span>$30.00</span></article>',
    )

    applyMedusaProductsToPreviewDom(root, {
      generatedProducts: [
        { handle: 'alpha', title: 'Alpha', price: 10 },
        { handle: 'beta', title: 'Beta', price: 20 },
        { handle: 'gamma', title: 'Gamma', price: 30 },
      ],
      medusaProducts: [
        {
          sourceHandle: 'alpha',
          handle: 'alpha',
          title: 'Medusa Alpha',
          price: 10.5,
          currencyCode: 'USD',
        },
        {
          sourceHandle: 'gamma',
          handle: 'gamma',
          title: 'Medusa Gamma',
          price: 30.5,
          currencyCode: 'USD',
        },
      ],
    })

    const headings = Array.from(root.querySelectorAll('h2')).map(
      (el) => el.textContent,
    )
    expect(headings).toEqual(['Medusa Alpha', 'Beta', 'Medusa Gamma'])
    expect(root.querySelectorAll('span')[0]?.textContent).toBe('$10.50')
    expect(root.querySelectorAll('span')[1]?.textContent).toBe('$20.00')
    expect(root.querySelectorAll('span')[2]?.textContent).toBe('$30.50')
  })

  it('16. idempotency: running sync twice yields the same DOM (no double replacement)', () => {
    // The Medusa title contains the generated title as a substring. After the
    // first pass "Tee" → "Medusa Tee". On the second pass the code must NOT
    // re-find "Tee" inside "Medusa Tee" and produce "Medusa Medusa Tee".
    // If substring matching causes double replacement, that is a BUG and this
    // test MUST fail.
    const root = makeProductDom(
      '<article><h2>Tee</h2><span>$12.00</span></article>',
    )

    const input = {
      generatedProducts: [{ handle: 'tee', title: 'Tee', price: 12 }],
      medusaProducts: [
        {
          sourceHandle: 'tee',
          handle: 'tee',
          title: 'Medusa Tee',
          price: 12.99,
          currencyCode: 'USD',
        },
      ],
    }

    applyMedusaProductsToPreviewDom(root, input)
    const afterFirst = root.innerHTML

    applyMedusaProductsToPreviewDom(root, input)
    const afterSecond = root.innerHTML

    expect(afterSecond).toBe(afterFirst)
    expect(root.querySelector('h2')?.textContent).toBe('Medusa Tee')
    expect(root.textContent).not.toContain('Medusa Medusa Tee')
  })

  it('17. empty product list → no DOM changes', () => {
    const root = makeProductDom(
      '<article><h2>Tee</h2><span>$12.00</span></article>',
    )
    const before = root.innerHTML

    applyMedusaProductsToPreviewDom(root, {
      generatedProducts: [{ handle: 'tee', title: 'Tee', price: 12 }],
      medusaProducts: [],
    })

    expect(root.innerHTML).toBe(before)
  })

  it('18. product scope finding: narrows to the correct container, leaving siblings untouched', () => {
    // Two product cards share the same root; the scope finder must locate the
    // specific card whose text contains the generated title and only mutate it.
    const root = makeProductDom(
      '<section>' +
        '<article class="card-a"><h2>Alpha</h2><span>$10.00</span></article>' +
        '<article class="card-b"><h2>Beta</h2><span>$20.00</span></article>' +
        '</section>',
    )

    applyMedusaProductsToPreviewDom(root, {
      generatedProducts: [
        { handle: 'alpha', title: 'Alpha', price: 10 },
        { handle: 'beta', title: 'Beta', price: 20 },
      ],
      medusaProducts: [
        {
          sourceHandle: 'alpha',
          handle: 'alpha',
          title: 'Medusa Alpha',
          price: 10.5,
          currencyCode: 'USD',
        },
      ],
    })

    const cardA = root.querySelector('.card-a')
    const cardB = root.querySelector('.card-b')

    expect(cardA?.querySelector('h2')?.textContent).toBe('Medusa Alpha')
    expect(cardA?.querySelector('span')?.textContent).toBe('$10.50')
    // Beta card is untouched: its title and price remain as generated.
    expect(cardB?.querySelector('h2')?.textContent).toBe('Beta')
    expect(cardB?.querySelector('span')?.textContent).toBe('$20.00')
  })
})
