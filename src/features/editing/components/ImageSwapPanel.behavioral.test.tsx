// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// jsdom lacks ResizeObserver / IntersectionObserver — provide stubs.
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

const searchStockImagesMock = vi.fn(
  async () =>
    [] as Array<{
      imageUrl: string
      source: 'pexels' | 'unsplash' | 'picsum'
      query: string
    }>,
)

let generateUploadUrlMock = vi.fn(async () => 'https://upload.test/url')
let saveUserImageMock = vi.fn(async () => undefined)
let userImagesValue:
  | Array<{
      url: string | null
      filename: string | null
    }>
  | undefined = undefined

const originalFetch = globalThis.fetch

vi.mock('@/lib/stock-image', () => ({
  searchStockImages: (...args: unknown[]) =>
    searchStockImagesMock(...(args as [])),
}))
vi.mock('convex/react', () => ({
  useMutation: (fn: unknown) => {
    if (fn === 'generateImageUploadUrl') return generateUploadUrlMock
    if (fn === 'saveUserImage') return saveUserImageMock
    return vi.fn(async () => undefined)
  },
  useQuery: () => userImagesValue,
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
vi.mock('@/lib/image-context', () => ({
  generateContextAwareQuery: vi.fn((alt: string) => alt),
}))

const { ImageSwapPanel } = await import('./ImageSwapPanel')

const makeResult = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    imageUrl: `https://stock.test/${i}.jpg`,
    source: 'pexels' as const,
    query: 'cats',
  }))

const renderPanel = (
  props?: Partial<{
    currentAlt: string
    onImageSelect: (url: string) => void
    sessionId: string
    imageWidth: number
    imageHeight: number
  }>,
) =>
  render(
    createElement(ImageSwapPanel, {
      currentAlt: '',
      onImageSelect: vi.fn(),
      sessionId: 'sess-1',
      ...props,
    }),
  )

describe('ImageSwapPanel (behavioral)', () => {
  beforeEach(() => {
    searchStockImagesMock.mockReset()
    generateUploadUrlMock = vi.fn(async () => 'https://upload.test/url')
    saveUserImageMock = vi.fn(async () => undefined)
    userImagesValue = undefined
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ storageId: 'storage-1' }),
    })) as unknown as typeof fetch
  })
  afterEach(() => {
    cleanup()
    globalThis.fetch = originalFetch
  })

  it('1. search input triggers stock image search → results grid appears', async () => {
    searchStockImagesMock.mockResolvedValue(makeResult(6))
    renderPanel({ currentAlt: '' })
    const input = screen.getByPlaceholderText('Search stock images...')
    fireEvent.change(input, { target: { value: 'cats' } })
    await waitFor(() => expect(searchStockImagesMock).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: /Select image /i }).length,
      ).toBe(6),
    )
  })

  it('2. search results render as a grid of images', async () => {
    searchStockImagesMock.mockResolvedValue(makeResult(9))
    renderPanel()
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'dogs' },
    })
    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: /Select image /i }).length,
      ).toBe(9),
    )
    // grid images present
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(9)
  })

  it('3. clicking an image selects it (calls onImageSelect with URL)', async () => {
    searchStockImagesMock.mockResolvedValue(makeResult(3))
    const onImageSelect = vi.fn()
    renderPanel({ onImageSelect })
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'cats' },
    })
    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: /Select image /i }).length,
      ).toBe(3),
    )
    fireEvent.click(
      screen.getAllByRole('button', { name: /Select image /i })[0],
    )
    expect(onImageSelect).toHaveBeenCalledWith('https://stock.test/0.jpg')
  })

  it('4. selecting an image calls onApply/onImageSelect with selected image URL', async () => {
    // The panel applies immediately on click (no separate Apply button);
    // onImageSelect is the apply callback.
    searchStockImagesMock.mockResolvedValue(makeResult(2))
    const onImageSelect = vi.fn()
    renderPanel({ onImageSelect })
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'cats' },
    })
    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: /Select image /i }).length,
      ).toBe(2),
    )
    fireEvent.click(
      screen.getAllByRole('button', { name: /Select image /i })[1],
    )
    expect(onImageSelect).toHaveBeenCalledWith('https://stock.test/1.jpg')
  })

  it('5. upload area accepts drag-and-drop (drop event with file)', async () => {
    searchStockImagesMock.mockResolvedValue([])
    const file = new File(['data'], 'pic.png', { type: 'image/png' })
    const { container } = renderPanel()
    const dropZone = container.firstChild as HTMLElement
    const dropEvent = new Event('drop', { bubbles: true })
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { files: [file], types: ['Files'] },
    })
    fireEvent(dropZone, dropEvent)
    await waitFor(() => expect(generateUploadUrlMock).toHaveBeenCalled())
    await waitFor(() => expect(saveUserImageMock).toHaveBeenCalled())
  })

  it('6. upload area accepts file input click', async () => {
    searchStockImagesMock.mockResolvedValue([])
    const file = new File(['data'], 'pic.png', { type: 'image/png' })
    const { container } = renderPanel()
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() => expect(generateUploadUrlMock).toHaveBeenCalled())
    await waitFor(() => expect(saveUserImageMock).toHaveBeenCalled())
  })

  it('7. file validation: rejects non-image types and files >8MB', async () => {
    searchStockImagesMock.mockResolvedValue([])
    const { container } = renderPanel()
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    // non-image type
    const textFile = new File(['data'], 'note.txt', { type: 'text/plain' })
    fireEvent.change(fileInput, { target: { files: [textFile] } })
    await waitFor(() =>
      expect(screen.getByText(/Unsupported file type/i)).toBeTruthy(),
    )

    // >8MB image
    cleanup()
    const { container: c2 } = renderPanel()
    const fileInput2 = c2.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    const big = new File([new Uint8Array(8 * 1024 * 1024 + 1)], 'big.png', {
      type: 'image/png',
    })
    Object.defineProperty(big, 'size', {
      value: 8 * 1024 * 1024 + 1,
      configurable: true,
    })
    fireEvent.change(fileInput2, { target: { files: [big] } })
    await waitFor(() =>
      expect(screen.getByText(/File too large/i)).toBeTruthy(),
    )
    expect(generateUploadUrlMock).not.toHaveBeenCalled()
  })

  it('8. uploaded images appear first in grid, before stock images', async () => {
    searchStockImagesMock.mockResolvedValue(makeResult(3))
    userImagesValue = [
      { url: 'https://upload.test/u1.png', filename: 'u1.png' },
    ]
    renderPanel()
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'cats' },
    })
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /Select /i }).length).toBe(
        4,
      ),
    )
    const buttons = screen.getAllByRole('button', { name: /Select /i })
    expect(buttons[0].getAttribute('aria-label')).toBe(
      'Select uploaded image 1',
    )
    expect(buttons[1].getAttribute('aria-label')).toBe('Select image 1')
  })

  it('9. loading state shows during search', async () => {
    let resolveSearch: (v: ReturnType<typeof makeResult>) => void = () => {}
    searchStockImagesMock.mockReturnValue(
      new Promise((r) => {
        resolveSearch = r
      }),
    )
    renderPanel()
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'cats' },
    })
    await waitFor(() =>
      expect(document.querySelector('.animate-pulse')).not.toBeNull(),
    )
    resolveSearch(makeResult(2))
  })

  it('10. empty state when no results', async () => {
    searchStockImagesMock.mockResolvedValue([])
    renderPanel()
    fireEvent.change(screen.getByPlaceholderText('Search stock images...'), {
      target: { value: 'zzz' },
    })
    await waitFor(() =>
      expect(screen.getByText(/No results found/i)).toBeTruthy(),
    )
  })
})
