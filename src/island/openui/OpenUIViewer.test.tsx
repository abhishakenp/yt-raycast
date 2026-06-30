// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const runtimeMock = vi.hoisted(() => ({
  loadOpenUIRuntimeLibrary: vi.fn(() => new Promise(() => {})),
}))

vi.mock('@ship-fast/blocks/runtime', () => ({
  BrandLogoProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
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
  Renderer: () => (
    <article>
      <h3>Truffle Box</h3>
      <strong>$79</strong>
    </article>
  ),
  getOpenUIRuntimeLibraryCacheKey: () => 'runtime-key',
  loadOpenUIRuntimeLibrary: runtimeMock.loadOpenUIRuntimeLibrary,
}))

vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => undefined),
}))

import OpenUIViewer from './OpenUIViewer'

describe('OpenUIViewer', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    runtimeMock.loadOpenUIRuntimeLibrary.mockImplementation(
      () => new Promise(() => {}),
    )
  })

  it('shows a skeleton fallback while a ready OpenUI runtime is loading', () => {
    render(<OpenUIViewer response='root = Text("Cocoa Luxe")' />)

    expect(screen.getByRole('status', { name: 'Preview loading' })).toBeTruthy()
    expect(screen.queryByText(/Loading preview/i)).toBeNull()
  })

  it('overlays session-scoped Medusa product edits onto the rendered preview', async () => {
    runtimeMock.loadOpenUIRuntimeLibrary.mockResolvedValue({} as never)
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          products: [
            {
              currencyCode: 'eur',
              handle: 'ship-fast-session-truffle-box',
              price: 89,
              sourceHandle: 'truffle-box',
              title: 'Medusa Edited Truffle Box',
            },
          ],
        }),
        { status: 200 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(
      <OpenUIViewer
        response='root = StorePage({ products: { items: [{ name: "Truffle Box", price: "$79" }] } })'
        sessionId="session_123"
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Medusa Edited Truffle Box')).toBeTruthy()
      expect(screen.getByText('89,00 €')).toBeTruthy()
    })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/sessions/session_123/medusa-products',
      { headers: { Accept: 'application/json' } },
    )
  })
})
