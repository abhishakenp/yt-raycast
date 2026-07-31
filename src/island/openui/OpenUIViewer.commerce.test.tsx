// @vitest-environment jsdom
import { act, cleanup, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  adapterOptions: [] as Array<Record<string, unknown>>,
  aiCapsules: [] as Array<unknown>,
  auth: {
    getToken: vi.fn<() => Promise<string | null>>(),
    isLoaded: true,
    isSignedIn: false,
  },
  commerceProps: [] as Array<Record<string, unknown>>,
  generatedProducts: [
    {
      collections: [],
      handle: 'classic-shirt',
      images: [],
      options: [],
      price: 25,
      sourceId: 'product:classic-shirt',
      tags: [],
      title: 'Classic Shirt',
      variants: [
        {
          manageInventory: false,
          optionValues: {},
          prices: [{ amount: 25, currencyCode: 'usd' }],
          sourceId: 'variant:classic-shirt:default',
          title: 'Default',
        },
      ],
    },
  ],
}))

vi.mock('@ship-fast/blocks/runtime', () => ({
  BrandLogoProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  CommerceProvider: ({
    children,
    ...props
  }: {
    children: ReactNode
    [key: string]: unknown
  }) => {
    state.commerceProps.push(props)
    return <>{children}</>
  },
  DesignSystemProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  DEFAULT_DESIGN: {},
  ImageContextProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  OpenUIIntegrationProviders: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  QueryClient: class QueryClient {
    constructor() {}
  },
  QueryClientProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  Renderer: () => <div>Rendered store</div>,
  getOpenUIRuntimeLibraryCacheKey: (response: string) => response,
  loadOpenUIRuntimeLibrary: async () => ({}),
}))

vi.mock('@/features/commerce/services/hosted-commerce-adapter', () => ({
  HostedCommerceAdapter: class HostedCommerceAdapter {
    constructor(options: Record<string, unknown>) {
      state.adapterOptions.push(options)
    }
  },
}))

vi.mock('@/features/commerce/services/generated-commerce-products', () => ({
  extractGeneratedCommerceProducts: () => state.generatedProducts,
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useOptionalAuth: () => state.auth,
}))

vi.mock('convex/react', () => ({
  useQuery: () => state.aiCapsules,
}))

vi.mock('../../../convex/_generated/api', () => ({
  api: { sessions: { listAiCapsules: 'listAiCapsules' } },
}))

vi.mock('./_providers/translation', () => ({
  I18nProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  T: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

import OpenUIViewer from './OpenUIViewer'

describe('OpenUIViewer commerce runtime', () => {
  beforeEach(() => {
    state.adapterOptions.length = 0
    state.commerceProps.length = 0
    state.auth.getToken.mockReset()
    state.auth.getToken.mockResolvedValue(null)
    state.auth.isSignedIn = false
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ products: [] }), { status: 200 }),
        ),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('wires a hosted tenant adapter and stable generated fallback products', async () => {
    render(
      <OpenUIViewer
        commerce={{
          anonymousOwnerSecret: 'owner-secret',
          mode: 'hosted',
          scope: 'sessions',
          tenant: 'session-a',
        }}
        response="root = StorePage()"
        sessionId="session-a"
      />,
    )

    await act(async () => {
      await Promise.resolve()
    })
    expect(state.commerceProps.length).toBeGreaterThan(0)
    expect(state.adapterOptions).toEqual([
      {
        anonymousOwnerSecret: 'owner-secret',
        scope: 'sessions',
        tenant: 'session-a',
      },
    ])
    expect(state.commerceProps.at(-1)).toMatchObject({
      fallbackProducts: state.generatedProducts,
      mode: 'hosted',
      scope: 'sessions',
      tenant: 'session-a',
    })
  })

  it('keeps commerce disabled without constructing a hosted adapter', async () => {
    render(
      <OpenUIViewer
        commerce={{
          mode: 'disabled',
          scope: 'sessions',
          tenant: 'session-a',
        }}
        response="root = StorePage()"
        sessionId="session-a"
      />,
    )

    await act(async () => {
      await Promise.resolve()
    })
    expect(state.commerceProps.length).toBeGreaterThan(0)
    expect(state.adapterOptions).toEqual([])
    expect(state.commerceProps.at(-1)).toMatchObject({
      mode: 'disabled',
      scope: 'sessions',
      tenant: 'session-a',
    })
  })

  it('uses the current signed-in token without exposing it through commerce props', async () => {
    state.auth.isSignedIn = true
    state.auth.getToken.mockResolvedValue('signed-in-token')

    render(
      <OpenUIViewer
        commerce={{
          mode: 'hosted',
          scope: 'sessions',
          tenant: 'session-a',
        }}
        response="root = StorePage()"
        sessionId="session-a"
      />,
    )

    await waitFor(() =>
      expect(state.adapterOptions).toEqual([
        {
          bearerToken: 'signed-in-token',
          scope: 'sessions',
          tenant: 'session-a',
        },
      ]),
    )
    expect(state.auth.getToken).toHaveBeenCalledWith({ template: 'convex' })
    expect(state.commerceProps.at(-1)).not.toHaveProperty('bearerToken')
  })
})
