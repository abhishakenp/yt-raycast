// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { createElement, type ComponentProps } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Radix ToggleGroup requires ResizeObserver
if (typeof ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
    writable: true,
  })
}
if (typeof IntersectionObserver === 'undefined') {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    value: class IntersectionObserver {
      readonly root: Element | null = null
      readonly rootMargin: string = ''
      readonly thresholds: ReadonlyArray<number> = []
      disconnect() {}
      observe() {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
      unobserve() {}
    },
    writable: true,
  })
}

vi.mock('@/lib/stock-image', () => ({
  searchStockImages: vi.fn(async () => []),
  // Mirror production behaviour: with no hi-res baseUrl, fall back to the
  // thumbnail; when a baseUrl exists, hand back a resolution-tagged URL so
  // tests can assert the quality tier is threaded through.
  buildBackgroundImageUrl: (result, resolution) =>
    result.baseUrl ? `${result.baseUrl}?res=${resolution}` : result.imageUrl,
}))
vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => vi.fn(async () => {})),
  useQuery: vi.fn(() => undefined),
}))
vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      generateImageUploadUrl: 'generateImageUploadUrl',
      saveUserImage: 'saveUserImage',
      listUserImages: 'listUserImages',
    },
  },
}))
vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: vi.fn(() => undefined),
}))

const { searchStockImages } = await import('@/lib/stock-image')
const { useQuery } = await import('convex/react')
const { BackgroundPanel } = await import('./BackgroundPanel')

const onModified = vi.fn<() => void>()

function renderPanel(
  activeElement: HTMLElement | null,
  props: Partial<ComponentProps<typeof BackgroundPanel>> = {},
) {
  return render(
    createElement(BackgroundPanel, { activeElement, onModified, ...props }),
  )
}

function makeComputed(
  overrides: Partial<Record<string, string>> = {},
): CSSStyleDeclaration {
  return {
    backgroundColor: 'rgb(0, 0, 0)',
    backgroundImage: 'none',
    backgroundSize: '',
    backgroundPosition: '',
    backdropFilter: 'none',
    webkitBackdropFilter: 'none',
    ...overrides,
    getPropertyValue(prop: string) {
      return (this as Record<string, string>)[prop] ?? ''
    },
  } as unknown as CSSStyleDeclaration
}

describe('BackgroundPanel', () => {
  let activeElement: HTMLElement
  let originalGetComputedStyle: typeof window.getComputedStyle

  beforeEach(() => {
    onModified.mockReset()
    vi.mocked(searchStockImages).mockReset()
    vi.mocked(searchStockImages).mockResolvedValue([])
    vi.mocked(useQuery).mockReset()
    vi.mocked(useQuery).mockReturnValue(undefined)
    activeElement = document.createElement('div')
    document.body.appendChild(activeElement)
    originalGetComputedStyle = window.getComputedStyle
    window.getComputedStyle = vi.fn(() =>
      makeComputed(),
    ) as typeof window.getComputedStyle
  })

  afterEach(() => {
    window.getComputedStyle = originalGetComputedStyle
    activeElement.remove()
    cleanup()
  })

  it('renders without crashing', () => {
    const { container } = renderPanel(activeElement)
    expect(container.firstChild).toBeTruthy()
  })

  it('keeps the core background controls discoverable together in the panel', () => {
    const { getByRole } = renderPanel(activeElement)

    expect(getByRole('radiogroup', { name: 'Background mode' })).toBeTruthy()
    expect(getByRole('radio', { name: 'Solid' })).toBeTruthy()
    expect(getByRole('radio', { name: 'Gradient' })).toBeTruthy()
    expect(
      getByRole('textbox', { name: 'Search background images' }),
    ).toBeTruthy()
    expect(getByRole('button', { name: 'Search images' })).toBeTruthy()
    expect(getByRole('slider', { name: 'Backdrop blur' })).toBeTruthy()
  })

  it('applies background-color when solid color picker changes', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ backgroundColor: '#000000' }),
    ) as typeof window.getComputedStyle
    const { getByDisplayValue } = renderPanel(activeElement)
    const colorInput = getByDisplayValue('#000000') as HTMLInputElement
    fireEvent.change(colorInput, { target: { value: '#ff0000' } })
    expect(activeElement.style.backgroundColor).toBe('rgb(255, 0, 0)')
    expect(onModified).toHaveBeenCalled()
  })

  it('exposes the solid background color picker by accessible name', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ backgroundColor: '#000000' }),
    ) as typeof window.getComputedStyle
    const { getByLabelText } = renderPanel(activeElement)
    const colorInput = getByLabelText('Background color') as HTMLInputElement

    fireEvent.change(colorInput, { target: { value: '#00ff00' } })

    expect(activeElement.style.backgroundColor).toBe('rgb(0, 255, 0)')
    expect(onModified).toHaveBeenCalled()
  })

  it('labels the background mode segmented control so Solid and Gradient have context', () => {
    const { getByRole } = renderPanel(activeElement)

    const modeGroup = getByRole('radiogroup', { name: 'Background mode' })
    const solid = getByRole('radio', { name: 'Solid' })
    const gradient = getByRole('radio', { name: 'Gradient' })

    expect(modeGroup.contains(solid)).toBe(true)
    expect(modeGroup.contains(gradient)).toBe(true)
  })

  it('applies linear-gradient background-image in gradient mode', () => {
    const { getByText, getAllByRole } = renderPanel(activeElement)
    // Switch to gradient mode
    fireEvent.click(getByText('Gradient'))
    // The applied background-image should contain linear-gradient
    expect(activeElement.style.backgroundImage).toContain('linear-gradient')
    // Verify a slider exists for angle (range inputs)
    const ranges = getAllByRole('slider')
    expect(ranges.length).toBeGreaterThan(0)
  })

  it('exposes gradient color stop pickers by accessible name', () => {
    const { getByText, getByLabelText } = renderPanel(activeElement)
    fireEvent.click(getByText('Gradient'))
    const firstStop = getByLabelText('Gradient first color') as HTMLInputElement
    const secondStop = getByLabelText(
      'Gradient second color',
    ) as HTMLInputElement

    fireEvent.change(firstStop, { target: { value: '#ff0000' } })
    fireEvent.change(secondStop, { target: { value: '#0000ff' } })

    expect(activeElement.style.backgroundImage).toContain('rgb(255, 0, 0)')
    expect(activeElement.style.backgroundImage).toContain('rgb(0, 0, 255)')
    expect(onModified).toHaveBeenCalled()
  })

  it('names gradient sliders by role so keyboard users can identify each control', () => {
    const { getByRole, getByText } = renderPanel(activeElement)

    fireEvent.click(getByText('Gradient'))

    expect(
      getByRole('slider', { name: 'Gradient stop 1 position' }),
    ).toBeTruthy()
    expect(
      getByRole('slider', { name: 'Gradient stop 2 position' }),
    ).toBeTruthy()
    expect(getByRole('slider', { name: 'Gradient angle' })).toBeTruthy()
  })

  it('labels the gradient type segmented control so Linear and Radial have context', () => {
    const { getByRole, getByText } = renderPanel(activeElement)

    fireEvent.click(getByText('Gradient'))

    const typeGroup = getByRole('radiogroup', { name: 'Gradient type' })
    const linear = getByRole('radio', { name: 'Linear' })
    const radial = getByRole('radio', { name: 'Radial' })

    expect(typeGroup.contains(linear)).toBe(true)
    expect(typeGroup.contains(radial)).toBe(true)
  })

  it('applies preset gradient when a preset swatch is clicked', () => {
    const { getByLabelText } = renderPanel(activeElement)
    const sunset = getByLabelText('Sunset')
    fireEvent.click(sunset)
    expect(activeElement.style.backgroundImage).toContain('linear-gradient')
    expect(activeElement.style.backgroundImage).toContain('rgb(255, 126, 95)')
    expect(onModified).toHaveBeenCalled()
  })

  it('selecting a stock image for an img element changes the displayed src, not a hidden background-image', async () => {
    vi.mocked(searchStockImages).mockResolvedValue([
      {
        imageUrl: 'https://images.pexels.com/photos/replacement.jpeg',
        query: 'replacement glass',
        source: 'pexels',
      },
    ])
    const imageElement = document.createElement('img')
    imageElement.src = 'https://example.com/original.jpeg'
    imageElement.style.backgroundImage =
      'linear-gradient(90deg, rgb(0, 242, 96), rgb(5, 117, 230))'
    imageElement.style.backgroundSize = 'cover'
    imageElement.style.backgroundPosition = 'center'
    document.body.appendChild(imageElement)

    const { getByPlaceholderText, getByRole } = renderPanel(imageElement)
    fireEvent.change(getByPlaceholderText('Search stock images...'), {
      target: { value: 'replacement glass' },
    })
    fireEvent.click(getByRole('button', { name: 'Search images' }))

    const result = await waitFor(() =>
      getByRole('button', { name: 'Select image 1' }),
    )
    fireEvent.click(result)

    expect(imageElement.src).toBe(
      'https://images.pexels.com/photos/replacement.jpeg',
    )
    expect(imageElement.style.backgroundImage).toBe('')
    expect(imageElement.style.backgroundSize).toBe('')
    expect(imageElement.style.backgroundPosition).toBe('')
    expect(onModified).toHaveBeenCalled()
    imageElement.remove()
  })

  it('exposes the background image search input by accessible name', async () => {
    vi.mocked(searchStockImages).mockResolvedValue([
      {
        imageUrl: 'https://images.pexels.com/photos/background.jpeg',
        query: 'polished glass showroom',
        source: 'pexels',
      },
    ])
    const { getByRole } = renderPanel(activeElement)
    const input = getByRole('textbox', { name: 'Search background images' })

    fireEvent.change(input, { target: { value: 'polished glass showroom' } })
    fireEvent.click(getByRole('button', { name: 'Search images' }))

    await waitFor(() =>
      expect(searchStockImages).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'polished glass showroom' }),
      ),
    )
  })

  it('renders uploaded images from the session and applies one as a section background', () => {
    vi.mocked(useQuery).mockReturnValue([
      {
        url: 'https://ship-fast.test/uploaded/showroom.jpeg',
        filename: 'showroom.jpeg',
      },
      { url: null, filename: 'pending.jpeg' },
    ])

    const { getByRole } = renderPanel(activeElement, { sessionId: 'sess-1' })

    fireEvent.click(getByRole('button', { name: 'Select uploaded image 1' }))

    expect(useQuery).toHaveBeenCalledWith(expect.anything(), {
      sessionId: 'sess-1',
    })
    expect(activeElement.style.backgroundImage).toContain(
      'https://ship-fast.test/uploaded/showroom.jpeg',
    )
    expect(activeElement.style.backgroundSize).toBe('cover')
    expect(activeElement.style.backgroundPosition).toBe('center center')
    expect(onModified).toHaveBeenCalled()
  })

  it('selecting an uploaded image for an img element uses the preview callback instead of a hidden background', () => {
    vi.mocked(useQuery).mockReturnValue([
      {
        url: 'https://ship-fast.test/uploaded/hero.jpeg',
        filename: 'hero.jpeg',
      },
    ])
    const onImageElementPreview = vi.fn()
    const imageElement = document.createElement('img')
    imageElement.src = 'https://example.com/original.jpeg'
    document.body.appendChild(imageElement)

    const { getByRole } = renderPanel(imageElement, {
      onImageElementPreview,
      sessionId: 'sess-1',
    })

    fireEvent.click(getByRole('button', { name: 'Select uploaded image 1' }))

    expect(onImageElementPreview).toHaveBeenCalledWith(
      'https://ship-fast.test/uploaded/hero.jpeg',
    )
    expect(imageElement.src).toBe('https://example.com/original.jpeg')
    expect(imageElement.style.backgroundImage).toBe('')
    expect(onModified).toHaveBeenCalled()
    imageElement.remove()
  })

  it('shows a recoverable error when background image search fails', async () => {
    vi.mocked(searchStockImages).mockRejectedValue(
      new Error('Pexels rate limit'),
    )
    const { getByRole, getByText } = renderPanel(activeElement)
    const input = getByRole('textbox', { name: 'Search background images' })

    fireEvent.change(input, { target: { value: 'polished glass showroom' } })
    fireEvent.click(getByRole('button', { name: 'Search images' }))

    await waitFor(() => expect(getByText('Pexels rate limit')).toBeTruthy())
    expect(
      (getByRole('button', { name: 'Search images' }) as HTMLButtonElement)
        .disabled,
    ).toBe(false)
  })

  it('keeps existing background image results selectable when a later search fails', async () => {
    vi.mocked(searchStockImages)
      .mockResolvedValueOnce([
        {
          imageUrl: 'https://images.pexels.com/photos/first.jpeg',
          query: 'glass lobby',
          source: 'pexels',
        },
        {
          imageUrl: 'https://images.pexels.com/photos/second.jpeg',
          query: 'glass lobby',
          source: 'pexels',
        },
      ])
      .mockRejectedValueOnce(new Error('Pexels outage'))
    const { getByRole, getAllByRole, getByText } = renderPanel(activeElement)
    const input = getByRole('textbox', { name: 'Search background images' })

    fireEvent.change(input, { target: { value: 'glass lobby' } })
    fireEvent.click(getByRole('button', { name: 'Search images' }))

    await waitFor(() =>
      expect(getAllByRole('button', { name: /^Select image / })).toHaveLength(
        2,
      ),
    )

    fireEvent.change(input, { target: { value: 'broken provider query' } })
    fireEvent.click(getByRole('button', { name: 'Search images' }))

    await waitFor(() => expect(getByText('Pexels outage')).toBeTruthy())
    expect(getAllByRole('button', { name: /^Select image / })).toHaveLength(2)
  })

  it('keeps the newest background search results when an older request resolves later', async () => {
    let resolveFirst:
      | ((
          value: Array<{
            imageUrl: string
            query: string
            source: 'pexels'
          }>,
        ) => void)
      | undefined

    vi.mocked(searchStockImages)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          }),
      )
      .mockResolvedValueOnce([
        {
          imageUrl: 'https://images.pexels.com/photos/newest.jpeg',
          query: 'new showroom',
          source: 'pexels',
        },
      ])

    const { getByRole, getAllByRole, queryByAltText } =
      renderPanel(activeElement)
    const input = getByRole('textbox', { name: 'Search background images' })

    fireEvent.change(input, { target: { value: 'old showroom' } })
    fireEvent.click(getByRole('button', { name: 'Search images' }))

    await waitFor(() => expect(searchStockImages).toHaveBeenCalledTimes(1))

    fireEvent.change(input, { target: { value: 'new showroom' } })
    fireEvent.click(getByRole('button', { name: 'Search images' }))

    await waitFor(() => expect(searchStockImages).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(queryByAltText('new showroom')).toBeTruthy())

    resolveFirst?.([
      {
        imageUrl: 'https://images.pexels.com/photos/old.jpeg',
        query: 'old showroom',
        source: 'pexels',
      },
    ])

    await Promise.resolve()

    expect(queryByAltText('old showroom')).toBeNull()
    expect(queryByAltText('new showroom')).toBeTruthy()
    expect(getAllByRole('button', { name: /^Select image / })).toHaveLength(1)
  })

  it('keeps background search retry usable while a provider request is pending', async () => {
    vi.mocked(searchStockImages).mockImplementationOnce(
      () => new Promise(() => {}),
    )

    const { getByRole } = renderPanel(activeElement)
    const input = getByRole('textbox', { name: 'Search background images' })
    const searchButton = getByRole('button', { name: 'Search images' })

    fireEvent.change(input, { target: { value: 'slow query' } })
    fireEvent.click(searchButton)

    await waitFor(() => expect(searchStockImages).toHaveBeenCalledTimes(1))
    expect((searchButton as HTMLButtonElement).disabled).toBe(false)

    fireEvent.change(input, { target: { value: 'corrected query' } })
    fireEvent.click(searchButton)

    await waitFor(() => expect(searchStockImages).toHaveBeenCalledTimes(2))
    expect(searchStockImages).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: 'corrected query' }),
    )
  })

  it('shows a no-results state after a successful empty background image search', async () => {
    vi.mocked(searchStockImages).mockResolvedValue([])
    const { getByRole, getByText, queryAllByRole } = renderPanel(activeElement)
    const input = getByRole('textbox', { name: 'Search background images' })

    fireEvent.change(input, { target: { value: 'no matching murals' } })
    fireEvent.click(getByRole('button', { name: 'Search images' }))

    await waitFor(() => expect(getByText('No results found')).toBeTruthy())
    expect(queryAllByRole('button', { name: /^Select image / })).toHaveLength(0)
  })

  it('backdrop blur slider renders', () => {
    const { getByRole } = renderPanel(activeElement)
    expect(getByRole('slider', { name: 'Backdrop blur' })).toBeTruthy()
  })

  it('backdrop blur slider max is 100', () => {
    const { getByRole } = renderPanel(activeElement)
    const blurThumb = getByRole('slider', { name: 'Backdrop blur' })
    // Was 20 before the fix; should now be 100.
    expect(blurThumb?.getAttribute('aria-valuemax')).toBe('100')
  })

  it('makes the solid background transparent by dragging opacity to 0', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ backgroundColor: 'rgb(10, 20, 30)' }),
    ) as typeof window.getComputedStyle
    const { getByRole } = renderPanel(activeElement)

    // Home moves a Radix slider thumb to its minimum (0% opacity).
    const opacity = getByRole('slider', { name: 'Background opacity' })
    fireEvent.keyDown(opacity, { key: 'Home' })

    expect(activeElement.style.backgroundColor).toBe('transparent')
    expect(onModified).toHaveBeenCalled()
  })

  it('exposes a single panel-level opacity slider', () => {
    const { getByRole } = renderPanel(activeElement)
    expect(getByRole('slider', { name: 'Background opacity' })).toBeTruthy()
  })

  it('opacity slider climbs back from 0 to full and keeps the chosen hue', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ backgroundColor: 'rgb(255, 0, 0)' }),
    ) as typeof window.getComputedStyle
    const { getByRole } = renderPanel(activeElement)
    const opacity = getByRole('slider', { name: 'Background opacity' })

    // Home → 0% (transparent), End → 100% must restore the red, not go black.
    fireEvent.keyDown(opacity, { key: 'Home' })
    expect(activeElement.style.backgroundColor).toBe('transparent')

    fireEvent.keyDown(opacity, { key: 'End' })
    expect(activeElement.style.backgroundColor).toBe('rgb(255, 0, 0)')
  })

  it('opacity slider dims the whole gradient, not just a solid fill', () => {
    const { getByRole, getByText } = renderPanel(activeElement)
    fireEvent.click(getByText('Gradient'))
    expect(activeElement.style.backgroundImage).toContain('linear-gradient')

    // Drop opacity to 0 → both stops become transparent.
    const opacity = getByRole('slider', { name: 'Background opacity' })
    fireEvent.keyDown(opacity, { key: 'Home' })
    expect(activeElement.style.backgroundImage).toContain('transparent')
  })

  it('fades a div background image via an overlay layer, leaving foreground opaque', async () => {
    vi.mocked(searchStockImages).mockResolvedValue([
      {
        imageUrl: 'https://images.pexels.com/photos/thumb.jpeg',
        query: 'mountains',
        source: 'pexels',
        baseUrl: 'https://images.pexels.com/photos/original.jpeg',
      },
    ])
    const { getByRole } = renderPanel(activeElement)
    fireEvent.change(
      getByRole('textbox', { name: 'Search background images' }),
      { target: { value: 'mountains' } },
    )
    fireEvent.click(getByRole('button', { name: 'Search images' }))
    const tile = await waitFor(() =>
      getByRole('button', { name: 'Select image 1' }),
    )
    fireEvent.click(tile)
    // At full opacity: just the image, no overlay.
    expect(activeElement.style.backgroundImage).toContain('original.jpeg')
    expect(activeElement.style.backgroundImage).not.toContain('linear-gradient')

    // Lower opacity → a translucent overlay layer dims the image while the
    // image URL stays, and the element's own opacity is NEVER touched (so
    // foreground text is not faded).
    const opacity = getByRole('slider', { name: 'Background opacity' })
    fireEvent.keyDown(opacity, { key: 'Home' })
    expect(activeElement.style.backgroundImage).toContain('linear-gradient')
    expect(activeElement.style.backgroundImage).toContain('original.jpeg')
    expect(activeElement.style.opacity).toBe('')

    // Back to full → overlay removed, foreground still untouched.
    fireEvent.keyDown(opacity, { key: 'End' })
    expect(activeElement.style.backgroundImage).not.toContain('linear-gradient')
    expect(activeElement.style.opacity).toBe('')
  })

  it('fades an <img> element background via its own opacity (no foreground to protect)', async () => {
    vi.mocked(searchStockImages).mockResolvedValue([
      {
        imageUrl: 'https://images.pexels.com/photos/thumb.jpeg',
        query: 'mountains',
        source: 'pexels',
        baseUrl: 'https://images.pexels.com/photos/original.jpeg',
      },
    ])
    const imageElement = document.createElement('img')
    imageElement.src = 'https://example.com/orig.jpeg'
    document.body.appendChild(imageElement)
    const { getByRole } = renderPanel(imageElement)

    fireEvent.change(
      getByRole('textbox', { name: 'Search background images' }),
      { target: { value: 'mountains' } },
    )
    fireEvent.click(getByRole('button', { name: 'Search images' }))
    const tile = await waitFor(() =>
      getByRole('button', { name: 'Select image 1' }),
    )
    fireEvent.click(tile)

    const opacity = getByRole('slider', { name: 'Background opacity' })
    fireEvent.keyDown(opacity, { key: 'Home' })
    expect(imageElement.style.opacity).toBe('0')
    fireEvent.keyDown(opacity, { key: 'End' })
    expect(imageElement.style.opacity).toBe('')
    imageElement.remove()
  })

  it('changes background-size when a fit option is chosen for a background image', () => {
    vi.mocked(useQuery).mockReturnValue([
      { url: 'https://ship-fast.test/uploaded/a.jpg', filename: 'a.jpg' },
    ])
    const { getByRole } = renderPanel(activeElement, { sessionId: 'sess-1' })

    fireEvent.click(getByRole('button', { name: 'Select uploaded image 1' }))
    expect(activeElement.style.backgroundSize).toBe('cover')

    fireEvent.click(getByRole('radio', { name: 'Contain' }))
    expect(activeElement.style.backgroundSize).toBe('contain')

    fireEvent.click(getByRole('radio', { name: 'Fill' }))
    expect(activeElement.style.backgroundSize).toBe('100% 100%')
    expect(onModified).toHaveBeenCalled()
  })

  it('applies a stock background at the selected resolution and re-resolves when quality changes', async () => {
    vi.mocked(searchStockImages).mockResolvedValue([
      {
        imageUrl: 'https://images.pexels.com/photos/thumb.jpeg',
        query: 'rolling hills',
        source: 'pexels',
        baseUrl: 'https://images.pexels.com/photos/original.jpeg',
      },
    ])
    const { getByRole } = renderPanel(activeElement)

    fireEvent.change(
      getByRole('textbox', { name: 'Search background images' }),
      { target: { value: 'rolling hills' } },
    )
    fireEvent.click(getByRole('button', { name: 'Search images' }))
    const tile = await waitFor(() =>
      getByRole('button', { name: 'Select image 1' }),
    )

    fireEvent.click(tile)
    expect(activeElement.style.backgroundImage).toContain('res=standard')
    expect(activeElement.style.backgroundImage).toContain(
      'https://images.pexels.com/photos/original.jpeg',
    )

    fireEvent.click(getByRole('radio', { name: 'High' }))
    expect(activeElement.style.backgroundImage).toContain('res=high')
  })

  it('frosted glass preset sets a translucent tint and a backdrop blur together', () => {
    window.getComputedStyle = vi.fn(() =>
      makeComputed({ backgroundColor: 'rgb(0, 0, 0)' }),
    ) as typeof window.getComputedStyle
    const { getByRole, getByText } = renderPanel(activeElement)

    fireEvent.click(getByRole('button', { name: 'Frosted glass' }))

    // translucent tint (not a fully opaque fill)
    expect(activeElement.style.backgroundColor).toMatch(/rgba\(0, 0, 0/)
    // The Blur readout reflects the seeded preset value. (jsdom's cssstyle drops
    // the `backdrop-filter` property, so the inline value itself can't be read
    // here — the property write is the same path the Blur slider uses, verified
    // to render in a real compositor.)
    expect(getByText('16px')).toBeTruthy()
    expect(onModified).toHaveBeenCalled()
  })

  it('frosted glass tint follows the surface behind a transparent bar (theme-aware)', () => {
    window.getComputedStyle = vi.fn((el) =>
      el === activeElement
        ? makeComputed({ backgroundColor: 'rgba(0, 0, 0, 0)' })
        : makeComputed({ backgroundColor: 'rgb(20, 30, 40)' }),
    ) as typeof window.getComputedStyle
    const { getByRole } = renderPanel(activeElement)

    fireEvent.click(getByRole('button', { name: 'Frosted glass' }))

    // The transparent bar borrows the nearest opaque surface's hue as its tint.
    expect(activeElement.style.backgroundColor).toMatch(/rgba\(20, 30, 40/)
  })

  it('warns when a parent will defeat the backdrop blur', () => {
    const wrapper = document.createElement('div')
    document.body.appendChild(wrapper)
    wrapper.appendChild(activeElement)
    window.getComputedStyle = vi.fn((el) =>
      el === wrapper
        ? makeComputed({ overflowX: 'hidden', overflowY: 'hidden' })
        : makeComputed({ backdropFilter: 'blur(16px)' }),
    ) as typeof window.getComputedStyle

    const { getByRole } = renderPanel(activeElement)

    const alert = getByRole('alert')
    expect(alert.textContent).toContain('overflow')
    expect(alert.textContent).toContain('div')
    wrapper.remove()
  })

  it('shows no defeat warning when the blur will actually render', () => {
    // Blur on the bar itself, but every ancestor leaves the backdrop intact.
    window.getComputedStyle = vi.fn((el) =>
      el === activeElement
        ? makeComputed({ backdropFilter: 'blur(16px)' })
        : makeComputed(),
    ) as typeof window.getComputedStyle

    const { queryByRole } = renderPanel(activeElement)

    expect(queryByRole('alert')).toBeNull()
  })
})

describe('color + alpha helpers', () => {
  it('parses hex, rgb, rgba, and transparent into hex + 0–100 alpha', async () => {
    const { parseColor } = await import('./BackgroundPanel')
    expect(parseColor('#ff0000')).toEqual({ hex: '#ff0000', alpha: 100 })
    expect(parseColor('#f00')).toEqual({ hex: '#ff0000', alpha: 100 })
    expect(parseColor('rgb(0, 255, 0)')).toEqual({ hex: '#00ff00', alpha: 100 })
    expect(parseColor('rgba(0, 0, 255, 0.5)')).toEqual({
      hex: '#0000ff',
      alpha: 50,
    })
    expect(parseColor('transparent')).toEqual({ hex: '#000000', alpha: 0 })
  })

  it('composes hex + alpha back into a CSS color (hex, rgba, transparent)', async () => {
    const { toCssColor } = await import('./BackgroundPanel')
    expect(toCssColor('#ff0000', 100)).toBe('#ff0000')
    expect(toCssColor('#ff0000', 0)).toBe('transparent')
    expect(toCssColor('#0000ff', 50)).toBe('rgba(0, 0, 255, 0.50)')
  })
})

describe('backdrop-defeating ancestor detection', () => {
  it('flags each property that flattens the backdrop, and passes clean styles', async () => {
    const { backdropDefeatReason } = await import('./BackgroundPanel')
    expect(
      backdropDefeatReason(makeComputed({ transform: 'matrix(1,0,0,1,0,0)' })),
    ).toBe('transform')
    expect(backdropDefeatReason(makeComputed({ perspective: '800px' }))).toBe(
      'perspective',
    )
    expect(backdropDefeatReason(makeComputed({ filter: 'blur(2px)' }))).toBe(
      'filter',
    )
    expect(
      backdropDefeatReason(makeComputed({ backdropFilter: 'blur(4px)' })),
    ).toBe('backdrop-filter')
    expect(
      backdropDefeatReason(makeComputed({ willChange: 'transform' })),
    ).toBe('will-change')
    expect(backdropDefeatReason(makeComputed({ contain: 'paint' }))).toBe(
      'contain',
    )
    expect(backdropDefeatReason(makeComputed({ opacity: '0.5' }))).toBe(
      'opacity',
    )
    expect(backdropDefeatReason(makeComputed({ overflowY: 'auto' }))).toBe(
      'overflow',
    )
    // A plain, unclipped, untransformed ancestor does not defeat the blur.
    expect(
      backdropDefeatReason(
        makeComputed({
          opacity: '1',
          overflowX: 'visible',
          overflowY: 'visible',
        }),
      ),
    ).toBeNull()
  })

  it('returns the nearest defeating ancestor (transform), walking up from the element', async () => {
    const { findBackdropDefeatingAncestor } = await import('./BackgroundPanel')
    const wrapper = document.createElement('div')
    const inner = document.createElement('div')
    const el = document.createElement('div')
    inner.appendChild(el)
    wrapper.appendChild(inner)
    document.body.appendChild(wrapper)

    const orig = window.getComputedStyle
    window.getComputedStyle = vi.fn((node) =>
      node === wrapper
        ? makeComputed({ transform: 'translateZ(0)' })
        : makeComputed({ overflowX: 'visible', overflowY: 'visible' }),
    ) as typeof window.getComputedStyle

    const found = findBackdropDefeatingAncestor(el)
    expect(found?.element).toBe(wrapper)
    expect(found?.reason).toBe('transform')

    window.getComputedStyle = orig
    wrapper.remove()
  })

  it('returns null when every ancestor leaves the backdrop intact', async () => {
    const { findBackdropDefeatingAncestor } = await import('./BackgroundPanel')
    const wrapper = document.createElement('div')
    const el = document.createElement('div')
    wrapper.appendChild(el)
    document.body.appendChild(wrapper)

    const orig = window.getComputedStyle
    window.getComputedStyle = vi.fn(() =>
      makeComputed({
        overflowX: 'visible',
        overflowY: 'visible',
        opacity: '1',
      }),
    ) as typeof window.getComputedStyle

    expect(findBackdropDefeatingAncestor(el)).toBeNull()

    window.getComputedStyle = orig
    wrapper.remove()
  })
})
