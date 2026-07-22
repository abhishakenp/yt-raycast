// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('#/lib/route-context.tsx', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('#/lib/route-context.tsx')>()
  return {
    ...actual,
  }
})

const mutation = Object.assign(
  vi.fn(async () => []),
  {
    isPending: false,
    lastError: null,
    pendingCount: 0,
    reset: vi.fn(),
  },
)

const keyedMutation = Object.assign(
  vi.fn(async () => []),
  {
    hasPending: false,
    isPending: vi.fn(() => false),
    lastError: vi.fn(() => null),
    pendingCount: 0,
    pendingKey: null,
    pendingKeys: [],
    reset: vi.fn(),
    run: vi.fn(async () => []),
  },
)

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: vi.fn(() => ({
    signInWithGoogle: vi.fn(async () => ({
      bundle: { challenge: '', state: '', verifier: '' },
      url: '',
    })),
    signOut: vi.fn(),
    useAuth: () => ({
      displayName: 'Guest',
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,
      provider: 'guest',
      user: null,
      userId: 'guest:local',
    }),
    useData: () => ({}),
    useMutation: () => mutation,
    useQuery: () => undefined,
  })),
  useAuth: () => ({
    displayName: 'Guest',
    isAuthenticated: false,
    isGuest: true,
    isLoading: false,
    provider: 'guest',
    user: null,
    userId: 'guest:local',
  }),
  useKeyedLakebedMutation: () => keyedMutation,
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
}))

import * as registry from '#/registry/all.ts'
import * as primitiveRegistry from '#/registry/primitives/index.ts'
import { isCapsule } from '#/capsules/openui.ts'

const primitiveNames = new Set(
  Object.values(primitiveRegistry)
    .filter(isCapsule)
    .map((capsule) => capsule.client.name),
)

const capsules = Object.values(registry)
  .filter(isCapsule)
  .filter((capsule) => !primitiveNames.has(capsule.client.name))
  .sort((left, right) => left.client.name.localeCompare(right.client.name))
const capsuleCases = capsules.map((capsule) => ({
  capsule,
  name: capsule.client.name,
}))

function createMatchMedia(query: string) {
  return {
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }
}

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    'IntersectionObserver',
    class IntersectionObserver {
      root = null
      rootMargin = ''
      thresholds = []
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
  vi.stubGlobal('matchMedia', vi.fn(createMatchMedia))
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('all exported section capsules default render', () => {
  it('collects the complete registry rather than a representative subset', () => {
    expect(capsules.length).toBeGreaterThan(1000)
  })

  it.each(capsuleCases)(
    '$name renders without throwing or React runtime warnings',
    ({ name, capsule }) => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const Component = capsule.client.component
      const rendered = render(
        <Component props={{}} statementId={`${name}-default-render`} />,
      )

      expect(
        rendered.container.querySelector(`[data-openui-component="${name}"]`),
      ).not.toBeNull()
      expect(consoleError).not.toHaveBeenCalled()
      consoleError.mockRestore()
    },
  )
})
