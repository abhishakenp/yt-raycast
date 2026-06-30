// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Dashboard } from './Dashboard'

// ─── controllable convex test state ────────────────────────────────────────
type SessionState = {
  status: string
  previewVersion?: number
  prompt?: string
  preferredLanguage?: string
  isPrivate?: boolean
  themeOverride?: string | null
  themeMode?: 'light' | 'dark' | null
}

type GenerationView = {
  session: SessionState & { sessionId: string }
  tasks: Array<{ status: string; title?: string; taskKey?: string }>
  events: unknown[]
  homeModule?: { source: string; status?: string; updatedAt?: number }
  siteSpec?: { specJson?: string; updatedAt?: number } | null
  latestPreview?: unknown
}

type ConvexTestState = {
  generationView: GenerationView | null
  sidePanelData: { status?: string; url?: string; slug?: string } | null
  publishMutation: ReturnType<typeof vi.fn>
  themeMutation: ReturnType<typeof vi.fn>
}

const getConvexState = (): ConvexTestState => {
  const testGlobal = globalThis as typeof globalThis & {
    __shipFastDashboardToolbarConvexState?: ConvexTestState
  }
  testGlobal.__shipFastDashboardToolbarConvexState ??= {
    generationView: null,
    sidePanelData: null,
    publishMutation: vi.fn().mockResolvedValue(undefined),
    themeMutation: vi.fn().mockResolvedValue(undefined),
  }
  return testGlobal.__shipFastDashboardToolbarConvexState
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

// ─── mocks ─────────────────────────────────────────────────────────────────
vi.mock('@clerk/tanstack-react-start', () => ({
  useAuth: () => ({
    isSignedIn: false,
    userId: null,
    getToken: async () => null,
  }),
  useClerk: () => ({ session: null, user: null }),
}))

// SignInGate must be a no-op so rail popovers / edit toggles work ungated.
vi.mock('@/shared/auth/clerk-runtime', () => ({
  isClerkClientEnabled: () => false,
}))

vi.mock('convex/react', () => ({
  useAction: () => vi.fn(),
  useMutation: () => {
    const state = (
      globalThis as typeof globalThis & {
        __shipFastDashboardToolbarConvexState?: ConvexTestState
      }
    ).__shipFastDashboardToolbarConvexState
    // Both publishPreview and setThemeOverride share this fn; tests assert on
    // the call shape to distinguish. Default resolves; tests override.
    return state?.publishMutation ?? vi.fn().mockResolvedValue(undefined)
  },
  useQuery: (_query: unknown, args: unknown) => {
    const state = (
      globalThis as typeof globalThis & {
        __shipFastDashboardToolbarConvexState?: ConvexTestState
      }
    ).__shipFastDashboardToolbarConvexState
    if (args === 'skip' || args == null) return null
    if (typeof args === 'object' && 'lookup' in args) {
      return state?.generationView ?? null
    }
    if (typeof args === 'object' && 'sessionId' in args) {
      return state?.sidePanelData ?? null
    }
    return null
  },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useRouter: () => ({ state: { location: { pathname: '/' } } }),
}))

vi.mock('@ship-fast/lakebed/react', () => ({
  LakebedSessionProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@/features/admin/components/LakebedAdminPanel', () => ({
  LakebedAdminPanel: () => (
    <div data-testid="lakebed-admin-panel">Admin panel</div>
  ),
}))

vi.mock('@/features/commerce/components/CommercePanel', () => ({
  CommercePanel: ({ sessionId }: { sessionId: string }) => (
    <div data-testid="commerce-panel-stub">Commerce panel {sessionId}</div>
  ),
}))
vi.mock('@/features/exports/components/ExportPanel', () => ({
  ExportPanel: ({ sessionId }: { sessionId: string }) => (
    <div data-testid="export-panel-stub">Export panel {sessionId}</div>
  ),
}))
vi.mock('@/features/deployments/components/DeploymentPanel', () => ({
  DeploymentPanel: ({ sessionId }: { sessionId: string }) => (
    <div data-testid="deployment-panel-stub">Deployment panel {sessionId}</div>
  ),
}))
vi.mock('@/features/github/components/GitHubPanel', () => ({
  GitHubPanel: ({ sessionId }: { sessionId: string }) => (
    <div data-testid="github-panel-stub">GitHub panel {sessionId}</div>
  ),
}))
vi.mock('@/genui/components/ThemePicker', () => ({
  default: ({ trigger }: { trigger: ReactNode }) => <>{trigger}</>,
}))
vi.mock('@/genui/theme-apply', () => ({
  resolveThemeStyles: () => undefined,
}))

vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: ({
    source,
    editMode,
    deviceMode,
  }: {
    source: string
    editMode?: boolean
    deviceMode?: string
  }) => (
    <div data-testid="generated-module-preview">
      <span data-testid="gmp-source">{source}</span>
      <span data-testid="gmp-edit-mode">{String(editMode)}</span>
      <span data-testid="gmp-device-mode">{deviceMode}</span>
    </div>
  ),
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => undefined,
}))

vi.mock('@/components/GenUI/IntroLoader', () => ({
  IntroLoader: () => <div data-testid="intro-loader">Loading</div>,
}))

vi.mock('@/features/editing/components/InlineEditToolbar', () => ({
  InlineEditToolbar: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <div data-testid="inline-edit-toolbar">Inline edit toolbar</div>
    ) : null,
}))

// ─── helpers ───────────────────────────────────────────────────────────────
const readyGenerationView = (
  overrides: Partial<GenerationView> = {},
): GenerationView => ({
  session: {
    sessionId: 'ready-session',
    status: 'preview_ready',
    prompt: 'A ready website',
    preferredLanguage: 'en',
    isPrivate: false,
    ...overrides.session,
  },
  tasks: [{ status: 'succeeded', title: 'Build' }],
  events: [],
  homeModule: {
    source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
    status: 'succeeded',
    updatedAt: 100,
    ...overrides.homeModule,
  },
  siteSpec: null,
  latestPreview: undefined,
  ...overrides,
})

const generatingGenerationView = (): GenerationView => ({
  session: {
    sessionId: 'generating-session',
    status: 'running',
    prompt: 'A generating website',
    preferredLanguage: 'en',
  },
  tasks: [{ status: 'running', title: 'Build' }],
  events: [],
  homeModule: { source: '', status: 'running', updatedAt: 50 },
  siteSpec: null,
})

const installLocationMock = () => {
  const hrefSetter = vi.fn()
  const reloadSpy = vi.fn()
  const original = window.location
  const mockLocation = {
    ...original,
    get href() {
      return original.href
    },
    set href(value: string) {
      hrefSetter(value)
    },
    reload: reloadSpy,
  }
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: mockLocation,
  })
  return { hrefSetter, reloadSpy }
}

const setupReady = () => {
  getConvexState().generationView = readyGenerationView()
  getConvexState().sidePanelData = null
  getConvexState().publishMutation = vi.fn().mockResolvedValue(undefined)
}

// ─── tests ─────────────────────────────────────────────────────────────────
describe('Dashboard toolbar + device switcher + status indicators', () => {
  beforeEach(() => {
    ensureWindowStorage()
    getConvexState().generationView = null
    getConvexState().sidePanelData = null
    getConvexState().publishMutation = vi.fn().mockResolvedValue(undefined)
    getConvexState().themeMutation = vi.fn().mockResolvedValue(undefined)
    window.localStorage.clear()
    window.sessionStorage.clear()
    // Reset the URL so admin-view pushState from a prior test does not leak
    // into the next test via the pathname-syncing useEffect.
    window.history.replaceState(null, '', '/')
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
    window.history.replaceState(null, '', '/')
    getConvexState().generationView = null
    getConvexState().sidePanelData = null
    vi.clearAllMocks()
  })

  // 1. Device switcher
  it('changes preview container width when switching device viewports', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const frame = document.querySelector(
      '#preview-device-frame',
    ) as HTMLElement | null
    expect(frame).not.toBeNull()

    // default desktop → 100%
    expect(frame!.style.width).toBe('100%')

    fireEvent.click(screen.getByRole('button', { name: 'Tablet viewport' }))
    expect(frame!.style.width).toBe('820px')

    fireEvent.click(screen.getByRole('button', { name: 'Mobile viewport' }))
    expect(frame!.style.width).toBe('390px')

    fireEvent.click(screen.getByRole('button', { name: 'Desktop viewport' }))
    expect(frame!.style.width).toBe('100%')
  })

  // 1b. device buttons reflect active state via aria-pressed
  it('marks the active device button as pressed', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const tablet = screen.getByRole('button', { name: 'Tablet viewport' })
    fireEvent.click(tablet)
    expect(tablet.getAttribute('aria-pressed')).toBe('true')
    expect(
      screen
        .getByRole('button', { name: 'Desktop viewport' })
        .getAttribute('aria-pressed'),
    ).toBe('false')
  })

  // 2. Edit mode toggle
  it('toggles inline edit mode via the pencil icon', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const pencil = screen.getByRole('button', {
      name: 'Toggle inline edit mode',
    })
    expect(pencil.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(pencil)
    expect(pencil.getAttribute('aria-pressed')).toBe('true')

    // editMode is forwarded to the preview as an observable prop
    expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('true')

    fireEvent.click(pencil)
    expect(pencil.getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('false')
  })

  // 3. Admin view toggle
  it('toggles admin view via the shield icon', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const shield = screen.getByRole('button', { name: 'Open auto admin' })
    expect(shield.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(shield)
    expect(shield.getAttribute('aria-pressed')).toBe('true')
    // label flips when admin is active
    expect(
      screen.getByRole('button', { name: 'View generated site' }),
    ).toBeTruthy()
    // admin panel mounts in place of the preview (lazy-loaded → await)
    expect(await screen.findByTestId('lakebed-admin-panel')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'View generated site' }))
    expect(
      screen
        .getByRole('button', { name: 'Open auto admin' })
        .getAttribute('aria-pressed'),
    ).toBe('false')
  })

  // 4. Back to home button
  it('renders a back-to-home button that navigates to /', () => {
    setupReady()
    const { hrefSetter } = installLocationMock()
    render(<Dashboard sessionId="ready-session" />)

    const backBtn = screen.getByRole('button', { name: 'Back to home' })
    expect(backBtn.getAttribute('data-tip')).toBe('Back to home')

    fireEvent.click(backBtn)
    expect(hrefSetter).toHaveBeenCalledWith('/')
  })

  // 5. URL pill
  it('displays the current preview URL in the url pill', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const urlText = document.querySelector('#url-text') as HTMLAnchorElement
    expect(urlText).not.toBeNull()
    expect(urlText.textContent).toBe('/generate/ready-session')
    expect(urlText.getAttribute('aria-label')).toBe('Current preview URL')
  })

  it('updates the url pill to the admin path when admin view is active', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(screen.getByRole('button', { name: 'Open auto admin' }))
    const urlText = document.querySelector('#url-text') as HTMLAnchorElement
    expect(urlText.textContent).toBe('/generate/ready-session/admin')
  })

  // 6. Refresh button
  it('triggers a preview reload from the refresh button', () => {
    setupReady()
    const { reloadSpy } = installLocationMock()
    render(<Dashboard sessionId="ready-session" />)

    const refresh = screen.getByRole('button', { name: 'Reload page' })
    expect(refresh.getAttribute('data-tip')).toBe('Refresh preview')
    fireEvent.click(refresh)
    expect(reloadSpy).toHaveBeenCalledTimes(1)
  })

  // 7. Status indicator
  it('shows Generating with a cyan pulse when the session is generating', () => {
    getConvexState().generationView = generatingGenerationView()
    render(<Dashboard sessionId="generating-session" />)

    const statusText = document.querySelector('#status-text')
    const statusDot = document.querySelector('#status-dot')
    expect(statusText?.textContent).toBe('Generating')
    expect(statusDot?.className).toContain('bg-cyan-300')
    expect(statusDot?.className).toContain('animate-pulse')
  })

  it('shows Preview ready with emerald when the session is ready', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const statusText = document.querySelector('#status-text')
    const statusDot = document.querySelector('#status-dot')
    expect(statusText?.textContent).toBe('Preview ready')
    expect(statusDot?.className).toContain('bg-emerald-300')
    expect(statusDot?.className).not.toContain('animate-pulse')
  })

  it('shows Project missing when there is no session', () => {
    getConvexState().generationView = null
    render(<Dashboard sessionId="missing-session" />)

    const statusText = document.querySelector('#status-text')
    expect(statusText?.textContent).toBe('Project missing')
    // status dot falls back to cyan pulse (not ready)
    const statusDot = document.querySelector('#status-dot')
    expect(statusDot?.className).toContain('bg-cyan-300')
  })

  // 8. Publish button
  it('triggers the publish flow from the publish button', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const publish = screen.getByRole('button', { name: 'Publish preview' })
    fireEvent.click(publish)

    await waitFor(() => {
      expect(getConvexState().publishMutation).toHaveBeenCalledTimes(1)
    })
    const callArg = getConvexState().publishMutation.mock.calls[0][0]
    expect(callArg).toMatchObject({ sessionId: 'ready-session' })
  })

  it('disables the publish button until the preview is ready', () => {
    getConvexState().generationView = generatingGenerationView()
    render(<Dashboard sessionId="generating-session" />)

    // preview tools render only when session exists; publish is disabled
    const publish = screen.getByRole('button', { name: 'Publish preview' })
    expect((publish as HTMLButtonElement).disabled).toBe(true)
  })

  it('shows an error message when publishing fails', async () => {
    setupReady()
    getConvexState().publishMutation = vi
      .fn()
      .mockRejectedValue(new Error('Publish failed'))
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(screen.getByRole('button', { name: 'Publish preview' }))

    expect(await screen.findByText('Publish failed')).toBeTruthy()
  })

  // 9. Side rail panel switching
  it('reveals the commerce panel content when the e-commerce rail button is clicked', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(screen.getByRole('button', { name: /E-commerce/i }))
    expect(await screen.findByTestId('commerce-panel-stub')).toBeTruthy()
  })

  it('reveals the export panel content when the export rail button is clicked', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(screen.getByRole('button', { name: /Export/i }))
    expect(await screen.findByTestId('export-panel-stub')).toBeTruthy()
  })

  it('reveals the deployment panel content when the deployment url rail button is clicked', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(screen.getByRole('button', { name: /Deployment URL/i }))
    expect(await screen.findByTestId('deployment-panel-stub')).toBeTruthy()
  })

  it('reveals the github panel content when the github rail button is clicked', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(screen.getByRole('button', { name: /GitHub/i }))
    expect(await screen.findByTestId('github-panel-stub')).toBeTruthy()
  })

  it('switches active panel content as different rail buttons are clicked', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(screen.getByRole('button', { name: /E-commerce/i }))
    expect(await screen.findByTestId('commerce-panel-stub')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Export/i }))
    expect(await screen.findByTestId('export-panel-stub')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /GitHub/i }))
    expect(await screen.findByTestId('github-panel-stub')).toBeTruthy()
  })

  // 10. Missing project state
  it('shows the fallback missing-project UI when the session has no generated content', () => {
    getConvexState().generationView = null
    render(<Dashboard sessionId="ghost-session" />)

    // MissingProjectState renders the heading + a back-to-home button
    expect(
      screen.getByText('This generated website is no longer available.'),
    ).toBeTruthy()
    // status rail also reports Project missing
    expect(document.querySelector('#status-text')?.textContent).toBe(
      'Project missing',
    )
    // preview tools are hidden when session is missing
    expect(screen.queryByRole('button', { name: 'Publish preview' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Open auto admin' })).toBeNull()
    // the missing-state back-to-home button navigates to /. Two back-to-home
    // buttons exist (topbar + missing-state card); assert both are present.
    const backButtons = screen.getAllByRole('button', { name: 'Back to home' })
    expect(backButtons.length).toBeGreaterThanOrEqual(2)
  })

  it('hides the device switcher and edit controls when the project is missing', () => {
    getConvexState().generationView = null
    render(<Dashboard sessionId="ghost-session" />)

    expect(screen.queryByRole('button', { name: 'Tablet viewport' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Toggle inline edit mode' }),
    ).toBeNull()
  })
})
