// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/features/gallery/hooks/useGalleryController', () => ({
  useGalleryController: () => ({
    gallery: undefined,
  }),
}))

describe('home gallery Convex boundary', () => {
  afterEach(() => {
    cleanup()
  })

  const withConvex = (children) => (
    <ConvexProvider
      client={
        new ConvexReactClient('https://convex.example.test', {
          logger: false,
        })
      }
    >
      {children}
    </ConvexProvider>
  )

  it('renders on the public home route when the root provider supplies Convex', async () => {
    const { HomeGallerySection } =
      await import('@/features/gallery/components/PublicGallery')

    expect(() =>
      renderToString(withConvex(<HomeGallerySection />)),
    ).not.toThrow()

    expect(() => render(withConvex(<HomeGallerySection />))).not.toThrow()
    expect(screen.getByRole('heading').textContent).toBe(
      'See what other speedsters generated',
    )
    expect(
      screen.getByRole('link', { name: /my generations/i }),
    ).toHaveProperty('pathname', '/mine')
  })
})
