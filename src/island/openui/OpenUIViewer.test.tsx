// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@ship-fast/blocks/runtime', () => ({
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
  Renderer: () => <div>Rendered OpenUI</div>,
  getOpenUIRuntimeLibraryCacheKey: () => 'runtime-key',
  loadOpenUIRuntimeLibrary: vi.fn(() => new Promise(() => {})),
}))

import OpenUIViewer from './OpenUIViewer'

describe('OpenUIViewer', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows a visible fallback while a ready OpenUI runtime is loading', () => {
    render(<OpenUIViewer response='root = Text("Cocoa Luxe")' />)

    expect(screen.getByText('Loading preview…')).toBeTruthy()
  })
})
