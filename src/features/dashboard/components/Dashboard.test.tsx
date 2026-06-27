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

type DashboardConvexTestState = {
  generationView: unknown
  queryArgs: unknown[]
  cmsBlogPosts: unknown[]
}

const getConvexState = (): DashboardConvexTestState => {
  const testGlobal = globalThis as typeof globalThis & {
    __shipFastDashboardConvexState?: DashboardConvexTestState
  }
  testGlobal.__shipFastDashboardConvexState ??= {
    generationView: null,
    queryArgs: [],
    cmsBlogPosts: [],
  }
  return testGlobal.__shipFastDashboardConvexState
}

const createMemoryStorage = (): Storage => {
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
// SignInGate.test.tsx and the source-level invariant test below.
vi.mock('@/shared/auth/clerk-runtime', () => ({
  isClerkClientEnabled: () => false,
}))

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
  useQuery: (_query: unknown, args: unknown) => {
    const state = (
      globalThis as typeof globalThis & {
        __shipFastDashboardConvexState?: DashboardConvexTestState
      }
    ).__shipFastDashboardConvexState
    state?.queryArgs.push(args)
    if (args && typeof args === 'object' && 'collectionKey' in args) {
      return state?.cmsBlogPosts ?? []
    }
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
vi.mock('@/features/agentation/components/AgentationPanel', () => ({
  AgentationPanel: () => null,
}))
vi.mock('@/features/billing/components/BillingPanel', () => ({
  BillingPanel: () => null,
}))
vi.mock('@/features/brand/components/BrandMediaPanel', () => ({
  BrandMediaPanel: () => null,
}))
vi.mock('@/features/chat/components/ChatPanel', () => ({
  ChatPanel: () => null,
}))
vi.mock('@/features/cms/components/CmsPanel', () => ({
  CmsPanel: ({ sessionId }: { sessionId: string }) => (
    <div>CMS content panel {sessionId}</div>
  ),
}))
vi.mock('@/features/commerce/components/CommercePanel', () => ({
  CommercePanel: ({
    sessionId,
    visualProductCount,
    visualProducts,
  }: {
    sessionId: string
    visualProductCount?: number
    visualProducts?: Array<{ handle: string; price: number; title: string }>
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
vi.mock('@/features/dashboard/components/ActivityPanel', () => ({
  ActivityPanel: () => null,
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
  GeneratedModulePreview: ({
    source,
    cmsBlogPosts,
  }: {
    source: string
    cmsBlogPosts?: unknown[]
  }) => {
    const [initialSource] = useState(source)
    return (
      <div data-testid="generated-module-preview">
        <span data-testid="generated-module-source">{initialSource}</span>
        <span data-testid="generated-module-cms-posts">
          {JSON.stringify(cmsBlogPosts ?? [])}
        </span>
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

describe('Dashboard missing session state', () => {
  beforeEach(() => {
    ensureWindowStorage()
    getConvexState().generationView = null
    getConvexState().queryArgs = []
    getConvexState().cmsBlogPosts = []
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
    getConvexState().cmsBlogPosts = []
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

  it('keeps OpenUI source for CMS-promoted OpenUI handoff HTML and passes blog posts into preview', async () => {
    const state = getConvexState()
    state.cmsBlogPosts = [
      {
        itemId: 'post-1',
        title: 'CMS Blog Post',
        slug: 'cms-blog-post',
        excerpt: 'Published from the CMS panel.',
        author: 'Surya',
        category: 'AI',
        body: 'Full article body.',
        status: 'published',
        updatedAt: 200,
      },
    ]
    state.generationView = {
      session: {
        sessionId: 'cms-preview-session',
        status: 'preview_ready',
        prompt: 'A CMS-ready blog',
        preferredLanguage: 'en',
        previewVersion: 2,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: 'root = RealOpenUI({ title: "Designed publication" })',
        updatedAt: 100,
      },
      latestPreview: {
        html: '<!doctype html><html><body><main><h1>Generated OpenUI source is ready.</h1><script id="ship-fast-openui-source" type="application/json">"root = RealOpenUI()"</script><!-- ship-fast-cms:blogPosts:start --><section data-cms-collection="blogPosts"><h2>CMS Blog Post</h2></section><!-- ship-fast-cms:blogPosts:end --></main></body></html>',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="cms-preview-session" />)

    await waitFor(() => {
      expect(
        screen.getByTestId('generated-module-source').textContent,
      ).toContain('root = RealOpenUI')
    })
    expect(
      screen.getByTestId('generated-module-source').textContent,
    ).not.toContain('Generated OpenUI source is ready')
    expect(
      screen.getByTestId('generated-module-cms-posts').textContent,
    ).toContain('CMS Blog Post')
  })

  it('still promotes CMS preview HTML for non-OpenUI HTML previews', async () => {
    getConvexState().generationView = {
      session: {
        sessionId: 'cms-html-preview-session',
        status: 'preview_ready',
        prompt: 'A CMS-ready HTML blog',
        preferredLanguage: 'en',
        previewVersion: 2,
      },
      tasks: [{ status: 'succeeded' }],
      events: [],
      homeModule: {
        source: '<!doctype html><html><body><h1>Stale HTML</h1></body></html>',
        updatedAt: 100,
      },
      latestPreview: {
        html: '<!doctype html><html><body><main><!-- ship-fast-cms:blogPosts:start --><section data-cms-collection="blogPosts"><h2>CMS Blog Post</h2></section><!-- ship-fast-cms:blogPosts:end --></main></body></html>',
      },
      siteSpec: null,
    }

    render(<Dashboard sessionId="cms-html-preview-session" />)

    await waitFor(() => {
      expect(
        screen.getByTestId('generated-module-source').textContent,
      ).toContain('CMS Blog Post')
    })
    expect(
      screen.getByTestId('generated-module-source').textContent,
    ).not.toContain('Stale HTML')
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
    expect(skipCount).toBe(3)
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

  it('opens the CMS content panel from the edit content rail action', async () => {
    getConvexState().generationView = {
      session: {
        sessionId: 'ready-cms-session',
        status: 'preview_ready',
        prompt: 'A ready CMS website',
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

    render(<Dashboard sessionId="ready-cms-session" />)

    fireEvent.click(screen.getByRole('button', { name: /Edit content/i }))

    expect(
      await screen.findByText('CMS content panel ready-cms-session'),
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
    ).toEqual([{ handle: 'truffle-box', price: 79, title: 'Truffle Box' }])
  })
})
