import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import type { CSSProperties, ReactNode } from 'react'
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import {
  Box,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  Download,
  Edit3,
  Github,
  Globe2,
  Languages,
  Lock,
  Package,
  Palette,
} from 'lucide-react'
import { toast } from 'sonner'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { PreviewSelection } from '@/components/GenUI/DirectPreview'
import type { CapsuleTextChange } from '@/features/editing/hooks/useCapsulePropResolver'
import { buildPropPatch } from '@ship-fast/blocks/capsules'
import {
  buildInspectorSelection,
  type InspectorSelection,
} from '@/features/editing/element-path'
import { IntroLoader } from '@/components/GenUI/IntroLoader'
import { SessionGeneratedPreview } from '@/features/dashboard/components/SessionGeneratedPreview'
import { useClonePageNav } from '@/features/clone/hooks/useClonePageNav'
import { useIsMobile } from '@/hooks/use-mobile'
import { createPendingDashboardSaves } from '@/features/dashboard/lib/pending-dashboard-saves'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { extractGeneratedCommerceProducts } from '@/features/commerce/services/generated-commerce-products'
import { takeGenerationLaunchHandoff } from '@/features/session/services/generation-launch-handoff'
import { useEditController } from '@/features/editing/hooks/useEditController'
import { useUndoRedo } from '@/features/editing/hooks/useUndoRedo'
import { useReorderElement } from '@/features/editing/hooks/useReorderElement'
import { firstImageSrc } from '@ship-fast/blocks/multi-image-src'
import {
  buildImageReplaceCommand,
  buildLinkEditCommand,
  buildStyleApplyCommand,
  buildTextRewriteCommand,
} from '@/features/editing/lib/inline-edit-commands'
import { revertTextPreservingIcons } from '@/features/editing/hooks/useTextEdit'
const InlineEditToolbar = lazy(() =>
  import('@/features/editing/components/InlineEditToolbar').then((module) => ({
    default: module.InlineEditToolbar,
  })),
)
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import ThemePicker from '@/genui/components/ThemePicker'
import LanguagePicker from '@/genui/components/LanguagePicker'
import { resolveThemeStyles } from '@/genui/theme-apply'
import { SignInGate, useSignInGate } from '@/shared/auth/SignInGate'
import { cn } from '#/lib/utils'

const DeploymentPanel = lazy(() =>
  import('@/features/deployments/components/DeploymentPanel').then(
    (module) => ({
      default: module.DeploymentPanel,
    }),
  ),
)
const ExportPanel = lazy(() =>
  import('@/features/exports/components/ExportPanel').then((module) => ({
    default: module.ExportPanel,
  })),
)
const GitHubPanel = lazy(() =>
  import('@/features/github/components/GitHubPanel').then((module) => ({
    default: module.GitHubPanel,
  })),
)
const CommercePanel = lazy(() =>
  import('@/features/commerce/components/CommercePanel').then((module) => ({
    default: module.CommercePanel,
  })),
)
const BrandMediaPanel = lazy(() =>
  import('@/features/brand/components/BrandMediaPanel').then((module) => ({
    default: module.BrandMediaPanel,
  })),
)
interface DashboardProps {
  sessionId: string
  initialGenerationView?: DashboardGenerationView | null
}

export type DashboardGenerationView = {
  events: Array<{
    _id?: string
    eventType?: string
    message?: string
    previewVersion?: number
    createdAt?: number
    elapsedMs?: number
    cost?: number
    provider?: string
    error?: string
    quotaHit?: boolean
    cacheHit?: boolean
  }>
  homeModule?: {
    moduleKey?: string
    source: string
    status?: string
    updatedAt?: number
  } | null
  latestPreview?: {
    html?: string
    openUiSource?: string
    siteSpecJson?: string
    version?: number
  } | null
  session: {
    sessionId: Id<'sessions'>
    status?: string
    previewVersion?: number
    prompt: string
    preferredLanguage?: string
    preferredExportTarget?: string
    elapsed?: number | null
    isPrivate?: boolean
    engineVersion?: string
    cloneUrl?: string
    themeOverride?: string | null
    themeMode?: 'light' | 'dark' | null
    selectedBrandLogo?: BrandLogoSelection | null
    designReferenceUrls?: string[]
    designReferenceNotes?: string
    errorCode?: string
    errorMessage?: string
  }
  siteSpec?: {
    specJson?: string
    updatedAt?: number
  } | null
  tasks: Array<{
    _id?: string
    taskKey?: string
    title: string
    status: string
    order?: number
    updatedAt?: number
  }>
}

type BrandLogoSelection = {
  name: string
  domain: string | null
  brandId: string | null
  icon: string | null
  logo: string | null
}

type PendingTextEdit = {
  commit: () => void
  cancel: () => void
}

type PendingTextEditResolution = keyof PendingTextEdit

type PendingTextChange = {
  signature: string
  promise: Promise<void>
}

type ImageChange = {
  oldSrc: string
  newSrc: string
  element: HTMLImageElement
  alt: string
}

type LinkEditPayload = {
  oldHref: string
  newHref: string
  oldText: string
  newText: string
  target: string | null
  rel: string
  occurrenceIndex: number
}

type StyleApplyPayload = {
  sourceAnchor: string
  style: string
  occurrenceIndex: number
}

function editAppliesToLocale(edit: object, locale: string): boolean {
  const normalizedLocale = locale.trim().toLowerCase()
  return (
    !('locale' in edit) ||
    typeof edit.locale !== 'string' ||
    edit.locale.trim().toLowerCase() === normalizedLocale
  )
}

const crownIcon = (
  <Crown className="size-3" strokeWidth={2.2} aria-hidden="true" />
)

const railRowClass =
  'group relative flex w-full items-center justify-between gap-2.5 overflow-hidden rounded-xl border border-white/8 bg-white/[0.04] px-3 py-[11px] text-left text-[13px] font-medium text-[#ededf0] transition-[background,border-color,transform,box-shadow] duration-150 hover:-translate-y-px hover:border-white/15 hover:bg-white/[0.075] hover:text-white'

const railIconClass =
  'grid size-[22px] shrink-0 place-items-center rounded-[7px] border border-white/8 bg-white/[0.05] text-white/72 transition-[background,border-color,color,transform] duration-150 group-hover:-translate-y-0.5 group-hover:border-white/16 group-hover:bg-white/10 group-hover:text-white'

const premiumBadgeClass =
  'grid size-5 shrink-0 place-items-center rounded-md bg-[linear-gradient(135deg,#f5d0a8_0%,#e8b86d_100%)] text-[#0a0a0b] outline-none focus-visible:shadow-[0_0_0_2px_rgba(232,184,109,0.45)]'

const newBadgeClass =
  'shrink-0 rounded-md bg-cyan-300/14 px-1.5 py-[3px] font-mono text-[9px] font-bold leading-none tracking-[0.04em] text-cyan-100'

const stateBadgeClass =
  'shrink-0 rounded-md border border-white/12 bg-black/30 px-1.5 py-[3px] font-mono text-[9px] font-bold leading-none tracking-[0.04em] text-white/60'

const lockBadgeClass =
  'grid size-5 shrink-0 place-items-center rounded-md border border-white/12 bg-white/[0.06] text-white/56'

type RailLockedButtonProps = {
  label: string
  icon: ReactNode
  badges?: ReactNode
  sublabel?: string
}

/**
 * Locked fallback for a gated siderail item. Mirrors the real rail row's
 * styling (icon tile + label + optional sublabel + badges) but adds a lock
 * glyph and routes the click to the Clerk sign-in modal via `useSignInGate`.
 * Rendered by `<SignInGate locked={...}>` when the user is signed out.
 */
function RailLockedButton({
  label,
  icon,
  badges,
  sublabel,
}: RailLockedButtonProps) {
  const { openSignIn } = useSignInGate()
  return (
    <button
      type="button"
      className={railRowClass}
      aria-label={`${label} — sign in to unlock`}
      aria-haspopup="dialog"
      onClick={openSignIn}
    >
      <span className={railIconClass} aria-hidden="true">
        {icon}
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="truncate">{label}</span>
        {sublabel ? (
          <span className="truncate font-mono text-[9.5px] uppercase leading-tight tracking-[0.06em] text-white/42">
            {sublabel}
          </span>
        ) : null}
      </span>
      {badges}
      <span className={lockBadgeClass} aria-hidden="true">
        <Lock className="size-3" strokeWidth={2} />
      </span>
    </button>
  )
}

function formatThemeName(
  name: string | { styles?: unknown } | null | undefined,
): string {
  if (!name) return 'Default'
  // An on-the-fly cloned theme is a preset OBJECT (not a catalog name string).
  if (typeof name !== 'string') return 'Cloned Theme'

  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function themeButtonStyle(
  styles: ReturnType<typeof resolveThemeStyles>,
  isDark: boolean,
): CSSProperties | undefined {
  if (!styles) return undefined
  const palette = styles[isDark ? 'dark' : 'light']
  const stops = [
    palette.primary,
    palette.secondary,
    palette.accent,
    palette['chart-1'],
    palette['chart-2'],
    palette['chart-3'],
  ].filter(Boolean)

  if (stops.length === 0) return undefined

  const paletteGradient = `linear-gradient(110deg, ${stops.join(', ')})`

  return {
    backgroundImage: [
      'linear-gradient(90deg, rgba(8,10,18,0.86), rgba(8,10,18,0.58) 44%, rgba(8,10,18,0.74))',
      'radial-gradient(circle at 88% 18%, rgba(255,255,255,0.22), transparent 34%)',
      paletteGradient,
    ].join(', '),
    backgroundBlendMode: 'normal, soft-light, normal',
    borderColor: palette.primary ?? palette.accent ?? 'rgba(255,255,255,0.16)',
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), 0 16px 34px -24px ${palette.primary ?? 'rgba(255,255,255,0.45)'}`,
    backdropFilter: 'blur(18px) saturate(1.35)',
    WebkitBackdropFilter: 'blur(18px) saturate(1.35)',
  }
}

function readSiteThemeName(specJson: string | undefined): string | null {
  if (!specJson) return null
  try {
    const parsed = JSON.parse(specJson) as {
      theme?: unknown
      themeName?: unknown
      genuiTheme?: unknown
    }
    const theme = parsed.themeName ?? parsed.genuiTheme ?? parsed.theme
    return typeof theme === 'string' ? theme : null
  } catch {
    return null
  }
}

function isFullHtmlDocument(html: string | undefined): boolean {
  return (
    typeof html === 'string' &&
    (/^\s*<!doctype\s+html/i.test(html) || /^\s*<html[\s>]/i.test(html))
  )
}

function isOpenUIHandoffHtml(html: string | undefined): boolean {
  return (
    typeof html === 'string' &&
    isFullHtmlDocument(html) &&
    (((/id=["']ship-fast-openui-source["']/i.test(html) ||
      /Generated OpenUI source is ready/i.test(html)) &&
      /data-openui-ready=["']source["']/i.test(html)) ||
      /id=["']openui-client-source["']/i.test(html))
  )
}

const ToolPopoverFallback = () => (
  <div className="grid gap-3" aria-hidden="true">
    <div className="h-7 w-1/2 rounded-lg bg-white/[0.08]" />
    <div className="h-24 rounded-xl border border-white/8 bg-white/[0.045]" />
    <div className="grid gap-2">
      <div className="h-3 w-5/6 rounded-full bg-white/[0.07]" />
      <div className="h-3 w-2/3 rounded-full bg-white/[0.055]" />
      <div className="h-3 w-3/4 rounded-full bg-white/[0.055]" />
    </div>
  </div>
)

function MissingProjectState() {
  const canGoBack = useCanGoBack()
  const navigate = useNavigate()
  const router = useRouter()
  const handleBackClick = useCallback(() => {
    if (canGoBack) {
      router.history.back()
      return
    }
    void navigate({ to: '/' })
  }, [canGoBack, navigate, router])

  return (
    <div
      className="grid h-full min-h-[480px] place-items-center bg-[#05070c] px-6 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.045] p-8 shadow-[0_22px_80px_rgba(0,0,0,0.35)]">
        <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200/70">
          Project missing
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          This generated website is no longer available.
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/56">
          It may have been deleted while resetting the public gallery. Create a
          new website from the home page to start fresh.
        </p>
        <button
          type="button"
          onClick={handleBackClick}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px"
        >
          Back
        </button>
      </div>
    </div>
  )
}

function GenerationFailureState({ errorMessage }: { errorMessage: string }) {
  const canGoBack = useCanGoBack()
  const navigate = useNavigate()
  const router = useRouter()
  const handleBackClick = useCallback(() => {
    if (canGoBack) {
      router.history.back()
      return
    }
    void navigate({ to: '/' })
  }, [canGoBack, navigate, router])

  return (
    <div
      className="grid h-full min-h-[480px] place-items-center bg-[#05070c] px-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md rounded-3xl border border-rose-500/20 bg-white/[0.045] p-8 shadow-[0_22px_80px_rgba(0,0,0,0.35)]">
        <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-rose-300/80">
          Generation failed
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          We couldn&apos;t finish building this website.
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/56">{errorMessage}</p>
        <button
          type="button"
          onClick={handleBackClick}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px"
        >
          Back
        </button>
      </div>
    </div>
  )
}

const subscribeToHydration = () => () => undefined
const getHydratedClientSnapshot = () => true
const getHydratedServerSnapshot = () => false

/** Resolve the section-edit selection to send to the AI patcher.
 *  Prefers the inspector's current selection (when the section inspector
 *  already selected something); otherwise builds one from the inline toolbar's
 *  active element, but only if it lives inside the preview root. Returns null
 *  when the active element is dashboard chrome (outside the preview). */
export function resolveSectionEditSelection({
  activeElement,
  inspectorSelection,
  previewRoot,
}: {
  activeElement: HTMLElement | null
  inspectorSelection: InspectorSelection | null
  previewRoot: HTMLElement | null
}): InspectorSelection | null {
  if (inspectorSelection) return inspectorSelection
  if (!activeElement || !previewRoot) return null
  if (!previewRoot.contains(activeElement)) return null
  return buildInspectorSelection(previewRoot, activeElement)
}

export function Dashboard({
  initialGenerationView,
  sessionId,
}: DashboardProps) {
  const [startedFromGenerationFlow] = useState(() =>
    typeof window === 'undefined'
      ? false
      : takeGenerationLaunchHandoff(window.sessionStorage, sessionId),
  )
  const [isDashboardActive, setIsDashboardActive] = useState(false)
  const [currentDevice, setCurrentDevice] = useState<
    'desktop' | 'tablet' | 'mobile'
  >('desktop')
  const [editMode, setEditMode] = useState(false)
  // Site tools siderail: expanded by default on desktop, collapsed on mobile.
  // The user can toggle either way; until they do, the state follows the
  // viewport via useIsMobile.
  const isMobile = useIsMobile()
  const [railUserToggle, setRailUserToggle] = useState<boolean | null>(null)
  const railCollapsed = railUserToggle ?? isMobile
  const { requireSignIn: requireSignInForEdit } = useSignInGate()
  const pendingTextEditRef = useRef<PendingTextEdit | null>(null)
  const pendingTextChangesRef = useRef(
    new WeakMap<HTMLElement, PendingTextChange>(),
  )
  const [dashboardSaves] = useState(createPendingDashboardSaves)
  const reloadInFlightRef = useRef(false)
  const trackDashboardSave = dashboardSaves.track
  const activeLinkEditsRef = useRef(0)
  // Capture the element's original style attribute when the toolbar opens
  // (before any live-preview modification) so handleStyleApply can revert
  // to the exact pre-edit state on failure. Capturing at apply-time is too
  // late — the toolbar has already applied the live preview by then.
  const originalStyleAttributeRef = useRef<string | null>(null)
  // Save scroll position of the preview container before a remount (caused
  // by an inline edit bumping the preview version) and restore it after the
  // new preview mounts. Without this, every successful edit resets scroll
  // to top because the key change forces a full remount of the scroll container.
  const savedPreviewScrollRef = useRef<number | null>(null)
  // After a section move (up/down), scroll the moved section into view in
  // its new position instead of leaving the preview at the top. Set to the
  // moved section's OpenUI var name (or id fallback) right before the
  // reorder mutation; consumed by the effect below once the preview remounts.
  const pendingScrollToSectionRef = useRef<string | null>(null)
  // Find the actual scrollable element inside the preview. The scroll
  // container may be .genui-preview itself or a descendant div depending
  // on the rendered layout.
  const getPreviewScrollEl = () => {
    const root = document.querySelector('.genui-preview')
    if (!root) return null
    if (root.scrollHeight > root.clientHeight + 10) return root
    const scrollChild = Array.from(root.querySelectorAll('*')).find(
      (el) => el.scrollHeight > el.clientHeight + 10,
    )
    return scrollChild ?? null
  }
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<BrandLogoSelection | null>(
    null,
  )
  const [toolbarState, setToolbarState] = useState({
    isOpen: false,
    anchorRect: null as DOMRect | null,
    activeElement: null as HTMLElement | null,
  })
  // Element selected by the devtools-style inspector (pencil mode). Drives
  // the InlineEditToolbar's section-level AI edit. null = no selection.
  const [inspectorSelection, setInspectorSelection] =
    useState<InspectorSelection | null>(null)
  const finishPendingTextEdit = useCallback(
    (resolution: PendingTextEditResolution) => {
      const pendingTextEdit = pendingTextEditRef.current
      // Clear ownership before invoking user code. Commit/cancel callbacks can
      // synchronously close the toolbar, so clearing first makes completion
      // one-shot even when multiple UI events finish the same draft.
      pendingTextEditRef.current = null
      pendingTextEdit?.[resolution]()
    },
    [],
  )
  const clearInspectorSelection = useCallback(() => {
    setInspectorSelection(null)
    document.dispatchEvent(new CustomEvent('ship-fast-inspector-clear'))
  }, [])
  const closeInlineEditingSurface = useCallback(
    (resolution: PendingTextEditResolution = 'cancel') => {
      finishPendingTextEdit(resolution)
      setToolbarState({
        isOpen: false,
        anchorRect: null,
        activeElement: null,
      })
      clearInspectorSelection()
    },
    [clearInspectorSelection, finishPendingTextEdit],
  )
  const handleCommitTextReady = useCallback(
    (commit: () => void, cancel: () => void) => {
      pendingTextEditRef.current = { commit, cancel }
    },
    [],
  )
  // Leaving inline edit mode must close any open toolbar so the floating
  // UI does not linger over a non-editable preview. It must also cancel
  // any pending text edit (so the unsaved buffer is discarded, not
  // silently committed) and clear the inspector selection.
  useEffect(() => {
    if (!editMode && toolbarState.isOpen) {
      closeInlineEditingSurface('cancel')
    }
  }, [closeInlineEditingSurface, editMode, toolbarState.isOpen])
  const [isApplyingStyle, setIsApplyingStyle] = useState(false)
  const [isForkingSession, setIsForkingSession] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const publishInFlightRef = useRef(false)
  const [publishError, setPublishError] = useState<string>()
  const [isSectionEditing, setIsSectionEditing] = useState(false)
  const [sectionEditError, setSectionEditError] = useState<string>()
  const liveGenerationView = useQuery(api.sessions.getGenerationView, {
    lookup: sessionId,
  }) as DashboardGenerationView | null | undefined
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedClientSnapshot,
    getHydratedServerSnapshot,
  )
  const generationView =
    !hasHydrated && initialGenerationView === undefined
      ? undefined
      : liveGenerationView === undefined
        ? initialGenerationView
        : liveGenerationView
  const resolvedSessionId = generationView?.session.sessionId
  const clonePageNav = useClonePageNav(resolvedSessionId ?? sessionId)
  const isMissingSession = generationView === null
  const hasGenerationFailure =
    !isMissingSession &&
    generationView != null &&
    Boolean(generationView.session.errorCode) &&
    generationView.session.status !== 'preview_ready'
  const homeModule = generationView?.homeModule
  const cmsPreviewHtml = generationView?.latestPreview?.html
  const cmsPreviewSource =
    typeof cmsPreviewHtml === 'string' &&
    cmsPreviewHtml.length > 0 &&
    !isOpenUIHandoffHtml(cmsPreviewHtml) &&
    (cmsPreviewHtml.includes('ship-fast-cms:') ||
      isFullHtmlDocument(cmsPreviewHtml))
      ? cmsPreviewHtml
      : undefined
  const hasRenderableClonePage = Boolean(
    clonePageNav.currentHtml || clonePageNav.currentUrl,
  )
  const hasRenderableHomeSource =
    (typeof homeModule?.source === 'string' &&
      homeModule.source.trim().length > 0) ||
    Boolean(cmsPreviewSource) ||
    hasRenderableClonePage
  const isPreviewReady =
    !isMissingSession &&
    generationView?.session.status === 'preview_ready' &&
    hasRenderableHomeSource
  const isPreviewRenderable =
    !isMissingSession &&
    hasRenderableHomeSource &&
    (isPreviewReady || homeModule?.status === 'running')
  const sidePanelQueryArgs =
    resolvedSessionId === undefined || !isPreviewReady
      ? 'skip'
      : { sessionId: resolvedSessionId }
  const commerceConfig = useQuery(
    api.sessions.getCommerceConfig,
    sidePanelQueryArgs,
  )
  const deploymentStatus = useQuery(
    api.sessions.getDeploymentStatus,
    sidePanelQueryArgs,
  )
  const publishPreview = useMutation(api.sessions.publishPreview)
  const setThemeOverrideMutation = useMutation(api.sessions.setThemeOverride)
  const setPreferredLanguageMutation = useMutation(
    api.sessions.setPreferredLanguage,
  )
  const setBrandLogoMutation = useMutation(api.sessions.setBrandLogo)
  // Lakebed merge mutation for capsule prop edits (inline text → structured data).
  const mergeLakebedData = useMutation(api.lakebed.mergeSessionData)
  const editController = useEditController(resolvedSessionId || sessionId)
  const undoRedo = useUndoRedo(editController)
  const reorder = useReorderElement({
    sessionId: resolvedSessionId,
    getSource: async () => {
      // Fetch the current OpenUI source from the generation view
      return generationView?.homeModule?.source
    },
  })

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (
      reduce ||
      isPreviewRenderable ||
      isMissingSession ||
      hasGenerationFailure
    ) {
      setIsDashboardActive(true)
      return
    }

    const tDashboard = window.setTimeout(
      () => {
        setIsDashboardActive(true)
      },
      startedFromGenerationFlow ? 2200 : 120,
    )

    return () => {
      window.clearTimeout(tDashboard)
    }
  }, [
    isMissingSession,
    isPreviewRenderable,
    startedFromGenerationFlow,
    hasGenerationFailure,
  ])

  useEffect(() => {
    if (typeof window === 'undefined' || !isPreviewReady || !generationView) {
      return
    }

    const session = generationView.session
    if (!session?.prompt) return

    // Persist the last prompt so it can be restored when the user returns
    // (e.g. after signing in or coming back the next day).
    try {
      window.localStorage.setItem('ship-fast:last-prompt', session.prompt)
    } catch {
      // Storage may be blocked; non-critical.
    }
  }, [generationView, isPreviewReady])

  const progress = useMemo(() => {
    if (!generationView || generationView.tasks.length === 0) return 0
    if (generationView.session.status === 'preview_ready') return 100

    const done = generationView.tasks.filter(
      (task) => task.status === 'succeeded',
    ).length
    return Math.max(5, Math.round((done / generationView.tasks.length) * 100))
  }, [generationView])
  const visualProducts = useMemo(
    () =>
      extractGeneratedCommerceProducts({
        source: homeModule?.source,
        siteSpecJson:
          generationView?.siteSpec?.specJson ??
          generationView?.latestPreview?.siteSpecJson,
      }),
    [
      generationView?.latestPreview?.siteSpecJson,
      generationView?.siteSpec?.specJson,
      homeModule?.source,
    ],
  )
  const visualProductCount = visualProducts.length
  const activePreviewLocale =
    generationView?.session.preferredLanguage?.trim().toLowerCase() || 'en'
  const cloneHomePage =
    clonePageNav.pages.find((page) => page.isHome) ?? clonePageNav.pages[0]
  const activePreviewPage = clonePageNav.isClone
    ? clonePageNav.currentPath || cloneHomePage?.pathname || '/'
    : '/'
  const shouldApplyPersistedHomeEdits =
    !clonePageNav.isClone || activePreviewPage === cloneHomePage?.pathname

  const imageOverrides = useMemo(() => {
    const map: Record<string, string> = {}
    if (!shouldApplyPersistedHomeEdits) return map
    for (const edit of editController.edits ?? []) {
      if (
        edit.editType === 'image' &&
        typeof edit.beforeText === 'string' &&
        typeof edit.afterText === 'string' &&
        !(edit.beforeText in map)
      ) {
        // edits are newest-first, so the first seen alt wins (latest swap).
        map[edit.beforeText] = edit.afterText
      }
    }
    return map
  }, [editController.edits, shouldApplyPersistedHomeEdits])

  const styleOverrides = useMemo(() => {
    const seen = new Set<string>()
    const overrides: Array<{
      classAnchor: string
      occurrenceIndex: number
      style: string
    }> = []
    if (!shouldApplyPersistedHomeEdits) return overrides
    for (const edit of editController.edits ?? []) {
      if (
        edit.editType === 'style' &&
        typeof edit.beforeText === 'string' &&
        typeof edit.afterText === 'string'
      ) {
        const occurrenceIndex = edit.occurrenceIndex ?? 0
        const key = `${edit.beforeText}#${occurrenceIndex}`
        // edits are newest-first, so the first seen class+occurrence wins.
        if (seen.has(key)) continue
        seen.add(key)
        overrides.push({
          classAnchor: edit.beforeText,
          occurrenceIndex,
          style: edit.afterText,
        })
      }
    }
    return overrides
  }, [editController.edits, shouldApplyPersistedHomeEdits])

  const textOverrides = useMemo(() => {
    const overrides: Array<{
      beforeText: string
      afterText: string
      occurrenceIndex?: number
    }> = []
    if (!shouldApplyPersistedHomeEdits) return overrides
    for (const edit of editController.edits ?? []) {
      if (
        edit.editType === 'text' &&
        typeof edit.beforeText === 'string' &&
        typeof edit.afterText === 'string' &&
        editAppliesToLocale(edit, activePreviewLocale)
      ) {
        // edits are newest-first, so the first seen text wins (latest edit).
        overrides.push({
          beforeText: edit.beforeText,
          afterText: edit.afterText,
          occurrenceIndex: edit.occurrenceIndex,
        })
      }
    }
    return overrides
  }, [activePreviewLocale, editController.edits, shouldApplyPersistedHomeEdits])

  const aiTheme = useMemo(
    () => readSiteThemeName(generationView?.siteSpec?.specJson),
    [generationView?.siteSpec?.specJson],
  )
  const serverThemeOverride = generationView?.session.themeOverride
  useEffect(() => {
    if (serverThemeOverride) {
      setSelectedTheme(serverThemeOverride)
    }
  }, [serverThemeOverride])
  const serverThemeMode = generationView?.session.themeMode
  useEffect(() => {
    if (serverThemeMode) {
      setIsDark(serverThemeMode === 'dark')
    }
  }, [serverThemeMode])
  const effectiveTheme = selectedTheme ?? aiTheme
  const themeStyles = resolveThemeStyles(effectiveTheme)
  const activeThemeLabel = useMemo(
    () => formatThemeName(effectiveTheme),
    [effectiveTheme],
  )
  const serverBrandLogo = generationView?.session.selectedBrandLogo ?? null
  useEffect(() => {
    setSelectedBrand(serverBrandLogo)
  }, [serverBrandLogo])
  const activeBrand = selectedBrand ?? serverBrandLogo
  const activeBrandIcon = activeBrand?.icon ?? activeBrand?.logo ?? null
  const activeThemeButtonStyle = useMemo(
    () => themeButtonStyle(themeStyles, isDark),
    [themeStyles, isDark],
  )
  const previewDeviceWidth =
    currentDevice === 'desktop'
      ? '100%'
      : currentDevice === 'tablet'
        ? '820px'
        : '390px'
  const previewDeviceStyle: CSSProperties = {
    width: previewDeviceWidth,
    minWidth: 0,
    maxWidth: '100%',
    height: '100%',
    overflow: 'hidden',
  }

  const canGoBack = useCanGoBack()
  const navigate = useNavigate()
  const router = useRouter()
  const handleBackClick = useCallback(() => {
    closeInlineEditingSurface('cancel')
    if (canGoBack) {
      router.history.back()
      return
    }
    void navigate({ to: '/' })
  }, [canGoBack, closeInlineEditingSurface, navigate, router])

  const handlePreviewReload = () => {
    closeInlineEditingSurface('cancel')
    if (!dashboardSaves.hasPending()) {
      window.location.reload()
      return
    }
    if (reloadInFlightRef.current) return

    reloadInFlightRef.current = true
    void (async () => {
      try {
        await dashboardSaves.drain()
        window.location.reload()
      } finally {
        reloadInFlightRef.current = false
      }
    })()
  }

  useEffect(() => {
    const preventReloadDuringSave = (event: BeforeUnloadEvent) => {
      if (!dashboardSaves.hasPending()) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', preventReloadDuringSave)
    return () => {
      window.removeEventListener('beforeunload', preventReloadDuringSave)
    }
  }, [dashboardSaves])

  const publishedUrl =
    deploymentStatus?.status === 'ready' ? deploymentStatus.url : undefined
  const activeSessionId = resolvedSessionId ?? sessionId
  const activeAnonymousOwnerSecret =
    typeof window === 'undefined'
      ? undefined
      : readAnonymousOwnerSecret(window.localStorage, activeSessionId)
  const basePreviewUrl = publishedUrl ?? `/generate/${sessionId}`
  const currentUrl = basePreviewUrl
  const renderedPreviewSource =
    clonePageNav.isClone && clonePageNav.currentHtml
      ? clonePageNav.currentHtml
      : (cmsPreviewSource ?? homeModule?.source ?? '')
  const activePreviewIdentity = JSON.stringify([
    activeSessionId,
    activePreviewLocale,
    activePreviewPage,
  ])
  const renderedPreviewRevision = cmsPreviewSource
    ? `cms:${generationView?.latestPreview?.version ?? generationView?.session.previewVersion ?? homeModule?.updatedAt ?? 'latest'}`
    : `${homeModule?.updatedAt ?? generationView?.session.previewVersion}`
  const renderedPreviewKey = `${renderedPreviewRevision}:${JSON.stringify([
    activeSessionId,
    activePreviewPage,
  ])}`
  const activePreviewIdentityRef = useRef(activePreviewIdentity)
  activePreviewIdentityRef.current = activePreviewIdentity
  const previousPreviewIdentityRef = useRef(activePreviewIdentity)

  useEffect(() => {
    if (previousPreviewIdentityRef.current === activePreviewIdentity) return
    previousPreviewIdentityRef.current = activePreviewIdentity
    if (activeLinkEditsRef.current > 0) {
      // Link edits have no optimistic DOM mutation to roll back. Keep their
      // still-connected target anchored while the request completes, but
      // discard any unrelated text draft before accepting the new context.
      finishPendingTextEdit('cancel')
      return
    }
    closeInlineEditingSurface('cancel')
  }, [activePreviewIdentity, closeInlineEditingSurface, finishPendingTextEdit])

  const handleBrandSelect = useCallback(
    (brand: BrandLogoSelection) => {
      closeInlineEditingSurface('cancel')
      setSelectedBrand(brand)
      if (resolvedSessionId === undefined) return

      void trackDashboardSave(
        setBrandLogoMutation({
          sessionId: resolvedSessionId,
          anonymousOwnerSecret: activeAnonymousOwnerSecret,
          brandLogo: brand,
        }),
      )
    },
    [
      activeAnonymousOwnerSecret,
      closeInlineEditingSurface,
      resolvedSessionId,
      setBrandLogoMutation,
      trackDashboardSave,
    ],
  )

  const handleThemeSelect = (theme: string) => {
    closeInlineEditingSurface('cancel')
    setSelectedTheme(theme)
    if (!resolvedSessionId) return
    void trackDashboardSave(
      setThemeOverrideMutation({
        sessionId: resolvedSessionId,
        anonymousOwnerSecret: activeAnonymousOwnerSecret,
        themeOverride: theme,
        themeMode: isDark ? 'dark' : 'light',
      }),
    )
  }

  const handleThemeModeToggle = () => {
    closeInlineEditingSurface('cancel')
    const nextMode = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    if (!resolvedSessionId) return
    void trackDashboardSave(
      setThemeOverrideMutation({
        sessionId: resolvedSessionId,
        anonymousOwnerSecret: activeAnonymousOwnerSecret,
        themeMode: nextMode,
      }),
    )
  }

  const handleLanguageSelect = (language: string) => {
    closeInlineEditingSurface('cancel')
    if (!resolvedSessionId) return
    void trackDashboardSave(
      setPreferredLanguageMutation({
        sessionId: resolvedSessionId,
        anonymousOwnerSecret: activeAnonymousOwnerSecret,
        preferredLanguage: language,
      }),
    )
  }

  // Restore the preview scroll position after a remount caused by an inline
  // edit. The preview remounts when renderedPreviewKey changes (because a
  // successful edit bumps homeModule.updatedAt). The new OpenUI source needs
  // to be compiled and rendered before the scroll container has its full
  // scrollHeight, so we retry over a few animation frames until the content
  // is tall enough to accept the saved scroll position.
  useEffect(() => {
    if (savedPreviewScrollRef.current === null) return
    const saved = savedPreviewScrollRef.current
    savedPreviewScrollRef.current = null
    let raf = 0
    let attempts = 0
    const tryRestore = () => {
      const scrollEl = getPreviewScrollEl()
      if (scrollEl && scrollEl.scrollHeight > saved) {
        scrollEl.scrollTop = saved
        return
      }
      // Content not ready yet — retry for up to ~3s (180 frames). Library
      // capsules that render from Lakebed live queries (gov-portal boards,
      // tenders, …) reach full height only after their data arrives, which
      // can easily outlive a 500ms window; giving up early strands the
      // preview at the top.
      if (attempts++ < 180) {
        raf = requestAnimationFrame(tryRestore)
      }
    }
    raf = requestAnimationFrame(tryRestore)
    return () => cancelAnimationFrame(raf)
  }, [renderedPreviewKey])

  // After a section move, the preview remounts (renderedPreviewKey changes)
  // and the moved section lands in a new position. Scroll it into view so the
  // user sees the result of the move instead of being dumped at the top.
  useEffect(() => {
    if (pendingScrollToSectionRef.current === null) return
    const varName = pendingScrollToSectionRef.current
    pendingScrollToSectionRef.current = null
    let raf = 0
    let attempts = 0
    const tryScroll = () => {
      const root = document.querySelector('.genui-preview')
      const escaped =
        typeof CSS?.escape === 'function' ? CSS.escape(varName) : varName
      const el =
        root?.querySelector<HTMLElement>(`[data-openui-var="${escaped}"]`) ??
        root?.querySelector<HTMLElement>(`#${escaped}`)
      if (el) {
        el.scrollIntoView({ block: 'center' })
        return
      }
      // Content not ready yet — retry for up to ~500ms (30 frames)
      if (attempts++ < 30) {
        raf = requestAnimationFrame(tryScroll)
      }
    }
    raf = requestAnimationFrame(tryScroll)
    return () => cancelAnimationFrame(raf)
  }, [renderedPreviewKey])

  const handlePublish = async () => {
    if (resolvedSessionId === undefined || publishInFlightRef.current) return

    publishInFlightRef.current = true
    closeInlineEditingSurface('cancel')
    setPublishError(undefined)
    setIsPublishing(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, resolvedSessionId)

      await trackDashboardSave(
        publishPreview({
          sessionId: resolvedSessionId,
          anonymousOwnerSecret,
        }),
      )
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Publish failed')
    } finally {
      publishInFlightRef.current = false
      setIsPublishing(false)
    }
  }

  const handlePreviewSelect = (_selection: PreviewSelection) => {
    // Selection no longer used with inline editing
  }

  const handleSectionSelect = (selection: InspectorSelection | null) => {
    setInspectorSelection(selection)
    if (selection) {
      // Unified: also open the InlineEditToolbar for the selected section element
      const root = document.querySelector('.genui-preview')
      const el = root?.querySelector<HTMLElement>(selection.elementPath)
      if (el) {
        const rect = el.getBoundingClientRect()
        originalStyleAttributeRef.current = el.getAttribute('style')
        setToolbarState({
          isOpen: true,
          anchorRect: rect,
          activeElement: el,
        })
      }
    } else {
      closeInlineEditingSurface('cancel')
    }
  }

  const resolveMoveVarName = () => {
    if (!inspectorSelection) return undefined
    if (inspectorSelection.openuiVar) return inspectorSelection.openuiVar
    const root = document.querySelector('.genui-preview')
    if (!root) return undefined
    const el = root.querySelector<HTMLElement>(inspectorSelection.elementPath)
    if (!el) return undefined
    return (
      el.getAttribute('data-openui-var') ??
      el.closest('[data-openui-var]')?.getAttribute('data-openui-var') ??
      el.getAttribute('id') ??
      el.closest('[id]')?.getAttribute('id') ??
      undefined
    )
  }

  const handleSectionMoveUp = async () => {
    const varName = resolveMoveVarName()
    if (!varName) return
    pendingScrollToSectionRef.current = varName
    await trackDashboardSave(reorder.reorder(varName, 'up'))
  }

  const handleSectionMoveDown = async () => {
    const varName = resolveMoveVarName()
    if (!varName) return
    pendingScrollToSectionRef.current = varName
    await trackDashboardSave(reorder.reorder(varName, 'down'))
  }

  const handleSectionEditSubmit = async (prompt: string) => {
    if (!resolvedSessionId) return
    // The AI edit can be triggered from either the section inspector
    // (inspectorSelection set) or the inline toolbar's Sparkles panel
    // (only toolbarState.activeElement is set). Fall back to building a
    // selection from the inline toolbar's active element so the AI edit
    // works without the inspector being open.
    const previewRoot = document.querySelector('.genui-preview')
    const selection = resolveSectionEditSelection({
      activeElement: toolbarState.activeElement,
      inspectorSelection,
      previewRoot: previewRoot instanceof HTMLElement ? previewRoot : null,
    })
    if (!selection) return
    // Save the preview scroll position before the edit. A successful AI edit
    // bumps previewVersion → renderedPreviewKey changes → the scroll container
    // remounts at scrollTop=0. The restore effect picks this up.
    const previewScrollEl = getPreviewScrollEl()
    if (previewScrollEl) {
      savedPreviewScrollRef.current = previewScrollEl.scrollTop
    }
    setIsSectionEditing(true)
    setSectionEditError(undefined)
    try {
      const response = await trackDashboardSave(
        fetch(
          `/api/sessions/${encodeURIComponent(resolvedSessionId)}/section-edit`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instruction: prompt,
              selection,
              anonymousOwnerSecret: activeAnonymousOwnerSecret,
            }),
          },
        ),
      )
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(
          (errorBody as { error?: string }).error ??
            `Section edit failed (${response.status})`,
        )
      }
      // Success — the Convex mutation bumps previewVersion, which triggers
      // a live query update and re-renders the preview automatically. Close
      // the inline toolbar too: the edited element is gone after the re-render
      // and the toolbar would otherwise linger over a stale selection.
      closeInlineEditingSurface('cancel')
    } catch (error) {
      setSectionEditError(
        error instanceof Error ? error.message : 'Section edit failed',
      )
    } finally {
      setIsSectionEditing(false)
    }
  }

  const applyTextChange = async (change: CapsuleTextChange) => {
    // ─── Capsule-aware path: route to Lakebed structured data ──────────────
    // When the edited text matches a capsule prop, persist via Lakebed merge
    // instead of the generic text-override path. This keeps the capsule's
    // structured data in sync with inline edits and re-renders in realtime.
    if (change.capsuleProp) {
      const ctx = change.capsuleProp
      try {
        // Fetch current capsule data to build a correct patch for collection items.
        // For scalars, we can patch directly. For collections, we need the current
        // items array to avoid clobbering siblings.
        const currentState = await mergeLakebedData({
          sessionId: (resolvedSessionId || sessionId) as Id<'sessions'>,
          capsule: ctx.lakebedKey,
          ...(activeAnonymousOwnerSecret
            ? { anonymousOwnerSecret: activeAnonymousOwnerSecret }
            : {}),
          patch: {},
        })
        const currentData = (
          currentState &&
          typeof currentState === 'object' &&
          !Array.isArray(currentState)
            ? currentState
            : {}
        ) as Record<string, unknown>
        const patch = buildPropPatch(ctx, change.newText, currentData)
        await mergeLakebedData({
          sessionId: (resolvedSessionId || sessionId) as Id<'sessions'>,
          capsule: ctx.lakebedKey,
          ...(activeAnonymousOwnerSecret
            ? { anonymousOwnerSecret: activeAnonymousOwnerSecret }
            : {}),
          patch,
        })
      } catch (error) {
        console.error('[Inline Edit] Lakebed capsule edit failed:', error)
        // Fall back to text override path
        await handleTextChangeFallback(change)
      }
      return
    }

    await handleTextChangeFallback(change)
  }

  const handleTextChange = (change: CapsuleTextChange): Promise<void> => {
    const signature = JSON.stringify([
      activePreviewIdentity,
      change.oldText,
      change.newText,
      change.occurrenceIndex,
      change.capsuleProp?.lakebedKey,
      change.capsuleProp?.propKey,
    ])
    const existing = pendingTextChangesRef.current.get(change.element)
    if (existing?.signature === signature) return existing.promise

    const promise = trackDashboardSave(applyTextChange(change))
    const pending: PendingTextChange = { signature, promise }
    pending.promise = promise.finally(() => {
      if (pendingTextChangesRef.current.get(change.element) === pending) {
        pendingTextChangesRef.current.delete(change.element)
      }
    })
    pendingTextChangesRef.current.set(change.element, pending)
    return pending.promise
  }

  /** Original text-override path — persists via Convex createEdit. */
  const handleTextChangeFallback = async (change: CapsuleTextChange) => {
    const editPreviewIdentity = activePreviewIdentity
    const tag = change.element.tagName.toLowerCase()
    const text = change.element.textContent?.slice(0, 20) || ''
    const label = `${tag.toUpperCase()}: ${text}…`
    // Save the preview scroll position before the edit. A successful edit
    // bumps the preview version, which changes renderedPreviewKey and
    // remounts the scroll container, resetting scrollTop to 0.
    const previewScrollEl = getPreviewScrollEl()
    if (previewScrollEl) {
      savedPreviewScrollRef.current = previewScrollEl.scrollTop
    }
    // Same source of truth as the AI's `textRewrite` tool.
    const result = await editController.applyCommand(
      buildTextRewriteCommand(
        {
          beforeText: change.oldText,
          afterText: change.newText,
          targetLabel: label,
          occurrenceIndex: change.occurrenceIndex,
        },
        {
          sessionId: resolvedSessionId || sessionId,
          instruction: 'inline edit',
        },
      ),
    )

    if (result === 'fork_needed') {
      // Fork the session
      toast.info('Forking session to save your changes...')
      const forkResult = await editController.forkCurrentSession()
      if (!forkResult) {
        // Fork failed, revert the change
        if (
          change.element.isConnected &&
          activePreviewIdentityRef.current === editPreviewIdentity
        ) {
          revertTextPreservingIcons(change.element, change.oldText)
        }
        toast.error(editController.editError || 'Failed to fork session')
      }
    } else if (result !== true && 'error' in result) {
      // Revert the DOM change on other errors
      if (
        change.element.isConnected &&
        activePreviewIdentityRef.current === editPreviewIdentity
      ) {
        revertTextPreservingIcons(change.element, change.oldText)
      }
      console.error('[Inline Edit] Failed to save:', result.error)
      toast.error(result.error)
    }
  }

  const handleImageChange = (change: ImageChange) => {
    const editPreviewIdentity = activePreviewIdentity
    // Optimistic: show the new image immediately (reverted below on failure).
    // A multi-image payload previews its first URL — the carousel renders once
    // the persisted edit re-applies through imageOverrides.
    change.element.src = firstImageSrc(change.newSrc) ?? change.element.src
    // Anchor the swap on the image's `alt` (stable across renders), not its src:
    // the stored preview HTML and the live DOM resolve different /api/pexels
    // queries from the same alt, so src never matches. occurrenceIndex picks the
    // right image when several share an alt.
    const sameAlt = Array.from(
      change.element.ownerDocument.querySelectorAll('img'),
    ).filter((img) => (img as HTMLImageElement).alt === change.alt)
    const occurrenceIndex = Math.max(0, sameAlt.indexOf(change.element))
    // Save scroll position before the edit (see handleTextChange for rationale)
    const previewScrollEl = getPreviewScrollEl()
    if (previewScrollEl) {
      savedPreviewScrollRef.current = previewScrollEl.scrollTop
    }
    // Fire and forget - the page will reload after successful edit.
    // Same source of truth as the AI's `imageReplace` tool. `sourceAnchor: alt`
    // keeps the swap anchored on the image's stable `alt` (builder uses
    // sourceAnchor as beforeText), preserving the prior matching behaviour.
    void trackDashboardSave(
      editController
        .applyCommand(
          buildImageReplaceCommand(
            {
              src: change.newSrc,
              alt: change.alt,
              sourceAnchor: change.alt,
              occurrenceIndex,
            },
            {
              sessionId: resolvedSessionId || sessionId,
              selectedTag: 'img',
              instruction: 'inline image swap',
            },
          ),
        )
        .then(async (result) => {
          if (result === 'fork_needed') {
            // Fork the session
            toast.info('Forking session to save your changes...')
            const forkResult = await editController.forkCurrentSession()
            if (
              !forkResult &&
              change.element.isConnected &&
              activePreviewIdentityRef.current === editPreviewIdentity
            ) {
              // Fork failed, revert the change
              change.element.src = change.oldSrc
              toast.error(editController.editError || 'Failed to fork session')
            }
          } else if (result !== true && 'error' in result) {
            // Revert the DOM change on other errors
            if (
              change.element.isConnected &&
              activePreviewIdentityRef.current === editPreviewIdentity
            ) {
              change.element.src = change.oldSrc
            }
            console.error('[Inline Edit] Failed to save image:', result.error)
            toast.error(result.error)
          }
        }),
    )
  }

  const handleImageTarget = (event: Event) => {
    const customEvent = event as CustomEvent<{
      element: HTMLImageElement
      src: string
      alt: string
    }>
    const { element } = customEvent.detail
    const rect = element.getBoundingClientRect()

    // Unified: open the InlineEditToolbar with the image element.
    // The toolbar detects <img> and shows the image swap panel.
    closeInlineEditingSurface('cancel')
    originalStyleAttributeRef.current = element.getAttribute('style')
    setToolbarState({
      isOpen: true,
      anchorRect: rect,
      activeElement: element,
    })
  }

  const handleImageSelect = (newSrc: string, originalSrc: string) => {
    const el = toolbarState.activeElement as HTMLImageElement | null
    if (el) {
      handleImageChange({
        oldSrc: originalSrc,
        newSrc,
        element: el,
        alt: el.alt ?? '',
      })
    }
  }

  const handleElementActivate = (element: HTMLElement, rect: DOMRect) => {
    if (element.tagName === 'IMG') {
      closeInlineEditingSurface('cancel')
    }
    originalStyleAttributeRef.current = element.getAttribute('style')
    setToolbarState({
      isOpen: true,
      anchorRect: rect,
      activeElement: element,
    })
  }

  // "Select parent" toolbar button — promote selection one DOM level up so the
  // user can reach gapless containers (e.g. the page root for the whole-app
  // background). Route through the inspector's select event so the cyan
  // overlay, inspectorSelection and toolbar all move together, exactly as a
  // real click on that element would.
  const handleSelectParent = (element: HTMLElement) => {
    document.dispatchEvent(
      new CustomEvent('ship-fast-inspector-select', { detail: { element } }),
    )
  }

  const handleLinkEdit = async (payload: LinkEditPayload) => {
    if (!resolvedSessionId) return
    const source = renderedPreviewSource
    if (!source) return
    // Save scroll position before the edit (see handleTextChange for rationale)
    const previewScrollEl = getPreviewScrollEl()
    if (previewScrollEl) {
      savedPreviewScrollRef.current = previewScrollEl.scrollTop
    }
    // Same source of truth as the AI's `linkEdit` tool — the builder performs
    // the `updateLinkInSource` patch itself, so we no longer duplicate it here.
    activeLinkEditsRef.current += 1
    try {
      const command = buildLinkEditCommand(
        {
          oldHref: payload.oldHref,
          href: payload.newHref,
          label: payload.newText,
          target: payload.target,
          rel: payload.rel,
          occurrenceIndex: payload.occurrenceIndex,
        },
        {
          sessionId: resolvedSessionId || sessionId,
          currentSource: source,
          selectedText: payload.oldText,
        },
      )
      const result = await trackDashboardSave(
        editController.applyCommand(command),
      )

      if (result === 'fork_needed') {
        setIsForkingSession(true)
        toast.info('Forking session to save your changes...')
        try {
          const forkResult = await trackDashboardSave(
            editController.forkCurrentSession(),
          )
          if (!forkResult) {
            toast.error(editController.editError || 'Failed to fork session')
          }
        } finally {
          setIsForkingSession(false)
        }
      } else if (result !== true) {
        const errorMsg =
          typeof result === 'object' && result
            ? result.error
            : 'Failed to save link'
        console.error('[Inline Edit] Failed to save link:', errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save link'
      console.error('[Inline Edit] Failed to save link:', error)
      toast.error(errorMessage)
    } finally {
      activeLinkEditsRef.current = Math.max(0, activeLinkEditsRef.current - 1)
    }
  }

  // Undo/redo restore a previous preview version, which bumps previewVersion
  // → renderedPreviewKey changes → scroll container remounts at scrollTop=0.
  // Save the scroll position before the restore so it can be restored after.
  const handleUndo = async () => {
    const previewScrollEl = getPreviewScrollEl()
    if (previewScrollEl) {
      savedPreviewScrollRef.current = previewScrollEl.scrollTop
    }
    await trackDashboardSave(undoRedo.undo())
  }

  const handleRedo = async () => {
    const previewScrollEl = getPreviewScrollEl()
    if (previewScrollEl) {
      savedPreviewScrollRef.current = previewScrollEl.scrollTop
    }
    await trackDashboardSave(undoRedo.redo())
  }

  const handleMoveUp = async () => {
    if (!toolbarState.activeElement) return
    const el = toolbarState.activeElement
    const varName =
      el.getAttribute('data-openui-var') ??
      el.closest('[data-openui-var]')?.getAttribute('data-openui-var') ??
      el.getAttribute('id') ??
      el.closest('[id]')?.getAttribute('id') ??
      undefined
    if (varName) {
      pendingScrollToSectionRef.current = varName
      await trackDashboardSave(reorder.reorder(varName, 'up'))
    }
  }

  const handleMoveDown = async () => {
    if (!toolbarState.activeElement) return
    const el = toolbarState.activeElement
    const varName =
      el.getAttribute('data-openui-var') ??
      el.closest('[data-openui-var]')?.getAttribute('data-openui-var') ??
      el.getAttribute('id') ??
      el.closest('[id]')?.getAttribute('id') ??
      undefined
    if (varName) {
      pendingScrollToSectionRef.current = varName
      await trackDashboardSave(reorder.reorder(varName, 'down'))
    }
  }

  const handleStyleApply = async (payload: StyleApplyPayload) => {
    // Use the original style captured when the toolbar opened (before any
    // live-preview modification). Capturing at apply-time is too late — the
    // toolbar has already applied the live preview by then.
    const activeElement = toolbarState.activeElement
    const originalStyleAttribute = originalStyleAttributeRef.current
    const editPreviewIdentity = activePreviewIdentity

    setIsApplyingStyle(true)
    const tag = toolbarState.activeElement?.tagName.toLowerCase() || 'DIV'
    const text = toolbarState.activeElement?.textContent?.slice(0, 20) || ''
    const label = `${tag.toUpperCase()}: ${text}…`
    // Save scroll position before the edit (see handleTextChange for rationale)
    const previewScrollEl = getPreviewScrollEl()
    if (previewScrollEl) {
      savedPreviewScrollRef.current = previewScrollEl.scrollTop
    }
    // Same source of truth as the AI's `styleApply` tool: build the command
    // through the shared semantic builder, then persist via the shared executor.
    const result = await trackDashboardSave(
      editController.applyCommand(
        buildStyleApplyCommand(
          {
            sourceAnchor: payload.sourceAnchor,
            style: payload.style,
            targetLabel: label,
            occurrenceIndex: payload.occurrenceIndex,
          },
          {
            sessionId: resolvedSessionId || sessionId,
            instruction: 'inline style',
          },
        ),
      ),
    )
    setIsApplyingStyle(false)

    if (result === 'fork_needed') {
      // Fork the session
      setIsForkingSession(true)
      toast.info('Forking session to save your changes...')
      const forkResult = await trackDashboardSave(
        editController.forkCurrentSession(),
      )
      setIsForkingSession(false)
      if (
        !forkResult &&
        activeElement?.isConnected &&
        activePreviewIdentityRef.current === editPreviewIdentity
      ) {
        // Fork failed, revert the style changes
        if (originalStyleAttribute === null) {
          activeElement.removeAttribute('style')
        } else {
          activeElement.setAttribute('style', originalStyleAttribute)
        }
        toast.error(editController.editError || 'Failed to fork session')
      }
    } else if (result === true) {
      // Close toolbar and reload for style edits
      closeInlineEditingSurface('cancel')
    } else {
      // Revert the style changes on other errors
      if (
        activeElement?.isConnected &&
        activePreviewIdentityRef.current === editPreviewIdentity
      ) {
        if (originalStyleAttribute === null) {
          activeElement.removeAttribute('style')
        } else {
          activeElement.setAttribute('style', originalStyleAttribute)
        }
      }
      const styleErrorMsg =
        typeof result === 'object' && result
          ? result.error
          : 'Failed to save style'
      console.error('[Inline Edit] Failed to save style:', styleErrorMsg)
      toast.error(styleErrorMsg)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleImageTargetEvent = (event: Event) => handleImageTarget(event)
    window.addEventListener('image-target', handleImageTargetEvent)

    return () => {
      window.removeEventListener('image-target', handleImageTargetEvent)
    }
  }, [])

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#070913]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.026)_1px,transparent_1px)] bg-[size:64px_64px] opacity-70"></div>
      </div>

      <audio id="launch-sfx" preload="auto" src="/assets/launch.mp3"></audio>

      {!isPreviewRenderable && !isMissingSession && !hasGenerationFailure ? (
        <IntroLoader
          progress={Math.min(0.94, progress / 100)}
          playSound={startedFromGenerationFlow}
        />
      ) : null}

      <div
        className={cn(
          'dashboard-shell relative z-[1] min-h-screen w-full overflow-hidden p-4 opacity-0 transition-opacity duration-700 ease-out',
          isDashboardActive && 'opacity-100',
        )}
        id="dashboard-wrap"
      >
        <div
          className={cn(
            'mx-auto flex min-h-[calc(100vh-32px)] w-full max-w-[1680px] items-center justify-center',
            (isPreviewRenderable || isMissingSession || hasGenerationFailure) &&
              'items-stretch',
          )}
          id="right-panel"
        >
          <div
            id="dashboard-cockpit"
            className={cn(
              'flex h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-3xl rounded-bl-none border border-white/10 bg-[#0b0d14] shadow-[0_18px_54px_rgba(0,0,0,0.36)]',
              (isPreviewRenderable ||
                isMissingSession ||
                hasGenerationFailure) &&
                'bg-[#080a10]/92',
              isDashboardActive && 'cockpit-fade-up',
            )}
          >
            <div className="dashboard-topbar flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-white/[0.035] px-3">
              <button
                type="button"
                className="dashboard-topbar-circle-button grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-white/70 transition-colors hover:bg-white/[0.09] hover:text-white"
                onClick={handleBackClick}
                data-tip="Back"
                aria-label="Back"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15 18-6-6 6-6"
                  />
                </svg>
              </button>
              <div className="dashboard-url-pill flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/8 bg-black/25 px-3 py-2 text-sm text-white/48">
                <span className="size-2 shrink-0 rounded-full bg-emerald-300/80" />
                <a
                  className="min-w-0 truncate font-mono text-xs text-white/56 no-underline"
                  id="url-text"
                  href={currentUrl}
                  aria-label="Current preview URL"
                >
                  {currentUrl}
                </a>
              </div>
              {!isMissingSession ? (
                <div
                  className="dashboard-preview-tools flex shrink-0 items-center gap-2"
                  id="preview-frame-tools"
                  aria-label="Preview controls"
                >
                  <button
                    type="button"
                    className="dashboard-publish-button inline-flex h-9 items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/12 px-3 text-xs font-bold text-cyan-100 transition-colors hover:bg-cyan-300/18 disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={!isPreviewReady || isPublishing}
                    onClick={() => {
                      if (!requireSignInForEdit()) return
                      void handlePublish()
                    }}
                    data-tip={
                      publishedUrl
                        ? 'Republish latest preview'
                        : 'Publish preview'
                    }
                    aria-label={
                      publishedUrl
                        ? 'Republish latest preview'
                        : 'Publish preview'
                    }
                  >
                    <Globe2 className="size-3.5" strokeWidth={2} />
                    {isPublishing
                      ? 'Publishing'
                      : publishedUrl
                        ? 'Republish'
                        : 'Publish'}
                  </button>
                  <button
                    type="button"
                    className="dashboard-topbar-circle-button grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-white/62 transition-colors hover:bg-white/[0.09] hover:text-white"
                    id="preview-refresh-btn"
                    data-tip="Refresh preview"
                    aria-label="Reload page"
                    onClick={handlePreviewReload}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      aria-hidden="true"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16M21 21v-5h-5"
                      />
                    </svg>
                  </button>
                  <div
                    className="dashboard-toolbar-group flex items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1"
                    role="group"
                    aria-label="Edit controls"
                  >
                    <button
                      type="button"
                      className={cn(
                        'dashboard-toolbar-icon-button grid size-8 place-items-center rounded-full text-white/52 transition-colors hover:bg-white/[0.08] hover:text-white',
                        editMode && 'bg-cyan-300/16 text-cyan-100',
                      )}
                      data-tip="Edit"
                      aria-label="Toggle inline edit mode"
                      aria-pressed={editMode}
                      onClick={() => {
                        if (!requireSignInForEdit()) return
                        setEditMode((mode) => !mode)
                      }}
                    >
                      <Edit3 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div
                    className="dashboard-toolbar-group flex items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1"
                    role="group"
                    aria-label="Viewport size"
                  >
                    {(['desktop', 'tablet', 'mobile'] as const).map(
                      (device) => (
                        <button
                          key={device}
                          type="button"
                          className={cn(
                            'dashboard-toolbar-icon-button grid size-8 place-items-center rounded-full text-white/52 transition-colors hover:bg-white/[0.08] hover:text-white',
                            currentDevice === device &&
                              'bg-cyan-300/16 text-cyan-100',
                          )}
                          data-preview-device={device}
                          aria-label={
                            device === 'desktop'
                              ? 'Desktop viewport'
                              : device === 'tablet'
                                ? 'Tablet viewport'
                                : 'Mobile viewport'
                          }
                          aria-pressed={currentDevice === device}
                          onClick={() => setCurrentDevice(device)}
                        >
                          {device === 'desktop' ? (
                            <svg
                              className="size-4"
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              aria-hidden="true"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="12"
                                rx="2"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M8 20h8M12 16v4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : device === 'tablet' ? (
                            <svg
                              className="size-4"
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              aria-hidden="true"
                            >
                              <rect
                                x="6"
                                y="3"
                                width="12"
                                height="18"
                                rx="2"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M11 18h2"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="size-4"
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              aria-hidden="true"
                            >
                              <rect
                                x="8"
                                y="2.5"
                                width="8"
                                height="19"
                                rx="2"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M11 18h2"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <div
              className={cn(
                'relative grid min-h-0 flex-1',
                isMissingSession || hasGenerationFailure
                  ? 'grid-cols-1'
                  : 'grid-cols-[minmax(0,1fr)_auto]',
              )}
            >
              {publishError && (
                <div className="absolute right-6 top-6 z-20 max-w-sm rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-100 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                  {publishError}
                </div>
              )}
              <div className="relative min-h-0 overflow-hidden bg-[#05070c]">
                <div
                  className="h-full min-h-0 flex items-center justify-center overflow-auto"
                  id="preview-stage"
                >
                  {isMissingSession ? (
                    <MissingProjectState />
                  ) : hasGenerationFailure ? (
                    <GenerationFailureState
                      errorMessage={
                        generationView?.session.errorMessage ??
                        generationView?.session.errorCode ??
                        'Generation failed unexpectedly.'
                      }
                    />
                  ) : (
                    <div
                      id="preview-device-frame"
                      data-preview-device={currentDevice}
                      style={previewDeviceStyle}
                    >
                      <div
                        className="relative h-full min-h-[480px] overflow-hidden shadow-[0_18px_70px_rgba(0,0,0,0.38)] transition-all duration-300"
                        id="preview-device-shell"
                        data-preview-device={currentDevice}
                        data-preview-container="true"
                        style={{
                          width: '100%',
                          minWidth: 0,
                          maxWidth: '100%',
                          height: '100%',
                        }}
                      >
                        {isPreviewRenderable &&
                        (homeModule?.source || clonePageNav.currentUrl) &&
                        generationView ? (
                          <SessionGeneratedPreview
                            // Use homeModule.updatedAt for normal previews to avoid remounting on
                            // unrelated previewVersion bumps. CMS-promoted HTML is versioned by the
                            // latest preview because that HTML is now the displayed source.
                            key={renderedPreviewKey}
                            source={renderedPreviewSource}
                            sourceUrl={
                              clonePageNav.isClone
                                ? clonePageNav.currentUrl
                                : null
                            }
                            sessionId={activeSessionId}
                            siteSpecJson={generationView.siteSpec?.specJson}
                            locale={activePreviewLocale}
                            prompt={generationView.session.prompt}
                            selectedBrandLogo={activeBrand}
                            imageOverrides={imageOverrides}
                            styleOverrides={styleOverrides}
                            textOverrides={textOverrides}
                            isDark={isDark}
                            themeStyles={themeStyles}
                            deviceMode={currentDevice}
                            onPreviewSelect={handlePreviewSelect}
                            editMode={editMode}
                            onTextChange={handleTextChange}
                            onImageChange={handleImageChange}
                            onElementActivate={handleElementActivate}
                            onCommitText={handleCommitTextReady}
                            onSectionSelect={handleSectionSelect}
                          />
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {!isMissingSession && !hasGenerationFailure && (
                <>
                  <button
                    type="button"
                    onClick={() => setRailUserToggle(false)}
                    aria-label="Expand site tools"
                    aria-expanded={false}
                    className={cn(
                      'absolute right-0 top-16 z-20 flex items-center gap-1.5 rounded-l-xl border border-r-0 border-white/10 bg-[#0c1018]/92 px-2.5 py-2.5 text-white/56 transition-[color,background-color,transform,opacity] duration-200 ease-out hover:text-white hover:bg-[#0c1018]',
                      railCollapsed
                        ? 'translate-x-0 opacity-100'
                        : 'pointer-events-none translate-x-3 opacity-0',
                    )}
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    <span className="text-[11px] font-medium tracking-wide">
                      Tools
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRailUserToggle(true)}
                    aria-label="Collapse site tools"
                    aria-expanded={true}
                    className={cn(
                      'absolute right-0 top-16 z-20 grid size-7 place-items-center rounded-l-lg border border-r-0 border-white/10 bg-[#0c1018]/92 text-white/56 transition-[color,background-color,transform,opacity] duration-200 ease-out hover:text-white hover:bg-[#0c1018]',
                      railCollapsed
                        ? 'pointer-events-none -translate-x-3 opacity-0'
                        : '-translate-x-[280px] opacity-100',
                    )}
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </>
              )}
              <aside
                className={cn(
                  'relative flex min-h-0 flex-col overflow-hidden border-l border-white/10 bg-[#0c1018]/92 transition-[width] duration-200 ease-out',
                  (isMissingSession || hasGenerationFailure) && 'hidden',
                  railCollapsed ? 'w-0' : 'w-[280px]',
                )}
                id="preview-site-rail"
                aria-label="Site tools"
              >
                <div className="flex min-h-0 w-[280px] flex-1 flex-col gap-5 overflow-y-auto p-4">
                  <div className="grid gap-2">
                    <div className="px-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/32">
                      Manage content
                    </div>
                    <SignInGate
                      locked={
                        <RailLockedButton
                          label="E-commerce"
                          icon={
                            <Package className="size-3.5" strokeWidth={1.9} />
                          }
                          badges={
                            <>
                              <span className={newBadgeClass}>
                                {commerceConfig?.status === 'ready'
                                  ? 'READY'
                                  : 'NEW'}
                              </span>
                              <span
                                className={premiumBadgeClass}
                                aria-label="Pro only - upgrade to unlock"
                                tabIndex={0}
                              >
                                {crownIcon}
                              </span>
                            </>
                          }
                        />
                      }
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={railRowClass}
                            data-rail-action="ecommerce"
                            aria-haspopup="dialog"
                          >
                            <span className={railIconClass} aria-hidden="true">
                              <Package className="size-3.5" strokeWidth={1.9} />
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              E-commerce
                            </span>
                            <span className={newBadgeClass}>
                              {commerceConfig?.status === 'ready'
                                ? 'READY'
                                : 'NEW'}
                            </span>
                            <span
                              className={premiumBadgeClass}
                              aria-label="Pro only - upgrade to unlock"
                              tabIndex={0}
                            >
                              {crownIcon}
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          side="left"
                          sideOffset={12}
                          className="z-[140] w-[min(360px,calc(100vw-24px))] p-3"
                        >
                          <Suspense fallback={<ToolPopoverFallback />}>
                            <CommercePanel
                              sessionId={activeSessionId}
                              visualProductCount={visualProductCount}
                              visualProducts={visualProducts}
                            />
                          </Suspense>
                        </PopoverContent>
                      </Popover>
                    </SignInGate>
                  </div>
                  <div className="grid gap-2">
                    <div className="px-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/32">
                      Design
                    </div>
                    <SignInGate
                      locked={
                        <RailLockedButton
                          label="Theme"
                          icon={
                            <Palette className="size-3.5" strokeWidth={1.9} />
                          }
                          sublabel={activeThemeLabel}
                        />
                      }
                    >
                      <ThemePicker
                        value={effectiveTheme}
                        isDark={isDark}
                        popoverSide="left"
                        popoverAlign="start"
                        popoverSideOffset={12}
                        popoverClassName="z-[140] w-[min(360px,calc(100vw-24px))] p-0"
                        onSelect={handleThemeSelect}
                        onToggleMode={handleThemeModeToggle}
                        trigger={
                          <button
                            type="button"
                            className={cn(
                              railRowClass,
                              'border-white/14 bg-white/[0.04] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
                            )}
                            style={activeThemeButtonStyle}
                            data-rail-action="palette"
                          >
                            <span
                              className={cn(
                                railIconClass,
                                'bg-black/24 text-white/88 group-hover:bg-black/32',
                              )}
                              aria-hidden="true"
                            >
                              <Palette className="size-3.5" strokeWidth={1.9} />
                            </span>
                            <span className="grid min-w-0 flex-1 gap-0.5">
                              <span className="truncate">Theme</span>
                              <span className="truncate font-mono text-[10px] leading-tight tracking-[0.04em] text-white/64">
                                {activeThemeLabel}
                              </span>
                            </span>
                            <span
                              className="grid size-8 shrink-0 place-items-center rounded-xl border border-white/12 bg-black/22 text-white/72"
                              aria-hidden="true"
                            >
                              <Palette className="size-4" strokeWidth={1.8} />
                            </span>
                          </button>
                        }
                      />
                    </SignInGate>
                    <SignInGate
                      locked={
                        <RailLockedButton
                          label="Brand and media"
                          icon={
                            <Building2 className="size-3.5" strokeWidth={1.9} />
                          }
                        />
                      }
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={railRowClass}
                            data-rail-action="brand-media"
                            aria-haspopup="dialog"
                          >
                            <span
                              className={cn(
                                railIconClass,
                                activeBrandIcon &&
                                  'overflow-hidden bg-white text-slate-500',
                              )}
                              aria-hidden="true"
                            >
                              {activeBrandIcon ? (
                                <img
                                  src={activeBrandIcon}
                                  alt=""
                                  className="max-h-4 max-w-4 object-contain"
                                />
                              ) : (
                                <Building2
                                  className="size-3.5"
                                  strokeWidth={1.9}
                                />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              Brand and media
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          side="left"
                          sideOffset={12}
                          className="z-[140] w-72 p-0"
                        >
                          <Suspense fallback={<ToolPopoverFallback />}>
                            <BrandMediaPanel
                              sessionId={resolvedSessionId ?? sessionId}
                              prompt={generationView?.session.prompt ?? ''}
                              cloneUrl={generationView?.session.cloneUrl}
                              designReferenceUrls={
                                generationView?.session.designReferenceUrls ??
                                []
                              }
                              designReferenceNotes={
                                generationView?.session.designReferenceNotes ??
                                ''
                              }
                              onSelectBrand={handleBrandSelect}
                            />
                          </Suspense>
                        </PopoverContent>
                      </Popover>
                    </SignInGate>
                    <SignInGate
                      locked={
                        <RailLockedButton
                          label="Localization"
                          icon={
                            <Languages className="size-3.5" strokeWidth={1.9} />
                          }
                          sublabel={
                            generationView?.session.preferredLanguage ??
                            'default locale'
                          }
                          badges={
                            <span
                              className={premiumBadgeClass}
                              aria-label="Pro only - upgrade to unlock"
                              tabIndex={0}
                            >
                              {crownIcon}
                            </span>
                          }
                        />
                      }
                    >
                      <LanguagePicker
                        value={
                          generationView?.session.preferredLanguage ?? null
                        }
                        onSelect={handleLanguageSelect}
                        trigger={
                          <button
                            type="button"
                            className={cn(
                              railRowClass,
                              'border-white/14 bg-white/[0.04] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
                            )}
                            data-rail-action="localization"
                          >
                            <span
                              className={cn(
                                railIconClass,
                                'bg-black/24 text-white/88 group-hover:bg-black/32',
                              )}
                              aria-hidden="true"
                            >
                              <Languages
                                className="size-3.5"
                                strokeWidth={1.9}
                              />
                            </span>
                            <span className="grid min-w-0 flex-1 gap-0.5">
                              <span className="truncate">Localization</span>
                              <span className="truncate font-mono text-[10px] leading-tight tracking-[0.04em] text-white/64">
                                {generationView?.session.preferredLanguage ??
                                  'default locale'}
                              </span>
                            </span>
                            <span
                              className={premiumBadgeClass}
                              aria-label="Pro only - upgrade to unlock"
                              tabIndex={0}
                            >
                              {crownIcon}
                            </span>
                          </button>
                        }
                      />
                    </SignInGate>
                    <SignInGate
                      locked={
                        <RailLockedButton
                          label="GitHub"
                          icon={
                            <Github className="size-3.5" strokeWidth={1.9} />
                          }
                          badges={
                            <span
                              className={premiumBadgeClass}
                              aria-label="Pro only - upgrade to unlock"
                              tabIndex={0}
                            >
                              {crownIcon}
                            </span>
                          }
                        />
                      }
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={railRowClass}
                            data-rail-action="github"
                            aria-haspopup="dialog"
                          >
                            <span className={railIconClass} aria-hidden="true">
                              <Github className="size-3.5" strokeWidth={1.9} />
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              GitHub
                            </span>
                            <span
                              className={premiumBadgeClass}
                              aria-label="Pro only - upgrade to unlock"
                              tabIndex={0}
                            >
                              {crownIcon}
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          side="left"
                          sideOffset={12}
                          className="z-[140] w-[min(360px,calc(100vw-24px))] p-3"
                        >
                          <Suspense fallback={<ToolPopoverFallback />}>
                            <GitHubPanel sessionId={sessionId} />
                          </Suspense>
                        </PopoverContent>
                      </Popover>
                    </SignInGate>
                    <SignInGate
                      locked={
                        <RailLockedButton
                          label="Billing"
                          icon={
                            <CreditCard
                              className="size-3.5"
                              strokeWidth={1.9}
                            />
                          }
                          badges={
                            <span
                              className={premiumBadgeClass}
                              aria-label="Pro only - upgrade to unlock"
                              tabIndex={0}
                            >
                              {crownIcon}
                            </span>
                          }
                        />
                      }
                    >
                      <button
                        type="button"
                        className={railRowClass}
                        data-rail-action="billing"
                      >
                        <span className={railIconClass} aria-hidden="true">
                          <CreditCard className="size-3.5" strokeWidth={1.9} />
                        </span>
                        <span className="min-w-0 flex-1 truncate">Billing</span>
                        <span
                          className={premiumBadgeClass}
                          aria-label="Pro only - upgrade to unlock"
                          tabIndex={0}
                        >
                          {crownIcon}
                        </span>
                      </button>
                    </SignInGate>
                    <SignInGate
                      locked={
                        <RailLockedButton
                          label="Export"
                          icon={
                            <Download className="size-3.5" strokeWidth={1.9} />
                          }
                          sublabel="HTML / React / Next.js"
                          badges={
                            <div
                              className={cn(
                                stateBadgeClass,
                                'bg-[linear-gradient(135deg,#f5d0a8_0%,#e8b86d_100%)]',
                              )}
                              data-state="premium"
                            >
                              <span className="text-[#0a0a0b]">Pro only</span>
                            </div>
                          }
                        />
                      }
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={railRowClass}
                            data-rail-action="export"
                            aria-haspopup="dialog"
                            onClick={() => closeInlineEditingSurface('cancel')}
                          >
                            <span className={railIconClass} aria-hidden="true">
                              <Download
                                className="size-3.5"
                                strokeWidth={1.9}
                              />
                            </span>
                            <span className="grid min-w-0 flex-1 gap-0.5">
                              <span className="truncate">Export</span>
                              <span className="truncate font-mono text-[9.5px] uppercase leading-tight tracking-[0.06em] text-white/42">
                                HTML / React / Next.js
                              </span>
                            </span>
                            <div
                              className={cn(
                                stateBadgeClass,
                                'bg-[linear-gradient(135deg,#f5d0a8_0%,#e8b86d_100%)]',
                              )}
                              data-state="premium"
                            >
                              <span className="text-[#0a0a0b]">Pro only</span>
                            </div>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          side="left"
                          sideOffset={12}
                          className="z-[140] w-[min(360px,calc(100vw-24px))] p-3"
                        >
                          <Suspense fallback={<ToolPopoverFallback />}>
                            <ExportPanel sessionId={activeSessionId} />
                          </Suspense>
                        </PopoverContent>
                      </Popover>
                    </SignInGate>
                    <SignInGate
                      locked={
                        <RailLockedButton
                          label="Deployment URL"
                          icon={
                            <Globe2 className="size-3.5" strokeWidth={1.9} />
                          }
                          sublabel={deploymentStatus?.slug ?? 'publish slug'}
                        />
                      }
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={railRowClass}
                            data-rail-action="domain"
                            aria-haspopup="dialog"
                          >
                            <span className={railIconClass} aria-hidden="true">
                              <Globe2 className="size-3.5" strokeWidth={1.9} />
                            </span>
                            <span className="grid min-w-0 flex-1 gap-0.5">
                              <span className="truncate">Deployment URL</span>
                              <span className="truncate font-mono text-[9.5px] uppercase leading-tight tracking-[0.06em] text-white/42">
                                {deploymentStatus?.slug ?? 'publish slug'}
                              </span>
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          side="left"
                          sideOffset={12}
                          className="z-[140] w-80 p-3"
                        >
                          <Suspense fallback={<ToolPopoverFallback />}>
                            <DeploymentPanel sessionId={activeSessionId} />
                          </Suspense>
                        </PopoverContent>
                      </Popover>
                    </SignInGate>
                  </div>
                  <div className="grid gap-2">
                    <div className="px-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/32">
                      Three JS
                    </div>
                    <SignInGate
                      locked={
                        <RailLockedButton
                          label="3D"
                          icon={<Box className="size-3.5" strokeWidth={1.9} />}
                          badges={
                            <span
                              className={cn(
                                stateBadgeClass,
                                'bg-white/[0.06] text-white/38',
                              )}
                            >
                              SOON
                            </span>
                          }
                        />
                      }
                    >
                      <button
                        type="button"
                        className={cn(
                          railRowClass,
                          'cursor-not-allowed bg-white/[0.025] text-white/34 opacity-55 hover:translate-y-0 hover:border-white/8 hover:bg-white/[0.025] hover:text-white/34',
                        )}
                        disabled
                        data-rail-action="3d"
                      >
                        <span
                          className={cn(
                            railIconClass,
                            'text-white/38 group-hover:translate-y-0 group-hover:border-white/8 group-hover:bg-white/[0.05] group-hover:text-white/38',
                          )}
                          aria-hidden="true"
                        >
                          <Box className="size-3.5" strokeWidth={1.9} />
                        </span>
                        <span className="min-w-0 flex-1 truncate">3D</span>
                        <span
                          className={cn(
                            stateBadgeClass,
                            'bg-white/[0.06] text-white/38',
                          )}
                        >
                          SOON
                        </span>
                      </button>
                    </SignInGate>
                  </div>
                </div>
                <div
                  className="flex w-[280px] items-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-white/48"
                  id="preview-site-rail-status"
                >
                  <span
                    className="grid size-5 place-items-center rounded-full bg-white/[0.04]"
                    aria-hidden="true"
                  >
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        isPreviewReady ? 'bg-emerald-300' : 'bg-cyan-300',
                      )}
                      id="status-dot"
                    ></span>
                  </span>
                  <span id="status-text">
                    {isMissingSession
                      ? 'Project missing'
                      : hasGenerationFailure
                        ? 'Generation failed'
                        : isPreviewReady
                          ? 'Preview ready'
                          : 'Generating'}
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
      {toolbarState.isOpen ? (
        <Suspense fallback={null}>
          <InlineEditToolbar
            isOpen={toolbarState.isOpen}
            onClose={() => closeInlineEditingSurface('cancel')}
            anchorRect={toolbarState.anchorRect}
            activeElement={toolbarState.activeElement}
            onStyleApply={handleStyleApply}
            onCommitText={() => finishPendingTextEdit('commit')}
            onPendingSave={trackDashboardSave}
            isApplying={isApplyingStyle}
            isForking={isForkingSession}
            canUndo={undoRedo.canUndo}
            canRedo={undoRedo.canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onLinkEdit={handleLinkEdit}
            onMoveUp={inspectorSelection ? handleSectionMoveUp : handleMoveUp}
            onMoveDown={
              inspectorSelection ? handleSectionMoveDown : handleMoveDown
            }
            canMoveUp={true}
            canMoveDown={true}
            onImageSelect={handleImageSelect}
            onSelectParent={handleSelectParent}
            sessionId={sessionId}
            anonymousOwnerSecret={activeAnonymousOwnerSecret}
            onSectionEdit={handleSectionEditSubmit}
            isSectionSubmitting={isSectionEditing}
            sectionError={sectionEditError}
          />
        </Suspense>
      ) : null}
    </>
  )
}
