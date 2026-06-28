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
} from 'react'
import {
  Box,
  Building2,
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
  Shield,
} from 'lucide-react'
import { LakebedSessionProvider } from '@ship-fast/lakebed/react'
import { toast } from 'sonner'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import type { PreviewSelection } from '@/components/GenUI/DirectPreview'
import type { InspectorSelection } from '@/features/editing/element-path'
import { IntroLoader } from '@/components/GenUI/IntroLoader'
import { GeneratedModulePreview } from '@/features/generation/components/GeneratedModulePreview'
import { useClonePageNav } from '@/features/clone/hooks/useClonePageNav'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { extractGeneratedCommerceProducts } from '@/features/commerce/services/generated-commerce-products'
import { takeGenerationLaunchHandoff } from '@/features/session/services/generation-launch-handoff'
import {
  readReadySessionPreview,
  rememberReadySession,
  rememberReadySessionPreview,
  type ReadySessionPreviewCacheEntry,
} from '@/features/session/services/ready-session-cache'
import { useEditController } from '@/features/editing/hooks/useEditController'
import { useUndoRedo } from '@/features/editing/hooks/useUndoRedo'
import { useReorderElement } from '@/features/editing/hooks/useReorderElement'
import { replaceHrefInSource } from '@/features/editing/lib/link-source'
import { revertTextPreservingIcons } from '@/features/editing/hooks/useTextEdit'
import { InlineEditToolbar } from '@/features/editing/components/InlineEditToolbar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import ThemePicker from '@/genui/components/ThemePicker'
import { resolveThemeStyles } from '@/genui/theme-apply'
import { SignInGate, useSignInGate } from '@/shared/auth/SignInGate'
import { cn } from '#/lib/utils'

const LakebedAdminPanel = lazy(() =>
  import('@/features/admin/components/LakebedAdminPanel').then((module) => ({
    default: module.LakebedAdminPanel,
  })),
)
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
interface DashboardProps {
  sessionId: string
  initialAdminView?: boolean
}

type DashboardGenerationView = {
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
    status: string
    updatedAt: number
  }
  latestPreview?: {
    html?: string
    openUiSource?: string
    siteSpecJson?: string
    version?: number
  }
  session: {
    sessionId: Id<'sessions'>
    status: string
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
    designReferenceUrls?: string[]
    designReferenceNotes?: string
  }
  siteSpec?: {
    specJson?: string
    updatedAt?: number
  }
  tasks: Array<{
    _id?: string
    taskKey?: string
    title: string
    status: string
    order?: number
    updatedAt?: number
  }>
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
const RailLockedButton = ({
  label,
  icon,
  badges,
  sublabel,
}: RailLockedButtonProps) => {
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

const formatThemeName = (
  name: string | { styles?: unknown } | null | undefined,
): string => {
  if (!name) return 'Default'
  // An on-the-fly cloned theme is a preset OBJECT (not a catalog name string).
  if (typeof name !== 'string') return 'Cloned Theme'

  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

const themeButtonStyle = (
  styles: ReturnType<typeof resolveThemeStyles>,
  isDark: boolean,
): CSSProperties | undefined => {
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

const readSiteThemeName = (specJson: string | undefined): string | null => {
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

const isOpenUIHandoffHtml = (html: string | undefined): boolean =>
  typeof html === 'string' && html.includes('ship-fast-openui-source')

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

const MissingProjectState = ({ onBackHome }: { onBackHome: () => void }) => (
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
        onClick={onBackHome}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px"
      >
        Back to home
      </button>
    </div>
  </div>
)

const toDashboardGenerationView = (
  data: ReadySessionPreviewCacheEntry,
): DashboardGenerationView => ({
  events: [],
  homeModule: {
    moduleKey: data.homeModule.moduleKey ?? 'home',
    source: data.homeModule.source,
    status: data.homeModule.status ?? 'succeeded',
    updatedAt: data.homeModule.updatedAt ?? data.createdAt,
  },
  latestPreview: data.preview,
  session: {
    sessionId: data.sessionId as Id<'sessions'>,
    status: data.status,
    previewVersion: data.previewVersion ?? data.preview?.version ?? 1,
    prompt: data.prompt,
    preferredLanguage: data.preferredLanguage,
    preferredExportTarget: data.preferredExportTarget ?? 'html',
    elapsed: data.elapsed,
    isPrivate: false,
    themeOverride: data.themeOverride ?? null,
    designReferenceUrls: [],
    designReferenceNotes: '',
  },
  siteSpec: data.siteSpec,
  tasks: (data.tasks ?? []).map((task) => ({
    taskKey: task.id,
    title: task.title,
    status: task.status,
    order: task.order ?? 0,
  })),
})

const readCachedGenerationView = (
  sessionId: string,
): DashboardGenerationView | undefined => {
  if (typeof window === 'undefined') return undefined
  const cached = readReadySessionPreview(window.localStorage, { sessionId })
  return cached === null ? undefined : toDashboardGenerationView(cached)
}

export function Dashboard({
  sessionId,
  initialAdminView = false,
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
  const { requireSignIn: requireSignInForEdit } = useSignInGate()
  const commitTextEditRef = useRef<(() => void) | null>(null)
  const cancelTextEditRef = useRef<(() => void) | null>(null)
  // Save scroll position of the preview container before a remount (caused
  // by an inline edit bumping the preview version) and restore it after the
  // new preview mounts. Without this, every successful edit resets scroll
  // to top because the key change forces a full remount of the scroll container.
  const savedPreviewScrollRef = useRef<number | null>(null)
  // Find the actual scrollable element inside the preview. The scroll
  // container may be .genui-preview itself or a descendant div depending
  // on the rendered layout.
  const getPreviewScrollEl = (): Element | null => {
    const root = document.querySelector('.genui-preview')
    if (!root) return null
    if (root.scrollHeight > root.clientHeight + 10) return root
    const scrollChild = Array.from(root.querySelectorAll('*')).find(
      (el) => el.scrollHeight > el.clientHeight + 10,
    )
    return scrollChild ?? null
  }
  const handleCommitTextReady = useCallback(
    (commitFn: () => void, cancelFn: () => void) => {
      commitTextEditRef.current = commitFn
      cancelTextEditRef.current = cancelFn
    },
    [],
  )
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [toolbarState, setToolbarState] = useState({
    isOpen: false,
    anchorRect: null as DOMRect | null,
    activeElement: null as HTMLElement | null,
  })
  const [isApplyingStyle, setIsApplyingStyle] = useState(false)
  const [isForkingSession, setIsForkingSession] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [isAdminActive, setIsAdminActive] = useState(initialAdminView)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string>()
  // Element selected by the devtools-style inspector (pencil mode). Drives the
  // SectionPromptToolbar (AI section-edit prompt). null = no selection.
  const [inspectorSelection, setInspectorSelection] =
    useState<InspectorSelection | null>(null)
  const [isSectionEditing, setIsSectionEditing] = useState(false)
  const [sectionEditError, setSectionEditError] = useState<string>()
  const liveGenerationView = useQuery(api.sessions.getGenerationView, {
    lookup: sessionId,
  }) as DashboardGenerationView | null | undefined
  const [fallbackGenerationView, setFallbackGenerationView] =
    useState<DashboardGenerationView>()
  const generationView =
    liveGenerationView === undefined
      ? fallbackGenerationView
      : liveGenerationView
  const resolvedSessionId = generationView?.session.sessionId
  const clonePageNav = useClonePageNav(resolvedSessionId ?? sessionId)
  const isMissingSession = generationView === null
  const homeModule = generationView?.homeModule
  const cmsPreviewHtml = generationView?.latestPreview?.html
  const cmsPreviewSource =
    cmsPreviewHtml?.includes('ship-fast-cms:') &&
    !isOpenUIHandoffHtml(cmsPreviewHtml)
      ? cmsPreviewHtml
      : undefined
  const hasRenderableClonePage = Boolean(
    clonePageNav.currentHtml || clonePageNav.currentUrl,
  )
  const hasRenderableHomeSource =
    Boolean(homeModule?.source) ||
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
    if (liveGenerationView !== undefined) return

    const cached = readCachedGenerationView(sessionId)
    if (cached === undefined) return

    setFallbackGenerationView((current) => current ?? cached)
  }, [liveGenerationView, sessionId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (liveGenerationView !== undefined) {
      setFallbackGenerationView(undefined)
      return
    }

    let cancelled = false
    const loadFallbackGenerationView = async () => {
      try {
        const response = await fetch(
          `/api/sessions/${encodeURIComponent(sessionId)}`,
          {
            headers: { accept: 'application/json' },
          },
        )
        if (!response.ok) return

        const data = await response.json()
        if (
          cancelled ||
          data?.status !== 'preview_ready' ||
          typeof data?.homeModule?.source !== 'string'
        ) {
          return
        }

        const snapshot: ReadySessionPreviewCacheEntry = {
          sessionId: data.sessionId,
          status: 'preview_ready',
          prompt: data.prompt,
          preferredLanguage: data.preferredLanguage ?? 'en',
          preferredExportTarget: data.preferredExportTarget ?? 'html',
          previewVersion: data.previewVersion ?? data.preview?.version ?? 1,
          elapsed: data.elapsed ?? undefined,
          themeOverride: data.themeOverride ?? null,
          homeModule: {
            moduleKey: data.homeModule.moduleKey ?? 'home',
            source: data.homeModule.source,
            status: data.homeModule.status ?? 'succeeded',
            updatedAt: data.homeModule.updatedAt ?? data.updatedAt,
          },
          preview:
            data.preview === null || data.preview === undefined
              ? undefined
              : {
                  html: data.preview.html,
                  openUiSource: data.preview.openUiSource,
                  siteSpecJson: data.preview.siteSpecJson,
                  version: data.preview.version,
                },
          siteSpec:
            data.siteSpec === null || data.siteSpec === undefined
              ? undefined
              : {
                  specJson: data.siteSpec.specJson,
                  updatedAt: data.siteSpec.updatedAt,
                },
          tasks: (data.tasks ?? []).map(
            (task: {
              id: string
              title: string
              status: string
              order?: number
            }) => ({
              id: task.id,
              title: task.title,
              status: task.status,
              order: task.order ?? 0,
            }),
          ),
          createdAt: Date.now(),
        }

        rememberReadySessionPreview(window.localStorage, snapshot)
        setFallbackGenerationView(toDashboardGenerationView(snapshot))
      } catch {
        // The live Convex subscription remains the primary path; polling is a
        // best-effort fallback for local/dev WebSocket failures.
      }
    }

    void loadFallbackGenerationView()
    const interval = window.setInterval(loadFallbackGenerationView, 1500)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [liveGenerationView, sessionId])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncAdminState = () => {
      setIsAdminActive(
        window.location.pathname.replace(/\/+$/, '').endsWith('/admin'),
      )
    }

    syncAdminState()
    window.addEventListener('popstate', syncAdminState)
    return () => window.removeEventListener('popstate', syncAdminState)
  }, [])

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce || isPreviewRenderable || isMissingSession) {
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
  }, [isMissingSession, isPreviewRenderable, startedFromGenerationFlow])

  useEffect(() => {
    if (typeof window === 'undefined' || !isPreviewReady || !generationView) {
      return
    }

    const session = generationView.session
    const readyHomeModule = generationView.homeModule
    if (!readyHomeModule?.source) return

    const hasReferences =
      (session.designReferenceUrls ?? []).length > 0 ||
      Boolean(session.designReferenceNotes?.trim()) ||
      Boolean(session.cloneUrl?.trim())

    if (session.isPrivate || session.engineVersion === 'v2' || hasReferences) {
      return
    }

    rememberReadySession(window.localStorage, {
      sessionId: session.sessionId,
      prompt: session.prompt,
      preferredLanguage: session.preferredLanguage,
    })
    rememberReadySessionPreview(window.localStorage, {
      sessionId: session.sessionId,
      status: 'preview_ready',
      prompt: session.prompt,
      preferredLanguage: session.preferredLanguage ?? 'en',
      preferredExportTarget: session.preferredExportTarget,
      previewVersion: session.previewVersion,
      elapsed: session.elapsed,
      themeOverride: session.themeOverride ?? null,
      homeModule: {
        moduleKey: readyHomeModule.moduleKey,
        source: readyHomeModule.source,
        status: readyHomeModule.status,
        updatedAt: readyHomeModule.updatedAt,
      },
      preview: generationView.latestPreview,
      siteSpec: generationView.siteSpec,
      tasks: generationView.tasks.map((task) => ({
        id: task.taskKey ?? task._id,
        title: task.title,
        status: task.status,
        order: task.order,
      })),
    })
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

  const imageOverrides = useMemo(() => {
    const map: Record<string, string> = {}
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
  }, [editController.edits])

  const styleOverrides = useMemo(() => {
    const seen = new Set<string>()
    const overrides: Array<{
      classAnchor: string
      occurrenceIndex: number
      style: string
    }> = []
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
  }, [editController.edits])

  const textOverrides = useMemo(() => {
    const overrides: Array<{
      beforeText: string
      afterText: string
      occurrenceIndex?: number
    }> = []
    for (const edit of editController.edits ?? []) {
      if (
        edit.editType === 'text' &&
        typeof edit.beforeText === 'string' &&
        typeof edit.afterText === 'string'
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
  }, [editController.edits])

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

  const navigateHome = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = '/'
  }

  const publishedUrl =
    deploymentStatus?.status === 'ready' ? deploymentStatus.url : undefined
  const activeSessionId = resolvedSessionId ?? sessionId
  const activeAnonymousOwnerSecret =
    typeof window === 'undefined'
      ? undefined
      : readAnonymousOwnerSecret(window.localStorage, activeSessionId)
  const basePreviewUrl = publishedUrl ?? `/generate/${sessionId}`
  const currentUrl = isAdminActive
    ? `${basePreviewUrl.replace(/\/+$/, '')}/admin`
    : basePreviewUrl
  const renderedPreviewSource =
    clonePageNav.isClone && clonePageNav.currentHtml
      ? clonePageNav.currentHtml
      : (cmsPreviewSource ?? homeModule?.source ?? '')
  const renderedPreviewKey = cmsPreviewSource
    ? `cms:${generationView?.latestPreview?.version ?? generationView?.session.previewVersion ?? homeModule?.updatedAt ?? 'latest'}`
    : `${homeModule?.updatedAt ?? generationView?.session.previewVersion}`

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
      // Content not ready yet — retry for up to ~500ms (30 frames)
      if (attempts++ < 30) {
        raf = requestAnimationFrame(tryRestore)
      }
    }
    raf = requestAnimationFrame(tryRestore)
    return () => cancelAnimationFrame(raf)
  }, [renderedPreviewKey])

  const handlePublish = async () => {
    if (resolvedSessionId === undefined) return

    setPublishError(undefined)
    setIsPublishing(true)

    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, resolvedSessionId)

      await publishPreview({
        sessionId: resolvedSessionId,
        anonymousOwnerSecret,
      })
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Publish failed')
    } finally {
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
        setToolbarState({
          isOpen: true,
          anchorRect: rect,
          activeElement: el,
        })
      }
    } else {
      setToolbarState((s) => ({ ...s, isOpen: false }))
    }
  }

  const closeInspectorToolbar = () => {
    setInspectorSelection(null)
    document.dispatchEvent(new CustomEvent('ship-fast-inspector-clear'))
  }

  const handleSectionMoveUp = async () => {
    if (!inspectorSelection) return
    const root = document.querySelector('.genui-preview')
    if (!root) return
    const el = root.querySelector<HTMLElement>(inspectorSelection.elementPath)
    if (!el) return
    const sectionId =
      el.getAttribute('id') || el.closest('[id]')?.getAttribute('id') || ''
    if (sectionId) {
      await reorder.reorder(sectionId, 'up')
    }
  }

  const handleSectionMoveDown = async () => {
    if (!inspectorSelection) return
    const root = document.querySelector('.genui-preview')
    if (!root) return
    const el = root.querySelector<HTMLElement>(inspectorSelection.elementPath)
    if (!el) return
    const sectionId =
      el.getAttribute('id') || el.closest('[id]')?.getAttribute('id') || ''
    if (sectionId) {
      await reorder.reorder(sectionId, 'down')
    }
  }

  const handleSectionEditSubmit = async (prompt: string) => {
    if (!inspectorSelection || !resolvedSessionId) return
    setIsSectionEditing(true)
    setSectionEditError(undefined)
    try {
      const response = await fetch(
        `/api/sessions/${encodeURIComponent(resolvedSessionId)}/section-edit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instruction: prompt,
            selection: inspectorSelection,
            anonymousOwnerSecret: activeAnonymousOwnerSecret,
          }),
        },
      )
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(
          (errorBody as { error?: string }).error ??
            `Section edit failed (${response.status})`,
        )
      }
      // Success — the Convex mutation bumps previewVersion, which triggers
      // a live query update and re-renders the preview automatically.
      closeInspectorToolbar()
    } catch (error) {
      setSectionEditError(
        error instanceof Error ? error.message : 'Section edit failed',
      )
    } finally {
      setIsSectionEditing(false)
    }
  }

  const handleTextChange = async (change: {
    oldText: string
    newText: string
    element: HTMLElement
    occurrenceIndex: number
  }) => {
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
    const result = await editController.applyEdit(
      'text',
      label,
      change.oldText,
      change.newText,
      'inline edit',
      undefined,
      change.occurrenceIndex,
    )

    if (result === 'fork_needed') {
      // Fork the session
      toast.info('Forking session to save your changes...')
      const forkResult = await editController.forkCurrentSession()
      if (!forkResult) {
        // Fork failed, revert the change
        revertTextPreservingIcons(change.element, change.oldText)
        toast.error(editController.editError || 'Failed to fork session')
      }
    } else if (result !== true && 'error' in result) {
      // Revert the DOM change on other errors
      revertTextPreservingIcons(change.element, change.oldText)
      console.error('[Inline Edit] Failed to save:', result.error)
      toast.error(result.error)
    }
  }

  const handleImageChange = (change: {
    oldSrc: string
    newSrc: string
    element: HTMLImageElement
    alt: string
  }) => {
    // Optimistic: show the new image immediately (reverted below on failure).
    change.element.src = change.newSrc
    const label = `IMG: ${change.alt.slice(0, 20)}…`
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
    // Fire and forget - the page will reload after successful edit
    editController
      .applyEdit(
        'image',
        label,
        change.alt,
        change.newSrc,
        'inline image swap',
        undefined,
        occurrenceIndex,
      )
      .then((result) => {
        if (result === 'fork_needed') {
          // Fork the session
          toast.info('Forking session to save your changes...')
          editController.forkCurrentSession().then((forkResult) => {
            if (!forkResult) {
              // Fork failed, revert the change
              change.element.src = change.oldSrc
              toast.error(editController.editError || 'Failed to fork session')
            }
          })
        } else if (result !== true && 'error' in result) {
          // Revert the DOM change on other errors
          change.element.src = change.oldSrc
          console.error('[Inline Edit] Failed to save image:', result.error)
          toast.error(result.error)
        }
      })
  }

  const handleImageTarget = (e: Event) => {
    const customEvent = e as CustomEvent<{
      element: HTMLImageElement
      src: string
      alt: string
    }>
    const { element } = customEvent.detail
    const rect = element.getBoundingClientRect()

    // Unified: open the InlineEditToolbar with the image element.
    // The toolbar detects <img> and shows the image swap panel.
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
    setToolbarState({
      isOpen: true,
      anchorRect: rect,
      activeElement: element,
    })
  }

  const handleLinkEdit = async (payload: {
    oldHref: string
    newHref: string
    occurrenceIndex: number
  }) => {
    if (!resolvedSessionId) return
    const source = generationView?.homeModule?.source
    if (!source) return
    const result = replaceHrefInSource(
      source,
      payload.oldHref,
      payload.newHref,
      payload.occurrenceIndex,
    )
    if (!result.replaced) return
    await editController.applyEdit(
      'ai_rewrite',
      `link: ${payload.oldHref} → ${payload.newHref}`,
      undefined,
      undefined,
      'replace link href',
      result.source,
    )
  }

  const handleMoveUp = async () => {
    if (!toolbarState.activeElement) return
    // Find the section variable name from the element's id or class
    const el = toolbarState.activeElement
    const sectionId =
      el.getAttribute('id') || el.closest('[id]')?.getAttribute('id') || ''
    if (sectionId) {
      await reorder.reorder(sectionId, 'up')
    }
  }

  const handleMoveDown = async () => {
    if (!toolbarState.activeElement) return
    const el = toolbarState.activeElement
    const sectionId =
      el.getAttribute('id') || el.closest('[id]')?.getAttribute('id') || ''
    if (sectionId) {
      await reorder.reorder(sectionId, 'down')
    }
  }

  const handleStyleApply = async (payload: {
    sourceAnchor: string
    style: string
    occurrenceIndex: number
  }) => {
    // Store original styles for revert
    const activeElement = toolbarState.activeElement
    const originalStyles: Record<string, string> = {}
    if (activeElement) {
      const computed = window.getComputedStyle(activeElement)
      originalStyles.fontSize = computed.fontSize
      originalStyles.fontWeight = computed.fontWeight
      originalStyles.fontStyle = computed.fontStyle
      originalStyles.color = computed.color
      originalStyles.textAlign = computed.textAlign
    }

    setIsApplyingStyle(true)
    const tag = toolbarState.activeElement?.tagName.toLowerCase() || 'DIV'
    const text = toolbarState.activeElement?.textContent?.slice(0, 20) || ''
    const label = `${tag.toUpperCase()}: ${text}…`
    // Save scroll position before the edit (see handleTextChange for rationale)
    const previewScrollEl = getPreviewScrollEl()
    if (previewScrollEl) {
      savedPreviewScrollRef.current = previewScrollEl.scrollTop
    }
    const result = await editController.applyEdit(
      'style',
      label,
      payload.sourceAnchor,
      payload.style,
      'inline style',
      undefined,
      payload.occurrenceIndex,
    )
    setIsApplyingStyle(false)

    if (result === 'fork_needed') {
      // Fork the session
      setIsForkingSession(true)
      toast.info('Forking session to save your changes...')
      const forkResult = await editController.forkCurrentSession()
      if (!forkResult) {
        // Fork failed, revert the style changes
        if (activeElement) {
          activeElement.style.fontSize = originalStyles.fontSize
          activeElement.style.fontWeight = originalStyles.fontWeight
          activeElement.style.fontStyle = originalStyles.fontStyle
          activeElement.style.color = originalStyles.color
          activeElement.style.textAlign = originalStyles.textAlign
        }
        toast.error(editController.editError || 'Failed to fork session')
      }
    } else if (result === true) {
      // Close toolbar and reload for style edits
      setToolbarState((s) => ({ ...s, isOpen: false }))
    } else {
      // Revert the style changes on other errors
      if (activeElement) {
        activeElement.style.fontSize = originalStyles.fontSize
        activeElement.style.fontWeight = originalStyles.fontWeight
        activeElement.style.fontStyle = originalStyles.fontStyle
        activeElement.style.color = originalStyles.color
        activeElement.style.textAlign = originalStyles.textAlign
      }
      console.error('[Inline Edit] Failed to save style:', result.error)
      toast.error(result.error)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleImageTargetEvent = (e: Event) => handleImageTarget(e)
    window.addEventListener('image-target', handleImageTargetEvent)

    return () => {
      window.removeEventListener('image-target', handleImageTargetEvent)
    }
  }, [])

  const toggleAdminView = () => {
    setIsAdminActive((active) => {
      const nextActive = !active
      if (typeof window !== 'undefined') {
        const nextPath = nextActive
          ? `/generate/${sessionId}/admin`
          : `/generate/${sessionId}`
        window.history.pushState(null, '', nextPath)
      }
      return nextActive
    })
  }

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[radial-gradient(circle_at_50%_-10%,rgba(35,229,255,0.18),transparent_34%),linear-gradient(180deg,#070913_0%,#0a0d16_100%)] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(103,232,249,0.14),transparent_36%)]"></div>
      </div>

      <audio id="launch-sfx" preload="auto" src="/assets/launch.mp3"></audio>

      {startedFromGenerationFlow && !isPreviewRenderable && !isAdminActive ? (
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
            (isPreviewRenderable || isAdminActive || isMissingSession) &&
              'items-stretch',
          )}
          id="right-panel"
        >
          <div
            id="dashboard-cockpit"
            className={cn(
              'flex h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-3xl rounded-bl-none border border-white/10 bg-[#0b0d14]/88 shadow-[0_24px_90px_rgba(0,0,0,0.48)] backdrop-blur-[22px]',
              (isPreviewRenderable || isAdminActive || isMissingSession) &&
                'bg-[#080a10]/92',
              isDashboardActive && 'cockpit-fade-up',
            )}
          >
            <div className="dashboard-topbar flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-white/[0.035] px-3">
              <button
                type="button"
                className="dashboard-topbar-circle-button grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-white/70 transition-colors hover:bg-white/[0.09] hover:text-white"
                onClick={navigateHome}
                data-tip="Back to home"
                aria-label="Back to home"
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
                    className={cn(
                      'dashboard-topbar-circle-button grid size-9 place-items-center rounded-full border text-white/62 transition-colors hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-45',
                      isAdminActive
                        ? 'border-cyan-300/30 bg-cyan-300/14 text-cyan-100'
                        : 'border-white/10 bg-white/[0.055]',
                    )}
                    onClick={() => {
                      if (!requireSignInForEdit()) return
                      toggleAdminView()
                    }}
                    data-tip={
                      isAdminActive ? 'View generated site' : 'Open auto admin'
                    }
                    aria-label={
                      isAdminActive ? 'View generated site' : 'Open auto admin'
                    }
                    aria-pressed={isAdminActive}
                  >
                    <Shield className="size-4" strokeWidth={2} />
                  </button>
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
                    onClick={() => window.location.reload()}
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
                  <div
                    className="dashboard-toolbar-group flex items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1 max-[760px]:hidden"
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
                </div>
              ) : null}
            </div>
            <div
              className={cn(
                'relative grid min-h-0 flex-1',
                isAdminActive || isMissingSession
                  ? 'grid-cols-1'
                  : 'grid-cols-[minmax(0,1fr)_280px] max-[1100px]:grid-cols-1',
              )}
            >
              {publishError && (
                <div className="absolute right-6 top-6 z-20 max-w-sm rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-100 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                  {publishError}
                </div>
              )}
              <div className="relative min-h-0 overflow-hidden bg-[#05070c]">
                <div
                  className={cn(
                    'h-full min-h-0',
                    isAdminActive
                      ? 'overflow-hidden'
                      : 'flex items-center justify-center overflow-auto',
                  )}
                  id="preview-stage"
                >
                  {isMissingSession ? (
                    <MissingProjectState
                      onBackHome={() => {
                        window.location.href = '/'
                      }}
                    />
                  ) : isAdminActive ? (
                    <LakebedSessionProvider
                      anonymousOwnerSecret={activeAnonymousOwnerSecret}
                      sessionId={activeSessionId}
                    >
                      <Suspense fallback={<ToolPopoverFallback />}>
                        <LakebedAdminPanel />
                      </Suspense>
                    </LakebedSessionProvider>
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
                          <GeneratedModulePreview
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
                            sessionId={sessionId}
                            siteSpecJson={generationView.siteSpec?.specJson}
                            locale={generationView.session.preferredLanguage}
                            prompt={generationView.session.prompt}
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
              <aside
                className={cn(
                  'relative flex min-h-0 flex-col border-l border-white/10 bg-[#0c1018]/92 max-[1100px]:hidden',
                  (isAdminActive || isMissingSession) && 'hidden',
                )}
                id="preview-site-rail"
                aria-label="Site tools"
              >
                <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4">
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
                          className="z-[140] w-[min(360px,calc(100vw-24px))] border-white/10 bg-[#0d111b]/96 p-3 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
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
                        onSelect={(theme: string) => {
                          setSelectedTheme(theme)
                          if (resolvedSessionId) {
                            setThemeOverrideMutation({
                              sessionId: resolvedSessionId,
                              anonymousOwnerSecret: activeAnonymousOwnerSecret,
                              themeOverride: theme,
                              themeMode: isDark ? 'dark' : 'light',
                            })
                          }
                        }}
                        onToggleMode={() => {
                          setIsDark((dark) => {
                            const nextMode = dark ? 'light' : 'dark'
                            if (resolvedSessionId) {
                              setThemeOverrideMutation({
                                sessionId: resolvedSessionId,
                                anonymousOwnerSecret:
                                  activeAnonymousOwnerSecret,
                                themeMode: nextMode,
                              })
                            }
                            return !dark
                          })
                        }}
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
                                'bg-black/22 text-white/88 backdrop-blur-md group-hover:bg-black/28',
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
                              className="grid size-8 shrink-0 place-items-center rounded-xl border border-white/12 bg-black/18 text-white/72 backdrop-blur-md"
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
                          sublabel="Brandfetch / Pexels"
                        />
                      }
                    >
                      <button
                        type="button"
                        className={railRowClass}
                        data-rail-action="brand-media"
                      >
                        <span className={railIconClass} aria-hidden="true">
                          <Building2 className="size-3.5" strokeWidth={1.9} />
                        </span>
                        <span className="grid min-w-0 flex-1 gap-0.5">
                          <span className="truncate">Brand and media</span>
                          <span className="truncate font-mono text-[9.5px] uppercase leading-tight tracking-[0.06em] text-white/42">
                            Brandfetch / Pexels
                          </span>
                        </span>
                      </button>
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
                        />
                      }
                    >
                      <button
                        type="button"
                        className={railRowClass}
                        data-rail-action="localization"
                      >
                        <span className={railIconClass} aria-hidden="true">
                          <Languages className="size-3.5" strokeWidth={1.9} />
                        </span>
                        <span className="grid min-w-0 flex-1 gap-0.5">
                          <span className="truncate">Localization</span>
                          <span className="truncate font-mono text-[9.5px] uppercase leading-tight tracking-[0.06em] text-white/42">
                            {generationView?.session.preferredLanguage ??
                              'default locale'}
                          </span>
                        </span>
                      </button>
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
                          className="z-[140] w-[min(360px,calc(100vw-24px))] border-white/10 bg-[#0d111b]/96 p-3 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
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
                          className="z-[140] w-[min(360px,calc(100vw-24px))] border-white/10 bg-[#0d111b]/96 p-3 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                        >
                          <Suspense fallback={<ToolPopoverFallback />}>
                            <ExportPanel sessionId={sessionId} />
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
                          className="z-[140] w-80 border-white/10 bg-[#0d111b]/96 p-3 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                        >
                          <Suspense fallback={<ToolPopoverFallback />}>
                            <DeploymentPanel sessionId={sessionId} />
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
                  className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-white/48"
                  id="preview-site-rail-status"
                >
                  <span
                    className="grid size-5 place-items-center rounded-full bg-white/[0.04]"
                    aria-hidden="true"
                  >
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        isPreviewReady
                          ? 'bg-emerald-300'
                          : 'bg-cyan-300 animate-pulse',
                      )}
                      id="status-dot"
                    ></span>
                  </span>
                  <span id="status-text">
                    {isMissingSession
                      ? 'Project missing'
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
      <InlineEditToolbar
        isOpen={toolbarState.isOpen}
        onClose={() => {
          cancelTextEditRef.current?.()
          setToolbarState((s) => ({ ...s, isOpen: false }))
          if (inspectorSelection) closeInspectorToolbar()
        }}
        anchorRect={toolbarState.anchorRect}
        activeElement={toolbarState.activeElement}
        onStyleApply={handleStyleApply}
        onCommitText={() => commitTextEditRef.current?.()}
        isApplying={isApplyingStyle}
        isForking={isForkingSession}
        canUndo={undoRedo.canUndo}
        canRedo={undoRedo.canRedo}
        onUndo={undoRedo.undo}
        onRedo={undoRedo.redo}
        onLinkEdit={handleLinkEdit}
        onMoveUp={inspectorSelection ? handleSectionMoveUp : handleMoveUp}
        onMoveDown={inspectorSelection ? handleSectionMoveDown : handleMoveDown}
        canMoveUp={true}
        canMoveDown={true}
        onImageSelect={handleImageSelect}
        sessionId={sessionId}
        onSectionEdit={handleSectionEditSubmit}
        isSectionSubmitting={isSectionEditing}
        sectionError={sectionEditError}
      />
    </>
  )
}
