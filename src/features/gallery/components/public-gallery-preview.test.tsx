// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    ...props
  }: {
    children: ReactNode
    [key: string]: unknown
  }) => {
    const anchorProps = { ...props }
    delete anchorProps.params
    delete anchorProps.to

    return (
      <a href="/generate/test" {...anchorProps}>
        {children}
      </a>
    )
  },
}))

vi.mock('@/features/gallery/services/delete-gallery-session', () => ({
  deleteGallerySession: vi.fn().mockResolvedValue({ deleted: 1 }),
}))

// Surface the live module preview runtime as a marker so we can assert it
// never mounts in the public gallery.
vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: ({ source }: { source: string }) => (
    <div data-testid="generated-module-preview">{source}</div>
  ),
}))

import { GalleryGrid, type GalleryPayload } from './PublicGallery'

const emptyGallery: GalleryPayload = {
  availableCategories: [],
  hasNext: false,
  hasPrev: false,
  items: [],
  limit: 12,
  page: 1,
  total: 0,
  totalPages: 1,
}

const sessionWith = (overrides: Partial<GalleryPayload['items'][number]>) => ({
  sessionId: 'preview-session',
  prompt: 'AI image studio',
  previewVersion: 1,
  ...overrides,
})

describe('public gallery preview cards', () => {
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new Error('thumbnail unavailable'))
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    globalThis.fetch = originalFetch
  })

  it('renders stored HTML inline and never mounts the live preview runtime or an iframe', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        sessionWith({
          html: '<main><h1>Rendered product preview</h1></main>',
        }),
      ],
      total: 1,
    }

    const { container } = render(<GalleryGrid gallery={gallery} />)

    // Stored HTML is rendered inline (via dangerouslySetInnerHTML).
    expect(container.querySelector('h1')?.textContent).toBe(
      'Rendered product preview',
    )
    // The live module preview runtime never mounts.
    expect(
      container.querySelector('[data-testid="generated-module-preview"]'),
    ).toBeNull()
    // No iframe is ever rendered.
    expect(container.querySelector('iframe')).toBeNull()
  })

  it('does not mount the live preview runtime when only moduleSource is present (falls back to thumbnail/gradient)', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        sessionWith({
          moduleSource: '$page = "Home"\nroot = Hero("LumenAI Studio")',
        }),
      ],
      total: 1,
    }

    const { container } = render(<GalleryGrid gallery={gallery} />)

    // moduleSource alone does not trigger the live module preview runtime.
    expect(
      container.querySelector('[data-testid="generated-module-preview"]'),
    ).toBeNull()
    expect(container.querySelector('iframe')).toBeNull()
    // No stored HTML to render inline.
    expect(container.querySelector('h1')).toBeNull()
  })

  it('does not fetch the live preview-raw endpoint for any session shape', () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('unavailable'))
    globalThis.fetch = fetchMock

    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        sessionWith({
          html: '<main><h1>Rendered product preview</h1></main>',
          moduleSource: '$page = "Home"\nroot = Hero("LumenAI Studio")',
        }),
      ],
      total: 1,
    }

    render(<GalleryGrid gallery={gallery} />)

    // No fetch is made to the live preview-raw endpoint; stored HTML is used
    // directly and the thumbnail path is not exercised when HTML is present.
    const previewRawCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes('/preview-raw'),
    )
    expect(previewRawCalls).toHaveLength(0)
  })

  it('never renders an iframe across sessions with HTML, moduleSource, imageUrl, or none', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        sessionWith({
          sessionId: 'html-session',
          html: '<main><h1>HTML preview</h1></main>',
        }),
        sessionWith({
          sessionId: 'module-session',
          moduleSource: '$page = "Home"',
        }),
        sessionWith({
          sessionId: 'image-session',
          imageUrl: 'https://cdn.example.test/generated-theme.png',
        }),
        sessionWith({ sessionId: 'empty-session' }),
      ],
      total: 4,
    }

    const { container } = render(<GalleryGrid gallery={gallery} />)

    expect(container.querySelectorAll('iframe')).toHaveLength(0)
    expect(
      container.querySelectorAll('[data-testid="generated-module-preview"]'),
    ).toHaveLength(0)
    // No gallery-preview-frame id (legacy live preview iframe id).
    expect(container.querySelector('#gallery-preview-frame')).toBeNull()
  })
})
