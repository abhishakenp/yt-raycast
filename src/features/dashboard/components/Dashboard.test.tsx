// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
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
}

const getConvexState = (): DashboardConvexTestState => {
  const testGlobal = globalThis as typeof globalThis & {
    __shipFastDashboardConvexState?: DashboardConvexTestState
  }
  testGlobal.__shipFastDashboardConvexState ??= {
    generationView: null,
    queryArgs: [],
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

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
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
  CmsPanel: () => null,
}))
vi.mock('@/features/commerce/components/CommercePanel', () => ({
  CommercePanel: ({ sessionId }: { sessionId: string }) => (
    <div>Medusa commerce panel {sessionId}</div>
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
  GeneratedModulePreview: ({ source }: { source: string }) => {
    const [initialSource] = useState(source)
    return <div data-testid="generated-module-preview">{initialSource}</div>
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

  it('removes the old rail mode editor path while keeping popover tools wired', () => {
    const source = readFileSync(
      'src/features/dashboard/components/Dashboard.tsx',
      'utf8',
    )

    expect(source).not.toContain('type RailMode')
    expect(source).not.toContain('railMode')
    expect(source).not.toContain('setRailMode')
    expect(source).not.toContain('RailPanelFallback')
    expect(source).not.toContain('preview-site-rail-editor')
    expect(source).not.toContain('rail-editor-')
    expect(source).not.toContain("import('@/features/cms/components/CmsPanel')")
    expect(source).not.toContain(
      "import('@/features/chat/components/ChatPanel')",
    )
    expect(source).not.toContain(
      "import('@/features/dashboard/components/ActivityPanel')",
    )
    expect(source).toContain(
      "import('@/features/commerce/components/CommercePanel')",
    )
    expect(source).toContain('data-rail-action="export"')
    expect(source).toContain('data-rail-action="github"')
    expect(source).toContain('data-rail-action="domain"')
    expect(source).toContain('const ToolPopoverFallback')
    expect(source).toContain('<ExportPanel sessionId={sessionId} />')
    expect(source).toContain('<GitHubPanel sessionId={sessionId} />')
    expect(source).toContain('<DeploymentPanel sessionId={sessionId} />')
  })
})
