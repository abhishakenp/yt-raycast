import { useMutation, useQuery } from 'convex/react'
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Box, Code2, Crown, Download, FileArchive, Github, Globe2, List, LoaderCircle, Package, Palette, PanelsTopLeft } from 'lucide-react'

import { api } from '../../../../convex/_generated/api'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { IntroLoader } from '@/components/GenUI/IntroLoader'
import { GeneratedModulePreview } from '@/features/generation/components/GeneratedModulePreview'
import ThemePicker from '@/genui/components/ThemePicker'
import { resolveThemeStyles } from '@/genui/theme-apply'
import { cn } from '#/lib/utils'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

interface DashboardProps {
  sessionId: string
}

type RailMode = 'tools' | 'cms' | 'commerce'
type ExportTarget = 'html' | 'react' | 'next'

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

const formatThemeName = (name: string | null | undefined): string => {
  if (!name) return 'Default'

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
    const parsed = JSON.parse(specJson) as { theme?: unknown; themeName?: unknown; genuiTheme?: unknown }
    const theme = parsed.themeName ?? parsed.genuiTheme ?? parsed.theme
    return typeof theme === 'string' ? theme : null
  } catch {
    return null
  }
}

const exportOptions = [
  {
    label: 'HTML',
    meta: 'Static site bundle',
    target: 'html',
    icon: FileArchive,
  },
  {
    label: 'React',
    meta: 'React app scaffold',
    target: 'react',
    icon: Code2,
  },
  {
    label: 'Next.js',
    meta: 'App Router project',
    target: 'next',
    icon: PanelsTopLeft,
  },
] satisfies Array<{
  label: string
  meta: string
  target: ExportTarget
  icon: typeof FileArchive
}>

export function Dashboard({ sessionId }: DashboardProps) {
  const [isDashboardActive, setIsDashboardActive] = useState(false)
  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [inspectMode, setInspectMode] = useState<'select' | 'annotate' | null>('select')
  const [railMode, setRailMode] = useState<RailMode>('tools')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [pendingExportTarget, setPendingExportTarget] = useState<ExportTarget | null>(null)
  const createExport = useMutation(api.sessions.createExport)
  const generationView = useQuery(api.sessions.getGenerationView, {
    lookup: sessionId,
  })
  const resolvedSessionId = generationView?.session.sessionId
  const commerceConfig = useQuery(
    api.sessions.getCommerceConfig,
    resolvedSessionId === undefined ? 'skip' : { sessionId: resolvedSessionId },
  )

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      setIsDashboardActive(true)
      return
    }

    const tDashboard = window.setTimeout(() => {
      setIsDashboardActive(true)
    }, 2200)

    return () => {
      window.clearTimeout(tDashboard)
    }
  }, [])

  const progress = useMemo(() => {
    if (!generationView || generationView.tasks.length === 0) return 0
    if (generationView.session.status === 'preview_ready') return 100

    const done = generationView.tasks.filter((task) => task.status === 'succeeded').length
    return Math.max(5, Math.round((done / generationView.tasks.length) * 100))
  }, [generationView])

  const hasFailures =
    generationView?.session.status === 'failed' ||
    generationView?.tasks.some((task) => task.status === 'failed') === true
  const homeModule = generationView?.homeModule
  const isPreviewReady = Boolean(homeModule?.source)
  const aiTheme = useMemo(() => readSiteThemeName(generationView?.siteSpec?.specJson), [generationView?.siteSpec?.specJson])
  const effectiveTheme = selectedTheme ?? aiTheme
  const themeStyles = resolveThemeStyles(effectiveTheme)
  const activeThemeLabel = useMemo(() => formatThemeName(effectiveTheme), [effectiveTheme])
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

  const downloadExport = async (target: ExportTarget) => {
    if (!resolvedSessionId || pendingExportTarget !== null) return
    setPendingExportTarget(target)
    try {
      const anonymousOwnerSecret =
        typeof window === 'undefined'
          ? undefined
          : readAnonymousOwnerSecret(window.localStorage, resolvedSessionId)
      await createExport({
        sessionId: resolvedSessionId as any,
        anonymousOwnerSecret,
        target,
      })
      const params = new URLSearchParams()
      if (effectiveTheme) params.set('theme', effectiveTheme)
      params.set('mode', isDark ? 'dark' : 'light')
      window.location.href = `/export/${resolvedSessionId}/${target}?${params.toString()}`
    } finally {
      setPendingExportTarget(null)
    }
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[radial-gradient(circle_at_50%_-10%,rgba(35,229,255,0.18),transparent_34%),linear-gradient(180deg,#070913_0%,#0a0d16_100%)] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(103,232,249,0.14),transparent_36%)]"></div>
      </div>

      <audio id="launch-sfx" preload="auto" src="/assets/launch.mp3"></audio>

      {!isPreviewReady ? (
        <IntroLoader
          progress={Math.min(0.94, progress / 100)}
        />
      ) : null}

      <div className={cn(
        'relative z-[1] min-h-screen w-full overflow-hidden p-4 opacity-0 transition-opacity duration-700 ease-out',
        isDashboardActive && 'opacity-100',
      )} id="dashboard-wrap">
        <div className={cn(
          'mx-auto flex min-h-[calc(100vh-32px)] w-full max-w-[1680px] items-center justify-center',
          isPreviewReady && 'items-stretch',
        )} id="right-panel">
          <div className={cn(
            'flex h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-3xl rounded-bl-none border border-white/10 bg-[#0b0d14]/88 shadow-[0_24px_90px_rgba(0,0,0,0.48)] backdrop-blur-[22px]',
            isPreviewReady && 'bg-[#080a10]/92',
          )}>
            <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-white/[0.035] px-3">
              <button
                type="button"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-white/70 transition-colors hover:bg-white/[0.09] hover:text-white"
                onClick={navigateHome}
                data-tip="Back to home"
                aria-label="Back to home"
              >
                <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
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
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/8 bg-black/25 px-3 py-2 text-sm text-white/48">
                <span className="size-2 shrink-0 rounded-full bg-emerald-300/80" />
                <a className="min-w-0 truncate font-mono text-xs text-white/56 no-underline" id="url-text" href={generationView?.session.deploymentSlug ? `https://${generationView.session.deploymentSlug}.ship-fast.io` : `/generate/${sessionId}`} aria-label="Current generation">
                  {generationView?.session.deploymentSlug ? `https://${generationView.session.deploymentSlug}.ship-fast.io` : `/generate/${sessionId}`}
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-2" id="preview-frame-tools" aria-label="Preview controls">
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-white/62 transition-colors hover:bg-white/[0.09] hover:text-white"
                  id="preview-refresh-btn"
                  data-tip="Refresh generation view"
                  aria-label="Reload page"
                  onClick={() => window.location.reload()}
                >
                  <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
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
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1" role="group" aria-label="Viewport size">
                  {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                    <button
                      key={device}
                      type="button"
                      className={cn(
                        'grid size-8 place-items-center rounded-full text-white/52 transition-colors hover:bg-white/[0.08] hover:text-white',
                        currentDevice === device && 'bg-cyan-300/16 text-cyan-100',
                      )}
                      data-preview-device={device}
                      data-tip={device}
                      aria-label={`${device} width`}
                      aria-pressed={currentDevice === device}
                      onClick={() => setCurrentDevice(device)}
                    >
                      {device === 'desktop' ? (
                        <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : device === 'tablet' ? (
                        <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <rect x="6" y="3" width="12" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M11 18h2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                          <rect x="8" y="2.5" width="8" height="19" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M11 18h2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1 max-[760px]:hidden" role="group" aria-label="Inspect controls">
                  <button
                    type="button"
                    className={cn(
                      'grid size-8 place-items-center rounded-full text-white/52 transition-colors hover:bg-white/[0.08] hover:text-white',
                      inspectMode === 'select' && 'bg-cyan-300/16 text-cyan-100',
                    )}
                    data-tip="Select"
                    aria-label="Select element"
                    aria-pressed={inspectMode === 'select'}
                    onClick={() => setInspectMode('select')}
                  >
                    <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M4 3l7 17 2-7 7-2L4 3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'grid size-8 place-items-center rounded-full text-white/52 transition-colors hover:bg-white/[0.08] hover:text-white',
                      inspectMode === 'annotate' && 'bg-cyan-300/16 text-cyan-100',
                    )}
                    data-tip="Annotate"
                    aria-label="Annotate preview"
                    aria-pressed={inspectMode === 'annotate'}
                    onClick={() => setInspectMode('annotate')}
                  >
                    <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M12 20h9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="grid size-8 place-items-center rounded-full text-white/52 transition-colors hover:bg-white/[0.08] hover:text-white"
                    data-tip="Clear selection"
                    aria-label="Clear selection"
                    onClick={() => setInspectMode(null)}
                  >
                    <svg className="size-4" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_280px] max-[1100px]:grid-cols-1">
              <div className="relative min-h-0 overflow-hidden bg-[#05070c]">
                <div className={cn(
                  'flex h-full min-h-0 items-center justify-center overflow-auto',
                )} id="preview-stage">
                  <div id="preview-device-frame" data-preview-device={currentDevice} style={previewDeviceStyle}>
                    <div
                      className="h-full min-h-[480px] overflow-hidden shadow-[0_18px_70px_rgba(0,0,0,0.38)] transition-all duration-300"
                      id="preview-device-shell"
                      data-preview-device={currentDevice}
                      style={{ width: '100%', minWidth: 0, maxWidth: '100%', height: '100%' }}
                    >
                      {homeModule?.source ? (
                        <GeneratedModulePreview
                          source={homeModule.source}
                          sessionId={sessionId}
                          siteSpecJson={generationView?.siteSpec?.specJson}
                          locale={generationView?.session.preferredLanguage}
                          isDark={isDark}
                          themeStyles={themeStyles}
                          deviceMode={currentDevice}
                        />
                      ) : (
                        <div className="grid h-full min-h-[480px] place-items-center gap-4 bg-[#090c14] text-center text-white/62" role="status" aria-live="polite">
                          <div className="size-12 animate-ping rounded-full border border-cyan-300/40"></div>
                          <p>{hasFailures ? 'Generation failed' : 'Waiting for generated module...'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={cn(
                  'absolute inset-x-10 bottom-8 rounded-full border border-white/10 bg-black/35 p-1 backdrop-blur',
                  isPreviewReady && 'hidden',
                )} id="preview-loading">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-300 transition-[width] duration-300" id="preview-progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
              <aside
                className={cn(
                  'relative flex min-h-0 flex-col border-l border-white/10 bg-[#0c1018]/92 max-[1100px]:hidden',
                  railMode !== 'tools' && 'bg-[#0d111b]/96',
                )}
                id="preview-site-rail"
                aria-label="Site tools"
              >
                <div className={cn('flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4', railMode !== 'tools' && 'hidden')}>
                  <div className="grid gap-2">
                    <div className="px-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/32">Manage content</div>
                    <button type="button" className={cn(railRowClass, 'border-white/20 bg-[linear-gradient(135deg,#ff7a68_0%,#ef3e2d_55%,#b9251a_100%)] text-white shadow-[0_8px_20px_-10px_rgba(239,62,45,0.55)] hover:border-white/30 hover:bg-[linear-gradient(135deg,#ff8876_0%,#f04d3c_55%,#c62b20_100%)]')} data-rail-action="cms-studio" onClick={() => setRailMode('cms')}>
                      <span className="grid size-7 shrink-0 place-items-center text-white transition-transform duration-150 group-hover:-translate-y-px" aria-hidden="true">
                        <svg viewBox="0 -10 28 32" width="30" height="32" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                          <path d="M21.5 6.5c0-1.9-1.55-2.95-3.65-2.95h-4.2c-2.55 0-4.25 1.45-4.25 3.65 0 1.9 1.35 2.95 3.65 3.4l4.2 0.9c2.3 0.45 3.6 1.5 3.6 3.4 0 2.15-1.7 3.5-4.25 3.5H11.9" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M20.4 5.2 C 20.9 -0.6 21.6 -3 23.3 -6 C 23.7 -2 23.2 1 22.3 5.2 Z" fill="#ffffff" />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1 truncate">Edit content</span>
                      <span className={newBadgeClass}>NEW</span>
                    </button>
                    <button type="button" className={railRowClass} data-rail-action="ecommerce" onClick={() => setRailMode('commerce')}>
                      <span className={railIconClass} aria-hidden="true">
                        <Package className="size-3.5" strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">E-commerce</span>
                      <span className={newBadgeClass}>
                        {commerceConfig?.status === 'ready' ? 'READY' : 'NEW'}
                      </span>
                      <span className={premiumBadgeClass} aria-label="Pro only - upgrade to unlock" tabIndex={0}>
                        {crownIcon}
                      </span>
                    </button>
                  </div>
                  <div className="grid gap-2">
                    <div className="px-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/32">Design</div>
                    <ThemePicker
                      value={effectiveTheme}
                      isDark={isDark}
                      onSelect={setSelectedTheme}
                      onToggleMode={() => setIsDark((dark) => !dark)}
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
                          <span className={cn(railIconClass, 'bg-black/22 text-white/88 backdrop-blur-md group-hover:bg-black/28')} aria-hidden="true">
                            <Palette className="size-3.5" strokeWidth={1.9} />
                          </span>
                          <span className="grid min-w-0 flex-1 gap-0.5">
                            <span className="truncate">Theme</span>
                            <span className="truncate font-mono text-[10px] leading-tight tracking-[0.04em] text-white/64">{activeThemeLabel}</span>
                          </span>
                          <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-white/12 bg-black/18 text-white/72 backdrop-blur-md" aria-hidden="true">
                            <Palette className="size-4" strokeWidth={1.8} />
                          </span>
                        </button>
                      }
                    />
                    <button type="button" className={railRowClass} data-rail-action="github">
                      <span className={railIconClass} aria-hidden="true">
                        <Github className="size-3.5" strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">GitHub</span>
                      <span className={premiumBadgeClass} aria-label="Pro only - upgrade to unlock" tabIndex={0}>{crownIcon}</span>
                    </button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className={railRowClass} data-rail-action="export" aria-haspopup="dialog">
                          <span className={railIconClass} aria-hidden="true">
                            <Download className="size-3.5" strokeWidth={1.9} />
                          </span>
                          <span className="grid min-w-0 flex-1 gap-0.5">
                            <span className="truncate">Export</span>
                            <span className="truncate font-mono text-[9.5px] uppercase leading-tight tracking-[0.06em] text-white/42">HTML / React / Next.js</span>
                          </span>
                          <div className={cn(stateBadgeClass, 'bg-[linear-gradient(135deg,#f5d0a8_0%,#e8b86d_100%)]')} data-state="premium">
                            <span className="text-[#0a0a0b]">Pro only</span>
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="left"
                        align="start"
                        className="w-[min(300px,calc(100vw-24px))] rounded-2xl border border-white/12 bg-[#0b0f18]/96 p-3 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                      >
                        <div className="grid gap-3">
                          <div className="grid gap-1 px-1">
                            <div className="text-sm font-semibold text-white">Project export</div>
                            <p className="m-0 text-xs leading-5 text-white/52">Choose an export format to download.</p>
                          </div>
                          <div className="grid gap-1.5">
                            {exportOptions.map((option) => {
                              const Icon = option.icon
                              const isPending = pendingExportTarget === option.target
                              const StatusIcon = isPending ? LoaderCircle : Download

                              return (
                                <button
                                  key={option.label}
                                  type="button"
                                  className="group/export flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] p-2.5 text-left transition-colors hover:border-white/14 hover:bg-white/[0.075]"
                                  disabled={!isPreviewReady || pendingExportTarget !== null}
                                  onClick={() => void downloadExport(option.target)}
                                >
                                  <span className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-white/10 bg-black/24 text-white/70 transition-colors group-hover/export:border-white/16 group-hover/export:bg-white/[0.06] group-hover/export:text-white" aria-hidden="true">
                                    {isPending ? (
                                      <LoaderCircle className="size-4 animate-spin" strokeWidth={1.8} />
                                    ) : (
                                      <Icon className="size-4" strokeWidth={1.8} />
                                    )}
                                  </span>
                                  <span className="grid min-w-0 flex-1 gap-0.5">
                                    <span className="truncate text-sm font-semibold text-white">{option.label}</span>
                                    <span className="truncate text-xs text-white/46">{option.meta}</span>
                                  </span>
                                  <span
                                    className={cn(
                                      stateBadgeClass,
                                      'inline-flex items-center gap-1 border-white/10 bg-white/[0.06] text-white/46',
                                      isPending && 'border-cyan-300/18 bg-cyan-300/10 text-cyan-100',
                                    )}
                                    aria-live="polite"
                                  >
                                    <StatusIcon
                                      className={cn('size-3', isPending && 'animate-spin')}
                                      strokeWidth={2}
                                      aria-hidden="true"
                                    />
                                    {isPending ? 'Preparing' : 'Download'}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <button type="button" className={railRowClass} data-rail-action="domain">
                      <span className={railIconClass} aria-hidden="true">
                        <Globe2 className="size-3.5" strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">Assign custom domain</span>
                      <span className={premiumBadgeClass} aria-label="Pro only - upgrade to unlock" tabIndex={0}>{crownIcon}</span>
                    </button>
                  </div>
                  <div className="grid gap-2">
                    <div className="px-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/32">Three JS</div>
                    <button type="button" className={cn(railRowClass, 'cursor-not-allowed bg-white/[0.025] text-white/34 opacity-55 hover:translate-y-0 hover:border-white/8 hover:bg-white/[0.025] hover:text-white/34')} disabled data-rail-action="3d">
                      <span className={cn(railIconClass, 'text-white/38 group-hover:translate-y-0 group-hover:border-white/8 group-hover:bg-white/[0.05] group-hover:text-white/38')} aria-hidden="true">
                        <Box className="size-3.5" strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">3D</span>
                      <span className={cn(stateBadgeClass, 'bg-white/[0.06] text-white/38')}>SOON</span>
                    </button>
                  </div>
                </div>
                <div className={cn('hidden min-h-0 flex-1 flex-col p-4', railMode !== 'tools' && 'flex')} id="preview-site-rail-editor">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-cyan-300/14" id="rail-editor-thumb"></div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white" id="rail-editor-label-title">
                        {railMode === 'cms' ? 'Content' : 'Medusa commerce'}
                      </div>
                      <div className="truncate text-xs text-white/42" id="rail-editor-label-sub">
                        {generationView?.session.status.replaceAll('_', ' ') ?? 'loading'}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 flex items-center gap-2 text-xs text-white/42" id="rail-editor-breadcrumb">
                    <button type="button" className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/70" data-active="true" onClick={() => setRailMode('tools')}>tools</button>
                    <span>/</span>
                    <span className="rounded-full border border-cyan-300/16 bg-cyan-300/10 px-3 py-1 text-cyan-100" data-active="true">{railMode}</span>
                  </div>
                  <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/18">
                    <div className="border-b border-white/10 p-2" id="rail-editor-tabs">
                      <button type="button" className="grid size-9 place-items-center rounded-xl bg-cyan-300/12 text-cyan-100" data-active="true" aria-label={railMode}>
                        <List className="size-[18px]" strokeWidth={1.8} />
                      </button>
                    </div>
                    <div className="max-h-[calc(100vh-260px)] overflow-y-auto p-4" id="rail-editor-body">
                      {railMode === 'cms' ? (
                        <div className="grid gap-4 [&_input]:mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/10 [&_input]:bg-white/[0.04] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-white [&_input]:outline-none [&_label]:grid [&_label]:gap-1 [&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.08em] [&_label]:text-white/45 [&_textarea]:mt-2 [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-white/10 [&_textarea]:bg-white/[0.04] [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-sm [&_textarea]:text-white [&_textarea]:outline-none">
                          <p className="m-0 text-sm leading-6 text-white/55">Content controls are bound to this Convex session and render against the live generated module.</p>
                          <label>Homepage title override<input type="text" defaultValue="" /></label>
                          <label>Generation prompt<textarea rows={5} defaultValue={generationView?.session.prompt ?? ''} /></label>
                        </div>
                      ) : (
                        <div className="grid gap-4 [&_input]:mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/10 [&_input]:bg-white/[0.04] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-white [&_input]:outline-none [&_label]:grid [&_label]:gap-1 [&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.08em] [&_label]:text-white/45">
                          <p className="m-0 text-sm leading-6 text-white/55">Medusa config is read from Convex for this session.</p>
                          <label>Status<input type="text" readOnly value={commerceConfig?.status ?? 'not configured'} /></label>
                          <label>Backend URL<input type="url" readOnly value={commerceConfig?.backendUrl ?? ''} /></label>
                          <label>Admin URL<input type="url" readOnly value={commerceConfig?.adminUrl ?? ''} /></label>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button type="button" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/62 transition-colors hover:bg-white/[0.08] hover:text-white" id="rail-editor-cancel" onClick={() => setRailMode('tools')}>Cancel</button>
                    <button type="button" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px" id="rail-editor-done" onClick={() => setRailMode('tools')}>Done</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-white/48" id="preview-site-rail-status">
                  <span className="grid size-5 place-items-center rounded-full bg-white/[0.04]" aria-hidden="true">
                    <span className={cn('size-2 rounded-full', isPreviewReady ? 'bg-emerald-300' : 'bg-cyan-300 animate-pulse')} id="status-dot"></span>
                  </span>
                  <span id="status-text">
                    {isPreviewReady ? 'Preview ready' : 'Generating'}
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
