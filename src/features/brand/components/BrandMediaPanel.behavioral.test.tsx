// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BrandMediaPanel } from './BrandMediaPanel'

const convexState = vi.hoisted(() => ({
  searchCalls: [] as Array<{
    query: string
    cursor: string | null
    pageSize?: number
  }>,
  searchPages: new Map<
    string,
    {
      results: Array<{
        id: string
        name: string
        domain: string | null
        brandId: string | null
        icon: string | null
        logo: string | null
        verified: boolean
      }>
      continueCursor: string | null
      isDone: boolean
    }
  >(),
  generateUploadUrl: vi.fn(async () => 'https://upload.test/image'),
  saveUserImage: vi.fn(async () => undefined),
  userImages: [] as Array<{ url: string | null; filename?: string | null }>,
}))

vi.mock('convex/react', () => ({
  useAction: () => async (args: { query: string; cursor: string | null }) => {
    convexState.searchCalls.push(args)
    return (
      convexState.searchPages.get(args.cursor ?? 'start') ?? {
        results: [],
        continueCursor: null,
        isDone: true,
      }
    )
  },
  useMutation: (fn: unknown) => {
    if (fn === 'generateImageUploadUrl') return convexState.generateUploadUrl
    if (fn === 'saveUserImage') return convexState.saveUserImage
    return vi.fn(async () => undefined)
  },
  useQuery: () => convexState.userImages,
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    brandfetch: {
      search: 'brandfetch.search',
    },
    sessions: {
      generateImageUploadUrl: 'generateImageUploadUrl',
      saveUserImage: 'saveUserImage',
      listUserImages: 'listUserImages',
    },
  },
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => 'owner-secret',
}))

const linearLogo = {
  id: 'linear',
  name: 'Linear',
  domain: 'linear.app',
  brandId: 'iduDa181eM',
  icon: 'https://cdn.brandfetch.io/linear/icon.webp',
  logo: 'https://cdn.brandfetch.io/linear/logo.svg',
  verified: true,
}

const realCraftBeerSelectedBrandLogo = {
  id: 'idwTkaYgXe',
  name: 'The Beer Store',
  domain: 'thebeerstore.ca',
  brandId: 'idwTkaYgXe',
  icon: 'https://cdn.brandfetch.io/idwTkaYgXe/w/128/h/128/fallback/lettermark/icon.webp?c=1ax1782982741853bfumLaCV7mbdS0jiIv',
  logo: 'https://cdn.brandfetch.io/idwTkaYgXe/w/128/h/128/fallback/lettermark/icon.webp?c=1ax1782982741853bfumLaCV7mbdS0jiIv',
  verified: false,
}

describe('BrandMediaPanel', () => {
  beforeEach(() => {
    vi.useRealTimers()
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    convexState.searchCalls = []
    convexState.searchPages = new Map([
      [
        'start',
        {
          results: [linearLogo],
          continueCursor: null,
          isDone: true,
        },
      ],
    ])
    convexState.generateUploadUrl = vi.fn(
      async () => 'https://upload.test/image',
    )
    convexState.saveUserImage = vi.fn(async () => undefined)
    convexState.userImages = []
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ storageId: 'storage-1' }),
    })) as unknown as typeof fetch
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders a searchable Brandfetch combobox and loads logo results through Convex', async () => {
    const view = render(
      <BrandMediaPanel sessionId="session-1" prompt="linear dashboard" />,
    )

    expect(view.queryByText('Brand and media')).toBeNull()
    expect(
      view.queryByText('Search Brandfetch logos or upload custom images.'),
    ).toBeNull()

    const input = view.getByPlaceholderText(
      /search brands or domains/i,
    ) as HTMLInputElement
    expect(input.value).toBe('linear dashboard')

    await waitFor(() => expect(view.getByText('Linear')).toBeTruthy())
    expect(convexState.searchCalls[0]).toMatchObject({
      query: 'linear dashboard',
      cursor: null,
      pageSize: 5,
    })
    expect(
      view.container.querySelector(
        'img[src="https://cdn.brandfetch.io/linear/logo.svg"]',
      ),
    ).toBeTruthy()
  })

  it('selects a Brandfetch logo through the parent callback without adding a footer summary', async () => {
    const onSelectBrand = vi.fn()
    const view = render(
      <BrandMediaPanel
        sessionId="session-1"
        prompt="linear"
        onSelectBrand={onSelectBrand}
      />,
    )

    await waitFor(() => expect(view.getByText('Linear')).toBeTruthy())
    fireEvent.click(view.getByText('Linear'))

    expect(onSelectBrand).toHaveBeenCalledWith({
      name: 'Linear',
      domain: 'linear.app',
      brandId: 'iduDa181eM',
      icon: 'https://cdn.brandfetch.io/linear/icon.webp',
      logo: 'https://cdn.brandfetch.io/linear/logo.svg',
    })
    expect(view.getAllByText('linear.app')).toHaveLength(1)
  })

  it('selects a real Convex-stored Brandfetch logo shape without dropping CDN image fields', async () => {
    convexState.searchPages = new Map([
      [
        'start',
        {
          results: [realCraftBeerSelectedBrandLogo],
          continueCursor: null,
          isDone: true,
        },
      ],
    ])
    const onSelectBrand = vi.fn()

    const view = render(
      <BrandMediaPanel
        sessionId="k574ms14ma9f94keq30r7dq24x89n1k2"
        prompt="a craft beer brewery with taproom tours and seasonal releases in portland"
        onSelectBrand={onSelectBrand}
      />,
    )

    await waitFor(() => expect(view.getByText('The Beer Store')).toBeTruthy())
    fireEvent.click(view.getByText('The Beer Store'))

    expect(onSelectBrand).toHaveBeenCalledWith({
      brandId: 'idwTkaYgXe',
      domain: 'thebeerstore.ca',
      icon: realCraftBeerSelectedBrandLogo.icon,
      logo: realCraftBeerSelectedBrandLogo.logo,
      name: 'The Beer Store',
    })
    expect(
      view.container.querySelector(
        `img[src="${realCraftBeerSelectedBrandLogo.logo}"]`,
      ),
    ).toBeTruthy()
  })

  it('loads the next Brandfetch page when the logo list scrolls near the bottom', async () => {
    convexState.searchPages = new Map([
      [
        'start',
        {
          results: [linearLogo],
          continueCursor: '1',
          isDone: false,
        },
      ],
      [
        '1',
        {
          results: [
            {
              id: 'loom',
              name: 'Loom',
              domain: 'loom.com',
              brandId: 'loom-id',
              icon: 'https://cdn.brandfetch.io/loom/icon.webp',
              logo: 'https://cdn.brandfetch.io/loom/logo.svg',
              verified: true,
            },
          ],
          continueCursor: null,
          isDone: true,
        },
      ],
    ])

    const view = render(<BrandMediaPanel sessionId="session-1" prompt="lo" />)
    await waitFor(() => expect(view.getByText('Linear')).toBeTruthy())

    const list = view.container.querySelector(
      '[data-slot="command-list"]',
    ) as HTMLElement
    Object.defineProperty(list, 'scrollHeight', {
      configurable: true,
      value: 400,
    })
    Object.defineProperty(list, 'clientHeight', {
      configurable: true,
      value: 300,
    })
    Object.defineProperty(list, 'scrollTop', { configurable: true, value: 30 })
    fireEvent.scroll(list)

    await waitFor(() => expect(view.getByText('Loom')).toBeTruthy())
    expect(convexState.searchCalls.at(-1)).toMatchObject({
      query: 'lo',
      cursor: '1',
      pageSize: 5,
    })
  })

  it('uploads custom images through the existing Convex storage flow', async () => {
    const view = render(
      <BrandMediaPanel sessionId="session-1" prompt="linear" />,
    )
    const file = new File(['image-bytes'], 'logo.png', { type: 'image/png' })
    const input = view.container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() =>
      expect(convexState.generateUploadUrl).toHaveBeenCalled(),
    )
    await waitFor(() => expect(convexState.saveUserImage).toHaveBeenCalled())
    expect(convexState.generateUploadUrl).toHaveBeenCalledWith({
      sessionId: 'session-1',
      anonymousOwnerSecret: 'owner-secret',
    })
    expect(convexState.saveUserImage).toHaveBeenCalledWith({
      sessionId: 'session-1',
      anonymousOwnerSecret: 'owner-secret',
      storageId: 'storage-1',
      filename: 'logo.png',
      contentType: 'image/png',
      size: file.size,
    })
  })

  it('shows existing uploaded custom images without adding section chrome', () => {
    convexState.userImages = [
      {
        url: 'https://storage.test/custom-logo.png',
        filename: 'custom-logo.png',
      },
    ]

    const view = render(
      <BrandMediaPanel sessionId="session-1" prompt="linear" />,
    )

    expect(view.queryByText('Custom images')).toBeNull()
    expect(
      view.container.querySelector(
        'img[src="https://storage.test/custom-logo.png"]',
      ),
    ).toBeTruthy()
  })

  it('keeps the popover panel bounded like the other command pickers', () => {
    const view = render(
      <BrandMediaPanel
        sessionId="session-1"
        prompt="linear"
        cloneUrl="https://linear.app"
        designReferenceUrls={['https://example.com/reference']}
        designReferenceNotes="Use this reference without rendering extra footer copy."
      />,
    )

    expect(view.container.firstElementChild?.className).toContain(
      'overflow-hidden',
    )
    expect(
      view.container.querySelector('[data-slot="command-list"]')?.className,
    ).toContain('max-h-[360px]')
    expect(view.queryByText(/Reference:/)).toBeNull()
    expect(view.queryByText(/Clone:/)).toBeNull()
  })
})
