// @vitest-environment jsdom
//
// Behavioral tests for the Dashboard session workspace. These tests assert the
// EXPECTED, CORRECT behavior of the dashboard around generation handoff, live
// Convex queries, ready-session caching, admin URL sync,
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
  preferredExportTarget?: string
  errorCode?: string
  errorMessage?: string
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
    openUiSource?: string
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
  undoRedo: {
    canUndo: boolean
    canRedo: boolean
    undo: ReturnType<typeof vi.fn>
    redo: ReturnType<typeof vi.fn>
  }
  reorder: {
    reorder: ReturnType<typeof vi.fn>
  }
  pendingTextEdit: {
    commit: ReturnType<typeof vi.fn>
    cancel: ReturnType<typeof vi.fn>
  }
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
    undoRedo: {
      canUndo: false,
      canRedo: false,
      undo: vi.fn(),
      redo: vi.fn(),
    },
    reorder: {
      reorder: vi.fn().mockResolvedValue(true),
    },
    pendingTextEdit: {
      commit: vi.fn(),
      cancel: vi.fn(),
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
  useUndoRedo: () => {
    const state = (
      globalThis as typeof globalThis & {
        __shipFastDashboardSessionConvexState?: ConvexTestState
      }
    ).__shipFastDashboardSessionConvexState
    return (
      state?.undoRedo ?? {
        canUndo: false,
        canRedo: false,
        undo: vi.fn(),
        redo: vi.fn(),
      }
    )
  },
}))

vi.mock('@/features/editing/hooks/useReorderElement', () => ({
  useReorderElement: () => {
    const state = (
      globalThis as typeof globalThis & {
        __shipFastDashboardSessionConvexState?: ConvexTestState
      }
    ).__shipFastDashboardSessionConvexState
    return {
      reorder: state?.reorder.reorder ?? vi.fn().mockResolvedValue(true),
      isReordering: false,
      reorderError: undefined,
    }
  },
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
  InlineEditToolbar: ({
    isOpen,
    onStyleApply,
    onLinkEdit,
    onSectionEdit,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onMoveUp,
    onMoveDown,
    onClose,
    activeElement,
    isApplying,
    isForking,
    isSectionSubmitting,
    sectionError,
  }: {
    isOpen: boolean
    onStyleApply?: (payload: {
      sourceAnchor: string
      style: string
      occurrenceIndex: number
    }) => void
    onLinkEdit?: (payload: {
      oldHref: string
      newHref: string
      oldText: string
      newText: string
      target: string | null
      rel: string
      occurrenceIndex: number
    }) => void
    onSectionEdit?: (prompt: string) => void
    canUndo?: boolean
    canRedo?: boolean
    onUndo?: () => void
    onRedo?: () => void
    onMoveUp?: () => void
    onMoveDown?: () => void
    onClose?: () => void
    activeElement?: HTMLElement | null
    isApplying?: boolean
    isForking?: boolean
    isSectionSubmitting?: boolean
    sectionError?: string
  }) =>
    isOpen ? (
      <div data-testid="inline-edit-toolbar">
        Inline edit toolbar
        <span data-testid="toolbar-is-applying">{String(isApplying)}</span>
        <span data-testid="toolbar-is-forking">{String(isForking)}</span>
        <span data-testid="toolbar-is-section-submitting">
          {String(isSectionSubmitting)}
        </span>
        {sectionError ? (
          <p data-testid="toolbar-section-error">{sectionError}</p>
        ) : null}
        <button
          type="button"
          data-testid="toolbar-trigger-undo"
          disabled={!canUndo}
          onClick={() => onUndo?.()}
        >
          undo
        </button>
        <button
          type="button"
          data-testid="toolbar-trigger-redo"
          disabled={!canRedo}
          onClick={() => onRedo?.()}
        >
          redo
        </button>
        <button
          type="button"
          data-testid="toolbar-trigger-move-up"
          onClick={() => onMoveUp?.()}
        >
          move up
        </button>
        <button
          type="button"
          data-testid="toolbar-trigger-move-down"
          onClick={() => onMoveDown?.()}
        >
          move down
        </button>
        <button
          type="button"
          data-testid="toolbar-trigger-close"
          onClick={() => onClose?.()}
        >
          close toolbar
        </button>
        <button
          type="button"
          data-testid="toolbar-trigger-style-apply"
          onClick={() => {
            if (activeElement) {
              activeElement.style.backgroundColor = 'rgb(255, 0, 0)'
            }
            onStyleApply?.({
              sourceAnchor: 'hero-section',
              style: 'background-color: rgb(255, 0, 0);',
              occurrenceIndex: 0,
            })
          }}
        >
          apply style
        </button>
        <button
          type="button"
          data-testid="toolbar-trigger-link-edit"
          onClick={() =>
            onLinkEdit?.({
              oldHref: '/docs',
              newHref: '/learn',
              oldText: 'Docs',
              newText: 'Learn',
              target: '_blank',
              rel: 'noopener noreferrer',
              occurrenceIndex: 0,
            })
          }
        >
          apply link
        </button>
        <button
          type="button"
          data-testid="toolbar-trigger-section-edit"
          onClick={() =>
            onSectionEdit?.('Make this section more conversion focused')
          }
        >
          apply section edit
        </button>
      </div>
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
    onImageChange?: (change: {
      oldSrc: string
      newSrc: string
      element: HTMLImageElement
      alt: string
    }) => void
    onElementActivate?: (element: HTMLElement, rect: DOMRect) => void
    onCommitText?: (commitFn: () => void, cancelFn: () => void) => void
    onSectionSelect?: (selection: {
      tag: string
      elementPath: string
      textContent: string
      outerHTML: string
      boundingBox: { x: number; y: number; width: number; height: number }
      openuiComponent?: string
      openuiVar?: string
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
      <h1 data-testid="gmp-editable-heading">Hello world</h1>
      <img
        data-testid="gmp-editable-image"
        src="https://images.example/old.jpg"
        alt="Hero product showcase"
      />
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
      <button
        type="button"
        data-testid="gmp-trigger-attached-text-change"
        onClick={(event) => {
          const el = event.currentTarget
            .closest('.genui-preview')
            ?.querySelector<HTMLElement>('[data-testid="gmp-editable-heading"]')
          if (!el) return
          el.textContent = 'Hi there'
          props.onTextChange?.({
            oldText: 'Hello world',
            newText: 'Hi there',
            element: el,
            occurrenceIndex: 0,
          })
        }}
      >
        trigger attached text change
      </button>
      <button
        type="button"
        data-testid="gmp-register-text-edit"
        onClick={() => {
          const state = (
            globalThis as typeof globalThis & {
              __shipFastDashboardSessionConvexState?: ConvexTestState
            }
          ).__shipFastDashboardSessionConvexState
          props.onCommitText?.(
            (state?.pendingTextEdit.commit as () => void) ?? (() => undefined),
            (state?.pendingTextEdit.cancel as () => void) ?? (() => undefined),
          )
        }}
      >
        register text edit
      </button>
      <button
        type="button"
        data-testid="gmp-trigger-image-change"
        onClick={(event) => {
          const el = event.currentTarget
            .closest('.genui-preview')
            ?.querySelector<HTMLImageElement>(
              '[data-testid="gmp-editable-image"]',
            )
          if (!el) return
          props.onImageChange?.({
            oldSrc: 'https://images.example/old.jpg',
            newSrc: 'https://images.example/new.jpg',
            element: el,
            alt: 'Hero product showcase',
          })
        }}
      >
        trigger image change
      </button>
      <button
        type="button"
        data-testid="gmp-trigger-element-activate"
        onClick={() => {
          const el = document.createElement('section')
          el.textContent = 'Hero section'
          props.onElementActivate?.(el, new DOMRect(10, 20, 300, 120))
        }}
      >
        trigger element activate
      </button>
      <button
        type="button"
        data-testid="gmp-trigger-attached-section-activate"
        onClick={(event) => {
          const preview = event.currentTarget.closest('.genui-preview')
          const section = document.createElement('section')
          section.setAttribute('data-openui-component', 'MarketingAgencyHero')
          section.setAttribute('data-openui-var', 'home_hero')
          section.innerHTML = '<h2>Hero section</h2>'
          preview?.append(section)
          const heading = section.querySelector('h2')
          if (heading instanceof HTMLElement) {
            props.onElementActivate?.(heading, new DOMRect(10, 20, 300, 120))
          }
        }}
      >
        trigger attached section activate
      </button>
      <button
        type="button"
        data-testid="gmp-trigger-section-select"
        onClick={(event) => {
          const preview = event.currentTarget.closest('.genui-preview')
          const section = document.createElement('section')
          section.setAttribute('data-testid', 'gmp-inspector-section')
          section.setAttribute('data-openui-component', 'MarketingAgencyHero')
          section.setAttribute('data-openui-var', 'home_inspector_hero')
          section.innerHTML = '<h2>Inspector selected section</h2>'
          preview?.append(section)
          props.onSectionSelect?.({
            tag: 'section',
            elementPath: '[data-testid="gmp-inspector-section"]',
            textContent: 'Inspector selected section',
            outerHTML: section.outerHTML,
            boundingBox: { x: 10, y: 20, width: 300, height: 120 },
            openuiComponent: 'MarketingAgencyHero',
            openuiVar: 'home_inspector_hero',
          })
        }}
      >
        trigger section select
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
  errorCode: 'GENERATION_FAILED',
  errorMessage: 'Ship Fast engine did not write index.html',
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
  errorCode: string
  errorMessage: string
  prompt: string
  preferredLanguage: string
  previewVersion: number
  task: { status: string; title: string; taskKey: string }
}

const dbObservedBreweryOpenUiSource =
  'home_hero = RestaurantHero("Brewery", "Portland\\\'s Craft Brew Haven", "Taproom tours, seasonal releases, and community events", null, null, null, null, "Exterior of Riverbend Brewing taproom")\n' +
  'home_menu = RestaurantMenu("Our Brew Selection", "Explore rotating seasonal ales, lagers, and specialty brews crafted on-site.", [{"name":"categories[Seasonal Releases","items":[{"name":"Pineapple Saison","description":"Tropical notes with a crisp finish","price":"$7","tag":"Limited"},{"name":"Chocolate Stout","description":"Rich cocoa and roasted malt","price":"$8","tag":"Seasonal"}]}])\n' +
  'home = Stack([home_hero, home_menu])\n' +
  'root = PageSwitch(["Home"], [home], "", {"Home":"home"})'

const dbObservedBreweryRenderedHtml = `<!doctype html>
<html lang="en">
<body>
  <div id="openui-root" class="genui-preview dark" style="--background: 240 10% 3.9%; color-scheme: dark">
    <section data-sf-export-page="Home">
      <main>
        <h1 class="hero-title" style="color: rgb(255, 255, 255);">Portland's Craft Brew Haven</h1>
        <p>Taproom tours, seasonal releases, and community events</p>
        <h2>Our Brew Selection</h2>
        <article>Pineapple Saison</article>
      </main>
    </section>
  </div>
</body>
</html>`

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
  getConvexState().undoRedo = {
    canUndo: false,
    canRedo: false,
    undo: vi.fn(),
    redo: vi.fn(),
  }
  getConvexState().reorder = {
    reorder: vi.fn().mockResolvedValue(true),
  }
  getConvexState().pendingTextEdit = {
    commit: vi.fn(),
    cancel: vi.fn(),
  }
}

// ─── tests ─────────────────────────────────────────────────────────────────
describe('Dashboard session workspace + Convex realtime + intro loader', () => {
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
    // Safety net: realtime loading tests use vi.useFakeTimers() inside a
    // try/finally; if one times out the finally may not run, so ensure real
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

  it('does not hide a DB-observed generation failure behind the intro loader', () => {
    getConvexState().generationView = generatingGenerationView({
      session: {
        sessionId: realConvexStreamingSession.sessionId,
        status: realConvexStreamingSession.status,
        errorCode: realConvexStreamingSession.errorCode,
        errorMessage: realConvexStreamingSession.errorMessage,
        prompt: realConvexStreamingSession.prompt,
        preferredLanguage: realConvexStreamingSession.preferredLanguage,
        previewVersion: realConvexStreamingSession.previewVersion,
      },
      tasks: [realConvexStreamingSession.task],
      homeModule: undefined,
      latestPreview: null,
    })

    render(<Dashboard sessionId={realConvexStreamingSession.sessionId} />)

    expect(screen.queryByTestId('intro-loader')).toBeNull()
    expect(screen.queryByTestId('generated-module-preview')).toBeNull()
    expect(
      screen.getByText('Ship Fast engine did not write index.html'),
    ).toBeTruthy()
    expect(screen.queryByText('Generating')).toBeNull()
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

  it('does not mount a generated preview with blank render input', () => {
    getConvexState().generationView = readyGenerationView({
      session: {
        sessionId: 'blank-preview-session',
        status: 'preview_ready',
        prompt: 'blank preview should not be considered renderable',
        previewVersion: 1,
      },
      tasks: [
        {
          status: 'succeeded',
          title: 'Generate homepage',
          taskKey: 'homepage',
        },
      ],
      homeModule: {
        moduleKey: 'home',
        source: '   \n\t',
        status: 'succeeded',
        updatedAt: 1782814095839,
      },
      latestPreview: null,
    })

    render(<Dashboard sessionId="blank-preview-session" />)

    expect(screen.queryByTestId('generated-module-preview')).toBeNull()
    expect(screen.getByTestId('intro-loader')).toBeTruthy()
  })

  it('renders DB-observed v3 gallery sessions immediately when static preview HTML is empty but OpenUI output is ready', () => {
    getConvexState().generationView = readyGenerationView({
      session: {
        sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
        status: 'preview_ready',
        prompt:
          'a craft beer brewery with taproom tours and seasonal releases in portland',
        preferredLanguage: 'lt',
        engineVersion: 'v3',
        previewVersion: 1,
        themeMode: 'dark',
        themeOverride: 'darkmatter',
      },
      tasks: [
        {
          status: 'succeeded',
          title: 'Generate v3 homepage',
          taskKey: 'homepage',
        },
      ],
      homeModule: {
        moduleKey: 'home',
        source: dbObservedBreweryOpenUiSource,
        status: 'succeeded',
        updatedAt: 1782814095839,
      },
      latestPreview: {
        html: '',
        openUiSource: dbObservedBreweryOpenUiSource,
        siteSpecJson: JSON.stringify({
          brand: 'Craft Beer Brewery',
          theme: 't3-chat',
          locale: 'en',
        }),
        version: 1,
      },
    })

    render(<Dashboard sessionId="k574ms14ma9f94keq30r7dq24x89n1k2" />)

    expect(screen.queryByTestId('intro-loader')).toBeNull()
    expect(screen.getByTestId('generated-module-preview')).toBeTruthy()
    const source = screen.getByTestId('gmp-source').textContent ?? ''
    expect(source).toContain('Pineapple Saison')
    expect(source).toContain('Our Brew Selection')
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

  it('renders ready DB-observed OpenUI sessions from the static rendered HTML artifact instead of live OpenUI source', () => {
    getConvexState().generationView = readyGenerationView({
      session: {
        sessionId: 'k574ms14ma9f94keq30r7dq24x89n1k2',
        status: 'preview_ready',
        prompt:
          'a craft beer brewery with taproom tours and seasonal releases in portland',
        preferredLanguage: 'lt',
        engineVersion: 'v3',
        previewVersion: 1,
        themeMode: 'dark',
        themeOverride: 'darkmatter',
      },
      tasks: [
        {
          status: 'succeeded',
          title: 'Generate v3 homepage',
          taskKey: 'homepage',
        },
      ],
      homeModule: {
        moduleKey: 'home',
        source: dbObservedBreweryOpenUiSource,
        status: 'succeeded',
        updatedAt: 1782814095839,
      },
      latestPreview: {
        html: dbObservedBreweryRenderedHtml,
        siteSpecJson: JSON.stringify({
          brand: 'Craft Beer Brewery',
          theme: 'darkmatter',
        }),
        version: 1,
      },
    })

    render(<Dashboard sessionId="k574ms14ma9f94keq30r7dq24x89n1k2" />)

    const source = screen.getByTestId('gmp-source').textContent ?? ''
    expect(source).toContain('data-sf-export-page="Home"')
    expect(source).toContain('Pineapple Saison')
    expect(source).toContain('style="color: rgb(255, 255, 255);"')
    expect(source).not.toContain('RestaurantMenu(')
    expect(source).not.toContain('PageSwitch(')
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

  // 3. Convex realtime query drives readiness. No REST fallback fetches.
  it('does not poll the session REST API while waiting for Convex realtime state', async () => {
    vi.useFakeTimers()
    try {
      getConvexState().generationView = undefined
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn() })
      vi.stubGlobal('fetch', fetchMock)

      render(<Dashboard sessionId="loading-session" />)

      expect(screen.getByTestId('intro-loader')).toBeTruthy()
      expect(screen.queryByTestId('generated-module-preview')).toBeNull()

      await vi.advanceTimersByTimeAsync(5000)

      expect(fetchMock).not.toHaveBeenCalled()
      expect(screen.getByTestId('intro-loader')).toBeTruthy()
      expect(screen.queryByTestId('generated-module-preview')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('renders when the Convex realtime query emits a renderable preview', () => {
    getConvexState().generationView = undefined
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn() })
    vi.stubGlobal('fetch', fetchMock)

    const { rerender } = render(<Dashboard sessionId="realtime-session" />)

    expect(screen.getByTestId('intro-loader')).toBeTruthy()
    expect(screen.queryByTestId('generated-module-preview')).toBeNull()

    getConvexState().generationView = readyGenerationView({
      session: { sessionId: 'realtime-session', status: 'preview_ready' },
      homeModule: {
        moduleKey: 'home',
        source:
          '<!doctype html><html><body><h1>Realtime Ready</h1></body></html>',
        status: 'succeeded',
        updatedAt: 1782814095839,
      },
    })
    rerender(<Dashboard sessionId="realtime-session" />)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.queryByTestId('intro-loader')).toBeNull()
    expect(screen.getByTestId('generated-module-preview')).toBeTruthy()
    expect(screen.getByTestId('gmp-source').textContent).toContain(
      'Realtime Ready',
    )
  })

  it('renders already-built static HTML from Convex realtime without requiring a home module source', () => {
    getConvexState().generationView = readyGenerationView({
      session: {
        sessionId: 'static-gallery-session',
        status: 'preview_ready',
        prompt:
          'a craft beer brewery with taproom tours and seasonal releases in portland',
        preferredLanguage: 'lt',
        preferredExportTarget: 'html',
        previewVersion: 1,
      },
      tasks: [{ status: 'succeeded', title: 'Build', taskKey: 'homepage' }],
      homeModule: undefined,
      latestPreview: {
        html: dbObservedBreweryRenderedHtml,
        version: 1,
      },
      siteSpec: {
        specJson: JSON.stringify({
          brand: 'Craft Beer Brewery',
          theme: 'darkmatter',
        }),
        updatedAt: 1782814095839,
      },
    })

    render(<Dashboard sessionId="static-gallery-session" />)

    expect(screen.queryByTestId('intro-loader')).toBeNull()
    expect(screen.getByTestId('generated-module-preview')).toBeTruthy()
    const source = screen.getByTestId('gmp-source').textContent ?? ''
    expect(source).toContain('data-sf-export-page="Home"')
    expect(source).toContain('Pineapple Saison')
  })

  it('keeps the intro loader visible while Convex realtime has no renderable preview yet', async () => {
    vi.useFakeTimers()
    try {
      getConvexState().generationView = undefined
      const fetchMock = vi.fn().mockResolvedValue({ ok: false })
      vi.stubGlobal('fetch', fetchMock)

      render(<Dashboard sessionId="loading-session" />)

      expect(screen.getByTestId('intro-loader')).toBeTruthy()
      expect(screen.queryByTestId('generated-module-preview')).toBeNull()

      await vi.advanceTimersByTimeAsync(3000)

      expect(fetchMock).not.toHaveBeenCalled()
      expect(screen.getByTestId('intro-loader')).toBeTruthy()
      expect(screen.queryByTestId('generated-module-preview')).toBeNull()
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

  it('allows signed-out local development text edits when Clerk is disabled', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('true')

    fireEvent.click(screen.getByTestId('gmp-trigger-text-change'))

    await waitFor(() => {
      expect(getConvexState().editController.applyEdit).toHaveBeenCalledWith(
        'text',
        'H1: Hello world…',
        'Hello world',
        'Hi there',
        'inline edit',
        undefined,
        0,
      )
    })
  })

  it('reverts an optimistic text edit when the save fails', async () => {
    setupReady()
    getConvexState().editController.applyEdit.mockResolvedValueOnce({
      error: 'Text save failed',
    })
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    const heading = screen.getByTestId('gmp-editable-heading')
    expect(heading.textContent).toBe('Hello world')

    fireEvent.click(screen.getByTestId('gmp-trigger-attached-text-change'))
    expect(heading.textContent).toBe('Hi there')

    await waitFor(() => {
      expect(heading.textContent).toBe('Hello world')
    })
    expect(getConvexState().editController.applyEdit).toHaveBeenCalledWith(
      'text',
      'H1: Hi there…',
      'Hello world',
      'Hi there',
      'inline edit',
      undefined,
      0,
    )
    consoleError.mockRestore()
  })

  it('reverts an optimistic text edit when a required fork fails', async () => {
    setupReady()
    getConvexState().editController.applyEdit.mockResolvedValueOnce(
      'fork_needed',
    )
    getConvexState().editController.forkCurrentSession.mockResolvedValueOnce(
      null,
    )
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    const heading = screen.getByTestId('gmp-editable-heading')
    expect(heading.textContent).toBe('Hello world')

    fireEvent.click(screen.getByTestId('gmp-trigger-attached-text-change'))
    expect(heading.textContent).toBe('Hi there')

    await waitFor(() => {
      expect(
        getConvexState().editController.forkCurrentSession,
      ).toHaveBeenCalledTimes(1)
      expect(heading.textContent).toBe('Hello world')
    })
  })

  it('allows signed-out local development image swaps when Clerk is disabled', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('true')

    fireEvent.click(screen.getByTestId('gmp-trigger-image-change'))

    await waitFor(() => {
      expect(getConvexState().editController.applyEdit).toHaveBeenCalledWith(
        'image',
        'IMG: Hero product showcas…',
        'Hero product showcase',
        'https://images.example/new.jpg',
        'inline image swap',
        undefined,
        0,
      )
    })
  })

  it('reverts an optimistic image swap when the save fails', async () => {
    setupReady()
    getConvexState().editController.applyEdit.mockResolvedValueOnce({
      error: 'Image save failed',
    })
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    const image = screen.getByTestId('gmp-editable-image') as HTMLImageElement
    expect(image.src).toBe('https://images.example/old.jpg')

    fireEvent.click(screen.getByTestId('gmp-trigger-image-change'))
    expect(image.src).toBe('https://images.example/new.jpg')

    await waitFor(() => {
      expect(image.src).toBe('https://images.example/old.jpg')
    })
    expect(getConvexState().editController.applyEdit).toHaveBeenCalledWith(
      'image',
      'IMG: Hero product showcas…',
      'Hero product showcase',
      'https://images.example/new.jpg',
      'inline image swap',
      undefined,
      0,
    )
    consoleError.mockRestore()
  })

  it('reverts an optimistic image swap when a required fork fails', async () => {
    setupReady()
    getConvexState().editController.applyEdit.mockResolvedValueOnce(
      'fork_needed',
    )
    getConvexState().editController.forkCurrentSession.mockResolvedValueOnce(
      null,
    )
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    const image = screen.getByTestId('gmp-editable-image') as HTMLImageElement

    fireEvent.click(screen.getByTestId('gmp-trigger-image-change'))
    expect(image.src).toBe('https://images.example/new.jpg')

    await waitFor(() => {
      expect(
        getConvexState().editController.forkCurrentSession,
      ).toHaveBeenCalledTimes(1)
      expect(image.src).toBe('https://images.example/old.jpg')
    })
  })

  it('allows signed-out local development style edits when Clerk is disabled', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('true')

    fireEvent.click(screen.getByTestId('gmp-trigger-element-activate'))
    fireEvent.click(await screen.findByTestId('toolbar-trigger-style-apply'))

    await waitFor(() => {
      expect(getConvexState().editController.applyEdit).toHaveBeenCalledWith(
        'style',
        'SECTION: Hero section…',
        'hero-section',
        'background-color: rgb(255, 0, 0);',
        'inline style',
        undefined,
        0,
      )
    })
  })

  it('reverts a live-previewed background style when the style save fails', async () => {
    setupReady()
    getConvexState().editController.applyEdit.mockResolvedValueOnce({
      error: 'Style save failed',
    })
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    fireEvent.click(screen.getByTestId('gmp-trigger-attached-section-activate'))
    const heading = document.querySelector(
      '.genui-preview h2',
    ) as HTMLElement | null
    expect(heading).not.toBeNull()
    const originalStyle = heading!.getAttribute('style')

    fireEvent.click(await screen.findByTestId('toolbar-trigger-style-apply'))
    expect(heading!.style.backgroundColor).toBe('rgb(255, 0, 0)')

    await waitFor(() => {
      expect(heading!.getAttribute('style')).toBe(originalStyle)
    })
    expect(getConvexState().editController.applyEdit).toHaveBeenCalledWith(
      'style',
      'H2: Hero section…',
      'hero-section',
      'background-color: rgb(255, 0, 0);',
      'inline style',
      undefined,
      0,
    )
    consoleError.mockRestore()
  })

  it('reverts live-previewed style and clears forking state when a required fork fails', async () => {
    setupReady()
    getConvexState().editController.applyEdit.mockResolvedValueOnce(
      'fork_needed',
    )
    let resolveFork!: (result: null) => void
    getConvexState().editController.forkCurrentSession.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFork = resolve
        }),
    )
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    fireEvent.click(screen.getByTestId('gmp-trigger-attached-section-activate'))
    const heading = document.querySelector(
      '.genui-preview h2',
    ) as HTMLElement | null
    expect(heading).not.toBeNull()
    const originalStyle = heading!.getAttribute('style')

    fireEvent.click(await screen.findByTestId('toolbar-trigger-style-apply'))
    expect(heading!.style.backgroundColor).toBe('rgb(255, 0, 0)')

    await waitFor(() => {
      expect(
        getConvexState().editController.forkCurrentSession,
      ).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('toolbar-is-forking').textContent).toBe('true')
    })

    resolveFork(null)

    await waitFor(() => {
      expect(heading!.getAttribute('style')).toBe(originalStyle)
      expect(screen.getByTestId('toolbar-is-forking').textContent).toBe('false')
    })
  })

  it('allows signed-out local development link edits when Clerk is disabled', async () => {
    setupReady({
      homeModule: {
        source: `links: [{ label: "Docs", href: "/docs" }]`,
        status: 'succeeded',
        updatedAt: 100,
      },
    })
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('true')

    fireEvent.click(screen.getByTestId('gmp-trigger-element-activate'))
    fireEvent.click(await screen.findByTestId('toolbar-trigger-link-edit'))

    await waitFor(() => {
      expect(getConvexState().editController.applyEdit).toHaveBeenCalledWith(
        'ai_rewrite',
        'link: /docs → /learn',
        undefined,
        undefined,
        'replace link href',
        expect.stringContaining('label: "Learn"'),
      )
    })
    const rewriteSource =
      getConvexState().editController.applyEdit.mock.calls.at(-1)?.[5] ?? ''
    expect(rewriteSource).toContain('href: "/learn"')
    expect(rewriteSource).toContain('target: "_blank"')
    expect(rewriteSource).toContain('rel: "noopener noreferrer"')
  })

  it('submits section AI edits for the selected preview element when Clerk is disabled locally', async () => {
    setupReady()
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn() })
    vi.stubGlobal('fetch', fetchMock)

    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('true')

    fireEvent.click(screen.getByTestId('gmp-trigger-attached-section-activate'))
    fireEvent.click(await screen.findByTestId('toolbar-trigger-section-edit'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sessions/ready-session/section-edit',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        }),
      )
    })
    const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body ?? '{}')
    expect(body).toMatchObject({
      instruction: 'Make this section more conversion focused',
      selection: {
        tag: 'h2',
        elementPath: 'section:nth-of-type(1) > h2:nth-of-type(1)',
        textContent: 'Hero section',
        openuiComponent: 'MarketingAgencyHero',
        openuiVar: 'home_hero',
      },
    })
    expect(body).not.toHaveProperty('anonymousOwnerSecret')
    expect(body.selection.outerHTML).toContain('<h2>Hero section</h2>')
  })

  it('shows section AI edit pending state while the route request is in flight', async () => {
    setupReady()
    let resolveFetch!: (response: {
      ok: true
      json: () => Promise<unknown>
    }) => void
    const fetchMock = vi.fn(
      () =>
        new Promise<{ ok: true; json: () => Promise<unknown> }>((resolve) => {
          resolveFetch = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    fireEvent.click(screen.getByTestId('gmp-trigger-attached-section-activate'))
    fireEvent.click(await screen.findByTestId('toolbar-trigger-section-edit'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(
        screen.getByTestId('toolbar-is-section-submitting').textContent,
      ).toBe('true')
    })

    resolveFetch({ ok: true, json: async () => ({}) })

    await waitFor(() => {
      expect(screen.queryByTestId('inline-edit-toolbar')).toBeNull()
    })
  })

  it('keeps the toolbar open with the server error when section AI edit fails', async () => {
    setupReady()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi
        .fn()
        .mockResolvedValue({ error: 'Renderer could not patch section' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    fireEvent.click(screen.getByTestId('gmp-trigger-attached-section-activate'))
    fireEvent.click(await screen.findByTestId('toolbar-trigger-section-edit'))

    await waitFor(() => {
      expect(screen.getByTestId('inline-edit-toolbar')).toBeTruthy()
      expect(
        screen.getByTestId('toolbar-is-section-submitting').textContent,
      ).toBe('false')
      expect(screen.getByTestId('toolbar-section-error').textContent).toBe(
        'Renderer could not patch section',
      )
    })
  })

  it('moves the closest OpenUI section for a directly activated inline element', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    fireEvent.click(screen.getByTestId('gmp-trigger-attached-section-activate'))

    fireEvent.click(await screen.findByTestId('toolbar-trigger-move-up'))
    fireEvent.click(await screen.findByTestId('toolbar-trigger-move-down'))

    await waitFor(() => {
      expect(getConvexState().reorder.reorder).toHaveBeenNthCalledWith(
        1,
        'home_hero',
        'up',
      )
      expect(getConvexState().reorder.reorder).toHaveBeenNthCalledWith(
        2,
        'home_hero',
        'down',
      )
    })
  })

  it('moves the selected inspector section using the inspector OpenUI variable', async () => {
    setupReady()
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    fireEvent.click(screen.getByTestId('gmp-trigger-section-select'))

    fireEvent.click(await screen.findByTestId('toolbar-trigger-move-up'))
    fireEvent.click(await screen.findByTestId('toolbar-trigger-move-down'))

    await waitFor(() => {
      expect(getConvexState().reorder.reorder).toHaveBeenNthCalledWith(
        1,
        'home_inspector_hero',
        'up',
      )
      expect(getConvexState().reorder.reorder).toHaveBeenNthCalledWith(
        2,
        'home_inspector_hero',
        'down',
      )
    })
  })

  it('turning edit mode off cancels pending text edits, closes toolbar, and clears inspector selection', async () => {
    setupReady()
    const clearSpy = vi.fn()
    document.addEventListener('ship-fast-inspector-clear', clearSpy)
    render(<Dashboard sessionId="ready-session" />)

    const toggle = screen.getByRole('button', {
      name: 'Toggle inline edit mode',
    })
    fireEvent.click(toggle)
    expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('true')

    fireEvent.click(screen.getByTestId('gmp-trigger-section-select'))
    fireEvent.click(screen.getByTestId('gmp-register-text-edit'))
    expect(await screen.findByTestId('inline-edit-toolbar')).toBeTruthy()

    fireEvent.click(toggle)

    await waitFor(() => {
      expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('false')
      expect(screen.queryByTestId('inline-edit-toolbar')).toBeNull()
      expect(getConvexState().pendingTextEdit.cancel).toHaveBeenCalledTimes(1)
      expect(getConvexState().pendingTextEdit.commit).not.toHaveBeenCalled()
      expect(clearSpy).toHaveBeenCalledTimes(1)
    })

    document.removeEventListener('ship-fast-inspector-clear', clearSpy)
  })

  it('toolbar close cancels pending text edits and clears inspector selection without disabling edit mode', async () => {
    setupReady()
    const clearSpy = vi.fn()
    document.addEventListener('ship-fast-inspector-clear', clearSpy)
    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('true')

    fireEvent.click(screen.getByTestId('gmp-trigger-section-select'))
    fireEvent.click(screen.getByTestId('gmp-register-text-edit'))
    expect(await screen.findByTestId('inline-edit-toolbar')).toBeTruthy()

    fireEvent.click(screen.getByTestId('toolbar-trigger-close'))

    await waitFor(() => {
      expect(screen.getByTestId('gmp-edit-mode').textContent).toBe('true')
      expect(screen.queryByTestId('inline-edit-toolbar')).toBeNull()
      expect(getConvexState().pendingTextEdit.cancel).toHaveBeenCalledTimes(1)
      expect(getConvexState().pendingTextEdit.commit).not.toHaveBeenCalled()
      expect(clearSpy).toHaveBeenCalledTimes(1)
    })

    document.removeEventListener('ship-fast-inspector-clear', clearSpy)
  })

  it('wires undo and redo state from Dashboard into the inline edit toolbar', async () => {
    setupReady()
    const undo = vi.fn()
    const redo = vi.fn()
    getConvexState().undoRedo = {
      canUndo: true,
      canRedo: true,
      undo,
      redo,
    }

    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    fireEvent.click(screen.getByTestId('gmp-trigger-element-activate'))

    const undoButton = await screen.findByTestId('toolbar-trigger-undo')
    const redoButton = await screen.findByTestId('toolbar-trigger-redo')
    expect((undoButton as HTMLButtonElement).disabled).toBe(false)
    expect((redoButton as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(undoButton)
    fireEvent.click(redoButton)

    expect(undo).toHaveBeenCalledTimes(1)
    expect(redo).toHaveBeenCalledTimes(1)
  })

  it('keeps undo and redo unavailable in the inline edit toolbar when history is empty', async () => {
    setupReady()
    const undo = vi.fn()
    const redo = vi.fn()
    getConvexState().undoRedo = {
      canUndo: false,
      canRedo: false,
      undo,
      redo,
    }

    render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )
    fireEvent.click(screen.getByTestId('gmp-trigger-element-activate'))

    const undoButton = await screen.findByTestId('toolbar-trigger-undo')
    const redoButton = await screen.findByTestId('toolbar-trigger-redo')
    expect((undoButton as HTMLButtonElement).disabled).toBe(true)
    expect((redoButton as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(undoButton)
    fireEvent.click(redoButton)

    expect(undo).not.toHaveBeenCalled()
    expect(redo).not.toHaveBeenCalled()
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

  // 12b. Scroll position preserved across remounts triggered by a section
  // AI edit. The AI edit path goes through handleSectionEditSubmit → fetch
  // to /section-edit, NOT through editController.applyEdit, so it has its
  // own scroll-save branch. Without it, a successful AI edit bumps
  // previewVersion, the preview remounts, and scroll jumps to 0.
  it('restores the preview scroll position after a remount triggered by a section AI edit', async () => {
    setupReady({
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready</h1></body></html>',
        status: 'succeeded',
        updatedAt: 100,
      },
    })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn() })
    vi.stubGlobal('fetch', fetchMock)
    const { rerender } = render(<Dashboard sessionId="ready-session" />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle inline edit mode' }),
    )

    const previewEl = document.querySelector(
      '.genui-preview',
    ) as HTMLElement | null
    expect(previewEl).not.toBeNull()
    previewEl!.scrollTop = 320

    fireEvent.click(screen.getByTestId('gmp-trigger-attached-section-activate'))
    fireEvent.click(await screen.findByTestId('toolbar-trigger-section-edit'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/sessions/ready-session/section-edit',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    // Bump previewVersion → renderedPreviewKey changes → remount + restore.
    const bumped = readyGenerationView({
      homeModule: {
        source: '<!doctype html><html><body><h1>Ready v2</h1></body></html>',
        status: 'succeeded',
        updatedAt: 200,
      },
    })
    getConvexState().generationView = bumped
    rerender(<Dashboard sessionId="ready-session" />)

    await waitFor(() => {
      const restored = document.querySelector(
        '.genui-preview',
      ) as HTMLElement | null
      expect(restored).not.toBeNull()
      expect(restored!.scrollTop).toBe(320)
    })
  })
})
