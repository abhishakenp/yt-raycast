// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

interface BrandPage {
  continueCursor: string | null
  isDone: boolean
  results: Array<{
    brandId: string | null
    domain: string | null
    icon: string | null
    id: string
    logo: string | null
    name: string
    verified: boolean
  }>
}

interface BrandTestState {
  generateUploadUrl: ReturnType<typeof vi.fn>
  saveUserImage: ReturnType<typeof vi.fn>
  search: ReturnType<typeof vi.fn>
}

const brandState = vi.hoisted<BrandTestState>(() => ({
  generateUploadUrl: vi.fn(),
  saveUserImage: vi.fn(async () => undefined),
  search: vi.fn(),
}))

vi.mock('convex/react', () => ({
  useAction: () => brandState.search,
  useMutation(reference: unknown) {
    return reference === 'generateImageUploadUrl'
      ? brandState.generateUploadUrl
      : brandState.saveUserImage
  },
  useQuery: () => [],
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    brandfetch: { search: 'brandfetchSearch' },
    sessions: {
      generateImageUploadUrl: 'generateImageUploadUrl',
      listUserImages: 'listUserImages',
      saveUserImage: 'saveUserImage',
    },
  },
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => 'brand-owner-secret',
}))

import { BrandMediaPanel } from './BrandMediaPanel'

interface DeferredString {
  promise: Promise<string>
  resolve: (value: string) => void
}

interface DeferredPage {
  promise: Promise<BrandPage>
  resolve: (page: BrandPage) => void
}

function emptyPage(): BrandPage {
  return {
    continueCursor: null,
    isDone: true,
    results: [],
  }
}

function pageWithBrand(id: string, name: string): BrandPage {
  return {
    continueCursor: null,
    isDone: true,
    results: [
      {
        brandId: id,
        domain: `${id}.example`,
        icon: null,
        id,
        logo: null,
        name,
        verified: true,
      },
    ],
  }
}

function unresolvedString(_value: string) {}

function deferredString(): DeferredString {
  let resolvePromise = unresolvedString
  const promise = new Promise<string>((resolve) => {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

function unresolvedPage(_page: BrandPage) {}

function deferredPage(): DeferredPage {
  let resolvePromise = unresolvedPage
  const promise = new Promise<BrandPage>((resolve) => {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

function uploadResponse(storageId: string): Response {
  return new Response(JSON.stringify({ storageId }), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  })
}

function fileInputFrom(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]')
  if (!input) throw new Error('Missing brand media file input')
  return input
}

describe('BrandMediaPanel release boundaries', () => {
  beforeEach(() => {
    brandState.generateUploadUrl.mockReset()
    brandState.generateUploadUrl.mockResolvedValue('https://upload.test/image')
    brandState.saveUserImage.mockReset()
    brandState.saveUserImage.mockResolvedValue(undefined)
    brandState.search.mockReset()
    brandState.search.mockResolvedValue(emptyPage())
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        disconnect() {}
        observe() {}
        unobserve() {}
      },
    )
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => uploadResponse('storage-release')),
    )
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('keeps upload controls busy until every selected file finishes', async () => {
    const secondUploadUrl = deferredString()
    brandState.generateUploadUrl
      .mockResolvedValueOnce('https://upload.test/first')
      .mockReturnValueOnce(secondUploadUrl.promise)
    const view = render(<BrandMediaPanel sessionId="brand-release" prompt="" />)
    const uploadButton = view.getByRole('button', {
      name: 'Upload custom image',
    })
    const first = new File(['first'], 'first.png', { type: 'image/png' })
    const second = new File(['second'], 'second.png', { type: 'image/png' })

    fireEvent.change(fileInputFrom(view.container), {
      target: { files: [first, second] },
    })
    await waitFor(() =>
      expect(brandState.generateUploadUrl).toHaveBeenCalledTimes(2),
    )
    await waitFor(() =>
      expect(brandState.saveUserImage).toHaveBeenCalledTimes(1),
    )
    const disabledWhileSecondFilePending = uploadButton.hasAttribute('disabled')
    secondUploadUrl.resolve('https://upload.test/second')
    await waitFor(() =>
      expect(brandState.saveUserImage).toHaveBeenCalledTimes(2),
    )

    expect(disabledWhileSecondFilePending).toBe(true)
  })

  it('announces upload failures to assistive technology', async () => {
    brandState.generateUploadUrl.mockRejectedValue(
      new Error('Storage unavailable'),
    )
    const view = render(<BrandMediaPanel sessionId="brand-release" prompt="" />)
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })

    fireEvent.change(fileInputFrom(view.container), {
      target: { files: [file] },
    })
    await waitFor(() =>
      expect(view.getByText('Storage unavailable')).toBeTruthy(),
    )

    expect(view.getByRole('alert').textContent).toContain('Storage unavailable')
  })

  it('announces Brandfetch lookup failures to assistive technology', async () => {
    brandState.search.mockRejectedValue(new Error('Brandfetch unavailable'))
    const view = render(
      <BrandMediaPanel sessionId="brand-release" prompt="linear" />,
    )

    await waitFor(() =>
      expect(view.getByText('Brandfetch unavailable')).toBeTruthy(),
    )

    expect(view.getByRole('alert').textContent).toContain(
      'Brandfetch unavailable',
    )
  })

  it('ignores a stale Brandfetch response after the query changes', async () => {
    vi.useFakeTimers()
    const stalePage = deferredPage()
    const currentPage = deferredPage()
    brandState.search
      .mockReturnValueOnce(stalePage.promise)
      .mockReturnValueOnce(currentPage.promise)
    const view = render(
      <BrandMediaPanel sessionId="brand-release" prompt="old brand" />,
    )

    await act(async () => vi.advanceTimersByTimeAsync(300))
    fireEvent.change(view.getByPlaceholderText('Search brands or domains...'), {
      target: { value: 'new brand' },
    })
    await act(async () => vi.advanceTimersByTimeAsync(300))
    currentPage.resolve(pageWithBrand('new', 'New Brand'))
    await act(async () => Promise.resolve())
    stalePage.resolve(pageWithBrand('old', 'Old Brand'))
    await act(async () => Promise.resolve())

    expect(view.getByText('New Brand')).toBeTruthy()
    expect(view.queryByText('Old Brand')).toBeNull()
  })
})
