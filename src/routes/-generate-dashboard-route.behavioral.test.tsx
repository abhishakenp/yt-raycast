// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const routeParamMocks = vi.hoisted(() => ({
  sessionId: 'test-sess-123',
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: (path: string) => (options: unknown) => ({ options, path }),
  getRouteApi: (_path: string) => ({
    useParams: () => ({ sessionId: routeParamMocks.sessionId }),
  }),
  lazyRouteComponent: (_importer: unknown, exportName: string) => {
    const LazyRouteComponent = () => (
      <div data-testid="lazy-route">{exportName}</div>
    )
    return LazyRouteComponent
  },
}))

vi.mock('@/features/dashboard/components/Dashboard', () => ({
  Dashboard: ({ sessionId }: { sessionId: string }) => (
    <section data-testid="dashboard-route">{sessionId}</section>
  ),
}))

import {
  GenerateRoute,
  GenerateAdminRoute,
  extractSlugFromPath,
} from './-generate-dashboard-route'

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('extractSlugFromPath', () => {
  it('returns null for the base URL (no trailing path)', () => {
    expect(extractSlugFromPath('/generate/sess123', 'sess123')).toBeNull()
  })

  it('returns the first segment after the session base', () => {
    expect(extractSlugFromPath('/generate/sess123/pricing', 'sess123')).toBe(
      'pricing',
    )
  })

  it('returns only the first segment for multi-segment paths', () => {
    expect(
      extractSlugFromPath('/generate/sess123/blog/post-1', 'sess123'),
    ).toBe('blog')
  })

  it('returns null for a different session id', () => {
    expect(
      extractSlugFromPath('/generate/other-sess/pricing', 'sess123'),
    ).toBeNull()
  })

  it('returns null for unrelated paths', () => {
    expect(extractSlugFromPath('/pricing', 'sess123')).toBeNull()
  })
})

describe('GenerateRoute rendering', () => {
  it('renders the dashboard with the session id', () => {
    render(<GenerateRoute />)
    expect(screen.getByTestId('dashboard-route').textContent).toContain(
      'test-sess-123',
    )
  })

  it('GenerateAdminRoute renders dashboard', () => {
    render(<GenerateAdminRoute />)
    expect(screen.getByTestId('dashboard-route')).toBeTruthy()
  })
})
