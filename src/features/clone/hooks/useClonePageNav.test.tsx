// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useClonePageNav } from './useClonePageNav'

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      listClonePages: { __name: 'sessions:listClonePages' },
      getCloneHomePreview: { __name: 'sessions:getCloneHomePreview' },
    },
  },
}))

type CloneHookState = {
  queryArgs: unknown[]
  rows: Array<{
    pathname: string
    title?: string
    html?: string
    storageId?: string
    isHome: boolean
    failed: boolean
    order: number
    byteLength: number
    truncated?: boolean
  }>
  previews: Record<
    string,
    {
      html: string | null
      url: string | null
      version: number
    }
  >
}

const realTvnlStorageBackedHomePage = {
  pathname: '/',
  title: 'TVNL - Tenughat Vidyut Nigam Limited',
  storageId: 'kg25mwjnzgn17b1x42xbf6cbkn89a6hq',
  isHome: true,
  failed: false,
  order: 0,
  byteLength: 1_367_123,
  truncated: false,
}

function getState(): CloneHookState {
  const testGlobal = globalThis as typeof globalThis & {
    __shipFastCloneHookState?: CloneHookState
  }
  testGlobal.__shipFastCloneHookState ??= {
    queryArgs: [],
    rows: [],
    previews: {},
  }
  return testGlobal.__shipFastCloneHookState
}

vi.mock('convex/react', () => ({
  useQuery: (query, args) => {
    const state = getState()
    state.queryArgs.push(args)
    if (args === 'skip') return undefined
    if (
      query &&
      typeof query === 'object' &&
      '__name' in query &&
      query.__name === 'sessions:listClonePages'
    ) {
      return state.rows
    }
    if (args && typeof args === 'object' && 'lookup' in args) {
      const pathname =
        'pathname' in args && typeof args.pathname === 'string'
          ? args.pathname
          : '/'
      return state.previews[pathname] ?? null
    }
    return undefined
  },
}))

describe('useClonePageNav', () => {
  afterEach(() => {
    getState().rows = []
    getState().previews = {}
    getState().queryArgs = []
    vi.restoreAllMocks()
  })

  it('passes route params as clone lookups instead of Convex session ids', () => {
    renderHook(() => useClonePageNav('test-language-popover'))

    expect(getState().queryArgs).toContainEqual({
      lookup: 'test-language-popover',
    })
    expect(getState().queryArgs).not.toContainEqual({
      sessionId: 'test-language-popover',
    })
  })

  it('returns a storage URL for a large clone home page', () => {
    getState().rows = [
      {
        pathname: '/',
        title: 'TVNL',
        storageId: 'stored_tvnl_home',
        isHome: true,
        failed: false,
        order: 0,
        byteLength: 1_367_703,
      },
    ]
    getState().previews['/'] = {
      html: null,
      url: 'https://storage.test/stored_tvnl_home',
      version: 3,
    }

    const { result } = renderHook(() => useClonePageNav('session-tvnl'))

    expect(result.current.isClone).toBe(true)
    expect(result.current.currentHtml).toBeNull()
    expect(result.current.currentUrl).toBe(
      'https://storage.test/stored_tvnl_home',
    )
    expect(result.current.pages[0]).toMatchObject({
      pathname: '/',
      storageId: 'stored_tvnl_home',
      byteLength: 1_367_703,
    })
  })

  it('keeps a real storage-backed TVNL clone home page inside the clone shell', () => {
    getState().rows = [realTvnlStorageBackedHomePage]
    getState().previews['/'] = {
      html: null,
      url: 'https://storage.test/kg25mwjnzgn17b1x42xbf6cbkn89a6hq',
      version: 1,
    }

    const { result } = renderHook(() =>
      useClonePageNav('k572681p1rzad6rekf97pkqrhn89b6zt'),
    )

    expect(result.current).toMatchObject({
      currentHtml: null,
      currentPath: '/',
      currentUrl: 'https://storage.test/kg25mwjnzgn17b1x42xbf6cbkn89a6hq',
      isClone: true,
    })
    expect(result.current.pages).toEqual([
      {
        byteLength: 1_367_123,
        failed: false,
        isHome: true,
        pathname: '/',
        storageId: 'kg25mwjnzgn17b1x42xbf6cbkn89a6hq',
        title: 'TVNL - Tenughat Vidyut Nigam Limited',
        truncated: false,
      },
    ])
  })

  it('ignores malformed clone page rows and keeps valid captured pages renderable', () => {
    getState().rows = [
      null,
      { pathname: null, isHome: true, failed: false },
      {
        pathname: '/valid',
        title: 'Valid captured page',
        html: '<main>Valid clone page</main>',
        isHome: true,
        failed: false,
        order: 0,
        byteLength: 512,
      },
    ] as unknown as CloneHookState['rows']

    expect(() =>
      renderHook(() => useClonePageNav('session-malformed')),
    ).not.toThrow()

    const { result } = renderHook(() => useClonePageNav('session-malformed'))

    expect(result.current).toMatchObject({
      currentHtml: '<main>Valid clone page</main>',
      currentPath: '/valid',
      isClone: true,
    })
    expect(result.current.pages).toEqual([
      expect.objectContaining({
        pathname: '/valid',
        title: 'Valid captured page',
      }),
    ])
  })

  it('navigates captured clone paths without opening the source site', () => {
    getState().rows = [
      {
        pathname: '/',
        title: 'TVNL',
        storageId: 'stored_tvnl_home',
        isHome: true,
        failed: false,
        order: 0,
        byteLength: 1_367_703,
      },
      {
        pathname: '/career',
        title: 'Career',
        storageId: 'stored_tvnl_career',
        isHome: false,
        failed: false,
        order: 1,
        byteLength: 1_100_000,
      },
    ]
    getState().previews['/'] = {
      html: null,
      url: 'https://storage.test/stored_tvnl_home',
      version: 3,
    }
    getState().previews['/career'] = {
      html: null,
      url: 'https://storage.test/stored_tvnl_career',
      version: 3,
    }
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)

    const { result } = renderHook(() => useClonePageNav('session-tvnl'))

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'ship-clone-nav',
            path: '/career',
            abs: 'https://tvnl.in/career',
          },
        }),
      )
    })

    expect(result.current.currentPath).toBe('/career')
    expect(result.current.currentUrl).toBe(
      'https://storage.test/stored_tvnl_career',
    )
    expect(open).not.toHaveBeenCalled()
  })

  it('keeps uncaptured source links inside the clone shell', () => {
    getState().rows = [
      {
        pathname: '/',
        title: 'TVNL',
        storageId: 'stored_tvnl_home',
        isHome: true,
        failed: false,
        order: 0,
        byteLength: 1_367_703,
      },
    ]
    getState().previews['/'] = {
      html: null,
      url: 'https://storage.test/stored_tvnl_home',
      version: 3,
    }
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)

    const { result } = renderHook(() => useClonePageNav('session-tvnl'))

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'ship-clone-nav',
            path: '/uncrawled',
            abs: 'https://tvnl.in/uncrawled',
          },
        }),
      )
    })

    expect(result.current.currentPath).toBe('/')
    expect(result.current.currentUrl).toBe(
      'https://storage.test/stored_tvnl_home',
    )
    expect(open).not.toHaveBeenCalled()
  })
})
