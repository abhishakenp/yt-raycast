// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Dashboard } from './Dashboard'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: ReactNode; to?: string }) => (
    <a href={to ?? '#'} {...props}>
      {children}
    </a>
  ),
  useCanGoBack: () => false,
  useNavigate: () => vi.fn(),
  useRouter: () => ({
    history: { back: vi.fn() },
    state: { location: { pathname: '/' } },
  }),
}))

type DashboardConvexTestState = {
  generationView: unknown
  queryArgs: unknown[]
  mutationCalls: Array<{ mutation: unknown; args: unknown }>
}

function getConvexState(): DashboardConvexTestState {
  const testGlobal = globalThis as typeof globalThis & {
    __shipFastDashboardConvexState?: DashboardConvexTestState
  }
  testGlobal.__shipFastDashboardConvexState ??= {
    generationView: null,
    queryArgs: [],
    mutationCalls: [],
  }
  return testGlobal.__shipFastDashboardConvexState
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  }
}

const ensureWindowStorage = () => {
  try {
    void window.localStorage.length
  } catch {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
  }
  try {
    void window.sessionStorage.length
  } catch {
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
  }
}

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: ReactNode
    to: string
    [key: string]: unknown
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useCanGoBack: () => false,
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useRouter: () => ({
    history: { back: vi.fn() },
    state: { location: { pathname: '/' } },
  }),
}))

vi.mock('@clerk/tanstack-react-start', () => ({
  useAuth: () => ({
    isSignedIn: false,
    userId: null,
    getToken: async () => null,
  }),
  useClerk: () => ({ session: null, user: null }),
}))

// Dashboard unit tests pre-date the SignInGate rail gating. Keep the gate a
// no-op here so rail popovers open as before; gated behavior is covered by
// SignInGate.test.tsx.
vi.mock('@/shared/auth/clerk-runtime', () => ({
  isClerkClientEnabled: () => false,
}))

vi.mock('convex/react', () => ({
  useAction: () => vi.fn(),
  useMutation: (mutation: unknown) => async (args: unknown) => {
    const state = (
      globalThis as typeof globalThis & {
        __shipFastDashboardConvexState?: DashboardConvexTestState
      }
    ).__shipFastDashboardConvexState
    state?.mutationCalls.push({ mutation, args })
  },
  useQuery: (_query: unknown, args: unknown) => {
    const state = (
      globalThis as typeof globalThis & {
        __shipFastDashboardConvexState?: DashboardConvexTestState
      }
    ).__shipFastDashboardConvexState
    state?.queryArgs.push(args)
    return args && typeof args === 'object' && 'lookup' in args
      ? (state?.generationView ?? null)
      : null
  },
}))

vi.mock('@ship-fast/lakebed/react', () => ({
  LakebedSessionProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@/features/admin/components/LakebedAdminPanel', () => ({
  LakebedAdminPanel: () => null,
}))
vi.mock('@/features/billing/components/BillingPanel', () => ({
  BillingPanel: () => null,
}))
vi.mock('@/features/brand/components/BrandMediaPanel', () => ({
  BrandMediaPanel: ({
    onSelectBrand,
  }: {
    onSelectBrand?: (brand: {
      name: string
      domain: string
      brandId: string
      icon: string
      logo: string
    }) => void
  }) => (
    <button
      type="button"
      onClick={() =>
        onSelectBrand?.({
          name: 'Linear',
          domain: 'linear.app',
          brandId: 'linear-id',
          icon: 'https://cdn.brandfetch.io/linear/icon.webp',
          logo: 'https://cdn.brandfetch.io/linear/logo.svg',
        })
      }
    >
      Select Linear brand
    </button>
  ),
}))
vi.mock('@/features/commerce/components/CommercePanel', () => ({
  CommercePanel: ({
    sessionId,
    visualProductCount,
    visualProducts,
  }: {
    sessionId: string
    visualProductCount: number
    visualProducts: unknown[]
  }) => (
    <div>
      <span>Medusa commerce panel {sessionId}</span>
      <span data-testid="commerce-visual-product-count">
        {visualProductCount}
      </span>
      <span data-testid="commerce-visual-products">
        {JSON.stringify(visualProducts)}
      </span>
    </div>
  ),
}))
vi.mock('@/features/commerce/components/EcommercifyTransformOverlay', () => ({
  EcommercifyTransformOverlay: () => null,
}))
vi.mock('@/features/deployments/components/DeploymentPanel', () => ({
  DeploymentPanel: () => null,
}))
vi.mock('@/features/editing/components/EditPanel', () => ({
  EditPanel: () => null,
}))
vi.mock('@/features/exports/components/ExportPanel', () => ({
  ExportPanel: () => null,
}))
vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: ({ source }: { source: string }) => {
    const [initialSource] = useState(source)
    return (
      <div data-testid="generated-module-preview">
        <span data-testid="generated-module-source">{initialSource}</span>
      </div>
    )
  },
}))
vi.mock('@/features/github/components/GitHubPanel', () => ({
  GitHubPanel: () => null,
}))
vi.mock('@/features/localization/components/LocalizationPanel', () => ({
  LocalizationPanel: () => null,
}))
vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => undefined,
}))
vi.mock('@/genui/components/ThemePicker', () => ({
  default: ({ trigger }: { trigger: ReactNode }) => <>{trigger}</>,
}))
vi.mock('@/genui/theme-apply', () => ({
  resolveThemeStyles: () => undefined,
}))
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

describe('Dashboard missing session state', () => {
  beforeEach(() => {
    ensureWindowStorage()
    class TestResizeObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    Object.defineProperty(window, 'ResizeObserver', {
      configurable: true,
      value: TestResizeObserver,
    })
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: TestResizeObserver,
    })
    Element.prototype.scrollIntoView = vi.fn()
    getConvexState().generationView = null
    getConvexState().queryArgs = []
    getConvexState().mutationCalls = []
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.matchMedia = vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
    window.sessionStorage.clear()
    getConvexState().generationView = null
    getConvexState().queryArgs = []
    getConvexState().mutationCalls = []
    vi.clearAllMocks()
  })

  it('shows a missing project state when Convex returns no generation view', () => {
    render(<Dashboard sessionId="missing-session" />)

    expect(screen.getAllByText('Project missing')).toHaveLength(2)
    expect(
      screen.getByText('This generated website is no longer available.'),
    ).toBeTruthy()
    expect(screen.queryByText('Composing the first screen')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Publish preview' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Open auto admin' })).toBeNull()
  })

  it('does not show generated hover copy on viewport controls', () => {
    getConvexState().generationView = {
      session: {
        sessionId: 'ready-session',
        status: 'preview_ready',
        prompt: 'A portfolio website',
        preferredLanguage: 'en',
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="ready-session" />)

    const viewportButtons = [
      screen.getByRole('button', { name: 'Desktop viewport' }),
      screen.getByRole('button', { name: 'Tablet viewport' }),
      screen.getByRole('button', { name: 'Mobile viewport' }),
    ]

    for (const button of viewportButtons) {
      expect(button.hasAttribute('data-tip')).toBe(false)
      expect(button.hasAttribute('title')).toBe(false)
    }
  })

  it('activates a ready preview immediately even after a fresh launch handoff', async () => {
    window.sessionStorage.setItem(
      'ship-fast:generation-launch:fast-ready-session',
      '1',
    )
    getConvexState().generationView = {
      session: {
        sessionId: 'fast-ready-session',
        status: 'preview_ready',
        prompt: 'A fast ready website',
        preferredLanguage: 'en',
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="fast-ready-session" />)

    await waitFor(() => {
      expect(document.querySelector('#dashboard-wrap')?.className).toContain(
        'opacity-100',
      )
    })
    expect(screen.queryByText('Composing the first screen')).toBeNull()
  })

  it('remounts the generated preview when the preview version changes', async () => {
    getConvexState().generationView = {
      session: {
        sessionId: 'editable-session',
        status: 'preview_ready',
        prompt: 'An editable website',
        preferredLanguage: 'en',
        previewVersion: 1,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Original</h1></body></html>',
        updatedAt: 100,
      },
      siteSpec: null,
    }

    const { rerender } = render(<Dashboard sessionId="editable-session" />)

    expect(
      screen.getByTestId('generated-module-preview').textContent,
    ).toContain('Original')

    getConvexState().generationView = {
      session: {
        sessionId: 'editable-session',
        status: 'preview_ready',
        prompt: 'An editable website',
        preferredLanguage: 'en',
        previewVersion: 2,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Edited</h1></body></html>',
        updatedAt: 200,
      },
      siteSpec: null,
    }

    rerender(<Dashboard sessionId="editable-session" />)

    await waitFor(() => {
      expect(
        screen.getByTestId('generated-module-preview').textContent,
      ).toContain('Edited')
    })
  })

  it('remembers ready public default sessions for fast repeated prompt opens', async () => {
    getConvexState().generationView = {
      session: {
        sessionId: 'ready-cache-session',
        status: 'preview_ready',
        prompt: 'A remembered cache website',
        preferredLanguage: 'en',
        isPrivate: false,
        designReferenceUrls: [],
        designReferenceNotes: '',
        cloneUrl: undefined,
        engineVersion: undefined,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="ready-cache-session" />)

    await waitFor(() => {
      expect(
        window.localStorage.getItem(
          'ship-fast:ready-session:v1:en:a remembered cache website',
        ),
      ).toContain('ready-cache-session')
    })
  })

  it('does not remember private ready sessions in the public prompt cache', async () => {
    getConvexState().generationView = {
      session: {
        sessionId: 'private-ready-session',
        status: 'preview_ready',
        prompt: 'A private cache website',
        preferredLanguage: 'en',
        isPrivate: true,
        designReferenceUrls: [],
        designReferenceNotes: '',
        cloneUrl: undefined,
        engineVersion: undefined,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="private-ready-session" />)

    await waitFor(() => {
      expect(document.querySelector('#dashboard-wrap')?.className).toContain(
        'opacity-100',
      )
    })
    expect(
      window.localStorage.getItem(
        'ship-fast:ready-session:v1:en:a private cache website',
      ),
    ).toBeNull()
  })

  it('skips commerce and deployment side queries until the preview is ready', () => {
    const state = getConvexState()
    state.generationView = {
      session: {
        sessionId: 'streaming-session',
        status: 'streaming',
        prompt: 'A streaming website',
        preferredLanguage: 'en',
        isPrivate: false,
      },
      tasks: [{ status: 'running' }],
      events: [],
      homeModule: null,
      siteSpec: null,
    }

    render(<Dashboard sessionId="streaming-session" />)

    const skipCount = state.queryArgs.filter((args) => args === 'skip').length
    expect(skipCount).toBe(2)
  })

  it('loads commerce and deployment side queries after the preview is ready', () => {
    const state = getConvexState()
    state.generationView = {
      session: {
        sessionId: 'ready-side-panel-session',
        status: 'preview_ready',
        prompt: 'A ready side panel website',
        preferredLanguage: 'en',
        isPrivate: false,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="ready-side-panel-session" />)

    const sidePanelArgs = state.queryArgs.filter(
      (args) =>
        args === 'skip' ||
        (args && typeof args === 'object' && 'sessionId' in args),
    )
    expect(sidePanelArgs.length).toBeGreaterThanOrEqual(2)
    expect(sidePanelArgs).not.toContain('skip')
    expect(sidePanelArgs).toEqual(
      expect.arrayContaining([
        { sessionId: 'ready-side-panel-session' },
        { sessionId: 'ready-side-panel-session' },
      ]),
    )
  })

  it('opens the Medusa commerce panel from the e-commerce rail action', async () => {
    getConvexState().generationView = {
      session: {
        sessionId: 'ready-commerce-session',
        status: 'preview_ready',
        prompt: 'A ready commerce website',
        preferredLanguage: 'en',
        isPrivate: false,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="ready-commerce-session" />)

    fireEvent.click(screen.getByRole('button', { name: /E-commerce/i }))

    expect(
      await screen.findByText('Medusa commerce panel ready-commerce-session'),
    ).toBeTruthy()
  })

  it('passes generated visual product count into the Medusa commerce panel', async () => {
    getConvexState().generationView = {
      session: {
        sessionId: 'visual-commerce-session',
        status: 'preview_ready',
        prompt: 'A ready commerce website',
        preferredLanguage: 'en',
        isPrivate: false,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source:
          'root = StorePage({ products: { items: [{ name: "Truffle Box", price: "$79" }, { name: "Dark Bar", price: "$12" }] } })',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="visual-commerce-session" />)

    fireEvent.click(screen.getByRole('button', { name: /E-commerce/i }))

    expect(
      (await screen.findByTestId('commerce-visual-product-count')).textContent,
    ).toBe('2')
  })

  it('passes generated visual products into the Medusa commerce panel for sync', async () => {
    getConvexState().generationView = {
      session: {
        sessionId: 'visual-commerce-session',
        status: 'preview_ready',
        prompt: 'A ready commerce website',
        preferredLanguage: 'en',
        isPrivate: false,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source:
          'root = StorePage({ products: { items: [{ name: "Truffle Box", price: "$79" }] } })',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="visual-commerce-session" />)

    fireEvent.click(screen.getByRole('button', { name: /E-commerce/i }))

    expect(
      JSON.parse(
        (await screen.findByTestId('commerce-visual-products')).textContent ??
          '[]',
      ),
    ).toMatchObject([
      { handle: 'truffle-box', price: 79, title: 'Truffle Box' },
    ])
  })

  it('passes preview OpenUI products into the Medusa commerce panel when home module is HTML', async () => {
    getConvexState().generationView = {
      session: {
        sessionId: 'openui-preview-commerce-session',
        status: 'preview_ready',
        prompt: 'A ready commerce website',
        preferredLanguage: 'en',
        isPrivate: false,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
      },
      latestPreview: {
        html: '<!doctype html><html><body><h1>Ready</h1></body></html>',
        openUiSource:
          'root = EcommerceGallery({ products: [{ name: "Preview Jacket", price: "$149" }] })',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="openui-preview-commerce-session" />)

    fireEvent.click(screen.getByRole('button', { name: /E-commerce/i }))

    expect(
      JSON.parse(
        (await screen.findByTestId('commerce-visual-products')).textContent ??
          '[]',
      ),
    ).toMatchObject([
      { handle: 'preview-jacket', price: 149, title: 'Preview Jacket' },
    ])
  })

  it('opens localization from the rail and persists the selected language', async () => {
    const state = getConvexState()
    state.generationView = {
      session: {
        sessionId: 'ready-localization-session',
        status: 'preview_ready',
        prompt: 'A ready localized website',
        preferredLanguage: 'en',
        isPrivate: false,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="ready-localization-session" />)

    const trigger = screen.getByRole('button', { name: /Localization/i })
    fireEvent.pointerDown(trigger)
    fireEvent.pointerUp(trigger)
    fireEvent.click(trigger)

    const input = await screen.findByPlaceholderText('Search languages…')
    fireEvent.change(input, { target: { value: 'hindi' } })

    const hindiOption = await screen.findByText('Hindi')
    const option = hindiOption.closest('[role="option"]')
    expect(option).toBeTruthy()
    fireEvent.pointerUp(option!)
    fireEvent.click(option!)

    await waitFor(() => {
      expect(state.mutationCalls).toContainEqual(
        expect.objectContaining({
          args: {
            sessionId: 'ready-localization-session',
            anonymousOwnerSecret: undefined,
            preferredLanguage: 'hi',
          },
        }),
      )
    })
  })

  it('shows no Brand and media subtitle and persists the selected logo as the trigger icon', async () => {
    const state = getConvexState()
    state.generationView = {
      session: {
        sessionId: 'ready-brand-session',
        status: 'preview_ready',
        prompt: 'A ready brand website',
        preferredLanguage: 'en',
        isPrivate: false,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="ready-brand-session" />)

    const trigger = screen.getByRole('button', {
      name: 'Brand and media',
    })
    expect(screen.queryByText('Brandfetch / Pexels')).toBeNull()
    fireEvent.click(trigger)
    fireEvent.click(
      await screen.findByRole('button', { name: /Select Linear/i }),
    )

    expect(screen.getByRole('button', { name: 'Brand and media' })).toBeTruthy()
    expect(screen.queryByText('linear.app')).toBeNull()
    expect(
      trigger.querySelector(
        'img[src="https://cdn.brandfetch.io/linear/icon.webp"]',
      ),
    ).toBeTruthy()
    expect(state.mutationCalls.at(-1)?.args).toMatchObject({
      sessionId: 'ready-brand-session',
      brandLogo: {
        name: 'Linear',
        domain: 'linear.app',
        brandId: 'linear-id',
        icon: 'https://cdn.brandfetch.io/linear/icon.webp',
        logo: 'https://cdn.brandfetch.io/linear/logo.svg',
      },
    })
  })

  it('hydrates the Brand and media trigger icon from the persisted session brand logo', () => {
    getConvexState().generationView = {
      session: {
        sessionId: 'persisted-brand-session',
        status: 'preview_ready',
        prompt: 'A persisted brand website',
        preferredLanguage: 'en',
        isPrivate: false,
        selectedBrandLogo: {
          name: 'Linear',
          domain: 'linear.app',
          brandId: 'linear-id',
          icon: 'https://cdn.brandfetch.io/linear/icon.webp',
          logo: 'https://cdn.brandfetch.io/linear/logo.svg',
        },
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="persisted-brand-session" />)

    const trigger = screen.getByRole('button', { name: 'Brand and media' })
    expect(screen.queryByText('Brandfetch / Pexels')).toBeNull()
    expect(screen.queryByText('Linear / linear.app')).toBeNull()
    expect(
      trigger.querySelector(
        'img[src="https://cdn.brandfetch.io/linear/icon.webp"]',
      ),
    ).toBeTruthy()
  })
})
