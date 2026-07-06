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

const renderPanel = (
  activeElement: HTMLElement | null,
  props: Partial<ComponentProps<typeof BackgroundPanel>> = {},
) =>
  render(
    createElement(BackgroundPanel, { activeElement, onModified, ...props }),
  )

const makeComputed = (
  overrides: Partial<Record<string, string>> = {},
): CSSStyleDeclaration =>
  ({
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
  }) as unknown as CSSStyleDeclaration

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
})
