// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import type { MouseEventHandler, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Dashboard } from './Dashboard'

const routerMocks = vi.hoisted(() => ({
  canGoBack: false,
  historyBack: vi.fn(),
  navigate: vi.fn(),
}))

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
  sidePanelData: {
    status?: string
    url?: string
    slug?: string
    shipfastUrl?: string
  } | null
  publishMutation: ReturnType<typeof vi.fn>
  themeMutation: ReturnType<typeof vi.fn>
}

type AuthTestState = {
  clerkEnabled: boolean
  isSignedIn: boolean
  openSignIn: ReturnType<typeof vi.fn>
  ownerSecret?: string
}

const { authState } = vi.hoisted(() => ({
  authState: {
    clerkEnabled: false,
    isSignedIn: false,
    openSignIn: vi.fn(),
    ownerSecret: undefined as string | undefined,
  },
}))

function getConvexState(): ConvexTestState {
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

function getAuthState(): AuthTestState {
  return authState
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
    isSignedIn: authState.isSignedIn,
    userId: authState.isSignedIn ? 'user_1' : null,
    getToken: async () => null,
  }),
  useClerk: () => ({
    session: authState.isSignedIn ? {} : null,
    user: authState.isSignedIn ? {} : null,
    openSignIn: authState.openSignIn,
  }),
}))

vi.mock('@/shared/auth/clerk-runtime', () => ({
  isClerkClientEnabled: () => authState.clerkEnabled,
}))

vi.mock('@/shared/auth/use-optional-auth', () => ({
  useIsAdmin: () => false,
  useOptionalAuth: () => ({
    getToken: async () => null,
    isLoaded: true,
    isSignedIn: authState.isSignedIn,
  }),
  useOptionalClerk: () => ({
    openSignIn: authState.openSignIn,
    openUserProfile: vi.fn(),
    session: authState.isSignedIn ? {} : null,
    user: authState.isSignedIn ? {} : null,
  }),
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
  Link: ({
    children,
    onClick,
    to,
    ...props
  }: {
    children: ReactNode
    onClick?: MouseEventHandler<HTMLAnchorElement>
    to: string
    [key: string]: unknown
  }) => (
    <a
      href={to}
      onClick={(event) => {
        onClick?.(event)
        routerMocks.navigate(to)
      }}
      {...props}
    >
      {children}
    </a>
  ),
  useCanGoBack: () => routerMocks.canGoBack,
  useNavigate: () => routerMocks.navigate,
  useParams: () => ({}),
  useRouter: () => ({ history: { back: routerMocks.historyBack } }),
}))

vi.mock('@ship-fast/lakebed/react', () => ({
  LakebedSessionProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
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
    onElementActivate,
  }: {
    source: string
    editMode: boolean
    deviceMode: string
    onElementActivate?: (element: HTMLElement, rect: DOMRect) => void
  }) => (
    <div data-testid="generated-module-preview">
      <span data-testid="gmp-source">{source}</span>
      <span data-testid="gmp-edit-mode">{String(editMode)}</span>
      <span data-testid="gmp-device-mode">{deviceMode}</span>
      <button
        type="button"
        onClick={() => {
          const element = document.createElement('p')
          element.textContent = 'Editable heading'
          document.body.appendChild(element)
          onElementActivate?.(element, new DOMRect(10, 20, 100, 30))
        }}
      >
        Activate inline element
      </button>
    </div>
  ),
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => authState.ownerSecret,
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
function readyGenerationView(
  overrides: Partial<GenerationView> = {},
): GenerationView {
  return {
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
  }
}

function generatingGenerationView(): GenerationView {
  return {
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
  }
}

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
    routerMocks.canGoBack = false
    routerMocks.historyBack.mockReset()
    routerMocks.navigate.mockReset()
    ensureWindowStorage()
    getConvexState().generationView = null
    getConvexState().sidePanelData = null
    getConvexState().publishMutation = vi.fn().mockResolvedValue(undefined)
    getConvexState().themeMutation = vi.fn().mockResolvedValue(undefined)
    getAuthState().clerkEnabled = false
    getAuthState().isSignedIn = false
    getAuthState().ownerSecret = undefined
    getAuthState().openSignIn = vi.fn()
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.history.replaceState(null, '/')
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
    getAuthState().clerkEnabled = false
    getAuthState().isSignedIn = false
    getAuthState().ownerSecret = undefined
    getAuthState().openSignIn = vi.fn()
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
    expect(getAuthState().openSignIn).not.toHaveBeenCalled()

    // editMode is forwarded to the preview as an observable prop
    expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('true')

    fireEvent.click(pencil)
    expect(pencil.getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('false')
  })

  it('keeps the inline edit toggle reachable in narrow dashboard viewports', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const pencil = screen.getByRole('button', {
      name: 'Toggle inline edit mode',
    })
    const editControls = pencil.closest('[aria-label="Edit controls"]')
    const viewportControls = screen
      .getByRole('button', { name: 'Mobile viewport' })
      .closest('[aria-label="Viewport size"]')

    expect(editControls).not.toBeNull()
    expect(editControls?.className).not.toContain('max-[760px]:hidden')
    expect(viewportControls).not.toBeNull()
    expect(
      editControls!.compareDocumentPosition(viewportControls!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('does not mount the inline toolbar before an editable element is selected', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    expect(screen.queryByTestId('inline-edit-toolbar')).toBeNull()
  })

  it('closes the inline toolbar when edit mode is turned off', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const pencil = screen.getByRole('button', {
      name: 'Toggle inline edit mode',
    })
    fireEvent.click(pencil)
    fireEvent.click(
      screen.getByRole('button', { name: 'Activate inline element' }),
    )

    expect(await screen.findByTestId('inline-edit-toolbar')).toBeTruthy()

    fireEvent.click(pencil)

    expect(pencil.getAttribute('aria-pressed')).toBe('false')
    expect(screen.queryByTestId('inline-edit-toolbar')).toBeNull()
  })

  it('opens Clerk and keeps inline edit mode off when Clerk is enabled and the user is signed out', () => {
    setupReady()
    getAuthState().clerkEnabled = true
    getAuthState().isSignedIn = false
    getAuthState().ownerSecret = 'owned-anonymous-session'
    render(<Dashboard sessionId="ready-session" />)

    const pencil = screen.getByRole('button', {
      name: 'Toggle inline edit mode',
    })

    fireEvent.click(pencil)

    expect(getAuthState().openSignIn).toHaveBeenCalledTimes(1)
    expect(pencil.getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('false')
  })

  // 4. Back button
  it('uses home navigation when router history cannot go back', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const backBtn = screen.getByRole('button', { name: 'Back' })
    expect(backBtn.getAttribute('data-tip')).toBe('Back')

    fireEvent.click(backBtn)
    expect(routerMocks.navigate).toHaveBeenCalledWith({ to: '/' })
    expect(routerMocks.historyBack).not.toHaveBeenCalled()
  })

  it('uses router history when router history can go back', () => {
    routerMocks.canGoBack = true
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(routerMocks.historyBack).toHaveBeenCalledOnce()
    expect(routerMocks.navigate).not.toHaveBeenCalled()
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

  it('shows the shipfast subdomain URL when a shipfast deploy is ready', () => {
    setupReady()
    getConvexState().sidePanelData = {
      status: 'ready',
      slug: 'my-fancy-site',
      url: 'https://my-fancy-site.ship-fast.test',
      shipfastUrl: 'https://my-fancy-site.ship-fast.test',
    }
    render(<Dashboard sessionId="ready-session" />)

    const urlText = document.querySelector('#url-text') as HTMLAnchorElement
    expect(urlText.textContent).toBe('https://my-fancy-site.ship-fast.test')
  })

  it('shows the shipfast subdomain URL, never the lakebed URL, when latest deploy is lakebed', () => {
    setupReady()
    getConvexState().sidePanelData = {
      status: 'ready',
      slug: 'my-fancy-site',
      url: 'https://lakebed.example.com/deploys/abc123',
      shipfastUrl: 'https://my-fancy-site.ship-fast.test',
    }
    render(<Dashboard sessionId="ready-session" />)

    const urlText = document.querySelector('#url-text') as HTMLAnchorElement
    expect(urlText.textContent).toBe('https://my-fancy-site.ship-fast.test')
    expect(urlText.getAttribute('href')).toBe(
      'https://my-fancy-site.ship-fast.test',
    )
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
  it('shows Generating with a static cyan indicator when the session is generating', () => {
    getConvexState().generationView = generatingGenerationView()
    render(<Dashboard sessionId="generating-session" />)

    const statusText = document.querySelector('#status-text')
    const statusDot = document.querySelector('#status-dot')
    expect(statusText?.textContent).toBe('Generating')
    expect(statusDot?.className).toContain('bg-cyan-300')
    expect(statusDot?.className).not.toContain('animate-pulse')
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

  it('passes the resolved Convex session id to export and deployment panels when the route uses a slug', async () => {
    getConvexState().generationView = readyGenerationView({
      session: {
        sessionId: 'real-convex-session',
        status: 'preview_ready',
        prompt: 'A ready website behind a public slug',
        preferredLanguage: 'en',
        isPrivate: false,
      },
    })
    render(<Dashboard sessionId="public-demo-slug" />)

    fireEvent.click(screen.getByRole('button', { name: /Export/i }))
    expect(
      await screen.findByText('Export panel real-convex-session'),
    ).toBeTruthy()
    expect(screen.queryByText('Export panel public-demo-slug')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Deployment URL/i }))
    expect(
      await screen.findByText('Deployment panel real-convex-session'),
    ).toBeTruthy()
    expect(screen.queryByText('Deployment panel public-demo-slug')).toBeNull()
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

  it('marks the Localization siderail item as Pro-only with a crown badge', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const localizationButton = screen.getByRole('button', {
      name: /Localization/i,
    })
    // The Pro-only crown badge is rendered inside the rail row with a shared
    // aria-label, mirroring the Export / GitHub / Billing siderail items.
    expect(
      within(localizationButton).getByLabelText('Pro only - upgrade to unlock'),
    ).toBeTruthy()
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

    // MissingProjectState renders the heading + a back-to-home link
    expect(
      screen.getByText('This generated website is no longer available.'),
    ).toBeTruthy()
    // status rail also reports Project missing
    expect(document.querySelector('#status-text')?.textContent).toBe(
      'Project missing',
    )
    // preview tools are hidden when session is missing
    expect(screen.queryByRole('button', { name: 'Publish preview' })).toBeNull()
    // The missing-state card and topbar both expose back buttons.
    const backButtons = screen.getAllByRole('button', { name: 'Back' })
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

  // 11. Site tools siderail collapse / expand
  it('shows the siderail expanded with a visible collapse button on desktop', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    // Rail is expanded — aside has w-[280px]
    const rail = document.getElementById('preview-site-rail')
    expect(rail?.className).toContain('w-[280px]')
    // Collapse button is visible (opacity-100)
    const collapseBtn = screen.getByRole('button', {
      name: 'Collapse site tools',
    })
    expect(collapseBtn.className).toContain('opacity-100')
    // Expand button is hidden (opacity-0 + pointer-events-none)
    const expandBtn = screen.getByRole('button', {
      name: 'Expand site tools',
    })
    expect(expandBtn.className).toContain('opacity-0')
    expect(expandBtn.className).toContain('pointer-events-none')
  })

  it('collapses the siderail when the collapse button is clicked', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const rail = document.getElementById('preview-site-rail')
    expect(rail?.className).toContain('w-[280px]')

    fireEvent.click(screen.getByRole('button', { name: 'Collapse site tools' }))

    // Rail is now collapsed — aside has w-0
    expect(rail?.className).toContain('w-0')
    // Expand button is now visible
    const expandBtn = screen.getByRole('button', {
      name: 'Expand site tools',
    })
    expect(expandBtn.className).toContain('opacity-100')
    expect(expandBtn.className).not.toContain('pointer-events-none')
    // Collapse button is now hidden
    const collapseBtn = screen.getByRole('button', {
      name: 'Collapse site tools',
    })
    expect(collapseBtn.className).toContain('opacity-0')
    expect(collapseBtn.className).toContain('pointer-events-none')
  })

  it('expands the siderail when the expand button is clicked after collapsing', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    const rail = document.getElementById('preview-site-rail')

    fireEvent.click(screen.getByRole('button', { name: 'Collapse site tools' }))
    expect(rail?.className).toContain('w-0')

    fireEvent.click(screen.getByRole('button', { name: 'Expand site tools' }))

    expect(rail?.className).toContain('w-[280px]')
    const collapseBtn = screen.getByRole('button', {
      name: 'Collapse site tools',
    })
    expect(collapseBtn.className).toContain('opacity-100')
    const expandBtn = screen.getByRole('button', {
      name: 'Expand site tools',
    })
    expect(expandBtn.className).toContain('opacity-0')
  })

  it('does not show collapse/expand buttons when the project is missing', () => {
    getConvexState().generationView = null
    render(<Dashboard sessionId="ghost-session" />)

    expect(
      screen.queryByRole('button', { name: 'Collapse site tools' }),
    ).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Expand site tools' }),
    ).toBeNull()
  })
})
