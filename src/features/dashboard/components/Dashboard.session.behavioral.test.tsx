// @vitest-environment jsdom
//
// Behavioral tests for the Dashboard session workspace. These tests assert the
// EXPECTED, CORRECT behavior of the dashboard around generation handoff, live
// Convex queries, fallback polling, ready-session caching, admin URL sync,
// progress reporting, edit override mapping, theme resolution, and scroll
// preservation. If any of these behaviors regress, the corresponding test MUST
// fail — these tests never pin buggy behavior.
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

// ─── controllable convex / controller test state ───────────────────────────
type EditEntry = {
  editType: 'text' | 'ai_rewrite' | 'style' | 'image'
  beforeText?: string
  afterText?: string
  occurrenceIndex?: number
  previewVersion?: number
}

type SessionState = {
  status: string
  previewVersion?: number
  prompt?: string
  preferredLanguage?: string
  isPrivate?: boolean
  themeOverride?: string | null
  themeMode?: 'light' | 'dark' | null
  engineVersion?: string
  designReferenceUrls?: string[]
  designReferenceNotes?: string
  cloneUrl?: string
  selectedBrandLogo?: {
    name: string
    domain?: string | null
    brandId?: string | null
    icon?: string | null
    logo?: string | null
  } | null
}

type GenerationView = {
  session: SessionState & { sessionId: string }
  tasks: Array<{
    status: string
    title?: string
    taskKey?: string
    _id?: string
  }>
  events: unknown[]
  homeModule?: {
    source: string
    status?: string
    updatedAt?: number
    moduleKey?: string
  }
  siteSpec?: { specJson?: string; updatedAt?: number } | null
  latestPreview?: {
    html?: string
    siteSpecJson?: string
    version?: number
  } | null
}

type EditControllerStub = {
  edits: EditEntry[] | null
  history: Array<{ version: number }> | null
  applyEdit: ReturnType<typeof vi.fn>
  forkCurrentSession: ReturnType<typeof vi.fn>
  restoreVersion: ReturnType<typeof vi.fn>
  editError?: string
  isEditing?: boolean
  isForking?: boolean
}

type ConvexTestState = {
  generationView: GenerationView | null | undefined
  sidePanelData: { status?: string; url?: string; slug?: string } | null
  publishMutation: ReturnType<typeof vi.fn>
  themeMutation: ReturnType<typeof vi.fn>
  editController: EditControllerStub
}

const getConvexState = (): ConvexTestState => {
  const testGlobal = globalThis as typeof globalThis & {
    __shipFastDashboardSessionConvexState?: ConvexTestState
  }
  testGlobal.__shipFastDashboardSessionConvexState ??= {
    generationView: null,
    sidePanelData: null,
    publishMutation: vi.fn().mockResolvedValue(undefined),
    themeMutation: vi.fn().mockResolvedValue(undefined),
    editController: {
      edits: [],
      history: [],
      applyEdit: vi.fn().mockResolvedValue(true),
      forkCurrentSession: vi.fn().mockResolvedValue(true),
      restoreVersion: vi.fn().mockResolvedValue(undefined),
      editError: undefined,
      isEditing: false,
      isForking: false,
    },
  }
  return testGlobal.__shipFastDashboardSessionConvexState
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

vi.mock('@/shared/auth/clerk-runtime', () => ({
  isClerkClientEnabled: () => false,
}))

vi.mock('convex/react', () => ({
  useAction: () => vi.fn(),
  useMutation: () => {
    const state = (
      globalThis as typeof globalThis & {
        __shipFastDashboardSessionConvexState?: ConvexTestState
      }
    ).__shipFastDashboardSessionConvexState
    return state?.publishMutation ?? vi.fn().mockResolvedValue(undefined)
  },
  useQuery: (_query: unknown, args: unknown) => {
    const state = (
      globalThis as typeof globalThis & {
        __shipFastDashboardSessionConvexState?: ConvexTestState
      }
    ).__shipFastDashboardSessionConvexState
    if (args === 'skip' || args == null) return null
    if (typeof args === 'object' && 'lookup' in args) {
      // Tri-state: undefined (loading / WebSocket failure), null (missing),
      // or a full generation view.
      return state?.generationView
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
  CommercePanel: () => <div data-testid="commerce-panel-stub" />,
}))
vi.mock('@/features/exports/components/ExportPanel', () => ({
  ExportPanel: () => <div data-testid="export-panel-stub" />,
}))
vi.mock('@/features/deployments/components/DeploymentPanel', () => ({
  DeploymentPanel: () => <div data-testid="deployment-panel-stub" />,
}))
vi.mock('@/features/github/components/GitHubPanel', () => ({
  GitHubPanel: () => <div data-testid="github-panel-stub" />,
}))

vi.mock('@/genui/components/ThemePicker', () => ({
  default: ({ trigger }: { trigger: ReactNode }) => <>{trigger}</>,
}))

vi.mock('@/genui/theme-apply', () => ({
  // resolveThemeStyles must return a palette object with both modes plus a
  // themeName label so themeButtonStyle can read styles[isDark ? 'dark' : 'light'].
  resolveThemeStyles: (name: string | null | undefined) =>
    name
      ? {
          themeName: name,
          dark: {
            primary: '#0ea5e9',
            secondary: '#6366f1',
            accent: '#a855f7',
            'chart-1': '#22d3ee',
            'chart-2': '#818cf8',
            'chart-3': '#e879f9',
          },
          light: {
            primary: '#0284c7',
            secondary: '#4f46e5',
            accent: '#9333ea',
            'chart-1': '#06b6d4',
            'chart-2': '#6366f1',
            'chart-3': '#d946ef',
          },
        }
      : undefined,
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => undefined,
}))

vi.mock('@/features/editing/hooks/useEditController', () => ({
  useEditController: () => {
    const state = (
      globalThis as typeof globalThis & {
        __shipFastDashboardSessionConvexState?: ConvexTestState
      }
    ).__shipFastDashboardSessionConvexState
    return state?.editController
  },
}))

vi.mock('@/features/editing/hooks/useUndoRedo', () => ({
  useUndoRedo: () => ({
    canUndo: false,
    canRedo: false,
    undo: vi.fn(),
    redo: vi.fn(),
  }),
}))

vi.mock('@/features/editing/hooks/useReorderElement', () => ({
  useReorderElement: () => ({
    reorder: vi.fn().mockResolvedValue(true),
    isReordering: false,
    reorderError: undefined,
  }),
}))

vi.mock('@/features/clone/hooks/useClonePageNav', () => ({
  useClonePageNav: () => ({
    currentHtml: null,
    currentUrl: null,
    currentPath: '',
    pages: [],
    isClone: false,
  }),
}))

vi.mock('@/features/editing/components/InlineEditToolbar', () => ({
  InlineEditToolbar: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <div data-testid="inline-edit-toolbar">Inline edit toolbar</div>
    ) : null,
}))

// IntroLoader stub: surfaces the progress/phase props so the dashboard's
// handoff and progress wiring can be observed without depending on the real
// loader's internal animation timers.
vi.mock('@/components/GenUI/IntroLoader', () => ({
  IntroLoader: (props: { progress?: number; phase?: string }) => (
    <div
      data-testid="intro-loader"
      data-progress={props.progress}
      data-phase={props.phase}
    >
      Loading
    </div>
  ),
}))

// GeneratedModulePreview stub: surfaces every prop that the dashboard maps
// (source, image/style/text overrides, theme styles, device mode, edit mode,
// site spec, locale, prompt) and simulates a scrollable .genui-preview
// container so the scroll-preservation behavior can be exercised.
const setupPreviewScroll = (el: HTMLElement | null) => {
  if (!el) return
  let scrollTop = 0
  Object.defineProperty(el, 'scrollHeight', {
    configurable: true,
    get: () => 1000,
  })
  Object.defineProperty(el, 'clientHeight', {
    configurable: true,
    get: () => 300,
  })
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
    set: (v: number) => {
      scrollTop = v
    },
  })
}

vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: (props: {
    source?: string
    imageOverrides?: unknown
    styleOverrides?: unknown
    textOverrides?: unknown
    themeStyles?: unknown
    isDark?: boolean
    deviceMode?: string
    editMode?: boolean
    siteSpecJson?: string
    locale?: string
    prompt?: string
    selectedBrandLogo?: unknown
    onTextChange?: (change: {
      oldText: string
      newText: string
      element: HTMLElement
      occurrenceIndex: number
    }) => void
  }) => (
    <div
      data-testid="generated-module-preview"
      className="genui-preview"
      ref={setupPreviewScroll}
    >
      <span data-testid="gmp-source">{props.source ?? ''}</span>
      <span data-testid="gmp-image-overrides">
        {JSON.stringify(props.imageOverrides ?? null)}
      </span>
      <span data-testid="gmp-style-overrides">
        {JSON.stringify(props.styleOverrides ?? null)}
      </span>
      <span data-testid="gmp-text-overrides">
        {JSON.stringify(props.textOverrides ?? null)}
      </span>
      <span data-testid="gmp-theme-styles">
        {JSON.stringify(props.themeStyles ?? null)}
      </span>
      <span data-testid="gmp-is-dark">{String(props.isDark)}</span>
      <span data-testid="gmp-device-mode">{props.deviceMode ?? ''}</span>
      <span data-testid="gmp-edit-mode">{String(props.editMode)}</span>
      <span data-testid="gmp-site-spec">{props.siteSpecJson ?? ''}</span>
      <span data-testid="gmp-locale">{props.locale ?? ''}</span>
      <span data-testid="gmp-selected-brand-logo">
        {JSON.stringify(props.selectedBrandLogo ?? null)}
      </span>
      <button
        type="button"
        data-testid="gmp-trigger-text-change"
        onClick={() => {
          const el = document.createElement('h1')
          el.textContent = 'Hello world'
          props.onTextChange?.({
            oldText: 'Hello world',
            newText: 'Hi there',
            element: el,
            occurrenceIndex: 0,
          })
        }}
      >
        trigger text change
      </button>
    </div>
  ),
}))

// ─── fixtures ──────────────────────────────────────────────────────────────
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
  tasks: overrides.tasks ?? [
    { status: 'succeeded', title: 'Build', taskKey: 'build' },
  ],
  events: overrides.events ?? [],
  homeModule: {
    moduleKey: 'home',
    source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
    status: 'succeeded',
    updatedAt: 100,
    ...overrides.homeModule,
  },
  siteSpec: overrides.siteSpec ?? null,
  latestPreview: overrides.latestPreview ?? null,
})

const generatingGenerationView = (
  overrides: Partial<GenerationView> = {},
): GenerationView => ({
  session: {
    sessionId: 'generating-session',
    status: 'running',
    prompt: 'A generating website',
    preferredLanguage: 'en',
    ...overrides.session,
  },
  tasks: overrides.tasks ?? [
    { status: 'running', title: 'Build', taskKey: 'build' },
  ],
  events: overrides.events ?? [],
  homeModule: {
    source: '',
    status: 'running',
    updatedAt: 50,
    ...overrides.homeModule,
  },
  siteSpec: overrides.siteSpec ?? null,
  latestPreview: overrides.latestPreview ?? null,
})

const realConvexStreamingSession = {
  sessionId: 'k5739j2a2meyfe8ah0fe5g9jx189jndy',
  status: 'streaming',
  prompt:
    'dog food saas with a premium responsive layout, strong visuals, useful content blocks, FAQs, and a simple contact flow. with a modern SaaS layout, dashboard preview, benefits, use cases, testimonials, and conversion-focused pricing.',
  preferredLanguage: 'en',
  previewVersion: 0,
  task: {
    status: 'failed',
    title: 'Generate homepage',
    taskKey: 'homepage',
  },
} satisfies {
  sessionId: string
  status: string
  prompt: string
  preferredLanguage: string
  previewVersion: number
  task: { status: string; title: string; taskKey: string }
}

const setHandoffFlag = (sessionId: string) => {
  // takeGenerationLaunchHandoff reads `ship-fast:generation-launch:<id>` == '1'.
  window.sessionStorage.setItem(`ship-fast:generation-launch:${sessionId}`, '1')
}

const setupReady = (overrides: Partial<GenerationView> = {}) => {
  getConvexState().generationView = readyGenerationView(overrides)
  getConvexState().sidePanelData = null
  getConvexState().editController.edits = []
}

const resetEditController = () => {
  getConvexState().editController = {
    edits: [],
    history: [],
    applyEdit: vi.fn().mockResolvedValue(true),
    forkCurrentSession: vi.fn().mockResolvedValue(true),
    restoreVersion: vi.fn().mockResolvedValue(undefined),
    editError: undefined,
    isEditing: false,
    isForking: false,
  }
}

// ─── tests ─────────────────────────────────────────────────────────────────
describe('Dashboard session workspace + fallback polling + intro loader', () => {
  beforeEach(() => {
    ensureWindowStorage()
    getConvexState().generationView = null
    getConvexState().sidePanelData = null
    getConvexState().publishMutation = vi.fn().mockResolvedValue(undefined)
    getConvexState().themeMutation = vi.fn().mockResolvedValue(undefined)
    resetEditController()
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.history.replaceState(null, '', '/')
    window.matchMedia = vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    cleanup()
    // Safety net: the polling test uses vi.useFakeTimers() inside a
    // try/finally; if it times out the finally may not run, so ensure real
    // timers are restored for subsequent tests (waitFor hangs under faked timers).
    vi.useRealTimers()
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.history.replaceState(null, '', '/')
    getConvexState().generationView = null
    getConvexState().sidePanelData = null
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  // 1. Generation launch handoff → intro loader shows
  it('shows the intro loader when the generation launch handoff flag is set', () => {
    setHandoffFlag('handoff-session')
    getConvexState().generationView = generatingGenerationView({
      session: { sessionId: 'handoff-session', status: 'running' },
    })
    render(<Dashboard sessionId="handoff-session" />)

    // Expected: a generation-flow handoff drives the dashboard to render the
    // IntroLoader overlay until the preview becomes renderable.
    expect(screen.getByTestId('intro-loader')).toBeTruthy()
  })

  it('shows the intro loader for a real non-ready session with no renderable preview even without launch handoff', () => {
    getConvexState().generationView = generatingGenerationView({
      session: {
        sessionId: realConvexStreamingSession.sessionId,
        status: realConvexStreamingSession.status,
        prompt: realConvexStreamingSession.prompt,
        preferredLanguage: realConvexStreamingSession.preferredLanguage,
        previewVersion: realConvexStreamingSession.previewVersion,
      },
      tasks: [realConvexStreamingSession.task],
      homeModule: {
        moduleKey: 'home',
        source: '',
        status: 'running',
        updatedAt: 1782761944253,
      },
    })

    render(<Dashboard sessionId={realConvexStreamingSession.sessionId} />)

    expect(screen.getByTestId('intro-loader')).toBeTruthy()
    expect(screen.queryByTestId('generated-module-preview')).toBeNull()
  })

  it('keeps the intro loader up for a ready-marked real session when no preview content exists', () => {
    getConvexState().generationView = readyGenerationView({
      session: {
        sessionId: realConvexStreamingSession.sessionId,
        status: 'preview_ready',
        prompt: realConvexStreamingSession.prompt,
        preferredLanguage: realConvexStreamingSession.preferredLanguage,
        previewVersion: 1,
      },
      tasks: [
        {
          status: 'succeeded',
          title: realConvexStreamingSession.task.title,
          taskKey: realConvexStreamingSession.task.taskKey,
        },
      ],
      homeModule: {
        moduleKey: 'home',
        source: '',
        status: 'succeeded',
        updatedAt: 1782761944253,
      },
      latestPreview: {
        html: '',
        version: 1,
      },
    })

    render(<Dashboard sessionId={realConvexStreamingSession.sessionId} />)

    expect(screen.getByTestId('intro-loader')).toBeTruthy()
    expect(screen.queryByTestId('generated-module-preview')).toBeNull()
  })

  // 2. Live Convex query → preview renders
  it('renders the generated preview from the live Convex generation view', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    // Expected: a preview_ready session with a home module source renders the
    // GeneratedModulePreview with that source.
    expect(screen.getByTestId('generated-module-preview')).toBeTruthy()
    expect(screen.getByTestId('gmp-source').textContent).toContain(
      '<h1>Ready</h1>',
    )
  })

  it('passes the persisted selected brand logo into the generated preview', () => {
    const selectedBrandLogo = {
      name: 'Linear',
      domain: 'linear.app',
      brandId: 'linear',
      icon: 'https://cdn.test/linear-icon.png',
      logo: null,
    }
    setupReady({
      session: {
        sessionId: 'ready-session',
        status: 'preview_ready',
        selectedBrandLogo,
      },
    })

    render(<Dashboard sessionId="ready-session" />)

    expect(
      JSON.parse(screen.getByTestId('gmp-selected-brand-logo').textContent!),
    ).toEqual(selectedBrandLogo)
  })

  // 3. Fallback polling: WebSocket failure → 1.5s polling; success → stops
  it('starts 1.5s fallback polling on WebSocket failure and stops when the live query recovers', async () => {
    vi.useFakeTimers()
    try {
      // undefined = live query loading / WebSocket failure → fallback kicks in.
      getConvexState().generationView = undefined
      const readyFetchPayload = {
        sessionId: 'poll-session',
        status: 'preview_ready',
        prompt: 'A polled site',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        previewVersion: 1,
        homeModule: {
          moduleKey: 'home',
          source: '<!doctype html><html><body><h1>Polled</h1></body></html>',
          status: 'succeeded',
          updatedAt: 999,
        },
        preview: null,
        siteSpec: null,
        tasks: [{ id: 't1', title: 'Build', status: 'succeeded' }],
      }
      const fetchMock = vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => readyFetchPayload })
      vi.stubGlobal('fetch', fetchMock)

      const { rerender } = render(<Dashboard sessionId="poll-session" />)

      // Expected: the immediate fallback fetch fires on mount and the first
      // 1.5s polling tick applies the polled snapshot so the preview renders.
      // (waitFor cannot be used because its own setInterval is also faked.)
      await vi.advanceTimersByTimeAsync(1500)
      expect(screen.getByTestId('gmp-source').textContent).toContain(
        '<h1>Polled</h1>',
      )

      // Expected: polling continues at a 1.5s cadence → another fetch fires.
      const callsAfterFirst = fetchMock.mock.calls.length
      expect(callsAfterFirst).toBeGreaterThanOrEqual(1)
      await vi.advanceTimersByTimeAsync(1500)
      expect(fetchMock.mock.calls.length).toBeGreaterThan(callsAfterFirst)

      // Expected: when the live Convex query recovers, the polling effect
      // cleanup clears the interval → no further fetches.
      getConvexState().generationView = readyGenerationView({
        session: { sessionId: 'poll-session', status: 'preview_ready' },
      })
      rerender(<Dashboard sessionId="poll-session" />)

      const callsBeforeStop = fetchMock.mock.calls.length
      await vi.advanceTimersByTimeAsync(3000)
      expect(fetchMock.mock.calls.length).toBe(callsBeforeStop)
    } finally {
      vi.useRealTimers()
    }
  })

  // 4. Ready session → cached in localStorage
  it('caches a ready session in localStorage', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    // Expected: rememberReadySessionPreview writes the ready snapshot under the
    // preview cache key so a later WebSocket failure can restore from cache.
    const previewCache = window.localStorage.getItem(
      'ship-fast:ready-session-preview:v1:ready-session',
    )
    expect(previewCache).not.toBeNull()
    expect(previewCache).toContain('ready-session')

    // Expected: rememberReadySession writes a session cache entry under the
    // shared ready-session key prefix.
    const sessionKeys = Array.from(
      { length: window.localStorage.length },
      (_, i) => window.localStorage.key(i),
    ).filter(
      (k): k is string =>
        k !== null && k.startsWith('ship-fast:ready-session:v1:'),
    )
    expect(sessionKeys.length).toBeGreaterThanOrEqual(1)
  })

  // 5. Admin URL → updates to /generate/{id}/admin
  it('updates the URL to /generate/{id}/admin when admin view is toggled', () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(screen.getByRole('button', { name: 'Open auto admin' }))

    // Expected: toggling admin pushes /generate/<id>/admin to history and the
    // URL pill reflects it.
    expect(window.location.pathname).toBe('/generate/ready-session/admin')
    const urlText = document.querySelector('#url-text') as HTMLAnchorElement
    expect(urlText.textContent).toBe('/generate/ready-session/admin')
  })

  // 6. Progress: 50% tasks → progress bar shows 50%
  it('passes 50% progress to the intro loader when half the tasks are done', () => {
    setHandoffFlag('progress-session')
    getConvexState().generationView = generatingGenerationView({
      session: { sessionId: 'progress-session', status: 'running' },
      tasks: [
        { status: 'succeeded', title: 'Plan', taskKey: 'plan' },
        { status: 'running', title: 'Build', taskKey: 'build' },
      ],
    })
    render(<Dashboard sessionId="progress-session" />)

    // Expected: progress = round(succeeded/total*100) = 50, forwarded to the
    // loader as Math.min(0.94, 50/100) = 0.5.
    const loader = screen.getByTestId('intro-loader')
    expect(loader.getAttribute('data-progress')).toBe('0.5')
  })

  // 7. Image overrides → applied to preview
  it('maps image edits into imageOverrides passed to the preview', () => {
    setupReady()
    getConvexState().editController.edits = [
      {
        editType: 'image',
        beforeText: 'hero-alt',
        afterText: 'https://images/new-hero.jpg',
      },
    ]
    render(<Dashboard sessionId="ready-session" />)

    // Expected: image edits become a { alt: url } map forwarded to the preview.
    const raw = screen.getByTestId('gmp-image-overrides').textContent ?? ''
    expect(raw).toContain('hero-alt')
    expect(raw).toContain('https://images/new-hero.jpg')
  })

  // 8. Style overrides → applied to preview
  it('maps style edits into styleOverrides passed to the preview', () => {
    setupReady()
    getConvexState().editController.edits = [
      {
        editType: 'style',
        beforeText: '.btn',
        afterText: 'color:red;font-weight:700',
        occurrenceIndex: 0,
      },
    ]
    render(<Dashboard sessionId="ready-session" />)

    // Expected: style edits become { classAnchor, occurrenceIndex, style }
    // entries forwarded to the preview.
    const raw = screen.getByTestId('gmp-style-overrides').textContent ?? ''
    expect(raw).toContain('.btn')
    expect(raw).toContain('color:red;font-weight:700')
    expect(raw).toContain('"occurrenceIndex":0')
  })

  // 9. Text overrides → applied to preview
  it('maps text edits into textOverrides passed to the preview', () => {
    setupReady()
    getConvexState().editController.edits = [
      {
        editType: 'text',
        beforeText: 'Hello',
        afterText: 'Hi there',
        occurrenceIndex: 1,
      },
    ]
    render(<Dashboard sessionId="ready-session" />)

    // Expected: text edits become { beforeText, afterText, occurrenceIndex }
    // entries forwarded to the preview.
    const raw = screen.getByTestId('gmp-text-overrides').textContent ?? ''
    expect(raw).toContain('"beforeText":"Hello"')
    expect(raw).toContain('"afterText":"Hi there"')
    expect(raw).toContain('"occurrenceIndex":1')
  })

  // 10. Theme name → correct theme applied
  it('resolves the site theme name from the site spec and applies it to the preview', () => {
    setupReady({
      siteSpec: {
        specJson: JSON.stringify({ themeName: 'ocean-breeze' }),
        updatedAt: 100,
      },
    })
    render(<Dashboard sessionId="ready-session" />)

    // Expected: the themeName in the site spec resolves to a theme that is
    // forwarded to the preview as themeStyles.
    const themeRaw = screen.getByTestId('gmp-theme-styles').textContent ?? ''
    expect(themeRaw).toContain('ocean-breeze')

    // Expected: the formatted theme label is rendered on the Theme rail button.
    expect(screen.getByText('Ocean Breeze')).toBeTruthy()
  })

  // 11. Server theme override → synced to preview
  it('syncs a server theme override to the preview', () => {
    setupReady({
      session: {
        sessionId: 'ready-session',
        themeOverride: 'midnight',
        status: 'preview_ready',
      },
    })
    render(<Dashboard sessionId="ready-session" />)

    // Expected: a server-provided themeOverride takes precedence over the
    // site-spec theme and is forwarded to the preview.
    const themeRaw = screen.getByTestId('gmp-theme-styles').textContent ?? ''
    expect(themeRaw).toContain('midnight')
    expect(screen.getByText('Midnight')).toBeTruthy()
  })

  // 12. Scroll position preserved across remounts
  it('restores the preview scroll position after a remount triggered by an edit', async () => {
    setupReady({
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
        status: 'succeeded',
        updatedAt: 100,
      },
    })
    const { rerender } = render(<Dashboard sessionId="ready-session" />)

    const previewEl = document.querySelector(
      '.genui-preview',
    ) as HTMLElement | null
    expect(previewEl).not.toBeNull()
    // Scroll the preview down before the edit.
    previewEl!.scrollTop = 200

    // Trigger an inline text edit; the handler saves scrollTop before applying.
    fireEvent.click(screen.getByTestId('gmp-trigger-text-change'))
    expect(getConvexState().editController.applyEdit).toHaveBeenCalled()

    // Bump the preview version so renderedPreviewKey changes → remount + restore.
    const bumped = readyGenerationView({
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready v2</h1></body></html>',
        status: 'succeeded',
        updatedAt: 200,
      },
    })
    getConvexState().generationView = bumped
    rerender(<Dashboard sessionId="ready-session" />)

    // Expected: after the remount the scroll position is restored to 200.
    await waitFor(() => {
      const restored = document.querySelector(
        '.genui-preview',
      ) as HTMLElement | null
      expect(restored).not.toBeNull()
      expect(restored!.scrollTop).toBe(200)
    })
  })
})
