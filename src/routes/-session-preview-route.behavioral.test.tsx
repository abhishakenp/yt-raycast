// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const routeParamMocks = vi.hoisted(() => ({
  slug: 'k574ms14ma9f94keq30r7dq24x89n1k2',
}))

vi.mock('@tanstack/react-router', () => ({
  getRouteApi: (path: string) => ({
    useParams: () =>
      path === '/preview/$slug' ? { slug: routeParamMocks.slug } : {},
  }),
}))

vi.mock('@/features/dashboard/components/SessionPreviewPage', () => ({
  SessionPreviewPage: ({ sessionId }: { sessionId: string }) => (
    <main data-testid="session-preview-page">{sessionId}</main>
  ),
}))

import { PreviewRoute } from './-session-preview-route'

afterEach(() => {
  cleanup()
})

describe('PreviewRoute', () => {
  it('passes the preview URL id into the bare session preview page', () => {
    render(<PreviewRoute />)

    expect(screen.getByTestId('session-preview-page').textContent).toBe(
      'k574ms14ma9f94keq30r7dq24x89n1k2',
    )
  })
})
