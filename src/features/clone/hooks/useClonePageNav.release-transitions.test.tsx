// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

interface CloneRow {
  byteLength: number
  failed: boolean
  html?: string
  isHome: boolean
  order: number
  pathname: string
  title: string
}

interface CloneTransitionState {
  rowsByLookup: Record<string, CloneRow[]>
}

interface CloneHookProps {
  sessionId: string | undefined
}

const cloneState = vi.hoisted<CloneTransitionState>(() => ({
  rowsByLookup: {},
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      getCloneHomePreview: 'getCloneHomePreview',
      listClonePages: 'listClonePages',
    },
  },
}))

vi.mock('convex/react', () => ({
  useQuery(reference: unknown, args: unknown) {
    if (args === 'skip' || !args || typeof args !== 'object') return undefined
    if (!('lookup' in args) || typeof args.lookup !== 'string') return undefined
    if (reference === 'listClonePages') {
      return cloneState.rowsByLookup[args.lookup] ?? []
    }
    if (reference === 'getCloneHomePreview') {
      const pathname =
        'pathname' in args && typeof args.pathname === 'string'
          ? args.pathname
          : '/'
      const row = (cloneState.rowsByLookup[args.lookup] ?? []).find(
        (candidate) => candidate.pathname === pathname,
      )
      return row ? { html: row.html ?? null, url: null, version: 1 } : null
    }
    return undefined
  },
}))

import { useClonePageNav } from './useClonePageNav'

function cloneRow(pathname: string, html: string, isHome: boolean): CloneRow {
  return {
    byteLength: html.length,
    failed: false,
    html,
    isHome,
    order: isHome ? 0 : 1,
    pathname,
    title: pathname,
  }
}

describe('useClonePageNav release transitions', () => {
  beforeEach(() => {
    cloneState.rowsByLookup = {
      first: [
        cloneRow('/first-home', '<main>First home</main>', true),
        cloneRow('/first-about', '<main>First about</main>', false),
      ],
      second: [cloneRow('/second-home', '<main>Second home</main>', true)],
    }
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('resets clone navigation to the new home when the route session changes', () => {
    const hook = renderHook(({ sessionId }) => useClonePageNav(sessionId), {
      initialProps: { sessionId: 'first' },
    })

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { path: '/first-about', type: 'ship-clone-nav' },
        }),
      )
    })
    expect(hook.result.current.currentPath).toBe('/first-about')

    hook.rerender({ sessionId: 'second' })

    expect(hook.result.current.currentPath).toBe('/second-home')
    expect(hook.result.current.currentHtml).toBe('<main>Second home</main>')
  })

  it('clears the active clone path when the route no longer has a session', () => {
    const initialProps: CloneHookProps = { sessionId: 'first' }
    const hook = renderHook(({ sessionId }) => useClonePageNav(sessionId), {
      initialProps,
    })
    expect(hook.result.current.currentPath).toBe('/first-home')

    hook.rerender({ sessionId: undefined })

    expect(hook.result.current.isClone).toBe(false)
    expect(hook.result.current.currentPath).toBe('')
    expect(hook.result.current.currentHtml).toBeNull()
  })

  it('removes its message listener when the clone shell unmounts', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener')
    const hook = renderHook(() => useClonePageNav('first'))

    hook.unmount()

    expect(removeListener).toHaveBeenCalledWith('message', expect.any(Function))
  })
})
