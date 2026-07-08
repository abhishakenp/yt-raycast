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

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn().mockResolvedValue({ deleted: 1 }),
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

const dbObservedOpenUiRows = [
  {
    sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
    prompt:
      'a craft beer brewery with taproom tours and seasonal releases in portland',
    status: 'preview_ready',
    createdAt: 1782814087992,
    updatedAt: 1782896344035,
    elapsed: 6424,
    cost: 0,
    previewVersion: 1,
    preferredLanguage: 'lt',
    categories: [],
    homepageReady: null,
    siteSpecReady: null,
    openuiReady: true,
    readiness: {
      homepageReady: null,
      openuiReady: true,
      previewReady: true,
      siteSpecReady: null,
    },
    engineVersion: 'v1',
    html: `<!DOCTYPE html>
<html lang="en">
<body>
  <main id="openui-root" class="genui-preview dark" style="color-scheme: dark">
    <section data-sf-export-page="Home">
      <h1>Our Brew Selection</h1>
      <p>Pineapple Saison</p>
    </section>
  </main>
</body>
</html>`,
    moduleSource:
      'home_navbar = RestaurantNavbar("Craft Beer Brewery", ["Home","Menu","Gallery","Story","Testimonials"])\nhome_menu = RestaurantMenu("Our Brew Selection", "Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.", [{"name":"Seasonal Releases","items":[{"name":"Pineapple Saison","description":"Tropical notes with a crisp finish","price":"$7","tag":"Limited"}]}])\nroot = PageSwitch(["Home"], [home_menu], "", {"Home":"home"})',
  },
  {
    sessionId: 'k572nbkrw902ef81nn4ha1yq7989njsg',
    prompt: 'gov site in hindi',
    status: 'preview_ready',
    createdAt: 1782803975237,
    updatedAt: 1782803984993,
    elapsed: 8654,
    cost: 0,
    previewVersion: 1,
    preferredLanguage: 'hi',
    categories: [],
    homepageReady: null,
    siteSpecReady: null,
    openuiReady: true,
    readiness: {
      homepageReady: null,
      openuiReady: true,
      previewReady: true,
      siteSpecReady: null,
    },
    engineVersion: 'v3',
    html: `<!doctype html>
<html lang="hi">
<body>
  <main id="openui-root" style="color-scheme: light">
    <section data-sf-export-page="Home">
      <h1>हमारी प्रमुख सेवाएँ</h1>
      <p>डिजिटल पहचान प्रमाणन</p>
    </section>
  </main>
</body>
</html>`,
    moduleSource:
      'home_navbar = ChurchNavbar("भारत सरकार", ["Home","Contact","Events","About","Services"], "/")\nhome_services = ChurchServices("सेवाएँ", "हमारी प्रमुख सेवाएँ", "", [{"title":"डिजिटल पहचान प्रमाणन","detail":"","location":""}])\nroot = PageSwitch(["Home"], [home_services], "", {"Home":"Home"})',
  },
] as Array<GalleryPayload['items'][number] & { engineVersion: 'v1' | 'v3' }>

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
    expect(container.querySelector('img')).toBeNull()
    // No gallery-preview-frame id (legacy live preview iframe id).
    expect(container.querySelector('#gallery-preview-frame')).toBeNull()
  })

  it('ignores PNG imageUrl payloads instead of using them as public gallery previews', () => {
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: [
        sessionWith({
          html: null,
          imageUrl: 'https://cdn.example.test/k574-gallery.png',
          moduleSource: null,
          prompt:
            'a craft beer brewery with taproom tours and seasonal releases in portland',
          sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
        }),
      ],
      total: 1,
    }

    const { container, queryByText } = render(<GalleryGrid gallery={gallery} />)

    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('iframe')).toBeNull()
    expect(
      container.querySelector('[data-testid="generated-module-preview"]'),
    ).toBeNull()
    expect(queryByText('Our Brew Selection')).toBeNull()
    expect(document.body.innerHTML).not.toContain('k574-gallery.png')
  })

  it('renders server-produced static HTML for DB-observed OpenUI v1 and v3 gallery rows without fetching thumbnails or mounting the live runtime', () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('thumbnail offline'))
    globalThis.fetch = fetchMock
    const gallery: GalleryPayload = {
      ...emptyGallery,
      items: dbObservedOpenUiRows,
      total: dbObservedOpenUiRows.length,
    }

    const { container, queryByText } = render(<GalleryGrid gallery={gallery} />)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(
      container.querySelectorAll('[data-testid="generated-module-preview"]'),
    ).toHaveLength(0)
    expect(container.querySelectorAll('iframe')).toHaveLength(0)
    expect(queryByText('Our Brew Selection')).not.toBeNull()
    expect(queryByText('Pineapple Saison')).not.toBeNull()
    expect(queryByText('हमारी प्रमुख सेवाएँ')).not.toBeNull()
    expect(queryByText('डिजिटल पहचान प्रमाणन')).not.toBeNull()
    expect(queryByText('Generated OpenUI source is ready.')).toBeNull()
    expect(queryByText('Craft Beer Brewery')).toBeNull()
    expect(queryByText('Gov Hindi')).toBeNull()
  })
})
