// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const convexMocks = vi.hoisted(() => ({
  clients: [] as Array<{ url: string; options: unknown }>,
  provider: vi.fn(
    ({ children, client }: { children: React.ReactNode; client: unknown }) => (
      <div data-client={String(Boolean(client))} data-testid="convex-provider">
        {children}
      </div>
    ),
  ),
}))

vi.mock('convex/react', () => ({
  ConvexReactClient: class {
    constructor(url: string, options: unknown) {
      convexMocks.clients.push({ url, options })
    }
  },
  ConvexProvider: convexMocks.provider,
}))

import { ConvexAnonymousProvider } from './ConvexAnonymousProvider'

describe('ConvexAnonymousProvider', () => {
  afterEach(() => {
    cleanup()
    convexMocks.clients.length = 0
    convexMocks.provider.mockClear()
  })

  it('creates a Convex client with logging disabled and provides it to children', () => {
    render(
      <ConvexAnonymousProvider convexUrl="https://convex.example.test">
        <span>Anonymous workspace</span>
      </ConvexAnonymousProvider>,
    )

    expect(
      screen.getByTestId('convex-provider').getAttribute('data-client'),
    ).toBe('true')
    expect(screen.getByText('Anonymous workspace')).toBeTruthy()
    expect(convexMocks.clients).toEqual([
      {
        url: 'https://convex.example.test',
        options: { logger: false },
      },
    ])
  })

  it('reuses the same client when the Convex URL is unchanged across renders', () => {
    const { rerender } = render(
      <ConvexAnonymousProvider convexUrl="https://convex.example.test">
        <span>First child</span>
      </ConvexAnonymousProvider>,
    )

    rerender(
      <ConvexAnonymousProvider convexUrl="https://convex.example.test">
        <span>Second child</span>
      </ConvexAnonymousProvider>,
    )

    expect(screen.getByText('Second child')).toBeTruthy()
    expect(convexMocks.clients).toHaveLength(1)
  })

  it('creates a replacement client when the Convex URL changes', () => {
    const { rerender } = render(
      <ConvexAnonymousProvider convexUrl="https://first-convex.example.test">
        <span>Anonymous workspace</span>
      </ConvexAnonymousProvider>,
    )

    rerender(
      <ConvexAnonymousProvider convexUrl="https://second-convex.example.test">
        <span>Anonymous workspace</span>
      </ConvexAnonymousProvider>,
    )

    expect(convexMocks.clients.map((client) => client.url)).toEqual([
      'https://first-convex.example.test',
      'https://second-convex.example.test',
    ])
  })
})
