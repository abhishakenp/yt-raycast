// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react'
import type { PointerEventHandler, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

interface RouterLinkProps {
  children: ReactNode
  onPointerEnter?: PointerEventHandler<HTMLAnchorElement>
  onPointerLeave?: PointerEventHandler<HTMLAnchorElement>
  params?: { sessionId?: string }
  to?: string
}

const deleteMine = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-router', async () => {
  const React = await import('react')
  function RouterLink({
    children,
    onPointerEnter,
    onPointerLeave,
    params,
    to,
  }: RouterLinkProps) {
    return React.createElement(
      'a',
      {
        href:
          to === '/generate/$sessionId/$' && params?.sessionId
            ? `/generate/${params.sessionId}`
            : to,
        onPointerOver: onPointerEnter,
        onPointerOut: onPointerLeave,
      },
      children,
    )
  }
  return {
    Link: RouterLink,
  }
})

vi.mock('convex/react', () => ({ useMutation: () => deleteMine }))

vi.mock('../../../../convex/_generated/api', () => ({
  api: { sessions: { deleteMine: 'deleteMine' } },
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined, isPending: true }),
}))

vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: () => null,
}))

import { GalleryGrid, type GalleryPayload } from './PublicGallery'

interface DeferredDelete {
  promise: Promise<{ deleted: number }>
  resolve: (result: { deleted: number }) => void
}

const gallery: GalleryPayload = {
  availableCategories: [],
  hasNext: false,
  hasPrev: false,
  items: [
    {
      prompt: 'Destructive project',
      sessionId: 'destructive-session',
    },
  ],
  limit: 12,
  page: 1,
  total: 1,
  totalPages: 1,
}

function deferredDelete(): DeferredDelete {
  function unresolvedDelete(_result: { deleted: number }) {}
  let resolvePromise = unresolvedDelete
  const promise = new Promise<{ deleted: number }>((resolve) => {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

function hoverProject(view: ReturnType<typeof render>): void {
  const card = view.getByText('Destructive project').closest('a')
  if (!card) throw new Error('Missing destructive gallery card')
  card.dispatchEvent(
    new window.Event('pointerover', { bubbles: true, cancelable: true }),
  )
}

describe('PublicGallery destructive release boundaries', () => {
  beforeEach(() => {
    deleteMine.mockReset()
    deleteMine.mockResolvedValue({ deleted: 1 })
    window.localStorage.clear()
    window.localStorage.setItem(
      'ship-fast-anon-client-id',
      'anon-destructive-release',
    )
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 404 })),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('coalesces repeated delete shortcuts while deletion is pending', async () => {
    const pendingDelete = deferredDelete()
    deleteMine.mockReturnValue(pendingDelete.promise)
    const view = render(<GalleryGrid gallery={gallery} />)
    hoverProject(view)

    fireEvent.keyDown(window, { key: 'd' })
    fireEvent.keyDown(window, { key: 'd' })
    pendingDelete.resolve({ deleted: 1 })
    await waitFor(() =>
      expect(view.queryByText('Destructive project')).toBeNull(),
    )

    expect(deleteMine).toHaveBeenCalledTimes(1)
  })

  it('announces deletion failures and leaves the project visible', async () => {
    deleteMine.mockRejectedValue(new Error('Delete unavailable'))
    const view = render(<GalleryGrid gallery={gallery} />)
    hoverProject(view)

    fireEvent.keyDown(window, { key: 'd' })
    await waitFor(() => expect(deleteMine).toHaveBeenCalledTimes(1))

    expect(view.getByText('Destructive project')).toBeTruthy()
    expect(view.getByRole('alert').textContent).toContain('Delete unavailable')
  })

  it('ignores key-repeat delete events', async () => {
    const view = render(<GalleryGrid gallery={gallery} />)
    hoverProject(view)

    fireEvent.keyDown(window, { key: 'd', repeat: true })
    await act(async () => Promise.resolve())

    expect(deleteMine).not.toHaveBeenCalled()
  })

  it('ignores modified delete shortcuts reserved by the browser', async () => {
    const view = render(<GalleryGrid gallery={gallery} />)
    hoverProject(view)

    fireEvent.keyDown(window, { ctrlKey: true, key: 'd' })
    await act(async () => Promise.resolve())

    expect(deleteMine).not.toHaveBeenCalled()
  })
})
