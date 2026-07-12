// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock the lakebed hooks before importing the module under test.
const mockUseOptionalSessionState = vi.hoisted(() =>
  vi.fn<
    (capsule: string) => {
      auth: unknown
      canWrite: boolean
      data: Record<string, unknown> | null
    }
  >(() => ({ auth: null, canWrite: false, data: null })),
)

vi.mock('@ship-fast/lakebed/react', () => ({
  useOptionalSessionState: mockUseOptionalSessionState,
}))

vi.mock('@ship-fast/lakebed/server', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@ship-fast/lakebed/server')>()
  return {
    ...actual,
    // Keep real exports for the capsule registry to load, but the hook
    // under test only uses useOptionalSessionState (mocked in the react module).
  }
})

import { useCapsulePropResolver } from './useCapsulePropResolver'

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeCapsuleElement(
  capsuleName: string,
  statementId: string,
  innerHTML: string,
): HTMLElement {
  const root = document.createElement('div')
  root.setAttribute('data-openui-component', capsuleName)
  root.setAttribute('data-openui-var', statementId)
  root.innerHTML = innerHTML
  document.body.appendChild(root)
  return root
}

function removeCapsule(el: HTMLElement) {
  el.remove()
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useCapsulePropResolver', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    mockUseOptionalSessionState.mockReturnValue({
      auth: null,
      canWrite: true,
      data: null,
    })
  })

  describe('setActiveElement', () => {
    it('sets the capsule key when element is inside a capsule', () => {
      const capsule = makeCapsuleElement(
        'CoworkingHero',
        'home_hero',
        '<h1>Hello</h1>',
      )
      const h1 = capsule.querySelector('h1')!

      const { result } = renderHook(() => useCapsulePropResolver())

      act(() => {
        result.current.setActiveElement(h1 as HTMLElement)
      })

      expect(result.current.capsuleKey).toBe('CoworkingHero:home_hero')
      removeCapsule(capsule)
    })

    it('clears the capsule key when element is null', () => {
      const { result } = renderHook(() => useCapsulePropResolver())

      act(() => {
        result.current.setActiveElement(null)
      })

      expect(result.current.capsuleKey).toBeNull()
    })

    it('clears the capsule key when element is outside a capsule', () => {
      const div = document.createElement('div')
      div.innerHTML = '<p>No capsule here</p>'
      document.body.appendChild(div)
      const p = div.querySelector('p')!

      const { result } = renderHook(() => useCapsulePropResolver())

      act(() => {
        result.current.setActiveElement(p as HTMLElement)
      })

      expect(result.current.capsuleKey).toBeNull()
      div.remove()
    })

    it('ignores the Stack capsule (page root)', () => {
      const stack = makeCapsuleElement('Stack', 'page_root', '<h1>Page</h1>')
      const h1 = stack.querySelector('h1')!

      const { result } = renderHook(() => useCapsulePropResolver())

      act(() => {
        result.current.setActiveElement(h1 as HTMLElement)
      })

      expect(result.current.capsuleKey).toBeNull()
      removeCapsule(stack)
    })

    it('ignores Navbar capsules (excluded from realtime editing)', () => {
      const navbar = makeCapsuleElement(
        'CoworkingNavbar',
        'home_nav',
        '<a>Home</a>',
      )
      const link = navbar.querySelector('a')!

      const { result } = renderHook(() => useCapsulePropResolver())

      act(() => {
        result.current.setActiveElement(link as HTMLElement)
      })

      expect(result.current.capsuleKey).toBeNull()
      removeCapsule(navbar)
    })

    it('ignores Footer capsules (excluded from realtime editing)', () => {
      const footer = makeCapsuleElement(
        'CoworkingFooter',
        'home_footer',
        '<p>Copyright</p>',
      )
      const p = footer.querySelector('p')!

      const { result } = renderHook(() => useCapsulePropResolver())

      act(() => {
        result.current.setActiveElement(p as HTMLElement)
      })

      expect(result.current.capsuleKey).toBeNull()
      removeCapsule(footer)
    })
  })

  describe('resolveProp', () => {
    it('resolves a scalar prop when element text matches a prop value', () => {
      mockUseOptionalSessionState.mockReturnValue({
        auth: null,
        canWrite: true,
        data: { heading: 'Work Your Way' },
      })

      const capsule = makeCapsuleElement(
        'CoworkingHero',
        'home_hero',
        '<h1>Work Your Way</h1>',
      )
      const h1 = capsule.querySelector('h1')!

      const { result } = renderHook(() => useCapsulePropResolver())

      act(() => {
        result.current.setActiveElement(h1 as HTMLElement)
      })

      let resolved: ReturnType<typeof result.current.resolveProp> | null = null
      act(() => {
        resolved = result.current.resolveProp(h1 as HTMLElement)
      })

      expect(resolved).toEqual({
        lakebedKey: 'CoworkingHero:home_hero',
        capsuleName: 'CoworkingHero',
        statementId: 'home_hero',
        propKey: 'heading',
        kind: 'scalar',
      })
      removeCapsule(capsule)
    })

    it('resolves a collection item field when element text matches', () => {
      mockUseOptionalSessionState.mockReturnValue({
        auth: null,
        canWrite: true,
        data: {
          features: [
            { title: 'Private Offices', description: 'Lockable rooms' },
            { title: 'Hot Desks', description: 'Pick any desk' },
          ],
        },
      })

      const capsule = makeCapsuleElement(
        'CoworkingFeatures',
        'home_features',
        '<h3>Hot Desks</h3>',
      )
      const h3 = capsule.querySelector('h3')!

      const { result } = renderHook(() => useCapsulePropResolver())

      act(() => {
        result.current.setActiveElement(h3 as HTMLElement)
      })

      let resolved: ReturnType<typeof result.current.resolveProp> | null = null
      act(() => {
        resolved = result.current.resolveProp(h3 as HTMLElement)
      })

      expect(resolved).toEqual({
        lakebedKey: 'CoworkingFeatures:home_features',
        capsuleName: 'CoworkingFeatures',
        statementId: 'home_features',
        propKey: 'features',
        index: 1,
        fieldKey: 'title',
        kind: 'collection',
      })
      removeCapsule(capsule)
    })

    it('returns null when no prop matches the element text', () => {
      mockUseOptionalSessionState.mockReturnValue({
        auth: null,
        canWrite: true,
        data: { heading: 'Work Your Way' },
      })

      const capsule = makeCapsuleElement(
        'CoworkingHero',
        'home_hero',
        '<p>Random text</p>',
      )
      const p = capsule.querySelector('p')!

      const { result } = renderHook(() => useCapsulePropResolver())

      act(() => {
        result.current.setActiveElement(p as HTMLElement)
      })

      let resolved: ReturnType<typeof result.current.resolveProp> | null = null
      act(() => {
        resolved = result.current.resolveProp(p as HTMLElement)
      })

      expect(resolved).toBeNull()
      removeCapsule(capsule)
    })

    it('returns null when no capsule is active', () => {
      const div = document.createElement('div')
      div.innerHTML = '<p>Outside capsule</p>'
      document.body.appendChild(div)
      const p = div.querySelector('p')!

      const { result } = renderHook(() => useCapsulePropResolver())

      act(() => {
        result.current.setActiveElement(p as HTMLElement)
      })

      let resolved: ReturnType<typeof result.current.resolveProp> | null = null
      act(() => {
        resolved = result.current.resolveProp(p as HTMLElement)
      })

      expect(resolved).toBeNull()
      div.remove()
    })

    it('returns null when capsule data is null', () => {
      mockUseOptionalSessionState.mockReturnValue({
        auth: null,
        canWrite: false,
        data: null,
      })

      const capsule = makeCapsuleElement(
        'CoworkingHero',
        'home_hero',
        '<h1>Hello</h1>',
      )
      const h1 = capsule.querySelector('h1')!

      const { result } = renderHook(() => useCapsulePropResolver())

      act(() => {
        result.current.setActiveElement(h1 as HTMLElement)
      })

      let resolved: ReturnType<typeof result.current.resolveProp> | null = null
      act(() => {
        resolved = result.current.resolveProp(h1 as HTMLElement)
      })

      expect(resolved).toBeNull()
      removeCapsule(capsule)
    })
  })

  describe('getPatch', () => {
    it('builds a scalar patch', () => {
      mockUseOptionalSessionState.mockReturnValue({
        auth: null,
        canWrite: true,
        data: { heading: 'Old Heading' },
      })

      const { result } = renderHook(() => useCapsulePropResolver())

      let patch: Record<string, unknown> = {}
      act(() => {
        patch = result.current.getPatch(
          {
            lakebedKey: 'CoworkingHero:home_hero',
            capsuleName: 'CoworkingHero',
            statementId: 'home_hero',
            propKey: 'heading',
            kind: 'scalar',
          },
          'New Heading',
        )
      })

      expect(patch).toEqual({ heading: 'New Heading' })
    })

    it('builds a collection item patch preserving other items', () => {
      mockUseOptionalSessionState.mockReturnValue({
        auth: null,
        canWrite: true,
        data: {
          features: [
            { title: 'Private Offices', description: 'Lockable rooms' },
            { title: 'Hot Desks', description: 'Pick any desk' },
          ],
        },
      })

      const { result } = renderHook(() => useCapsulePropResolver())

      let patch: Record<string, unknown> = {}
      act(() => {
        patch = result.current.getPatch(
          {
            lakebedKey: 'CoworkingFeatures:home_features',
            capsuleName: 'CoworkingFeatures',
            statementId: 'home_features',
            propKey: 'features',
            index: 1,
            fieldKey: 'title',
            kind: 'collection',
          },
          'Shared Desks',
        )
      })

      expect(patch).toEqual({
        features: [
          { title: 'Private Offices', description: 'Lockable rooms' },
          { title: 'Shared Desks', description: 'Pick any desk' },
        ],
      })
    })

    it('returns empty patch when capsule data is null', () => {
      mockUseOptionalSessionState.mockReturnValue({
        auth: null,
        canWrite: false,
        data: null,
      })

      const { result } = renderHook(() => useCapsulePropResolver())

      let patch: Record<string, unknown> = {}
      act(() => {
        patch = result.current.getPatch(
          {
            lakebedKey: 'CoworkingHero:home_hero',
            capsuleName: 'CoworkingHero',
            statementId: 'home_hero',
            propKey: 'heading',
            kind: 'scalar',
          },
          'New Heading',
        )
      })

      expect(patch).toEqual({})
    })
  })
})
