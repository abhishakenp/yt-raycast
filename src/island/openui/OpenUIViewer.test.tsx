// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const runtimeMock = vi.hoisted(() => ({
  loadOpenUIRuntimeLibrary: vi.fn(() => new Promise(() => {})),
}))

vi.mock('@ship-fast/blocks/runtime', () => ({
  BrandLogoProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  CommerceProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
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
})
